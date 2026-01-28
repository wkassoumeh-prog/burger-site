"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Flame, Star, ChevronRight, ArrowRight, Menu, X, Minus, Loader2, CheckCircle2, User, LogOut, Package } from "lucide-react";
import Link from "next/link";

// --- Types ---
interface Burger {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  tag?: string;
  isSandwich?: boolean; // For meal upsell trigger
}

interface AddOn {
  id: number;
  name: string;
  price: number;
  image: string;
  category: "sides" | "drinks" | "salads";
}

interface CartItem extends Burger {
  quantity: number;
  isMeal?: boolean;
  mealIncludes?: { name: string; price: number }[];
  mealUpcharge?: number;
}

interface Toast {
  id: string;
  message: string;
  itemName?: string;
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

type CheckoutStep = "cart" | "details" | "payment" | "success";

// --- Mock Data ---
const BURGERS: Burger[] = [
  {
    id: 1,
    name: "The Ironclad",
    description: "Double smashed wagyu, aged cheddar, charcoal aioli, smoked bacon.",
    price: 18.5,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    tag: "950 kcal",
    isSandwich: true,
  },
  {
    id: 2,
    name: "Magma Jalapeño",
    description: "Spicy pepper jack, blistered jalapeños, chipotle aioli, crispy onion strings.",
    price: 16.0,
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop",
    tag: "820 kcal",
    isSandwich: true,
  },
  {
    id: 3,
    name: "Black Truffle Forge",
    description: "Wild mushrooms, truffle-infused mayo, swiss cheese, arugula on brioche.",
    price: 21.0,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop",
    tag: "780 kcal",
    isSandwich: true,
  },
  {
    id: 4,
    name: "Smokestack BBQ",
    description: "Beef patty, smoked brisket, maple bacon, bourbon BBQ sauce, pickles.",
    price: 24.0,
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=800&auto=format&fit=crop",
    tag: "1100 kcal",
    isSandwich: true,
  },
  {
    id: 5,
    name: "The Vulcan (Vegan)",
    description: "House-made black bean & beet patty, avocado, sprouts, vegan spicy mayo.",
    price: 17.5,
    image: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?q=80&w=800&auto=format&fit=crop",
    tag: "Vegan",
    isSandwich: true,
  },
  {
    id: 6,
    name: "Steel City Classic",
    description: "Single patty, heirloom tomato, iceberg lettuce, house pickles, classic forge sauce.",
    price: 19.0,
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800&auto=format&fit=crop",
    tag: "650 kcal",
    isSandwich: true,
  },
];

const ADD_ONS: AddOn[] = [
  { id: 101, name: "Crispy Fries", price: 4.5, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=400&auto=format&fit=crop", category: "sides" },
  { id: 102, name: "Sweet Potato Fries", price: 5.5, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=400&auto=format&fit=crop", category: "sides" },
  { id: 103, name: "Onion Rings", price: 5.0, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=400&auto=format&fit=crop", category: "sides" },
  { id: 201, name: "Cola", price: 2.5, image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=400&auto=format&fit=crop", category: "drinks" },
  { id: 202, name: "Lemonade", price: 3.0, image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=400&auto=format&fit=crop", category: "drinks" },
  { id: 203, name: "Iced Tea", price: 2.5, image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=400&auto=format&fit=crop", category: "drinks" },
  { id: 301, name: "Caesar Salad", price: 6.5, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?q=80&w=400&auto=format&fit=crop", category: "salads" },
  { id: 302, name: "Garden Salad", price: 5.5, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?q=80&w=400&auto=format&fit=crop", category: "salads" },
];

const MEAL_UPCHARGE = 6.0; // Price difference for making it a meal (fries + cola)

// Helper functions
const generateRandomText = (length: number) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const generateRandomName = () => {
  const firstNames = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Sage"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const generateRandomEmail = () => {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "example.com"];
  const username = generateRandomText(8).toLowerCase();
  return `${username}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

const generateOrderId = () => {
  const prefix = "BF";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return `${prefix}-${number}`;
};

// Toast Component
const Toast: React.FC<{ toast: Toast; onDismiss: (id: string) => void; onViewCart: () => void }> = ({ toast, onDismiss, onViewCart }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 2000); // Auto-dismiss after 3 seconds
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]); // onDismiss is now stable via useCallback

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: "-50%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-neutral-900 border border-white/20 rounded-xl px-6 py-4 shadow-2xl backdrop-blur-xl flex items-center gap-4 min-w-[300px] max-w-md"
    >
      <CheckCircle2 size={20} className="text-orange-500 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-white font-bold text-sm">{toast.message}</p>
        {toast.itemName && <p className="text-white/60 text-xs mt-1">{toast.itemName}</p>}
      </div>
      <button
        onClick={onViewCart}
        className="text-orange-500 hover:text-orange-400 font-bold text-xs uppercase tracking-wider transition-colors"
      >
        View Cart
      </button>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-white/40 hover:text-white/60 transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default function BurgerForge() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("cart");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingMealUpsell, setPendingMealUpsell] = useState<Burger | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Form state
  const [detailsForm, setDetailsForm] = useState({
    name: generateRandomName(),
    email: generateRandomEmail(),
    phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    address: `${Math.floor(Math.random() * 9999) + 1} ${generateRandomText(8)} Street, ${generateRandomText(6)} City, ${generateRandomText(2).toUpperCase()} ${Math.floor(Math.random() * 90000 + 10000)}`,
    deliveryType: "delivery" as "delivery" | "pickup",
    notes: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "4242424242424242",
    expiry: "12/25",
    cvc: "123",
    name: generateRandomName(),
  });

  const [loginForm, setLoginForm] = useState({
    name: "",
    email: "",
  });

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("burgerForge_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Handle ESC key for modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isCartOpen) handleCloseCart();
        if (isLoginOpen) setIsLoginOpen(false);
        if (pendingMealUpsell) setPendingMealUpsell(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isCartOpen, isLoginOpen, pendingMealUpsell]);

  // Focus trap for modals
  useEffect(() => {
    if (isCartOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };
      
      firstElement?.focus();
      document.addEventListener("keydown", handleTab);
      return () => document.removeEventListener("keydown", handleTab);
    }
  }, [isCartOpen, checkoutStep]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const showToast = (message: string, itemName?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, itemName }]);
  };

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToCart = (burger: Burger) => {
    // Check if it's a sandwich and trigger meal upsell
    if (burger.isSandwich) {
      setPendingMealUpsell(burger);
      return;
    }
    
    // Regular add to cart
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === burger.id && !item.isMeal);
      if (existingItem) {
        return prev.map((item) =>
          item.id === burger.id && !item.isMeal
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...burger, quantity: 1 }];
    });
    showToast("Added to cart", burger.name);
  };

  const addMealToCart = (burger: Burger) => {
    const mealItem: CartItem = {
      ...burger,
      quantity: 1,
      isMeal: true,
      mealIncludes: [
        { name: "Crispy Fries", price: 4.5 },
        { name: "Cola", price: 2.5 },
      ],
      mealUpcharge: MEAL_UPCHARGE,
      price: burger.price + MEAL_UPCHARGE,
    };
    setCart((prev) => [...prev, mealItem]);
    setPendingMealUpsell(null);
    showToast("Meal added to cart", `${burger.name} Meal`);
  };

  const addRegularToCart = (burger: Burger) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === burger.id && !item.isMeal);
      if (existingItem) {
        return prev.map((item) =>
          item.id === burger.id && !item.isMeal
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...burger, quantity: 1 }];
    });
    setPendingMealUpsell(null);
    showToast("Added to cart", burger.name);
  };

  const addAddOnToCart = (addOn: AddOn) => {
    const addOnAsBurger: CartItem = {
      id: addOn.id,
      name: addOn.name,
      description: "",
      price: addOn.price,
      image: addOn.image,
      quantity: 1,
    };
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === addOn.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === addOn.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, addOnAsBurger];
    });
    showToast("Added to cart", addOn.name);
  };

  const removeFromCart = (itemId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, delta: number) => {
    setCart((prev) => {
      const item = prev.find((item) => item.id === itemId);
      if (!item) return prev;
      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        return prev.filter((item) => item.id !== itemId);
      }
      return prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleProceedToPay = () => {
    setCheckoutStep("details");
  };

  const handleDetailsSubmit = () => {
    setCheckoutStep("payment");
  };

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    const newOrderId = generateOrderId();
    setOrderId(newOrderId);
    
    // Store order items and total before clearing cart
    setOrderItems([...cart]);
    setOrderTotal(total);
    
    // Save order to localStorage
    const order: Order = {
      id: newOrderId,
      date: new Date().toISOString(),
      items: [...cart],
      total,
      details: { ...detailsForm },
    };
    
    const existingOrders = JSON.parse(localStorage.getItem("burgerForge_orders") || "[]");
    existingOrders.push(order);
    localStorage.setItem("burgerForge_orders", JSON.stringify(existingOrders));
    
    setCheckoutStep("success");
    setIsProcessing(false);
    setCart([]);
  };

  const handleCloseCart = () => {
    if (checkoutStep === "success") {
      setIsCartOpen(false);
      setCheckoutStep("cart");
      setOrderId(null);
      setOrderItems([]);
      setOrderTotal(0);
      setDetailsForm({
        name: generateRandomName(),
        email: generateRandomEmail(),
        phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        address: `${Math.floor(Math.random() * 9999) + 1} ${generateRandomText(8)} Street, ${generateRandomText(6)} City, ${generateRandomText(2).toUpperCase()} ${Math.floor(Math.random() * 90000 + 10000)}`,
        deliveryType: "delivery",
        notes: "",
      });
      setPaymentForm({
        cardNumber: "4242424242424242",
        expiry: "12/25",
        cvc: "123",
        name: generateRandomName(),
      });
    } else {
      setIsCartOpen(false);
    }
  };

  const handleLogin = () => {
    if (loginForm.name && loginForm.email) {
      const userData = { name: loginForm.name, email: loginForm.email };
      setUser(userData);
      localStorage.setItem("burgerForge_user", JSON.stringify(userData));
      setIsLoginOpen(false);
      setLoginForm({ name: "", email: "" });
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("burgerForge_user");
  };

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-white">
      {/* Toast Container */}
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
            onViewCart={() => {
              setIsCartOpen(true);
              dismissToast(toast.id);
            }}
          />
        ))}
      </AnimatePresence>

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
          <Link href="/" className="flex items-center gap-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-orange-500 p-2 rounded-lg">
                <Flame className="w-6 h-6 text-black" fill="currentColor" />
              </div>
            </motion.div>
            <span className="text-2xl font-black tracking-tighter uppercase">Burger Forge</span>
          </Link>

          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8 uppercase font-bold text-sm tracking-widest">
            <a href="#menu" className="hover:text-orange-500 transition-colors">Menu</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Locations</a>
            <a href="#" className="hover:text-orange-500 transition-colors">About</a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/orders" className="hidden md:flex items-center gap-2 text-white hover:text-orange-500 transition-colors uppercase font-bold text-sm tracking-wider">
                  <Package size={18} />
                  Your Orders
                </Link>
                <div className="hidden md:flex items-center gap-2 text-white/60 text-sm">
                  <User size={16} />
                  {user.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors uppercase font-bold text-xs tracking-wider"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors uppercase font-bold text-xs tracking-wider"
              >
                <User size={16} />
                Log In
              </button>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-bold transition-all hover:bg-orange-500 hover:text-white"
            >
              <ShoppingCart size={18} />
              <span className="text-sm">CART</span>
              <AnimatePresence mode="popLayout">
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-neutral-950"
                  >
                    {cartCount}
                  </motion.span>
                )}
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
              <div className="flex flex-col p-6 gap-4 uppercase font-bold text-sm tracking-widest">
                <a href="#menu" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange-500 transition-colors">Menu</a>
                <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange-500 transition-colors">Locations</a>
                <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange-500 transition-colors">About</a>
                {user ? (
                  <>
                    <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange-500 transition-colors flex items-center gap-2">
                      <Package size={16} />
                      Your Orders
                    </Link>
                    <div className="text-white/60 text-sm normal-case flex items-center gap-2">
                      <User size={16} />
                      {user.name}
                    </div>
                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="hover:text-orange-500 transition-colors flex items-center gap-2">
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }} className="hover:text-orange-500 transition-colors flex items-center gap-2">
                    <User size={16} />
                    Log In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-[#121212]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=2000&q=80"
            alt="Background" 
            className="w-full h-full object-cover opacity-40 scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent" />
        </div>

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
                className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden hover:border-[#FF4500]/50 transition-all duration-300 group flex flex-col h-full"
              >
                <div className="relative h-64 overflow-hidden">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    src={burger.image}
                    alt={burger.name}
                    className="w-full h-full object-cover"
                  />
                  {burger.tag && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-medium border border-white/10">
                      {burger.tag}
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-white">{burger.name}</h3>
                    <span className="text-xl font-bold text-[#FF4500]">${burger.price.toFixed(2)}</span>
                  </div>
                  
                  <p className="text-gray-400 mb-6 flex-1 line-clamp-3 leading-relaxed">
                    {burger.description}
                  </p>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(burger)}
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

      {/* --- Meal Upsell Modal --- */}
      <AnimatePresence>
        {pendingMealUpsell && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPendingMealUpsell(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[151] flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-neutral-950 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl pointer-events-auto"
              >
                <h3 className="text-2xl font-black uppercase mb-6 tracking-tighter">Make it a meal?</h3>
                <div className="flex gap-4 mb-6">
                  <img
                    src={pendingMealUpsell.image}
                    alt={pendingMealUpsell.name}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <p className="text-white font-bold mb-2">{pendingMealUpsell.name}</p>
                    <p className="text-white/60 text-sm mb-4">+ Crispy Fries + Cola</p>
                    <p className="text-orange-500 font-black text-xl">
                      ${(pendingMealUpsell.price + MEAL_UPCHARGE).toFixed(2)}
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      (+${MEAL_UPCHARGE.toFixed(2)})
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addRegularToCart(pendingMealUpsell)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider py-3 rounded-xl transition-all border border-white/10"
                  >
                    No thanks
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addMealToCart(pendingMealUpsell)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-wider py-3 rounded-xl transition-all"
                  >
                    Make it a meal (+${MEAL_UPCHARGE.toFixed(2)})
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- Login Modal --- */}
      <AnimatePresence>
        {isLoginOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[151] flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-neutral-950 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl pointer-events-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Log In</h3>
                  <button
                    onClick={() => setIsLoginOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                <p className="text-white/60 text-sm mb-6">
                  Demo login - no real authentication required
                </p>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={loginForm.name}
                      onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogin}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-wider py-4 rounded-xl transition-all"
                >
                  Log In
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- Cart Modal --- */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseCart}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-neutral-950 border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto md:max-w-[600px]"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Cart</h2>
                  <button
                    onClick={handleCloseCart}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Checkout Stepper */}
                {checkoutStep !== "success" && (
                  <div className="px-6 py-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      {[
                        { key: "cart", label: "Review" },
                        { key: "details", label: "Details" },
                        { key: "payment", label: "Payment" },
                      ].map((step, idx) => {
                        const stepKeys: CheckoutStep[] = ["cart", "details", "payment"];
                        const currentIdx = stepKeys.indexOf(checkoutStep);
                        const isActive = idx === currentIdx;
                        const isCompleted = idx < currentIdx;

                        return (
                          <React.Fragment key={step.key}>
                            <div className="flex flex-col items-center flex-1">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                                  isActive
                                    ? "bg-orange-500 text-black"
                                    : isCompleted
                                    ? "bg-orange-500/50 text-white"
                                    : "bg-white/10 text-white/50"
                                }`}
                              >
                                {isCompleted ? "✓" : idx + 1}
                              </div>
                              <span
                                className={`text-xs mt-2 font-bold uppercase tracking-wider ${
                                  isActive ? "text-orange-500" : "text-white/50"
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                            {idx < 2 && (
                              <div
                                className={`h-0.5 flex-1 mx-2 transition-all ${
                                  isCompleted ? "bg-orange-500" : "bg-white/10"
                                }`}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {checkoutStep === "cart" && (
                      <motion.div
                        key="cart"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-6"
                      >
                        {cart.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <ShoppingCart size={64} className="text-white/20 mb-4" />
                            <p className="text-white/50 font-bold uppercase tracking-wider">
                              Your cart is empty
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-4 mb-6">
                              {cart.map((item) => (
                                <div
                                  key={`${item.id}-${item.isMeal ? "meal" : "regular"}`}
                                  className="flex gap-4 bg-white/5 rounded-xl p-4 border border-white/10"
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-1">
                                      <h3 className="font-bold text-white">
                                        {item.name}
                                        {item.isMeal && (
                                          <span className="ml-2 text-orange-500 text-xs uppercase">(Meal)</span>
                                        )}
                                      </h3>
                                      <span className="text-white/60 text-sm font-bold">
                                        ${(item.price * item.quantity).toFixed(2)}
                                      </span>
                                    </div>
                                    {item.isMeal && item.mealIncludes && (
                                      <div className="text-white/40 text-xs mb-2">
                                        Includes: {item.mealIncludes.map((inc) => inc.name).join(", ")}
                                      </div>
                                    )}
                                    <p className="text-white/60 text-sm mb-2">
                                      ${item.price.toFixed(2)} each
                                    </p>
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                      >
                                        <Minus size={16} />
                                      </button>
                                      <span className="font-bold w-8 text-center">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                      >
                                        <Plus size={16} />
                                      </button>
                                      <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="ml-auto text-white/50 hover:text-orange-500 transition-colors text-sm font-bold uppercase"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Add-ons Section */}
                            <div className="mb-6">
                              <h4 className="text-lg font-black uppercase mb-4 tracking-tighter">Add sides & drinks</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {ADD_ONS.map((addOn) => (
                                  <div
                                    key={addOn.id}
                                    className="bg-white/5 border border-white/10 rounded-xl p-3 hover:border-orange-500/50 transition-all"
                                  >
                                    <img
                                      src={addOn.image}
                                      alt={addOn.name}
                                      className="w-full h-20 object-cover rounded-lg mb-2"
                                    />
                                    <p className="text-white font-bold text-sm mb-1">{addOn.name}</p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-orange-500 font-bold text-sm">${addOn.price.toFixed(2)}</span>
                                      <button
                                        onClick={() => addAddOnToCart(addOn)}
                                        className="w-7 h-7 flex items-center justify-center bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                                      >
                                        <Plus size={14} className="text-black" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}

                    {checkoutStep === "details" && (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-6"
                      >
                        <h3 className="text-xl font-black uppercase mb-6 tracking-tighter">
                          Delivery Details
                        </h3>
                        <div className="space-y-4 mb-6">
                          <div>
                            <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                              Name
                            </label>
                            <input
                              type="text"
                              value={detailsForm.name}
                              onChange={(e) =>
                                setDetailsForm({ ...detailsForm, name: e.target.value })
                              }
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                              Email (optional)
                            </label>
                            <input
                              type="email"
                              value={detailsForm.email}
                              onChange={(e) =>
                                setDetailsForm({ ...detailsForm, email: e.target.value })
                              }
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={detailsForm.phone}
                              onChange={(e) =>
                                setDetailsForm({ ...detailsForm, phone: e.target.value })
                              }
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                              Delivery Type
                            </label>
                            <div className="flex gap-4">
                              <button
                                onClick={() => setDetailsForm({ ...detailsForm, deliveryType: "delivery" })}
                                className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-wider transition-all ${
                                  detailsForm.deliveryType === "delivery"
                                    ? "bg-orange-500 text-black"
                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                                }`}
                              >
                                Delivery
                              </button>
                              <button
                                onClick={() => setDetailsForm({ ...detailsForm, deliveryType: "pickup" })}
                                className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-wider transition-all ${
                                  detailsForm.deliveryType === "pickup"
                                    ? "bg-orange-500 text-black"
                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                                }`}
                              >
                                Pickup
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                              Address
                            </label>
                            <textarea
                              value={detailsForm.address}
                              onChange={(e) =>
                                setDetailsForm({ ...detailsForm, address: e.target.value })
                              }
                              rows={3}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                              Notes (optional)
                            </label>
                            <textarea
                              value={detailsForm.notes}
                              onChange={(e) =>
                                setDetailsForm({ ...detailsForm, notes: e.target.value })
                              }
                              rows={2}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                              placeholder="Special instructions..."
                            />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCheckoutStep("cart")}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider py-4 rounded-xl transition-all border border-white/10"
                          >
                            Back
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDetailsSubmit}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-wider py-4 rounded-xl transition-all"
                          >
                            Continue
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {checkoutStep === "payment" && (
                      <motion.div
                        key="payment"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-6"
                      >
                        <h3 className="text-xl font-black uppercase mb-6 tracking-tighter">
                          Payment
                        </h3>
                        <div className="space-y-4 mb-6">
                          <div>
                            <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                              Card Number
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={paymentForm.cardNumber}
                                onChange={(e) =>
                                  setPaymentForm({ ...paymentForm, cardNumber: e.target.value })
                                }
                                maxLength={16}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-28 text-white focus:outline-none focus:border-orange-500 transition-colors font-mono"
                                placeholder="4242 4242 4242 4242"
                              />
                              {/* Card Icons */}
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                {/* Visa */}
                                <div className="bg-white rounded px-1 py-0.5 flex items-center justify-center shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                                  <svg width="24" height="16" viewBox="0 0 32 20" fill="none" className="w-6 h-4">
                                    <rect width="32" height="20" rx="2" fill="#1434CB"/>
                                    <path d="M13.5 7.5L11.5 12.5H9.5L11.5 7.5H13.5ZM20.5 7.5L18.5 12.5H16.5L18.5 7.5H20.5ZM16 7.5L14 12.5H12L14 7.5H16Z" fill="white"/>
                                    <path d="M22.5 7.5H20.5L19 12.5H21L21.2 11.8H23L23.2 12.5H25L23.5 7.5H22.5ZM21.6 10.5L22.1 8.8L22.6 10.5H21.6Z" fill="white"/>
                                  </svg>
                                </div>
                                {/* Mastercard */}
                                <div className="bg-white rounded px-1 py-0.5 flex items-center justify-center shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                                  <svg width="24" height="16" viewBox="0 0 32 20" fill="none" className="w-6 h-4">
                                    <rect width="32" height="20" rx="2" fill="#EB001B"/>
                                    <circle cx="12" cy="10" r="5" fill="#F79E1B"/>
                                    <circle cx="20" cy="10" r="5" fill="#FF5F00"/>
                                  </svg>
                                </div>
                                {/* Amex */}
                                <div className="bg-white rounded px-1 py-0.5 flex items-center justify-center shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                                  <svg width="24" height="16" viewBox="0 0 32 20" fill="none" className="w-6 h-4">
                                    <rect width="32" height="20" rx="2" fill="#006FCF"/>
                                    <path d="M8 7H6L5 10L4 7H2V13H3.5V9.5L4.5 13H5.5L6.5 9.5V13H8V7ZM12 7H10.5V13H12V7ZM16 7H14.5L13 10.5L11.5 7H10V13H11V9.5L12.5 13H13.5L15 9.5V13H16V7ZM22 7H20.5V11.5H19V7H17.5V13H19V12H20.5V13H22V7ZM28 7H26.5L25 10L23.5 7H22V13H23.5V9.5L25 13H26.5L28 9.5V13H29.5V7H28Z" fill="white"/>
                                  </svg>
                                </div>
                                {/* Discover */}
                                <div className="bg-white rounded px-1 py-0.5 flex items-center justify-center shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                                  <svg width="24" height="16" viewBox="0 0 32 20" fill="none" className="w-6 h-4">
                                    <rect width="32" height="20" rx="2" fill="#FF6000"/>
                                    <circle cx="16" cy="10" r="6" fill="white"/>
                                    <path d="M16 6L17.5 8.5L20 8L18.5 10L20 12L17.5 11.5L16 14L14.5 11.5L12 12L13.5 10L12 8L14.5 8.5L16 6Z" fill="#FF6000"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                                Expiry
                              </label>
                              <input
                                type="text"
                                value={paymentForm.expiry}
                                onChange={(e) =>
                                  setPaymentForm({ ...paymentForm, expiry: e.target.value })
                                }
                                maxLength={5}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors font-mono"
                                placeholder="12/25"
                              />
                            </div>
                            <div>
                              <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                                CVC
                              </label>
                              <input
                                type="text"
                                value={paymentForm.cvc}
                                onChange={(e) =>
                                  setPaymentForm({ ...paymentForm, cvc: e.target.value })
                                }
                                maxLength={3}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors font-mono"
                                placeholder="123"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-2">
                              Cardholder Name
                            </label>
                            <input
                              type="text"
                              value={paymentForm.name}
                              onChange={(e) =>
                                setPaymentForm({ ...paymentForm, name: e.target.value })
                              }
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                            />
                          </div>
                        </div>
                        <div className="border-t border-white/10 pt-4 mb-6">
                          <div className="flex justify-between items-center">
                            <span className="text-white/60 uppercase font-bold tracking-wider text-sm">
                              Total
                            </span>
                            <span className="text-2xl font-black text-orange-500">
                              ${total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCheckoutStep("details")}
                            disabled={isProcessing}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider py-4 rounded-xl transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Back
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePaymentSubmit}
                            disabled={isProcessing}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-wider py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 size={20} className="animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Pay"
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {checkoutStep === "success" && (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center"
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", delay: 0.2, stiffness: 200, damping: 15 }}
                          className="mb-8 relative"
                        >
                          <div className="relative w-24 h-24">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-2xl shadow-orange-500/40"></div>
                            <div className="absolute inset-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-white">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                        <h3 className="text-3xl font-black uppercase mb-3 tracking-tighter">
                          Order Confirmed
                        </h3>
                        <p className="text-white/60 mb-8 text-lg font-medium">
                          Your order is on the way.
                        </p>
                        {orderId && (
                          <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 mb-6 w-full">
                            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">
                              Order Number
                            </p>
                            <p className="text-2xl font-black text-orange-500 font-mono">
                              {orderId}
                            </p>
                            <div className="mt-4 pt-4 border-t border-white/10 text-left">
                              <p className="text-white/60 text-xs mb-2">Order Summary:</p>
                              {orderItems.map((item, idx) => (
                                <p key={`${item.id}-${idx}`} className="text-white/80 text-sm">
                                  {item.quantity}x {item.name} {item.isMeal && "(Meal)"} - ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              ))}
                              <p className="text-white font-bold mt-2 pt-2 border-t border-white/10">
                                Total: ${orderTotal.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCloseCart}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-wider py-4 rounded-xl transition-all"
                        >
                          Close
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sticky Footer with Total and CTA */}
                {checkoutStep === "cart" && cart.length > 0 && (
                  <div className="border-t border-white/10 p-6 bg-neutral-950">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-white/60 uppercase font-bold tracking-wider text-sm">
                        Total
                      </span>
                      <span className="text-2xl font-black text-orange-500">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleProceedToPay}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-wider py-4 rounded-xl transition-all"
                    >
                      Proceed to Pay
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

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
