import { db } from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export class UsersService {
  static async registerUser(data: { name: unknown; email: unknown; password: unknown }) {
    if (typeof data.name !== "string" || !data.name.trim()) {
      throw new Error("Name is required");
    }
    if (typeof data.email !== "string" || !data.email.trim()) {
      throw new Error("Email is required");
    }
    if (typeof data.password !== "string" || !data.password.trim()) {
      throw new Error("Password is required");
    }

    const emailClean = data.email.trim().toLowerCase();

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, emailClean))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("Email sudah terdaftar");
    }

    // Hash password using Bun's built-in bcrypt hashing
    const hashedPassword = await Bun.password.hash(data.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // Insert user
    await db.insert(users).values({
      name: data.name.trim(),
      email: emailClean,
      password: hashedPassword,
    });

    return "OK";
  }
}
