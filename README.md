# The Life Edit

Codex-ready Next.js starter. This is a demo with illustrative content, not a live Pinterest connection.

## Run on your computer

Use Node.js 24 and Git. If you don't already have a local checkout, get one from the branch that contains the app:

```sh
git clone --branch codex/life-edit-starter https://github.com/kb-studio14/Life-Edit.git
cd Life-Edit
```

If you already have a checkout, run `git fetch origin` and `git switch codex/life-edit-starter` from the project folder.

From the project folder, start the live preview:

```sh
npm ci --cache .npm-cache
npm run dev:sync
```

Keep that terminal running and open <http://localhost:3000>. Like WestRock, this checks GitHub every 10 seconds. When a commit reaches `codex/life-edit-starter`, the script fast-forwards your checkout and Next.js refreshes the preview. Changes to dependency files reinstall the locked dependencies and restart the server.

Sync pauses when the checkout has local edits, is on another branch, or has commits that don't match GitHub's history. Use `npm run dev` for local development without automatic GitHub updates. Press Ctrl+C to stop either server.

## Check
`npm run lint`, `npm run typecheck`, `npm run build`.

See `AGENTS.md`, `docs/PRD.md`, and `docs/ARCHITECTURE.md` for the product vision, safety constraints and next milestones.
