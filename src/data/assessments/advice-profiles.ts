import type {
  AssessmentAdviceProfile,
  AssessmentDefinition,
} from "@/lib/assessment/types";

// Original educational coaching. These describe preferences and conversations, not diagnoses or sexual techniques.
export const adviceProfiles: Record<string, AssessmentAdviceProfile> = {
  "big-five-personality-profile": {
    theme: "everyday rhythm",
    seek: "Someone who can talk openly about routines, social energy and changing plans",
    friction:
      "Different social or planning preferences can become friction when one person's default is treated as the rule for both.",
    optimize:
      "Agree on one everyday routine that leaves room for both predictability and individual choice.",
    solo: [
      "Map a week that fits",
      "Sketch a satisfying ordinary week. Mark time alone, social time and the commitments you want protected.",
    ],
    together: [
      "Compare an ordinary Saturday",
      "Each describe a realistic Saturday, then choose one shared plan and one independent block.",
    ],
    curiosity: [
      "Try a small change on paper",
      "Imagine changing one familiar routine. Note what sounds interesting and what would feel draining.",
    ],
    ask: "What does a good balance of plans, novelty and time alone look like for you?",
  },
  "emotional-availability-reflection": {
    theme: "emotional availability",
    seek: "Someone who can say whether they have capacity to listen and follow through on a check-in",
    friction:
      "A wish for support can collide with limited capacity; availability should be asked about rather than tested through guessing.",
    optimize:
      "Use a capacity question before a vulnerable conversation: listening, advice or another time?",
    solo: [
      "Name the support you wanted",
      "Choose one recent moment and write the feeling, the support you wanted and a request you could actually make.",
    ],
    together: [
      "A ten-minute listening window",
      "Ask whether now is a good time. Take turns describing one everyday concern while the other reflects back what they heard.",
    ],
    curiosity: [
      "Draft a reconnection message",
      "Write a short invitation to reconnect that gives the other person a realistic choice of time.",
    ],
    ask: "How do you tell a partner you care when you do not have energy for a long conversation?",
  },
  "attachment-style-discovery": {
    theme: "closeness and independence",
    seek: "Someone who can offer clear reassurance while respecting separate time",
    friction:
      "Repeated reassurance requests and unexplained withdrawal can become a difficult cycle; a questionnaire cannot diagnose either person's attachment.",
    optimize:
      "Name both needs in the same request: a specific reassurance signal and a realistic amount of independent time.",
    solo: [
      "Translate a reaction into a request",
      "Write what happened, what you assumed and one direct request that does not require mind-reading.",
    ],
    together: [
      "Agree on a reconnection cue",
      "Choose a simple message for needing space and a realistic time to reconnect. Both people can revise it.",
    ],
    curiosity: [
      "Imagine two good responses",
      "Draft a reassurance response and a space-respecting response to the same ordinary misunderstanding.",
    ],
    ask: "When you need space, what would help us stay clear about when we will reconnect?",
  },
  "love-affection-preferences": {
    theme: "affection that lands",
    seek: "Someone who enjoys learning which gestures feel meaningful, rather than assuming their favorite gesture works for everyone",
    friction:
      "Giving the affection you prefer to receive can miss what the other person actually wants.",
    optimize:
      "Ask for one specific gesture and ask which gesture the other person would enjoy receiving in return.",
    solo: [
      "Collect three moments of care",
      "List three gestures that felt caring and write what made each one work: timing, attention, words or practical help.",
    ],
    together: [
      "A chosen gesture exchange",
      "Each request one small, ordinary gesture for this week. Declining or proposing another gesture is welcome.",
    ],
    curiosity: [
      "Explore a different expression",
      "Imagine receiving a gesture outside your usual style. Identify a version that might fit, or keep your current preference.",
    ],
    ask: "Which small gesture makes you feel appreciated, and which gestures do you enjoy giving?",
  },
  "conflict-communication-personality": {
    theme: "repair and disagreement",
    seek: "Someone willing to pause, listen and return to an unfinished discussion",
    friction:
      "Differences in speed or directness can feel like dismissal if neither person explains what they need.",
    optimize:
      "Agree on a pause-and-return plan before a disagreement: say why you are pausing and suggest a realistic return time.",
    solo: [
      "Rewrite one complaint",
      "Turn one recent complaint into an observation, its impact and a concrete request.",
    ],
    together: [
      "Practice on a low-stakes decision",
      "Choose an ordinary scheduling issue. Each summarize the other's view before proposing a compromise.",
    ],
    curiosity: [
      "Rehearse a repair",
      "Privately draft an apology that names the actual impact and one change you could follow through on.",
    ],
    ask: "How can we take a break from friction without leaving the other person guessing?",
  },
  "relationship-dealbreakers-boundaries": {
    theme: "shared expectations",
    seek: "Someone who can discuss practical commitments and accept a clear incompatibility without bargaining away a boundary",
    friction:
      "Affection can coexist with different future plans or responsibility expectations; neither automatically cancels the difference.",
    optimize:
      "Separate a flexible preference from a required agreement, and ask for a concrete example of how each would work.",
    solo: [
      "Sort preference, condition and limit",
      "Write three relationship expectations and mark which are preferences, which need conditions and which are non-negotiable.",
    ],
    together: [
      "One agreement in plain language",
      "Discuss one ordinary responsibility or privacy expectation and write an agreement both people can explain back.",
    ],
    curiosity: [
      "Imagine two workable futures",
      "Describe two possible relationship rhythms. Notice what each would require and what you do not want to compromise.",
    ],
    ask: "Which expectations can we adapt, and which differences would make this arrangement unsuitable?",
  },
  "intimacy-partner-preferences": {
    theme: "intimacy conditions",
    seek: "Someone who welcomes clear invitations, a chosen pace and follow-up care",
    friction:
      "Expecting desire to appear in the same way or at the same speed can create avoidable pressure.",
    optimize:
      "Discuss invitation, atmosphere and an easy ending separately instead of treating intimacy as one all-or-nothing plan.",
    solo: [
      "Trace a comfortable beginning",
      "Write the ordinary conditions that help interest emerge, and one condition that makes an invitation feel pressured.",
    ],
    together: [
      "Plan a no-outcome evening",
      "Choose a familiar, comfortable setting and agree that conversation or quiet company can be the whole evening.",
    ],
    curiosity: [
      "An invitation menu",
      "Privately draft three non-graphic ways to invite connection, each with an easy decline.",
    ],
    ask: "What helps an invitation feel welcome, and how would you like us to handle a no?",
  },
  "sexual-interests-curiosity-map": {
    theme: "curiosity without obligation",
    seek: "Someone who enjoys discussing possibilities without turning curiosity into a commitment",
    friction:
      "One person's imaginative interest may be mistaken for a practical yes.",
    optimize:
      "Label each idea as private, imagination-only, open to discussion or a possible plan before talking about details.",
    solo: [
      "Give curiosity a label",
      "Choose one theme and decide whether it belongs in private imagination, a conversation or a possible future plan.",
    ],
    together: [
      "A theme-only conversation",
      "Ask permission to discuss one broad theme for five minutes. Keep details optional and end without making a plan.",
    ],
    curiosity: [
      "Change one story condition",
      "Imagine the same adult fictional theme with a different setting or pace. Notice which part actually interests you.",
    ],
    ask: "Can we discuss an idea without either of us feeling expected to try it?",
  },
  "bdsm-power-dynamics-test": {
    theme: "chosen roles",
    seek: "Someone who treats a chosen role as specific, revocable and separate from ordinary adult autonomy",
    friction:
      "An imagined role and the responsibility of offering it are different; a label alone does not establish fit or trustworthiness.",
    optimize:
      "Describe the role, its time window and what remains outside it before discussing any activity.",
    solo: [
      "Draw the role boundary",
      "Write which decisions a fictional private role might include and which personal decisions remain entirely yours.",
    ],
    together: [
      "A role-definition conversation",
      "Each describe one role in ordinary language, including how to pause and return to equal footing.",
    ],
    curiosity: [
      "Keep a role in fiction",
      "Write a short non-graphic adult story premise, then mark which elements you would keep imagination-only.",
    ],
    ask: "What responsibilities would you enjoy offering, and what must stay outside any role agreement?",
  },
  "desire-reality-map": {
    theme: "interest versus lived experience",
    seek: "Someone patient enough to distinguish an appealing idea from a current invitation",
    friction:
      "An experience gap can become pressure if it is treated as a task to finish.",
    optimize:
      "For a wanted theme, name the missing condition before deciding whether any real-world step is wanted.",
    solo: [
      "Name the attractive ingredient",
      "For your highlighted preference, write whether the appealing part is attention, atmosphere, role or emotional meaning.",
    ],
    together: [
      "Discuss one gap without a deadline",
      "Ask whether one mutually welcome theme is worth a conversation. Either person can choose imagination-only or no next step.",
    ],
    curiosity: [
      "Imagine a lower-intensity version",
      "Privately imagine a simpler setting around the same theme. Decide whether that changes its appeal or whether it belongs only in fantasy.",
    ],
    ask: "Is this something you enjoy imagining, discussing or considering in real life?",
  },
  "turn-on-anatomy": {
    theme: "sensory cues and attention",
    seek: "Someone attentive to your particular sound, visual and contact preferences",
    friction:
      "A cue that one person enjoys can distract another; intensity is not a substitute for asking.",
    optimize:
      "Change one ordinary sensory condition at a time so you can tell what actually adds comfort or interest.",
    solo: [
      "A one-cue atmosphere check",
      "Compare quiet with a familiar playlist, or ordinary with adjusted lighting. Record one setting you prefer.",
    ],
    together: [
      "Ask before adding a cue",
      "Each name one welcome non-graphic sensory cue and one cue to leave out. Choose a simple atmosphere together.",
    ],
    curiosity: [
      "Build an imaginary setting",
      "Describe a comfortable adult setting using only sound, light and pace. No physical activity needs to follow.",
    ],
    ask: "Which small cue helps you feel present, and which cue should I avoid assuming you enjoy?",
  },
  "sensory-sensation-play-map": {
    theme: "gentle sensory preferences",
    seek: "Someone who can follow specific comfort preferences and welcome a return to ordinary conditions",
    friction:
      "Different preferences for input can be overlooked when an experience is described only as more or less intense.",
    optimize:
      "Discuss texture, ordinary comfortable temperature and amount of input as separate choices.",
    solo: [
      "A familiar-texture inventory",
      "Notice which everyday fabrics and room conditions feel comfortable. Write preferences without treating discomfort as something to overcome.",
    ],
    together: [
      "Choose a comfortable setting",
      "Agree on lighting, sound and a familiar fabric for quiet company. Ask before adding any new sensory element.",
    ],
    curiosity: [
      "One imagined change",
      "Imagine changing only one sensory feature, and decide whether you want to leave it as an idea.",
    ],
    ask: "What would tell us the setting is becoming too busy or uncomfortable?",
  },
  "sensory-deprivation-overload": {
    theme: "amount of sensory input",
    seek: "Someone who respects your access to speech, choice and normal surroundings",
    friction:
      "Less input may settle one person and unsettle another; an average cannot choose the setting for both.",
    optimize:
      "Start by adjusting ordinary room input, while preserving clear communication and independent choice.",
    solo: [
      "Notice your input threshold",
      "Compare two ordinary environments, such as quiet and soft music. Note the point at which you want fewer inputs.",
    ],
    together: [
      "A simpler room agreement",
      "Agree on one ordinary sensory setting and a clear request for normal lighting or quiet. No restrictive equipment is needed.",
    ],
    curiosity: [
      "Imagine control staying available",
      "Describe a preferred atmosphere and list the choices you would want easy to access. Keep it on paper if you prefer.",
    ],
    ask: "How would you like to ask for normal conditions again, without needing to explain?",
  },
  "fantasy-catalog": {
    theme: "adult imagination",
    seek: "Someone who can enjoy a shared theme while accepting that a story can remain a story",
    friction:
      "An imagined character, mood or setting does not establish consent to a real arrangement.",
    optimize:
      "Talk about the appealing feeling before debating whether to enact an entire scenario.",
    solo: [
      "Find the recurring ingredient",
      "Choose a high-interest adult theme and describe its appeal in three non-graphic words, such as attention, mystery or comfort.",
    ],
    together: [
      "Share a theme, not a promise",
      "Ask permission to share one broad adult-fiction theme. Each say whether listening is welcome; no plan is required.",
    ],
    curiosity: [
      "Coauthor an atmosphere",
      "If both people want to, invent a non-graphic setting with independent consenting adult characters. Decide in advance that it stays fiction.",
    ],
    ask: "Which part of this story appeals to you, and which parts should stay imaginary?",
  },
  "aftercare-recovery-style": {
    dimensionCoaching: {
      contact: {
        seek: "Someone who freely enjoys offering the specific comforting contact you welcome",
        friction:
          "A wish for closeness and a need for independent recovery can require an agreed handoff rather than more contact.",
        optimize:
          "Name the exact contact you want and how to stop it; do not use a broad care label as permission for touch.",
      },
      words: {
        seek: "Someone comfortable offering clear reassurance without demanding an immediate emotional debrief",
        friction:
          "Reassurance can become too much conversation if rest is also needed.",
        optimize:
          "Choose one reassuring sentence and a separate time for a longer conversation.",
      },
      practical: {
        seek: "Someone who enjoys small practical comforts and asks rather than taking over",
        friction:
          "Practical help may be mistaken for a wish for company or conversation.",
        optimize:
          "Put one requested practical comfort on a simple care note, separate from emotional follow-up.",
      },
      space: {
        seek: "Someone comfortable offering independent recovery time without treating it as rejection",
        friction:
          "One person's welcome space can feel like a sudden ending to someone who wanted company.",
        optimize:
          "Agree on how to begin independent rest and whether a later message would be welcome.",
      },
      followup: {
        seek: "Someone able to agree on a realistic later check-in and respect the reply pace",
        friction:
          "A hoped-for later message can become uncertainty when no timing was discussed.",
        optimize:
          "Choose a realistic check-in window and make clear that a slower reply does not require an explanation.",
      },
    },
    theme: "care after intensity",
    seek: "Someone who enjoys offering the kind of care you want and can state their own need for rest",
    friction:
      "Closeness, quiet and practical help can all mean care; guessing which one is wanted can miss the point.",
    optimize:
      "Choose immediate care and a later check-in separately, including an option for space.",
    solo: [
      "Write a landing card",
      "List one immediate comfort, one thing to leave out and whether you would welcome a later message.",
    ],
    together: [
      "Rehearse a five-minute landing",
      "Outside any intense activity, ask which familiar comfort would be welcome: water, quiet company or space. Try only what both choose.",
    ],
    curiosity: [
      "Compare two care endings",
      "Imagine ending with quiet company versus independent rest. Note which conditions would change your choice.",
    ],
    ask: "What would good care look like immediately afterward, and what would you want later?",
  },
  "attachment-bedroom": {
    theme: "reassurance and room",
    seek: "Someone comfortable expressing affection clearly and accepting a request for independent time",
    friction:
      "A pause can be mistaken for rejection when its meaning is left unexplained.",
    optimize:
      "Pair a request for room with a clear, realistic invitation to reconnect, without promising feelings you do not have.",
    solo: [
      "Separate feeling from assumption",
      "Write a moment of uncertainty, what you assumed it meant and what you would like to ask directly.",
    ],
    together: [
      "Choose a reassurance cue",
      "Each propose one small phrase or check-in that would help without requiring constant availability.",
    ],
    curiosity: [
      "Imagine closeness with room",
      "Describe an evening with both connection and independent time. Notice where reassurance would help.",
    ],
    ask: "What does a pause mean for you, and how can we check rather than assume?",
  },
  "post-intimacy-morning-after": {
    theme: "the hours afterward",
    seek: "Someone who can discuss sleep, closeness and goodbyes before they become expectations",
    friction:
      "Staying over, leaving or wanting quiet can be misread as a statement about affection.",
    optimize:
      "Agree on practical overnight and next-morning expectations in advance, with room to change them.",
    solo: [
      "Describe a comfortable morning",
      "Write your preferred sleep arrangement, one ordinary comfort and a goodbye that would feel clear.",
    ],
    together: [
      "Choose a simple morning plan",
      "Discuss breakfast, quiet, departure time and whether a later message is wanted. Keep each choice separate.",
    ],
    curiosity: [
      "Try the alternative on paper",
      "Imagine a different morning rhythm and identify one part that could fit without changing your whole preference.",
    ],
    ask: "What would make the morning feel comfortable without either of us needing to read into it?",
  },
  "recovery-past-experiences": {
    theme: "present-day comfort",
    seek: "Someone who respects present needs without asking you to justify them with personal history",
    friction:
      "Pressure to disclose or prove that you are ready can make a support conversation less useful.",
    optimize:
      "Name a present preference and the response you want; you never need to retell an incident to make a request valid.",
    solo: [
      "A present-needs note",
      "Write one condition that supports comfort today and one topic you do not want to explain. Stop the reflection whenever you want.",
    ],
    together: [
      "Ask about support, not history",
      "Only if welcome, discuss a current comfort request and how to respond to it. Leave the reason private.",
    ],
    curiosity: [
      "Imagine a comfortable choice",
      "Imagine being offered a choice between quiet, company and leaving. Notice which response you would want respected today.",
    ],
    ask: "Would you like listening, practical support, space or no discussion of this today?",
  },
  "fantasy-sharing-comfort": {
    theme: "disclosure at your pace",
    seek: "Someone who asks before hearing details and can respond without treating disclosure as an invitation",
    friction:
      "Different wishes for detail or timing can feel like judgment if permission is skipped.",
    optimize:
      "Ask permission, preview the broad theme and agree on what may be remembered or saved.",
    solo: [
      "Choose a disclosure level",
      "Rewrite an imagined idea as a one-sentence theme with no details. Decide whether even that sentence should remain private.",
    ],
    together: [
      "Practice a permission-first opening",
      "Ask whether a brief theme-level conversation is welcome now. A no or another time ends the invitation cleanly.",
    ],
    curiosity: [
      "Draft two responses",
      "Privately write a warm response to an unfamiliar idea and a kind response when you do not want to hear more.",
    ],
    ask: "How much detail would you welcome, and what would you prefer we do not save or revisit?",
  },
  "curiosity-exploration-speed": {
    theme: "a freely chosen pace",
    seek: "Someone who can enjoy anticipation without setting a deadline for your interest",
    friction:
      "A difference in pace can become pressure when a slower answer is treated as a problem to solve.",
    optimize:
      "Agree on the next conversation rather than promising a next activity.",
    solo: [
      "Make a pace ladder",
      "Write three levels: thinking privately, discussing a theme and considering a plan. Place one current idea where it belongs today.",
    ],
    together: [
      "Agree on the smallest next step",
      "Choose a conversation or a familiar shared setting, with no promise to progress further.",
    ],
    curiosity: [
      "Give an idea more time",
      "Leave a theme on a private list for a week, then check whether it still interests you. There is no need to move it forward.",
    ],
    ask: "What is the smallest step you would actually welcome, including doing nothing for now?",
  },
  "communication-language-profile": {
    theme: "words, tone and quiet",
    seek: "Someone who welcomes literal feedback about language and does not assume a preferred tone is universal",
    friction:
      "Praise, teasing, direction and silence can land differently even when the intention is affectionate.",
    optimize:
      "Make a short welcome-word and leave-out list, then check whether it still fits instead of relying on a label.",
    solo: [
      "A language preference card",
      "Write one tone you enjoy, one phrase you prefer not to hear and a simple correction you could use.",
    ],
    together: [
      "A tone-only conversation",
      "Outside intimate time, compare preferences for warmth, direction, playfulness and quiet. Do not test unwanted words on each other.",
    ],
    curiosity: [
      "Rewrite a kind sentence",
      "Try writing the same non-graphic appreciative sentence in a warmer, simpler or quieter style. Notice which feels natural.",
    ],
    ask: "Which words or tones feel welcome, and how would you like to correct me if they do not land?",
  },
  "service-devotion-profile": {
    theme: "freely offered service",
    seek: "Someone whose enjoyment of offering or receiving care complements yours without turning gestures into debts",
    friction:
      "A service ritual can become an unwanted responsibility if its scope is assumed rather than chosen.",
    optimize:
      "Separate an optional gesture from household duties, and agree on how to decline or pause it.",
    solo: [
      "Identify the meaning of service",
      "Choose a desired gesture and write whether its appeal is practicality, attention, ritual or appreciation.",
    ],
    together: [
      "One optional ordinary gesture",
      "Each name a small gesture you would enjoy offering or receiving this week. Agree that skipping it does not require repayment.",
    ],
    curiosity: [
      "Imagine switching roles",
      "Privately imagine the same ordinary gesture from the other role. Notice whether interest changes.",
    ],
    ask: "Which part would you enjoy giving, and when would the gesture start feeling like an obligation?",
  },
  "praise-intensity-spectrum": {
    theme: "recognition and welcome tone",
    seek: "Someone who can give specific appreciation and accept that playful teasing needs its own permission",
    friction:
      "Enjoying praise does not imply enjoying a spotlight, nickname or teasing.",
    optimize: "Choose the content, tone and setting of recognition separately.",
    solo: [
      "Write a compliment that fits",
      "Draft a non-graphic compliment you would actually welcome and note whether you prefer hearing it privately or reading it.",
    ],
    together: [
      "Specific appreciation exchange",
      "Ask permission to exchange one sincere compliment about an everyday quality. Either person can choose quiet acknowledgment.",
    ],
    curiosity: [
      "Imagine the setting changing",
      "Compare receiving the same compliment in private, in writing or with an audience that explicitly opted in. Leave unwanted settings out.",
    ],
    ask: "Would that kind of attention feel good to you, or would another tone or setting fit better?",
  },
  "orgasm-pacing-control": {
    theme: "pace without performance targets",
    seek: "Someone who respects changing pace and accepts an ending without a required outcome",
    friction:
      "A preferred plan can become pressure if a particular outcome is treated as owed.",
    optimize:
      "Discuss pace, pauses and an acceptable ending separately from any goal.",
    solo: [
      "Remove the outcome from a plan",
      "Describe what would make private time worthwhile even if it ended with conversation or rest.",
    ],
    together: [
      "Agree on an easy ending",
      "Discuss a familiar plan and explicitly allow a pause, a change of course or an early ending without disappointment being used as pressure.",
    ],
    curiosity: [
      "Imagine anticipation without a deadline",
      "Privately consider whether a little more notice or a slower transition changes the appeal of an invitation.",
    ],
    ask: "How can we keep this enjoyable without treating an outcome as something either person owes?",
  },
  "adult-caregiving-comfort": {
    theme: "adult-to-adult comfort",
    seek: "Someone who enjoys nurturing gestures while leaving your decisions and independence intact",
    friction:
      "Care and authority over an adult's life are different; accepting help is not surrendering autonomy.",
    optimize:
      "Ask whether the wanted response is practical help, listening, company or independent rest.",
    solo: [
      "A comfort menu for today",
      "List one ordinary comfort you welcome and one kind of help you would rather handle yourself.",
    ],
    together: [
      "Ask before helping",
      "Choose a familiar adult-to-adult gesture such as a warm drink or quiet company, and ask before providing it.",
    ],
    curiosity: [
      "Imagine giving and receiving",
      "Consider the same everyday comfort from both roles. Notice whether one role feels more appealing.",
    ],
    ask: "What kind of care would feel supportive today, and what should remain entirely your choice?",
  },
  "primal-movement-play": {
    theme: "playful energy and grounding",
    seek: "Someone who can enjoy expressive play while responding clearly to a pause",
    friction:
      "Different energy levels can be mistaken for reluctance or a challenge when no such meaning was intended.",
    optimize:
      "Agree on the energy level and a clear transition back to ordinary conversation.",
    solo: [
      "Notice movement and stillness",
      "Compare a familiar song with a quiet break. Record whether movement, rhythm or stillness feels appealing today.",
    ],
    together: [
      "An invited movement break",
      "If both want it, choose a brief ordinary dance or walk at a mutually comfortable pace, with an easy stop.",
    ],
    curiosity: [
      "Imagine the mood",
      "Describe a playful adult story using energy and atmosphere, without risky pursuit or physical techniques.",
    ],
    ask: "What would make this feel playful, and what cue would mean we return to calm?",
  },
  "power-exchange-intensity": {
    theme: "the scope of chosen leadership",
    seek: "Someone whose freely offered leadership or receptive role complements yours and who welcomes a clear end to it",
    friction:
      "Two people wanting to receive direction may need a different arrangement; matching labels cannot allocate responsibility for them.",
    optimize:
      "Write what is included, when the role ends and which ordinary decisions stay outside it.",
    solo: [
      "A one-page role scope",
      "Write one imagined role, its time limit, excluded decisions and how you would return to equal footing.",
    ],
    together: [
      "Negotiate a conversation role",
      "For a low-stakes planning conversation only, decide who suggests the agenda and how either person can switch back to shared direction.",
    ],
    curiosity: [
      "Try the counterpart on paper",
      "Imagine offering the responsibility associated with a role you like receiving. Keep any unwanted role imagination-only.",
    ],
    ask: "What would you enjoy leading or receiving, and what responsibility would you rather not take on?",
  },
  "roleplay-scenario-explorer": {
    theme: "adult fictional worlds",
    seek: "Someone who enjoys coauthoring a story and keeping fictional authority separate from real choice",
    friction:
      "Liking the setting does not mean wanting every character, line or role in it.",
    optimize:
      "Agree on adult characters, the broad mood and a simple way to speak out of character before imagining details.",
    solo: [
      "A three-line story premise",
      "Name a setting, two independent consenting adult characters and one mood. Leave it non-graphic and imagination-only.",
    ],
    together: [
      "Coauthor a setting",
      "Ask whether a short adult-fiction conversation is welcome. Each choose one setting detail and one element to leave out.",
    ],
    curiosity: [
      "Change the role, keep the mood",
      "Privately imagine the same atmosphere with equal roles instead of a guide-and-guest arrangement, or the reverse.",
    ],
    ask: "Is the appealing part the role, the atmosphere or the shared storytelling?",
  },
  "privacy-visibility-risk-profile": {
    theme: "chosen privacy and visibility",
    seek: "Someone who respects discretion and never involves an audience without every adult opting in",
    friction:
      "Being comfortable with attention in one private setting does not permit recordings, public exposure or other observers.",
    optimize:
      "Discuss audience, identification and recording as separate agreements, defaulting to no audience and no recording.",
    solo: [
      "Write a visibility boundary",
      "Note which personal details, images or attendance information you want kept private.",
    ],
    together: [
      "A private-setting agreement",
      "Discuss a familiar private setting and what should remain off-camera and undisclosed. No public or uninvited audience is involved.",
    ],
    curiosity: [
      "Keep the spotlight fictional",
      "Imagine an adult character receiving attention in an invented closed setting. Decide what belongs only in imagination.",
    ],
    ask: "Who, if anyone, has explicitly opted in, and what information stays only between us?",
  },
  "jealousy-compersion-relationship-structures": {
    theme: "relationship agreements",
    seek: "Someone whose chosen relationship structure is compatible with yours and who can discuss mixed feelings without pressure",
    friction:
      "A preference for exclusivity and a wish for openness cannot be resolved by a readiness score.",
    optimize:
      "Discuss the actual agreement, time commitments and privacy of other people before considering any change.",
    solo: [
      "Name the agreement you want",
      "Write the relationship structure you would choose today and which parts you are uncertain about. Uncertainty need not become a plan.",
    ],
    together: [
      "A structure conversation with no change",
      "Agree that the conversation itself changes no existing agreement. Each state what they want and what they do not want.",
    ],
    curiosity: [
      "Explore feelings without a scenario",
      "Privately consider which reassurance, scheduling or information boundaries would matter, without proposing another partner.",
    ],
    ask: "Are we discussing an idea, or proposing a change to an agreement that still needs both people's free choice?",
  },
  "toys-tools-gear-preferences": {
    theme: "optional props and atmosphere",
    seek: "Someone interested in choosing together and comfortable setting equipment aside",
    friction:
      "Owning or buying an item does not establish interest in using it, and a purchase should not create an obligation.",
    optimize:
      "Separate appearance, materials, ownership, budget and willingness before considering any item.",
    solo: [
      "A no-purchase preference list",
      "List ordinary textures, clothing or atmosphere tools you like and materials you prefer to leave out.",
    ],
    together: [
      "Choose a prop-free option first",
      "Discuss the atmosphere you want using familiar lighting or music before considering equipment. Spending nothing remains a valid choice.",
    ],
    curiosity: [
      "Make a wish list without buying",
      "Privately collect broad non-graphic ideas and mark each as appearance-only, discussion-only or unwanted.",
    ],
    ask: "Would this item add something we both want, and would we still enjoy the plan without it?",
  },
  "limits-boundaries-deep-dive": {
    theme: "clear conditions and limits",
    seek: "Someone who accepts a no without repeated requests and welcomes updated agreements",
    friction:
      "A soft condition should not be mistaken for permission to negotiate a hard limit away.",
    optimize:
      "Use separate language for a preference, a condition, an uncertainty and a hard limit.",
    solo: [
      "A four-column boundary note",
      "Write one preference, one context condition, one uncertainty and any hard limit you choose to record. Reasons can stay private.",
    ],
    together: [
      "Practice receiving a no",
      "Use a low-stakes everyday invitation. Practice acknowledging a decline and choosing another topic without asking for justification.",
    ],
    curiosity: [
      "Revise a hypothetical agreement",
      "Imagine changing a previously agreed plan. Write a simple sentence that withdraws permission without apology or a detailed explanation.",
    ],
    ask: "Is this flexible, condition-dependent, undecided or a firm no? You do not need to give a reason.",
  },
  "partner-ideal-dealbreakers": {
    theme: "partner habits that matter",
    seek: "Someone whose actual offered habits fit what you value, beyond the labels they use",
    friction:
      "A compelling profile or shared interests cannot substitute for observed follow-through and respect for limits.",
    optimize:
      "Turn an abstract trait into an ordinary question and a behavior you can notice over time.",
    solo: [
      "Translate one ideal into behavior",
      "Choose a valued quality and write what it would look like in an ordinary week, including one example you would not want.",
    ],
    together: [
      "Ask for a real example",
      "Discuss one everyday habit each person enjoys bringing, without treating a desired quality as a promise of character.",
    ],
    curiosity: [
      "Consider an imperfect fit",
      "Imagine a partner with one different preference. Identify what might be negotiable and what would make the arrangement unsuitable.",
    ],
    ask: "What does that quality look like in your actual choices when plans are inconvenient?",
  },
  "group-multipartner-interest": {
    theme: "multiple-person curiosity",
    seek: "People who speak for themselves, respect existing agreements and welcome independent opt-outs",
    friction:
      "Two people's shared interest cannot provide consent for any third adult.",
    optimize:
      "Separate imagination, adult social comfort and real-world willingness before discussing logistics.",
    solo: [
      "Choose the right label",
      "Mark a broad theme as private imagination, a possible conversation or no interest. Do not treat fear or uncertainty as something to defeat.",
    ],
    together: [
      "Clarify existing agreements first",
      "Discuss whether even a theme-level conversation fits current relationship agreements. No other adult's preferences are assumed.",
    ],
    curiosity: [
      "An imagination-only ensemble",
      "Privately describe a non-graphic adult fictional setting, keeping every character independent and free to decline.",
    ],
    ask: "What would each individual want to decide for themselves, and is this only an imagined theme?",
  },
  "financial-gifting-boundaries": {
    theme: "gifts without financial dependence",
    seek: "Someone who enjoys thoughtful generosity while respecting independent accounts and an easy no",
    friction:
      "A gift can create pressure if appreciation is treated as an obligation or essential expenses become part of a dynamic.",
    optimize:
      "Agree on a modest optional ceiling, a no-spend alternative and a way to stop a gifting ritual.",
    solo: [
      "A no-spend generosity list",
      "List three gestures that express care without money, debt or access to anyone's accounts.",
    ],
    together: [
      "Choose a symbolic gesture",
      "Discuss a handwritten note, a homemade meal or another no-spend gesture, with no intimacy or repayment expected.",
    ],
    curiosity: [
      "Name the meaning of a gift",
      "Privately decide whether attention, ritual, surprise or usefulness is the appealing part. Money need not be involved.",
    ],
    ask: "Would this still feel freely chosen if there were no reward, repayment or future gift?",
  },
  "long-term-dynamic-vision": {
    theme: "a sustainable shared rhythm",
    seek: "Someone whose desired scope, ordinary-life expectations and room for change fit yours",
    friction:
      "A role that is appealing occasionally may not fit everyday responsibilities or ongoing availability.",
    optimize:
      "Describe one ordinary week in the arrangement, including work, friends, rest and a review point.",
    solo: [
      "An ordinary-week sketch",
      "Write what the desired dynamic would look like on a tiring weekday, not only a special occasion.",
    ],
    together: [
      "A time-limited planning conversation",
      "Compare the scope each person wants and set a future review point without promising a permanent identity.",
    ],
    curiosity: [
      "Imagine a change of season",
      "Consider a busier or less energetic period. Note which rituals could pause and which independent routines should stay protected.",
    ],
    ask: "What would make this sustainable in ordinary life, and how would we change or end the arrangement?",
  },
  "kink-compatibility-stress-test": {
    theme: "handling changed expectations",
    seek: "Someone who can respond to changed plans with clarity and concrete repair",
    friction:
      "A hypothetical good response is not evidence that someone will behave that way; watch for follow-through over time.",
    optimize:
      "Practice a low-stakes change of plan and agree on how to communicate disappointment without pressure.",
    solo: [
      "Write a practical response",
      "Choose an ordinary scheduling mismatch and draft an acknowledgment, an alternative and an easy decline.",
    ],
    together: [
      "A low-stakes what-if",
      "Discuss what happens if one person is tired, changes their mind or needs to leave early. Keep the answer specific and revocable.",
    ],
    curiosity: [
      "Revisit an assumption",
      "Privately identify a hope you may have treated as a promise, and write the question you actually need to ask.",
    ],
    ask: "If this plan no longer fits, how can we change it without either person owing a replacement?",
  },
  "spicy-would-you-rather": {
    theme: "preference direction",
    seek: "Someone interested in how your chosen style fits with theirs, without treating either option as better",
    friction:
      "A forced choice can hide that both options, neither option or different contexts appeal.",
    optimize:
      "Use a chosen option as an opening question, then add the context that the binary choice could not capture.",
    solo: [
      "Add the missing third option",
      "Choose one answered pair and write a third option that would fit you better, if you have one.",
    ],
    together: [
      "Explain one choice each",
      "Share only an option you want to disclose. Each explain when it fits and when the other direction might fit instead.",
    ],
    curiosity: [
      "Imagine the opposite context",
      "Privately imagine a situation where the other option might appeal. Keeping your original preference is equally valid.",
    ],
    ask: "Is that your usual preference, or does the setting change your answer?",
  },
  "personal-erotic-blueprint": {
    theme: "your combined intimacy patterns",
    seek: "Someone willing to learn your actual conditions rather than assume a style label explains you",
    friction:
      "A broad average can hide differences between receiving, offering and specific contexts.",
    optimize:
      "Choose one repeating theme across your owned saved reflections and check whether its meaning is consistent before using it as a partner filter.",
    solo: [
      "Write a three-line user guide",
      "Describe one welcome condition, one preferred pace and one limit you choose to name. Keep source answers private.",
    ],
    together: [
      "Share one chosen sentence",
      "Select a single non-graphic preference you want to disclose and ask what the other person would freely enjoy offering.",
    ],
    curiosity: [
      "Explore a contrast",
      "Privately compare two categories that differ. Decide whether the contrast reflects role, setting or a preference that has changed.",
    ],
    ask: "Which part of my description fits what you enjoy offering, and which part needs more explanation?",
  },
  "erotic-blueprint-style": {
    dimensionCoaching: {
      sensual: {
        wording:
          "I enjoy an unhurried atmosphere with lighting and sound chosen together. I am looking for someone attentive to the details, with an easy no.",
        seek: "Someone high in attentive sensory preferences, comfortable with your chosen sound, lighting and pace",
        friction:
          "A very direct, fast invitation may miss the atmosphere you enjoy; ask about timing rather than rejecting a whole partner type.",
        optimize:
          "Choose one ordinary sensory condition, such as music or lighting, before making a more specific invitation.",
      },
      sexual: {
        wording:
          "I enjoy clear, direct conversations about adult intimacy. I appreciate specific invitations and room to decline or suggest another time.",
        seek: "Someone who enjoys clear, direct adult intimacy conversations and literal invitations",
        friction:
          "Indirect hints or elaborate buildup may leave your wishes unclear; directness still needs room for a no.",
        optimize:
          "Practice a specific, non-graphic invitation with a simple option to decline or suggest another time.",
      },
      energetic: {
        wording:
          "I enjoy anticipation and an unhurried transition into private time. I am drawn to someone who can enjoy that buildup without assuming it promises an outcome.",
        seek: "Someone who enjoys anticipation, attentive presence and slow buildup without a promised outcome",
        friction:
          "A rushed invitation can interrupt the transition you enjoy; neither person owes a long buildup or a later outcome.",
        optimize:
          "Agree on a little advance notice and an unhurried transition that can end with ordinary connection.",
      },
      kinky: {
        wording:
          "I am curious about negotiated adult roles and private rituals. I value clear scope, ordinary independence and a partner who welcomes a changed mind.",
        seek: "Someone curious about negotiated adult roles and symbolism, who treats every role as limited and revocable",
        friction:
          "Shared interest in a role does not establish matching responsibilities or limits.",
        optimize:
          "Discuss the role, its counterpart, a time window and an out-of-role check before considering any plan.",
      },
      shapeshifter: {
        wording:
          "I enjoy choosing among different familiar styles of connection. I am looking for someone who asks what fits today, rather than expecting variety on demand.",
        seek: "Someone who enjoys flexibility and can ask which style fits today rather than expect constant variety",
        friction:
          "Enjoying variety does not mean enjoying everything or wanting to switch styles on demand.",
        optimize:
          "Offer two familiar styles of connection and choose together, leaving an ordinary evening as an option.",
      },
    },
    theme: "your preferred intimacy style",
    seek: "Someone curious about your leading style and willing to learn the conditions behind it",
    friction:
      "A primary or secondary label does not determine compatibility, and a shared label does not imply the same boundaries.",
    optimize:
      "Translate the leading style into a concrete invitation, a chosen pace and a comfortable ending.",
    solo: [
      "Translate a style into conditions",
      "Write one real preference behind your leading style, rather than using the label as a complete explanation.",
    ],
    together: [
      "A style-to-conditions conversation",
      "Compare atmosphere, clarity, anticipation, chosen roles and flexibility. Each name one condition you would welcome today.",
    ],
    curiosity: [
      "Borrow one ordinary ingredient",
      "Privately imagine one non-graphic ingredient from a less prominent style, such as different lighting or more advance notice. No change is required.",
    ],
    ask: "What would your preferred style look like in an ordinary, freely chosen moment together?",
  },
};

export function withAdviceProfile(
  a: AssessmentDefinition,
): AssessmentDefinition {
  return { ...a, adviceProfile: a.adviceProfile || adviceProfiles[a.slug] };
}
