"use server"

import { hash } from "bcryptjs"
import { supabase } from "@/lib/supabase"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password || !name) {
    return { error: "Missing fields" }
  }

  const hashedPassword = await hash(password, 12)

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single()

  if (existingUser) {
    return { error: "User already exists" }
  }

  // Create user
  const { error: createError } = await supabase
    .from("users")
    .insert({
      name,
      email,
      password: hashedPassword,
    })
    .select()
    .single()

  if (createError) {
    console.error("Error creating user:", createError)
    return { error: "Failed to create user" }
  }

  // Sign in the user
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.message }
    }
    throw error
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Missing fields" }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" }
        default:
          return { error: "Something went wrong" }
      }
    }
    throw error
  }
}
