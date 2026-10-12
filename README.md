# AUREXIS

Intelligence · Software · Solutions

## Run locally (Docker)

```bash
docker compose up -d --build
```

Open http://localhost:8090 — nginx serves the Next.js frontend and proxies `/api/*` to the FastAPI backend.

Rebuild only the website after frontend changes:

```bash
docker compose up -d --build frontend
```

Fast frontend development with hot reload (keep the Docker stack running for the API):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 — in dev, Next.js forwards `/api/*` to the Docker stack on :8090.

## Frontend design system

| Layer | Location |
| --- | --- |
| Layout grid (custom Bootstrap build: breakpoints, containers, spacing, layout utilities only) | `frontend/src/styles/bootstrap.scss` |
| Design tokens (color, glass, type scale, motion) | `frontend/src/styles/tokens.css` |
| Base, components, sections, app screens | `frontend/src/styles/{base,components,sections,app}.css` |
| Motion primitives (`Reveal`, `SplitText`) | `frontend/src/components/motion/` |
| 3D stage (home scroll story) and `<Unit />` (the robot on a pedestal, used on login, contact, CTA, chat, 404) | `frontend/src/components/stage/` |
| Site assistant (fixed bottom-right launcher) | `frontend/src/components/assistant/` |
| Copy and structured content | `frontend/src/lib/content.ts` |

### Interaction rules

- The 3D unit has its own interactions: it follows the pointer, glows on hover, and waves with a pulse of light on click. It never opens the assistant.
- `/login` and `/register` share a persistent layout (`app/(auth)`), so the unit stays on stage and only the form transitions.
- Phones and portrait tablets get a compact home: the unit sits in the hero and card rows become swipe carousels.
- The assistant opens only from its own launcher. It streams answers from `/api/v1/chat/guest/stream`.
- The WebGL stage renders only while the home story is on screen, and it respects `prefers-reduced-motion`.

## Delivery pipeline (GitHub Actions)

Work on a branch, never directly on `main`:

```bash
git switch -c feat/my-change
git push -u origin feat/my-change   # -> runs CI only
```

Open a pull request and merge it. The merge into `main` runs the **Production pipeline**:

| Stage | What happens |
| --- | --- |
| Stage 1 - CI | Same checks as a branch push: backend deps, syntax, lint, tests; frontend type-check and build; compose validation; container builds |
| Stage 2 - Detect changed services | Diff against the `production` tag (the last deployed commit) |
| CD - Publish images | Builds and pushes only the changed images to GHCR, tagged with the commit SHA |
| Stage 3 - Deploy production | **Waits for approval.** Open the run, click *Review deployments*, tick `production`, *Approve and deploy* (or *Reject*) |
| Stage 4 - Record | Moves the `production` tag to this commit |

The deploy is an update, not a reinstall: `scripts/deploy.sh` on the server pulls only the changed images,
backs up the database before a backend update, recreates just those containers, waits for health checks,
reloads nginx, and restores the previous images automatically if anything fails. The database volume,
`/opt/aurexis/.env.prod` and the TLS certificates are never touched. Running image tags are kept in
`/opt/aurexis/.env.deploy` (previous ones in `.env.deploy.prev`).

To redeploy everything, run the pipeline manually from the Actions tab with *deploy_all* ticked.

Repository settings used by the pipeline (environment `production`, required reviewer: the owner):

| Kind | Name |
| --- | --- |
| Secret | `SSH_PRIVATE_KEY` — dedicated deploy key (its public half is in the server's `authorized_keys`) |
| Secret | `SSH_KNOWN_HOSTS` — the server's host keys |
| Variable | `SSH_HOST`, `SSH_USER` |
