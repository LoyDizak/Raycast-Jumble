/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Conversion Direction - Automatically detect conversion direction, or choose a specific direction. */
  "conversionDirection": "auto" | "toEnglish" | "fromEnglish",
  /** Source Keyboard Layout - Automatically detect a source layout. For English-to-layout conversion, choose the target layout. */
  "layoutMode": "auto" | "russian" | "ukrainian" | "french" | "german" | "greek"
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `fix-layout` command */
  export type FixLayout = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `fix-layout` command */
  export type FixLayout = {}
}

