import { apiRequest } from "./client";

export type CouponPayload = {
  code: string;
  discount: number;
  isPercentage?: boolean;
  maxUses?: number;
  expiresAt?: string;
  sellerId?: string;
};

export type CouponQuery = {
  page?: number;
  limit?: number;
};

const toQuery = (params: CouponQuery) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  return query.toString();
};

export async function validateCoupon(code: string) {
  const response = await apiRequest<unknown>("/coupons/validate", {
    method: "POST",
    body: { code },
  });
  return response.data;
}

export async function listCoupons(params: CouponQuery = {}) {
  const query = toQuery(params);
  const response = await apiRequest<unknown[]>(`/coupons${query ? `?${query}` : ""}`);
  return { coupons: response.data ?? [], pagination: response.pagination };
}

export async function createCoupon(payload: CouponPayload) {
  const response = await apiRequest<unknown>("/coupons", {
    method: "POST",
    body: payload,
  });
  return response.data;
}
