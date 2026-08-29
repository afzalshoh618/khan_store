import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "Khan Store Premium — Eksklyuziv Soatlar Do'koni",
  description:
    "Khan Store Premium — Original, Lux Nusxa va Super Klon 1:1 Shveytsariya hamda brend soatlari do'koni. Samarqand va butun dunyo bo'ylab yetkazish.",
  keywords: "Khan Store Premium, Soatlar, Watch Store Samarqand, Atlas SM, Original Soatlar, Lux Kopiya, Super Klon 1:1, Rolex, Patek Philippe, Tissot",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Khan Store Premium — Soatlar Do'koni",
    description: "Original, Lux Nusxa va Super Klon 1:1 soatlar. Samarqanddan butun dunyo bo'ylab yetkazish.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-main text-text-main min-h-screen flex flex-col justify-between selection:bg-accent-main selection:text-accent-fg font-sans transition-colors">
        <Providers>
          <Navbar />
          <main className="flex-1 bg-bg-main">{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
