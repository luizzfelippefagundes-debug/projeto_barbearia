import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { NOME_BARBEARIA } from "../lib/constants";

const headingFont = Plus_Jakarta_Sans({
  variable: "--font-heading-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: NOME_BARBEARIA,
  description: "Painel de gestão e agendamento da barbearia.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${headingFont.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-bg text-text-primary antialiased">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#4756e6",
              colorBackground: "#ffffff",
              colorForeground: "#12131a",
              colorMutedForeground: "#6b7280",
              colorInput: "#ffffff",
              colorInputForeground: "#12131a",
              colorBorder: "#e5e7f0",
              colorDanger: "#dc2626",
              colorSuccess: "#16a34a",
              colorWarning: "#d97706",
              borderRadius: "14px",
              fontFamily: "var(--font-inter), sans-serif",
            },
            elements: {
              card: "border border-[#e5e7f0] shadow-md",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
