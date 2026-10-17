import type { Application } from "@raycast/api";
import {
  convertFromEnglish,
  convertToEnglish,
  getLayout,
  LAYOUTS,
  type LayoutDefinition,
  type LayoutId,
  type LayoutMode,
} from "./layout";
import { rankApplications, type RankedApplication } from "./search";

export type ConversionDirection = "auto" | "toEnglish" | "fromEnglish";

export type CorrectionCandidate = {
  query: string;
  layout?: LayoutDefinition;
  direction: "none" | Exclude<ConversionDirection, "auto">;
  changedCharacters: number;
  applications: RankedApplication[];
  score: number;
};

export type DetectedCorrection = CorrectionCandidate & {
  alternatives: CorrectionCandidate[];
};

function createCandidate(
  rawQuery: string,
  applications: Application[],
  layout?: LayoutDefinition,
  direction: Exclude<ConversionDirection, "auto"> = "toEnglish",
): CorrectionCandidate {
  const conversion = layout
    ? direction === "fromEnglish"
      ? convertFromEnglish(rawQuery, layout)
      : convertToEnglish(rawQuery, layout)
    : { text: rawQuery, changedCharacters: 0 };
  const rankedApplications = rankApplications(applications, conversion.text);
  const bestApplicationScore = rankedApplications[0]?.score ?? 0;
  const hasScriptSignal =
    layout?.scriptPattern?.test(direction === "fromEnglish" ? conversion.text : rawQuery) ?? false;
  const scriptBonus = hasScriptSignal ? 1500 + conversion.changedCharacters * 5 : 0;

  return {
    query: conversion.text,
    layout,
    direction: layout ? direction : "none",
    changedCharacters: conversion.changedCharacters,
    applications: rankedApplications,
    score: bestApplicationScore * 10 + scriptBonus,
  };
}

function deduplicateCandidates(candidates: CorrectionCandidate[]): CorrectionCandidate[] {
  const bestByQuery = new Map<string, CorrectionCandidate>();

  for (const candidate of candidates) {
    const existing = bestByQuery.get(candidate.query);
    if (!existing || candidate.score > existing.score) bestByQuery.set(candidate.query, candidate);
  }

  return Array.from(bestByQuery.values());
}

export function detectCorrection(
  rawQuery: string,
  applications: Application[],
  mode: LayoutMode,
  direction: ConversionDirection = "auto",
): DetectedCorrection {
  if (mode !== "auto") {
    const layout = getLayout(mode);
    const detectedDirection =
      direction === "auto"
        ? layout.scriptPattern?.test(rawQuery)
          ? "toEnglish"
          : "fromEnglish"
        : direction;
    const candidate = createCandidate(rawQuery, applications, layout, detectedDirection);
    return { ...candidate, alternatives: [] };
  }

  const original = createCandidate(rawQuery, applications);
  if (direction === "auto") {
    const hasNonLatinSignal = LAYOUTS.some((layout) => layout.scriptPattern?.test(rawQuery) ?? false);
    if (!hasNonLatinSignal) {
      const candidates = [
        original,
        ...LAYOUTS.map((layout) => createCandidate(rawQuery, applications, layout, "toEnglish")),
        createCandidate(rawQuery, applications, getLayout("russian"), "fromEnglish"),
      ];
      const sorted = deduplicateCandidates(candidates).sort(
        (left, right) => right.score - left.score || right.changedCharacters - left.changedCharacters,
      );
      const bestForwardMatch = sorted.find(
        (candidate) =>
          candidate.direction === "toEnglish" &&
          candidate.changedCharacters > 0 &&
          candidate.applications.length > 0,
      );
      const russianCandidate = sorted.find(
        (candidate) => candidate.direction === "fromEnglish" && candidate.layout?.id === "russian",
      );
      const selected =
        bestForwardMatch && (!russianCandidate || bestForwardMatch.score > russianCandidate.score)
          ? bestForwardMatch
          : (russianCandidate ?? original);

      return {
        ...selected,
        alternatives: sorted
          .filter((candidate) => candidate.query !== selected.query && candidate.changedCharacters > 0)
          .slice(0, 4),
      };
    }
  }

  if (direction === "fromEnglish") {
    const candidates = LAYOUTS.map((layout) => createCandidate(rawQuery, applications, layout, direction));
    const sorted = candidates.sort(
      (left, right) => right.score - left.score || right.changedCharacters - left.changedCharacters,
    );
    const best = sorted[0];
    const selected = best && best.score > original.score ? best : original;
    return {
      ...selected,
      alternatives: sorted
        .filter((candidate) => candidate.query !== selected.query && candidate.changedCharacters > 0)
        .slice(0, 4),
    };
  }

  const candidates = deduplicateCandidates([
    original,
    ...LAYOUTS.map((layout) => createCandidate(rawQuery, applications, layout)),
  ]);
  const sorted = candidates.sort(
    (left, right) => right.score - left.score || right.changedCharacters - left.changedCharacters,
  );
  const best = sorted[0] ?? original;
  const shouldKeepOriginal = !best.layout?.scriptPattern && best.score < original.score + 1500;
  const selected = shouldKeepOriginal ? original : best;

  return {
    ...selected,
    alternatives: sorted
      .filter((candidate) => candidate.query !== selected.query && candidate.changedCharacters > 0)
      .slice(0, 4),
  };
}

export function isLayoutMode(value: string): value is LayoutMode {
  return value === "auto" || LAYOUTS.some((layout) => layout.id === (value as LayoutId));
}

export function isConversionDirection(value: string): value is ConversionDirection {
  return value === "auto" || value === "toEnglish" || value === "fromEnglish";
}
