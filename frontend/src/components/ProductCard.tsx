"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Play, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useLanguage } from "@/lib/i18n";
import { getImageUrl } from "@/lib/api";

export interface ProductType {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  video_url?: string;
  price: number;
  original_price?: number;
  is_featured?: boolean;
  is_new?: boolean;
  gender?: string;
  mechanism?: string;
  case_material?: string;
  category?: string;
  brand?: {
    name: string;
    slug: string;
  };
  images?: {
    image_url: string;
    is_primary: boolean;
  }[];
}

export default function ProductCard({ product }: { product: ProductType }) {
  const { addItem } = useCartStore();
  const { t } = useLanguage();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const rawImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url;
  const primaryImage = getImageUrl(rawImage);

  const brandName = product.brand?.name || "Khan Store Premium";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: primaryImage,
      brand_name: brandName,
      quantity: 1,
    });
  };

  const handleOpenVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVideoModalOpen(true);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("uz-UZ") + " so'm";
  };

  return (
    <>
      <div className="group relative rounded-2xl bg-bg-card border border-border-main hover:border-border-subtle transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-card hover:shadow-card-hover">
        {/* Clean Product Image Container */}
        <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-bg-subtle">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Clickable Video Button (Only opens video when clicked) */}
          {product.video_url && (
            <button
              onClick={handleOpenVideo}
              className="absolute bottom-2.5 left-2.5 z-10 bg-black/80 hover:bg-black text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md border border-white/20 transition-transform active:scale-95"
              title={t("Videoni ko'rish", "Смотреть видео")}
            >
              <Play className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>VIDEO</span>
            </button>
          )}
        </Link>

        {/* Product Details Container */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-text-subtle font-semibold block mb-0.5 truncate">
              {brandName}
            </span>

            <Link href={`/product/${product.slug}`}>
              <h3 className="font-semibold text-xs sm:text-sm text-text-main group-hover:text-text-muted transition-colors line-clamp-2 leading-snug">
                {product.name}
              </h3>
            </Link>
          </div>

          {/* Price & Add to Cart Button */}
          <div className="pt-2.5 border-t border-border-subtle flex items-center justify-between gap-1.5 min-w-0">
            <div className="min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-extrabold text-text-main whitespace-nowrap block">
                {formatPrice(product.price)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-accent-main text-accent-fg font-bold text-xs hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs shrink-0"
              title={t("Savatga qo'shish", "В корзину")}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-bold uppercase">{t("Savatga", "В корзину")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video Modal Window (Only rendered when user explicitly clicks VIDEO) */}
      {isVideoModalOpen && product.video_url && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-bg-card rounded-2xl overflow-hidden border border-border-main shadow-2xl space-y-3 p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-border-subtle">
              <h3 className="text-xs sm:text-sm font-bold text-text-main truncate pr-4">{product.name} — Video</h3>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 rounded-lg bg-bg-subtle hover:bg-bg-hover text-text-main transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <video
                src={product.video_url}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
