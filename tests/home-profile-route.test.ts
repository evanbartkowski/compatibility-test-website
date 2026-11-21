import { expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
vi.mock("@/lib/server/session",()=>({getReadOnlySessionKey:async()=>"guest-session"}));
vi.mock("@/lib/server/firebase-auth",()=>({getReadOnlyVerifiedUid:async()=>"account-uid"}));
vi.mock("@/lib/server/store",()=>({listSubmissionsForSession:vi.fn(()=>[])}));
import { GET } from "@/app/api/home-profile/route";
import { listSubmissionsForSession } from "@/lib/server/store";
it("keeps stats private and does not use an account cookie while the client is signed out",async()=>{
  const response=await GET(new NextRequest("http://localhost/api/home-profile",{headers:{"x-profile-view":"guest"}}));
  expect(listSubmissionsForSession).toHaveBeenLastCalledWith("guest-session",null);
  expect(response.headers.get("cache-control")).toContain("no-store");
  expect(response.headers.get("vary")).toContain("Cookie");
  expect((await response.json()).current.measured).toBe(0);
  await GET(new NextRequest("http://localhost/api/home-profile",{headers:{"x-profile-view":"account"}}));
  expect(listSubmissionsForSession).toHaveBeenLastCalledWith("guest-session","account-uid");
});
