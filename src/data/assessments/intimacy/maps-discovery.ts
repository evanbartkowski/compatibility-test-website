import {
  defineIntimacyAssessment as define,
  preferenceScale as scale,
} from "./factory";

export const desireRealityMap = define({
  slug: "desire-reality-map",
  title: "Desire vs Reality Map",
  hook: "What interests you, what you have experienced, and what you would freely consider are three different stories.",
  love: "See the gaps without being pushed to close them. Your private map separates wishes, experience and limits.",
  matchingNote:
    "Compare the support you would welcome with what a partner freely offers; experience never qualifies someone for a match.",
  next: ["curiosity-exploration-speed", "limits-boundaries-deep-dive"],
  scales: [
    scale(
      "invitation",
      "Invitations & initiative",
      "connection",
      "Invitations seem less central to your interest than other conditions.",
      "The way an invitation arrives appears important to what you want.",
      [
        [
          "Being invited into unhurried intimate time.",
          "Making an unhurried invitation without expecting a yes.",
        ],
        [
          "Receiving a direct invitation with room to decline.",
          "Expressing interest directly while accepting a decline.",
        ],
        [
          "Having someone ask what feels appealing today.",
          "Asking what feels appealing before proposing a plan.",
        ],
        [
          "Being welcomed back into closeness after time apart.",
          "Creating a gentle welcome after time apart.",
        ],
        [
          "Receiving a playful invitation in a private setting.",
          "Offering a private, playful invitation without pressure.",
        ],
      ],
    ),
    scale(
      "conditions",
      "Conditions that help interest",
      "pacing",
      "These particular conditions appear less essential to your interest.",
      "Comfortable conditions may matter as much as the invitation itself.",
      [
        [
          "Having quiet transition time before closeness.",
          "Protecting transition time before inviting closeness.",
        ],
        [
          "Being given privacy from interruptions.",
          "Arranging privacy from interruptions for shared time.",
        ],
        [
          "Having room to notice whether interest develops.",
          "Leaving room for interest to develop without escalation.",
        ],
        [
          "Being reassured that a plan can change.",
          "Making it clear that changing a plan is welcome.",
        ],
        [
          "Having practical worries acknowledged before intimacy.",
          "Checking whether practical worries need attention first.",
        ],
      ],
    ),
    scale(
      "novelty",
      "New possibilities",
      "imagination",
      "Familiar options currently seem more appealing than new possibilities.",
      "Freely discussing new possibilities appears appealing to you.",
      [
        [
          "Being offered one small change to a familiar routine.",
          "Suggesting one small change while keeping the familiar option available.",
        ],
        [
          "Hearing an unfamiliar idea without agreeing to try it.",
          "Sharing an unfamiliar idea as a conversation only.",
        ],
        [
          "Receiving an invitation to research a shared interest.",
          "Looking into a shared interest before proposing an experience.",
        ],
        [
          "Being able to name a maybe that stays a maybe.",
          "Accepting a partner's maybe without treating it as a future yes.",
        ],
        [
          "Being asked what I would like to keep familiar.",
          "Asking which familiar parts a partner wants to retain.",
        ],
      ],
    ),
    scale(
      "attention",
      "Attention & sensation",
      "sensory",
      "These forms of sensory attention appear less appealing in your current answers.",
      "Attentive sensory connection appears to be a stronger source of interest.",
      [
        [
          "Receiving affectionate contact with no required outcome.",
          "Offering affectionate contact without expecting more.",
        ],
        [
          "Having my comfort with sound checked.",
          "Checking which sounds or quiet feel comfortable.",
        ],
        [
          "Being able to adjust the atmosphere around us.",
          "Adapting the atmosphere to a partner's feedback.",
        ],
        [
          "Receiving time to notice what feels comfortable.",
          "Slowing down so a partner can notice their comfort.",
        ],
        [
          "Being asked whether company or space feels better.",
          "Offering either company or space without taking the choice personally.",
        ],
      ],
    ),
    scale(
      "voice",
      "Voice & choice",
      "autonomy",
      "These forms of explicit preference discussion seem less appealing, without establishing consent by silence.",
      "Being able to name preferences and limits appears especially important to you.",
      [
        [
          "Having a clear way to stop an intimate plan.",
          "Agreeing on a clear way either person can stop.",
        ],
        [
          "Receiving a calm response when I change my mind.",
          "Responding calmly when a partner changes their mind.",
        ],
        [
          "Being asked about current willingness separately from fantasy.",
          "Asking about willingness without treating a fantasy as permission.",
        ],
        [
          "Having an experience gap treated without judgment.",
          "Responding without judgment to a difference in experience.",
        ],
        [
          "Having a limit accepted without a debate.",
          "Accepting a stated limit without trying to negotiate it away.",
        ],
      ],
    ),
  ],
});

export const attractionSensoryCues = define({
  slug: "turn-on-anatomy",
  title: "Attraction & Sensory Cues",
  hook: "Notice the kinds of contact, atmosphere and attention that suit you, without a prescribed idea of what should work.",
  love: "A detailed preference map that makes space for everyday comfort and individual differences.",
  matchingNote:
    "A wish to receive a kind of attention is compared with willingness to offer it; body preferences never imply access.",
  next: ["sensory-sensation-play-map", "communication-language-profile"],
  scales: [
    scale(
      "contact",
      "Contact & personal space",
      "sensory",
      "You report less interest in these forms of contact.",
      "Chosen contact and attention to personal space seem meaningful to you.",
      [
        [
          "Having my preference about hand contact checked.",
          "Checking whether hand contact is welcome.",
        ],
        [
          "Receiving a hug whose length I can influence.",
          "Offering a hug while following the other person's preferred duration.",
        ],
        [
          "Being asked before contact near my face.",
          "Asking before contact near a partner's face.",
        ],
        [
          "Having shoulder contact treated as a separate choice.",
          "Checking whether shoulder contact feels welcome.",
        ],
        [
          "Having comfortable distance respected while we sit together.",
          "Following a partner's preferred distance while sitting together.",
        ],
      ],
    ),
    scale(
      "visual",
      "Visual atmosphere",
      "sensory",
      "Visual setting appears less central to your interest.",
      "Visual atmosphere appears to shape your comfort and attraction.",
      [
        [
          "Being asked which lighting feels comfortable.",
          "Adjusting lighting to a partner's comfort.",
        ],
        [
          "Having a visually calm room for closeness.",
          "Preparing a visually calm space for shared time.",
        ],
        [
          "Being invited to choose an outfit for myself.",
          "Welcoming a partner's own choice of clothing.",
        ],
        [
          "Receiving comfortable eye contact with room to look away.",
          "Offering eye contact without demanding it be maintained.",
        ],
        [
          "Having mirrors or cameras excluded when I prefer.",
          "Respecting a preference to exclude mirrors or cameras.",
        ],
      ],
    ),
    scale(
      "sound",
      "Voice, sound & quiet",
      "sensory",
      "Sound and voice appear less central to these preferences.",
      "The sound of the interaction appears important to your sense of connection.",
      [
        [
          "Hearing a calm, reassuring tone.",
          "Using a calm, reassuring tone when it is welcome.",
        ],
        [
          "Being asked whether music helps or distracts.",
          "Checking whether music feels helpful or distracting.",
        ],
        [
          "Having silence accepted as a comfortable choice.",
          "Sharing comfortable silence without expecting performance.",
        ],
        [
          "Receiving spoken check-ins at a pace I choose.",
          "Adjusting spoken check-ins to a partner's preferred pace.",
        ],
        [
          "Being able to ask for a quieter environment.",
          "Making the environment quieter when asked.",
        ],
      ],
    ),
    scale(
      "pace",
      "Pace & predictability",
      "pacing",
      "You report less interest in these forms of gradual pacing.",
      "Predictability and an adjustable pace appear to help you stay comfortable.",
      [
        [
          "Having a small next step described beforehand.",
          "Describing a proposed next step before anything changes.",
        ],
        [
          "Receiving time to settle into a new setting.",
          "Allowing settling-in time in a new setting.",
        ],
        [
          "Being able to repeat a comfortable moment.",
          "Welcoming a request to repeat a comfortable moment.",
        ],
        [
          "Having transitions happen gradually.",
          "Making transitions gradual when a partner prefers.",
        ],
        [
          "Being asked whether more intensity is actually wanted.",
          "Asking before changing intensity rather than assuming.",
        ],
      ],
    ),
    scale(
      "recognition",
      "Feeling noticed",
      "connection",
      "These forms of recognition appear less important to you.",
      "Specific, attentive recognition appears to contribute to attraction for you.",
      [
        [
          "Receiving appreciation for something specific about me.",
          "Expressing specific appreciation without objectifying a partner.",
        ],
        [
          "Having a small preference remembered.",
          "Remembering a partner's small preference.",
        ],
        [
          "Being asked what feeling attractive means to me.",
          "Asking what helps a partner feel attractive on their terms.",
        ],
        [
          "Receiving attention without comparison to someone else.",
          "Keeping attention free from comparisons with other people.",
        ],
        [
          "Having my comfort treated as more important than a visual ideal.",
          "Prioritizing a partner's comfort over a visual expectation.",
        ],
      ],
    ),
  ],
});

export const sensorySensationMap = define({
  slug: "sensory-sensation-play-map",
  title: "Sensory & Sensation Preferences",
  hook: "Separate the sensations you welcome, the ones you would only discuss, and the ones you prefer to avoid.",
  love: "Compare receiving and offering without mistaking curiosity for a green light.",
  contentNote:
    "This is a preference inventory, not a technique or risk guide. It does not provide instructions for hazardous activities.",
  matchingNote:
    "Match receiving and offering within the same sensory topic; a limit always removes the suggestion.",
  next: ["sensory-deprivation-overload", "limits-boundaries-deep-dive"],
  scales: [
    scale(
      "texture",
      "Texture & surface",
      "sensory",
      "These texture variations seem less appealing.",
      "Texture variation appears to be a stronger sensory interest.",
      [
        [
          "Choosing a soft fabric for comfortable contact.",
          "Offering a choice of soft fabric before contact.",
        ],
        [
          "Having a smooth texture introduced gradually.",
          "Introducing a smooth texture only after checking interest.",
        ],
        [
          "Trying a familiar texture in a new, agreed setting.",
          "Offering a familiar texture in a newly agreed setting.",
        ],
        [
          "Having material sensitivities checked in advance.",
          "Asking about material sensitivities before making a plan.",
        ],
        [
          "Being able to remove an unfamiliar texture immediately.",
          "Making an unfamiliar texture easy to remove immediately.",
        ],
      ],
    ),
    scale(
      "temperature",
      "Comfort & temperature",
      "sensory",
      "Temperature variation appears less interesting to you.",
      "You are interested in temperature as a consciously chosen part of the setting.",
      [
        [
          "Having room temperature adjusted before closeness.",
          "Adjusting room temperature before shared time.",
        ],
        [
          "Being offered warmth as a comfort choice.",
          "Offering comfortable warmth when requested.",
        ],
        [
          "Being able to decline a temperature-related idea.",
          "Accepting a decline of a temperature-related idea.",
        ],
        [
          "Having a temperature preference checked again if it changes.",
          "Checking again when a partner's temperature comfort changes.",
        ],
        [
          "Keeping temperature changes mild and familiar.",
          "Keeping agreed temperature changes within familiar comfort.",
        ],
      ],
    ),
    scale(
      "pressure",
      "Pressure & intensity preferences",
      "sensory",
      "You report less interest in these pressure and intensity variations.",
      "Choosing and adjusting intensity appears important to your sensory preferences.",
      [
        [
          "Being asked what degree of pressure feels comfortable.",
          "Asking about comfortable pressure before contact.",
        ],
        [
          "Choosing lighter contact instead of a stronger option.",
          "Offering a lighter-contact option without disappointment.",
        ],
        [
          "Having intensity kept consistent when I request it.",
          "Keeping intensity consistent when requested.",
        ],
        [
          "Discussing a firmer-contact idea without trying it.",
          "Discussing a firmer-contact idea without an expectation to try it.",
        ],
        [
          "Being able to return to a gentler choice immediately.",
          "Returning to a gentler choice immediately when asked.",
        ],
      ],
    ),
    scale(
      "focus",
      "Focused sensory attention",
      "sensory",
      "Deliberate sensory focus appears less appealing to you.",
      "Deliberate attention to a chosen sensation appears appealing.",
      [
        [
          "Focusing on one comfortable sensation at a time.",
          "Offering one comfortable sensation at a time.",
        ],
        [
          "Having the option to keep my eyes open.",
          "Keeping eye closure entirely optional.",
        ],
        [
          "Choosing which sounds remain in the room.",
          "Letting a partner choose which sounds remain.",
        ],
        [
          "Being offered a pause to describe what I notice.",
          "Offering a pause for sensory feedback.",
        ],
        [
          "Knowing I can change the sensory focus.",
          "Welcoming a change of sensory focus.",
        ],
      ],
    ),
    scale(
      "planning",
      "Sensory planning & boundaries",
      "autonomy",
      "You report less interest in extensive sensory planning, without waiving the need for consent.",
      "Explicit sensory planning appears to help you distinguish interest from willingness.",
      [
        [
          "Reviewing a proposed sensory plan beforehand.",
          "Sharing a proposed sensory plan for review.",
        ],
        [
          "Having an unfamiliar device remain off-limits while I learn about it.",
          "Leaving unfamiliar devices unused unless separately agreed.",
        ],
        [
          "Having physical comfort needs checked without assumptions.",
          "Asking about physical comfort without making assumptions.",
        ],
        [
          "Being able to end a sensory activity without explaining why.",
          "Accepting an end to a sensory activity without demanding a reason.",
        ],
        [
          "Having a recovery plan discussed before a new experience.",
          "Discussing comfort and recovery before a new shared experience.",
        ],
      ],
    ),
  ],
});

export const sensoryBoundaries = define({
  slug: "sensory-deprivation-overload",
  title: "Sensory Focus & Overload",
  hook: "How much sensory information helps you feel connected, and when does it become too much?",
  love: "Find a comfortable signal level, with clear distinctions between chosen focus and loss of control.",
  contentNote:
    "No breath restriction, hazardous restraint or loss-of-consciousness instructions are included. This is not medical advice.",
  matchingNote:
    "Pair a person's desired sensory conditions with another person's willingness to maintain them.",
  next: ["sensory-sensation-play-map", "aftercare-recovery-style"],
  scales: [
    scale(
      "visual_focus",
      "Visual focus",
      "sensory",
      "Reducing visual information currently seems less appealing.",
      "Choosing less visual information appears appealing when control remains yours.",
      [
        [
          "Choosing dimmer lighting while remaining able to see.",
          "Offering dimmer lighting with an easy way to change it.",
        ],
        [
          "Deciding whether to close my eyes briefly.",
          "Leaving eye closure entirely to the other person's choice.",
        ],
        [
          "Having a visual-focus idea discussed beforehand.",
          "Discussing a visual-focus idea before proposing it.",
        ],
        [
          "Being able to restore my normal view immediately.",
          "Making a normal view immediately available when wanted.",
        ],
        [
          "Having unfamiliar visual conditions remain a discussion only.",
          "Accepting that unfamiliar visual conditions may stay a discussion.",
        ],
      ],
    ),
    scale(
      "sound_focus",
      "Sound & quiet",
      "sensory",
      "Changing sound levels appears less important to your comfort.",
      "Consciously chosen sound levels appear important to your comfort.",
      [
        [
          "Reducing background sound during closeness.",
          "Reducing background sound when a partner prefers.",
        ],
        [
          "Choosing familiar music rather than unexpected sounds.",
          "Offering familiar music rather than unexpected sounds.",
        ],
        [
          "Keeping spoken communication clearly audible.",
          "Ensuring spoken communication stays clearly audible.",
        ],
        [
          "Being able to remove headphones without assistance.",
          "Keeping headphones optional and independently removable.",
        ],
        [
          "Having sudden sounds excluded from a shared plan.",
          "Excluding sudden sounds when that is the agreement.",
        ],
      ],
    ),
    scale(
      "input_level",
      "Amount of sensory input",
      "sensory",
      "These deliberate changes in sensory input seem less appealing.",
      "The amount of sensory input appears to strongly shape your preferences.",
      [
        [
          "Receiving one kind of attention rather than several at once.",
          "Offering one kind of attention at a time when preferred.",
        ],
        [
          "Having a clear pause between different sensations.",
          "Leaving a clear pause between sensory changes.",
        ],
        [
          "Being asked before adding another source of stimulation.",
          "Asking before adding another source of sensory input.",
        ],
        [
          "Knowing a busy environment can be simplified.",
          "Simplifying a busy environment when requested.",
        ],
        [
          "Returning to a familiar setting when I feel overloaded.",
          "Supporting a return to a familiar setting after overload.",
        ],
      ],
    ),
    scale(
      "control",
      "Access to choice",
      "autonomy",
      "Your answers suggest less interest in elaborate control arrangements, not permission to remove your choice.",
      "Accessible choice appears central when sensory conditions change.",
      [
        [
          "Keeping an easy, spoken way to stop.",
          "Maintaining an easy, spoken way to stop.",
        ],
        [
          "Choosing sensory conditions separately from movement restrictions.",
          "Treating sensory changes and movement restrictions as separate decisions.",
        ],
        [
          "Having a request for normal conditions accepted immediately.",
          "Restoring normal conditions immediately when asked.",
        ],
        [
          "Being able to reject a plan without needing to prove discomfort.",
          "Accepting rejection of a plan without requiring proof of discomfort.",
        ],
        [
          "Having a changed mind treated as sufficient reason to stop.",
          "Treating a changed mind as sufficient reason to stop.",
        ],
      ],
    ),
    scale(
      "settling",
      "Settling afterward",
      "pacing",
      "You report less need for these particular settling routines.",
      "Gentle settling routines appear useful to your preferred experience.",
      [
        [
          "Having ordinary lighting restored gradually when requested.",
          "Restoring ordinary lighting at a partner's preferred pace.",
        ],
        [
          "Being offered quiet company afterward.",
          "Offering quiet company afterward without insisting on conversation.",
        ],
        [
          "Taking time before entering a busy space again.",
          "Allowing time before returning to a busy space.",
        ],
        [
          "Having familiar comfort items available afterward.",
          "Making agreed familiar comfort items available afterward.",
        ],
        [
          "Being asked later whether the sensory setting suited me.",
          "Checking later whether the sensory setting suited the other person.",
        ],
      ],
    ),
  ],
});

export const mapsDiscoveryAssessments = [
  desireRealityMap,
  attractionSensoryCues,
  sensorySensationMap,
  sensoryBoundaries,
];
