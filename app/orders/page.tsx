"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, ArrowLeft, Package, Calendar, MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  isMeal?: boolean;
  mealIncludes?: { name: string; price: number }[];
}

interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  details: {
    name: string;
    email: string;
    phone: string;
    address: string;
    deliveryType: "delivery" | "pickup";
    notes?: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("burgerForge_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedOrders = localStorage.getItem("burgerForge_orders");
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders);
      // Sort by date, newest first
      parsedOrders.sort((a: Order, b: Order) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setOrders(parsedOrders);
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-white">
      {/* Industrial Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Flame className="w-6 h-6 text-black" fill="currentColor" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">Burger Forge</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors uppercase font-bold text-sm tracking-wider"
          >
            <ArrowLeft size={18} />
            Back to Menu
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-6 pt-32 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <Package size={32} className="text-orange-500" />
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Your Orders</h1>
          </div>

          {user && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Package size={24} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-white font-bold">{user.name}</p>
                  <p className="text-white/60 text-sm">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <Package size={64} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/60 font-bold uppercase tracking-wider mb-2">No orders yet</p>
              <p className="text-white/40 text-sm mb-6">
                Your completed orders will appear here
              </p>
              <Link
                href="/#menu"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-wider px-6 py-3 rounded-xl transition-all"
              >
                Start Ordering
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-orange-500 font-black text-xl font-mono">{order.id}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            order.details.deliveryType === "delivery"
                              ? "bg-orange-500/20 text-orange-500"
                              : "bg-white/10 text-white/60"
                          }`}>
                            {order.details.deliveryType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <Calendar size={14} />
                          {formatDate(order.date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Total</p>
                        <p className="text-2xl font-black text-orange-500">${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Items</h3>
                    <div className="space-y-3 mb-6">
                      {order.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-white font-bold">
                                  {item.quantity}x {item.name}
                                  {item.isMeal && (
                                    <span className="ml-2 text-orange-500 text-xs uppercase">(Meal)</span>
                                  )}
                                </p>
                                {item.isMeal && item.mealIncludes && (
                                  <p className="text-white/40 text-xs mt-1">
                                    Includes: {item.mealIncludes.map((inc) => inc.name).join(", ")}
                                  </p>
                                )}
                              </div>
                              <span className="text-white/60 font-bold">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Details */}
                    <div className="border-t border-white/10 pt-6">
                      <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Delivery Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package size={16} className="text-orange-500" />
                          </div>
                          <div>
                            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Name</p>
                            <p className="text-white">{order.details.name}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Phone size={16} className="text-orange-500" />
                          </div>
                          <div>
                            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Phone</p>
                            <p className="text-white">{order.details.phone}</p>
                          </div>
                        </div>
                        {order.details.email && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Mail size={16} className="text-orange-500" />
                            </div>
                            <div>
                              <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Email</p>
                              <p className="text-white">{order.details.email}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin size={16} className="text-orange-500" />
                          </div>
                          <div>
                            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Address</p>
                            <p className="text-white">{order.details.address}</p>
                          </div>
                        </div>
                        {order.details.notes && (
                          <div className="md:col-span-2 flex items-start gap-3">
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package size={16} className="text-orange-500" />
                            </div>
                            <div>
                              <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Notes</p>
                              <p className="text-white">{order.details.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
