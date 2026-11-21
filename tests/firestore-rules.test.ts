import { beforeAll, afterAll, beforeEach, describe, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
let environment: RulesTestEnvironment;
describe.skipIf(!process.env.FIRESTORE_EMULATOR_HOST)(
  "Firestore document authorization",
  () => {
    beforeAll(async () => {
      environment = await initializeTestEnvironment({
        projectId: "demo-truth-desire",
        firestore: {
          rules: readFileSync("firestore.rules", "utf8"),
          host: "127.0.0.1",
          port: 8080,
        },
      });
    });
    afterAll(async () => {
      await environment?.cleanup();
    });
    beforeEach(async () => environment.clearFirestore());
    const owner = () =>
      environment
        .authenticatedContext("alice", { email: "alice@example.com" })
        .firestore();
    const profile = () => ({
      uid: "alice",
      email: "alice@example.com",
      displayName: "Alice",
      photoURL: null,
      project: "demo-truth-desire",
      lastSeenAt: serverTimestamp(),
    });
    it("allows a valid owner profile and denies other users and guests", async () => {
      await assertSucceeds(setDoc(doc(owner(), "users/alice"), profile()));
      await assertSucceeds(getDoc(doc(owner(), "users/alice")));
      await assertFails(
        getDoc(
          doc(
            environment.authenticatedContext("bob").firestore(),
            "users/alice",
          ),
        ),
      );
      await assertFails(
        getDoc(
          doc(environment.unauthenticatedContext().firestore(), "users/alice"),
        ),
      );
    });
    it("rejects role injection, identity changes, and oversized profile fields", async () => {
      await assertFails(
        setDoc(doc(owner(), "users/alice"), { ...profile(), role: "admin" }),
      );
      await assertSucceeds(setDoc(doc(owner(), "users/alice"), profile()));
      await assertFails(updateDoc(doc(owner(), "users/alice"), { uid: "bob" }));
      await assertFails(
        updateDoc(doc(owner(), "users/alice"), {
          displayName: "x".repeat(5000),
        }),
      );
    });
    it("denies direct client writes of private submissions and manufactured scores", async () => {
      await assertFails(
        setDoc(doc(owner(), "submissions/fake"), {
          ownerUid: "alice",
          consent: { confirmedAdult18Plus: true, acceptedPrivacyTerms: true },
          result: { score: 999 },
        }),
      );
    });
    it("does not allow invitation updates to change participants", async () => {
      await environment.withSecurityRulesDisabled(async (context) =>
        setDoc(doc(context.firestore(), "invitations/invite"), {
          creatorUid: "alice",
          status: "pending",
          tokenHash: "hidden",
        }),
      );
      await assertFails(
        updateDoc(doc(owner(), "invitations/invite"), {
          creatorUid: "bob",
          status: "pending",
        }),
      );
    });
    it("denies raw-response material in a supposedly public aggregate", async () => {
      await environment.withSecurityRulesDisabled(async (context) =>
        setDoc(doc(context.firestore(), "communityAggregates/unsafe"), {
          respondentCount: 50,
          rawAnswers: ["private"],
        }),
      );
      await assertFails(
        getDoc(
          doc(
            environment.unauthenticatedContext().firestore(),
            "communityAggregates/unsafe",
          ),
        ),
      );
    });
    it("keeps token grants, profile shares, and private answers server-only", async () => {
      await environment.withSecurityRulesDisabled(async (context) => {
        for (const collection of [
          "resultAccessGrants",
          "sharedProfiles",
          "multiRaterSubmissions",
        ])
          await setDoc(doc(context.firestore(), `${collection}/private`), {
            ownerUid: "alice",
            tokenHash: "private",
          });
      });
      for (const collection of [
        "resultAccessGrants",
        "sharedProfiles",
        "multiRaterSubmissions",
      ])
        await assertFails(getDoc(doc(owner(), `${collection}/private`)));
    });
    it("reads a valid aggregate but refuses nonnumeric histogram values", async () => {
      const histogram = {
        b0: 50,
        b1: 0,
        b2: 0,
        b3: 0,
        b4: 0,
        b5: 0,
        b6: 0,
        b7: 0,
        b8: 0,
        b9: 0,
      };
      const aggregate = {
        assessmentSlug: "example",
        assessmentVersion: "1.0.0",
        scoringEngineVersion: "1.1.0",
        mode: "quick",
        dimension: "openness",
        label: "Openness",
        respondentCount: 50,
        meanScore: 0,
        stdDevScore: 0,
        histogram,
        available: true,
        updatedAt: serverTimestamp(),
      };
      await environment.withSecurityRulesDisabled(async (context) => {
        await setDoc(
          doc(context.firestore(), "communityAggregates/valid"),
          aggregate,
        );
        await setDoc(doc(context.firestore(), "communityAggregates/invalid"), {
          ...aggregate,
          histogram: { ...histogram, b0: "private@example.com" },
        });
      });
      await assertSucceeds(
        getDoc(
          doc(
            environment.unauthenticatedContext().firestore(),
            "communityAggregates/valid",
          ),
        ),
      );
      await assertFails(
        getDoc(
          doc(
            environment.unauthenticatedContext().firestore(),
            "communityAggregates/invalid",
          ),
        ),
      );
    });
  },
);
