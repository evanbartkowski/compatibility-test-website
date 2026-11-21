# A focused library and a measured 3D profile

The public library has **16 assessments**, reduced from 40. Six core tests cover personality and decision style, emotional availability, attachment, affection, communication and conflict, and relationship values. Ten adult tests cover erotic styles, desire and initiation, fantasy and roleplay, touch and sensory preferences, aftercare, sexual communication, power and service, boundaries and privacy, relationship structures, and partner vision.

The library contains **970 full-form questions** and **184 questions across the short forms**. Full forms have 50–100 questions. Every form shows five questions per page and every test has personalized advice. Exact counts and hooks are generated in [the assessment overview](ASSESSMENTS_AND_ADVICE.md); [the fictional examples](ADVICE_EXAMPLES.md) use the real scorer.

## What was combined

Pleasure pacing and initiation are categories within Desire, Initiation & Pleasure. Sensory maps are categories within Touch, Turn-Ons & Sensory Style. Sleep and morning preferences join Aftercare. Service and rituals join Power, Roles & Devotion. Privacy and present-day support choices join Boundaries. Multi-partner imagination joins relationship structures, while everyday rhythm joins partner vision. Related fantasy and roleplay topics share one catalog.

Retired URLs redirect to their broader replacement and preserve short/full intent. Previously published definitions remain available to saved results and pinned partner invitations. Adult consolidated forms use v3 and fresh question IDs; core forms use v6. Drafts are stored per version. Historical answers are not silently applied to changed questions.

## The graph

The homepage now renders an actual six-axis 3D radar. Each score sets the distance of a vertex from the center; the vertices form a polyhedron with depth-sorted translucent faces. Violet and pink profiles can be overlaid on a teal reference grid. Dragging changes yaw and pitch; arrow keys, reset and rotation buttons provide alternatives. Motion respects reduced-motion preferences and pauses offscreen or in a hidden tab.

| Axis | Owned score source |
|---|---|
| Romance | Measured categories in Affection, Care & Connection |
| Emotional | Measured categories in Emotional Awareness & Availability |
| Freaky / kinky | The Kinky category of Your Erotic Blueprint |
| Logical | Logic & deliberation in Personality & Decision Style |
| Communication | Measured categories in Communication, Conflict & Repair |
| Sensual | The Sensual category of Your Erotic Blueprint |

These are transparent descriptive summaries of self-reported answers, not normalized population ranks or intelligence scores. Selecting an axis explains its meaning and links to its owned source result. Missing data is a gap, never a zero. Partial categories show their answer and coverage counts. The example view is explicitly labeled and its slider changes sample data only.

The comparison is a historical snapshot before the latest compatible retake. Scores from different test versions are not mixed into the comparison. Tests completed after that snapshot remain unmeasured in the earlier shape. Partner comparison remains available through the existing private partner flow; the homepage does not invent a partner's stats or expose hidden partner answers.

## Privacy and performance

`/api/home-profile` returns compact owned scores with private, non-cacheable responses. It returns no question answers or contributor text. Guest mode ignores account cookies while sign-out settles, requests are canceled when identity changes, and data from an earlier identity is immediately excluded from rendering. Another visitor receives an empty profile.

The public catalog endpoint now returns summaries instead of full question definitions. The previous decorative mesh and redundant draft banks are removed from this implementation. The new graph uses native SVG and small projection functions, with no graphics dependency or WebGL requirement. Source definitions remain on the server for ordinary browsing screens.

The consolidation and graph are in an isolated checkout so the concurrent question editor's original working tree stays intact. The branch is `codex/focused-library-3d-profile`.
