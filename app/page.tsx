"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Flame, Star, ChevronRight, ArrowRight } from "lucide-react";

// --- Types ---
interface Burger {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  tag?: string;
}

// --- Mock Data ---
const BURGERS: Burger[] = [
  {
    id: 1,
    name: "The Ironclad",
    description: "Double smashed wagyu, aged cheddar, charcoal aioli, smoked bacon.",
    price: 18.5,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    tag: "Signature",
  },
  {
    id: 2,
    name: "Magma Jalapeño",
    description: "Spicy pepper jack, blistered jalapeños, chipotle aioli, crispy onion strings.",
    price: 16.0,
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop",
    tag: "Hot",
  },
  {
    id: 3,
    name: "Black Truffle Forge",
    description: "Wild mushrooms, truffle-infused mayo, swiss cheese, arugula on brioche.",
    price: 21.0,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Smokestack BBQ",
    description: "Beef patty, smoked brisket, maple bacon, bourbon BBQ sauce, pickles.",
    price: 24.0,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&auto=format&fit=crop",
    tag: "Hefty",
  },
  {
    id: 5,
    name: "The Vulcan (Vegan)",
    description: "House-made black bean & beet patty, avocado, sprouts, vegan spicy mayo.",
    price: 17.5,
    image: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?q=80&w=800&auto=format&fit=crop",
    tag: "Vegan",
  },
  {
    id: 6,
    name: "Steel City Classic",
    description: "Single patty, heirloom tomato, iceberg lettuce, house pickles, classic forge sauce.",
    price: 19.0,
    image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=800&auto=format&fit=crop",
  },
];

export default function BurgerForge() {
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const addToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-white">
      {/* Industrial Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      {/* --- Navbar --- */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "glass py-3" : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="bg-orange-500 p-2 rounded-lg">
              <Flame className="w-6 h-6 text-black" fill="currentColor" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">Burger Forge</span>
          </motion.div>

          <div className="hidden md:flex gap-8 uppercase font-bold text-sm tracking-widest">
            <a href="#menu" className="hover:text-orange-500 transition-colors">Menu</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Locations</a>
            <a href="#" className="hover:text-orange-500 transition-colors">About</a>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="relative flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-bold transition-all hover:bg-orange-500 hover:text-white"
          >
            <ShoppingCart size={18} />
            <span className="text-sm">CART</span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={cartCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-neutral-950"
              >
                {cartCount}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative h-[80vh] md:h-[90vh] flex items-center overflow-hidden border-b border-white/5">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
              <Star size={14} fill="currentColor" /> Premium Industrial Gourmet
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] mb-8">
              Crafted for <br />
              <span className="text-orange-500">Carnivores</span>
            </h1>
            <p className="text-neutral-400 text-lg md:text-xl max-w-md mb-10 leading-relaxed">
              Forged in fire, served with soul. Experience the industrial standard of gourmet burgers.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#menu" className="btn-primary flex items-center gap-2 group">
                Order Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <button className="btn-outline flex items-center gap-2">
                Our Process <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-orange-500/20 blur-[120px] rounded-full"></div>
            <img
              src="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1000&auto=format&fit=crop"
              alt="Signature Burger"
              className="relative z-10 w-full h-auto object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
            />
          </motion.div>
        </div>
        
        {/* Background Text Overlay */}
        <div className="absolute bottom-0 left-0 right-0 whitespace-nowrap opacity-[0.02] select-none pointer-events-none">
          <span className="text-[20vw] font-black uppercase leading-none">BURGER FORGE • INDUSTRIAL • GOURMET • </span>
        </div>
      </section>

      {/* --- Menu Grid --- */}
      <section id="menu" className="py-24 bg-neutral-900/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl mb-4 italic">The Blueprint</h2>
              <div className="h-1.5 w-24 bg-orange-500"></div>
            </div>
            <p className="text-neutral-500 max-w-xs uppercase text-xs font-bold tracking-widest leading-loose">
              Every component is hand-selected and precision-grilled for maximum combustion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BURGERS.map((burger, idx) => (
              <motion.div
                key={burger.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden group transition-all hover:border-orange-500/50 flex flex-col"
              >
                <div className="relative h-64 overflow-hidden">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    src={burger.image}
                    alt={burger.name}
                    className="w-full h-full object-cover"
                  />
                  {burger.tag && (
                    <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                      {burger.tag}
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <span className="text-orange-500 font-bold">${burger.price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl mb-3 group-hover:text-orange-500 transition-colors">{burger.name}</h3>
                  <p className="text-neutral-400 text-sm mb-8 leading-relaxed line-clamp-2 flex-1">
                    {burger.description}
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={addToCart}
                    className="w-full bg-white text-black py-4 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-sm hover:bg-orange-500 hover:text-white transition-all"
                  >
                    Add <Plus size={18} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 border-t border-white/5 bg-neutral-950 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-md">
              <Flame className="text-black w-5 h-5" fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Burger Forge</span>
          </div>
          <div className="text-neutral-600 text-[10px] font-bold tracking-[0.2em] uppercase">
            © 2026 Burger Forge Industrial Gourmet. All Rights Reserved.
          </div>
          <div className="flex gap-6">
            {["IG", "TW", "FB"].map((social) => (
              <a key={social} href="#" className="text-neutral-400 hover:text-orange-500 transition-colors text-xs font-bold">
                {social}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
