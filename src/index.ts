import { Elysia } from "elysia";
import { db } from "./db/db";
import { users } from "./db/schema";
import { usersRoute } from "./routes/users-route";
import { swagger } from "@elysiajs/swagger";

export const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "User Management API",
          description: "Dokumentasi API untuk registrasi, login, profil, dan logout user.",
          version: "1.0.0",
        },
        components: {
          securitySchemes: {
            BearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "UUID",
            },
          },
        },
      },
    })
  )
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
