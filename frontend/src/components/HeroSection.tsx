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
          {t("Original Soatlar, Ko'zoynaklar va Kepkalar", "Оригинальные Часы, Очки и Кепки")}
        </h1>

        {/* Short Subtext */}
        <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto leading-relaxed">
          {t(
            "Samarqand hamda butun O'zbekiston bo'ylab kafolatlangan aksessuarlar do'koni.",
            "Магазин сертифицированных аксессуаров с доставкой по всему Узбекистану."
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
