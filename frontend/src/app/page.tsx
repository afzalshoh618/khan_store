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

      {/* Dynamic Circular Categories Showcase Section */}
      <section className="bg-bg-main py-10 sm:py-14 border-b border-border-main transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500">
              {t("Kolleksiyalar", "Коллекции")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main">
              {t("Kategoriya va Kolleksiyalar", "Категории и Коллекции")}
            </h2>
            <p className="text-xs text-text-muted">
              {t("O'zingizga mos premium aksessuar kategoriyasini tanlang", "Выберите подходящую категорию аксессуаров")}
            </p>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-6 sm:gap-10">
            {categoriesLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-bg-subtle border border-border-main" />
                    <div className="h-4 w-16 bg-bg-subtle rounded" />
                  </div>
                ))
              : categories?.map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    className="group flex flex-col items-center gap-3 transition-transform active:scale-95"
                  >
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-amber-500/30 via-border-main to-amber-500/60 group-hover:from-amber-500 group-hover:to-amber-300 transition-all duration-300 shadow-md group-hover:shadow-amber-500/20">
                      <div className="relative w-full h-full rounded-full overflow-hidden bg-bg-subtle">
                        {cat.image_url ? (
                          <Image
                            src={getImageUrl(cat.image_url)}
                            alt={cat.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-lg text-text-main uppercase bg-bg-card">
                            {cat.name.slice(0, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-extrabold text-xs sm:text-sm text-text-main group-hover:text-amber-500 transition-colors">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <span className="text-[10px] text-text-muted block truncate max-w-[120px]">
                          {cat.description}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
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
                {t("Tavsiya etilgan mahsulotlar", "Рекомендуемые товары")}
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
                KHAN STORE PREMIUM
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
                <h4 className="text-text-main font-bold text-xs">{t("100% Original", "100% Оригинал")}</h4>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {t("Rasmiy kafolatli aksessuarlar", "Официальная гарантия")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-bg-card border border-border-main">
              <div className="w-10 h-10 rounded-lg bg-bg-subtle text-text-main flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-text-main font-bold text-xs">{t("Tezkor yetkazish", "Быстрая доставка")}</h4>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {t("Samarqand va viloyatlarga", "По всем регионам")}
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
