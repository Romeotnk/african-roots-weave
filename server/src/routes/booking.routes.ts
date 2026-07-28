import { Router } from "express";
import {
  createBooking,
  getAvailability,
  listMyBookings,
  updateBookingStatus,
} from "../controllers/booking.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireEmailVerified } from "../middlewares/role.middleware.js";

export const bookingRouter = Router();

bookingRouter.get("/availability/:professionalId", getAvailability);
bookingRouter.get("/mine", authMiddleware, listMyBookings);
bookingRouter.post("/", authMiddleware, requireEmailVerified, createBooking);
bookingRouter.put("/:id", authMiddleware, requireEmailVerified, updateBookingStatus);
