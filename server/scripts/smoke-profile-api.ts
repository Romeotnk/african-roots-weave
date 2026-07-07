const API_BASE_URL = (process.env.API_BASE_URL || "http://127.0.0.1:4000/api").replace(/\/$/, "");
const email = "user5@iwosan.com";
const password = process.env.RBAC_TEST_PASSWORD || "Iwosan@2026!";
const temporaryPassword = "Iwosan@2026!Temp1";

type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  message: string;
};

const request = async <T>(path: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success) {
    throw new Error(`${options.method ?? "GET"} ${path}: ${payload.message}`);
  }
  return payload.data;
};

const login = async (value: string) => {
  const data = await request<{ accessToken: string; user: { id: string; avatarUrl?: string | null } }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password: value }),
  });
  if (!data?.accessToken) throw new Error("Login did not return access token");
  return data;
};

const authed = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

const main = async () => {
  const originalLogin = await login(password);
  const originalAvatar = originalLogin.user.avatarUrl ?? `https://i.pravatar.cc/300?u=${encodeURIComponent(email)}`;
  const updatedAvatar = `${originalAvatar}${originalAvatar.includes("?") ? "&" : "?"}smoke=profile`;

  const updated = await request<{ avatarUrl?: string | null }>("/auth/me", {
    method: "PATCH",
    headers: authed(originalLogin.accessToken),
    body: JSON.stringify({
      firstName: "Dina",
      lastName: "Client",
      country: "BJ",
      language: "fr",
      avatarUrl: updatedAvatar,
    }),
  });

  if (updated?.avatarUrl !== updatedAvatar) {
    throw new Error("Profile update did not persist avatarUrl");
  }

  await request<null>("/auth/change-password", {
    method: "POST",
    headers: authed(originalLogin.accessToken),
    body: JSON.stringify({ currentPassword: password, password: temporaryPassword }),
  });

  const temporaryLogin = await login(temporaryPassword);
  await request<null>("/auth/change-password", {
    method: "POST",
    headers: authed(temporaryLogin.accessToken),
    body: JSON.stringify({ currentPassword: temporaryPassword, password }),
  });

  const restoredLogin = await login(password);
  await request("/auth/me", {
    method: "PATCH",
    headers: authed(restoredLogin.accessToken),
    body: JSON.stringify({ avatarUrl: originalAvatar }),
  });

  console.log("profile smoke ok", { email, avatarUpdated: true, passwordRestored: true });
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
