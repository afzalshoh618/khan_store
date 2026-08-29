"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useLanguage } from "@/lib/i18n";
import { getImageUrl } from "@/lib/api";
import { isAdminRoute } from "@/lib/adminPath";

export default function CartDrawer() {
  const pathname = usePathname();
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice, clearCart } =
    useCartStore();
  const { t } = useLanguage();

  if (isAdminRoute(pathname)) {
    return null;
  }

  const totalPrice = getTotalPrice();

  const formatPrice = (price: number) => {
    return price.toLocaleString("uz-UZ") + " so'm";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-bg-card border-l border-border-main shadow-drawer z-50 flex flex-col justify-between"
          >
            {/* Cart Header */}
            <div className="p-5 border-b border-border-main flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-main text-accent-fg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-main">{t("Savat", "Корзина")}</h3>
                  <p className="text-xs text-text-muted">
                    {items.length} {t("ta mahsulot", "товаров")}
                  </p>
                </div>
              </div>

              <button
                onClick={closeCart}
                className="p-2 rounded-lg hover:bg-bg-subtle text-text-muted hover:text-text-main transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-text-muted">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-border-main flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-text-subtle" />
                  </div>
                  <div>
                    <h4 className="text-base text-text-main font-semibold">
                      {t("Savatingiz bo'sh", "Корзина пуста")}
                    </h4>
                    <p className="text-xs text-text-muted mt-1 max-w-xs">
                      {t(
                        "Mahsulotlarni tanlang va savatga qo'shing",
                        "Выберите товары и добавьте в корзину"
                      )}
                    </p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="mt-4 px-5 py-2.5 rounded-lg border border-border-main text-xs font-semibold text-text-main hover:bg-bg-subtle transition-all"
                  >
                    {t("Katalogga o'tish", "Перейти в каталог")}
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product_id}
                    className="p-3 rounded-xl bg-bg-subtle border border-border-main flex gap-3 items-center"
                  >
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-bg-card shrink-0 border border-border-main">
                      <Image src={getImageUrl(item.image_url)} alt={item.name} fill className="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-text-subtle font-medium">
                        {item.brand_name}
                      </span>
                      <h4 className="text-sm font-semibold text-text-main truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm font-bold text-text-main">
                        {formatPrice(item.price * item.quantity)}
                      </p>

                      {/* Quantity Modifier */}
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex items-center border border-border-main rounded-lg bg-bg-card">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="p-1.5 text-text-muted hover:text-text-main transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs text-text-main font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="p-1.5 text-text-muted hover:text-text-main transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="text-text-subtle hover:text-red-500 transition-colors p-1"
                          title={t("O'chirish", "Удалить")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-border-main bg-bg-subtle space-y-4">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <div className="flex items-center gap-1.5 text-green-600 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t("Bepul yetkazish", "Бесплатная доставка")}</span>
                  </div>
                  <button
                    onClick={clearCart}
                    className="text-text-subtle hover:text-red-500 underline text-[11px] transition-colors"
                  >
                    {t("Tozalash", "Очистить")}
                  </button>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-border-main">
                  <span className="text-sm font-medium text-text-muted">{t("Jami:", "Итого:")}</span>
                  <span className="text-xl font-bold text-text-main">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-3.5 rounded-xl bg-accent-main text-accent-fg font-bold text-sm tracking-wide hover:opacity-90 flex items-center justify-center gap-2 group transition-all shadow-sm"
                >
                  <span>{t("Buyurtma berish", "Оформить заказ")}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
