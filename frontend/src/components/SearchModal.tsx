"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, getImageUrl } from "@/lib/api";
import { Search, X, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Global Search Query across all store products
  const { data: searchData, isLoading: isSearchLoading } = useQuery({
    queryKey: ["global-search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return { items: [], total: 0 };
      const res = await api.get(`/products?search=${encodeURIComponent(searchTerm.trim())}&limit=6`);
      return res.data;
    },
    enabled: isOpen && searchTerm.trim().length > 0,
  });

  // Recommended / Featured products fallback (shown when 0 search results or empty query)
  const { data: featuredData } = useQuery({
    queryKey: ["search-featured-fallback"],
    queryFn: async () => {
      const res = await api.get("/products?is_featured=true&limit=4");
      return res.data;
    },
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const searchResults = searchData?.items || [];
  const totalResults = searchData?.total || 0;
  const recommendedProducts = featuredData?.items || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      onClose();
    }
  };

  const handleSelectProduct = (slug: string) => {
    router.push(`/product/${slug}`);
    onClose();
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("uz-UZ") + " so'm";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Search Dialog Box */}
      <div className="relative w-full max-w-2xl bg-bg-card border border-border-main rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[82vh]">
        {/* Search Input Header */}
        <form onSubmit={handleSearchSubmit} className="p-4 border-b border-border-main flex items-center gap-3 bg-bg-subtle">
          <Search className="w-5 h-5 text-amber-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("Butun do'kon bo'yicha qidirish (Rolex, Casio, kepka, ko'zoynak...)", "Поиск по всему магазину...")}
            className="flex-1 bg-transparent text-text-main text-sm sm:text-base font-medium focus:outline-none placeholder:text-text-subtle"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="p-1 rounded-full text-text-muted hover:text-text-main hover:bg-bg-card transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-accent-main text-accent-fg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0 shadow-xs"
          >
            {t("Qidirish", "Найти")}
          </button>
        </form>

        {/* Results / Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isSearchLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-text-muted">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <span className="text-xs">{t("Do'kondan qidirilmoqda...", "Поиск по магазину...")}</span>
            </div>
          ) : searchTerm.trim().length > 0 ? (
            searchResults.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-text-muted px-1">
                  <span>
                    {t("Qidiruv natijalari:", "Результаты поиска:")} <strong className="text-text-main font-bold">{totalResults} ta mahsulot</strong>
                  </span>
                  <Link
                    href={`/shop?search=${encodeURIComponent(searchTerm.trim())}`}
                    onClick={onClose}
                    className="text-amber-500 hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>{t("Barchasini katalogda ko'rish", "Смотреть все в каталоге")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults.map((product: any) => {
                    const imgUrl = getImageUrl(
                      product.images?.find((img: any) => img.is_primary)?.image_url || product.images?.[0]?.image_url
                    );
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product.slug)}
                        className="p-2.5 rounded-xl bg-bg-subtle hover:bg-bg-hover border border-border-main flex gap-3 items-center cursor-pointer transition-all group shadow-xs hover:shadow-md"
                      >
                        <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-bg-card shrink-0 border border-border-main">
                          <Image src={imgUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-amber-500 block truncate">
                            {product.brand?.name || "Khan Store"}
                          </span>
                          <h4 className="text-xs font-bold text-text-main truncate group-hover:text-amber-500 transition-colors">
                            {product.name}
                          </h4>
                          <span className="text-xs font-extrabold text-text-main mt-0.5 block">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* NO MATCHES FOUND - Friendly message + Recommended Products */
              <div className="space-y-6 py-2">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1.5">
                  <p className="text-xs sm:text-sm font-semibold text-text-main">
                    {t(
                      `Kechirasiz, "${searchTerm}" bo'yicha do'kondan hech qanday mahsulot topilmadi.`,
                      `К сожалению, по запросу "${searchTerm}" ничего не найдено.`
                    )}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {t("Iltimos, so'zni boshqacha yozib ko'ring yoki quyidagi tavsiya etilgan mahsulotlarni ko'rib chiqing:", "Попробуйте изменить запрос или выберите из рекомендуемых товаров:")}
                  </p>
                </div>

                {/* Recommended Products Grid */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-text-main px-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{t("Tavsiya etilgan mahsulotlar", "Рекомендуемые товары")}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {recommendedProducts.map((product: any) => {
                      const imgUrl = getImageUrl(
                        product.images?.find((img: any) => img.is_primary)?.image_url || product.images?.[0]?.image_url
                      );
                      return (
                        <div
                          key={product.id}
                          onClick={() => handleSelectProduct(product.slug)}
                          className="p-2.5 rounded-xl bg-bg-subtle hover:bg-bg-hover border border-border-main flex gap-3 items-center cursor-pointer transition-all group shadow-xs"
                        >
                          <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-bg-card shrink-0 border border-border-main">
                            <Image src={imgUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-text-main truncate group-hover:text-amber-500 transition-colors">
                              {product.name}
                            </h4>
                            <span className="text-xs font-extrabold text-text-main block">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          ) : (
            /* DEFAULT INITIAL STATE (When user hasn't typed anything yet) */
            <div className="space-y-5 py-2">
              <div className="flex items-center justify-between text-xs text-text-muted px-1">
                <span>{t("Ommabop qidiruvlar:", "Популярные запросы:")}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Rolex", "Tissot", "Casio", "Ko'zoynak", "Ray-Ban", "Kepka", "Avtomatik"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="px-3 py-1.5 rounded-lg bg-bg-subtle hover:bg-bg-hover border border-border-main text-xs font-semibold text-text-main transition-colors flex items-center gap-1.5"
                  >
                    <Search className="w-3 h-3 text-amber-500" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>

              {/* Recommended Products Grid */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-text-main px-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{t("Tavsiya etilgan do'kon mahsulotlari", "Рекомендуемые товары магазина")}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {recommendedProducts.map((product: any) => {
                    const imgUrl = getImageUrl(
                      product.images?.find((img: any) => img.is_primary)?.image_url || product.images?.[0]?.image_url
                    );
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product.slug)}
                        className="p-2.5 rounded-xl bg-bg-subtle hover:bg-bg-hover border border-border-main flex gap-3 items-center cursor-pointer transition-all group shadow-xs"
                      >
                        <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-bg-card shrink-0 border border-border-main">
                          <Image src={imgUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-text-main truncate group-hover:text-amber-500 transition-colors">
                            {product.name}
                          </h4>
                          <span className="text-xs font-extrabold text-text-main block">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 border-t border-border-main bg-bg-subtle text-center text-[11px] text-text-subtle">
          {t("Qidiruv natijasini ko'rish uchun Enter bosing yoki mahsulot ustiga bosing", "Нажмите Enter или выберите товар из списка")}
        </div>
      </div>
    </div>
  );
}
