import fs from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { RequestHandler } from "express";

type FrontendServer = {
  fetch: (request: Request, env?: unknown, ctx?: unknown) => Promise<Response> | Response;
};

let frontendServerPromise: Promise<FrontendServer> | null = null;

const getFrontendServer = async () => {
  const serverEntry = path.resolve(process.cwd(), "dist", "server", "server.js");

  if (!fs.existsSync(serverEntry)) {
    return null;
  }

  frontendServerPromise ??= import(pathToFileURL(serverEntry).href).then((module) => {
    const server = (module.default ?? module) as FrontendServer;
    return server;
  });

  return frontendServerPromise;
};

const toWebRequest = (req: Parameters<RequestHandler>[0]) => {
  const origin = `${req.protocol}://${req.get("host")}`;
  const url = new URL(req.originalUrl, origin);
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  const init = {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : Readable.toWeb(req),
    // Required by Node when forwarding a streamed request body.
    duplex: req.method === "GET" || req.method === "HEAD" ? undefined : "half",
  };

  return new Request(url, init as RequestInit);
};

export const frontendMiddleware: RequestHandler = async (req, res, next) => {
  if (req.path.startsWith("/api")) {
    next();
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    next();
    return;
  }

  try {
    const frontendServer = await getFrontendServer();
    if (!frontendServer) {
      next();
      return;
    }

    const response = await frontendServer.fetch(toWebRequest(req));
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      Readable.fromWeb(response.body).pipe(res);
      return;
    }

    res.end();
  } catch (error) {
    next(error);
  }
};
