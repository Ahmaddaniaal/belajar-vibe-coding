import { describe, expect, it, beforeEach } from "bun:test";
import { app } from "../src";
import { db } from "../src/db/db";
import { users, sessions } from "../src/db/schema";

// Helper to clean up database before each test scenario
beforeEach(async () => {
  await db.delete(sessions);
  await db.delete(users);
});

describe("User API tests", () => {
  const registerUrl = "http://localhost/api/users";
  const loginUrl = "http://localhost/api/users/login";
  const currentUrl = "http://localhost/api/users/current";
  const logoutUrl = "http://localhost/api/users/logout";

  describe("POST /api/users (Register User)", () => {
    it("should successfully register a valid user", async () => {
      const response = await app.handle(
        new Request(registerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eko",
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(200);
      const body = (await response.json()) as any;
      expect(body).toEqual({ data: "OK" });
    });

    it("should reject when name is empty", async () => {
      const response = await app.handle(
        new Request(registerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "",
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(422);
    });

    it("should reject when name is too long (> 255 chars)", async () => {
      const response = await app.handle(
        new Request(registerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "a".repeat(300),
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(422);
    });

    it("should reject when email is invalid", async () => {
      const response = await app.handle(
        new Request(registerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eko",
            email: "",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(422);
    });

    it("should reject when email is too long (> 255 chars)", async () => {
      const response = await app.handle(
        new Request(registerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eko",
            email: "a".repeat(250) + "@example.com",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(422);
    });

    it("should reject when password is empty", async () => {
      const response = await app.handle(
        new Request(registerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eko",
            email: "eko@localhost",
            password: "",
          }),
        })
      );
      expect(response.status).toBe(422);
    });

    it("should reject when password is too long (> 100 chars)", async () => {
      const response = await app.handle(
        new Request(registerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eko",
            email: "eko@localhost",
            password: "a".repeat(101),
          }),
        })
      );
      expect(response.status).toBe(422);
    });

    it("should reject duplicate email registrations", async () => {
      // 1st register
      await app.handle(
        new Request(registerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eko",
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );

      // 2nd register
      const response = await app.handle(
        new Request(registerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eko Baru",
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(400);
      const body = (await response.json()) as any;
      expect(body.error).toBe("Email sudah terdaftar");
    });
  });

  describe("POST /api/users/login (Login User)", () => {
    beforeEach(async () => {
      // Create user to login
      await app.handle(
        new Request(registerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eko",
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );
    });

    it("should login successfully with correct credentials", async () => {
      const response = await app.handle(
        new Request(loginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(200);
      const body = (await response.json()) as any;
      expect(body.data).toBeDefined();
      expect(typeof body.data).toBe("string");
    });

    it("should reject login with empty email", async () => {
      const response = await app.handle(
        new Request(loginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(422);
    });

    it("should reject login with empty password", async () => {
      const response = await app.handle(
        new Request(loginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "eko@localhost",
            password: "",
          }),
        })
      );
      expect(response.status).toBe(422);
    });

    it("should fail when email is unregistered", async () => {
      const response = await app.handle(
        new Request(loginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "unknown@localhost",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(400);
      const body = (await response.json()) as any;
      expect(body.error).toBe("Email atau password salah");
    });

    it("should fail when password is wrong", async () => {
      const response = await app.handle(
        new Request(loginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "eko@localhost",
            password: "wrongpassword",
          }),
        })
      );
      expect(response.status).toBe(400);
      const body = (await response.json()) as any;
      expect(body.error).toBe("Email atau password salah");
    });
  });

  describe("GET /api/users/current (Get Current User)", () => {
    let token = "";

    beforeEach(async () => {
      // Register
      await app.handle(
        new Request(registerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eko",
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );
      // Login to get token
      const loginRes = await app.handle(
        new Request(loginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );
      const loginBody = (await loginRes.json()) as any;
      token = loginBody.data;
    });

    it("should successfully fetch details of current logged-in user", async () => {
      const response = await app.handle(
        new Request(currentUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      expect(response.status).toBe(200);
      const body = (await response.json()) as any;
      expect(body.data.username).toBe("Eko");
      expect(body.data.email).toBe("eko@localhost");
      expect(body.data.created_at).toBeDefined();
    });

    it("should reject when Authorization header is missing", async () => {
      const response = await app.handle(
        new Request(currentUrl, {
          method: "GET",
        })
      );
      expect(response.status).toBe(401);
      const body = (await response.json()) as any;
      expect(body).toEqual({ data: "unauthorized" });
    });

    it("should reject when Authorization format is invalid", async () => {
      const response = await app.handle(
        new Request(currentUrl, {
          method: "GET",
          headers: {
            Authorization: `Basic ${token}`,
          },
        })
      );
      expect(response.status).toBe(401);
    });

    it("should reject when token is not found/invalid", async () => {
      const response = await app.handle(
        new Request(currentUrl, {
          method: "GET",
          headers: {
            Authorization: "Bearer invalidtoken123",
          },
        })
      );
      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/users/logout (Logout User)", () => {
    let token = "";

    beforeEach(async () => {
      // Register
      await app.handle(
        new Request(registerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eko",
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );
      // Login
      const loginRes = await app.handle(
        new Request(loginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );
      const loginBody = (await loginRes.json()) as any;
      token = loginBody.data;
    });

    it("should successfully logout and delete session token", async () => {
      const response = await app.handle(
        new Request(logoutUrl, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      expect(response.status).toBe(200);
      const body = (await response.json()) as any;
      expect(body).toEqual({ data: "Logout success" });

      // Verify token cannot be used again
      const currentRes = await app.handle(
        new Request(currentUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      expect(currentRes.status).toBe(401);
    });

    it("should reject logout when Authorization header is missing", async () => {
      const response = await app.handle(
        new Request(logoutUrl, {
          method: "DELETE",
        })
      );
      expect(response.status).toBe(401);
    });

    it("should reject logout when Authorization format is invalid", async () => {
      const response = await app.handle(
        new Request(logoutUrl, {
          method: "DELETE",
          headers: {
            Authorization: `Basic ${token}`,
          },
        })
      );
      expect(response.status).toBe(401);
    });

    it("should reject logout when token is invalid", async () => {
      const response = await app.handle(
        new Request(logoutUrl, {
          method: "DELETE",
          headers: {
            Authorization: "Bearer invalidtoken123",
          },
        })
      );
      expect(response.status).toBe(401);
    });
  });
});
