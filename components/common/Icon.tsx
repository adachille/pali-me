import AudioOn from "@/assets/icons/svg/audio-on.svg";
import BooksOpen from "@/assets/icons/svg/books-open.svg";
import CardsStackedBare from "@/assets/icons/svg/cards-stacked-bare.svg";
import EditPencilSoft from "@/assets/icons/svg/edit-pencil-soft.svg";
import LotusIcon from "@/assets/icons/svg/lotus.svg";
import PlayTraingle from "@/assets/icons/svg/play-traingle.svg";
import type { SvgProps } from "react-native-svg";

const SVG_ICONS: Record<string, React.FC<SvgProps>> = {
  "audio-on": AudioOn,
  "books-open": BooksOpen,
  "cards-stacked-bare": CardsStackedBare,
  "edit-pencil-soft": EditPencilSoft,
  "lotus": LotusIcon,
  "play-traingle": PlayTraingle,
};

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
