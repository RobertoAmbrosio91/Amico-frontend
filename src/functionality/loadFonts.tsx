import { useFonts } from "expo-font";

export const useAppFonts = () => {
  const [loaded] = useFonts({
    Inter_400: require("../../assets/fonts/static/Inter-Regular.ttf"),
    Inter_500: require("../../assets/fonts/static/Inter-Medium.ttf"),
    Inter_600: require("../../assets/fonts/static/Inter-SemiBold.ttf"),
    Inter_700: require("../../assets/fonts/static/Inter-Bold.ttf"),
  });

  return loaded;
};
