import "dotenv/config";
import http from "node:http";
import { app } from "./app.js";
import { prisma } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { env, validateEnv, warnMissingOptionalProviders } from "./config/env.js";
import { startCronJobs } from "./jobs/cron.js";
import { initSocket } from "./services/socket.service.js";

validateEnv();
warnMissingOptionalProviders();

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

const port = env.port;
const server = http.createServer(app);

console.log("Starting Iwosan API...");
await connectRedis();
console.log("Redis initialization completed.");
initSocket(server);
console.log("Socket initialization completed.");
startCronJobs();
console.log("Cron jobs initialized.");

server.listen(port, () => console.log(`Iwosan API listening on port ${port}`));

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
