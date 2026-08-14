import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { NOME_BARBEARIA } from "../lib/constants";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${oswald.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-bg text-text-primary antialiased">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#c4432b",
              colorBackground: "#211c16",
              colorForeground: "#f2ede4",
              colorMutedForeground: "#9c948a",
              colorInput: "#17140f",
              colorInputForeground: "#f2ede4",
              colorBorder: "#3a322a",
              colorDanger: "#d14b3c",
              colorSuccess: "#4c8b5b",
              colorWarning: "#c99a3c",
              fontFamily: "var(--font-inter), sans-serif",
            },
            elements: {
              card: "border border-[#3a322a]",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
