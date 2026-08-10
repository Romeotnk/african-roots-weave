import { randomBytes } from "node:crypto";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { healthRouter } from "./routes/health.routes.js";
import { affiliateRouter } from "./routes/affiliate.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { bookingRouter } from "./routes/booking.routes.js";
import { cartRouter } from "./routes/cart.routes.js";
import { contactRouter } from "./routes/contact.routes.js";
import { articleRouter, monographRouter } from "./routes/content.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { couponRouter } from "./routes/coupon.routes.js";
import { forumRouter } from "./routes/forum.routes.js";
import { eventRouter, formationRouter } from "./routes/eventFormation.routes.js";
import { newsletterRouter, notificationRouter } from "./routes/notification.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { orderRouter } from "./routes/order.routes.js";
import { mlmRouter } from "./routes/mlm.routes.js";
import { messageRouter } from "./routes/message.routes.js";
import { paymentRouter, webhookRouter } from "./routes/payment.routes.js";
import { professionalRouter } from "./routes/professional.routes.js";
import { productRouter } from "./routes/product.routes.js";
import { quoteRouter } from "./routes/quote.routes.js";
import { subscriptionRouter } from "./routes/subscription.routes.js";
import { publicSiteRouter } from "./routes/publicSite.routes.js";
import { reviewRouter } from "./routes/review.routes.js";
import { ticketRouter } from "./routes/ticket.routes.js";
import { savedSearchRouter } from "./routes/savedSearch.routes.js";
import { walletRouter } from "./routes/wallet.routes.js";
import { globalRateLimit } from "./middlewares/rateLimit.middleware.js";
import { maintenanceMiddleware } from "./middlewares/maintenance.middleware.js";
import { sanitizeMiddleware } from "./middlewares/security.middleware.js";
import { frontendMiddleware } from "./middlewares/frontend.middleware.js";
import { apiResponse } from "./utils/apiResponse.js";
import { allowedOrigins, isSameHostOrigin } from "./config/corsOrigins.js";

export const app = express();

app.set("trust proxy", 1);

// TanStack Start injects several inline <script> tags per request (hydration
// stream barrier, scroll restoration, ...) whose exact content is dynamic —
// a fixed content hash can never allowlist all of them. Generate a fresh
// nonce per request instead: helmet uses it to build the CSP header below,
// and it's forwarded as a request header so the frontend SSR render (see
// src/router.tsx / src/routes/__root.tsx) can read it back and stamp the
// same nonce onto every inline script it renders, including our own
// theme-flash-prevention script in __root.tsx's RootShell.
app.use((req, res, next) => {
  const nonce = randomBytes(16).toString("base64");
  res.locals.cspNonce = nonce;
  req.headers["x-csp-nonce"] = nonce;
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'", "https:", "wss:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", (_req, res) => `'nonce-${(res as express.Response).locals.cspNonce}'`],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      },
    },
  }),
);
app.use(
  cors((req, callback) => {
    const origin = req.header("Origin");
    const isAllowed =
      !origin || allowedOrigins.includes(origin) || isSameHostOrigin(origin, req.get("host"));

    callback(isAllowed ? null : new Error(`Origin not allowed by CORS: ${origin}`), {
      origin: origin && isAllowed ? origin : false,
      credentials: true,
    });
  }),
);
app.use(compression());
app.use(cookieParser());
app.use(
  express.json({
    limit: "2mb",
    // Stash the exact bytes received alongside the parsed body — webhook
    // signature verification (Moneroo) must HMAC what the provider actually
    // signed, not a re-serialized JSON.stringify(req.body).
    verify: (req, _res, buf) => {
      (req as express.Request).rawBody = Buffer.from(buf);
    },
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(sanitizeMiddleware);
app.use(globalRateLimit);
app.use(maintenanceMiddleware);

app.get("/api", (_req, res) => {
  res.json(apiResponse(true, { name: "Iwosan API", version: "0.1.0" }, "API ready"));
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/products", productRouter);
app.use("/api/professionals", professionalRouter);
app.use("/api/cart", cartRouter);
app.use("/api/contact", contactRouter);
app.use("/api/orders", orderRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/quotes", quoteRouter);
app.use("/api/affiliate", affiliateRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/webhooks", webhookRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/mlm", mlmRouter);
app.use("/api/messages", messageRouter);
app.use("/api/articles", articleRouter);
app.use("/api/monographs", monographRouter);
app.use("/api/forum", forumRouter);
app.use("/api/events", eventRouter);
app.use("/api/formations", formationRouter);
app.use("/api/admin", adminRouter);
app.use("/api/site", publicSiteRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/saved-searches", savedSearchRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/newsletter", newsletterRouter);
app.use(frontendMiddleware);
app.use(notFoundHandler);
app.use(errorHandler);
