import { Elysia } from "elysia";
import { db } from "./db/db";
import { users } from "./db/schema";

const app = new Elysia()
  .get("/", () => "Welcome to Elysia + Drizzle + MySQL API!")
  .get("/users", async () => {
    try {
      const allUsers = await db.select().from(users);
      return { success: true, data: allUsers };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .post("/users", async ({ body }) => {
    try {
      const { name, email } = body as { name: string; email: string };
      if (!name || !email) {
        return { success: false, error: "Name and email are required" };
      }
      await db.insert(users).values({ name, email });
      return { success: true, message: "User added successfully" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
