// ─────────────────────────────────────────────────────────────
//  ALL ON-SCREEN COPY LIVES HERE  ·  Glean × ExampleCo pilot pitch
//  People and the customer account ("Northstar") are illustrative.
//  Pilot scope + criteria come from the joint (draft) success plan.
// ─────────────────────────────────────────────────────────────
import type { LogoKey } from './logos';
import { INK, type PersonStyle } from './ink';

export type BeatCopy = { title: string; sub?: string };
export type StepCopy = { label: string; kicker: string; beats: BeatCopy[] };

export const STEPS: StepCopy[] = [
  { label: 'Title', kicker: '', beats: [{ title: '' }] },
  {
    label: 'Journey today',
    kicker: 'ExampleCo today',
    beats: [
      { title: 'Every customer moves through a series of teams.', sub: 'Sales, presales, customer success, services, and renewals.' },
      { title: 'Each team works in its own tools.', sub: 'Gong, Salesforce, Gainsight, Microsoft 365, Confluence, and Jira.' },
      { title: 'Context leaks out at every handoff.', sub: 'Notes go stale. Assets hide. The customer repeats themselves.' },
    ],
  },
  {
    label: 'Foundation',
    kicker: 'How Glean works',
    beats: [
      { title: 'Glean connects to the systems ExampleCo runs.', sub: 'It reads content, people, permissions, and activity before anyone asks.' },
      { title: 'Then it links everything into a graph.', sub: 'Every call, deal, case, and document is tied to its account and its people.' },
      { title: 'Live, and permission-aware.', sub: 'It updates as people work. Everyone sees only what they can already open.' },
    ],
  },
  {
    label: 'Account 360',
    kicker: 'Use case 1 · Account 360',
    beats: [
      { title: 'Call prep today: five systems, by hand.', sub: 'And the brief still misses what the SE has been doing.' },
      { title: 'With Glean: one cited account brief.', sub: 'Calls, stakeholders, risks, commitments, and product issues in one place.' },
    ],
  },
  {
    label: 'customer handoff',
    kicker: 'Use case 2 · customer handoff',
    beats: [
      { title: 'The handoff doc is stale on arrival.', sub: 'Several teams fill it out by hand, after the fact.' },
      { title: 'With Glean: an agent builds the handoff.', sub: 'From the source systems, starting with just the customer’s name.' },
    ],
  },
  {
    label: 'RFP + product answers',
    kicker: 'Use case 3 · RFPs + product answers',
    beats: [
      { title: 'SEs get pulled into every questionnaire.', sub: 'The right answer is buried in docs, old RFPs, and chat threads.' },
      { title: 'With Glean: drafted, cited, and flagged.', sub: 'Approved content first. An expert reviews only what needs one.' },
    ],
  },
  {
    label: 'Support + engineering',
    kicker: 'Use case 4 · Support + engineering',
    beats: [
      { title: 'Every new case starts from scratch.', sub: 'Similar cases, the Jira issue, and the expert all live apart.' },
      { title: 'With Glean: follow the connections.', sub: 'Case → similar cases → Jira fix → the person who knows it best.' },
    ],
  },
  {
    label: 'Agents',
    kicker: 'Agents',
    beats: [
      { title: 'A workflow that works becomes an agent.', sub: 'Shared with the team, and run the same way every time.' },
      { title: 'Agents take on the busywork, too.', sub: 'Call recaps and Salesforce updates, with a person approving each change.' },
    ],
  },
  {
    label: 'Value',
    kicker: 'The value case',
    beats: [
      { title: 'Capacity, not a budget cut.', sub: 'Hours go back to customers instead of searching and rebuilding.' },
      { title: 'Prove a few workflows, prove most of the case.', sub: 'Measured against ExampleCo’s own baselines, not our assumptions.' },
    ],
  },
  {
    label: 'Pilot',
    kicker: 'The pilot',
    beats: [
      { title: '20–25 people. Seven connected systems.', sub: 'Sales, success, services, product, support, and IT.' },
      { title: 'Real ExampleCo tasks, against today’s baseline.', sub: 'Every output scored for accuracy, citations, and usability.' },
      { title: 'Less time. Better work.', sub: 'Each workflow measured against ExampleCo’s own baseline.' },
    ],
  },
  {
    label: 'Close',
    kicker: 'One foundation',
    beats: [{ title: 'One foundation for the whole customer journey.', sub: 'Every team starts with the full picture.' }, { title: '' }],
  },
];

// ── Shared cast (illustrative) ───────────────────────────────
export const ACCOUNT = 'Northstar';
export type Cast = { name: string; role: string; style: PersonStyle };
export const DANA: Cast = { name: 'Dana', role: 'Account Executive', style: { shirt: INK.coral, hair: 'long', seed: 5 } };
export const PRIYA: Cast = { name: 'Priya', role: 'Solutions Engineer', style: { shirt: INK.blue, hair: 'bun', seed: 2 } };
export const SAM: Cast = { name: 'Sam', role: 'Customer Success', style: { shirt: INK.lime, hair: 'short', seed: 8 } };
export const OMAR: Cast = { name: 'Omar', role: 'Services', style: { shirt: INK.fx, hair: 'curly', seed: 11 } };
export const KATE: Cast = { name: 'Kate', role: 'Renewals', style: { shirt: INK.navy, hair: 'bun', seed: 14 } };
export const LEO: Cast = { name: 'Leo', role: 'Support Engineer', style: { shirt: INK.fx, hair: 'short', seed: 17 } };

// ── Step 1 / 10 · the customer journey ───────────────────────
export const STATIONS: { team: string; who: Cast; apps: LogoKey[] }[] = [
  { team: 'SALES', who: DANA, apps: ['salesforce', 'gong'] },
  { team: 'PRESALES', who: PRIYA, apps: ['confluence', 'sharepoint'] },
  { team: 'CUSTOMER SUCCESS', who: SAM, apps: ['gainsight', 'teams'] },
  { team: 'SERVICES', who: OMAR, apps: ['jira', 'onedrive'] },
  { team: 'RENEWALS', who: KATE, apps: ['salesforce', 'outlook'] },
];
export const HANDOFF_LOSSES = ['notes from March', 'where’s the deck?', 'who owns this?', 'what did we promise?'];

// ── Step 0 / 2 · ExampleCo's stack (pilot + beyond) ────────────
export const RING_APPS: LogoKey[] = ['salesforce', 'gong', 'gainsight', 'outlook', 'teams', 'sharepoint', 'onedrive', 'confluence', 'jira', 'databricksIcon', 'powerbi', 'responsive'];

// ── Steps 3–6 · use cases ────────────────────────────────────
export type UseCase = {
  id: string;
  persona: Cast;
  question: string;
  today: { docs: { app?: LogoKey; title: string; meta: string }[]; stamp: string; stampSub: string };
  glean: {
    header: string;
    agent?: boolean;
    rows: { app?: LogoKey; label: string; text: string; flag?: boolean }[];
    stamp: string;
    stampSub: string;
  };
};

export const UC_ACCOUNT: UseCase = {
  id: 'account',
  persona: DANA,
  question: 'Prep me for the Northstar call.',
  today: {
    docs: [
      { app: 'salesforce', title: 'Northstar · renewal opp', meta: 'Salesforce · notes from June' },
      { app: 'gong', title: 'QBR call · 52 min', meta: 'Gong · transcript' },
      { app: 'gainsight', title: 'Health score · trending down', meta: 'Gainsight · CS notes' },
      { app: 'outlook', title: 'RE: license true-up', meta: 'Outlook · 14 messages' },
      { app: 'teams', title: '#halcyon-deal', meta: 'Teams · SE thread' },
    ],
    stamp: 'FIVE SYSTEMS, BY HAND',
    stampSub: 'AND STILL MISSING SE ACTIVITY',
  },
  glean: {
    header: 'Northstar · account brief',
    rows: [
      { app: 'gong', label: 'Last call', text: 'CFO wants a cloud cost plan before renewal' },
      { app: 'salesforce', label: 'Stakeholders', text: 'New CIO · champion moved to EMEA' },
      { app: 'gainsight', label: 'Risk', text: 'Health dipped after the rollout slipped' },
      { app: 'teams', label: 'SE activity', text: 'FinOps workshop held last week' },
      { app: 'jira', label: 'Product issue', text: 'Connector bug open · fix next release' },
    ],
    stamp: 'ONE CITED BRIEF',
    stampSub: 'EVERY LINE LINKED TO ITS SOURCE',
  },
};

export const UC_HANDOFF: UseCase = {
  id: 'handoff',
  persona: SAM,
  question: 'What did we promise Northstar?',
  today: {
    docs: [
      { app: 'docx', title: 'customer handoff template', meta: 'Word · half filled in' },
      { app: 'gong', title: 'Discovery call · 47 min', meta: 'Gong · never linked' },
      { app: 'salesforce', title: 'Closed won · Northstar', meta: 'Salesforce · notes from March' },
      { app: 'teams', title: '“who owns this now?”', meta: 'Teams · #halcyon' },
    ],
    stamp: 'STALE ON ARRIVAL',
    stampSub: 'THE CUSTOMER REPEATS THEMSELVES',
  },
  glean: {
    header: 'Northstar · customer handoff',
    agent: true,
    rows: [
      { app: 'gong', label: 'Goals', text: 'Get SaaS spend under control in year one' },
      { app: 'salesforce', label: 'Promised outcomes', text: 'SaaS visibility in Q1 · quarterly exec review' },
      { app: 'outlook', label: 'Stakeholders', text: 'CFO sponsor · IT asset lead owns rollout' },
      { app: 'gong', label: 'Watch-outs', text: 'Burned by a slow rollout last year' },
      { app: 'jira', label: 'Open items', text: 'One integration ticket in progress' },
    ],
    stamp: 'READY ON DAY ONE',
    stampSub: 'BUILT FROM THE SOURCE SYSTEMS',
  },
};

export const UC_RFP: UseCase = {
  id: 'rfp',
  persona: PRIYA,
  question: 'Which ports does the agent need open?',
  today: {
    docs: [
      { app: 'xlsx', title: 'Security questionnaire', meta: 'Excel · 212 questions' },
      { app: 'responsive', title: 'Answer library', meta: 'Responsive · last reviewed 2024' },
      { app: 'sharepoint', title: 'Security + trust pack', meta: 'SharePoint · SOC 2, pen test' },
      { app: 'teams', title: '“@Priya can you take Q47?”', meta: 'Teams · third ask today' },
    ],
    stamp: 'SE PULLED IN AGAIN',
    stampSub: 'ROUTINE ANSWERS, EXPERT TIME',
  },
  glean: {
    header: 'Questionnaire · draft answers',
    rows: [
      { app: 'confluence', label: 'Q12 · Network ports', text: 'Drafted from the current install guide' },
      { app: 'sharepoint', label: 'Q3 · Encryption', text: 'Drafted from the security pack' },
      { app: 'responsive', label: 'Q31 · SSO + SCIM', text: 'Matched an approved answer' },
      { app: 'teams', label: 'Q47 · Data residency', text: 'Flagged for an expert to review', flag: true },
    ],
    stamp: 'DRAFTED + CITED',
    stampSub: 'ONLY THE HARD ONES GO TO AN EXPERT',
  },
};

export const UC_SUPPORT: UseCase = {
  id: 'support',
  persona: LEO,
  question: 'Has anyone seen this sync error before?',
  today: {
    docs: [
      { title: 'Case 48213 · inventory sync fails', meta: 'Support portal · P2' },
      { app: 'jira', title: 'Search: “sync error”', meta: 'Jira · 240 results' },
      { app: 'confluence', title: 'KB · sync troubleshooting', meta: 'Confluence · 2023' },
      { app: 'teams', title: '“who knows the connector code?”', meta: 'Teams · no reply yet' },
    ],
    stamp: 'STARTING FROM SCRATCH',
    stampSub: 'THE FIX ALREADY EXISTS SOMEWHERE',
  },
  glean: {
    header: 'Case 48213 · what we know',
    rows: [
      { label: 'Similar cases', text: 'Three resolved in the last 90 days' },
      { app: 'jira', label: 'Jira issue', text: 'Known bug · fixed in the next release' },
      { app: 'confluence', label: 'Workaround', text: 'Documented step by step in the KB' },
      { app: 'teams', label: 'Expert', text: 'Maya on the platform team fixed it before' },
      { app: 'salesforce', label: 'Account impact', text: 'Four accounts affected · one renewing soon' },
    ],
    stamp: 'KNOWN FIX FOUND',
    stampSub: 'BY FOLLOWING THE GRAPH',
  },
};

// ── Step 7 · agents ──────────────────────────────────────────
export const AGENT = {
  name: 'Account brief agent',
  steps: ['Read Salesforce + Gong', 'Check Gainsight health', 'Pull SE + product activity', 'Write a cited brief'],
  recap: { from: 'Northstar QBR · 52 min', fields: ['Next step: cloud cost plan', 'Close date: unchanged', 'Risk: champion moved'] },
};

// ── Step 8 · value framework (no figures — directional only) ─
export const LEVERS: { label: string; lead?: boolean }[] = [
  { label: 'Account 360 + call prep', lead: true },
  { label: 'Salesforce updates', lead: true },
  { label: 'Finding handoff assets' },
  { label: 'New-hire onboarding' },
  { label: 'RFP + security' },
  { label: 'customer handoffs' },
  { label: 'Leadership status' },
];

// ── Step 9 · the pilot (from the joint draft success plan) ───
export const PILOT_APPS: LogoKey[] = ['salesforce', 'gong', 'gainsight', 'microsoft365', 'teams', 'confluence', 'jira'];
export const PILOT_GROUPS: { label: string; n: number; color: string }[] = [
  { label: 'Sales · SE · CS · services · renewals', n: 10, color: INK.coral },
  { label: 'Product + engineering', n: 5, color: INK.blue },
  { label: 'Support + operations', n: 4, color: INK.lime },
  { label: 'IT + program admin', n: 3, color: INK.fx },
];
export const PHASES: { label: string; dur: string }[] = [
  { label: 'Setup + connect', dur: '1–2 WEEKS' },
  { label: 'Data + permission checks', dur: 'IN PARALLEL' },
  { label: 'Focused evaluation', dur: '2 WEEKS' },
  { label: 'Readout + decision', dur: 'SCORED RESULTS' },
];
// Illustrative scorecard — bar lengths and pips show direction only, never numbers.
export const SCORECARD: { name: string; logo: 'salesforce' | 'gainsight' | 'responsive' | 'jira'; time: number; q0: number; q1: number; qual: string }[] = [
  { name: 'Account 360 + call prep', logo: 'salesforce', time: 0.32, q0: 2, q1: 5, qual: 'Cited, complete brief' },
  { name: 'customer handoff', logo: 'gainsight', time: 0.38, q0: 2, q1: 4, qual: 'Nothing lost at handoff' },
  { name: 'RFPs + product answers', logo: 'responsive', time: 0.45, q0: 3, q1: 5, qual: 'Approved answers first' },
  { name: 'Support + engineering', logo: 'jira', time: 0.4, q0: 2, q1: 4, qual: 'Known fix, right expert' },
];

export const TAGLINE = 'Let’s prove it on real ExampleCo work.';
