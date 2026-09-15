import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { theme } from "@/theme";
import "./globals.css";

const thai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "iWealth Better",
  description: "Portfolio + historical event compare (stub v0)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${thai.variable}`} suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <div
            style={{
              maxWidth: 960,
              margin: "0 auto",
              padding: "16px 16px 40px",
            }}
          >
            {children}
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}
