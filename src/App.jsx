import React, { createContext, useEffect, useState } from "react";
import wishlistService from "@/services/api/wishlistService";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { store } from "@/store/store";
import { clearUser, setUser } from "@/store/userSlice";
import Login from "@/components/pages/Login";
import Signup from "@/components/pages/Signup";
import Callback from "@/components/pages/Callback";
import ErrorPage from "@/components/pages/ErrorPage";
import ResetPassword from "@/components/pages/ResetPassword";
import PromptPassword from "@/components/pages/PromptPassword";
import WishlistPage from "@/components/pages/WishlistPage";
import CatalogPage from "@/components/pages/CatalogPage";
import OrdersPage from "@/components/pages/OrdersPage";
import HomePage from "@/components/pages/HomePage";
import OrderDetailPage from "@/components/pages/OrderDetailPage";
import CheckoutPage from "@/components/pages/CheckoutPage";
import CartPage from "@/components/pages/CartPage";
import ProductDetailPage from "@/components/pages/ProductDetailPage";
import DealsPage from "@/components/pages/DealsPage";
import Header from "@/components/organisms/Header";

export const AuthContext = createContext(null);

function AppContent() {
const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]); // Now stores wishlist objects instead of product IDs
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK;
    
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true);
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get('redirect');
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || 
                           currentPath.includes('/callback') || currentPath.includes('/error') || 
                           currentPath.includes('/prompt-password') || currentPath.includes('/reset-password');
        
        if (user) {
          if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath);
            } else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
                ? `/signup?redirect=${currentPath}`
                : currentPath.includes('/login')
                ? `/login?redirect=${currentPath}`
                : '/login'
            );
          } else if (redirectPath) {
            if (
              !['error', 'signup', 'login', 'callback', 'prompt-password', 'reset-password'].some((path) => currentPath.includes(path))
            ) {
              navigate(`/login?redirect=${redirectPath}`);
            } else {
              navigate(currentPath);
            }
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate('/login');
          }
          dispatch(clearUser());
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error);
      }
    });
  }, []);

useEffect(() => {
    const savedCart = localStorage.getItem("toybox-cart");
    if (savedCart) setCart(JSON.parse(savedCart));
    
    // Load wishlist from database
    const loadWishlist = async () => {
      const userWishlist = await wishlistService.getUserWishlist();
      setWishlist(userWishlist);
    };
    loadWishlist();
  }, []);

  useEffect(() => {
    localStorage.setItem("toybox-cart", JSON.stringify(cart));
  }, [cart]);
const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.Id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity_c) {
        toast.warning("Cannot add more items than available in stock");
        return;
      }
      setCart(cart.map(item =>
        item.productId === product.Id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.Id,
        quantity: 1,
        addedAt: new Date().toISOString()
      }]);
    }
    
    toast.success("Added to cart!");
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
    toast.info("Removed from cart");
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      setCart([]);
      toast.info("Cart cleared");
    }
  };

const handleAddToWishlist = async (product) => {
    const result = await wishlistService.toggleWishlist(product.Id, wishlist);
    
    if (result.success) {
      // Refresh wishlist from database
      const updatedWishlist = await wishlistService.getUserWishlist();
      setWishlist(updatedWishlist);
      
      if (result.action === 'added') {
        toast.success("Added to wishlist!");
      } else {
        toast.info("Removed from wishlist");
      }
    }
  };

  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };

  if (!isInitialized) {
    return <div className="loading flex items-center justify-center p-6 h-full w-full"><svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path></svg></div>;
  }

const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
const wishlistCount = wishlist.length; // Now counts wishlist objects

  return (
    <AuthContext.Provider value={authMethods}>
      <div className="min-h-screen bg-background">
        <Header cartCount={cartCount} wishlistCount={wishlistCount} />
        
<main className="max-w-7xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/callback" element={<Callback />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/prompt-password/:appId/:emailAddress/:provider" element={<PromptPassword />} />
              <Route path="/reset-password/:appId/:fields" element={<ResetPassword />} />
<Route path="/" element={<HomePage onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} wishlist={wishlist} />} />
              <Route path="/catalog" element={<CatalogPage onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} wishlist={wishlist} />} />
<Route path="/product/:id" element={<ProductDetailPage onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} wishlist={wishlist} />} />
              <Route path="/cart" element={<CartPage cart={cart} onUpdateQuantity={handleUpdateQuantity} onRemove={handleRemoveFromCart} onClearCart={handleClearCart} />} />
<Route path="/wishlist" element={<WishlistPage wishlist={wishlist} onAddToCart={handleAddToCart} onRemoveFromWishlist={handleAddToWishlist} />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
<Route path="/checkout" element={<CheckoutPage cart={cart} onClearCart={handleClearCart} />} />
              <Route path="/deals" element={<DealsPage onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} wishlist={wishlist} />} />
            </Routes>
          </AnimatePresence>
        </main>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </div>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;