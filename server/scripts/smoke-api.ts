import "dotenv/config";
import { app } from "../src/app.js";
import { prisma } from "../src/config/db.js";

const server = app.listen(0);

try {
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not determine smoke test server address");
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;
  const endpoints = [
    "/api",
    "/api/health",
    "/api/products",
    "/api/professionals",
    "/api/articles",
    "/api/monographs",
    "/api/events",
    "/api/formations",
  ];

  for (const endpoint of endpoints) {
    const response = await fetch(`${baseUrl}${endpoint}`);
    const body = await response.json().catch(() => null);
    console.log(`${response.status} ${endpoint} ${body?.success === false ? body?.message : "OK"}`);

    if (!response.ok) {
      throw new Error(`Smoke test failed for ${endpoint}`);
    }
  }
} finally {
  await prisma.$disconnect();
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
