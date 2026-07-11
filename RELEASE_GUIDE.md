# Lubist Mobile — Build & Update Guide

How to ship changes to users. Read the **"Which do I need?"** section first every time.

---

## TL;DR — Which do I need?

Ask yourself: **did I change any native code?**

| I changed... | Command | User reinstalls? |
|---|---|---|
| JS/TS, screens, styling, API calls, text, images, bug fixes | `npm run ota` | **No** ✅ (auto-updates on next app open) |
| A native library (added an `expo-*`/native package), a permission, app icon/splash, Expo SDK version, or `version`/`versionCode` | `npm run build:prod` then redistribute | **Yes** |

**~90% of your day-to-day changes are the first row (OTA).**

> Rule of thumb: if `npx expo install` added/changed a package, or you edited the native config in `app.json` (icons, permissions, plugins), you need a **new build**. Otherwise, OTA is enough.

---

## One-time setup — STATUS: mostly DONE (2026-08-10)

> ⚠️ **Note:** Any app distributed *before* this setup was built without update support and **cannot** receive OTA updates. That's only the earliest installs, and we're not worrying about them. Once you distribute **one more build** (step 4 below), every install from then on receives OTA updates with no reinstall.

- [x] **1. Install the updates library** — `npx expo install expo-updates` (added `expo-updates ~29`)
- [x] **2. Wire up EAS Update** — `eas update:configure` set `updates.url` in app.json, `runtimeVersion` policy `appVersion`, and `channel` on each eas.json profile
- [ ] **3. Commit the changes**
  ```bash
  git add app.json eas.json package.json package-lock.json
  git commit -m "chore: enable EAS Update (OTA)"
  ```
- [ ] **4. Build ONCE more with update support baked in, then redistribute**
  ```bash
  npm run build:prod    # = eas build --platform android --profile production
  ```
  Hand out the new build link/QR **one last time**. From then on, JS changes go out via `npm run ota` — no more reinstalls.

**Verify (already true after step 2):**
- `app.json` → `"updates"` block with a `"url"`, and `android.runtimeVersion`
- `eas.json` → each profile has a `"channel"` (`development` / `preview` / `production`)

---

## Everyday workflow (after setup)

### Ship a JS-only change (the normal case) — no reinstall
```bash
# make sure your code is committed and it typechecks
npm run typecheck

# push the update to everyone on the production build
eas update --branch production --message "Fix booking button + update offers copy"
```
Users get it automatically the next time they open the app (it downloads in the background, applies on the following launch). Done. No QR, no reinstall.

### Ship a native change — reinstall required
```bash
# bump the version so it's a clean new release (optional but recommended)
# edit app.json: expo.version and android.versionCode

eas build --platform android --profile production
```
Then share the new build link/QR. Users install over the old app (data is preserved; they don't lose login).

---

## Key concepts (plain English)

- **EAS Build** = produces the actual installable app file. Needed for native changes and the very first release. Slow (~10-20 min), needs reinstall.
- **EAS Update (OTA)** = pushes just your JavaScript + assets over the internet to already-installed apps. Fast (~1 min), no reinstall. **Cannot** change native code.
- **Branch / Channel** = the "lane" an update travels on. Your `production` build listens to the `production` channel/branch. When you run `eas update --branch production`, only production installs get it. (You can have a `preview` lane for testers.)
- **runtimeVersion** = a compatibility stamp. An OTA update only installs on a build whose `runtimeVersion` matches. This project uses the **`appVersion` policy**, which means **`runtimeVersion` = `expo.version` in app.json** (currently `1.0.0`). Practical consequences:
  - As long as you keep `version` at `1.0.0`, every `npm run ota` reaches all `1.0.0` builds. ✅
  - The moment you bump `expo.version` (e.g. to `1.0.1`), you have declared a **new runtime** — you MUST make a new build, and OTA updates published under `1.0.0` will NOT reach `1.0.1` installs (and vice-versa).
  - **So: don't bump `version` for a JS-only OTA change.** Only bump it when you're making a real new build (typically alongside a native change). That keeps OTA flowing to everyone.

---

## Testing an update before sending it to real users

Use the `preview` lane so you can verify on your own device first:
```bash
# build a preview app once, install it on your test phone
eas build --platform android --profile preview

# push test updates to just that lane
eas update --branch preview --message "testing new checkout"
```
Once it looks good, promote the same change to production:
```bash
eas update --branch production --message "Ship new checkout"
```

---

## Useful commands

```bash
eas update:list --branch production   # see what updates you've pushed
eas build:list                        # see your builds
eas whoami                            # confirm you're logged in
eas login                             # if not logged in
```

## Handy npm scripts

These are defined in `package.json` (add them if missing — see below):
```bash
npm run ota            # eas update --branch production  (asks for a message)
npm run build:prod     # eas build --platform android --profile production
npm run build:preview  # eas build --platform android --profile preview
```

---

## Gotchas / FAQ

- **"My existing users didn't get the OTA update."** The build they have must have been made *after* OTA setup. The pre-setup build (last week's) can never receive OTA. One final reinstall fixes this for good.
- **"I added a package and OTA didn't reflect it."** If it's a native package, OTA can't ship it — you need a new build. If it's pure JS, make sure your update actually bundled (check `eas update:list`).
- **iOS store apps** have an extra rule: OTA is fine for bug fixes, but you can't use it to sneak past App Store review with major feature changes. Not relevant while you're distributing internally.
- **Always commit before `eas update`** — EAS ties the update to your git commit, which keeps things traceable.
