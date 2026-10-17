# Jumble

Windows-targeted adaptation of [Keyboard Layout Search](https://www.raycast.com/rogovk/keyboard-layout-search), originally created by rogovk for Raycast. It uses Raycast's cross-platform extension API, with Windows-specific platform metadata and Ctrl-based action shortcuts.

Fix a Raycast search typed with the wrong keyboard layout, then open the intended application or continue with the corrected text.

Every change to the original extension is vibecoded

## Features

- Automatically detects Russian, Ukrainian, French AZERTY, German QWERTZ, and Greek input.
- Converts keyboard input locally to the corresponding US English physical keys.
- Can also convert English key positions back to a selected layout, such as `ghbdtn` → `привет`.
- Finds and ranks installed applications through Raycast.
- Copies or pastes corrected text when no application matches.
- Allows selecting a fixed source layout in the extension settings.

In automatic mode, Cyrillic or Greek input is converted to US English. Latin input is converted to Russian by default, unless it strongly matches an installed application after another supported layout conversion (for example, `zoutube` → `youtube`). To target another layout manually, open the extension preferences, set **Conversion Direction** to **English → Selected Layout**, and choose the layout under **Source Keyboard Layout**.

Examples:

- `сгкыщк` → `cursor`
- `zoutube` → `youtube` on German QWERTZ
- `chro,e` → `chrome` on French AZERTY
- `ζοομ` → `zoom` on Greek

## Development

1. Install [Raycast for Windows](https://raycast.com/windows) and Node.js.
2. Run `npm install`.
3. Run `npm run dev` to load the extension in Raycast.
4. Run `npm test` and `npm run typecheck` to verify changes.

To use it as a fallback command, open Raycast Settings → Launcher → Fallback Commands and add **Fix Keyboard Layout**.

## Automatic detection

Automatic mode converts Cyrillic or Greek input to US English. Latin input is treated as English key positions for Russian by default; a strong installed-application match can instead select a French AZERTY or German QWERTZ conversion.

## Privacy

Conversion and application matching happen locally through Raycast.

## Attribution

The layout maps, conversion, detection, and application-ranking logic are adapted from the MIT-licensed [Raycast Keyboard Layout Search extension](https://github.com/raycast/extensions/tree/main/extensions/keyboard-layout-search). The MIT license is included in [LICENSE](./LICENSE).
