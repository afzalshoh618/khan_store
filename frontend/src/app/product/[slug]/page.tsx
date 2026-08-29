"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api, getImageUrl } from "@/lib/api";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag, ShieldCheck, Truck, ArrowLeft, Check, Sparkles, RefreshCw, Play, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/SkeletonCard";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { t } = useLanguage();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Fetch Product Details
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product-detail", slug],
    queryFn: async () => {
      const res = await api.get(`/products/${slug}`);
      return res.data;
    },
    enabled: !!slug,
  });

  // Fetch Related Products
  const { data: relatedData, isLoading: relatedLoading } = useQuery({
    queryKey: ["related-products", product?.category?.slug || product?.category_id],
    queryFn: async () => {
      if (!product?.category?.slug && !product?.category_id) return { items: [] };
      const catSlug = product.category?.slug || "";
      const res = await api.get(`/products?category_slug=${catSlug}&limit=4`);
      return res.data;
    },
    enabled: !!product,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm font-medium text-gray-500">{t("Mahsulot ma'lumotlari yuklanmoqda...", "Загрузка информации о товаре...")}</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl text-gray-900 font-bold">{t("Mahsulot Topilmadi", "Товар не найден")}</h2>
        <p className="text-xs text-gray-500">{t("Izlangan mahsulot mavjud emas.", "Запрошенный товар не существует.")}</p>
        <button
          onClick={() => router.push("/shop")}
          className="px-6 py-2.5 rounded-lg bg-zinc-900 text-white font-bold text-xs"
        >
          {t("Katalogga qaytish", "Вернуться в каталог")}
        </button>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images.map((img: any) => getImageUrl(img.image_url))
    : [getImageUrl(null)];

  const currentImage = images[selectedImageIndex] || images[0];

  const formatPrice = (price: number) => {
    return price.toLocaleString("uz-UZ") + " so'm";
  };

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: currentImage,
      brand_name: product.brand?.name || "Khan Store",
      quantity: quantity,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const relatedProducts = (relatedData?.items || []).filter((item: any) => item.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back Navigation Bar */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t("Bosh sahifa", "Главная")}</span>
        </Link>
        <span className="text-text-subtle text-xs">/</span>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors"
        >
          <span>{t("Orqaga", "Назад")}</span>
        </button>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Image Gallery (Up to 5 Images) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Large Main Image Preview */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-bg-subtle border border-border-main shadow-sm group">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-bg-card/90 border border-border-main text-text-main text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs shadow-xs">
              100% Original
            </div>
          </div>

          {/* Thumbnails Selector (Up to 5 images) */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.slice(0, 5).map((imgUrl: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? "border-amber-500 ring-2 ring-amber-500/30 opacity-100"
                      : "border-border-main opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={imgUrl} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Meta & Purchase Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-text-subtle block mb-1">
              {product.brand?.name || "Khan Store"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main leading-tight">
              {product.name}
            </h1>
            {product.short_description && (
              <p className="text-sm text-text-muted mt-2 font-normal leading-relaxed">{product.short_description}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-xl bg-bg-subtle border border-border-main flex items-center justify-between">
            <div>
              <span className="text-xs text-text-muted block">{t("Narxi", "Цена")}</span>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-extrabold text-text-main">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm text-text-subtle line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <Check className="w-4 h-4" />
                <span>{t("Omborda mavjud", "В наличии")}</span>
              </span>
              <p className="text-[11px] text-text-subtle mt-0.5">{t("Samarqand va viloyatlarga", "Доставка")}</p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-text-main">{t("Miqdor:", "Количество:")}</span>
            <div className="flex items-center border border-border-main rounded-lg bg-bg-card">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1.5 text-text-muted hover:text-text-main font-bold"
              >
                -
              </button>
              <span className="px-4 py-1.5 text-sm text-text-main font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1.5 text-text-muted hover:text-text-main font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3.5 rounded-lg bg-accent-main text-accent-fg font-bold text-xs uppercase tracking-wider hover:opacity-90 flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t("Savatga qo'shish", "В корзину")}</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 py-3.5 rounded-lg border-2 border-border-main text-text-main font-bold text-xs uppercase tracking-wider hover:bg-bg-subtle transition-all"
            >
              {t("Hoziroq sotib olish", "Купить сейчас")}
            </button>
          </div>

          {/* Specifications */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="p-5 rounded-xl bg-bg-card border border-border-main space-y-3">
              <h3 className="font-bold text-sm text-text-main border-b border-border-main pb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-text-main" />
                <span>{t("Xususiyatlar", "Характеристики")}</span>
              </h3>

              <div className="grid grid-cols-2 gap-y-2 text-xs">
                {product.gender && (
                  <>
                    <div className="text-text-muted">{t("Jins:", "Пол:")}</div>
                    <div className="text-text-main font-medium">{product.gender}</div>
                  </>
                )}
                {product.attributes.map((attr: any) => (
                  <React.Fragment key={attr.id}>
                    <div className="text-text-muted">{attr.attribute_key}:</div>
                    <div className="text-text-main font-medium">{attr.attribute_value}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs text-text-muted">
            <div className="p-3 rounded-lg bg-bg-subtle border border-border-main space-y-1">
              <ShieldCheck className="w-5 h-5 text-text-main mx-auto" />
              <p className="text-text-main font-semibold text-[11px]">{t("Kafolatlangan", "Гарантия")}</p>
            </div>
            <div className="p-3 rounded-lg bg-bg-subtle border border-border-main space-y-1">
              <Truck className="w-5 h-5 text-text-main mx-auto" />
              <p className="text-text-main font-semibold text-[11px]">{t("Tezkor yetkazish", "Доставка")}</p>
            </div>
            <div className="p-3 rounded-lg bg-bg-subtle border border-border-main space-y-1">
              <RefreshCw className="w-5 h-5 text-text-main mx-auto" />
              <p className="text-text-main font-semibold text-[11px]">{t("Almashtirish", "Обмен")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-border-main space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-text-subtle">
                {t("O'xshash", "Похожие")}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-text-main mt-0.5">
                {t("Shunga o'xshash mahsulotlar", "Похожие товары")}
              </h2>
            </div>

            <Link
              href="/shop"
              className="text-xs font-semibold text-text-main hover:underline"
            >
              {t("Katalogga o'tish", "В каталог")} &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : relatedProducts.map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))}
          </div>
        </section>
      )}
    </div>
  );
}
