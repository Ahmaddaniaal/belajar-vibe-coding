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
      name: t.String({ minLength: 1, maxLength: 255 }),
      email: t.String({ minLength: 3, maxLength: 255 }),
      password: t.String({ minLength: 1, maxLength: 100 }),
    }),
    response: {
      200: t.Object({
        data: t.String()
      }),
      400: t.Object({
        error: t.String()
      })
    },
    detail: {
      tags: ["Users"],
      summary: "Registrasi User Baru",
      description: "Mendaftarkan user baru dengan verifikasi keunikan email dan enkripsi password.",
    }
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
    }),
    response: {
      200: t.Object({
        data: t.String()
      }),
      400: t.Object({
        error: t.String()
      })
    },
    detail: {
      tags: ["Users"],
      summary: "Login User",
      description: "Mengautentikasi user dan mengembalikan token session aktif.",
    }
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
  }, {
    response: {
      200: t.Object({
        data: t.Object({
          id: t.Number(),
          username: t.String(),
          email: t.String(),
          created_at: t.Union([t.Date(), t.String(), t.Null()])
        })
      }),
      401: t.Object({
        data: t.String()
      }),
      500: t.Object({
        data: t.String()
      })
    },
    detail: {
      tags: ["Users"],
      summary: "Get Current Logged-In User",
      description: "Mengambil data profil pengguna yang sedang login berdasarkan token di header Authorization.",
      security: [{ BearerAuth: [] }],
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
  }, {
    response: {
      200: t.Object({
        data: t.String()
      }),
      401: t.Object({
        data: t.String()
      }),
      500: t.Object({
        data: t.String()
      })
    },
    detail: {
      tags: ["Users"],
      summary: "Logout User",
      description: "Menghapus token sesi aktif pengguna dari database.",
      security: [{ BearerAuth: [] }],
    }
  });

