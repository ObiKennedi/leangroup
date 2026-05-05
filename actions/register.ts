"use server"

import * as z from "zod"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { RegisterSchema } from "@/schema"
import { getUserByEmail } from "@/data/user"
import { generateOTP } from "./otp"

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }

  const { email, name, password } = validatedFields.data

  const existingUser = await getUserByEmail(email)

  if (existingUser) {
    return { error: "You already have an account" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  await generateOTP(email)

  redirect(`/verify-otp?email=${encodeURIComponent(email)}`)
}