# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Form Filler is a Chrome (Manifest V3) extension that stores a user's profile (name, email, LinkedIn, etc.) in `chrome.storage.local` and fills matching `<input>` fields on job-application pages (Lever, Greenhouse, Workable, BambooHR, ...). Built with Vite 3, React 18, TypeScript, Tailwind and shadcn/ui ("new-york" style, components in `components/ui/`).

## Commands

```bash
npm i                  # install
npm run build:chrome   # full production build into dist/ (the only build you normally need)
npx tsc                # type-check only (this is what CI runs on PRs and main)
npm run package        # zip dist/ into extension.zip
```

`npm run build:chrome` runs, in order: `build:js` (popup UI bundle, empties `dist/`), `build:background:chrome`, `build:web` (tsc + html entries), `build:popup` (content script), then renames `dist/manifestv3.json` to `dist/manifest.json`. Only `build:js` has `emptyOutDir: true`; reordering these steps will wipe earlier outputs.

Load the result via `chrome://extensions` > Load unpacked > select `dist/`. There are no tests and no linter; `npx tsc` is the only check. `tsconfig.json` has `strict: false` and only includes `content-script/` (plus a nonexistent `src/`), so `popup.ts` and `background.ts` are not type-checked.

Releases: pushing a git tag triggers `.github/workflows/release.yml`, which builds and attaches `form-filler.zip` to a GitHub release.

The extension is published on the Chrome Web Store at https://chromewebstore.google.com/detail/form-filler/aipglblammjhpjpjfniigpnepplipjmp (store ID `aipglblammjhpjpjfniigpnepplipjmp`). Store uploads are manual: bump `version` in `public/manifestv3.json` (and `package.json`) before building the zip for a store release. `privacy-policy.md` at the repo root is the policy linked from the store listing.

## Architecture (names are misleading, read this first)

The file/dir names do not match extension roles. The mapping, by Vite config and manifest:

| Role | Source entry | Vite config | Output | Referenced by |
|---|---|---|---|---|
| Popup UI (React) | `content-script/index.tsx` -> `App.tsx` | `vite.content.config.ts` | `dist/index.global.js` + `dist/style.css` | `index.html` (`action.default_popup`) |
| Content script (injected into every page) | `popup.ts` | `vite.popup.config.ts` | `dist/popup.global.js` | manifest `content_scripts` |
| Background service worker | `background.ts` | `vite.chrome.config.ts` | `dist/background.global.js` | manifest `background.service_worker` |

So `content-script/` is actually the popup, and `popup.ts` is actually the content script. All three are built as IIFE bundles because MV3 content scripts and the popup load them via plain `<script>` tags.

Runtime flow when the user clicks "Fill Form For me":

1. Popup (`content-script/App.tsx`) does `chrome.tabs.sendMessage(activeTab, { from: 'popup', subject: 'fillForm' })` and expects `{ ok, filled, candidates }` back.
2. Content script (`popup.ts`) receives it, calls `collectFields()` (visible `input`/`select`, descending into open shadow roots and same-origin iframes; textareas and `role="combobox"` inputs are skipped because they are free-text questions or custom-select search boxes), reads `formFillerData` from `chrome.storage.local`, and calls `formFiller()` from `content-script/constants.ts`.
3. `classifyField` maps each field to a profile key using, in order: the `autocomplete` attribute, then whole-word alias matching against a descriptor built from name, id, placeholder, aria-label, `data-automation-id` (Workday), and associated label text (labels over 60 chars are questions and are ignored). `NEGATIVE` aliases stop e.g. "company website" or "other website" from matching. "Confirm email" fields intentionally get the email.
4. Values are written through the native prototype setter followed by `input`/`change`/`blur` events so React-controlled forms (Greenhouse, Lever, Ashby, Workday) pick them up. Fields the user already typed into are skipped unless `overwrite` is passed; a phone field holding only a dial code (intl-tel-input's "+45") counts as empty.

Verified by hand on live Greenhouse, Ashby, Lever, Recruitee and SmartRecruiters application pages. Workday and Workable are untested.

`FieldIds` in `content-script/constants.ts` is the single source of truth: its keys define both the fields shown in the onboarding form (`Form.tsx` iterates them) and the shape of the stored `formFillerData` object, and its values are the aliases used for matching. Adding a new profile field means adding one entry there (plus an `AUTOCOMPLETE_MAP` entry if a standard autocomplete token exists).

There is no test harness. To exercise the matcher, build with `npm run build:popup`, load `dist/popup.global.js` into a page with a stubbed `window.chrome` (`runtime.onMessage.addListener` and `storage.local.get`), and invoke the registered listener with `{ from: 'popup', subject: 'fillForm' }`.

Manifests live in `public/`: `manifestv3.json` is the real one (Chrome). `manifest.json` there is an unused MV2 leftover from the template. `.plasmo/` and the `dist/` directory are gitignored build artifacts.

The `@/` alias resolves to the repo root (configured in both `tsconfig.json` and every Vite config), e.g. `@/components/ui/button`, `@/lib/utils`.
