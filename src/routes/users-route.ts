import { Elysia, t } from "elysia";
import { UsersService } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api" })
  .derive(({ headers }) => {
    const authorization = headers["authorization"];
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return { token: null };
    }
    return { token: authorization.substring(7) };
  })
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
  .get("/users/current", async ({ token, set }) => {
    try {
      if (!token) {
        set.status = 401;
        return { data: "unauthorized" };
      }

      const user = await UsersService.getCurrentUser(token);
      return { data: user };
    } catch (error: any) {
      if (error.message === "Unauthorized") {
        set.status = 401;
        return { data: "unauthorized" };
      }
      set.status = 500;
      return { data: "internal_server_error" };
    }
  })
  .delete("/users/logout", async ({ token, set }) => {
    try {
      if (!token) {
        set.status = 401;
        return { data: "unauthorized" };
      }

      await UsersService.logoutUser(token);
      return { data: "Logout success" };
    } catch (error: any) {
      if (error.message === "Unauthorized") {
        set.status = 401;
        return { data: "unauthorized" };
      }
      set.status = 500;
      return { data: "internal_server_error" };
    }
  });

