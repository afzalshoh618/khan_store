"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { STORE_CONTACTS } from "@/config/contacts";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-bg-subtle border-b border-border-main transition-colors py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        {/* Subtitle Tag */}
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-text-subtle block">
          {STORE_CONTACTS.storeName}
        </span>

        {/* Main Heading */}
        <h1 className="text-2xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-text-main leading-tight">
          {t("Dunyo Darajasidagi Premium Soatlar Kolleksiyasi", "Коллекция Часов Премиум Исполнения")}
        </h1>

        {/* Short Subtext */}
        <p className="text-xs sm:text-sm text-text-muted max-w-2xl mx-auto leading-relaxed">
          {t(
            "Original, Lux Nusxa hamda Super Klon 1:1 modellar — har bir did va hamyonga mos eng saralangan Shveytsariya brendlari. Samarqanddan butun dunyo bo'ylab tezkor yetkazib beramiz.",
            "Модели Original, Lux Копия и Super Clone 1:1 — эксклюзивный выбор под любой стиль и бюджет. Быстрая доставка из Самарканда по всему миру."
          )}
        </p>

        {/* Single Minimalist Action Button */}
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-accent-main text-accent-fg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity group shadow-xs"
          >
            <span>{t("Katalogni ko'rish", "Открыть каталог")}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
