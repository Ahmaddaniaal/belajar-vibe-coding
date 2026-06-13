import { Elysia, t } from "elysia";
import { UsersService } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api" })
  .post("/users", async ({ body, set }) => {
    try {
      const result = await UsersService.registerUser(body);
      return { data: result };
    } catch (error: any) {
      set.status = 400;
      return { error: error.message };
    }
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      email: t.String({ minLength: 3 }),
      password: t.String({ minLength: 1 }),
    })
  })
  .post("/users/login", async ({ body, set }) => {
    try {
      const token = await UsersService.loginUser(body);
      return { data: token };
    } catch (error: any) {
      set.status = 400;
      return { error: error.message };
    }
  }, {
    body: t.Object({
      email: t.String({ minLength: 3 }),
      password: t.String({ minLength: 1 }),
    })
  })
  .get("/users/current", async ({ headers, set }) => {
    try {
      const authorization = headers["authorization"];
      if (!authorization || !authorization.startsWith("Bearer ")) {
        set.status = 401;
        return { data: "unauthorized" };
      }

      const token = authorization.substring(7);
      const user = await UsersService.getCurrentUser(token);
      return { data: user };
    } catch (error: any) {
      set.status = 401;
      return { data: "unauthorized" };
    }
  })
  .delete("/users/logout", async ({ headers, set }) => {
    try {
      const authorization = headers["authorization"];
      if (!authorization || !authorization.startsWith("Bearer ")) {
        set.status = 401;
        return { data: "unauthorized" };
      }

      const token = authorization.substring(7);
      await UsersService.logoutUser(token);
      return { data: "Logout success" };
    } catch (error: any) {
      set.status = 401;
      return { data: "unauthorized" };
    }
  });

