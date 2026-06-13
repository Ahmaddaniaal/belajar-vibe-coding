import { db } from "../db/db";
import { users, sessions } from "../db/schema";
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

  static async loginUser(data: { email: unknown; password: unknown }) {
    if (typeof data.email !== "string" || !data.email.trim()) {
      throw new Error("Email atau password salah");
    }
    if (typeof data.password !== "string" || !data.password.trim()) {
      throw new Error("Email atau password salah");
    }

    const emailClean = data.email.trim().toLowerCase();

    // Find user
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, emailClean))
      .limit(1);

    if (existingUser.length === 0) {
      throw new Error("Email atau password salah");
    }

    const user = existingUser[0];
    if (!user) {
      throw new Error("Email atau password salah");
    }

    // Verify password using Bun's built-in verification
    const isPasswordCorrect = await Bun.password.verify(data.password, user.password);
    if (!isPasswordCorrect) {
      throw new Error("Email atau password salah");
    }

    // Generate token UUID
    const token = crypto.randomUUID();

    // Insert session record
    await db.insert(sessions).values({
      token,
      userId: user.id,
    });

    return token;
  }

  static async getCurrentUser(token: string) {
    const existingSession = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (existingSession.length === 0) {
      throw new Error("Unauthorized");
    }

    const session = existingSession[0];
    if (!session) {
      throw new Error("Unauthorized");
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (existingUser.length === 0) {
      throw new Error("Unauthorized");
    }

    const user = existingUser[0];
    if (!user) {
      throw new Error("Unauthorized");
    }

    return {
      id: user.id,
      username: user.name,
      email: user.email,
      created_at: user.createdAt,
    };
  }

  static async logoutUser(token: string) {
    const result = await db.delete(sessions).where(eq(sessions.token, token));
    if (result[0].affectedRows === 0) {
      throw new Error("Unauthorized");
    }
    return "OK";
  }
}

