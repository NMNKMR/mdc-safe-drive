import { darkColors, lightColors } from "@/constants/colors";
import { useThemeStore } from "@/store/themeStore";
import { ReactNode } from "react";
import { useColorScheme } from "react-native";
import { ThemeContext } from "./theme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const mode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);

  const isDarkMode =
    mode === "system" ? systemColorScheme === "dark" : mode === "dark";
  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{ colors, isDarkMode, mode, toggleTheme: setThemeMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
