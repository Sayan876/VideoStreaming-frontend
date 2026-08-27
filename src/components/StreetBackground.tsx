import { useTheme } from "next-themes";
import light from "../assets/light.jpg";
import dark from "../assets/dark.jpg";

const StreetBackground = () => {
  const { resolvedTheme } = useTheme();

  const background = resolvedTheme === "dark" ? dark : light;

  return (
    <img
      src={background}
      alt=""
      className="fixed inset-0 z-[9999] h-full w-full object-cover"
    />
  );
};

export default StreetBackground;