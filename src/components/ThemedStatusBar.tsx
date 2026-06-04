import { useTheme } from "@/context/theme";
import { StatusBar } from "expo-status-bar";

function ThemedStatusBar() {
  const { isDarkMode } = useTheme();
  return <StatusBar style={isDarkMode ? "light" : "dark"} />;
}

export default ThemedStatusBar;
