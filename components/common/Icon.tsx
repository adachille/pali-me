import BooksOpen from "@/assets/icons/svg/books-open.svg";
import CardsStackedBare from "@/assets/icons/svg/cards-stacked-bare.svg";
import type { SvgProps } from "react-native-svg";

const SVG_ICONS: Record<string, React.FC<SvgProps>> = {
  "books-open": BooksOpen,
  "cards-stacked-bare": CardsStackedBare,
};

type IconName = keyof typeof SVG_ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export const Icon = ({ name, size = 24, color = "#000" }: IconProps) => {
  const SvgComponent = SVG_ICONS[name];
  return <SvgComponent width={size} height={size} color={color} />;
};
