import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { checkRateLimit } from "@/lib/server/rate-limit";
import {
  attachSessionCookie,
  getOrCreateSessionKey,
} from "@/lib/server/session";
import {
  createPartnerInvitationRecord,
  listInvitationsForSession,
  revokeInvitationForSession,
} from "@/lib/server/store";

const createInviteSchema = z.object({
  creatorDisplayName: z.string().min(1).max(40),
  creatorResultId: z.string().min(1),
  expiresInHours: z
    .number()
    .min(1)
    .max(24 * 30)
    .optional(),
  creatorSharing: z.object({
    shareGameAnswerDetails: z.boolean().optional().default(false),
    shareCategoryScores: z.boolean(),
    shareAlignedHighlights: z.boolean(),
    shareComplementaryHighlights: z.boolean(),
    shareSharedCuriosities: z.boolean(),
    shareHighLevelBoundariesWithoutDetails: z.boolean(),
    neverExposeRawPrivateAnswers: z.literal(true),
  }),
});

export async function GET(req: NextRequest) {
  const { sessionKey } = await getOrCreateSessionKey(
    req.headers.get("x-between-us-sid"),
  );
  const uid = await getReadOnlyVerifiedUid(req);
  const invitations = listInvitationsForSession(sessionKey, uid);
  return NextResponse.json({ invitations });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rl = checkRateLimit(`invite-create:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const parsed = createInviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid invitation parameters." },
        { status: 400 },
      );
    }

    const { sessionKey, isNew } = await getOrCreateSessionKey(
      req.headers.get("x-between-us-sid"),
    );
    const creatorUid = await getReadOnlyVerifiedUid(req);
    const invite = createPartnerInvitationRecord({
      creatorSessionKey: sessionKey,
      ...(creatorUid ? { creatorUid } : {}),
      ...parsed.data,
    });

    const res = NextResponse.json({
      inviteId: invite.inviteId,
      token: invite.token,
      expiresAt: invite.expiresAt,
      status: invite.status,
    });
    if (isNew) attachSessionCookie(res, sessionKey);
    return res;
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to create invitation.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const inviteId = req.nextUrl.searchParams.get("inviteId");
  if (!inviteId) {
    return NextResponse.json({ error: "inviteId required." }, { status: 400 });
  }
  const { sessionKey } = await getOrCreateSessionKey(
    req.headers.get("x-between-us-sid"),
  );
  const uid = await getReadOnlyVerifiedUid(req);
  const ok = revokeInvitationForSession(inviteId, sessionKey, uid);
  if (!ok) {
    return NextResponse.json(
      { error: "Invitation not found or unauthorized." },
      { status: 404 },
    );
  }
  return NextResponse.json({ revoked: true });
}
