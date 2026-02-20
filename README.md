# Screeps Scripts

TypeScript codebase that bundles Screeps AI logic via Rollup and pushes the result straight to your Screeps account.

## Local workflows

- `npm run build` bundles `src/main.ts` to `dist/main.js`.
- `npm run watch` runs Rollup in watch mode for rapid iteration.
- `npm run submit` builds and uploads `dist/main.js` using the Screeps Web API.

## Automated submissions

`tools/submit.mjs` follows the external commit workflow described in `docs/screeps/source/commit.md` and authenticates with the token system from `docs/screeps/source/auth-tokens.md`.

1. Create a Screeps auth token (full access is simplest) in the Screeps account UI.
2. Provide it to the script via either `SCREEPS_TOKEN` (recommended for shell/env managers) or `SCREEPS_TOKEN_FILE` pointing at a file that contains only the token.
3. Optionally configure these variables:
   - `SCREEPS_BRANCH` – defaults to `default`.
   - `SCREEPS_MODULE` – defaults to `main` (matches the Rollup output).
   - `SCREEPS_SERVER` – defaults to `https://screeps.com`; set to another base URL for season, PTR, or private servers.
   - `SCREEPS_DIST` – defaults to `dist/main.js`.
   - `SCREEPS_ACTIVATE_BRANCH` – set to `true` to call `/api/user/set-active-branch` after uploading.
4. Run `npm run submit`.

The script requires Node.js 18+ (for the built-in `fetch`). It prints HTTP and rate-limit details so you can track the daily quota on `POST /api/user/code` (240/day). Failures exit with status code `1` so that CI or shell scripts stop immediately.

Example shell setup:

```bash
export SCREEPS_TOKEN="<your-token>"
export SCREEPS_BRANCH="default"
npm run submit
```

To avoid storing the token in your shell history, you can instead create a file (for example `~/.screeps-token`) that contains only the token string and set `SCREEPS_TOKEN_FILE=~/.screeps-token`.

When `SCREEPS_ACTIVATE_BRANCH=true`, the script performs a second API call so the uploaded branch becomes active immediately, saving a trip to the in-game IDE.
