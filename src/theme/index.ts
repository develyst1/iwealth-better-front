import type { ThemeConfig } from "antd";
import {
  brandPrimary,
  brandPrimaryActive,
  brandPrimaryHover,
} from "./colors";

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: brandPrimary,
    colorLink: brandPrimary,
    colorInfo: brandPrimary,
    borderRadius: 8,
    fontFamily: "var(--font-thai), sans-serif",
  },
  components: {
    Button: {
      colorPrimaryHover: brandPrimaryHover,
      colorPrimaryActive: brandPrimaryActive,
    },
  },
};
