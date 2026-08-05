import { ProductType } from "@prisma/client";
import { body, param, query } from "express-validator";

export const productListValidator = [
  // Product categories are now Taxonomy rows (scope: PRODUCT_CATEGORY), editable
  // from the admin panel, so this can't be checked against a fixed enum anymore —
  // an unknown slug simply matches zero products, same as a typo would.
  query("category").optional().isString().trim(),
  query("type").optional().isIn(Object.values(ProductType)),
  query("minPrice").optional().isFloat({ min: 0 }),
  query("maxPrice").optional().isFloat({ min: 0 }),
  query("sort").optional().isIn(["newest", "price_asc", "price_desc", "rating"]),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

export const createProductValidator = [
  body("title").isString().isLength({ min: 3, max: 160 }).escape(),
  body("description").isString().isLength({ min: 10 }).trim(),
  body("price").isFloat({ min: 0 }),
  body("category").isString().trim().notEmpty(),
  body("type").isIn(Object.values(ProductType)),
  body("images").optional().isArray(),
  body("stock").optional().isInt({ min: 0 }),
  body("auctionEnabled").optional().isBoolean(),
  body("auctionEndDate").optional().isISO8601(),
  body("commissionRate").optional().isFloat({ min: 0, max: 1 }),
  body("downloadLimit").optional().isInt({ min: 1 }),
  body("fileUrl").optional().isURL(),
  body("isQuoteOnly").optional().isBoolean(),
];

export const updateProductValidator = [
  param("id").isString().notEmpty(),
  body("title").optional().isString().isLength({ min: 3, max: 160 }).escape(),
  body("description").optional().isString().isLength({ min: 10 }).trim(),
  body("price").optional().isFloat({ min: 0 }),
  body("category").optional().isString().trim().notEmpty(),
  body("type").optional().isIn(Object.values(ProductType)),
  body("stock").optional().isInt({ min: 0 }),
  body("isActive").optional().isBoolean(),
  body("isApproved").optional().isBoolean(),
  body("auctionEnabled").optional().isBoolean(),
  body("auctionEndDate").optional().isISO8601(),
  body("commissionRate").optional().isFloat({ min: 0, max: 1 }),
  body("downloadLimit").optional().isInt({ min: 1 }),
  body("fileUrl").optional().isURL(),
  body("isQuoteOnly").optional().isBoolean(),
];

export const idParamValidator = [param("id").isString().notEmpty()];

export const slugParamValidator = [param("slug").isString().notEmpty()];

export const cartItemValidator = [
  body("productId").isString().notEmpty(),
  body("quantity").optional().isInt({ min: 1 }),
];

export const cartQuantityValidator = [
  param("itemId").isString().notEmpty(),
  body("quantity").isInt({ min: 1 }),
];

export const orderValidator = [
  body("productId").isString().notEmpty(),
  body("quantity").optional().isInt({ min: 1 }),
  // validateRequest rebuilds req.body from only the fields declared here
  // (via express-validator's matchedData), so any field the controller reads
  // — even ones it treats as optional itself — must have an entry in this
  // chain or it gets silently stripped before createOrder ever sees it.
  body("couponCode").optional().isString().trim(),
  body("affiliateCode").optional().isString().trim(),
];

export const reasonValidator = [
  param("id").isString().notEmpty(),
  body("reason").isString().isLength({ min: 5 }).trim(),
];

export const couponValidator = [
  body("code").isString().isLength({ min: 3, max: 40 }).trim().escape(),
  body("discount").isFloat({ min: 0 }),
  body("isPercentage").optional().isBoolean(),
  body("maxUses").optional().isInt({ min: 1 }),
  body("expiresAt").optional().isISO8601(),
  body("sellerId").optional().isString(),
];

export const couponValidateValidator = [
  body("code").isString().isLength({ min: 3, max: 40 }).trim().escape(),
];

export const bidValidator = [param("id").isString().notEmpty(), body("amount").isFloat({ min: 0 })];
