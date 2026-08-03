import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/config/db.js";
import { createEmailVerification } from "../src/services/auth.service.js";

// Unique per test run so repeated runs never collide with leftover rows
// from a previous (possibly interrupted) run.
const runId = Date.now();
const email = `test-auth-${runId}@iwosan.test`;
const password = "Test@12345";
let verificationToken: string;

describe("Auth critical path", () => {
  afterAll(async () => {
    await prisma.mLMNode.deleteMany({ where: { user: { email } } });
    await prisma.emailVerificationToken.deleteMany({ where: { user: { email } } });
    await prisma.refreshToken.deleteMany({ where: { user: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("rejects login before the account exists", async () => {
    const res = await request(app).post("/api/auth/login").send({ email, password });
    expect(res.status).toBe(401);
  });

  it("registers a new account", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email,
      password,
      firstName: "Test",
      lastName: "Auth",
      country: "CI",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email);
  });

  it("rejects a duplicate registration with the same email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email,
      password,
      firstName: "Test",
      lastName: "Auth",
      country: "CI",
    });
    expect(res.status).toBe(409);
  });

  it("blocks login before the email is verified", async () => {
    const res = await request(app).post("/api/auth/login").send({ email, password });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/vérifier/i);
  });

  it("rejects login with the wrong password even after verification is pending", async () => {
    const res = await request(app).post("/api/auth/login").send({ email, password: "WrongPassword!1" });
    expect(res.status).toBe(401);
  });

  it("verifies the email with the real token and then allows login", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email }, select: { id: true } });
    const verificationUrl = await createEmailVerification(user.id);
    verificationToken = new URL(verificationUrl).pathname.split("/").pop()!;

    const verifyRes = await request(app).post(`/api/auth/verify-email/${verificationToken}`);
    expect(verifyRes.status).toBe(200);

    const loginRes = await request(app).post("/api/auth/login").send({ email, password });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.accessToken).toBeTruthy();
    expect(loginRes.body.data.user.isEmailVerified).toBe(true);
  });

  it("rejects a reused (already-consumed) verification token", async () => {
    const res = await request(app).post(`/api/auth/verify-email/${verificationToken}`);
    expect(res.status).toBe(400);
  });
});
