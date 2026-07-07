import "dotenv/config";
import { app } from "../src/app.js";
import { prisma } from "../src/config/db.js";
import { redisClient } from "../src/config/redis.js";

const server = app.listen(0);

try {
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not determine smoke test server address");
  }

  const baseUrl = `http://127.0.0.1:${address.port}/api`;
  const login = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@iwosan.com", password: "Admin@123" }),
  });
  const loginBody = await login.json();
  const accessToken = loginBody?.data?.accessToken;
  if (!login.ok || !accessToken) {
    throw new Error("Could not login for dashboard smoke test");
  }

  const endpoints = [
    "/products/mine",
    "/orders/mine",
    "/coupons",
    "/auth/me",
    "/professionals/me/reviews",
    "/articles/mine",
    "/forum/questions/mine",
    "/formations/mine",
    "/events/mine",
    "/mlm/my-tree",
    "/mlm/earnings",
    "/notifications",
    "/wallet/balance",
  ];

  for (const endpoint of endpoints) {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const body = await response.json().catch(() => null);
    console.log(`${response.status} ${endpoint} ${body?.message ?? ""}`);
    if (!response.ok) {
      throw new Error(`Dashboard smoke test failed for ${endpoint}`);
    }
  }
} finally {
  await prisma.$disconnect();
  redisClient?.disconnect();
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
