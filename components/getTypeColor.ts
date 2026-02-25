import type { ThemeColors } from "@/constants/theme";

export function getTypeColor(colors: ThemeColors, type: string): string {
  const map: Record<string, string> = {
    word: colors.itemTypeWord,
    prefix: colors.itemTypePrefix,
    suffix: colors.itemTypeSuffix,
    root: colors.itemTypeRoot,
    particle: colors.itemTypeParticle,
  };
  return map[type] ?? colors.disabled;
}
