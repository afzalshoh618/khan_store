"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Mail, User as UserIcon, Phone, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isLoginTab) {
        const res = await api.post("/auth/json-login", { email, password });
        setAuth(res.data.user, res.data.access_token);
        onClose();
      } else {
        const res = await api.post("/auth/register", {
          email,
          password,
          full_name: fullName,
          phone,
        });
        setAuth(res.data.user, res.data.access_token);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-obsidian/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-charcoal border border-gold-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full border border-gold-500/40 bg-slate-dark text-gold-500 font-serif font-bold text-2xl flex items-center justify-center mx-auto mb-3">
                  K
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">KHAN STORE</h3>
                <p className="text-xs text-slate-400 mt-1">Shveytsariya soatsozlik eksklyuziv klubi</p>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-2 p-1 bg-obsidian rounded-xl border border-white/5 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginTab(true);
                    setErrorMsg("");
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    isLoginTab ? "bg-gold-gradient text-obsidian shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Kirish
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginTab(false);
                    setErrorMsg("");
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    !isLoginTab ? "bg-gold-gradient text-obsidian shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Ro'yxatdan O'tish
                </button>
              </div>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoginTab && (
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1">Ism va Familiya</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jasur Rahimov"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:border-gold-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">Email Pochta</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@khanstore.uz"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>

                {!isLoginTab && (
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1">Telefon Raqam</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+998 90 123 45 67"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:border-gold-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">Parol</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-obsidian border border-white/10 text-white text-xs focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gold-gradient text-obsidian font-bold text-xs uppercase tracking-wider shadow-gold-glow hover:brightness-110 transition-all mt-6 disabled:opacity-50"
                >
                  {loading ? "Yuklanmoqda..." : isLoginTab ? "Tizimga Kirish" : "Hisob Yaratish"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
