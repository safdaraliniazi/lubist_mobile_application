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

## One-time setup (do this ONCE)

> ⚠️ **Important:** The app you already distributed last week was built *without* update support, so it **cannot** receive OTA updates. That's unavoidable for those existing installs. After you do the setup below and distribute **one more build**, every install from then on receives OTA updates with no reinstall.

```bash
# 1. Install the updates library
npx expo install expo-updates

# 2. Wire up EAS Update (adds `updates.url` + `runtimeVersion` to app.json,
#    and `channel` to each profile in eas.json)
eas update:configure

# 3. Commit the generated changes
git add app.json eas.json package.json package-lock.json
git commit -m "chore: enable EAS Update (OTA)"

# 4. Build ONCE more with update support baked in, and redistribute
eas build --platform android --profile production
# (repeat with --platform ios if/when you ship iOS)
```

After step 4, hand out the new build link/QR **one last time**. From then on, JS changes go out via `npm run ota` — no more reinstalls.

**After setup, verify these exist:**
- `app.json` → an `"updates"` block with a `"url"`, and a `"runtimeVersion"` key
- `eas.json` → each build profile (`preview`, `production`) has a `"channel"` (e.g. `"production"`)

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
- **runtimeVersion** = a compatibility stamp. An OTA update only installs on a build whose `runtimeVersion` matches. When you add a native library or change native config, the runtime version changes, which is Expo's way of saying "this needs a new build, not an OTA." `eas update:configure` sets this up so it's handled for you.

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
