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
