"use client";

import React, { useState, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getImageUrl } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Package,
  ShoppingBag,
  DollarSign,
  Plus,
  Clock,
  AlertCircle,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  CheckCircle,
  LogOut,
  ExternalLink,
  UploadCloud,
  X,
  Loader2,
  Tag,
  Award,
  Trash2,
  Edit3,
  Layers,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { ThemeToggle } from "@/lib/theme";

export default function AdminPanelContent() {
  const { user, isAdmin, setAuth, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"stats" | "products" | "orders" | "brands" | "categories" | "promocodes" | "security">("stats");

  // Admin login credentials
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  // New product state
  const [productName, setProductName] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [price, setPrice] = useState("");
  const [brandId, setBrandId] = useState("1");
  const [categoryId, setCategoryId] = useState("1");
  const [qualityTier, setQualityTier] = useState("original");
  const [gender, setGender] = useState("Erkaklar uchun");
  const [mechanism, setMechanism] = useState("Avtomatik");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // New Product Images state (Up to 5 images max)
  const [productImages, setProductImages] = useState<string[]>([]);
  const [productImageUploading, setProductImageUploading] = useState(false);
  const [productImageError, setProductImageError] = useState("");
  const productImageFileInputRef = useRef<HTMLInputElement>(null);

  // New Brand state
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandCountry, setNewBrandCountry] = useState("Shveytsariya");
  const [newBrandDesc, setNewBrandDesc] = useState("");
  const [brandSuccess, setBrandSuccess] = useState("");

  // New PromoCode state
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoDiscount, setNewPromoDiscount] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [promoError, setPromoError] = useState("");

  // New Category state
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catImageUrl, setCatImageUrl] = useState("");
  const [catDisplayOrder, setCatDisplayOrder] = useState("1");
  const [catSuccess, setCatSuccess] = useState("");
  const [catError, setCatError] = useState("");
  const [catUploading, setCatUploading] = useState(false);
  const catFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Category state
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");
  const [editCatImageUrl, setEditCatImageUrl] = useState("");
  const [editCatDisplayOrder, setEditCatDisplayOrder] = useState("1");
  const [editCatUploading, setEditCatUploading] = useState(false);
  const editCatFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/admin/dashboard-stats")).data,
    enabled: isAdmin(),
  });

  // Fetch orders
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await api.get("/admin/orders")).data,
    enabled: isAdmin(),
  });

  // Fetch products
  const { data: productsData } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await api.get("/products?limit=50")).data,
    enabled: isAdmin(),
  });

  // Fetch Brands & Categories
  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => (await api.get("/brands")).data,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  // Fetch PromoCodes
  const { data: promocodes } = useQuery({
    queryKey: ["admin-promocodes"],
    queryFn: async () => (await api.get("/promocodes")).data,
    enabled: isAdmin(),
  });

  // Order Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: number; newStatus: string }) => {
      return (await api.put(`/admin/orders/${orderId}/status`, { status: newStatus })).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  // Add Product mutation
  const addProductMutation = useMutation({
    mutationFn: async (payload: any) => {
      return (await api.post("/products", payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setFormSuccess("Mahsulot muvaffaqiyatli qo'shildi!");
      setProductName("");
      setProductSlug("");
      setPrice("");
      setProductImages([]);
      setDescription("");
    },
  });

  // Add Brand mutation
  const addBrandMutation = useMutation({
    mutationFn: async (payload: any) => {
      return (await api.post("/brands", payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setBrandSuccess("Yangi brend muvaffaqiyatli qo'shildi!");
      setNewBrandName("");
      setNewBrandDesc("");
    },
  });

  // Delete Brand mutation
  const deleteBrandMutation = useMutation({
    mutationFn: async (brandId: number) => {
      return await api.delete(`/brands/${brandId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  // Add Category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (payload: any) => {
      return (await api.post("/categories", payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCatSuccess("Yangi kategoriya muvaffaqiyatli qo'shildi!");
      setCatName("");
      setCatSlug("");
      setCatDesc("");
      setCatImageUrl("");
      setCatError("");
    },
    onError: (err: any) => {
      setCatError(err.response?.data?.detail || "Kategoriya qo'shishda xatolik.");
    },
  });

  // Edit Category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      return (await api.put(`/categories/${id}`, payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
      setCatSuccess("Kategoriya muvaffaqiyatli yangilandi va rasmi almashtirildi!");
    },
    onError: (err: any) => {
      setCatError(err.response?.data?.detail || "Kategoriyani tahrirlashda xatolik.");
    },
  });

  // Delete Category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (catId: number) => {
      return await api.delete(`/categories/${catId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // Delete Product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await api.delete(`/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  // Add PromoCode mutation
  const addPromoMutation = useMutation({
    mutationFn: async (payload: any) => {
      return (await api.post("/promocodes", payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promocodes"] });
      setPromoSuccess("Yangi promokod muvaffaqiyatli yaratildi!");
      setNewPromoCode("");
      setNewPromoDiscount("");
      setPromoError("");
    },
    onError: (err: any) => {
      setPromoError(err.response?.data?.detail || "Promokod yaratishda xatolik.");
    },
  });

  // Delete PromoCode mutation
  const deletePromoMutation = useMutation({
    mutationFn: async (promoId: number) => {
      return await api.delete(`/promocodes/${promoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promocodes"] });
    },
  });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await api.post("/auth/json-login", { email: adminEmail, password: adminPassword });
      if (res.data.user?.role !== "admin") {
        setLoginError("Ushbu hisob admin huquqiga ega emas.");
        return;
      }
      setAuth(res.data.user, res.data.access_token);
    } catch (err: any) {
      setLoginError(err.response?.data?.detail || "Kirishda xatolik yuz berdi.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (newPassword.length < 8) {
      setPwdError("Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPwdError("Parol tarkibida harf va raqamlar qatnashishi kerak.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("Yangi parollar mos kelmadi.");
      return;
    }

    setPwdLoading(true);
    try {
      const res = await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPwdSuccess(res.data.message || "Parol yangilandi. Iltimos qayta kiring.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err: any) {
      setPwdError(err.response?.data?.detail || "Parolni o'zgartirishda xatolik.");
    } finally {
      setPwdLoading(false);
    }
  };

  // Product Image Upload Handler (Up to 5 images)
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (productImages.length >= 5) {
      setProductImageError("Maksimum 5 ta rasm yuklash mumkin.");
      return;
    }

    setProductImageError("");
    setProductImageUploading(true);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        if (productImages.length + newUrls.length >= 5) break;
        const formData = new FormData();
        formData.append("file", files[i]);
        const res = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data?.url) {
          newUrls.push(res.data.url);
        }
      }
      setProductImages((prev) => [...prev, ...newUrls].slice(0, 5));
    } catch (err: any) {
      setProductImageError(err.response?.data?.detail || "Rasm yuklashda xatolik yuz berdi.");
    } finally {
      setProductImageUploading(false);
    }
  };

  // Category Image Upload Handler
  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCatUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.url) {
        setCatImageUrl(res.data.url);
      }
    } catch (err: any) {
      setCatError(err.response?.data?.detail || "Kategoriya rasmini yuklashda xatolik.");
    } finally {
      setCatUploading(false);
    }
  };

  // Edit Category Image Upload Handler
  const handleEditCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditCatUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.url) {
        setEditCatImageUrl(res.data.url);
      }
    } catch (err: any) {
      setCatError(err.response?.data?.detail || "Kategoriya rasmini almashtirishda xatolik.");
    } finally {
      setEditCatUploading(false);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedSlug = productSlug || productName.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    const payload = {
      name: productName,
      slug: generatedSlug,
      price: parseFloat(price),
      brand_id: parseInt(brandId),
      category_id: parseInt(categoryId),
      quality_tier: qualityTier,
      gender: gender,
      mechanism: mechanism,
      short_description: description,
      images: productImages.map((url, idx) => ({
        image_url: url,
        is_primary: idx === 0,
        display_order: idx,
      })),
    };

    addProductMutation.mutate(payload);
  };

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    setBrandSuccess("");
    const slug = newBrandName.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    addBrandMutation.mutate({
      name: newBrandName.trim(),
      slug: slug,
      country: newBrandCountry,
      description: newBrandDesc,
    });
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");
    addPromoMutation.mutate({
      code: newPromoCode.trim().toUpperCase(),
      discount_amount: parseFloat(newPromoDiscount),
      is_active: true,
    });
  };

  const formatPrice = (p: number) => (p || 0).toLocaleString("uz-UZ") + " so'm";

  // Dedicated Login Portal for Admin Only
  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen bg-bg-subtle flex flex-col justify-center items-center px-4 py-12">
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="w-full max-w-md bg-bg-card p-8 rounded-2xl border border-border-main shadow-md space-y-6">
          <div className="text-center space-y-3">
            <div className="relative h-20 w-20 rounded-2xl bg-black overflow-hidden border-2 border-amber-500/50 p-1 shadow-lg mx-auto flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Khan Store Premium"
                width={80}
                height={80}
                priority
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-text-main tracking-tight">KHAN STORE ADMIN</h2>
              <p className="text-xs text-text-muted mt-1">Boshqaruv Tizimiga Kirish (Brute-force muhofazasi faol)</p>
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-text-main font-semibold mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-subtle absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-text-main font-semibold mb-1">Parol</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-subtle absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-lg bg-accent-main text-accent-fg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
            >
              {loginLoading ? "Kirilmoqda..." : "Tizimga Kirish"}
            </button>
          </form>

          <div className="pt-4 border-t border-border-main flex justify-between items-center text-xs text-text-subtle">
            <Link href="/" className="hover:text-text-main flex items-center gap-1">
              <span>← Do'konga qaytish</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    );
  }

  // Standalone Admin Console Workspace
  return (
    <div className="min-h-screen bg-bg-main flex flex-col">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* Standalone Admin Header Bar */}
      <header className="bg-bg-subtle border-b border-border-main py-3 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-xl bg-black overflow-hidden border border-amber-500/50 p-0.5 shadow-md flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Khan Store Premium"
              width={48}
              height={48}
              className="object-contain w-full h-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span className="font-extrabold text-sm sm:text-base text-text-main tracking-tight">KHAN STORE ADMIN</span>
            </div>
            <span className="text-[10px] text-text-subtle font-semibold uppercase tracking-widest block">Boshqaruv Konsoli</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-main bg-bg-card hover:bg-bg-hover text-text-muted hover:text-text-main font-semibold transition-colors"
          >
            <span>Saytni Ochish</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <ThemeToggle />

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-xs"
            title="Tizimdan chiqish"
          >
            <LogOut className="w-4 h-4" />
            <span>Chiqish</span>
          </button>
        </div>
      </header>

      {/* Main Admin Console Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-main pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-text-main">Boshqaruv Paneli</h1>
            <p className="text-xs text-text-muted mt-0.5">Xush kelibsiz, {user.full_name || "Admin"}!</p>
          </div>

          <div className="flex flex-wrap bg-bg-subtle p-1 rounded-lg border border-border-main text-xs font-semibold gap-1">
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-3.5 py-2 rounded-md transition-all ${
                activeTab === "stats" ? "bg-accent-main text-accent-fg shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              Statistika
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-3.5 py-2 rounded-md transition-all ${
                activeTab === "orders" ? "bg-accent-main text-accent-fg shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              Buyurtmalar
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-3.5 py-2 rounded-md transition-all ${
                activeTab === "products" ? "bg-accent-main text-accent-fg shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              Mahsulotlar
            </button>
            <button
              onClick={() => setActiveTab("brands")}
              className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-1 ${
                activeTab === "brands" ? "bg-accent-main text-accent-fg shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Brendlar</span>
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-1 ${
                activeTab === "categories" ? "bg-accent-main text-accent-fg shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kategoriyalar</span>
            </button>
            <button
              onClick={() => setActiveTab("promocodes")}
              className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-1 ${
                activeTab === "promocodes" ? "bg-accent-main text-accent-fg shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Promokodlar</span>
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-1 ${
                activeTab === "security" ? "bg-accent-main text-accent-fg shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Xavfsizlik</span>
            </button>
          </div>
        </div>

        {/* Brands Tab */}
        {activeTab === "brands" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-bg-card p-6 rounded-xl border border-border-main space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <Award className="w-5 h-5 text-accent-main" />
                <span>Yangi Brend Qo'shish</span>
              </h3>

              {brandSuccess && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs">
                  {brandSuccess}
                </div>
              )}

              <form onSubmit={handleAddBrand} className="space-y-3 text-xs">
                <div>
                  <label className="block text-text-main mb-1 font-semibold">Brend Nomi *</label>
                  <input
                    type="text"
                    required
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Rolex, Patek Philippe, Ray-Ban..."
                    className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-text-main mb-1 font-semibold">Ishlab chiqaruvchi mamlakat</label>
                  <input
                    type="text"
                    value={newBrandCountry}
                    onChange={(e) => setNewBrandCountry(e.target.value)}
                    placeholder="Shveytsariya, Italiya, Yaponiya..."
                    className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-text-main mb-1 font-semibold">Brend haqida tavsif</label>
                  <textarea
                    rows={2}
                    value={newBrandDesc}
                    onChange={(e) => setNewBrandDesc(e.target.value)}
                    placeholder="Brend tarixi va sifati..."
                    className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-accent-main text-accent-fg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm"
                >
                  Brendni Qo'shish
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-bg-card p-6 rounded-xl border border-border-main space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-text-main">Mavjud Brendlar RO'yxati</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {brands?.map((b: any) => (
                  <div key={b.id} className="p-3 rounded-lg bg-bg-subtle border border-border-main flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-text-main">{b.name}</p>
                      <p className="text-[10px] text-text-subtle">{b.country} • {b.slug}</p>
                    </div>
                    <button
                      onClick={() => deleteBrandMutation.mutate(b.id)}
                      className="p-1.5 text-text-subtle hover:text-red-500 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Create Category Form */}
            <div className="lg:col-span-5 bg-bg-card p-6 rounded-xl border border-border-main space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent-main" />
                <span>Yangi Kategoriya Qo'shish</span>
              </h3>

              {catError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{catError}</span>
                </div>
              )}

              {catSuccess && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{catSuccess}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCatError("");
                  setCatSuccess("");
                  const generatedSlug = catSlug || catName.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
                  addCategoryMutation.mutate({
                    name: catName.trim(),
                    slug: generatedSlug,
                    description: catDesc.trim(),
                    image_url: catImageUrl || null,
                    display_order: parseInt(catDisplayOrder) || 1,
                  });
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-text-main mb-1 font-semibold">Kategoriya Nomi *</label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="Soatlar, Ko'zoynaklar, Kepkalar..."
                    className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-text-main mb-1 font-semibold">Tavsif</label>
                  <input
                    type="text"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Klassik va zamonaviy aksessuarlar..."
                    className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                  />
                </div>

                {/* Category Image Upload (Circular Preview) */}
                <div className="space-y-2">
                  <label className="block text-text-main font-semibold">Kategoriya Rasmi (Dumaloq shaklda chiqadi) *</label>
                  <input
                    ref={catFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCatImageUpload}
                    className="hidden"
                  />

                  {catImageUrl ? (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-bg-subtle border border-border-main">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 shrink-0">
                        <Image src={catImageUrl} alt="Category preview" fill className="object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-[11px] text-text-muted truncate max-w-[180px]">{catImageUrl}</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => catFileInputRef.current?.click()}
                            className="px-2.5 py-1 rounded bg-bg-card border border-border-main text-text-main font-semibold text-[11px] hover:bg-bg-hover"
                          >
                            Almashtirish
                          </button>
                          <button
                            type="button"
                            onClick={() => setCatImageUrl("")}
                            className="px-2.5 py-1 rounded bg-red-600 text-white font-semibold text-[11px] hover:bg-red-700"
                          >
                            O'chirish
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => catFileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-border-main hover:border-accent-main rounded-xl p-4 text-center bg-bg-subtle hover:bg-bg-hover transition-all cursor-pointer space-y-1"
                    >
                      {catUploading ? (
                        <div className="flex flex-col items-center gap-1 text-text-muted">
                          <Loader2 className="w-5 h-5 animate-spin text-accent-main" />
                          <span className="text-[11px] font-semibold">Rasm yuklanmoqda...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <UploadCloud className="w-5 h-5 text-text-main" />
                          <span className="text-xs font-bold text-text-main">
                            Rasm yuklash (Telefondan / Kompyuterdan)
                          </span>
                          <span className="text-[10px] text-text-subtle">
                            PNG, JPEG yoki WEBP
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={catUploading}
                  className="w-full py-3 rounded-lg bg-accent-main text-accent-fg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                >
                  Kategoriyani Qo'shish
                </button>
              </form>
            </div>

            {/* Existing Categories List */}
            <div className="lg:col-span-7 bg-bg-card p-6 rounded-xl border border-border-main space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-text-main">Mavjud Kategoriyalar Ro'yxati</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {categories?.map((c: any) => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-bg-subtle border border-border-main flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-amber-500/50 shrink-0 bg-black flex items-center justify-center text-white font-bold">
                        {c.image_url ? (
                          <Image src={getImageUrl(c.image_url)} alt={c.name} fill className="object-cover" />
                        ) : (
                          <span>{c.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-text-main text-sm">{c.name}</p>
                        <p className="text-[11px] text-text-subtle">{c.slug} {c.description && `• ${c.description}`}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(c);
                          setEditCatName(c.name);
                          setEditCatDesc(c.description || "");
                          setEditCatImageUrl(c.image_url || "");
                          setEditCatDisplayOrder(c.display_order?.toString() || "1");
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-main text-text-main font-semibold hover:bg-bg-hover flex items-center gap-1 text-[11px]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Tahrirlash / Rasm almashtirish</span>
                      </button>
                      <button
                        onClick={() => deleteCategoryMutation.mutate(c.id)}
                        className="p-1.5 text-text-subtle hover:text-red-500 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PromoCodes Tab */}
        {activeTab === "promocodes" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-bg-card p-6 rounded-xl border border-border-main space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                <span>Yangi Promokod Yaratish</span>
              </h3>

              {promoError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{promoError}</span>
                </div>
              )}

              {promoSuccess && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{promoSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAddPromo} className="space-y-3 text-xs">
                <div>
                  <label className="block text-text-main mb-1 font-semibold">Promokod kodi (Katta harflarda) *</label>
                  <input
                    type="text"
                    required
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                    placeholder="KHAN50K, SUMMER2026..."
                    className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main uppercase font-mono tracking-wider focus:border-accent-main focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-text-main mb-1 font-semibold">Chegirma summasi (UZS so'm) *</label>
                  <input
                    type="number"
                    required
                    value={newPromoDiscount}
                    onChange={(e) => setNewPromoDiscount(e.target.value)}
                    placeholder="50000"
                    className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-accent-main text-accent-fg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm"
                >
                  Promokod Yaratish
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-bg-card p-6 rounded-xl border border-border-main space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-text-main">Mavjud Promokodlar</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {promocodes?.map((p: any) => (
                  <div key={p.id} className="p-3 rounded-lg bg-bg-subtle border border-border-main flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-extrabold text-text-main text-sm tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {p.code}
                      </span>
                      <p className="text-[11px] text-text-muted mt-1">
                        Chegirma: <strong className="text-text-main font-bold">{formatPrice(p.discount_amount)}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-600 border border-green-500/20">
                        Faol
                      </span>
                      <button
                        onClick={() => deletePromoMutation.mutate(p.id)}
                        className="p-1.5 text-text-subtle hover:text-red-500 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security / Password Change Tab */}
        {activeTab === "security" && (
          <div className="max-w-md mx-auto bg-bg-card p-6 rounded-xl border border-border-main space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-accent-main" />
              <span>Admin Parolini O'zgartirish</span>
            </h3>

            {pwdError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            {pwdSuccess && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-text-main font-semibold mb-1">Joriy Parol *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-text-main font-semibold mb-1">Yangi Kuchli Parol *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kamida 8 belgi, harf + raqam"
                  className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-text-main font-semibold mb-1">Yangi Parolni Tasdiqlang *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full py-3 rounded-lg bg-accent-main text-accent-fg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
              >
                {pwdLoading ? "O'zgartirilmoqda..." : "Parolni Yangilash"}
              </button>
            </form>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-bg-card border border-border-main flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-accent-main text-accent-fg flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-text-subtle font-medium">Jami Tushum</span>
                  <h3 className="text-xl font-extrabold text-text-main">
                    {formatPrice(stats?.total_revenue || 0)}
                  </h3>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-bg-card border border-border-main flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-accent-main text-accent-fg flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-text-subtle font-medium">Buyurtmalar</span>
                  <h3 className="text-xl font-extrabold text-text-main">{stats?.total_orders || 0} ta</h3>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-bg-card border border-border-main flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-accent-main text-accent-fg flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-text-subtle font-medium">Mahsulotlar</span>
                  <h3 className="text-xl font-extrabold text-text-main">{stats?.total_products || 0} ta</h3>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-bg-card border border-border-main flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-accent-main text-accent-fg flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-text-subtle font-medium">Kutilayotgan</span>
                  <h3 className="text-xl font-extrabold text-text-main">{stats?.pending_orders || 0} ta</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-bg-card rounded-xl border border-border-main p-6 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-text-main mb-2">Barcha Buyurtmalar</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-text-main">
                <thead className="bg-bg-subtle text-text-subtle uppercase tracking-wider text-[10px] border-b border-border-main">
                  <tr>
                    <th className="p-3">Raqam</th>
                    <th className="p-3">Mijoz</th>
                    <th className="p-3">Manzil</th>
                    <th className="p-3">Summa</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main">
                  {orders?.map((o: any) => (
                    <tr key={o.id} className="hover:bg-bg-subtle transition-colors">
                      <td className="p-3 font-mono font-bold text-text-main">{o.order_number}</td>
                      <td className="p-3">
                        <p className="font-semibold text-text-main">{o.customer_name}</p>
                        <p className="text-[10px] text-text-subtle">{o.customer_phone}</p>
                      </td>
                      <td className="p-3 max-w-xs truncate">{o.shipping_address}</td>
                      <td className="p-3 font-bold text-text-main">{formatPrice(o.total_amount)}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-bg-subtle text-text-main border border-border-main">
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            updateStatusMutation.mutate({ orderId: o.id, newStatus: e.target.value })
                          }
                          className="bg-bg-main border border-border-main text-text-main rounded px-2 py-1 text-xs focus:outline-none"
                        >
                          <option value="kutilmoqda">kutilmoqda</option>
                          <option value="ishlanmoqda">ishlanmoqda</option>
                          <option value="yo'lda">yo'lda</option>
                          <option value="yetkazildi">yetkazildi</option>
                          <option value="bekor qilindi">bekor qilindi</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Add Product Form */}
            <div className="lg:col-span-5 bg-bg-card p-6 rounded-xl border border-border-main space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent-main" />
                <span>Yangi Mahsulot Qo'shish</span>
              </h3>

              {formSuccess && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs">
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block text-text-main mb-1 font-semibold">Mahsulot Nomi *</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Casio Edifice EFR-556"
                    className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-text-main mb-1 font-semibold">Narxi (so'm) *</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="1500000"
                      className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-text-main mb-1 font-semibold">Brend *</label>
                    <select
                      value={brandId}
                      onChange={(e) => setBrandId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                    >
                      {brands?.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-text-main mb-1 font-semibold">Sifat Darajasi *</label>
                    <select
                      value={qualityTier}
                      onChange={(e) => setQualityTier(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main font-bold focus:border-accent-main focus:outline-none"
                    >
                      <option value="original">Original</option>
                      <option value="lux_copy">Lux Nusxa</option>
                      <option value="super_clone">Super Klon 1:1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-text-main mb-1 font-semibold">Mexanizm / Tur</label>
                    <select
                      value={mechanism}
                      onChange={(e) => setMechanism(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                    >
                      <option value="Avtomatik">Avtomatik</option>
                      <option value="Kvars">Kvars</option>
                      <option value="Mexanik (Manual)">Mexanik (Manual)</option>
                    </select>
                  </div>
                </div>

                {/* Product Images Upload Section (Up to 5 Images max) */}
                <div className="space-y-3 pt-2 border-t border-border-subtle">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-text-main font-semibold">Mahsulot Rasmlari (Maksimum 5 ta) *</label>
                      <span className="text-[10px] text-text-subtle">1-rasm asosiy muqova (cover) bo'ladi</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-500">{productImages.length} / 5</span>
                  </div>

                  {productImageError && (
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
                      {productImageError}
                    </div>
                  )}

                  <input
                    ref={productImageFileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProductImageUpload}
                    className="hidden"
                  />

                  {/* Images Thumbnails Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {productImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border-main bg-bg-subtle group">
                        <Image src={getImageUrl(imgUrl)} alt={`Product ${idx + 1}`} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setProductImages((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-1 rounded-full bg-red-600 text-white"
                            title="O'chirish"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-black text-[8px] font-bold text-center py-0.5">
                            Asosiy
                          </span>
                        )}
                      </div>
                    ))}

                    {productImages.length < 5 && (
                      <button
                        type="button"
                        onClick={() => productImageFileInputRef.current?.click()}
                        disabled={productImageUploading}
                        className="aspect-square rounded-lg border-2 border-dashed border-border-main hover:border-accent-main flex flex-col items-center justify-center gap-1 bg-bg-subtle hover:bg-bg-hover transition-colors text-text-muted hover:text-text-main"
                      >
                        {productImageUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-accent-main" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span className="text-[9px] font-bold">+Rasm</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Option to paste image URL */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="url"
                      placeholder="yoki Rasm URL manzilini kiriting..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val && productImages.length < 5) {
                            setProductImages((prev) => [...prev, val].slice(0, 5));
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-bg-main border border-border-main text-text-main text-xs focus:border-accent-main focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-text-main mb-1 font-semibold">Qisqa Tavsif</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mahsulot haqida..."
                    className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={productImageUploading}
                  className="w-full py-3 rounded-lg bg-accent-main text-accent-fg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                >
                  Bazaga Qo'shish
                </button>
              </form>
            </div>

            {/* Existing Products List */}
            <div className="lg:col-span-7 bg-bg-card p-6 rounded-xl border border-border-main space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-text-main">Baza Mahsulotlari</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {productsData?.items?.map((p: any) => (
                  <div key={p.id} className="p-3 rounded-lg bg-bg-subtle border border-border-main flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-text-main">{p.name}</p>
                      <p className="text-[10px] text-text-subtle">{p.brand?.name} • {p.mechanism}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-text-main">{formatPrice(p.price)}</span>
                      <button
                        onClick={() => deleteProductMutation.mutate(p.id)}
                        className="p-1.5 text-text-subtle hover:text-red-500 transition-colors"
                        title="Mahsulotni o'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal / Panel */}
        {editingCategory && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-bg-card border border-border-main rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
              <button
                onClick={() => setEditingCategory(null)}
                className="absolute top-4 right-4 p-1 rounded-lg bg-bg-subtle text-text-muted hover:text-text-main"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <span>Kategoriyani Tahrirlash va Rasmini Almashtirish</span>
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateCategoryMutation.mutate({
                    id: editingCategory.id,
                    payload: {
                      name: editCatName.trim(),
                      description: editCatDesc.trim(),
                      image_url: editCatImageUrl || null,
                      display_order: parseInt(editCatDisplayOrder) || 1,
                    },
                  });
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-text-main mb-1 font-semibold">Kategoriya Nomi *</label>
                  <input
                    type="text"
                    required
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-text-main mb-1 font-semibold">Tavsif</label>
                  <input
                    type="text"
                    value={editCatDesc}
                    onChange={(e) => setEditCatDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-bg-main border border-border-main text-text-main focus:border-accent-main focus:outline-none"
                  />
                </div>

                {/* Edit Category Image Upload (Circular preview) */}
                <div className="space-y-2">
                  <label className="block text-text-main font-semibold">Kategoriya Rasmi (Almashtirish)</label>
                  <input
                    ref={editCatFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleEditCatImageUpload}
                    className="hidden"
                  />

                  <div className="flex items-center gap-4 p-3 rounded-xl bg-bg-subtle border border-border-main">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 shrink-0 bg-black flex items-center justify-center text-white">
                      {editCatImageUrl ? (
                        <Image src={getImageUrl(editCatImageUrl)} alt="Category preview" fill className="object-cover" />
                      ) : (
                        <span>{editCatName.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <button
                        type="button"
                        onClick={() => editCatFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-accent-main text-accent-fg font-bold text-xs shadow-xs hover:opacity-90 flex items-center gap-1.5"
                      >
                        {editCatUploading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        <span>Rasmni almashtirish</span>
                      </button>
                      <p className="text-[10px] text-text-subtle">Galereyadan yangi rasm tanlang</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="flex-1 py-2.5 rounded-lg border border-border-main text-text-muted font-bold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg bg-accent-main text-accent-fg font-bold shadow-xs hover:opacity-90"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
