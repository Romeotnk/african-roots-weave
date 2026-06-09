import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { cartRouter } from "./routes/cart.routes.js";
import { articleRouter, monographRouter } from "./routes/content.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { couponRouter } from "./routes/coupon.routes.js";
import { forumRouter } from "./routes/forum.routes.js";
import { eventRouter, formationRouter } from "./routes/eventFormation.routes.js";
import { newsletterRouter, notificationRouter } from "./routes/notification.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { i18nMiddleware } from "./middlewares/i18n.middleware.js";
import { orderRouter } from "./routes/order.routes.js";
import { mlmRouter } from "./routes/mlm.routes.js";
import { paymentRouter, webhookRouter } from "./routes/payment.routes.js";
import { professionalRouter } from "./routes/professional.routes.js";
import { productRouter } from "./routes/product.routes.js";
import { walletRouter } from "./routes/wallet.routes.js";
import { globalRateLimit } from "./middlewares/rateLimit.middleware.js";
import { sanitizeMiddleware } from "./middlewares/security.middleware.js";
import { frontendMiddleware } from "./middlewares/frontend.middleware.js";
import { apiResponse } from "./utils/apiResponse.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:8080",
    credentials: true,
  }),
);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(i18nMiddleware);
app.use(sanitizeMiddleware);
app.use(globalRateLimit);

app.get("/api", (_req, res) => {
  res.json(apiResponse(true, { name: "Iwosan API", version: "0.1.0" }, "API ready"));
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/professionals", professionalRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/webhooks", webhookRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/mlm", mlmRouter);
app.use("/api/articles", articleRouter);
app.use("/api/monographs", monographRouter);
app.use("/api/forum", forumRouter);
app.use("/api/events", eventRouter);
app.use("/api/formations", formationRouter);
app.use("/api/admin", adminRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/newsletter", newsletterRouter);
app.use(frontendMiddleware);
app.use(notFoundHandler);
app.use(errorHandler);
