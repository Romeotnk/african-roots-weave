import crypto from 'node:crypto';
import { monerooConfig } from '../config/moneroo.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/errors.js';

type InitiatePaymentInput = {
  amount: string;
  currency?: string;
  description: string;
  customerEmail: string;
  reference: string;
  metadata?: Record<string, unknown>;
};

export const initiateMonerooPayment = async (input: InitiatePaymentInput) => {
  if (!monerooConfig.apiKey) {
    return {
      checkoutUrl: `${env.clientUrl}/checkout/mock?reference=${encodeURIComponent(input.reference)}`,
      transactionId: `mock_${input.reference}`,
      provider: 'mock',
    };
  }

  const response = await fetch(`${monerooConfig.baseUrl}/payments/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${monerooConfig.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency ?? 'XOF',
      description: input.description,
      customer: { email: input.customerEmail },
      reference: input.reference,
      return_url: `${env.clientUrl}/payment/success`,
      cancel_url: `${env.clientUrl}/payment/cancel`,
      metadata: input.metadata,
    }),
  });

  if (!response.ok) {
    throw new ApiError(502, 'Moneroo payment initialization failed');
  }

  const data = (await response.json()) as {
    data?: { checkout_url?: string; id?: string };
    checkout_url?: string;
    id?: string;
  };

  return {
    checkoutUrl: data.data?.checkout_url ?? data.checkout_url,
    transactionId: data.data?.id ?? data.id ?? input.reference,
    provider: 'moneroo',
  };
};

export const verifyMonerooSignature = (rawBody: string, signature?: string) => {
  if (!monerooConfig.webhookSecret) {
    return true;
  }

  if (!signature) {
    return false;
  }

  const expected = crypto.createHmac('sha256', monerooConfig.webhookSecret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};
