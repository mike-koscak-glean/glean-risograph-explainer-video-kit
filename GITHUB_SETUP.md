# GitHub Setup

## Recommended: private template repository

1. Create a new **private** repository in your approved GitHub organization.
2. From this folder, initialize Git and push the initial version.
3. In GitHub repository settings, enable **Template repository**.
4. Add maintainers for the engine and reviewers for brand/customer safety.
5. Protect the default branch if multiple people will update the shared engine.

Example commands:

```bash
git init
git add .
git commit -m "Add Glean explainer video kit"
git branch -M main
git remote add origin <approved-private-repository-url>
git push -u origin main
```

Do not run these commands until you have selected the approved repository and reviewed the included logos.

## Suggested ownership

- **Engine owner:** maintains rendering, audio, and scene components.
- **Creative owner:** maintains design and story guidance.
- **Brand/legal owner:** reviews Glean, customer, font, and third-party logo usage.

## Large files

Do not commit `out/` or `public/gen/`. Publish final media through an approved file or asset system. If source-controlled video is required, use Git LFS and confirm retention/cost policy first.

## Updating the shared kit

Develop and validate engine changes in `starter/`. Generated folders under `videos/` are intentionally ignored. Promote reusable components back into `starter/` only after they work in a real video and pass the QA checklist.
