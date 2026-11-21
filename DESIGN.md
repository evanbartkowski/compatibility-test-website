# Truth Desire design system

The interface uses dark, quiet surfaces and an orbital profile visual to express individuality and connection. The primary task is choosing a useful assessment; mature topics have their own clear labels rather than dominating the product introduction.

## Tokens

| Role              | Dark      | Light     |
| ----------------- | --------- | --------- |
| Canvas            | `#070709` | `#f7f7fc` |
| Surface           | `#12121c` | `#ffffff` |
| Inset             | `#222231` | `#e2e0ef` |
| Primary text      | `#f3f1fa` | `#191626` |
| Secondary text    | `#b4b1c5` | `#555269` |
| Muted text        | `#918da6` | `#6b6780` |
| Primary accent    | `#ac8aff` | `#7046cf` |
| Comparison accent | `#67e8f9` | `#087c94` |
| Affection accent  | `#f476d3` | `#b33873` |

`src/app/globals.css` is the source of truth. Semantic legacy variable names remain compatible with existing charts and private workflows. Dark is the default; a saved light preference remains supported.

Space Grotesk sets display headings, with Figtree for body copy and controls. Both use normal letter case. Numerical data uses tabular figures. Headline sizes respond to the viewport; primary text remains readable at narrow widths.

## Layout and components

- Fluid browser-width application canvas with responsive gutters. Text keeps a readable line length while navigation, cards, reports and charts use the available space. There is no 1200px page cap.
- The assessment workspace groups five questions per page. Desktop pairs category navigation with seven labeled answer tiles per question. Mobile uses two columns of full answer labels with large tap targets. Every card shows its question number, category, answer status, contextual help and individual skip control.
- 10px control radii, 14–20px card and panel radii. Pill shapes are reserved for small contextual labels and switches.
- Violet represents a personal profile; cyan represents a second profile or community mean. Rose distinguishes connection and mature assessment categories.
- The shared `TestCard` owns test discovery presentation on the homepage and library.
- The shared `ResultsOverview` presents measured category scores and inspectable contributors. Missing evidence reads “Not measured.” A tendency score is never framed as a grade for the person.
- `CommunityBenchmarks` pairs personal category values with cohort averages and empirical midrank percentiles.
- Invitations preserve independently answered profiles and participant sharing choices. Export formats sit behind a native disclosure to keep the main result actions focused.

## Interaction

Preview tabs are explicit, accessible button groups. Inputs, selections, filters, and answer cards show their current state. Focus is visible, menus close with Escape, and the question heading receives focus after navigation. The assessment progress indicator counts answers rather than screen visits. Reduced-motion preferences disable the new runner transitions.

Agreement tiles are native radios: Tab enters each question's group, arrows change selection, and 1–7 works within the focused question. No answer is selected initially. Answering stays on the current page. Previous and Next move by five questions; unanswered items can be revisited in review. Saved drafts retain their existing question index and resume on the corresponding page. Editing an answer opens that page and focuses its question below the sticky header. Current curated scales have equal item weights and do not add a separate importance question. Reduced-motion preferences are preserved.

The layout is checked at desktop, tablet, and mobile widths, including a 1920px canvas and Firefox. Charts retain readable textual values and alternatives. Demo data is labeled where it appears and is never merged into live community samples. Synthetic previews are illustrative and are not claims about representative population norms.

## Measured profile and disclosure

The homepage has two sections: a brief introduction with the interactive profile, and three starting assessments. Repeated feature explanations, comparison panels and how-to sections are removed. The profile mesh is projected from 3D coordinates and shaped by a deterministic scored Emotional Availability example. Pointer dragging, arrow keys and rotation buttons change its view; a slider changes an example score and the illustrated shape. A cyan overlay compares a second illustrative profile.

The background shares the profile's orbital lines, moving color fields and drifting points. Both canvases cap resolution and frame rate, suspend animation when hidden, support a shared Pause motion control, and start still for reduced-motion preferences. Static fallback art and readable category values remain available without canvas rendering.

The actual personal profile places a compact radar beside measured category values, without the full report’s answer inspector. History only connects attempts with matching definition, engine, depth and perspective. Version 4 standard forms contain 50 questions; complete forms contain 50–100. Existing version 3 drafts carry their answers into the longer form, while saved results retain their original definition. Violet marks self data and cyan marks another person or a participant cohort.

Result card and shared-profile choices start empty. Sensitive fields need an explicit acknowledgement. Histograms expose labelled bins with keyboard inspection and text counts; percentiles and strict-below percentages have distinct explanations. Admin drafts and live publication are separate actions. Confirmation dialogs protect erasure, revocation and unpublishing.
