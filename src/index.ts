import { Elysia } from "elysia";
import { db } from "./db/db";
import { users } from "./db/schema";
import { usersRoute } from "./routes/users-route";

export const app = new Elysia()
  .get("/", () => "Welcome to Elysia + Drizzle + MySQL API!")
  .get("/users", async () => {
    try {
      const allUsers = await db.select().from(users);
      return { success: true, data: allUsers };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .use(usersRoute);

if (process.env.NODE_ENV !== "test") {
  app.listen(process.env.PORT || 3000);
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
}
