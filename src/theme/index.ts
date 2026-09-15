import { createTheme } from "@mantine/core";
import { brand } from "./colors";

export const theme = createTheme({
  primaryColor: "brand",
  colors: { brand },
  defaultRadius: "md",
  fontFamily: "var(--font-thai), sans-serif",
  headings: { fontFamily: "var(--font-thai), sans-serif", fontWeight: "700" },
});
