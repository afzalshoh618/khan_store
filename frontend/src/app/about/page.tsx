"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Send, Instagram, ShieldCheck, Truck, Award, CheckCircle, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { STORE_CONTACTS } from "@/config/contacts";

export default function AboutPage() {
  const { t, lang } = useLanguage();

  return (
    <div className="space-y-12 pb-16">
      {/* Header Banner */}
      <section className="bg-bg-subtle border-b border-border-main py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{t("Bosh sahifa", "Главная")}</span>
          </Link>

          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted block">
              {t(`${STORE_CONTACTS.storeName} Haqida`, `О магазине ${STORE_CONTACTS.storeName}`)}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-text-main leading-tight">
              {t("Biz Haqimizda va Aloqa", "О Нас и Контакты")}
            </h1>
          </div>
          <p className="text-text-muted text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            {t(
              `${STORE_CONTACTS.storeName} — Original, Lux Nusxa va Super Klon 1:1 Shveytsariya hamda brend soatlari do'koni. Biz Samarqand shahridagi Atlas savdo markazida va butun dunyo bo'ylab xizmat ko'rsatamiz.`,
              `${STORE_CONTACTS.storeName} — магазин оригинальных, Lux Копий и Super Clone 1:1 часов в Узбекистане. Мы работаем в ТРЦ Atlas в г. Самарканд и по всему миру.`
            )}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Core Advantages */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-accent-main text-accent-fg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-text-main">{t("Sinchiklab Tekshirilgan Sifat", "Проверенное Качество")}</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {t(
                "Har bir soat sotuvga chiqarilishidan oldin mutaxassislarimiz tomonidan qo'lda sinchiklab tekshiriladi.",
                "Каждая модель часов проходит тщательную ручную проверку нашими специалистами."
              )}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-accent-main text-accent-fg flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-text-main">{t("Butun Dunyo Bo'ylab Yetkazish", "Доставка По Всему Миру")}</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {t(
                "Samarqand, Toshkent va butun O'zbekiston hamda xalqaro yo'nalishlarda tezkor va xavfsiz yetkazib berish.",
                "Быстрая и безопасная доставка по Самарканду, Узбекистану и по всему миру."
              )}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-accent-main text-accent-fg flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-text-main">{t("3 Sifat Darajasi", "3 Уровня Качества")}</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {t(
                "Original, Lux Nusxa va Super Klon 1:1 — har bir xaridor didi va hamyoniga mos mukammal soatlar.",
                "Original, Lux Копия и Super Clone 1:1 — идеальные часы на любой вкус и бюджет."
              )}
            </p>
          </div>
        </section>

        {/* Contact Info & Socials */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Contacts */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-bg-card border border-border-main space-y-6 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-extrabold text-text-main">
                {t("Biz bilan bog'lanish", "Связаться с нами")}
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-bg-subtle border border-border-subtle">
                  <MapPin className="w-5 h-5 text-text-main shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-text-main text-xs uppercase tracking-wider mb-1">
                      {t("Do'kon manzili", "Адрес магазина")}
                    </h4>
                    <p className="text-text-muted text-xs">
                      {lang === "ru" ? STORE_CONTACTS.addressRu : STORE_CONTACTS.addressUz}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-bg-subtle border border-border-subtle">
                  <Phone className="w-5 h-5 text-text-main shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-text-main text-xs uppercase tracking-wider mb-1">
                      {t("Telefon raqamlar", "Телефоны")}
                    </h4>
                    {STORE_CONTACTS.phones.map((phone, i) => (
                      <p key={i} className="text-text-main font-bold text-sm">
                        {phone}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-bg-subtle border border-border-subtle">
                  <Clock className="w-5 h-5 text-text-main shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-text-main text-xs uppercase tracking-wider mb-1">
                      {t("Ish vaqti", "Режим работы")}
                    </h4>
                    <p className="text-text-muted text-xs">
                      {lang === "ru" ? STORE_CONTACTS.workingHoursRu : STORE_CONTACTS.workingHoursUz}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-bg-subtle border border-border-subtle">
                  <Mail className="w-5 h-5 text-text-main shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-text-main text-xs uppercase tracking-wider mb-1">
                      {t("Elektron pochta", "Электронная почта")}
                    </h4>
                    <p className="text-text-muted text-xs">{STORE_CONTACTS.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Channels */}
            <div className="p-6 rounded-2xl bg-accent-main text-accent-fg space-y-4 shadow-sm">
              <h3 className="font-bold text-lg">{t("Ijtimoiy tarmoqlarimiz", "Мы в соцсетях")}</h3>
              <p className="text-xs opacity-90">
                {t(
                  "Yangi kelgan aksessuarlar va aksiyalar haqida rasmiy kanalimizda birinchilardan bo'lib biling:",
                  "Узнавайте о новинках и акциях первыми в нашем канале:"
                )}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={STORE_CONTACTS.telegramChannel}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram {STORE_CONTACTS.telegramChannelName}</span>
                </a>

                <a
                  href={STORE_CONTACTS.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Store Description & Interactive Map */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-bg-card border border-border-main space-y-6 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-extrabold text-text-main">
                {t("Nega aynan Khan Store Premium?", "Почему именно Khan Store Premium?")}
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-text-muted leading-relaxed">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-text-main">{t("Keng assortiment:", "Широкий ассортимент:")}</strong>{" "}
                    {t(
                      "Original soatlar, quyoshdan himoyalovchi va optik ko'zoynaklar, hamda brendli kepkalar.",
                      "Оригинальные часы, солнцезащитные и оптические очки, а также брендовые кепки."
                    )}
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-text-main">{t("Qulay buyurtma:", "Удобный заказ:")}</strong>{" "}
                    {t(
                      "Saytimizda hech qanday ro'yxatdan o'tmasdan atigi 1 daqiqa ichida buyurtma berishingiz mumkin.",
                      "Вы можете оформить заказ на нашем сайте всего за 1 минуту без регистрации."
                    )}
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-text-main">{t("Qulay to'lov usullari:", "Удобные способы оплаты:")}</strong>{" "}
                    {t(
                      "Kuryerga naqd to'lov, Click, Payme va bank kartalari orqali.",
                      "Оплата наличными курьеру, через Click, Payme и банковские карты."
                    )}
                  </p>
                </div>
              </div>

              {/* Samarqand Atlas Store Location Banner */}
              <div className="p-4 rounded-xl bg-bg-subtle border border-border-main space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-main flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-zinc-900" />
                  <span>{t("Xaritadagi joylashuv", "Расположение на карте")}</span>
                </h4>
                <p className="text-xs text-text-muted">
                  Samarqand shahri, Atlas savdo markazi. Barcha savollar bo'yicha murojaat qilishingiz mumkin.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-block w-full py-3.5 rounded-xl bg-accent-main text-accent-fg text-center font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm"
                >
                  {t("Katalogni ko'rish va xarid qilish", "Смотреть каталог и делать покупки")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
