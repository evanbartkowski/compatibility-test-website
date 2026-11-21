"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2, Eye, Save, ArrowUp, ArrowDown } from "lucide-react";
import { inspectAssessmentDefinition } from "@/lib/assessment/definition";
import type {
  AssessmentDefinition,
  QuestionDefinition,
  ScoredAssessmentResult,
} from "@/lib/assessment/types";
import { ConfirmAction } from "@/components/ConfirmAction";
const Runner = dynamic(() =>
  import("@/components/assessment/AssessmentRunner").then(
    (m) => m.AssessmentRunner,
  ),
);
const Radar = dynamic(() =>
  import("@/components/charts/PreferenceRadarChart").then(
    (m) => m.PreferenceRadarChart,
  ),
);

function JsonField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: unknown;
  onChange: (v: unknown) => void;
  hint?: string;
}) {
  const [source, setSource] = useState(JSON.stringify(value, null, 2)),
    [error, setError] = useState("");
  const applySource = (text: string) => {
    const parsed = JSON.parse(text);
    if (Array.isArray(value)) {
      if (
        !Array.isArray(parsed) ||
        parsed.some((v) => !v || typeof v !== "object" || Array.isArray(v))
      )
        throw new Error("Use an array of configuration objects.");
    } else if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw new Error("Use a configuration object.");
    onChange(parsed);
  };
  return (
    <label className="form-field">
      <span>{label}</span>
      {hint && <small>{hint}</small>}
      <textarea
        aria-label={label}
        rows={7}
        spellCheck={false}
        value={source}
        onChange={(e) => {
          setSource(e.target.value);
          try {
            applySource(e.target.value);
            setError("");
          } catch {
            setError("Enter valid JSON before leaving this field.");
          }
        }}
        onBlur={() => {
          try {
            applySource(source);
          } catch {
            setSource(JSON.stringify(value, null, 2));
            setError("Invalid JSON was not applied.");
          }
        }}
      />
      {error && <small role="alert">{error}</small>}
    </label>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
const inputTypes: QuestionDefinition["inputType"][] = [
  "rating_scale",
  "slider",
  "multiple_choice",
  "forced_choice",
  "ranking",
  "multi_select",
  "situational",
  "enjoyment_scale",
  "intimacy_profile",
  "curiosity_map",
  "partner_prediction",
  "would_rather_vote",
];
export function AssessmentBuilder({
  assessments,
  onSaved,
}: {
  assessments: AssessmentDefinition[];
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<AssessmentDefinition | null>(null),
    [selected, setSelected] = useState(0),
    [tab, setTab] = useState("questions"),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState(false),
    [previewResult, setPreviewResult] = useState<ScoredAssessmentResult | null>(
      null,
    ),
    [revision, setRevision] = useState(0);
  const check = useMemo(
    () =>
      draft ? inspectAssessmentDefinition(draft) : { errors: [], warnings: [] },
    [draft],
  );
  const patch = (changes: Partial<AssessmentDefinition>) => {
    setDraft((d) => (d ? { ...d, ...changes } : null));
    setPreviewResult(null);
  };
  const load = (a: AssessmentDefinition) => {
    setDraft(structuredClone(a));
    setSelected(0);
    setRevision((v) => v + 1);
    setNotice(
      "Published scoring is immutable. Use New revision before changing measured content.",
    );
    setPreview(false);
  };
  const patchQuestion = (changes: Partial<QuestionDefinition>) => {
    if (!draft) return;
    patch({
      questions: draft.questions.map((q, i) =>
        i === selected ? { ...q, ...changes } : q,
      ),
    });
  };
  const q = draft?.questions[selected];
  const save = async (status: AssessmentDefinition["status"]) => {
    if (!draft || check.errors.length) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment: { ...draft, status } }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to save this revision.");
      setDraft(data.assessment);
      setNotice(
        `Saved ${data.assessment.title} v${data.assessment.version} · ${status}. Historical results are preserved.`,
      );
      onSaved();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  };
  const move = (offset: number) => {
    if (!draft) return;
    const next = selected + offset;
    if (next < 0 || next >= draft.questions.length) return;
    const questions = [...draft.questions];
    [questions[selected], questions[next]] = [
      questions[next],
      questions[selected],
    ];
    patch({
      questions: questions.map((question, i) => ({
        ...question,
        order: i + 1,
      })),
    });
    setSelected(next);
  };
  return (
    <div className="studio-builder">
      <div className="studio-library">
        <h2>Test library</h2>
        <p>Select a test to inspect, edit a draft, or start a revision.</p>
        <button
          className="button-primary"
          disabled={
            !assessments.some(
              (a) => a.slug === "big-five-personality-profile",
            ) || busy
          }
          onClick={() => {
            const base = assessments.find(
              (a) => a.slug === "big-five-personality-profile",
            );
            if (!base) return;
            load({
              ...structuredClone(base),
              id: "new-assessment",
              slug: "new-assessment",
              title: "Untitled reflection",
              shortTitle: "New reflection",
              version: "1.0.0",
              status: "draft",
              category: "romance",
              adultsOnly: false,
              supportsQuickMode: true,
              purpose: "Reflect on a specific relationship tendency.",
              audienceNote: "Reflect on a specific relationship tendency.",
              estimatedMinutesQuick: 1,
              estimatedMinutesComplete: 1,
              quickDescription:
                "Core selected questions for an initial reflection.",
              deepDescription:
                "Additional relevant questions provide more context.",
              scoringNotes: [
                "Normalize each answer to 0–100 and calculate a weighted mean within its declared dimension. Skipped answers are excluded.",
              ],
              sections: [
                {
                  id: "reflection",
                  title: "Reflection",
                  subtitle: "Your usual pattern",
                  description: "Reflect on one specific tendency.",
                },
              ],
              discoverPoints: ["Reflection"],
              recommendedNextSlugs: [],
              questions: [
                {
                  ...structuredClone(base.questions[0]),
                  id: "reflection-1",
                  sectionId: "reflection",
                  sectionTitle: "Reflection",
                  order: 1,
                  prompt:
                    "I make time to reflect on what I need in a relationship.",
                  partnerPrompt:
                    "I make time to reflect on what I need in a relationship.",
                  helperText:
                    "Think about your usual pattern in the past few months.",
                  quickDiscovery: true,
                  dimensionWeights: { reflection: 1 },
                },
              ],
              dimensions: [
                {
                  key: "reflection",
                  label: "Reflection",
                  description: "Define the tendency this scale measures.",
                },
              ],
              archetypes: [],
            });
          }}
        >
          <Plus size={16} />
          Create test
        </button>
        <div className="studio-library-list">
          {assessments.map((a) => (
            <button
              key={a.slug}
              className={draft?.slug === a.slug ? "is-selected" : ""}
              onClick={() => load(a)}
            >
              <strong>{a.shortTitle}</strong>
              <small>
                v{a.version} · {a.status} · {a.questions.length} questions
              </small>
            </button>
          ))}
        </div>
      </div>
      <div className="studio-editor">
        {!draft ? (
          <div className="surface-panel p-8">
            <h2>Build a considered assessment.</h2>
            <p>
              Define a purpose, measured dimensions and meaningful questions.
              Validate and preview the exact scorer before publishing.
            </p>
          </div>
        ) : (
          <>
            <div className="studio-editor-heading">
              <div>
                <p className="eyebrow">
                  {draft.status} · v{draft.version}
                </p>
                <h2>{draft.title}</h2>
              </div>
              <button
                className="button-secondary"
                onClick={() => {
                  const parts = draft.version.split(".").map(Number);
                  patch({
                    version: `${parts[0]}.${parts[1] + 1}.0`,
                    status: "draft",
                  });
                  setNotice(
                    "New revision started. Save this draft before leaving.",
                  );
                }}
              >
                New revision
              </button>
            </div>
            <div className="studio-meta-grid">
              <Field
                label="Title"
                value={draft.title}
                onChange={(title) => patch({ title })}
              />
              <Field
                label="Short title"
                value={draft.shortTitle}
                onChange={(shortTitle) => patch({ shortTitle })}
              />
              <Field
                label="URL slug"
                value={draft.slug}
                onChange={(slug) => patch({ slug })}
              />
              <Field
                label="Measurement version"
                value={draft.version}
                onChange={(version) => patch({ version })}
              />
              <label className="form-field">
                <span>Category</span>
                <select
                  value={draft.category}
                  onChange={(e) =>
                    patch({
                      category: e.target
                        .value as AssessmentDefinition["category"],
                    })
                  }
                >
                  {[
                    "romance",
                    "personality",
                    "sexuality-intimacy",
                    "compatibility",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <Field
                label="Purpose / audience"
                value={draft.purpose || draft.audienceNote}
                onChange={(purpose) =>
                  patch({ purpose, audienceNote: purpose })
                }
              />
              <Field
                label="Quick minutes"
                type="number"
                value={draft.estimatedMinutesQuick}
                onChange={(v) => patch({ estimatedMinutesQuick: Number(v) })}
              />
              <Field
                label="Deep minutes"
                type="number"
                value={draft.estimatedMinutesComplete}
                onChange={(v) => patch({ estimatedMinutesComplete: Number(v) })}
              />
            </div>
            <div
              className="studio-editor-tabs"
              role="group"
              aria-label="Assessment configuration"
            >
              {["questions", "scoring", "versions"].map((t) => (
                <button
                  key={t}
                  aria-pressed={tab === t}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {tab === "questions" && (
              <div className="studio-questions">
                <div className="studio-question-list">
                  {draft.questions.map((question, i) => (
                    <button
                      key={question.id + ":" + i}
                      onClick={() => {
                        setSelected(i);
                        setRevision((v) => v + 1);
                      }}
                      aria-pressed={selected === i}
                    >
                      {i + 1}. {question.prompt}
                      <small>
                        {question.quickDiscovery ? "Quick + deep" : "Deep only"}
                        {question.branchingCondition ? " · Adaptive" : ""}
                      </small>
                    </button>
                  ))}
                  <button
                    className="button-secondary"
                    onClick={() => {
                      const first = draft.questions[0];
                      if (!first) return;
                      patch({
                        questions: [
                          ...draft.questions,
                          {
                            ...structuredClone(first),
                            id: `q-${Date.now()}`,
                            prompt: "Write a specific, nonjudgmental question.",
                            partnerPrompt:
                              "Write the corresponding partner question.",
                            order: draft.questions.length + 1,
                            branchingCondition: undefined,
                          },
                        ],
                      });
                      setSelected(draft.questions.length);
                      setRevision((v) => v + 1);
                    }}
                  >
                    <Plus size={15} />
                    Add question
                  </button>
                </div>
                {q && (
                  <div
                    className="studio-question-editor"
                    key={revision + ":" + selected}
                  >
                    <div className="studio-question-toolbar">
                      <span>Question {selected + 1}</span>
                      <button
                        aria-label="Move question earlier"
                        disabled={!selected}
                        onClick={() => move(-1)}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        aria-label="Move question later"
                        disabled={selected === draft.questions.length - 1}
                        onClick={() => move(1)}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <ConfirmAction
                        title="Remove this question?"
                        description="This removes the question from the draft. Published versions remain archived."
                        onConfirm={() => {
                          patch({
                            questions: draft.questions
                              .filter((_, i) => i !== selected)
                              .map((question, i) => ({
                                ...question,
                                order: i + 1,
                              })),
                          });
                          setSelected(Math.max(0, selected - 1));
                        }}
                      >
                        <Trash2 size={16} />
                        Remove
                      </ConfirmAction>
                    </div>
                    <Field
                      label="Question ID"
                      value={q.id}
                      onChange={(id) => patchQuestion({ id })}
                    />
                    <label className="form-field">
                      <span>Question prompt</span>
                      <textarea
                        aria-label="Question prompt"
                        value={q.prompt}
                        onChange={(e) =>
                          patchQuestion({ prompt: e.target.value })
                        }
                      />
                    </label>
                    <Field
                      label="Partner prompt"
                      value={q.partnerPrompt}
                      onChange={(partnerPrompt) =>
                        patchQuestion({ partnerPrompt })
                      }
                    />
                    <Field
                      label="Helper text"
                      value={q.helperText}
                      onChange={(helperText) => patchQuestion({ helperText })}
                    />
                    <label className="form-field">
                      <span>Section</span>
                      <select
                        value={q.sectionId}
                        onChange={(e) =>
                          patchQuestion({
                            sectionId: e.target.value,
                            sectionTitle:
                              draft.sections.find(
                                (s) => s.id === e.target.value,
                              )?.title || "",
                          })
                        }
                      >
                        {draft.sections.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="form-field">
                      <span>Answer format</span>
                      <select
                        value={q.inputType}
                        onChange={(e) => {
                          const inputType = e.target
                            .value as QuestionDefinition["inputType"];
                          patchQuestion({
                            inputType,
                            ...(inputType === "rating_scale"
                              ? {
                                  scaleConfig: {
                                    min: 1,
                                    max: 7,
                                    minLabel: "Strongly disagree",
                                    maxLabel: "Strongly agree",
                                  },
                                }
                              : {}),
                            ...(inputType === "slider"
                              ? {
                                  sliderConfig: {
                                    min: 0,
                                    max: 100,
                                    step: 1,
                                    minLabel: "Low",
                                    maxLabel: "High",
                                  },
                                }
                              : {}),
                            ...([
                              "multiple_choice",
                              "forced_choice",
                              "ranking",
                              "multi_select",
                              "situational",
                              "partner_prediction",
                              "would_rather_vote",
                            ].includes(inputType) && !q.options
                              ? {
                                  options: [
                                    { value: "a", label: "First option" },
                                    { value: "b", label: "Second option" },
                                  ],
                                }
                              : {}),
                          });
                        }}
                      >
                        {inputTypes.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                    <div className="studio-checkbox-row">
                      <label>
                        <input
                          type="checkbox"
                          checked={q.quickDiscovery}
                          onChange={(e) =>
                            patchQuestion({ quickDiscovery: e.target.checked })
                          }
                        />
                        Included in quick
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={Boolean(q.reverseScored)}
                          onChange={(e) =>
                            patchQuestion({ reverseScored: e.target.checked })
                          }
                        />
                        Reverse scored
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={q.supportsBoundaryFlag}
                          onChange={(e) =>
                            patchQuestion({
                              supportsBoundaryFlag: e.target.checked,
                            })
                          }
                        />
                        Allow dealbreaker
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={q.eligibleForMatching}
                          onChange={(e) =>
                            patchQuestion({
                              eligibleForMatching: e.target.checked,
                            })
                          }
                        />
                        Use for matching
                      </label>
                    </div>
                    <JsonField
                      label="Dimension weights"
                      hint="Use the dimension keys from Scoring. Positive or negative values from -10 to 10."
                      value={q.dimensionWeights}
                      onChange={(v) =>
                        patchQuestion({
                          dimensionWeights:
                            v as QuestionDefinition["dimensionWeights"],
                        })
                      }
                    />
                    {q.options && (
                      <JsonField
                        label="Answer choices and choice weights"
                        hint="Each choice needs a unique value, label and optional dimensionWeights."
                        value={q.options}
                        onChange={(v) =>
                          patchQuestion({
                            options: v as QuestionDefinition["options"],
                          })
                        }
                      />
                    )}
                    {q.inputType === "rating_scale" && (
                      <JsonField
                        label="Rating scale"
                        value={q.scaleConfig}
                        onChange={(v) =>
                          patchQuestion({
                            scaleConfig: v as QuestionDefinition["scaleConfig"],
                          })
                        }
                      />
                    )}
                    {q.inputType === "slider" && (
                      <JsonField
                        label="Slider range"
                        value={q.sliderConfig}
                        onChange={(v) =>
                          patchQuestion({
                            sliderConfig:
                              v as QuestionDefinition["sliderConfig"],
                          })
                        }
                      />
                    )}
                    <label>
                      <input
                        type="checkbox"
                        checked={Boolean(q.branchingCondition)}
                        onChange={(e) =>
                          patchQuestion({
                            branchingCondition: e.target.checked
                              ? {
                                  dependsOnQuestionId:
                                    draft.questions[Math.max(0, selected - 1)]
                                      .id,
                                  operator: "gte",
                                  value: 4,
                                }
                              : undefined,
                          })
                        }
                      />
                      Adaptive follow-up
                    </label>
                    {q.branchingCondition && (
                      <JsonField
                        label="Branching condition"
                        hint="Refer to an earlier question ID. Operators: equals, not_equals, gte, in. Refusals and firm boundaries never trigger follow-ups."
                        value={q.branchingCondition}
                        onChange={(v) =>
                          patchQuestion({
                            branchingCondition:
                              v as QuestionDefinition["branchingCondition"],
                          })
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            )}
            {tab === "scoring" && (
              <div key={"scoring" + revision} className="studio-scoring">
                <JsonField
                  label="Measured dimensions and interpretations"
                  hint="key, label, description, lowLabel, highLabel; optional channelPairKey/channelRole for give–receive scales."
                  value={draft.dimensions || []}
                  onChange={(v) =>
                    patch({
                      dimensions: v as AssessmentDefinition["dimensions"],
                    })
                  }
                />
                <JsonField
                  label="Sections"
                  value={draft.sections}
                  onChange={(v) =>
                    patch({ sections: v as AssessmentDefinition["sections"] })
                  }
                />
                <JsonField
                  label="Archetypes and thresholds"
                  hint='Each archetype needs id, name, tagline, summary, weights. Optional conditions: [{"dimension":"key","min":60,"max":100}]. All required dimensions must be measured.'
                  value={draft.archetypes || []}
                  onChange={(v) =>
                    patch({
                      archetypes: v as AssessmentDefinition["archetypes"],
                    })
                  }
                />
                <label className="form-field">
                  <span>Scoring model</span>
                  <select
                    value={draft.scoringStrategy || "dimension_average"}
                    onChange={(e) =>
                      patch({
                        scoringStrategy: e.target
                          .value as AssessmentDefinition["scoringStrategy"],
                      })
                    }
                  >
                    {[
                      "dimension_average",
                      "intimacy_weighted",
                      "intimacy_profile",
                      "attachment_quadrant",
                      "give_receive_dual",
                      "curiosity_map",
                      "forced_choice_priorities",
                      "fantasy_mutual",
                      "bucket_list",
                      "prediction_accuracy",
                      "would_rather",
                      "multi_rater_perception",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Compatibility calculation</span>
                  <select
                    value={draft.compatibilityStrategy || "none"}
                    onChange={(e) =>
                      patch({
                        compatibilityStrategy: e.target
                          .value as AssessmentDefinition["compatibilityStrategy"],
                        supportsPartnerMatching: e.target.value !== "none",
                      })
                    }
                  >
                    {[
                      "none",
                      "trait_similarity_complement",
                      "values_alignment",
                      "intimacy_complementary",
                      "consent_complementary",
                      "affection_give_receive",
                      "fantasy_mutual_reveal",
                      "bucket_list_matcher",
                      "prediction_game",
                      "voting_game",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={draft.adultsOnly === true}
                    onChange={(e) => patch({ adultsOnly: e.target.checked })}
                  />
                  Mature topic: require explicit acknowledgement for exports
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={draft.supportsQuickMode !== false}
                    onChange={(e) =>
                      patch({ supportsQuickMode: e.target.checked })
                    }
                  />
                  Offer a curated quick form
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={draft.supportsCommunityComparison}
                    onChange={(e) =>
                      patch({ supportsCommunityComparison: e.target.checked })
                    }
                  />
                  Allow opt-in aggregate comparison
                </label>
              </div>
            )}
            {tab === "versions" && <VersionHistory slug={draft.slug} />}
            <div className="studio-validation" role="status">
              <strong>
                {check.errors.length
                  ? `${check.errors.length} issue(s) to resolve`
                  : "Configuration passes validation"}
              </strong>
              {check.errors.map((e, i) => (
                <p key={i} className="text-[var(--accent-rose)]">
                  {e}
                </p>
              ))}
              {check.warnings.map((w, i) => (
                <p key={i}>Note: {w}</p>
              ))}
            </div>
            <div className="studio-actions">
              <button
                className="button-secondary"
                disabled={busy || !!check.errors.length}
                onClick={() => save("draft")}
              >
                <Save size={16} />
                Save draft
              </button>
              <button
                className="button-primary"
                disabled={busy || !!check.errors.length}
                onClick={() => save("published")}
              >
                Publish revision
              </button>
              <ConfirmAction
                title="Unpublish the live test?"
                description="New visitors will no longer be able to start this test. Saved results and archived definitions remain available."
                confirmLabel="Unpublish live test"
                onConfirm={async () => {
                  const response = await fetch("/api/studio", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      type: "unpublish_assessment",
                      slug: draft.slug,
                    }),
                  });
                  const data = await response.json();
                  if (!response.ok)
                    throw new Error(data.error || "Unable to unpublish.");
                  setNotice(
                    "The live assessment is unpublished. Saved results and the working draft are preserved.",
                  );
                  onSaved();
                }}
              >
                Unpublish live test
              </ConfirmAction>
              <button
                className="button-secondary"
                disabled={!!check.errors.length}
                onClick={() => {
                  setPreview(!preview);
                  setPreviewResult(null);
                }}
              >
                <Eye size={16} />
                {preview ? "Close preview" : "Preview test"}
              </button>
            </div>
            {notice && (
              <p role="status" className="studio-notice">
                {notice}
              </p>
            )}
            {preview && (
              <section className="studio-preview">
                <p className="eyebrow">
                  Private preview · no saved result or population contribution
                </p>
                {previewResult ? (
                  <div>
                    <h3>{previewResult.profile.archetypeName}</h3>
                    <p>{previewResult.profile.summaryParagraph}</p>
                    <Radar dimensions={previewResult.radar} />
                    <button
                      className="button-secondary"
                      onClick={() => setPreviewResult(null)}
                    >
                      Back to preview
                    </button>
                  </div>
                ) : (
                  <Runner
                    key={draft.slug + draft.version}
                    assessment={draft}
                    onPreviewSubmit={async (answers, mode) => {
                      const response = await fetch("/api/studio/preview", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          assessment: draft,
                          answers,
                          mode,
                        }),
                      });
                      const data = await response.json();
                      if (!response.ok)
                        throw new Error(data.error || "Preview failed.");
                      setPreviewResult(data.result);
                    }}
                  />
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
function VersionHistory({ slug }: { slug: string }) {
  const [versions, setVersions] = useState<Array<{
      slug: string;
      version: string;
      status: string;
      questions: number;
    }> | null>(null),
    [error, setError] = useState("");
  return (
    <div className="studio-versions">
      <h3>Archived measurement versions</h3>
      <p>
        Saved results retain their definition snapshot and scoring engine
        version. Changing published measurement requires a new version.
      </p>
      <button
        className="button-secondary"
        onClick={async () => {
          try {
            const response = await fetch("/api/studio");
            if (!response.ok)
              throw new Error("Unable to read version history.");
            setVersions((await response.json()).versions);
          } catch (e) {
            setError(String(e));
          }
        }}
      >
        Load version history
      </button>
      {error && <p role="alert">{error}</p>}
      {versions && (
        <ul>
          {versions
            .filter((v) => v.slug === slug)
            .map((v) => (
              <li key={v.version}>
                v{v.version} · {v.status} · {v.questions} questions
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
