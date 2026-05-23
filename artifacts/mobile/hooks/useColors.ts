import colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";

/**
 * Returns design tokens for the manually-selected (or system-resolved) color scheme.
 * Uses ThemeContext so users can override dark/light manually from within the app.
 */
export function useColors() {
  const { resolved } = useTheme();
  const palette = resolved === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
