import { readJsonBody } from "@/lib/server/request-body";
import { NextRequest, NextResponse } from "next/server";
import { getReadOnlyVerifiedUid } from "@/lib/server/firebase-auth";
import { getReadOnlySessionKey } from "@/lib/server/session";
import { updateBucketListState } from "@/lib/server/store";
import { z } from "zod";

const payloadSchema = z.object({
  compatibilityId: z.string().min(1).max(100),
  toggleItemId: z.string().max(100).optional(),
  toggleCustomId: z.string().max(100).optional(),
  removeCustomId: z.string().max(100).optional(),
  addCustomItem: z.object({ label: z.string().trim().min(1).max(200), category: z.string().max(100).optional() }).optional(),
});

export async function POST(req: NextRequest) {
  const sessionKey = await getReadOnlySessionKey(req.headers.get("x-between-us-sid"));
  const uid = await getReadOnlyVerifiedUid(req);
  const parsed = payloadSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "compatibilityId required." }, { status: 400 });
  }
  const body = parsed.data;

  const updated = updateBucketListState({
    compatibilityId: body.compatibilityId,
    sessionKey,
    uid,
    toggleItemId: typeof body.toggleItemId === "string" ? body.toggleItemId : undefined,
    addCustomItem:
      body.addCustomItem && typeof body.addCustomItem.label === "string"
        ? {
            label: body.addCustomItem.label,
            category:
              typeof body.addCustomItem.category === "string"
                ? body.addCustomItem.category
                : "Shared Custom Ideas",
          }
        : undefined,
    toggleCustomId: typeof body.toggleCustomId === "string" ? body.toggleCustomId : undefined,
    removeCustomId: typeof body.removeCustomId === "string" ? body.removeCustomId : undefined,
  });

  if (!updated) {
    return NextResponse.json({ error: "Compatibility report not found or unauthorized." }, { status: 404 });
  }

  return NextResponse.json({ report: updated });
}
