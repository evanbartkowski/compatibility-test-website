import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const state = vi.hoisted(() => ({ profileSync: false }));
vi.mock("@/lib/firebase/config", () => ({
  isFirebaseProfileSyncEnabled: () => state.profileSync,
}));
vi.mock("@/lib/server/firebase-auth", () => ({
  getReadOnlyVerifiedUid: async () => "test_account",
  verifyFirebaseIdToken: async () => ({ uid: "test_account" }),
  clearUidCookie: (response: unknown) => response,
}));
vi.mock("@/lib/server/session", () => ({
  getReadOnlySessionKey: async () => "test_session",
  SESSION_COOKIE_NAME: "test_session",
}));
vi.mock("@/lib/server/rate-limit", () => ({
  checkRateLimit: () => ({ allowed: true }),
}));
vi.mock("@/lib/server/store", () => ({
  deleteAllSessionData: vi.fn(() => ({ submissions: 1 })),
  revokeAccountSessions: vi.fn(),
}));
import { POST } from "@/app/api/account/delete/route";
import { deleteAllSessionData } from "@/lib/server/store";

beforeEach(() => {
  state.profileSync = false;
  vi.clearAllMocks();
});
afterEach(() => vi.unstubAllGlobals());
function request() {
  const idToken = `qa_header.${Buffer.from(JSON.stringify({ auth_time: Math.floor(Date.now() / 1000) })).toString("base64url")}.qa_signature_that_is_long_enough`;
  return new NextRequest("http://localhost/api/account/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, confirmation: "DELETE" }),
  });
}
it("deletes an account without contacting a cloud profile service that is not enabled", async () => {
  const fetcher = vi.fn(async (url: string) =>
    url.includes("firestore")
      ? Response.json(
          { error: { message: "Permission denied on the service." } },
          { status: 403 },
        )
      : Response.json({}),
  );
  vi.stubGlobal("fetch", fetcher);
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(String(fetcher.mock.calls[0][0])).toContain("accounts:delete");
});
it("preserves app data if an explicitly enabled cloud profile cannot be erased", async () => {
  state.profileSync = true;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json(
        { error: { message: "Permission denied on the service." } },
        { status: 403 },
      ),
    ),
  );
  expect((await POST(request())).status).toBe(503);
  expect(deleteAllSessionData).not.toHaveBeenCalled();
});
