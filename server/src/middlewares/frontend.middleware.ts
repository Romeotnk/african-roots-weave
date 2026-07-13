import fs from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import express from "express";
import type { RequestHandler } from "express";

type FrontendServer = {
  fetch: (request: Request, env?: unknown, ctx?: unknown) => Promise<Response> | Response;
};

let frontendServerPromise: Promise<FrontendServer> | null = null;
let frontendPaths:
  | {
      serverEntry: string;
      clientDir: string | null;
    }
  | null
  | undefined;
let frontendStaticMiddleware: RequestHandler | null | undefined;

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

const uniquePaths = (paths: Array<string | undefined>) => {
  return [...new Set(paths.filter((item): item is string => Boolean(item)))];
};

const resolveFrontendPaths = () => {
  if (frontendPaths !== undefined) {
    return frontendPaths;
  }

  const distCandidates = uniquePaths([
    process.env.FRONTEND_DIST_DIR,
    path.resolve(process.cwd(), "dist"),
    path.resolve(process.cwd(), "..", "dist"),
    path.resolve(moduleDir, "..", "..", "..", "dist"),
  ]);

  for (const distDir of distCandidates) {
    const serverEntry = path.join(distDir, "server", "server.js");
    if (!fs.existsSync(serverEntry)) {
      continue;
    }

    const clientDir = path.join(distDir, "client");
    frontendPaths = {
      serverEntry,
      clientDir: fs.existsSync(clientDir) ? clientDir : null,
    };
    return frontendPaths;
  }

  frontendPaths = null;
  return frontendPaths;
};

const getFrontendServer = async () => {
  const paths = resolveFrontendPaths();
  if (!paths) {
    return null;
  }

  frontendServerPromise ??= import(pathToFileURL(paths.serverEntry).href).then((module) => {
    const server = (module.default ?? module) as FrontendServer;
    return server;
  });

  return frontendServerPromise;
};

const getFrontendStaticMiddleware = () => {
  if (frontendStaticMiddleware !== undefined) {
    return frontendStaticMiddleware;
  }

  const paths = resolveFrontendPaths();
  if (!paths?.clientDir) {
    frontendStaticMiddleware = null;
    return frontendStaticMiddleware;
  }

  frontendStaticMiddleware = express.static(paths.clientDir, {
    index: false,
    immutable: true,
    maxAge: "1y",
    setHeaders: (response, filePath) => {
      if (!filePath.includes(`${path.sep}assets${path.sep}`)) {
        response.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      }
    },
  });

  return frontendStaticMiddleware;
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

const renderFrontend: RequestHandler = async (req, res, next) => {
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

export const frontendMiddleware: RequestHandler = (req, res, next) => {
  if (req.path.startsWith("/api")) {
    next();
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    next();
    return;
  }

  const staticMiddleware = getFrontendStaticMiddleware();
  if (staticMiddleware) {
    staticMiddleware(req, res, (error) => {
      if (error) {
        next(error);
        return;
      }

      renderFrontend(req, res, next);
    });
    return;
  }

  renderFrontend(req, res, next);
};
