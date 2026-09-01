"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Truck, Clock, MapPin, Phone, Mail, Send, Instagram } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { STORE_CONTACTS } from "@/config/contacts";
import { isAdminRoute } from "@/lib/adminPath";

export default function Footer() {
  const pathname = usePathname();
  const { t, lang } = useLanguage();

  if (isAdminRoute(pathname)) {
    return null;
  }

  return (
    <footer className="bg-bg-subtle border-t border-border-main text-text-muted pt-12 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-border-main">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-card border border-border-main shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-accent-main text-accent-fg flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-text-main font-bold text-sm">
                {t("1 Yillik Kafolat Sertifikati", "1 Год Гарантийного Сертификата")}
              </h4>
              <p className="text-xs text-text-muted">
                {t("Rasmiy sertifikat va rasmiy kafolat", "Официальный сертификат и гарантия")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-card border border-border-main shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-accent-main text-accent-fg flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-text-main font-bold text-sm">
                {t("Butun Dunyo Bo'ylab Yetkazish", "Доставка По Всему Миру")}
              </h4>
              <p className="text-xs text-text-muted">
                {t("Samarqand, O'zbekiston va xalqaro delivery", "Быстрая доставка из Самарканда")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-card border border-border-main shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-accent-main text-accent-fg flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-text-main font-bold text-sm">
                {t("Mijozlarni Qo'llab-quvvatlash", "Поддержка Клиентов")}
              </h4>
              <p className="text-xs text-text-muted">
                {t("Har kuni 10:00 dan 22:00 gacha", "Ежедневно с 10:00 до 22:00")}
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-xl bg-black overflow-hidden border border-amber-500/40 p-0.5 shadow-xs shrink-0 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Khan Store Premium"
                  width={40}
                  height={40}
                  className="object-contain w-full h-full"
                />
              </div>
              <span className="font-extrabold text-base text-text-main">{STORE_CONTACTS.storeName}</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              {t(
                "Khan Store Premium — Original, Lux Kopiya va Super Klon 1:1 Shveytsariya hamda brend soatlari do'koni. Samarqanddan butun dunyo bo'ylab yetkazish.",
                "Khan Store Premium — Магазин оригинальных, Lux Копий и Супер Клон 1:1 часов. Доставка по всему миру."
              )}
            </p>
          </div>

          <div>
            <h5 className="text-text-main font-bold text-xs uppercase tracking-wider mb-3">
              {t("Soat Sifat Darajalari", "Уровни Качества")}
            </h5>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/shop?quality_tier=original" className="hover:text-text-main transition-colors">
                  {t("Original Soatlar", "Original Часы")}
                </Link>
              </li>
              <li>
                <Link href="/shop?quality_tier=lux_copy" className="hover:text-text-main transition-colors">
                  {t("Lux Kopiya Soatlar", "Часы Lux Копия")}
                </Link>
              </li>
              <li>
                <Link href="/shop?quality_tier=super_clone" className="hover:text-amber-500 font-bold transition-colors">
                  {t("Super Klon 1:1", "Супер Клон 1:1")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-text-main font-bold text-xs uppercase tracking-wider mb-3">
              {t("Ma'lumotlar", "Информация")}
            </h5>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/about" className="hover:text-text-main transition-colors">
                  {t("Biz haqimizda", "О нас")}
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-text-main transition-colors">
                  {t("Savat va Buyurtma", "Корзина и Оформление")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-text-main font-bold text-xs uppercase tracking-wider mb-3">
              {t("Aloqa", "Контакты")}
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href={STORE_CONTACTS.yandexMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 hover:text-text-main transition-colors group"
                  title={t("Xaritada ko'rish", "Открыть на карте")}
                >
                  <MapPin className="w-4 h-4 text-text-main shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="underline decoration-dotted underline-offset-2">{lang === "ru" ? STORE_CONTACTS.addressRu : STORE_CONTACTS.addressUz}</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-text-main shrink-0" />
                <span>{STORE_CONTACTS.phones[0]}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-text-main shrink-0" />
                <span>{STORE_CONTACTS.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border-main flex flex-col sm:flex-row justify-between items-center text-xs text-text-muted gap-3">
          <p>© 2026 {STORE_CONTACTS.storeName}. {t("Barcha huquqlar himoyalangan.", "Все права защищены.")}</p>
          <div className="flex gap-4 font-semibold">
            <a href={STORE_CONTACTS.telegramChannel} target="_blank" rel="noreferrer" className="hover:text-text-main flex items-center gap-1">
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </a>
            <a href={STORE_CONTACTS.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-text-main flex items-center gap-1">
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
