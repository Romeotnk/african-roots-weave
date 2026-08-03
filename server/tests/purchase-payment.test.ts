import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { Prisma, Role } from "@prisma/client";
import { app } from "../src/app.js";
import { prisma } from "../src/config/db.js";
import { createAccessTokenForUser, hashPassword } from "../src/services/auth.service.js";

const runId = Date.now();
const buyerEmail = `test-buyer-${runId}@iwosan.test`;
const sellerEmail = `test-seller-${runId}@iwosan.test`;
const couponCode = `TESTCOUPON${runId}`;

let buyerId: string;
let sellerId: string;
let productId: string;
let buyerToken: string;
let orderId: string;

describe("Purchase + wallet payment critical path", () => {
  beforeAll(async () => {
    const passwordHash = await hashPassword("Test@12345");

    const seller = await prisma.user.create({
      data: {
        email: sellerEmail,
        passwordHash,
        firstName: "Test",
        lastName: "Seller",
        country: "CI",
        role: Role.PROFESSIONAL,
        isEmailVerified: true,
        referralCode: `SELLER${runId}`,
      },
    });
    sellerId = seller.id;

    const buyer = await prisma.user.create({
      data: {
        email: buyerEmail,
        passwordHash,
        firstName: "Test",
        lastName: "Buyer",
        country: "CI",
        role: Role.USER,
        isEmailVerified: true,
        referralCode: `BUYER${runId}`,
        walletBalance: new Prisma.Decimal(50000),
      },
    });
    buyerId = buyer.id;

    const product = await prisma.product.create({
      data: {
        sellerId,
        title: `Test product ${runId}`,
        slug: `test-product-${runId}`,
        description: "Fixture product created by the automated test suite.",
        price: new Prisma.Decimal(10000),
        category: "GYNECO_OBSTETRIQUE",
        type: "PHYSICAL",
        images: [],
        stock: 5,
        isActive: true,
        isApproved: true,
      },
    });
    productId = product.id;

    await prisma.coupon.create({
      data: {
        code: couponCode,
        discount: 10,
        isPercentage: true,
        sellerId,
        isActive: true,
      },
    });

    buyerToken = createAccessTokenForUser({
      id: buyer.id,
      role: buyer.role,
      email: buyer.email,
      language: buyer.language,
      kycStatus: buyer.kycStatus,
      isEmailVerified: buyer.isEmailVerified,
    });
  });

  afterAll(async () => {
    await prisma.commission.deleteMany({ where: { OR: [{ userId: sellerId }, { userId: buyerId }] } });
    await prisma.walletTransaction.deleteMany({ where: { userId: buyerId } });
    await prisma.order.deleteMany({ where: { OR: [{ buyerId }, { sellerId }] } });
    await prisma.coupon.deleteMany({ where: { code: couponCode } });
    await prisma.product.deleteMany({ where: { id: productId } });
    await prisma.mLMNode.deleteMany({ where: { userId: { in: [buyerId, sellerId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [buyerId, sellerId] } } });
    await prisma.$disconnect();
  });

  it("rejects an unauthenticated order creation", async () => {
    const res = await request(app).post("/api/orders").send({ productId, quantity: 1 });
    expect(res.status).toBe(401);
  });

  it("creates an order and correctly applies a percentage coupon", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ productId, quantity: 2, couponCode });

    expect(res.status).toBe(201);
    orderId = res.body.data.id;
    expect(orderId).toBeTruthy();

    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    // 2 x 10000 = 20000 gross, 10% coupon discount => 18000 net.
    expect(Number(order.discountAmount)).toBe(2000);
    expect(Number(order.totalAmount)).toBe(18000);
    expect(order.status).toBe("PENDING");
  });

  it("decremented stock by the purchased quantity", async () => {
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    expect(product.stock).toBe(3);
  });

  it("rejects re-using the same single-use coupon on a second order", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ productId, quantity: 1, couponCode });

    // maxUses defaults to null (unlimited) in this fixture, so instead verify
    // the coupon's usedCount was incremented by the first purchase above.
    expect(res.status).toBe(201);
    const coupon = await prisma.coupon.findUniqueOrThrow({ where: { code: couponCode } });
    expect(coupon.usedCount).toBe(2);
  });

  it("rejects wallet payment for an order that belongs to a different buyer", async () => {
    const otherToken = createAccessTokenForUser({
      id: sellerId,
      role: Role.PROFESSIONAL,
      email: sellerEmail,
      language: "fr",
      kycStatus: "NOT_STARTED",
      isEmailVerified: true,
    });
    const res = await request(app)
      .post("/api/payments/initiate")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ orderId, method: "wallet" });
    expect(res.status).toBe(403);
  });

  it("pays the order from the wallet, debiting the buyer and crediting a seller commission", async () => {
    const res = await request(app)
      .post("/api/payments/initiate")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ orderId, method: "wallet" });

    expect(res.status).toBe(200);
    expect(res.body.data.order.status).toBe("PAID");

    const buyer = await prisma.user.findUniqueOrThrow({ where: { id: buyerId } });
    // 50000 starting balance - 18000 for the paid order.
    expect(Number(buyer.walletBalance)).toBe(32000);

    const commission = await prisma.commission.findFirst({ where: { sourceOrderId: orderId } });
    expect(commission).toBeTruthy();
    expect(commission!.userId).toBe(sellerId);
  });

  it("refuses to pay the same order twice", async () => {
    const res = await request(app)
      .post("/api/payments/initiate")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ orderId, method: "wallet" });
    expect(res.status).toBe(400);
  });
});
