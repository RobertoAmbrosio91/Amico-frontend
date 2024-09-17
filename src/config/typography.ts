type FontStyle = {
  fontSize?: number;
  color?: string;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
};

type AppFontStyles = {
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
};

export const typography: { logo: FontStyle, h1: FontStyle, h3: FontStyle, appFont: AppFontStyles } = {
  logo: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#ffffff",
  },
  h1: {
      fontSize: 35,
  },
  h3: {
      fontSize: 20,
      color: "#ffffff",
      fontWeight: "bold",
  },
  appFont: {
      300: "Inter_300",
      400: "Inter_400",
      500: "Inter_500",
      600: "Inter_600",
      700: "Inter_700",
  },
};

export default typography;
