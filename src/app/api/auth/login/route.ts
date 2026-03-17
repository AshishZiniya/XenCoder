import { NextResponse } from "next/server"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      return NextResponse.json({ message: "Logged in successfully" })
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
          default:
            return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
        }
      }
      throw error
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
