"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { api, getImageUrl } from "@/lib/api";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/SkeletonCard";
import { ArrowRight, ShieldCheck, Truck, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { STORE_CONTACTS } from "@/config/contacts";

export default function HomePage() {
  const { t } = useLanguage();

  // Fetch Categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
  });

  // Fetch Featured Products
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await api.get("/products?is_featured=true&limit=8");
      return res.data;
    },
  });

  // Fetch newest products
  const { data: newData, isLoading: newLoading } = useQuery({
    queryKey: ["new-products"],
    queryFn: async () => {
      const res = await api.get("/products?is_new=true&limit=4");
      return res.data;
    },
  });

  const featuredProducts = featuredData?.items || [];
  const newProducts = newData?.items || [];

  const marqueeItems = Array.from({ length: 10 });

  return (
    <div className="space-y-0">
      {/* Clean Hero Section */}
      <HeroSection />

      {/* 3 Quality Tiers Showcase Section */}
      <section className="bg-bg-main py-10 sm:py-14 border-b border-border-main transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500">
              {t("Sifat Darajalari", "Уровни Качества")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main">
              {t("Soat Sifat Darajalari", "Категории Исполнения Часов")}
            </h2>
            <p className="text-xs text-text-muted">
              {t("O'zingizga va hamyoningizga mos sifat darajasini tanlang", "Выберите подходящий уровень качества и бюджета")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Original Card */}
            <Link
              href="/shop?quality_tier=original"
              className="group relative rounded-2xl overflow-hidden bg-bg-card border border-border-main p-6 transition-all hover:border-amber-500/50 hover:shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {t("Original", "Original")}
                </span>
                <h3 className="text-xl font-extrabold text-text-main group-hover:text-amber-500 transition-colors">
                  {t("Original Soatlar", "Оригинальные Часы")}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {t(
                    "Rasmiy Shveytsariya hamda yapon brendlarining 100% original soatlari.",
                    "Официальные оригинальные модели швейцарских и японских брендов."
                  )}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-text-main group-hover:text-amber-500">
                <span>{t("Kolleksiyaga o'tish", "Смотреть коллекцию")}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Lux Copy Card */}
            <Link
              href="/shop?quality_tier=lux_copy"
              className="group relative rounded-2xl overflow-hidden bg-bg-card border border-border-main p-6 transition-all hover:border-amber-500/50 hover:shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  {t("Lux Kopiya", "Lux Копия")}
                </span>
                <h3 className="text-xl font-extrabold text-text-main group-hover:text-amber-500 transition-colors">
                  {t("Lux Nusxa Soatlar", "Часы Lux Копия")}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {t(
                    "Yuqori sifatli materiallar va chidamli mexanizmga ega nusxa soatlar.",
                    "Качественная копия из отличных материалов и надежным механизмом."
                  )}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-text-main group-hover:text-amber-500">
                <span>{t("Kolleksiyaga o'tish", "Смотреть коллекцию")}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Super Clone Card */}
            <Link
              href="/shop?quality_tier=super_clone"
              className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/10 via-bg-card to-bg-card border border-amber-500/30 p-6 transition-all hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-black font-extrabold">
                  {t("Super Klon 1:1", "Super Clone 1:1")}
                </span>
                <h3 className="text-xl font-extrabold text-text-main group-hover:text-amber-500 transition-colors">
                  {t("Super Klon 1:1", "Super Clone 1:1")}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {t(
                    "Original bilan og'irligi, korpus detallari va mexanizmi bo'yicha deyarli 1:1 bir xil.",
                    "Неотличимые от оригинала по весу, деталям корпуса и механизму."
                  )}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-amber-500">
                <span>{t("Kolleksiyaga o'tish", "Смотреть коллекцию")}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-bg-main py-10 sm:py-14 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-subtle">
                {t("Tanlangan", "Избранное")}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-text-main mt-0.5">
                {t("Tavsiya etilgan soatlar", "Рекомендуемые часы")}
              </h2>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-main hover:text-text-muted transition-colors group"
            >
              <span>{t("Barchasi", "Все")}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {featuredLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : featuredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </div>
      </section>

      {/* Continuous Marquee Ticker */}
      <section className="w-full bg-black py-3.5 border-y border-amber-500/20 overflow-hidden select-none my-2 shadow-xs">
        <div className="flex whitespace-nowrap animate-marquee">
          {marqueeItems.map((_, idx) => (
            <div key={idx} className="flex items-center gap-6 mx-8 shrink-0">
              <div className="relative h-7 w-7 rounded-lg bg-black overflow-hidden border border-amber-500/40 p-0.5 shadow-xs flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Khan Store Logo"
                  width={28}
                  height={28}
                  className="object-contain w-full h-full"
                />
              </div>
              <span className="text-white font-bold text-sm tracking-[0.2em] uppercase font-mono">
                KHAN STORE PREMIUM WATCHES
              </span>
              <span className="text-amber-500 text-xs">✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* Advantages */}
      <section className="bg-bg-subtle border-y border-border-main py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-bg-card border border-border-main">
              <div className="w-10 h-10 rounded-lg bg-bg-subtle text-text-main flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-text-main font-bold text-xs">{t("Sinchiklab tekshirilgan sifat", "Проверенное качество")}</h4>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {t("Har bir soat qo'lda sinchiklab tekshiriladi", "Каждая модель проходит ручную проверку")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-bg-card border border-border-main">
              <div className="w-10 h-10 rounded-lg bg-bg-subtle text-text-main flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-text-main font-bold text-xs">{t("Butun dunyo bo'ylab yetkazish", "Доставка по всему миру")}</h4>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {t("Samarqand, O'zbekiston va xalqaro delivery", "Быстрая доставка по всему миру")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-bg-card border border-border-main">
              <div className="w-10 h-10 rounded-lg bg-bg-subtle text-text-main flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-text-main font-bold text-xs">{t("Mijozlarni qo'llash", "Поддержка клиентов")}</h4>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {t("Har kuni 09:00 - 21:00", "Каждый день 09:00 - 21:00")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="bg-bg-main py-10 sm:py-14 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                  {t("Yangiliklar", "Новинки")}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-text-main mt-0.5">
                  {t("Yangi kelganlar", "Новые поступления")}
                </h2>
              </div>

              <Link
                href="/shop?sort=newest"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-main hover:text-text-muted transition-colors group"
              >
                <span>{t("Barchasi", "Все")}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {newLoading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                : newProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
