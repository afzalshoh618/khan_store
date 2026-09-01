"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useLanguage, LanguageSwitcher } from "@/lib/i18n";
import { ThemeToggle } from "@/lib/theme";
import SearchModal from "@/components/SearchModal";

import { isAdminRoute } from "@/lib/adminPath";

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toggleCart, getTotalItems } = useCartStore();
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Completely hide customer Navbar on Admin routes
  if (isAdminRoute(pathname)) {
    return null;
  }

  const totalCartCount = mounted ? getTotalItems() : 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-bg-main/95 border-b border-border-main backdrop-blur-md transition-colors">
      {/* Top Bar - Ultra Clean Minimalist */}
      <div className="bg-bg-subtle border-b border-border-main py-1.5 px-4 text-xs text-text-muted">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-[11px] font-medium tracking-wide text-text-muted truncate">
            {t("Khan Store Premium — Eksklyuziv Soatlar Do'koni", "Khan Store Premium — Магазин Эксклюзивных Часов")}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-[11px] font-medium text-text-main">+998 91 547 22 22</span>
            <span className="hidden sm:inline text-text-subtle text-[10px]">|</span>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Official Logo */}
        <Link href="/" className="group flex items-center gap-2.5" title="Khan Store Premium">
          <div className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-black overflow-hidden border border-amber-500/40 p-0.5 shadow-xs group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Khan Store Premium"
              width={44}
              height={44}
              priority
              className="object-contain w-full h-full"
            />
          </div>
          <div className="flex flex-col justify-center leading-none">
            <span className="font-extrabold text-xs sm:text-sm tracking-wider text-text-main group-hover:text-amber-500 transition-colors uppercase font-mono">
              KHAN STORE
            </span>
            <span className="text-[8px] font-bold tracking-[0.25em] text-text-subtle uppercase">
              PREMIUM
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold uppercase tracking-widest text-text-muted">
          <Link href="/" className="hover:text-text-main transition-colors">
            {t("Bosh sahifa", "Главная")}
          </Link>
          <Link href="/shop" className="hover:text-text-main transition-colors">
            {t("Katalog", "Каталог")}
          </Link>
          <Link href="/shop?quality_tier=original" className="hover:text-text-main transition-colors">
            {t("Original", "Original")}
          </Link>
          <Link href="/shop?quality_tier=lux_copy" className="hover:text-text-main transition-colors">
            {t("Lux Kopiya", "Lux Копия")}
          </Link>
          <Link href="/shop?quality_tier=super_clone" className="hover:text-amber-500 text-amber-500/90 font-bold transition-colors">
            {t("Super Klon 1:1", "Супер Клон 1:1")}
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-lg text-text-main hover:bg-bg-subtle transition-colors flex items-center justify-center"
            title={t("Qidirish", "Поиск")}
            aria-label="Qidirish"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Cart Trigger */}
          <button
            onClick={toggleCart}
            className="relative p-2 rounded-lg text-text-main hover:bg-bg-subtle transition-colors flex items-center gap-1.5"
            aria-label="Savat"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalCartCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-accent-main text-accent-fg text-[10px] font-bold flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-main hover:bg-bg-subtle rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-bg-main border-b border-border-main px-6 py-4 space-y-3 font-semibold text-xs text-text-main uppercase tracking-wider">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-1">
            {t("Bosh sahifa", "Главная")}
          </Link>
          <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block py-1">
            {t("Katalog", "Каталог")}
          </Link>
          <Link href="/shop?quality_tier=original" onClick={() => setMobileMenuOpen(false)} className="block py-1">
            {t("Original", "Original")}
          </Link>
          <Link href="/shop?quality_tier=lux_copy" onClick={() => setMobileMenuOpen(false)} className="block py-1">
            {t("Lux Kopiya", "Lux Копия")}
          </Link>
          <Link href="/shop?quality_tier=super_clone" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-amber-500 font-bold">
            {t("Super Klon 1:1", "Супер Клон 1:1")}
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsSearchOpen(true);
            }}
            className="w-full text-left py-1 flex items-center gap-2 text-text-muted hover:text-text-main"
          >
            <Search className="w-4 h-4" />
            <span>{t("Qidiruv", "Поиск")}</span>
          </button>
        </div>
      )}

      {/* Global Interactive Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
