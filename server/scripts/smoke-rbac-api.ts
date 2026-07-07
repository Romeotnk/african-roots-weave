import "dotenv/config";

const configuredBaseUrl = process.env.API_BASE_URL || "http://localhost:4000/api";
const baseUrl = configuredBaseUrl.endsWith("/api")
  ? configuredBaseUrl
  : `${configuredBaseUrl.replace(/\/$/, "")}/api`;
const password = process.env.RBAC_TEST_PASSWORD || "Iwosan@2026!";

const accounts = [
  { email: "super.admin@iwosan.com", expectRole: "SUPER_ADMIN" },
  { email: "admin1@iwosan.com", expectRole: "ADMIN" },
  { email: "moderator@iwosan.com", expectRole: "MODERATOR" },
  { email: "editor@iwosan.com", expectRole: "EDITOR" },
  { email: "pro1@iwosan.com", expectRole: "PROFESSIONAL" },
  { email: "researcher@iwosan.com", expectRole: "RESEARCHER" },
  { email: "user1@iwosan.com", expectRole: "USER" },
];

const request = async <T>(path: string, init: RequestInit = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const payload = (await response.json()) as { success: boolean; data: T; message: string };
  if (!response.ok || !payload.success) {
    throw new Error(`${init.method ?? "GET"} ${path} failed ${response.status}: ${payload.message}`);
  }
  return payload.data;
};

for (const account of accounts) {
  const login = await request<{ accessToken: string; user: { role: string } }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: account.email, password }),
  });
  if (login.user.role !== account.expectRole) {
    throw new Error(`${account.email} expected ${account.expectRole}, got ${login.user.role}`);
  }
  const headers = { Authorization: `Bearer ${login.accessToken}` };
  const me = await request<{ role: string; email: string }>("/auth/me", { headers });
  const notifications = await request<unknown[]>("/notifications", { headers });
  const conversations = await request<unknown[]>("/messages/conversations", { headers });

  const checks: Record<string, number | string> = {
    role: me.role,
    notifications: notifications.length,
    conversations: conversations.length,
  };

  if (account.expectRole === "PROFESSIONAL") {
    checks.products = (await request<unknown[]>("/products/mine", { headers })).length;
    checks.orders = (await request<unknown[]>("/orders/mine", { headers })).length;
  }

  if (account.expectRole === "USER" || account.expectRole === "RESEARCHER") {
    checks.orders = (await request<unknown[]>("/orders/mine", { headers })).length;
    checks.questions = (await request<unknown[]>("/forum/questions/mine", { headers })).length;
  }

  console.log(account.email, checks);
}
