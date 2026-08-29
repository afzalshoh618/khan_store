"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/SkeletonCard";
import Link from "next/link";
import { Filter, SlidersHorizontal, Search, RefreshCw, X, Watch, Glasses, Crown, ArrowLeft, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface FilterSidebarProps {
  brands: any[];
  selectedBrand: string;
  selectedQualityTier: string;
  selectedGender: string;
  minPriceInput: string;
  maxPriceInput: string;
  setMinPriceInput: (val: string) => void;
  setMaxPriceInput: (val: string) => void;
  updateUrlFilters: (updates: Record<string, string | null>) => void;
  handlePriceApply: () => void;
  resetFilters: () => void;
  t: (uz: string, ru: string) => string;
  onClose?: () => void;
}

// Defined at Top Level outside ShopContent to avoid DOM unmount & input focus loss on typing
function FilterSidebar({
  brands,
  selectedBrand,
  selectedQualityTier,
  selectedGender,
  minPriceInput,
  maxPriceInput,
  setMinPriceInput,
  setMaxPriceInput,
  updateUrlFilters,
  handlePriceApply,
  resetFilters,
  t,
  onClose,
}: FilterSidebarProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border-main">
        <h3 className="font-bold text-base text-text-main flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-main" />
          {t("Filtrlar", "Фильтры")}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="text-[11px] text-text-muted hover:text-text-main flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            {t("Tozalash", "Сбросить")}
          </button>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1 hover:bg-bg-subtle rounded text-text-main">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Quality Tier Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
          {t("Sifat Darajasi", "Уровень Качества")}
        </h4>
        <div className="space-y-1">
          {[
            { val: "", label: t("Barcha Sifatlar", "Все уровни") },
            { val: "original", label: t("Original", "Original") },
            { val: "lux_copy", label: t("Lux Nusxa", "Lux Копия") },
            { val: "super_clone", label: t("Super Klon 1:1", "Super Clone 1:1") },
          ].map((tier) => (
            <button
              key={tier.val}
              onClick={() => {
                updateUrlFilters({ quality_tier: tier.val });
                if (onClose) onClose();
              }}
              className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                selectedQualityTier === tier.val
                  ? "bg-accent-main text-accent-fg font-bold shadow-xs"
                  : "text-text-muted hover:bg-bg-subtle"
              }`}
            >
              <span>{tier.label}</span>
              {tier.val === "super_clone" && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500 text-black">1:1</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
          {t("Brendlar", "Бренды")}
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => {
              updateUrlFilters({ brand: "" });
              if (onClose) onClose();
            }}
            className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
              selectedBrand === ""
                ? "bg-accent-main text-accent-fg font-semibold"
                : "text-text-muted hover:bg-bg-subtle"
            }`}
          >
            {t("Barcha Brendlar", "Все бренды")}
          </button>
          {brands?.map((b: any) => (
            <button
              key={b.id}
              onClick={() => {
                updateUrlFilters({ brand: b.slug });
                if (onClose) onClose();
              }}
              className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                selectedBrand === b.slug
                  ? "bg-accent-main text-accent-fg font-semibold"
                  : "text-text-muted hover:bg-bg-subtle"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Gender Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
          {t("Jins", "Пол")}
        </h4>
        <div className="flex flex-wrap gap-2">
          {[
            { val: "", label: t("Barchasi", "Все") },
            { val: "Erkaklar uchun", label: t("Erkaklar", "Мужские") },
            { val: "Ayollar uchun", label: t("Ayollar", "Женские") },
          ].map((g) => (
            <button
              key={g.val}
              onClick={() => {
                updateUrlFilters({ gender: g.val });
                if (onClose) onClose();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                selectedGender === g.val
                  ? "bg-accent-main text-accent-fg font-bold"
                  : "bg-bg-subtle border border-border-main text-text-muted hover:bg-bg-hover"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
          {t("Narxi (so'm)", "Цена (сум)")}
        </h4>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              placeholder="Min"
              className="w-full px-3 py-2 rounded-lg bg-bg-card border border-border-main text-text-main text-xs focus:border-text-main focus:outline-none"
            />
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              placeholder="Max"
              className="w-full px-3 py-2 rounded-lg bg-bg-card border border-border-main text-text-main text-xs focus:border-text-main focus:outline-none"
            />
          </div>
          <button
            onClick={() => {
              handlePriceApply();
              if (onClose) onClose();
            }}
            className="w-full py-2 rounded-lg bg-accent-main text-accent-fg font-bold text-xs hover:opacity-90 transition-opacity"
          >
            {t("Narxni qo'llash", "Применить цену")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();

  // URL State filters
  const search = searchParams.get("search") || "";
  const selectedQualityTier = searchParams.get("quality_tier") || "";
  const selectedBrand = searchParams.get("brand") || "";
  const selectedGender = searchParams.get("gender") || "";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Local state for inputs to allow smooth typing without searchParams collisions
  const [searchInput, setSearchInput] = useState(search);
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setSearchInput(search);
    setMinPriceInput(minPrice);
    setMaxPriceInput(maxPrice);
  }, [search, minPrice, maxPrice]);

  // Universal URL filter updater
  const updateUrlFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val !== null && val !== "") {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 unless page is explicitly set
    if (!("page" in updates)) {
      params.delete("page");
    }

    const queryString = params.toString();
    router.push(queryString ? `/shop?${queryString}` : "/shop");
  };

  // Fetch Brands for filters
  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => (await api.get("/brands")).data,
  });

  // Fetch Products with filters
  const { data: productsData, isLoading } = useQuery({
    queryKey: [
      "products",
      search,
      selectedQualityTier,
      selectedBrand,
      selectedGender,
      minPrice,
      maxPrice,
      sort,
      page,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedQualityTier) params.append("quality_tier", selectedQualityTier);
      if (selectedBrand) params.append("brand_slug", selectedBrand);
      if (selectedGender) params.append("gender", selectedGender);
      if (minPrice) params.append("min_price", minPrice);
      if (maxPrice) params.append("max_price", maxPrice);
      if (sort) params.append("sort", sort);
      params.append("page", page.toString());
      params.append("limit", "12");

      const res = await api.get(`/products?${params.toString()}`);
      return res.data;
    },
  });

  const products = productsData?.items || [];
  const total = productsData?.total || 0;

  // Fetch Recommended Featured Products when search has 0 results
  const { data: featuredData } = useQuery({
    queryKey: ["shop-featured-fallback"],
    queryFn: async () => (await api.get("/products?is_featured=true&limit=6")).data,
    enabled: products.length === 0 && !isLoading,
  });

  const fallbackFeatured = featuredData?.items || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlFilters({ search: searchInput.trim() });
  };

  const handlePriceApply = () => {
    updateUrlFilters({ min_price: minPriceInput.trim(), max_price: maxPriceInput.trim() });
  };

  const resetFilters = () => {
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
    router.push("/shop");
    if (mobileFiltersOpen) setMobileFiltersOpen(false);
  };

  const qualityTierTabs = [
    { tier: "", label: t("Barcha Soatlar", "Все часы") },
    { tier: "original", label: t("Original", "Original") },
    { tier: "lux_copy", label: t("Lux Nusxa", "Lux Копия") },
    { tier: "super_clone", label: t("Super Klon 1:1", "Super Clone 1:1") },
  ];

  const filterSidebarProps: FilterSidebarProps = {
    brands: brands || [],
    selectedBrand,
    selectedQualityTier,
    selectedGender,
    minPriceInput,
    maxPriceInput,
    setMinPriceInput,
    setMaxPriceInput,
    updateUrlFilters,
    handlePriceApply,
    resetFilters,
    t,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t("Bosh sahifa", "Главная")}</span>
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main">
            {t("Soatlar Katalogi", "Каталог Часов")}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {t(
              "Original, Lux Nusxa va Super Klon 1:1 — Shveytsariya hamda brend soatlari kolleksiyasi",
              "Original, Lux Копия и Super Clone 1:1 — эксклюзивная коллекция часов"
            )}
          </p>
        </div>

        {/* Quality Tier Explanation Banner */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-main text-xs space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-text-main">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t("Khan Store Soat Sifat Darajalari:", "Уровни Качества Часов в Khan Store:")}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-text-muted">
            <div className="p-2.5 rounded-lg bg-bg-subtle border border-emerald-500/20">
              <strong className="text-emerald-500 block mb-0.5">{t("ORIGINAL:", "ORIGINAL:")}</strong>
              {t("Rasmiy kafolatli 100% original Shveytsariya va brend soatlari.", "100% официальные оригинальные швейцарские и бренд часы.")}
            </div>
            <div className="p-2.5 rounded-lg bg-bg-subtle border border-blue-500/20">
              <strong className="text-blue-500 block mb-0.5">{t("LUX NUSXA:", "LUX КОПИЯ:")}</strong>
              {t("Yuqori sifatli materiallar va chidamli mexanizmga ega nusxa soatlar.", "Высококачественные модели из надежных материалов.")}
            </div>
            <div className="p-2.5 rounded-lg bg-bg-subtle border border-amber-500/30">
              <strong className="text-amber-500 block mb-0.5">{t("SUPER KLON 1:1:", "SUPER CLONE 1:1:")}</strong>
              {t("Original bilan tashqi ko'rinishi, og'irligi va mexanizmi bo'yicha deyarli farqlanmaydigan eng yuqori sifat.", "Неотличимые от оригинала по внешнему виду, весу и механизму.")}
            </div>
          </div>
        </div>

        {/* Quality Tier Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {qualityTierTabs.map((tab) => (
            <button
              key={tab.tier}
              onClick={() => updateUrlFilters({ quality_tier: tab.tier })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedQualityTier === tab.tier
                  ? "bg-accent-main text-accent-fg shadow-sm font-bold"
                  : "bg-bg-subtle text-text-muted hover:bg-bg-hover border border-border-main"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-bg-subtle p-3 rounded-xl border border-border-main">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80 flex items-center gap-1">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("Brend yoki nom bo'yicha qidirish...", "Поиск по бренду или названию...")}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-bg-card border border-border-main text-text-main text-xs focus:border-text-main focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-accent-main text-accent-fg text-xs font-bold rounded-lg shrink-0"
          >
            {t("Qidirish", "Поиск")}
          </button>
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden px-4 py-2 rounded-lg border border-border-main bg-bg-card text-text-main text-xs font-semibold flex items-center gap-2 hover:bg-bg-hover"
          >
            <SlidersHorizontal className="w-4 h-4 text-text-main" />
            <span>{t("Filtrlar", "Фильтры")}</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted hidden sm:inline">{t("Saralash:", "Сортировка:")}</span>
            <select
              value={sort}
              onChange={(e) => updateUrlFilters({ sort: e.target.value })}
              className="px-3 py-2 rounded-lg bg-bg-card border border-border-main text-text-main text-xs focus:border-text-main focus:outline-none cursor-pointer"
            >
              <option value="newest">{t("Yangilari avval", "Сначала новые")}</option>
              <option value="price_asc">{t("Arzonroq avval", "Сначала дешевле")}</option>
              <option value="price_desc">{t("Qimmatroq avval", "Сначала дороже")}</option>
              <option value="popular">{t("Mashhur", "Популярные")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Bottom-Sheet Filter Drawer */}
      {mobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-bg-card border-t border-border-main z-50 p-6 overflow-y-auto rounded-t-2xl shadow-drawer lg:hidden">
            <FilterSidebar {...filterSidebarProps} onClose={() => setMobileFiltersOpen(false)} />
          </div>
        </>
      )}

      {/* Main Grid & Filters Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block bg-bg-card p-5 rounded-xl border border-border-main h-fit sticky top-28 shadow-sm">
          <FilterSidebar {...filterSidebarProps} />
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center text-xs text-text-muted">
            <span>
              {t("Jami", "Всего")} <strong className="text-text-main">{total}</strong> {t("ta mahsulot", "товаров")}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="space-y-8">
              <div className="p-8 sm:p-10 text-center bg-bg-subtle rounded-2xl border border-border-main space-y-4 shadow-xs">
                <p className="text-lg sm:text-xl text-text-main font-bold">
                  {search
                    ? t(`Kechirasiz, "${search}" bo'yicha mahsulot topilmadi`, `По запросу "${search}" ничего не найдено`)
                    : t("Mahsulot topilmadi", "Товары не найдены")}
                </p>
                <p className="text-xs text-text-muted max-w-md mx-auto">
                  {t(
                    "Izlangan so'rov bo'yicha mahsulot mavjud emas. Filtrlarni tozalang yoki tavsiya etilgan mahsulotlarimizni ko'rib chiqing:",
                    "По вашему запросу товары не найдены. Попробуйте сбросить фильтры или выберите из рекомендуемых:"
                  )}
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 rounded-lg bg-accent-main text-accent-fg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  {t("Filtrlarni tozalash", "Сбросить фильтры")}
                </button>
              </div>

              {fallbackFeatured.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border-main">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm sm:text-base font-extrabold text-text-main">
                      {t("Tavsiya etilgan do'kon mahsulotlari", "Рекомендуемые товары магазина")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-5">
                    {fallbackFeatured.map((p: any) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-5">
              {products.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Simple Pagination */}
          {total > 12 && (
            <div className="flex justify-center gap-2 pt-6">
              <button
                onClick={() => updateUrlFilters({ page: Math.max(1, page - 1).toString() })}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg border border-border-main text-xs font-semibold text-text-muted hover:bg-bg-subtle disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t("Oldingi", "Назад")}
              </button>
              <span className="px-4 py-2 rounded-lg bg-accent-main text-accent-fg text-xs font-bold">
                {page}
              </span>
              <button
                onClick={() => updateUrlFilters({ page: (page + 1).toString() })}
                disabled={page * 12 >= total}
                className="px-4 py-2 rounded-lg border border-border-main text-xs font-semibold text-text-muted hover:bg-bg-subtle disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t("Keyingi", "Далее")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="text-center py-20 text-text-muted text-sm">{t("Yuklanmoqda...", "Загрузка...")}</div>}>
      <ShopContent />
    </Suspense>
  );
}
