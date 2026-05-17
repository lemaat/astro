import type { Metadata } from "next";
import { AstroProvider } from "@/context/AstroContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Astro - Discover Your Spark",
  description: "An AI-powered space adventure that helps children discover their natural talents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AstroProvider>{children}</AstroProvider>
      </body>
    </html>
  );
}