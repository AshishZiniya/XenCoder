import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const DEFAULT_MODEL = "groq/compound";

const BASE_SYSTEM_PROMPT = `You must respond with ONLY a single JSON object. Use exactly these two keys: "title" (string) and "content" (string, your full answer).

TITLE RULES: The title must be a proper headline/title—like a document or article title—NOT a summary of your answer or a conversational reply.
- GOOD titles: "How to Add Dark Mode", "React Hooks Explained", "Python List vs Dictionary", "Understanding CSS Flexbox", "Git Merge vs Rebase"
- BAD titles: "yes it does", "the answer is no", "here's how", "it works that way"—these are summaries or conversational replies, not titles.
- Keep titles to 3–6 words. Use title case. Describe the topic or question, not the answer.

Example: {"title": "How to Add Dark Mode", "content": "Your answer here."}

Markdown is available for the content if you would like to use it (e.g. bold, italic, code blocks, lists, tables, math).

VISUAL EXPLANATIONS: You are allowed to generate visual explanations when they would help the user understand a concept. If a concept can be explained more clearly with a diagram or animation, you may produce a small p5.js sketch that visually demonstrates the idea. Visual intuition should be used whenever it meaningfully improves understanding.

When to generate a sketch:
- When explaining spatial relationships or comparisons between things
- When explaining structures, diagrams, or conceptual models
- When demonstrating processes, algorithms, or changes over time
- When a simple diagram would make the explanation clearer

You may generate either:
- Static sketches for diagrams, relationships, geometry, layouts, or conceptual structures
- Animated sketches for processes, simulations, movement, or time-based behavior

Sketch guidelines:
- Use the JavaScript library p5.js
- Keep sketches minimal and focused on illustrating the concept
- Use simple shapes, labels, and motion where appropriate
- If interactive controls (e.g. sliders, toggles, buttons) would meaningfully help the user explore or understand the concept, include them—but keep controls to a minimum and super simple (e.g. one or two sliders, one toggle). Avoid unnecessary UI or complexity.
- Ensure the sketch runs in a standard p5.js environment

If you generate a sketch, it MUST be placed in a fenced code block labeled \`p5\`. The code block must contain only the p5.js sketch code (e.g. setup() and draw()). Do not include explanations inside the code block. Provide a short explanation before or after the code block describing what the visual represents.

CODE BLOCKS: Always include the language tag in fenced code blocks so they render correctly. Examples: \`\`\`javascript, \`\`\`python, \`\`\`svg, \`\`\`html, \`\`\`p5. Use \`\`\`svg for SVG code that should be rendered as a diagram. Use \`\`\`p5 for p5.js sketches that should be run as interactive visual explanations. Never leave code blocks without a language tag.

Never output JSON schemas, type definitions, or other structures—only the title and content object. The content must be your actual answer to the user, not metadata.`;

function buildSystemPrompt(userInstructions: string | null | undefined) {
  const trimmed = userInstructions?.trim();
  if (!trimmed) return BASE_SYSTEM_PROMPT;
  return `${trimmed}\n\n${BASE_SYSTEM_PROMPT}`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, systemInstructions, ...apiOptions } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return new NextResponse("GROQ_API_KEY is not set", { status: 500 });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const systemContent = buildSystemPrompt(systemInstructions);
    const stream = apiOptions.stream ?? true;

    const response = await client.chat.completions.create({
      model: apiOptions.model ?? DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: systemContent,
        },
        ...messages.map((m: { role: string; content?: string; text?: string }) => ({
          role: m.role,
          content: m.content ?? m.text ?? "",
        })),
      ],
      stream,
      response_format: { type: "json_object" },
      ...apiOptions,
    });

    if (stream) {
      // For streaming responses, convert to JSON stream format
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of (response as unknown as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>)) {
              const choice = chunk.choices[0];
              if (choice.delta?.content) {
                // Stream raw JSON content chunks (not SSE format)
                controller.enqueue(encoder.encode(choice.delta.content));
              }
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new NextResponse(readable, {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });
    }

    return NextResponse.json(response);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return new NextResponse(message, { status: 500 });
  }
}