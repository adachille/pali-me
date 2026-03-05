import AudioOn from "@/assets/icons/svg/audio-on.svg";
import BooksOpen from "@/assets/icons/svg/books-open.svg";
import CardsStackedBare from "@/assets/icons/svg/cards-stacked-bare.svg";
import CelebrateBodhiLeaf from "@/assets/icons/svg/celebrate-bodhi-leaf.svg";
import CelebrateBodhiLeafHeart from "@/assets/icons/svg/celebrate-bodhi-leaf-heart.svg";
import CelebrateLotusBloom from "@/assets/icons/svg/celebrate-lotus-bloom.svg";
import CelebrateSunrise from "@/assets/icons/svg/celebrate-sunrise.svg";
import CelebrateSunrise2 from "@/assets/icons/svg/celebrate-sunrise-2.svg";
import EditPencilSoft from "@/assets/icons/svg/edit-pencil-soft.svg";
import LotusIcon from "@/assets/icons/svg/lotus.svg";
import PinSimple from "@/assets/icons/svg/pin-simple.svg";
import PlayTraingle from "@/assets/icons/svg/play-traingle.svg";
import SparkleLotusLight from "@/assets/icons/svg/sparkle-lotus-light.svg";
import SparkleThreeStars from "@/assets/icons/svg/sparkle-three-stars.svg";
import type { SvgProps } from "react-native-svg";

const SVG_ICONS: Record<string, React.FC<SvgProps>> = {
  "audio-on": AudioOn,
  "books-open": BooksOpen,
  "cards-stacked-bare": CardsStackedBare,
  "celebrate-bodhi-leaf": CelebrateBodhiLeaf,
  "celebrate-bodhi-leaf-heart": CelebrateBodhiLeafHeart,
  "celebrate-lotus-bloom": CelebrateLotusBloom,
  "celebrate-sunrise": CelebrateSunrise,
  "celebrate-sunrise-2": CelebrateSunrise2,
  "edit-pencil-soft": EditPencilSoft,
  "lotus": LotusIcon,
  "pin-simple": PinSimple,
  "play-traingle": PlayTraingle,
  "sparkle-lotus-light": SparkleLotusLight,
  "sparkle-three-stars": SparkleThreeStars,
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
