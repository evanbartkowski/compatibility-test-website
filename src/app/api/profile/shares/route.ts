import { readJsonBody } from "@/lib/server/request-body";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getReadOnlySessionKey } from "@/lib/server/session";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import {
  createSharedProfile,
  listSharedProfiles,
  revokeSharedProfile,
} from "@/lib/server/store";
import { checkRateLimit } from "@/lib/server/rate-limit";
const schema = z.object({
  displayName: z.string().max(60),
  expiresInHours: z.number().int().min(1).max(720),
  selections: z
    .array(
      z.object({
        resultId: z.string().min(1).max(100),
        dimensionKeys: z.array(z.string().max(80)).max(20),
        includeArchetype: z.boolean(),
        includeAssessmentTitle: z.boolean(),
        allowSensitive: z.boolean(),
      }),
    )
    .min(1)
    .max(8),
});
export async function GET(req: NextRequest) {
  const sessionKey = await getReadOnlySessionKey(
      req.headers.get("x-between-us-sid"),
    ),
    uid = await getReadOnlyVerifiedUid(req);
  return NextResponse.json({
    shares: sessionKey || uid ? listSharedProfiles(sessionKey, uid) : [],
  });
}
export async function POST(req: NextRequest) {
  const sessionKey = await getReadOnlySessionKey(
      req.headers.get("x-between-us-sid"),
    ),
    uid = await getReadOnlyVerifiedUid(req);
  if (!sessionKey)
    return NextResponse.json(
      { error: "Complete a test before sharing a profile." },
      { status: 401 },
    );
  if (
    !checkRateLimit(`profile-share:${uid || sessionKey}`, 20, 3600000).allowed
  )
    return NextResponse.json(
      { error: "Too many links created. Try again later." },
      { status: 429 },
    );
  const data = schema.safeParse(await readJsonBody(req).catch(() => null));
  if (!data.success)
    return NextResponse.json(
      { error: "Choose valid result fields and an expiration." },
      { status: 400 },
    );
  try {
    const share = createSharedProfile({ ...data.data, sessionKey, uid });
    return NextResponse.json({ ...share, path: `/shared/${share.token}` });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to share this profile.",
      },
      { status: 400 },
    );
  }
}
export async function DELETE(req: NextRequest) {
  const sessionKey = await getReadOnlySessionKey(
      req.headers.get("x-between-us-sid"),
    ),
    uid = await getReadOnlyVerifiedUid(req),
    id = req.nextUrl.searchParams.get("id");
  if (!id || !revokeSharedProfile(id, sessionKey, uid))
    return NextResponse.json(
      { error: "Shared profile not found." },
      { status: 404 },
    );
  return NextResponse.json({ revoked: true });
}
