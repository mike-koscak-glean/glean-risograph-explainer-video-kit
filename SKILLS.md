# Included Glean Tau Skills

| Skill | Use it when |
|---|---|
| `risograph-explainer-workflow` | You want end-to-end help, want to start from freeform notes or Glean research, or do not know which phase comes next. |
| `shape-risograph-video-story` | Project type, idea, audience, evidence, narrative, use cases, or duration is not approved. |
| `design-risograph-video-storyboard` | The story is approved and needs this specific visual treatment and storyboard. |
| `produce-risograph-explainer-video` | Story and visuals are approved and it is time to script, narrate, animate, mix, render, and validate. |

Generated projects contain all four skills. In the same chat that creates the project, Tau can read `.glean/skills/risograph-explainer-workflow/SKILL.md` directly and continue from the generated folder. A new session or `/reload` is needed only when the user wants the newly copied skills to appear in Tau’s discovered skill list.

The skills share intake, research, evidence, and phase artifacts through `project/STATUS.md`; they do not create separate engines or duplicate source code.
