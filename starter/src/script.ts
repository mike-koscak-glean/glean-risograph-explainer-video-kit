// ─────────────────────────────────────────────────────────────
//  NARRATION SCRIPT — one line per beat.
//  `step` indexes SCENES (0 = title card, 1–10 = the story).
//  Edit text here, then re-run `npm run vo` to regenerate audio.
// ─────────────────────────────────────────────────────────────
export type Line = { id: string; step: number; beat: number; text: string; tts?: string };

/** Beats that open a new example inside the same scene (none: every use case has its own scene). */
export const SCENE_BREAKS = new Set<string>([]);

// Spoken versions with ElevenLabs v3 delivery tags. The tags are not spoken, and captions use `text`.
// Only lines that differ from `text` are listed.
export const TTS: Record<string, string> = {
  '0.1': '[warmly] ExampleCo is rebuilding how it works with customers, from the first call to every renewal. [curious] So what would it take to give every team the full picture?',
  '1.3': '[thoughtful] And at every handoff, context leaks out. Notes go stale, nobody knows where things live, and the customer ends up repeating themselves.',
  '2.1': '[confident] Glean starts by connecting to the systems ExampleCo already runs, including Databricks. It reads everything ahead of time: the content, the people, the permissions, and the activity.',
  '3.1': 'Take Dana, an account executive, getting ready for a call with Northstar. Today, that means crawling through five systems... and the brief still misses what the solutions engineer has been doing.',
  '3.2': '[warmly] With Glean, Dana asks one question and gets a cited brief: recent calls, stakeholders, risks, open commitments, and product issues, all in one place.',
  '4.2': '[warmly] With Glean, an agent builds the handoff from the source systems, starting with just the customer’s name. The goals, the promised outcomes, and the stakeholders all carry over, so the customer never has to repeat themselves.',
  '5.2': 'Glean drafts each answer from approved content, with citations, and flags the questions that still need an expert. Sellers can handle the routine ones themselves.',
  '6.2': '[confident] Glean follows the connections: from the case, to similar cases, to the Jira fix, to the person who knows it best. And the account team can see the impact, too.',
  '8.1': '[thoughtful] The value case is built on capacity, not budget cuts. It’s the hours that go back to customers, instead of searching, rebuilding handoffs, and chasing answers.',
  '9.3': '[confident] For each workflow, we compare against today’s baseline: less time spent, better work produced, and every permission respected.',
  '10.1': '[warmly] One foundation, connected across the whole customer journey... so every team starts with the full picture.',
  '10.2': '[confident] Let’s prove it on real ExampleCo work.',
};

export const LINES: Line[] = [
  { id: '0.1', step: 0, beat: 0, text: 'ExampleCo is rebuilding how it works with customers, from the first call to every renewal. So what would it take to give every team the full picture?' },

  { id: '1.1', step: 1, beat: 0, text: 'Every ExampleCo customer moves through a series of teams: sales, presales, customer success, services, and renewals.' },
  { id: '1.2', step: 1, beat: 1, text: 'Each team works in its own tools. Calls live in Gong, deals in Salesforce, and health scores in Gainsight. The rest is spread across Outlook, Teams, SharePoint, Confluence, and Jira.' },
  { id: '1.3', step: 1, beat: 2, text: 'And at every handoff, context leaks out. Notes go stale, nobody knows where things live, and the customer ends up repeating themselves.' },

  { id: '2.1', step: 2, beat: 0, text: 'Glean starts by connecting to the systems ExampleCo already runs, including Databricks. It reads everything ahead of time: the content, the people, the permissions, and the activity.' },
  { id: '2.2', step: 2, beat: 1, text: 'Then it links it all into a knowledge graph, so every call, deal, case, and document is tied to the account and the people behind it.' },
  { id: '2.3', step: 2, beat: 2, text: 'The graph stays current as people work, and everyone sees only what they’re already allowed to open.' },

  { id: '3.1', step: 3, beat: 0, text: 'Take Dana, an account executive, getting ready for a call with Northstar. Today, that means crawling through five systems, and the brief still misses what the solutions engineer has been doing.' },
  { id: '3.2', step: 3, beat: 1, text: 'With Glean, Dana asks one question and gets a cited brief: recent calls, stakeholders, risks, open commitments, and product issues, all in one place.' },

  { id: '4.1', step: 4, beat: 0, text: 'When Northstar signs, the account moves to services and customer success. Today, that handoff is a document that several teams fill out by hand, and it’s out of date by the time it arrives.' },
  { id: '4.2', step: 4, beat: 1, text: 'With Glean, an agent builds the handoff from the source systems, starting with just the customer’s name. The goals, the promised outcomes, and the stakeholders all carry over, so the customer never has to repeat themselves.' },

  { id: '5.1', step: 5, beat: 0, text: 'Then there’s Priya, a solutions engineer. Security questionnaires and product questions keep pulling her away from customers, because the right answer is buried in docs, old RFPs, and chat threads.' },
  { id: '5.2', step: 5, beat: 1, text: 'Glean drafts each answer from approved content, with citations, and flags the questions that still need an expert. Sellers can handle the routine ones themselves.' },

  { id: '6.1', step: 6, beat: 0, text: 'And when a support case comes in, Leo has to hunt for similar cases, the matching Jira issue, and someone who has fixed it before.' },
  { id: '6.2', step: 6, beat: 1, text: 'Glean follows the connections: from the case, to similar cases, to the Jira fix, to the person who knows it best. And the account team can see the impact, too.' },

  { id: '7.1', step: 7, beat: 0, text: 'Once a workflow works, it can become an agent. Dana’s call-prep brief becomes something the whole team can run, the same way every time.' },
  { id: '7.2', step: 7, beat: 1, text: 'Agents can also take busywork off sellers’ plates, like drafting call recaps and updating Salesforce, with a person approving each change.' },

  { id: '8.1', step: 8, beat: 0, text: 'The value case is built on capacity, not budget cuts. It’s the hours that go back to customers, instead of searching, rebuilding handoffs, and chasing answers.' },
  { id: '8.2', step: 8, beat: 1, text: 'Most of that value comes from a few workflows, like call prep and Salesforce updates. So proving those few in the pilot proves most of the case, measured against ExampleCo’s own baselines.' },

  { id: '9.1', step: 9, beat: 0, text: 'That’s what the pilot is designed to do: twenty to twenty-five people across sales, success, services, product, support, and IT, working in seven connected systems.' },
  { id: '9.2', step: 9, beat: 1, text: 'They’ll run real ExampleCo tasks and compare the results to today’s baseline, scoring each output for accuracy, citations, and usability.' },
  { id: '9.3', step: 9, beat: 2, text: 'For each workflow, we compare against today’s baseline: less time spent, better work produced, and every permission respected.' },

  { id: '10.1', step: 10, beat: 0, text: 'One foundation, connected across the whole customer journey, so every team starts with the full picture.' },
  { id: '10.2', step: 10, beat: 1, text: 'Let’s prove it on real ExampleCo work.' },
];

export const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;
/** Rough read time before real audio exists (~155 wpm). */
export const estimateSeconds = (s: string) => (s ? wordCount(s) / 2.6 + 0.25 : 0);
