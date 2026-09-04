"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { api, getImageUrl } from "@/lib/api";
import { CheckCircle2, ArrowRight, Truck, CreditCard, Banknote, AlertCircle, Tag, Check, Loader2, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const UZBEKISTAN_REGIONS = [
  { uz: "Toshkent shahri", ru: "г. Ташкент" },
  { uz: "Toshkent viloyati", ru: "Ташкентская область" },
  { uz: "Samarqand viloyati", ru: "Самаркандская область" },
  { uz: "Andijon viloyati", ru: "Андижанская область" },
  { uz: "Farg'ona viloyati", ru: "Ферганская область" },
  { uz: "Namangan viloyati", ru: "Наманганская область" },
  { uz: "Buxoro viloyati", ru: "Бухарская область" },
  { uz: "Navoiy viloyati", ru: "Навоийская область" },
  { uz: "Qashqadaryo viloyati", ru: "Кашкадарьинская область" },
  { uz: "Surxondaryo viloyati", ru: "Сурхандарьинская область" },
  { uz: "Jizzax viloyati", ru: "Джизакская область" },
  { uz: "Sirdaryo viloyati", ru: "Сырдарьинская область" },
  { uz: "Xorazm viloyati", ru: "Хорезмская область" },
  { uz: "Qoraqalpog'iston Respublikasi", ru: "Республика Каракалпакстан" },
  { uz: "Chet elga (Xalqaro yetkazib berish)", ru: "За рубеж (Международная доставка)" },
];

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { t, lang } = useLanguage();
  const totalPrice = getTotalPrice();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+998 ");
  const [shippingAddress, setShippingAddress] = useState("");
  const [city, setCity] = useState("Toshkent shahri");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("naqd");

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount_amount: number } | null>(null);
  const [promoMessage, setPromoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<any>(null);

  const discountAmount = appliedPromo ? appliedPromo.discount_amount : 0;
  const finalTotalPrice = Math.max(0, totalPrice - discountAmount);

  const formatPrice = (price: number) => {
    return price.toLocaleString("uz-UZ") + " so'm";
  };

  const validatePhone = (phoneStr: string) => {
    const cleaned = phoneStr.replace(/\s+/g, "").replace(/-/g, "");
    return /^\+?\d{7,15}$/.test(cleaned);
  };

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) return;
    setPromoLoading(true);
    setPromoMessage(null);

    try {
      const res = await api.post("/promocodes/validate", { code: promoCodeInput.trim() });
      if (res.data?.valid) {
        setAppliedPromo({
          code: res.data.code,
          discount_amount: res.data.discount_amount,
        });
        setPromoMessage({ type: "success", text: res.data.message });
      } else {
        setAppliedPromo(null);
        setPromoMessage({ type: "error", text: res.data.message });
      }
    } catch (err: any) {
      setAppliedPromo(null);
      setPromoMessage({ type: "error", text: "Promokod tekshirishda xatolik yuz berdi." });
    } finally {
      setPromoLoading(false);
    }
  };

  if (items.length === 0 && !orderConfirmed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-text-main">{t("Savatingiz Bo'sh", "Корзина пуста")}</h2>
        <p className="text-xs text-text-muted">{t("Buyurtma berish uchun avval mahsulot tanlang.", "Выберите товары перед оформлением заказа.")}</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-2.5 rounded-lg bg-accent-main text-accent-fg font-bold text-xs shadow-sm hover:opacity-90"
        >
          {t("Katalogga o'tish", "Перейти в каталог")}
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!customerName.trim()) {
      setValidationError(t("Iltimos, ism-familiyangizni kiriting.", "Пожалуйста, введите ваше имя и фамилию."));
      return;
    }

    if (!validatePhone(customerPhone)) {
      setValidationError(
        t(
          "Iltimos, to'g'ri telefon raqamini kiriting (Masalan: +998 90 123 45 67 yoki xalqaro formatda).",
          "Пожалуйста, введите корректный номер телефона (Например: +998 90 123 45 67 или в международном формате)."
        )
      );
      return;
    }

    if (!shippingAddress.trim()) {
      setValidationError(t("Iltimos, yetkazib berish manzilini kiriting.", "Пожалуйста, введите адрес доставки."));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        shipping_address: shippingAddress.trim(),
        city: city,
        notes: appliedPromo ? `${notes.trim()} (Promokod: ${appliedPromo.code}, Chegirma: ${appliedPromo.discount_amount} UZS)` : notes.trim(),
        payment_method: paymentMethod,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      const res = await api.post("/orders", payload);
      setOrderConfirmed(res.data);
      clearCart();
    } catch (err: any) {
      setValidationError(err.response?.data?.detail || t("Buyurtmani yuborishda xatolik yuz berdi.", "Ошибка при отправке заказа."));
    } finally {
      setLoading(false);
    }
  };

  if (orderConfirmed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 text-green-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-green-600">
            {t("Muvaffaqiyatli!", "Успешно!")}
          </span>
          <h1 className="text-3xl font-extrabold text-text-main">
            {t("Buyurtmangiz Qabul Qilindi", "Заказ Принят")}
          </h1>
          <p className="text-xs text-text-muted">
            {t("Buyurtma raqamingiz:", "Номер заказа:")}{" "}
            <strong className="text-text-main font-mono text-sm">{orderConfirmed.order_number}</strong>
          </p>
        </div>

        <div className="p-5 rounded-xl bg-bg-card border border-border-main text-left space-y-3 text-xs shadow-sm">
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-text-muted">{t("Mijoz:", "Клиент:")}</span>
            <span className="text-text-main font-semibold">{orderConfirmed.customer_name}</span>
          </div>
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-text-muted">{t("Telefon:", "Телефон:")}</span>
            <span className="text-text-main font-semibold">{orderConfirmed.customer_phone}</span>
          </div>
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-text-muted">{t("Viloyat / Manzil:", "Регион / Адрес:")}</span>
            <span className="text-text-main font-semibold">
              {orderConfirmed.city}, {orderConfirmed.shipping_address}
            </span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-text-main font-bold">{t("Jami summasi:", "Итоговая сумма:")}</span>
            <span className="text-text-main font-bold text-base">
              {formatPrice(orderConfirmed.total_amount)}
            </span>
          </div>
        </div>

        <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
          {t(
            "Khan Store menejeri tez orada siz bilan bog'lanib, yetkazib berish vaqtini tasdiqlaydi.",
            "Менеджер Khan Store вскоре свяжется с вами для подтверждения доставки."
          )}
        </p>

        <Link
          href="/shop"
          className="inline-block px-8 py-3.5 rounded-lg bg-accent-main text-accent-fg font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity"
        >
          {t("Do'konga qaytish", "Вернуться в магазин")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-border-main pb-4 space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t("Bosh sahifa", "Главная")}</span>
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main">
            {t("Buyurtmani Rasmiylashtirish", "Оформление Заказа")}
          </h1>
          <p className="text-xs text-text-muted mt-1">
            {t("Ro'yxatdan o'tmasdan tezkor buyurtma berish (Guest Checkout)", "Быстрый заказ без регистрации")}
          </p>
        </div>
      </div>

      {validationError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Customer Information Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-xl bg-bg-card border border-border-main space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-text-main flex items-center gap-2">
              <Truck className="w-5 h-5 text-text-main" />
              <span>{t("Yetkazib berish ma'lumotlari", "Информация о доставке")}</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-text-muted font-medium mb-1">
                  {t("Ismingiz va Familiyangiz *", "Ваше Имя и Фамилия *")}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Jasur Rahimov"
                  className="w-full px-4 py-2.5 rounded-lg bg-bg-subtle border border-border-main text-text-main focus:border-text-main focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    {t("Telefon raqamingiz *", "Номер телефона *")}
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-4 py-2.5 rounded-lg bg-bg-subtle border border-border-main text-text-main focus:border-text-main focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-text-muted font-medium mb-1">
                    {t("Viloyat / Hudud / Chet el *", "Регион / Страна *")}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-bg-subtle border border-border-main text-text-main focus:border-text-main focus:outline-none cursor-pointer"
                  >
                    {UZBEKISTAN_REGIONS.map((reg) => (
                      <option key={reg.uz} value={reg.uz}>
                        {lang === "ru" ? reg.ru : reg.uz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">
                  {t("To'liq manzil (tuman, ko'cha, uy / davlat) *", "Полный адрес (район, улица, дом / страна) *")}
                </label>
                <textarea
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder={
                    city.includes("Chet el")
                      ? t("Davlat, shahar, ko'cha va pochta indeksi", "Страна, город, улица и индекс")
                      : t("Yunusobod tumani, Amir Temur ko'chasi 45-uy", "Район Юнусабад, ул. Амира Темура 45")
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-bg-subtle border border-border-main text-text-main focus:border-text-main focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">
                  {t("Qo'shimcha izoh", "Дополнительное примечание")}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("Domofon kodi yoki boshqa ko'rsatma", "Код домофона или другое примечание")}
                  className="w-full px-4 py-2.5 rounded-lg bg-bg-subtle border border-border-main text-text-main focus:border-text-main focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-xl bg-bg-card border border-border-main space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-text-main flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-text-main" />
              <span>{t("To'lov usuli", "Способ оплаты")}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { id: "naqd", name: t("Naqd (Kuryerga)", "Наличными (курьеру)"), icon: Banknote },
                { id: "click", name: "Click Online", icon: CreditCard },
                { id: "payme", name: "Payme Online", icon: CreditCard },
                { id: "karta", name: t("Bank Kartasi", "Банковская карта"), icon: CreditCard },
              ].map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3.5 rounded-lg border flex items-center gap-3 transition-all ${
                      paymentMethod === method.id
                        ? "border-text-main bg-accent-main text-accent-fg font-semibold shadow-sm"
                        : "border-border-main bg-bg-subtle text-text-muted hover:bg-bg-hover"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{method.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-bg-card border border-border-main space-y-4 sticky top-28 shadow-sm">
            <h3 className="font-bold text-base text-text-main border-b border-border-main pb-3">
              {t("Buyurtma Tarkibi", "Состав Заказа")}
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-3 items-center text-xs">
                  <div className="relative w-12 h-14 rounded bg-bg-subtle overflow-hidden shrink-0 border border-border-main">
                    <Image src={getImageUrl(item.image_url)} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-main font-semibold truncate">{item.name}</p>
                    <p className="text-text-muted">{item.quantity} dona</p>
                  </div>
                  <span className="font-bold text-text-main">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code Input Section */}
            <div className="pt-3 border-t border-border-main space-y-2">
              <label className="block text-xs font-semibold text-text-main flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-500" />
                <span>{t("Promokod kiritish", "Ввести промокод")}</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  placeholder={t("Promokod", "Промокод")}
                  className="flex-1 px-3 py-2 rounded-lg bg-bg-subtle border border-border-main text-text-main text-xs uppercase font-mono tracking-wider focus:border-accent-main focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyPromoCode}
                  disabled={promoLoading || !promoCodeInput.trim()}
                  className="px-4 py-2 rounded-lg bg-accent-main text-accent-fg font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1"
                >
                  {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("Qo'llash", "Применить")}
                </button>
              </div>

              {promoMessage && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    promoMessage.type === "success"
                      ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {promoMessage.type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{promoMessage.text}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border-main space-y-2 text-xs">
              <div className="flex justify-between text-text-muted">
                <span>{t("Mahsulotlar summasi:", "Сумма товаров:")}</span>
                <span className="font-semibold text-text-main">{formatPrice(totalPrice)}</span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold">
                  <span>Chegirma ({appliedPromo.code}):</span>
                  <span>-{formatPrice(appliedPromo.discount_amount)}</span>
                </div>
              )}

              <div className="flex justify-between text-text-muted">
                <span>{t("Yetkazib berish:", "Доставка:")}</span>
                <span className="text-green-600 font-semibold">{t("Bepul", "Бесплатно")}</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-border-subtle">
                <span className="text-sm font-bold text-text-main">{t("Jami Summa:", "Итоговая Сумма:")}</span>
                <span className="text-xl font-extrabold text-text-main">
                  {formatPrice(finalTotalPrice)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg bg-accent-main text-accent-fg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              <span>{loading ? t("Yuborilmoqda...", "Отправка...") : t("Buyurtmani Tasdiqlash", "Подтвердить Заказ")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
