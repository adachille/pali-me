import BooksOpen from "@/assets/icons/svg/books-open.svg";
import CelebrateSunrise from "@/assets/icons/svg/celebrate-sunrise.svg";
import EditPencilSoft from "@/assets/icons/svg/edit-pencil-soft.svg";
import LotusIcon from "@/assets/icons/svg/lotus.svg";
import SparkleLotusLight from "@/assets/icons/svg/sparkle-lotus-light.svg";
import LotusSun from "@/assets/icons/svg/lotus-sun.svg";
import MoonAndClouds from "@/assets/icons/svg/moon-and-clouds.svg";
import AutoThemeIcon from "@/assets/icons/svg/auto-theme-icon.svg";
import type { SvgProps } from "react-native-svg";

const SVG_ICONS = {
  "books-open": BooksOpen,
  "celebrate-sunrise": CelebrateSunrise,
  "edit-pencil-soft": EditPencilSoft,
  lotus: LotusIcon,
  "sparkle-lotus-light": SparkleLotusLight,
  "lotus-sun": LotusSun,
  "moon-and-clouds": MoonAndClouds,
  "auto-theme-icon": AutoThemeIcon,
} satisfies Record<string, React.FC<SvgProps>>;

type IconName = keyof typeof SVG_ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export const Icon = ({ name, size = 24, color = "#000" }: IconProps) => {
  const SvgComponent = SVG_ICONS[name];

  // Jest can resolve SVG modules to plain objects depending on transformer setup.
  if (typeof SvgComponent !== "function") {
    return null;
  }

  return <SvgComponent width={size} height={size} color={color} />;
};
