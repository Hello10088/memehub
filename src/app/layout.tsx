import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Inter } from "next/font/google";

import { Providers } from "~/components/providers";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { cn } from "~/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "MemeBox - Your Meme Toolbox",
  description: "Upload, manage, search and share your meme collection.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(geist.variable, "font-sans", inter.variable)}>
      <body>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
