"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Flame, Star, ChevronRight, ArrowRight, Menu, X } from "lucide-react";

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
    tag: "950 kcal", // Updated tag to match new design requirement
  },
  {
    id: 2,
    name: "Magma Jalapeño",
    description: "Spicy pepper jack, blistered jalapeños, chipotle aioli, crispy onion strings.",
    price: 16.0,
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop",
    tag: "820 kcal",
  },
  {
    id: 3,
    name: "Black Truffle Forge",
    description: "Wild mushrooms, truffle-infused mayo, swiss cheese, arugula on brioche.",
    price: 21.0,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop",
    tag: "780 kcal",
  },
  {
    id: 4,
    name: "Smokestack BBQ",
    description: "Beef patty, smoked brisket, maple bacon, bourbon BBQ sauce, pickles.",
    price: 24.0,
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=800&auto=format&fit=crop",
    tag: "1100 kcal",
  },
  {
    id: 5,
    name: "The Vulcan (Vegan)",
    description: "House-made black bean & beet patty, avocado, sprouts, vegan spicy mayo.",
    price: 17.5,
    image: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?q=80&w=800&auto=format&fit=crop",
    tag: "Vegan",
  },
  {
    id: 6,
    name: "Steel City Classic",
    description: "Single patty, heirloom tomato, iceberg lettuce, house pickles, classic forge sauce.",
    price: 19.0,
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800&auto=format&fit=crop",
    tag: "650 kcal",
  },
];

export default function BurgerForge() {
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          {/* Logo Section */}
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

          {/* Comment: Change Navbar alignment. Links are moved to the center (absolute centering) to create a balanced, high-end look that complements the centered hero section below. */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8 uppercase font-bold text-sm tracking-widest">
            <a href="#menu" className="hover:text-orange-500 transition-colors">Menu</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Locations</a>
            <a href="#" className="hover:text-orange-500 transition-colors">About</a>
          </div>

          <div className="flex items-center gap-4">
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

            <button 
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass border-t border-white/10 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4 uppercase font-bold text-sm tracking-widest text-center">
                <a href="#menu" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange-500 transition-colors">Menu</a>
                <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange-500 transition-colors">Locations</a>
                <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange-500 transition-colors">About</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- Hero Section --- */}
      {/* Comment: Change section alignment from justify-start back to justify-center. This centers the entire content block vertically and horizontally within the hero area, creating a symmetrical, cinematic layout. */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-[#121212]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=2000&q=80"
            alt="Background" 
            className="w-full h-full object-cover opacity-40 scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent" />
        </div>

        {/* Comment: Change text-left to text-center and added mx-auto to paragraph/button group to center-align the typography and call-to-action buttons for a balanced visual experience. */}
        <div className="container mx-auto px-6 relative z-10 text-center">
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4500] to-orange-400 px-2 -mx-2">
                CARNIVORES
              </span>
            </h1>
            <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Forged in fire, served with soul. Discover the industrial standard of gourmet burgers. Premium cuts, artisanal buns, and the heat of the forge.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#menu" className="btn-primary flex items-center gap-2 group">
                Order Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <button className="btn-outline flex items-center gap-2">
                Our Process <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Menu Grid --- */}
      <section id="menu" className="py-24 bg-neutral-900/50">
        <div className="container mx-auto px-6 -mt-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
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
                /* Comment: Removed whileHover={{ y: -10 }} to stop the card from raising/shifting vertically on hover, keeping the grid stable. */
                className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden hover:border-[#FF4500]/50 transition-all duration-300 group flex flex-col h-full"
              >
                {/* Image Area with Zoom Effect */}
                <div className="relative h-64 overflow-hidden">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    src={burger.image}
                    alt={burger.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Comment: Updated Tag design to be a floating glassmorphism badge at the top-right, providing calorie or diet info in a sleek, modern way. */}
                  {burger.tag && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-medium border border-white/10">
                      {burger.tag}
                    </div>
                  )}
                </div>

                {/* Comment: Updated Content Area: Used justify-between for title and price, changed price color to #FF4500, and added line-clamp-3 to description for uniform text lengths. */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-white">{burger.name}</h3>
                    <span className="text-xl font-bold text-[#FF4500]">${burger.price.toFixed(2)}</span>
                  </div>
                  
                  <p className="text-gray-400 mb-6 flex-1 line-clamp-3 leading-relaxed">
                    {burger.description}
                  </p>

                  {/* Comment: Updated Action Button: Switched to bg-white/5 for a subtle dark look with a high-impact #FF4500 hover state and rounded-xl corners for a modern, rounded industrial feel. */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={addToCart}
                    className="w-full bg-white/5 hover:bg-[#FF4500] text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Add to Cart
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
