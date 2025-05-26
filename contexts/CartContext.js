// contexts/CartContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext'; 
import {
  getCart as apiGetCart,
  addItemToCart as apiAddItemToCart,
  removeItemCompletelyFromCart as apiRemoveItemCompletely,
  incrementCartItem as apiIncrementItem,
  decrementCartItem as apiDecrementItem,
} from '../utils/cartService'; 

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      console.log('[CartContext] User not authenticated, cart state cleared for fetchCart.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log('[CartContext] Fetching cart...');
      const cartData = await apiGetCart();
      setCart(cartData);
      console.log('[CartContext] Cart fetched:', cartData);
    } catch (err) {
      console.error('[CartContext] Error fetching cart:', err);
      setError(err.message);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('[CartContext] Auth state is authenticated, triggering fetchCart.');
      fetchCart();
    } else {
      setCart(null);
      console.log('[CartContext] User logged out or not initially authenticated, cart state set to null.');
    }
  }, [isAuthenticated, fetchCart]);

  const addItem = async (productId, quantity) => {
    if (!isAuthenticated) {
      alert('กรุณาเข้าสู่ระบบเพื่อเพิ่มสินค้าลงตะกร้า');
      return Promise.reject(new Error('User not authenticated'));
    }
    setIsLoading(true);
    setError(null);
    try {
      await apiAddItemToCart(productId, quantity);
      await fetchCart();
      console.log(`[CartContext] Item added/updated: productId=${productId}, quantity=${quantity}`);
    } catch (err) {
      console.error('[CartContext] Error adding item to cart:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (productIdToRemove) => {
    if (!isAuthenticated) return Promise.reject(new Error('User not authenticated'));
    setIsLoading(true);
    setError(null);
    try {
      await apiRemoveItemCompletely(productIdToRemove);
      await fetchCart();
      console.log(`[CartContext] Item removed completely: productId=${productIdToRemove}`);
    } catch (err) {
      console.error(`[CartContext] Error removing item: productId=${productIdToRemove}`, err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const incrementItem = async (productIdToIncrement) => {
    if (!isAuthenticated) return Promise.reject(new Error('User not authenticated'));
    setIsLoading(true);
    setError(null);
    try {
      await apiIncrementItem(productIdToIncrement);
      await fetchCart();
      console.log(`[CartContext] Item incremented: productId=${productIdToIncrement}`);
    } catch (err) {
      console.error(`[CartContext] Error incrementing item: productId=${productIdToIncrement}`, err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const decrementItem = async (productIdToDecrement) => {
    if (!isAuthenticated) {
      return Promise.reject(new Error('User not authenticated'));
    }
    
    const currentItem = cart?.cart_items?.find(
      (item) => item.product_id === productIdToDecrement
    );

    if (!currentItem) {
      console.warn(`[CartContext] Item with productId=${productIdToDecrement} not found in cart to decrement.`);
      setError(`Item with ID ${productIdToDecrement} not found in cart.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (currentItem.quantity <= 1) {
        console.log(`[CartContext] Quantity for productId=${productIdToDecrement} is 1 or less. Removing item completely.`);
        await apiRemoveItemCompletely(productIdToDecrement);
      } else {
        console.log(`[CartContext] Decrementing quantity for productId=${productIdToDecrement}.`);
        await apiDecrementItem(productIdToDecrement);
      }
      await fetchCart();
      console.log(`[CartContext] Item action (decrement/remove) processed for productId=${productIdToDecrement}`);
    } catch (err) {
      console.error(`[CartContext] Error in decrementItem for productId=${productIdToDecrement}:`, err);
      setError(err.message || 'Failed to update cart item.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ----- ส่วนคำนวณค่าจาก cart state -----
  const currentCartItems = cart?.cart_items || [];

  const cartItemCount = currentCartItems.reduce(
    (count, item) => count + (item.quantity || 0),
    0
  );

  const cartTotalPrice = cart?.total_price !== undefined
    ? cart.total_price
    : currentCartItems.reduce((total, item) => {
        const price = item.product?.price || 0;
        const quantity = item.quantity || 0;
        return total + (price * quantity);
      }, 0);



  const getCartItemCount = useCallback(() => {

    return currentCartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [currentCartItems]); 



  const value = {
    cart,
    cartItems: currentCartItems,
    cartItemCount,              
    getCartItemCount,           
    cartTotalPrice,
    isLoading,
    error,
    fetchCart,
    addItem,
    removeItem,
    incrementItem,
    decrementItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined || context === null) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};