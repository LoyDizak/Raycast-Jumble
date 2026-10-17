import assert from "node:assert/strict";
import test from "node:test";
import type { Application } from "@raycast/api";
import { detectCorrection } from "./detection";
import { convertFromEnglish, convertToEnglish, getLayout } from "./layout";

const applications: Application[] = [
  { name: "Cursor", path: "C:\\Program Files\\Cursor\\Cursor.exe", windowsAppId: "Cursor" },
  { name: "YouTube", path: "https://www.youtube.com", windowsAppId: "YouTube" },
  { name: "Google Chrome", path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", windowsAppId: "Chrome" },
  { name: "Zoom", path: "C:\\Users\\User\\AppData\\Roaming\\Zoom\\bin\\Zoom.exe", windowsAppId: "Zoom" },
];

test("converts supported layouts to the physical US English keys", () => {
  assert.equal(convertToEnglish("сгкыщк", getLayout("russian")).text, "cursor");
  assert.equal(convertToEnglish("ї", getLayout("ukrainian")).text, "]");
  assert.equal(convertToEnglish("chro,e", getLayout("french")).text, "chrome");
  assert.equal(convertToEnglish("zoutube", getLayout("german")).text, "youtube");
  assert.equal(convertToEnglish("ζοομ", getLayout("greek")).text, "zoom");
  assert.equal(convertToEnglish("άέήίόύώ", getLayout("greek")).text, "aehioyv");
  assert.equal(convertToEnglish("ΆΈΉΊΌΎΏ", getLayout("greek")).text, "AEHIOYV");
  assert.equal(convertToEnglish("α\u0301", getLayout("greek")).text, "a");
  assert.equal(convertToEnglish("΄", getLayout("greek")).text, ";");
  assert.equal(convertToEnglish("café", getLayout("greek")).text, "café");
  assert.equal(convertToEnglish("cafe\u0301", getLayout("greek")).text, "cafe\u0301");
});

test("converts US English key positions to the selected layout", () => {
  assert.equal(convertFromEnglish("ghbdtn", getLayout("russian")).text, "привет");
  assert.equal(convertFromEnglish("ghbdtn", getLayout("ukrainian")).text, "привет");
  assert.equal(convertFromEnglish("hello", getLayout("russian")).text, "руддщ");
});

test("automatically detects non-Latin layouts and finds Windows applications", () => {
  const correction = detectCorrection("сгкыщк", applications, "auto");
  assert.equal(correction.query, "cursor");
  assert.equal(correction.applications[0]?.application.name, "Cursor");
});

test("automatically converts precomposed Greek accents", () => {
  const correction = detectCorrection("ζόομ", applications, "auto");
  assert.equal(correction.query, "zoom");
  assert.equal(correction.layout?.id, "greek");
  assert.equal(correction.applications[0]?.application.name, "Zoom");
});

test("preserves non-Greek accents in mixed-script queries", () => {
  const correction = detectCorrection("ζόομ café", applications, "auto");
  assert.equal(correction.query, "zoom café");
  assert.equal(correction.layout?.id, "greek");
});

test("automatically detects a Latin layout from a strong application match", () => {
  const correction = detectCorrection("zoutube", applications, "auto");
  assert.equal(correction.query, "youtube");
  assert.equal(correction.layout?.id, "german");
});

test("automatically converts fallback queries from English key positions to Russian", () => {
  const correction = detectCorrection(",kjryjn", [], "auto");
  assert.equal(correction.query, "блокнот");
  assert.equal(correction.layout?.id, "russian");
  assert.equal(correction.direction, "fromEnglish");
});

test("converts unmatched Latin fallback queries to the default Russian layout", () => {
  const correction = detectCorrection("ordinary web query", [], "auto");
  assert.notEqual(correction.query, "ordinary web query");
  assert.equal(correction.layout?.id, "russian");
  assert.equal(correction.direction, "fromEnglish");
});

test("honors a manually selected layout", () => {
  const correction = detectCorrection("chro,e", applications, "french");
  assert.equal(correction.query, "chrome");
  assert.equal(correction.layout?.id, "french");
});

test("supports English-to-Russian conversion with the selected direction", () => {
  const correction = detectCorrection("ghbdtn", applications, "russian", "fromEnglish");
  assert.equal(correction.query, "привет");
  assert.equal(correction.layout?.id, "russian");
});
