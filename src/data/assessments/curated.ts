import type {
  AssessmentDefinition,
  CategoryInterpretation,
  DimensionDefinition,
} from "@/lib/assessment/types";
import { extendedItems } from "./extended-items";

// Each scale has six authored situations, including a reverse-coded item.
// The first three cover everyday behavior, a difficult context and the opposite direction.
interface Scale {
  key: string;
  label: string;
  shortLabel?: string;
  description: string;
  ends: [string, string];
  readings: [string, string, string];
  tradeoff: string;
  experiment: string;
  reflection: string;
  items: [string, string, string, string, string, string];
}
interface Survey {
  slug: string;
  title: string;
  category: AssessmentDefinition["category"];
  description: string;
  merged: string[];
  adult?: boolean;
  scales: Scale[];
}

const personality: Survey = {
  slug: "big-five-personality-profile",
  title: "Personality & Everyday Patterns",
  category: "personality",
  description:
    "Explore how you approach ideas, commitments, social energy, cooperation and stress through concrete everyday situations.",
  merged: ["big-five-personality-profile", "how-others-really-see-you"],
  scales: [
    {
      key: "openness",
      label: "Curiosity & imagination",
      description:
        "Your preference for exploring unfamiliar ideas and experiences, rather than relying on the familiar.",
      ends: ["Familiarity & practicality", "Exploration & imagination"],
      readings: [
        "Your answers favor familiar approaches and practical applications. New ideas may appeal most when their purpose is clear.",
        "You combine curiosity with selectivity. The subject, timing and practical value may determine whether you explore something unfamiliar.",
        "Your answers show a strong appetite for unfamiliar ideas and possibilities. Discovery may matter to you even before it has a practical use.",
      ],
      tradeoff:
        "Exploration can compete with finishing; familiar routines can sometimes close off useful alternatives. Neither end is a measure of intelligence.",
      experiment:
        "Choose one familiar routine and try one different approach. Notice whether the change adds interest, usefulness or unnecessary friction.",
      reflection:
        "When did a new perspective last change a decision you were confident about?",
      items: [
        "I explore an unfamiliar idea even when it has no immediate practical use.",
        "When a trusted method stops working, I enjoy experimenting with a different approach.",
        "!I usually lose interest in a discussion once it becomes abstract or imaginative.",
        "I seek out art, stories or experiences that challenge my usual taste.",
        "I can stay curious about an opinion before deciding whether I agree with it.",
        "I make room for an unplanned discovery even when I already have a familiar option.",
      ],
    },
    {
      key: "conscientiousness",
      label: "Follow-through & structure",
      description:
        "How consistently you plan, track commitments and finish tasks when motivation varies.",
      ends: ["Spontaneous & flexible", "Structured & deliberate"],
      readings: [
        "Your answers suggest a flexible approach to commitments. You may respond well to immediate needs while finding detailed planning harder to sustain.",
        "You use structure selectively. Follow-through may depend on how meaningful the task is and how much else is competing for attention.",
        "Your answers favor planning and dependable follow-through. Clear expectations and visible progress may help you feel settled.",
      ],
      tradeoff:
        "Strong structure can become rigidity; flexibility can become missed commitments. Workload and available support also affect follow-through.",
      experiment:
        "For one commitment, define the next visible action and a realistic deadline. Review what helped rather than judging your character.",
      reflection:
        "Which commitments are easy to keep, and what is different about the ones that slip?",
      items: [
        "I keep track of small commitments instead of relying only on remembering them.",
        "I make a realistic plan before starting a project with several moving parts.",
        "!I often leave a task unfinished once the interesting part is over.",
        "When a deadline is distant, I still make steady progress toward it.",
        "I check important details before treating something as complete.",
        "If my schedule changes, I deliberately renegotiate commitments I can no longer keep.",
      ],
    },
    {
      key: "extraversion",
      label: "Social energy & expression",
      description:
        "How much active social engagement and outward expression tend to energize you.",
      ends: ["Quiet & inwardly focused", "Outgoing & externally energized"],
      readings: [
        "Your answers favor quieter settings and space to think before speaking. Connection may feel best with fewer people and more recovery time.",
        "Your social energy appears selective. Familiarity, group size and the kind of interaction may matter more than simply being with people.",
        "Your answers favor active interaction and outward expression. Conversation and shared activity may help you feel energized and engaged.",
      ],
      tradeoff:
        "Social enthusiasm can fill the space others need; quietness can make interest harder to read. Neither end measures social skill or caring.",
      experiment:
        "Compare your energy after a small conversation, a busy group and time alone. Use the pattern to plan recovery and connection.",
      reflection:
        "Where do you feel free to participate without performing a different level of energy?",
      items: [
        "After time with people I enjoy, I usually feel more energized than depleted.",
        "In a group I do not know well, I am comfortable starting a conversation.",
        "!I usually prefer to observe a lively gathering rather than join its activity.",
        "When something excites me, I naturally express that excitement out loud.",
        "I look forward to plans that involve meeting several people at once.",
        "If I have spent several days alone, I actively seek lively interaction.",
      ],
    },
    {
      key: "agreeableness",
      label: "Cooperation & consideration",
      description:
        "Your tendency to consider other people's needs and seek workable cooperation during differences.",
      ends: ["Direct challenge & independence", "Accommodation & cooperation"],
      readings: [
        "Your answers favor independent judgment and direct challenge. You may be comfortable prioritizing an objective over preserving immediate harmony.",
        "You balance consideration with challenge. Your willingness to accommodate may depend on fairness, trust and the stakes of the situation.",
        "Your answers favor consideration and cooperative solutions. You may readily notice how a decision affects the people involved.",
      ],
      tradeoff:
        "Accommodation can hide an unspoken no; directness can land more sharply than intended. Cooperation works best alongside clear limits.",
      experiment:
        "In one disagreement, state the other person's concern accurately before saying what you still need. Keep both needs visible.",
      reflection:
        "When you agree to keep the peace, are you freely choosing it or expecting resentment later?",
      items: [
        "Before making a shared decision, I consider how it will affect the other people involved.",
        "Even when frustrated, I look for a solution that the other person can reasonably accept.",
        "!When someone's needs slow my plans, I tend to dismiss those needs as their problem.",
        "I can give another person credit even when we are competing for the same opportunity.",
        "I make an effort to understand a mistake before assuming bad intent.",
        "I am willing to make a reasonable adjustment when it helps a group work better together.",
      ],
    },
    {
      key: "stress_sensitivity",
      label: "Sensitivity to stress",
      description:
        "How readily uncertainty, setbacks and tension continue to occupy your attention.",
      ends: ["Less reactive right now", "More sensitive right now"],
      readings: [
        "Your answers suggest that everyday setbacks have relatively little staying power right now. You may recover your sense of steadiness without much additional processing.",
        "Your stress response appears context dependent. Some uncertainty is manageable while particular situations continue to draw your attention.",
        "Your answers suggest that uncertainty and tension stay active in your attention. Predictability, reassurance and recovery time may matter especially right now.",
      ],
      tradeoff:
        "Sensitivity can help you notice problems while also consuming energy. A low score can reflect steadiness, but does not prove that stress is absent.",
      experiment:
        "After one stressful event, separate what happened from what you predict might happen. Identify one practical action and one recovery need.",
      reflection:
        "Which situations keep replaying after they end, and what helps your attention return to the present?",
      items: [
        "A small mistake can stay on my mind long after I have addressed it.",
        "When an important outcome is uncertain, I find it difficult to relax.",
        "!After an ordinary setback, I usually regain my emotional balance quite quickly.",
        "I notice physical tension when several demands arrive at once.",
        "A tense interaction can affect my mood for the rest of the day.",
        "Even when things are going well, I sometimes find myself preparing for what could go wrong.",
      ],
    },
  ],
};

const availability: Survey = {
  slug: "emotional-availability-reflection",
  title: "Emotional Awareness & Availability",
  category: "romance",
  description:
    "Understand how you recognize emotions, let someone know you, stay present and communicate your capacity for connection.",
  merged: [
    "emotional-availability-reflection",
    "emotional-intelligence-self-awareness",
  ],
  scales: [
    {
      key: "awareness",
      shortLabel: "Clarity",
      label: "Emotional clarity",
      description:
        "Recognizing what you feel and distinguishing an emotion from an assumption about its cause.",
      ends: ["Harder to identify feelings", "Clearer emotional awareness"],
      readings: [
        "Your answers suggest that feelings can be difficult to name until they build up. Bodily cues or broad labels may be easier starting points.",
        "You can identify some feelings clearly, while stress or mixed emotions may make the picture less precise.",
        "Your answers show relative ease distinguishing feelings, needs and interpretations. That clarity can make it easier to explain an experience without treating your first explanation as fact.",
      ],
      tradeoff:
        "Being able to describe an emotion does not mean it is fully processed. Difficulty naming it does not make the feeling less valid.",
      experiment:
        "At a calm point, write: 'I notice..., I feel..., I may need...'. Keep the observation separate from your explanation of another person's motives.",
      reflection:
        "What emotion tends to appear underneath the first reaction you show?",
      items: [
        "I can distinguish feeling hurt from feeling angry when both are present.",
        "During a difficult interaction, I can notice what is happening in my body before reacting.",
        "!I often know only that I feel bad, without being able to identify the feeling more precisely.",
        "I can separate what happened from the story I am telling myself about why it happened.",
        "When my mood changes, I can usually identify a need or event connected to the change.",
        "I can revise my first explanation of a feeling when a different explanation fits better.",
      ],
    },
    {
      key: "openness",
      label: "Sharing your inner world",
      shortLabel: "Openness",
      description:
        "Letting a trusted person know your feelings, needs and uncertainty while retaining choice over what you share.",
      ends: ["More private or guarded", "More willing to share"],
      readings: [
        "Your answers favor protecting your inner experience. Sharing may require more trust, preparation or reassurance about how it will be received.",
        "Your openness depends on the situation. You may share some needs readily while keeping more vulnerable feelings private.",
        "Your answers suggest comfort letting a trusted person see your feelings and uncertainty. You may find that naming a need supports connection before resentment grows.",
      ],
      tradeoff:
        "Openness does not require disclosing everything. Privacy can be a healthy choice; it becomes costly when a need remains invisible that you want someone to understand.",
      experiment:
        "Choose one safe, low-stakes feeling and express it with one concrete request. Notice how the person responds before sharing more.",
      reflection:
        "What response makes it easier for you to be honest about a need?",
      items: [
        "With someone who has earned my trust, I can say that something has affected me.",
        "I can ask for comfort without turning the request into a complaint about the other person.",
        "!I hide difficult feelings even from people who have responded kindly in the past.",
        "I can admit uncertainty instead of pretending to know what I want.",
        "I can name a need before frustration builds into resentment.",
        "When someone asks how I am, I can choose an honest answer rather than automatically saying I am fine.",
      ],
    },
    {
      key: "presence",
      label: "Attentive presence",
      shortLabel: "Presence",
      description:
        "Offering attention and curiosity without immediately fixing, dismissing or redirecting another person's experience.",
      ends: ["Attention harder to sustain", "More available attention"],
      readings: [
        "Your answers suggest that emotional conversations can compete with distraction or limited capacity. A shorter, agreed time may support more useful attention.",
        "You can be present in some situations, while intensity or competing demands may draw your attention elsewhere.",
        "Your answers show willingness to give another person's experience sustained attention. You may be comfortable understanding before trying to solve.",
      ],
      tradeoff:
        "Listening indefinitely can exceed your capacity. Presence includes being honest about when you can engage, rather than promising attention you cannot offer.",
      experiment:
        "Ask someone whether they want listening, practical help or both. Put distractions aside for an agreed ten minutes, then check capacity.",
      reflection:
        "What most often pulls you away when someone is trying to connect?",
      items: [
        "During a personal conversation, I deliberately put competing distractions aside.",
        "I can listen to distress without immediately trying to solve the situation.",
        "!While someone shares something important, I often remain mentally occupied with something else.",
        "I ask a follow-up question when I do not yet understand what an experience meant to someone.",
        "I can let a pause happen without filling it with my own experience.",
        "When I am too depleted to listen well, I say so and offer a realistic time to return.",
      ],
    },
    {
      key: "reciprocity",
      label: "Receiving & returning care",
      shortLabel: "Mutual care",
      description:
        "Allowing care to move in both directions while keeping room for different needs and limits.",
      ends: ["Care harder to exchange", "More comfortable mutual care"],
      readings: [
        "Your answers suggest that giving, receiving or balancing care can take effort. Independence, obligation or fear of burdening someone may shape what feels possible.",
        "Mutual care appears easier in some relationships than others. You may be comfortable offering support while still learning how to receive it, or the reverse.",
        "Your answers favor an exchange of care that allows both people to have needs. You may be able to receive support without turning it into an immediate debt.",
      ],
      tradeoff:
        "Reciprocity is not an exact ledger. Temporary imbalance can be reasonable, but a repeated pattern deserves a direct conversation about capacity and expectations.",
      experiment:
        "Accept one small offer of help without minimizing your need or immediately repaying it. Later ask what kind of support the other person values.",
      reflection:
        "Is it easier to offer care or receive it, and what do you fear about the harder direction?",
      items: [
        "I can accept help without feeling I must repay it immediately.",
        "I can make room for another person's needs while still naming my own.",
        "!When someone offers me care, I usually feel uncomfortable enough to push it away.",
        "I ask what kind of support someone wants rather than assuming my preferred kind will fit.",
        "I can tell someone that a form of support is well intended but not helpful to me.",
        "I can tolerate a temporary imbalance in care when we have talked openly about it.",
      ],
    },
    {
      key: "capacity",
      label: "Capacity & emotional pacing",
      shortLabel: "Capacity",
      description:
        "Recognizing your limits and communicating when and how you can stay connected.",
      ends: ["Capacity harder to communicate", "Clearer limits & pacing"],
      readings: [
        "Your answers suggest that emotional limits may become clear only after you are overwhelmed. Connection may feel more manageable with explicit pacing.",
        "You recognize some limits but may communicate them more easily in calm moments than under pressure.",
        "Your answers show awareness of emotional capacity and a willingness to communicate limits. A clear pause and return can help protect connection.",
      ],
      tradeoff:
        "A pause supports connection when it is communicated and followed through. Repeatedly postponing without returning can leave the other person uncertain.",
      experiment:
        "Prepare a phrase for limited capacity: 'I want to hear this. I can give it attention at...'. Offer a time you can actually keep.",
      reflection:
        "What is your earliest sign that you need a pause rather than more effort?",
      items: [
        "I can notice when I am too depleted to have a useful emotional conversation.",
        "If I need a pause, I can explain it without making the other person responsible for my feelings.",
        "!I agree to emotionally demanding conversations even when I know I have no capacity left.",
        "I can suggest a specific time to return to a conversation I cannot handle right now.",
        "I can say no to a request while still showing that the person matters to me.",
        "After taking space, I follow through on the reconnection I offered.",
      ],
    },
  ],
};

const attachment: Survey = {
  slug: "attachment-style-discovery",
  title: "Attachment, Trust & Independence",
  category: "romance",
  description:
    "Examine reassurance, closeness, autonomy, trust and how you respond when a connection feels uncertain.",
  merged: ["attachment-style-discovery"],
  scales: [
    {
      key: "reassurance",
      label: "Need for reassurance",
      description:
        "How strongly uncertainty in a close connection draws you toward checking that the relationship is secure.",
      ends: ["Less reassurance needed", "More reassurance needed"],
      readings: [
        "Your answers suggest relatively little need for repeated confirmation when contact or mood changes. You may be comfortable letting a connection be temporarily uncertain.",
        "Your need for reassurance varies with context. Some changes feel ordinary while others prompt you to check where you stand.",
        "Your answers show a stronger need for clear signs of connection when uncertainty appears. Consistent communication may matter especially to you.",
      ],
      tradeoff:
        "Seeking reassurance can invite support, but repeated checking may provide only brief relief. A low score can also reflect disengagement, so read it alongside closeness and trust.",
      experiment:
        "For one moment of uncertainty, name the specific reassurance you want and ask once, directly. Notice what remains uncertain after the response.",
      reflection:
        "What evidence of connection reassures you for more than a few minutes?",
      items: [
        "When contact becomes less frequent, I wonder whether the other person's feelings have changed.",
        "After a disagreement, I need a clear sign that the relationship is still secure.",
        "!A delayed reply usually feels ordinary to me rather than a sign of rejection.",
        "I find myself checking small changes in tone for clues about where I stand.",
        "Hearing affection expressed clearly helps me settle when I feel uncertain.",
        "If a partner seems distracted, I am likely to worry that I have done something wrong.",
      ],
    },
    {
      key: "closeness",
      label: "Comfort with closeness",
      description:
        "How comfortable you feel being known and allowing emotional dependence in a trusted connection.",
      ends: ["More protective distance", "More comfort with closeness"],
      readings: [
        "Your answers favor some protective distance. Depending on someone or feeling deeply known may require careful pacing.",
        "Closeness seems welcome under some conditions and uncomfortable under others. Control over pace may help you remain engaged.",
        "Your answers suggest comfort with emotional closeness and mutual reliance. Letting someone matter to you may feel compatible with retaining yourself.",
      ],
      tradeoff:
        "Closeness should be chosen and earned. Distance can protect you; it may also prevent a wanted connection when it persists after trust has developed.",
      experiment:
        "Share one manageable concern with a reliable person and make one small request. Evaluate the actual response rather than pushing for more vulnerability.",
      reflection:
        "At what point does closeness begin to feel like pressure instead of connection?",
      items: [
        "I feel comfortable letting a reliable partner know that I need them.",
        "When a relationship becomes more emotionally close, I can stay engaged rather than automatically pulling away.",
        "!Being deeply known by a partner usually makes me want to create distance.",
        "I can accept that a close relationship will make me emotionally affected by another person.",
        "I am comfortable asking a trusted partner for help with something personal.",
        "I can enjoy affection without immediately worrying that it will limit my freedom.",
      ],
    },
    {
      key: "autonomy",
      label: "Independent space",
      description:
        "How much you value separate interests, decisions and time within a committed connection.",
      ends: ["More togetherness preferred", "More independent space preferred"],
      readings: [
        "Your answers favor shared time and joint involvement. Regular togetherness may be an important part of feeling connected.",
        "You appear to value both shared involvement and room to act independently. The right balance may depend on the activity and current demands.",
        "Your answers show a strong preference for independent space within connection. Separate interests and self-directed time may help you feel most like yourself.",
      ],
      tradeoff:
        "Independence and closeness can coexist. Problems arise when separate time is assumed to mean rejection or togetherness is assumed to mean control.",
      experiment:
        "Describe your ideal balance of shared and separate time using an ordinary week. Ask a partner what that same week would feel like to them.",
      reflection:
        "Which parts of your independence help you return to the relationship with more energy?",
      items: [
        "Having regular time for my own interests is important even in a close relationship.",
        "I want to be able to make some everyday decisions without consulting a partner.",
        "!I would prefer a relationship where nearly all free time is spent together.",
        "I am comfortable with a partner maintaining friendships that do not involve me.",
        "A shared commitment feels healthier to me when both people retain a distinct sense of self.",
        "I need room to pursue a personal goal even when a partner does not share that goal.",
      ],
    },
    {
      key: "trust",
      label: "Trust in reliability",
      description:
        "Your willingness to rely on earned patterns of care instead of anticipating hidden rejection.",
      ends: ["More guarded expectations", "More confidence in reliability"],
      readings: [
        "Your answers suggest that relying on a partner can feel uncertain even when there are positive signs. Trust may develop through repeated, concrete follow-through.",
        "You can rely on some signs of care while still watching for inconsistency. Trust may depend strongly on the relationship's recent history.",
        "Your answers suggest an ability to let reliable behavior count as evidence of care. You may not need constant new proof once a pattern is established.",
      ],
      tradeoff:
        "Trust is appropriate when it fits observed behavior. A high score should never require ignoring coercion, deception or repeated broken promises.",
      experiment:
        "Identify one promise that was kept and one concern that remains unresolved. Discuss each separately rather than making a global judgment of trust.",
      reflection:
        "What repeated behavior would make trusting someone a reasonable choice for you?",
      items: [
        "When a partner has consistently followed through, I can rely on that pattern during a temporary absence.",
        "I can believe that someone cares while also accepting that they sometimes need space.",
        "!Even with a reliable partner, I tend to expect that closeness will suddenly be withdrawn.",
        "I can distinguish a genuine change in reliability from a fear based on a past relationship.",
        "When a trusted partner explains a misunderstanding, I can consider their account without needing to investigate every detail.",
        "I can let repeated respectful behavior gradually change an initially guarded expectation.",
      ],
    },
    {
      key: "direct_needs",
      label: "Directness when uncertain",
      description:
        "Communicating attachment needs without testing, disappearing or expecting the other person to guess.",
      ends: ["More indirect protection", "More direct requests"],
      readings: [
        "Your answers suggest that uncertainty can lead to protective or indirect responses. A clear request may feel riskier than testing whether someone notices.",
        "You sometimes communicate needs directly and sometimes protect yourself indirectly. Feeling safe enough to ask may make the difference.",
        "Your answers favor naming relationship needs explicitly. You may be able to ask for reassurance or space without requiring the other person to infer it.",
      ],
      tradeoff:
        "Direct requests support understanding but cannot guarantee the response you want. Someone's inability to meet a request is information, rather than proof your need is wrong.",
      experiment:
        "Replace one test of attention with a specific request such as, 'Can we plan when we will talk next?'. Leave room for an honest answer.",
      reflection:
        "When you withdraw or seek extra contact, what would you most want the other person to understand?",
      items: [
        "If I need reassurance, I can ask for it without pretending I am upset about something else.",
        "When I need space, I explain that need rather than becoming deliberately hard to reach.",
        "!I sometimes test whether someone cares instead of telling them what I need.",
        "I can tell a partner that a change in contact has left me uncertain.",
        "I can hear a partner's request for space and ask what reconnection will look like.",
        "I can say what would help me feel secure without demanding that a partner remove all uncertainty.",
      ],
    },
  ],
};

const affection: Survey = {
  slug: "love-affection-preferences",
  title: "Affection, Care & Connection",
  category: "romance",
  description:
    "Discover which forms of everyday care, appreciation, shared attention and play help you feel connected.",
  merged: [
    "love-affection-preferences",
    "emotional-support-compatibility",
    "what-kind-of-lover-are-you",
    "flirting-attraction-style",
    "romantic-dreams-ideal-dates",
    "what-makes-you-feel-desired",
  ],
  scales: [
    {
      key: "appreciation",
      label: "Spoken appreciation",
      description:
        "How much specific verbal affection and acknowledgment help you feel valued.",
      ends: ["Words less central", "Words especially meaningful"],
      readings: [
        "Your answers suggest that spoken appreciation is less central to how you feel cared for. Actions or shared experiences may speak more clearly to you.",
        "Words matter in some contexts, particularly when they feel specific and consistent with behavior. General praise may carry less weight.",
        "Your answers show that explicit appreciation and affection carry substantial meaning. Hearing what someone values about you may help a connection feel visible.",
      ],
      tradeoff:
        "Frequent praise is not a substitute for reliable treatment. A quieter partner may care deeply while needing a clearer explanation of what words mean to you.",
      experiment:
        "Ask for one kind of specific acknowledgment you value, and offer an example drawn from something the person actually did.",
      reflection:
        "Which words stay with you because they show that someone has paid attention?",
      items: [
        "Specific appreciation makes me feel more cared for than a general compliment.",
        "After a difficult week, hearing what someone values about me helps me feel connected.",
        "!Verbal affection adds very little to my sense of being loved.",
        "I appreciate a partner saying clearly that they are glad to be with me.",
        "When an effort goes unnoticed, a sincere acknowledgment can help me feel seen.",
        "A thoughtful message can make a meaningful difference to my day even when we cannot be together.",
      ],
    },
    {
      key: "shared_attention",
      label: "Undivided time",
      description:
        "The importance of intentional shared attention, ordinary rituals and time without competing distractions.",
      ends: [
        "Shared attention less central",
        "Undivided time especially meaningful",
      ],
      readings: [
        "Your answers suggest that uninterrupted shared time is less central to feeling connected. Parallel activity or practical involvement may be enough much of the time.",
        "You value focused time selectively. Its quality and timing may matter more than having large amounts of it.",
        "Your answers show that deliberate shared attention is an important signal of care. Small rituals without competing distractions may matter more than elaborate plans.",
      ],
      tradeoff:
        "Wanting focused time is different from needing constant access. Discuss what counts as meaningful time so that quantity does not replace attention.",
      experiment:
        "Plan a short, repeatable ritual with phones put away. Afterwards, compare whether it felt connecting and what made the difference.",
      reflection:
        "What makes an ordinary hour together feel different from simply occupying the same room?",
      items: [
        "A short conversation with full attention means more to me than a long evening of distracted company.",
        "I feel disconnected when our time together is repeatedly interrupted by screens or other tasks.",
        "!I rarely need time when a partner's attention is focused specifically on me.",
        "Small shared rituals help me feel that our connection has a place in everyday life.",
        "I value someone making protected time for us during a busy period.",
        "Doing an ordinary activity together can feel intimate when we are both engaged.",
      ],
    },
    {
      key: "practical_care",
      label: "Practical thoughtfulness",
      description:
        "How much considerate actions and remembered details help you recognize care.",
      ends: [
        "Practical help less central",
        "Thoughtful actions especially meaningful",
      ],
      readings: [
        "Your answers suggest that practical help is less central to how you recognize affection. You may prefer another form of connection or want to handle tasks independently.",
        "Thoughtful action matters when it fits your actual needs. Unrequested help may feel different from a useful, well-timed offer.",
        "Your answers show that noticing and easing a real burden is a strong signal of care. Remembered details may make affection feel concrete.",
      ],
      tradeoff:
        "Helpful action can turn into overfunctioning or control if it replaces asking. Receiving care should leave room for your preferences and competence.",
      experiment:
        "Name one practical action that would make a busy day easier. Explain why it matters instead of hoping someone will infer it.",
      reflection:
        "Which small act makes you feel understood, rather than merely assisted?",
      items: [
        "I feel cared for when someone notices a practical burden and asks how they can help.",
        "Remembering a small preference can mean more to me than a grand romantic gesture.",
        "!Practical help rarely affects how emotionally connected I feel to someone.",
        "Following through on an offer of help feels like an expression of affection to me.",
        "I value a partner adapting an act of care to what actually helps me.",
        "Sharing an unglamorous responsibility can make me feel that we are on the same team.",
      ],
    },
    {
      key: "comfort",
      label: "Comfort & emotional support",
      description:
        "The importance of feeling heard and accompanied when you are having a difficult time.",
      ends: ["More self-directed comfort", "More shared emotional comfort"],
      readings: [
        "Your answers favor processing difficulty more independently. Support may feel best when it leaves you space and does not require immediate discussion.",
        "You want emotional comfort in some moments and space in others. Being asked what kind of support fits may be particularly useful.",
        "Your answers show that being heard and emotionally accompanied is a meaningful form of care. Understanding may matter before advice or action.",
      ],
      tradeoff:
        "A partner cannot always offer unlimited emotional processing. Clear requests and several sources of support help keep care sustainable.",
      experiment:
        "Before sharing a difficult experience, ask whether the person has capacity and say whether you want comfort, ideas or quiet company.",
      reflection:
        "What does helpful support sound or look like when you are not ready to solve anything?",
      items: [
        "When I am upset, being understood matters to me before receiving advice.",
        "I feel supported when someone stays kind even when they cannot fix the situation.",
        "!I usually prefer that a partner stay out of my emotional difficulties entirely.",
        "Quiet company can help me feel less alone during a difficult moment.",
        "I value someone checking what kind of support I want rather than choosing it for me.",
        "A partner remembering to ask how I am doing after a difficult event means a lot to me.",
      ],
    },
    {
      key: "playful_connection",
      label: "Play, romance & shared novelty",
      description:
        "How much humor, intentional romance and new shared experiences contribute to your sense of connection.",
      ends: ["Steadiness more central", "Play & novelty especially meaningful"],
      readings: [
        "Your answers favor familiar, steady forms of connection over novelty or deliberate romance. Low-pressure routines may feel especially comfortable.",
        "You value play and romance in the right context, alongside dependable everyday care. Novelty may be welcome without needing to be frequent.",
        "Your answers show that play, flirting and new shared experiences are important sources of connection. Intentional moments can keep a relationship feeling alive to you.",
      ],
      tradeoff:
        "Novelty cannot carry a relationship alone, and familiarity need not mean lack of affection. Compare what feels fun with what feels like pressure to perform.",
      experiment:
        "Each suggest one affordable activity that is slightly outside your usual routine. Choose one you both freely want to try.",
      reflection:
        "What kind of play makes you feel closer, and what kind makes you feel put on the spot?",
      items: [
        "Shared humor helps me reconnect when everyday life has become repetitive.",
        "I enjoy a partner continuing to flirt with me after a relationship becomes familiar.",
        "!Trying something new together rarely adds to my sense of connection.",
        "A date feels romantic to me when it reflects our particular interests rather than a standard formula.",
        "I value making room for playful moments even during a busy week.",
        "Planning an experience we can look forward to together helps me feel connected.",
      ],
    },
  ],
};

const conflict: Survey = {
  slug: "conflict-communication-personality",
  title: "Communication, Conflict & Repair",
  category: "compatibility",
  description:
    "Examine how you raise concerns, listen under pressure, handle intensity and turn an apology into a useful change.",
  merged: [
    "conflict-communication-personality",
    "couples-communication-conflict-matching",
  ],
  scales: [
    {
      key: "direct_communication",
      label: "Clear expression",
      description:
        "Turning a concern into an understandable observation, feeling and request without relying on hints.",
      ends: ["More indirect expression", "More explicit expression"],
      readings: [
        "Your answers suggest that concerns may emerge through hints, accumulated frustration or silence. Preparing a concrete request may make difficult conversations more manageable.",
        "You can express some concerns clearly, while more sensitive issues may be harder to put into words without blame.",
        "Your answers favor specific, direct expression of concerns. You may be able to make a request without treating the other person as the entire problem.",
      ],
      tradeoff:
        "Directness helps when it remains specific and respectful. Clarity does not require immediate disclosure in a situation where speaking is unsafe.",
      experiment:
        "Use one recent example to complete: 'When..., I felt..., and I would like...'. Keep out claims about what the person always does.",
      reflection:
        "What do you hope someone will infer that you have not yet said directly?",
      items: [
        "When something bothers me, I can describe the specific event rather than attack the person's character.",
        "I can make a concrete request even when the subject feels emotionally charged.",
        "!I usually expect a partner to work out what is wrong without my explaining it.",
        "I distinguish what I observed from what I assume the other person intended.",
        "I can raise a small concern before it becomes a list of old grievances.",
        "If I do not yet know what I need, I can say that rather than making an unclear demand.",
      ],
    },
    {
      key: "listening",
      label: "Understanding before rebuttal",
      description:
        "Staying curious about another account while retaining your own perspective.",
      ends: ["More focused on defending", "More focused on understanding"],
      readings: [
        "Your answers suggest that defending your account can take priority during disagreement. It may be hard to listen while preparing a response.",
        "You can hear another perspective in some situations, while personal criticism or high stakes make curiosity harder to maintain.",
        "Your answers favor understanding the other person's account before responding. You may be able to acknowledge an impact without agreeing with every interpretation.",
      ],
      tradeoff:
        "Understanding is not the same as agreeing or accepting unfair treatment. Both people need room to be heard for this to become mutual.",
      experiment:
        "Summarize the concern you heard and ask, 'What have I missed?'. Then explain your own account and request the same space.",
      reflection:
        "What kinds of feedback make you stop being curious and start building a defense?",
      items: [
        "I can summarize a partner's concern in terms they recognize before explaining my response.",
        "When I feel misunderstood, I can still ask a genuine question about the other person's experience.",
        "!During disagreement, I often plan my rebuttal instead of listening to the whole point.",
        "I can acknowledge that an action hurt someone even when hurting them was not my intention.",
        "I can hear feedback about one behavior without treating it as a judgment of everything about me.",
        "If new information changes the situation, I am willing to update my initial position.",
      ],
    },
    {
      key: "regulation",
      label: "Managing intensity",
      description:
        "Recognizing escalation and choosing a pace that supports a useful, nonthreatening conversation.",
      ends: ["Intensity harder to manage", "More deliberate regulation"],
      readings: [
        "Your answers suggest that emotional intensity can outrun your ability to choose a response. Earlier pauses and clearer agreements may help.",
        "You can manage some tension, but certain topics or signs of rejection may make a measured response harder.",
        "Your answers show awareness of escalation and willingness to slow down. You may be able to protect the conversation without denying your feelings.",
      ],
      tradeoff:
        "Appearing calm does not always mean feeling safe or engaged. Regulation should create space to address a concern, rather than suppress it indefinitely.",
      experiment:
        "Identify one early escalation cue and agree on a pause phrase while calm. Pair the pause with a specific plan to return.",
      reflection:
        "What happens just before you raise your voice, shut down or stop hearing the other person?",
      items: [
        "I notice early signs that I am becoming too activated to have a useful conversation.",
        "When I need a break, I can request one before saying something intended to hurt.",
        "!Once I feel criticized, my reaction usually moves faster than my ability to choose it.",
        "I can lower the pace of a disagreement without insisting that the other person stop feeling upset.",
        "I can return to an agreed discussion after taking time to settle.",
        "I can talk about a disagreement without using threats of abandonment to gain an advantage.",
      ],
    },
    {
      key: "accountability",
      label: "Ownership & meaningful apology",
      description:
        "Acknowledging your contribution and connecting an apology with an observable change.",
      ends: ["Ownership more difficult", "More concrete accountability"],
      readings: [
        "Your answers suggest that owning your part can feel threatening or unclear. Separating responsibility for one action from a judgment of your worth may help.",
        "You can take responsibility in some situations, while blame, shame or unresolved disagreement may make the next step less clear.",
        "Your answers favor specific accountability. You may see an apology as the start of repair and look for a change that can actually be noticed.",
      ],
      tradeoff:
        "Owning your part does not mean accepting all blame. Repeated apologies without changed behavior deserve a different conversation about limits and follow-through.",
      experiment:
        "For a recent mistake, name the action, its impact and one realistic change. Ask whether that change addresses what mattered to the other person.",
      reflection:
        "What would show the difference between an apology that ends a conversation and one that repairs something?",
      items: [
        "I can acknowledge my contribution to a problem without first listing the other person's mistakes.",
        "After apologizing, I look for a specific behavior I can change.",
        "!If I did not intend harm, I usually feel that I have nothing to apologize for.",
        "I can explain what I will do differently without promising a change I cannot realistically make.",
        "When the same problem returns, I examine whether my earlier repair actually happened.",
        "I can accept that someone may need time after an apology instead of expecting immediate reassurance.",
      ],
    },
    {
      key: "collaboration",
      label: "Finding a workable agreement",
      description:
        "Turning competing needs into an explicit plan that both people can freely accept and revisit.",
      ends: [
        "Differences harder to negotiate",
        "More collaborative problem solving",
      ],
      readings: [
        "Your answers suggest that differences can feel like a contest or a dead end. Naming the needs beneath each preferred solution may open more options.",
        "You can negotiate some differences, while high-stakes needs may make compromise feel uncertain or unfair.",
        "Your answers favor plans that make both people's needs explicit. You may be willing to test a solution and revise it based on what happens.",
      ],
      tradeoff:
        "Not every difference has a fair midpoint. Consent, safety and fundamental limits should not be negotiated away to achieve an agreement.",
      experiment:
        "Write down each person's need separately from their preferred solution. Try a small, time-limited agreement with a review date.",
      reflection:
        "Which part of this disagreement is a flexible preference, and which part is a genuine limit?",
      items: [
        "I try to understand the need beneath a partner's preferred solution.",
        "When both needs are legitimate, I can propose an experiment rather than insist on a permanent answer immediately.",
        "!A disagreement usually feels resolved to me only when the other person accepts my solution.",
        "I can state what I can offer and what I cannot freely agree to.",
        "I am willing to revisit an agreement when its real effects differ from what we expected.",
        "At the end of a difficult conversation, I try to make the next step clear to both of us.",
      ],
    },
  ],
};

const values: Survey = {
  slug: "relationship-dealbreakers-boundaries",
  title: "Relationship Values & Boundaries",
  category: "compatibility",
  description:
    "Bring partner priorities, dating discernment and long-term expectations into one profile of what matters and what needs discussion.",
  merged: [
    "relationship-dealbreakers-boundaries",
    "ideal-partner-blueprint",
    "dating-red-green-flags",
    "your-hidden-relationship-priorities",
    "long-term-relationship-compatibility",
    "couples-bucket-list-matcher",
  ],
  scales: [
    {
      key: "reliability",
      label: "Reliability & consistency",
      description:
        "The importance you place on predictable follow-through and consistency between words and behavior.",
      ends: [
        "More tolerance for variability",
        "Consistency especially important",
      ],
      readings: [
        "Your answers allow more variation in plans and follow-through. Spontaneity or context may matter more than predictability to you.",
        "You value reliability while allowing some flexibility. The importance of a promise and the explanation for a change may affect your response.",
        "Your answers show that consistent behavior is a central relationship priority. Small kept promises may matter more than strong declarations.",
      ],
      tradeoff:
        "Expecting consistency is reasonable, but perfection is not possible. Distinguish a communicated change from a repeated pattern of disregard.",
      experiment:
        "Choose one recurring commitment and agree on what counts as keeping it, changing it responsibly and repairing a miss.",
      reflection:
        "Which inconsistency is an inconvenience, and which one changes whether you can rely on someone?",
      items: [
        "A partner's follow-through on small promises strongly affects whether I trust the relationship.",
        "I would find repeated last-minute changes difficult even if the time we spend together is enjoyable.",
        "!I am comfortable with a relationship where plans and commitments remain loose most of the time.",
        "I value someone communicating a change early more than offering an impressive excuse afterward.",
        "Consistency between private and public behavior is important in the partner I choose.",
        "When deciding whether to deepen a relationship, I look at repeated behavior rather than initial intensity.",
      ],
    },
    {
      key: "autonomy_privacy",
      label: "Autonomy & privacy",
      description:
        "The importance of personal choice, private space and freedom from monitoring within a relationship.",
      ends: [
        "More shared access preferred",
        "Personal autonomy especially important",
      ],
      readings: [
        "Your answers favor more shared access and involvement. It may be useful to distinguish access freely offered from access expected as proof of trust.",
        "You value privacy in some areas and shared involvement in others. Explicit agreements may fit better than assuming one rule covers everything.",
        "Your answers show that independent choice and privacy are important relationship values. You may need clear boundaries around access, time and personal decisions.",
      ],
      tradeoff:
        "Privacy and secrecy are not identical. Mutual transparency about commitments can coexist with personal boundaries; pressure or monitoring should not be treated as proof of love.",
      experiment:
        "Discuss one concrete privacy expectation, such as device access or separate friendships. Specify what is freely shared and what remains a choice.",
      reflection:
        "What would make sharing feel voluntary rather than like a test of loyalty?",
      items: [
        "I want a relationship where personal device access is a choice rather than an expectation.",
        "I would be uncomfortable with a partner treating my separate friendships as evidence of disloyalty.",
        "!I prefer a relationship where each partner is expected to share nearly every private detail.",
        "I need to be able to decline a request without being pressured to prove my love.",
        "I value agreements that leave each person room to make ordinary independent decisions.",
        "A partner respecting a boundary matters more to me than their saying the boundary should not be necessary.",
      ],
    },
    {
      key: "future_alignment",
      label: "Clarity about the future",
      description:
        "How important explicit agreement on commitment, family and major life direction is to you.",
      ends: [
        "More open-ended future preferred",
        "Early clarity especially important",
      ],
      readings: [
        "Your answers favor allowing the future to emerge without settling every major expectation early. Flexibility may feel more valuable than a defined path.",
        "You want clarity on some major topics while leaving others open. Timing and the maturity of the relationship may shape what needs discussion.",
        "Your answers show that explicit long-term alignment matters to you. Unspoken assumptions about commitment, family or location may feel difficult to leave unresolved.",
      ],
      tradeoff:
        "Early clarity cannot guarantee that needs will never change. Agreement is more useful when people can revisit it honestly instead of feeling trapped by an old answer.",
      experiment:
        "Choose one future topic and discuss what each person wants, what is uncertain and what would genuinely be incompatible.",
      reflection:
        "Which future expectation would you regret leaving unspoken until much later?",
      items: [
        "Before making a major commitment, I want us to discuss what that commitment means to each of us.",
        "Different expectations about children or family life would be important for me to address directly.",
        "!I am comfortable deepening a relationship without discussing our long-term direction.",
        "I want to understand how a partner imagines balancing location, career and shared life.",
        "It matters to me that we can revisit future plans when our circumstances change.",
        "I would rather hear an honest uncertainty about commitment than a reassuring answer the person does not mean.",
      ],
    },
    {
      key: "shared_responsibility",
      label: "Shared responsibility",
      description:
        "The importance of explicit, fair agreements about money, household work and the mental load of shared life.",
      ends: [
        "More informal arrangements preferred",
        "Explicit fairness especially important",
      ],
      readings: [
        "Your answers favor more informal arrangements around shared responsibilities. You may be comfortable letting roles emerge without detailed agreements.",
        "You value fairness while allowing roles to vary. Visibility and appreciation may matter as much as an exact division of tasks.",
        "Your answers show that clear responsibility and a fair mental load are important. You may want the work of noticing and organizing to count alongside visible tasks.",
      ],
      tradeoff:
        "Fairness need not mean an identical split at every moment. An informal arrangement becomes a problem when one person cannot freely question or change it.",
      experiment:
        "List both visible tasks and the work of remembering, planning and checking. Agree on ownership of one responsibility from start to finish.",
      reflection:
        "Which invisible responsibility would you most want a partner to notice and share?",
      items: [
        "I want us to discuss who carries the work of noticing and organizing household responsibilities.",
        "Before combining finances, I need a clear conversation about spending, saving and debt.",
        "!I am comfortable leaving the division of shared responsibilities mostly unspoken.",
        "I value a partner taking full ownership of a task rather than waiting for instructions each time.",
        "I want an arrangement that we can both question without being accused of keeping score.",
        "Differences in income or available time should be discussed when deciding what a fair contribution looks like.",
      ],
    },
    {
      key: "growth",
      label: "Growth & shared exploration",
      description:
        "How strongly you value learning, new experiences and room for both partners to change.",
      ends: [
        "Continuity especially important",
        "Growth & exploration especially important",
      ],
      readings: [
        "Your answers favor continuity and a familiar shared rhythm. A stable way of life may be more appealing than frequent change or exploration.",
        "You value some growth and exploration alongside a dependable foundation. Changes may need a clear purpose or shared pace.",
        "Your answers show that learning and new experiences are important relationship priorities. You may want a partnership that leaves room for evolving interests and ambitions.",
      ],
      tradeoff:
        "Growth should not require constant self-improvement or agreement on every new interest. Continuity can be nourishing when it remains a choice.",
      experiment:
        "Compare one experience you each want to try and one routine you each want to protect. Make room for both in a realistic plan.",
      reflection:
        "What kind of change would feel exciting, and what kind would threaten something you value?",
      items: [
        "I want a relationship where we stay curious about how each other's interests change.",
        "Making room for a meaningful personal goal matters to me even when it changes a familiar routine.",
        "!I would prefer our shared life to remain largely the same rather than regularly explore new possibilities.",
        "Trying an unfamiliar activity together is something I want in a long-term partnership.",
        "I value a partner who can discuss a changed ambition without treating it as a betrayal of the original plan.",
        "I want us to make some deliberate choices about the experiences we hope to share.",
      ],
    },
  ],
};

const intimacy: Survey = {
  slug: "intimacy-partner-preferences",
  title: "Desire, Intimacy & Aftercare",
  category: "sexuality-intimacy",
  adult: true,
  description:
    "Explore how desire emerges, what pace feels inviting and how communication and care shape your experience of intimacy.",
  merged: [
    "intimacy-partner-preferences",
    "sexual-chemistry-compatibility",
    "desire-frequency-initiation",
    "sensuality-physical-affection",
    "intimacy-communication-aftercare",
  ],
  scales: [
    {
      key: "spontaneous_desire",
      label: "Spontaneous desire",
      description:
        "How often interest in intimacy appears before an inviting context or deliberate connection has developed.",
      ends: ["Desire more context dependent", "Desire more spontaneous"],
      readings: [
        "Your answers suggest that interest often needs an inviting context before it appears. Not wanting intimacy in advance need not mean that enjoyable desire cannot develop.",
        "Your desire appears spontaneous in some situations and responsive to context in others. Stress, familiarity and timing may change the balance.",
        "Your answers suggest that desire often appears on its own. You may notice interest before any deliberate build-up or invitation.",
      ],
      tradeoff:
        "Spontaneous desire is not a measure of attraction, health or willingness to act. A mismatch in timing is something to discuss, not evidence that someone owes intimacy.",
      experiment:
        "Notice a few occasions when interest appears: what came first, the desire or an inviting context? Share the pattern without setting a frequency target.",
      reflection:
        "When you feel desire, what makes acting on it freely appealing rather than expected?",
      items: [
        "Interest in intimacy often appears for me before any deliberate romantic build-up.",
        "Even during an ordinary day, I sometimes feel an unprompted wish for intimate connection.",
        "!I rarely notice desire until a comfortable, inviting context has already developed.",
        "I sometimes want to initiate closeness without needing a specific occasion or cue.",
        "My interest can appear even when I was initially focused on something unrelated.",
        "I can recognize a desire for intimacy before a partner has expressed interest.",
      ],
    },
    {
      key: "responsive_context",
      label: "Context & emotional readiness",
      description:
        "How much comfort, connection and freedom from pressure influence whether desire can emerge.",
      ends: ["Context less central", "Context especially influential"],
      readings: [
        "Your answers suggest that desire is less dependent on a particular emotional setting. Interest may remain available across a wider range of ordinary contexts.",
        "Context matters to some extent, with particular stressors or forms of connection making a noticeable difference.",
        "Your answers show that the surrounding context has a strong influence on desire. Emotional connection, a manageable pace and an easy way to decline may help interest emerge.",
      ],
      tradeoff:
        "An inviting context never creates an obligation. Interest can change after an activity begins, and a freely chosen stop remains valid.",
      experiment:
        "Describe the conditions that make an invitation feel easy to accept or decline. Keep the conversation separate from trying to initiate anything.",
      reflection:
        "What helps you become curious about closeness without making you feel expected to continue?",
      items: [
        "Feeling emotionally connected makes a noticeable difference to whether desire can emerge for me.",
        "When I know I can stop without disappointing someone, it is easier for me to notice what I want.",
        "!The emotional setting has very little influence on my interest in intimacy.",
        "Unresolved tension can make it difficult for me to feel interested even when I am attracted to someone.",
        "Enough time to transition out of practical responsibilities helps me feel more available for intimacy.",
        "An invitation feels more appealing when it leaves room for my interest to develop rather than requiring an immediate yes.",
      ],
    },
    {
      key: "sensory_pacing",
      label: "Sensuality & unhurried touch",
      description:
        "How much gradual, non-goal-directed touch and sensory attention contribute to intimacy you enjoy.",
      ends: [
        "Less gradual build-up preferred",
        "Unhurried sensuality preferred",
      ],
      readings: [
        "Your answers suggest that extended sensory build-up is less central to what you enjoy. A more direct pace may feel comfortable when mutually wanted.",
        "You enjoy some sensory build-up, with mood and context affecting how much time or attention feels right.",
        "Your answers favor unhurried touch and sensory attention. Space to notice and respond may be an important part of what makes intimacy enjoyable.",
      ],
      tradeoff:
        "Slow is not inherently more caring, and direct is not inherently less attentive. The useful pace is one that both people can freely influence.",
      experiment:
        "Talk about one form of nonsexual affection you enjoy and one pacing cue you want a partner to notice. Agree that no further activity is implied.",
      reflection:
        "What helps touch feel like shared attention rather than a step toward a predetermined goal?",
      items: [
        "I enjoy affectionate touch that is not expected to lead anywhere else.",
        "Having time to notice sensations is important to my enjoyment of intimacy.",
        "!A slow build-up usually adds little to an intimate experience I already want.",
        "I appreciate a partner adjusting pace in response to small cues rather than following a fixed sequence.",
        "Sensory details such as comfort, warmth or atmosphere can strongly affect my enjoyment.",
        "I enjoy moments of closeness where neither person needs to move toward a particular outcome.",
      ],
    },
    {
      key: "preference_communication",
      label: "Expressing intimate preferences",
      description:
        "How comfortable you are naming what you want, changing your mind and asking rather than assuming.",
      ends: [
        "Preferences harder to voice",
        "Preferences more openly discussed",
      ],
      readings: [
        "Your answers suggest that discussing preferences can feel awkward or risky. A calm conversation outside an intimate moment may be a more comfortable starting point.",
        "You can discuss some preferences, while uncertainty, new experiences or fear of disappointing someone may make other conversations harder.",
        "Your answers show comfort communicating preferences and changes. You may be able to treat an adjustment as useful information rather than rejection.",
      ],
      tradeoff:
        "Confidence in talking is not a substitute for listening or consent. A clear preference describes what you want; it does not obligate another person to provide it.",
      experiment:
        "Outside an intimate moment, each name something you enjoy, something you do not want and a comfortable way to request a change.",
      reflection:
        "What makes it easier for you to say 'different', 'slower' or 'stop' without needing to justify yourself?",
      items: [
        "I can describe something I enjoy without expecting a partner to guess it.",
        "I can change my mind during closeness and communicate that change.",
        "!I usually keep a preference to myself because mentioning it might disappoint a partner.",
        "I can ask what a partner wants without treating a different answer as criticism of me.",
        "I can receive a request to change pace without making the other person manage my disappointment.",
        "I am comfortable discussing an intimate mismatch at a time when neither of us is trying to initiate anything.",
      ],
    },
    {
      key: "aftercare",
      label: "Reconnection & aftercare",
      description:
        "The importance of intentional care, comfort and communication after an intimate experience.",
      ends: ["Less reconnection needed", "Deliberate aftercare valued"],
      readings: [
        "Your answers suggest that you often prefer a simple transition or independent space afterward. You may need less explicit reconnection to feel settled.",
        "Your aftercare needs vary with the experience and your emotional state. A brief check-in may help you choose what fits.",
        "Your answers show that deliberate reconnection and care after intimacy are meaningful. Knowing what follows may help an experience feel complete and emotionally comfortable.",
      ],
      tradeoff:
        "Aftercare does not need to follow a formula. Quiet space, conversation and practical comfort can all be valid when people agree on what they mean.",
      experiment:
        "Discuss what each of you tends to want afterward, including the possibility of space. Agree on a simple check-in and room to revise it.",
      reflection:
        "What helps you feel settled afterward, and have you made that need visible to a partner?",
      items: [
        "A short check-in after intimacy helps me feel that the experience was shared rather than merely completed.",
        "I appreciate knowing in advance how we will reconnect or transition afterward.",
        "!I rarely want any deliberate emotional or practical care after intimacy.",
        "Affection, water, quiet or conversation afterward can make a meaningful difference to how I feel.",
        "I value being able to mention an unexpected feeling afterward without it being treated as a complaint.",
        "After an unfamiliar experience, I want room to discuss what I would repeat or change.",
      ],
    },
  ],
};

const exploration: Survey = {
  slug: "sexual-interests-curiosity-map",
  title: "Exploration, Fantasy & Comfort",
  category: "sexuality-intimacy",
  adult: true,
  description:
    "Separate imagination from real-world interest, explore preferred forms of novelty and make your conditions for a comfortable conversation clearer.",
  merged: [
    "sexual-interests-curiosity-map",
    "private-fantasy-matcher",
    "kink-exploration-map",
  ],
  scales: [
    {
      key: "novelty",
      label: "Interest in novelty",
      description:
        "Your interest in freely chosen changes to a familiar intimate routine.",
      ends: ["Familiarity preferred", "Novelty more appealing"],
      readings: [
        "Your answers favor familiar experiences and an established rhythm. Enjoyment does not need novelty to be meaningful.",
        "You are selectively curious about novelty. The particular change and the conditions around it may matter more than novelty itself.",
        "Your answers show an appetite for discussing new possibilities. Variety may add interest when the choice and pace remain yours.",
      ],
      tradeoff:
        "Curiosity is neither consent nor a commitment to try something. Repeating a familiar experience can be just as freely chosen as exploring a new one.",
      experiment:
        "Name one small change you might enjoy discussing and the conditions that would make the discussion pressure-free. No trial is required.",
      reflection:
        "What makes a new possibility appealing in itself rather than something you feel expected to want?",
      items: [
        "I enjoy discussing a small change to a familiar intimate routine.",
        "An unfamiliar possibility can appeal to me when there is no expectation that I will try it.",
        "!I usually prefer to keep intimate experiences familiar rather than introduce novelty.",
        "I am interested in learning what I might enjoy beyond what I already know.",
        "I can be curious about a new experience without needing it to become a regular part of my life.",
        "Variety can add enjoyment for me even when I am already satisfied with familiar experiences.",
      ],
    },
    {
      key: "imagination",
      label: "Fantasy & imagination",
      description:
        "How much an imagined scenario interests you independently of any wish to enact it.",
      ends: ["Imagination less central", "Imaginative exploration valued"],
      readings: [
        "Your answers suggest that fantasy is less central to your interest. Concrete, familiar experiences may be more meaningful to you.",
        "Imagination appeals in some contexts. You may enjoy certain ideas privately without wanting a large role for fantasy in shared experiences.",
        "Your answers show that imagination can be an enjoyable space in its own right. An imagined scenario may interest you without expressing a real-world wish.",
      ],
      tradeoff:
        "A fantasy score cannot identify a specific interest or give anyone permission to enact it. Sharing an idea should not remove your control over what happens next.",
      experiment:
        "If you choose to discuss an imagined idea, first agree whether you want only conversation. You may keep any idea private without explanation.",
      reflection:
        "Which parts of imagination do you enjoy because they remain imaginary?",
      items: [
        "An imagined scenario can interest me even when I would not want it to happen in real life.",
        "I can enjoy private fantasy without feeling that it must become a plan.",
        "!Imagination plays very little part in what I find interesting about intimacy.",
        "Stories or imagined settings can add interest without needing to change my real-world boundaries.",
        "I can distinguish enjoying an idea from wanting a partner to act on it.",
        "I would value a conversation where an imagined possibility could remain only a conversation.",
      ],
    },
    {
      key: "sensory_exploration",
      label: "Sensory exploration",
      description:
        "Your interest in varying sensory conditions such as atmosphere, pace and attention.",
      ends: ["Established sensory preferences", "Sensory variation appealing"],
      readings: [
        "Your answers favor known sensory preferences. Familiar surroundings and sensations may make it easier to enjoy an experience.",
        "You are open to some sensory variation when it fits your comfort and mood. Small changes may be more appealing than a dramatic shift.",
        "Your answers suggest interest in how atmosphere, attention and sensory variation can change an experience. Exploring details may be part of the appeal.",
      ],
      tradeoff:
        "A preference for sensory exploration says nothing about tolerance for discomfort or specific activities. Conditions and individual limits still need explicit discussion.",
      experiment:
        "Consider one comfortable, reversible change to atmosphere or pace. Decide what you would want to remain familiar and how to stop the experiment.",
      reflection:
        "Which sensory details invite you to pay attention, and which distract or overwhelm you?",
      items: [
        "I am curious about how changing the atmosphere can change my experience of closeness.",
        "Trying a different comfortable pace can be appealing when I remain able to influence it.",
        "!I prefer sensory details to remain predictable rather than experimenting with variations.",
        "I enjoy paying deliberate attention to a familiar sensation in a new way.",
        "A small change in setting can make an otherwise familiar experience feel interesting to me.",
        "I like being able to explore sensory preferences gradually instead of choosing a fixed label for them.",
      ],
    },
    {
      key: "role_imagination",
      label: "Playful roles & scenarios",
      description:
        "Your interest in freely chosen pretend roles or scenarios, separate from your everyday identity.",
      ends: ["Everyday roles preferred", "Playful scenarios appealing"],
      readings: [
        "Your answers favor staying close to your everyday self during intimacy. Pretend roles may add little or feel distracting.",
        "Some playful scenarios may appeal while others feel awkward. The tone, trust and freedom to stop may shape your interest.",
        "Your answers suggest interest in playful roles or imagined scenarios. A chosen frame may offer a way to explore expression without defining your everyday identity.",
      ],
      tradeoff:
        "Interest in a role does not authorize a partner to impose it or carry it outside an agreed context. Either person can stop even after initially agreeing.",
      experiment:
        "If relevant, discuss the tone of a hypothetical scenario and what would stay off-limits. Keep the conversation separate from an agreement to enact it.",
      reflection:
        "What would let a playful role feel like free expression rather than an expectation you must meet?",
      items: [
        "A playful imagined scenario can appeal to me without describing who I am in everyday life.",
        "I can imagine enjoying a different role when its limits are clearly agreed.",
        "!Pretend roles usually distract from rather than add to my interest in intimacy.",
        "I am curious about how a chosen scenario might make familiar interaction feel different.",
        "I would want room to laugh, pause or change a scenario instead of having to perform it perfectly.",
        "The idea of a role interests me more when it remains separate from assumptions about my real-life personality.",
      ],
    },
    {
      key: "boundary_clarity",
      label: "Conditions & boundary clarity",
      description:
        "How clearly you can distinguish a yes, a maybe and a no while discussing unfamiliar possibilities.",
      ends: ["Limits harder to communicate", "Conditions more explicit"],
      readings: [
        "Your answers suggest that uncertainty or concern about disappointing someone can make limits hard to express. A private pause before discussing preferences may help.",
        "You can express some limits clearly while unfamiliar situations may leave you uncertain. 'Not sure' can be a complete answer.",
        "Your answers show a willingness to state conditions and preserve your choice. You may be able to remain curious without letting curiosity be treated as permission.",
      ],
      tradeoff:
        "Being articulate about limits does not guarantee they will be respected. Another person's reaction to a no matters more than a survey score about communication.",
      experiment:
        "Practice three separate responses: 'I want to discuss it', 'I am not sure' and 'I do not want that'. None should require persuading someone that your limit is valid.",
      reflection:
        "Can you express uncertainty without the other person treating it as a yes to be negotiated?",
      items: [
        "I can say that a topic is interesting to discuss without agreeing to try anything.",
        "If I am uncertain, I can ask for time rather than choose an answer to please someone.",
        "!I sometimes go along with an idea because explaining my hesitation feels harder than agreeing.",
        "I can make a boundary clear without presenting it as a temporary obstacle for a partner to overcome.",
        "I can revise an earlier yes when I notice that an experience no longer feels right.",
        "Before exploring something unfamiliar, I want us to understand how either person can stop without pressure.",
      ],
    },
  ],
};

const power: Survey = {
  slug: "bdsm-power-dynamics-test",
  title: "Initiative, Roles & Negotiated Dynamics",
  category: "sexuality-intimacy",
  adult: true,
  description:
    "Understand your interest in leading, following or changing roles, alongside the agreements that make chosen dynamics comfortable.",
  merged: ["bdsm-power-dynamics-test", "dominance-submission-initiative"],
  scales: [
    {
      key: "guiding",
      label: "Taking the lead",
      description:
        "Your enjoyment of initiating and guiding a mutually chosen interaction.",
      ends: ["Less interest in leading", "More interest in leading"],
      readings: [
        "Your answers suggest less interest in directing an intimate interaction. You may prefer following, sharing decisions or allowing things to unfold without a lead role.",
        "You enjoy leading selectively, depending on trust, mood or the kind of interaction. A fixed role may not describe you well.",
        "Your answers suggest that initiating and guiding can be enjoyable. You may value actively shaping an experience while staying responsive to the other person's choices.",
      ],
      tradeoff:
        "Leading is a role someone freely shares with you, not authority over their consent. Confidence in directing does not establish skill or permission.",
      experiment:
        "Discuss one low-stakes interaction where you might lead and what choices the other person wants to retain. Include an easy way to redirect you.",
      reflection:
        "What do you enjoy about leading, whether initiative, attentiveness, structure, or expression?",
      items: [
        "I enjoy initiating a mutually wanted intimate interaction.",
        "When preferences have been discussed, I like helping guide the pace.",
        "!Being responsible for directing an intimate interaction usually reduces my enjoyment.",
        "I find it appealing to plan an experience around what we have both said we want.",
        "I can enjoy taking the lead without needing every suggestion to be accepted.",
        "I like actively shaping an interaction while remaining responsive to changes in the other person's interest.",
      ],
    },
    {
      key: "following",
      label: "Choosing to follow",
      description:
        "Your enjoyment of letting a trusted person guide within limits you have freely agreed.",
      ends: ["Less interest in following", "More interest in following"],
      readings: [
        "Your answers suggest less interest in giving someone else the lead. Shared direction or retaining more moment-to-moment control may feel better.",
        "Following appeals in some situations when trust and clear limits are present. The person and context may matter more than the role itself.",
        "Your answers suggest that freely choosing to follow can be enjoyable. Being able to rely on agreed limits may create room to relax into an experience.",
      ],
      tradeoff:
        "Following does not remove your right to change your mind. Enjoying a receptive role says nothing about your competence or independence outside that context.",
      experiment:
        "Describe what you would want to know before letting someone guide. Separate comfort with the person from interest in the role.",
      reflection:
        "What would help you retain a clear sense of choice while following someone else's lead?",
      items: [
        "I can enjoy letting a trusted person guide an experience within clearly agreed limits.",
        "Not having to direct every moment can help me relax when I freely want the interaction.",
        "!I usually need to retain the lead to enjoy an intimate interaction.",
        "I find a receptive role appealing when I know my feedback will be taken seriously.",
        "I can enjoy following without wanting that role to define the rest of the relationship.",
        "Choosing to let someone else lead can feel different to me from being expected to comply.",
      ],
    },
    {
      key: "role_flexibility",
      label: "Flexibility between roles",
      description:
        "Your preference for changing who guides rather than maintaining one stable role.",
      ends: ["A stable role preferred", "More role flexibility preferred"],
      readings: [
        "Your answers favor a relatively stable role or shared pattern. Familiarity with who guides may feel more comfortable than frequent changes.",
        "Some flexibility appeals, with context determining whether a stable or changing role feels better.",
        "Your answers show interest in changing roles. Different moods or situations may bring out a wish to guide, follow or share direction.",
      ],
      tradeoff:
        "Flexibility does not mean being available for every role at every time. A stable preference is equally valid when it remains freely chosen.",
      experiment:
        "Compare one context where you might enjoy guiding with another where you might prefer following or sharing the lead. Treat each as a separate choice.",
      reflection:
        "Which role feels appealing now, and which assumptions would you want a partner to avoid making from that?",
      items: [
        "I can imagine enjoying different roles on different occasions.",
        "Who guides an interaction can change for me with mood and context.",
        "!I prefer us to keep the same roles rather than alternate who takes the lead.",
        "I like having room to share direction instead of choosing one permanent role.",
        "An earlier preference for leading or following does not necessarily describe what I want next time.",
        "I would value a partner asking about my current preference rather than assuming a familiar role still fits.",
      ],
    },
    {
      key: "structure",
      label: "Interest in explicit structure",
      description:
        "How much deliberately negotiated roles, cues and rituals appeal to you compared with an informal dynamic.",
      ends: ["Informal interaction preferred", "Explicit structure appealing"],
      readings: [
        "Your answers favor a relatively informal dynamic. You may prefer straightforward choices without adding a deliberate role framework.",
        "Some explicit structure appeals when it has a clear purpose, while too much formality may feel distracting.",
        "Your answers suggest that a chosen structure can add interest or comfort. Agreed cues and roles may help you understand the shared frame.",
      ],
      tradeoff:
        "Structure is optional and never replaces ongoing consent. A role agreement should not be used to pressure someone into continuing or expanding an activity.",
      experiment:
        "If structure appeals, describe one simple cue or ritual you might enjoy discussing. State what it would mean and where its meaning would stop.",
      reflection:
        "Does a chosen structure help you express yourself, feel secure, create play or something else?",
      items: [
        "A clearly negotiated role can add interest to an interaction I already want.",
        "I find it appealing to discuss what a chosen cue or ritual would mean before using it.",
        "!Adding explicit roles or rituals usually makes an intimate interaction less appealing to me.",
        "I appreciate distinguishing an agreed dynamic from our ordinary way of treating one another.",
        "A chosen framework can help me relax when I understand its limits.",
        "I can imagine enjoying a simple agreed ritual without wanting an elaborate or permanent role arrangement.",
      ],
    },
    {
      key: "checkins",
      label: "Negotiation & check-ins",
      description:
        "Your reported willingness to make limits explicit, respond to feedback and revisit a dynamic after the experience.",
      ends: ["Check-ins harder to initiate", "More explicit ongoing check-ins"],
      readings: [
        "Your answers suggest that explicit negotiation or check-ins may feel awkward. It may help to start with clear language outside any active dynamic.",
        "You use some explicit check-ins while leaving other expectations implicit. Clarifying the uncertain parts may make choices easier to communicate.",
        "Your answers favor explicit negotiation and ongoing feedback. You may see a changed preference as information to respect rather than a role someone has failed to fulfill.",
      ],
      tradeoff:
        "A high self-report score does not demonstrate safe practice or replace learning about specific activities. Anyone's uncertainty or stop remains decisive.",
      experiment:
        "Before any chosen dynamic, discuss what is in bounds, what is out and how to stop. Afterwards, ask what should stay the same or change.",
      reflection:
        "How would you respond if a partner stopped an interaction you had both been looking forward to?",
      items: [
        "I want limits discussed explicitly before trying a new role or dynamic.",
        "I can hear a change of mind without treating it as a failure to follow an agreed role.",
        "!Once we have agreed on a role, I tend to assume the same limits apply without checking again.",
        "I am willing to pause if I am unsure whether the other person is still freely engaged.",
        "I want a clear way for either person to stop that does not depend on staying in character.",
        "After an unfamiliar dynamic, I make room to discuss what each person would want to change.",
      ],
    },
  ],
};

const surveys: Survey[] = [
  personality,
  availability,
  attachment,
  affection,
  conflict,
  values,
  intimacy,
  exploration,
  power,
];

export const assessmentConsolidations = surveys.map(
  ({ slug, title, merged }) => ({ slug, title, previousSlugs: merged }),
);
export const consolidatedSlugRedirects: Record<string, string> =
  Object.fromEntries(
    surveys.flatMap((s) =>
      s.merged.filter((old) => old !== s.slug).map((old) => [old, s.slug]),
    ),
  );
// The prediction and voting games remain in the archive; they are not personality measures.
consolidatedSlugRedirects["how-well-do-you-know-your-partner"] =
  "relationship-dealbreakers-boundaries";
consolidatedSlugRedirects["who-is-more-likely-to"] =
  "love-affection-preferences";

// Combined niche and kink tests (reduced to <= 20 core tests):
consolidatedSlugRedirects["orgasm-pacing-control"] = "bdsm-power-dynamics-test";
consolidatedSlugRedirects["power-exchange-intensity"] = "bdsm-power-dynamics-test";
consolidatedSlugRedirects["adult-caregiving-comfort"] = "bdsm-power-dynamics-test";
consolidatedSlugRedirects["financial-gifting-boundaries"] = "bdsm-power-dynamics-test";

consolidatedSlugRedirects["curiosity-exploration-speed"] = "sexual-interests-curiosity-map";
consolidatedSlugRedirects["kink-compatibility-stress-test"] = "sexual-interests-curiosity-map";

consolidatedSlugRedirects["sensory-sensation-play-map"] = "toys-tools-gear-preferences";
consolidatedSlugRedirects["sensory-deprivation-overload"] = "toys-tools-gear-preferences";

consolidatedSlugRedirects["service-devotion-profile"] = "intimacy-partner-preferences";
consolidatedSlugRedirects["aftercare-recovery-style"] = "intimacy-partner-preferences";
consolidatedSlugRedirects["recovery-past-experiences"] = "intimacy-partner-preferences";

consolidatedSlugRedirects["fantasy-sharing-comfort"] = "fantasy-catalog";
consolidatedSlugRedirects["roleplay-scenario-explorer"] = "fantasy-catalog";

consolidatedSlugRedirects["praise-intensity-spectrum"] = "sexual-interests-curiosity-map";
consolidatedSlugRedirects["communication-language-profile"] = "sexual-interests-curiosity-map";
consolidatedSlugRedirects["desire-reality-map"] = "fantasy-catalog";
consolidatedSlugRedirects["erotic-blueprint-style"] = "intimacy-partner-preferences";

consolidatedSlugRedirects["privacy-visibility-risk-profile"] = "sexual-interests-curiosity-map";
consolidatedSlugRedirects["jealousy-compersion-relationship-structures"] = "sexual-interests-curiosity-map";
consolidatedSlugRedirects["group-multipartner-interest"] = "sexual-interests-curiosity-map";

consolidatedSlugRedirects["attachment-bedroom"] = "attachment-style-discovery";
consolidatedSlugRedirects["post-intimacy-morning-after"] = "emotional-availability-reflection";
consolidatedSlugRedirects["limits-boundaries-deep-dive"] = "relationship-dealbreakers-boundaries";
consolidatedSlugRedirects["personal-erotic-blueprint"] = "intimacy-partner-preferences";
consolidatedSlugRedirects["turn-on-anatomy"] = "toys-tools-gear-preferences";
consolidatedSlugRedirects["primal-movement-play"] = "bdsm-power-dynamics-test";

function createAssessment(s: Survey, expanded = false): AssessmentDefinition {
  const itemsFor = (d: Scale) =>
    expanded ? [...d.items, ...extendedItems[s.slug][d.key]] : d.items;
  const questionCount = s.scales.reduce(
    (count, d) => count + itemsFor(d).length,
    0,
  );
  const itemsPerQuickCategory = expanded ? 10 : 3;
  const dimensions: DimensionDefinition[] = s.scales.map((d) => {
    const reading = (meaning: string): CategoryInterpretation => ({
      meaning,
      possibleTradeoff: d.tradeoff,
      experiment: d.experiment,
      reflection: d.reflection,
    });
    return {
      key: d.key,
      label: d.label,
      shortLabel: d.shortLabel,
      description: d.description,
      lowLabel: d.ends[0],
      highLabel: d.ends[1],
      interpretations: {
        low: reading(d.readings[0]),
        balanced: reading(d.readings[1]),
        high: reading(d.readings[2]),
      },
    };
  });
  return {
    id: `${s.slug}-v${expanded ? 4 : 3}`,
    slug: s.slug,
    title: s.title,
    shortTitle: s.title,
    version: expanded ? "4.0.0" : "3.0.0",
    category: s.category,
    status: "published",
    audienceNote: s.description,
    purpose: s.description,
    futureExtensibilityNote: expanded
      ? "Authored questions cover multiple everyday situations in each category. Version 4 results and participant cohorts remain separate from previous definitions."
      : "Six situational items per category; the first three form the quick assessment. Version 3 scores stay separate from earlier definitions.",
    scientificDisclaimer:
      "An original exploratory self-report, not a validated psychological instrument, diagnosis or prediction of relationship success. Scores reflect your answers in their current context." +
      (s.adult ? " Intimate preferences never imply consent." : ""),
    adultsOnly: s.adult ?? false,
    isCouplesFocused: s.category === "compatibility",
    isFeatured: s === availability || s === personality,
    estimatedMinutesQuick: expanded ? 12 : 5,
    estimatedMinutesComplete: expanded
      ? Math.ceil((questionCount * 14) / 60)
      : 12,
    supportsQuickMode: expanded ? questionCount > 50 : true,
    supportsPartnerMatching: true,
    supportsCommunityComparison: true,
    scoringStrategy: "dimension_average",
    compatibilityStrategy:
      s === values ? "values_alignment" : "trait_similarity_complement",
    visualizationTypes: ["radar", "spectrum", "category-detail"],
    supportedExports: ["pdf", "json", "csv", "share_card"],
    quickDescription: `${s.scales.length * itemsPerQuickCategory} selected statements cover every category, including contrasting directions.`,
    deepDescription: `${questionCount} distinct statements explore each category across everyday life, uncertainty and pressure.`,
    discoverPoints: s.scales.map((d) => d.label),
    scoringNotes: [
      "Seven agreement positions normalize linearly to 0–100. Reverse-worded statements are inverted before averaging within their single declared category.",
      expanded
        ? "Each category is equally represented. The 50-question standard form includes ten questions per category. Skips never count as neutral answers."
        : "Categories have six equally weighted items in the full form and three in the quick form. Skips never count as a neutral answer.",
      "Scores of 0–39, 40–60 and 61–100 select descriptive lower, mixed and higher readings. These are editorial ranges, not diagnostic cutoffs or population norms.",
    ],
    dimensions,
    sections: s.scales.map((d) => ({
      id: d.key,
      title: d.label,
      subtitle: "Think about your usual pattern in recent months.",
      description: d.description,
    })),
    questions: s.scales.flatMap((d, sectionIndex) =>
      itemsFor(d).map((item, index) => ({
        id: `${d.key}-${index + 1}`,
        order:
          s.scales
            .slice(0, sectionIndex)
            .reduce((count, previous) => count + itemsFor(previous).length, 0) +
          index +
          1,
        sectionId: d.key,
        sectionTitle: d.label,
        inputType: "rating_scale" as const,
        prompt: item.replace(/^!/, ""),
        partnerPrompt: item.replace(/^!/, ""),
        helperText: s.adult
          ? "Answer for yourself, in contexts you freely choose. An agreement score is a preference, never permission. Skip anything that does not fit your experience."
          : "Think about your usual pattern over the past few months, rather than your ideal self. If this does not fit your experience, you can skip it.",
        quickDiscovery: index < itemsPerQuickCategory,
        directionality: "shared_value" as const,
        supportsExperienceFrequency: false,
        supportsImportance: false,
        supportsBoundaryFlag: false,
        partnerSupportsWillingness: false,
        eligibleForMatching: true,
        safetySensitive: s.adult ?? false,
        dimensionWeights: { [d.key]: 1 },
        reverseScored: item.startsWith("!"),
        editorialStatus: "verified" as const,
        scaleConfig: {
          min: 1,
          max: 7,
          minLabel: "Strongly disagree",
          midLabel: "Neither agree nor disagree",
          maxLabel: "Strongly agree",
        },
      })),
    ),
    recommendedNextSlugs:
      s === personality
        ? [availability.slug, attachment.slug]
        : s.adult
          ? [intimacy.slug, exploration.slug, power.slug].filter(
              (slug) => slug !== s.slug,
            )
          : [affection.slug, conflict.slug, values.slug].filter(
              (slug) => slug !== s.slug,
            ),
  };
}

export const versionThreeAssessments: AssessmentDefinition[] = surveys.map(
  (survey) => createAssessment(survey),
);
export const curatedAssessments: AssessmentDefinition[] = surveys.map(
  (survey) => createAssessment(survey, true),
);
