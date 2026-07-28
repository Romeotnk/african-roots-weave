import { apiRequest } from "./client";

export type CouponPayload = {
  code: string;
  discount: number;
  isPercentage?: boolean;
  maxUses?: number;
  expiresAt?: string;
  sellerId?: string;
};

export type UpdateCouponPayload = {
  isActive?: boolean;
  discount?: number;
  maxUses?: number;
  expiresAt?: string;
};

export type Coupon = {
  id: string;
  code: string;
  discount: number;
  isPercentage: boolean;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
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
  const response = await apiRequest<Coupon[]>(`/coupons${query ? `?${query}` : ""}`);
  return { coupons: response.data ?? [], pagination: response.pagination };
}

export async function createCoupon(payload: CouponPayload) {
  const response = await apiRequest<Coupon>("/coupons", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function updateCoupon(id: string, payload: UpdateCouponPayload) {
  const response = await apiRequest<Coupon>(`/coupons/${id}`, {
    method: "PUT",
    body: payload,
  });
  return response.data;
}
