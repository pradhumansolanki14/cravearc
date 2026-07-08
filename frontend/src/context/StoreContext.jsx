import { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, SetCartItems] = useState({});
  const url = "http://localhost:4000";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [favorites, setFavorites] = useState([]); // array of food IDs
  const [userName, setUserName] = useState("");

  // ─── Multi-restaurant cart enforcement (Task 17) ───────────
  // Tracks which restaurant the current cart belongs to.
  // null means the cart is empty.
  const [cartRestaurantId, setCartRestaurantId] = useState(null);
  // When the user tries to add an item from a different restaurant,
  // we hold it here until they confirm or cancel the switch.
  const [pendingCartItem, setPendingCartItem] = useState(null); // { itemId, restaurantId }
  // Controls whether the conflict confirmation modal is visible.
  const [showCartConflictModal, setShowCartConflictModal] = useState(false);

  // ─── Cart ──────────────────────────────────────────────────
  /**
   * addToCart(itemId, restaurantId)
   *
   * restaurantId is optional — when omitted the function behaves
   * identically to the original (backward compatible).
   *
   * Logic:
   *  1. Cart is empty                → add normally, set cartRestaurantId
   *  2. Same restaurant as cart      → add normally
   *  3. Different restaurant         → open conflict modal, hold pending item
   */
  const addToCart = async (itemId, restaurantId) => {
    // If no restaurantId provided, fall through to the original behaviour
    if (restaurantId) {
      if (cartRestaurantId && cartRestaurantId !== restaurantId) {
        // Cart already has items from a different restaurant — ask user
        setPendingCartItem({ itemId, restaurantId });
        setShowCartConflictModal(true);
        return; // do NOT add the item yet
      }
      // Either cart is empty or same restaurant — set/keep cartRestaurantId
      if (!cartRestaurantId) {
        setCartRestaurantId(restaurantId);
      }
    }

    // Normal add
    if (!cartItems[itemId]) {
      SetCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      SetCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
    }
  };

  /**
   * confirmCartSwitch
   * Called when the user confirms they want to replace their cart.
   * Clears the existing cart, sets the new restaurant, adds the pending item.
   */
  const confirmCartSwitch = async () => {
    if (!pendingCartItem) return;
    const { itemId, restaurantId } = pendingCartItem;

    // Clear cart in state
    SetCartItems({ [itemId]: 1 });
    setCartRestaurantId(restaurantId);
    setPendingCartItem(null);
    setShowCartConflictModal(false);

    // Sync cleared cart to backend if logged in
    if (token) {
      try {
        // Remove all current cart items from server
        await axios.post(url + "/api/cart/clear", {}, { headers: { token } }).catch(() => {});
        // Add the new item
        await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
      } catch { /* silent */ }
    }
  };

  /**
   * cancelCartSwitch
   * Called when the user cancels — discard pending item, keep current cart.
   */
  const cancelCartSwitch = () => {
    setPendingCartItem(null);
    setShowCartConflictModal(false);
  };

  const removeFromCart = async (itemId) => {
    SetCartItems((prev) => {
      const updated = { ...prev, [itemId]: prev[itemId] - 1 };
      // If the cart becomes empty after this removal, clear cartRestaurantId
      const remaining = Object.values(updated).filter(qty => qty > 0).length;
      if (remaining === 0) setCartRestaurantId(null);
      return updated;
    });
    if (token) {
      await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
    }
  };

  const getTotalCartAmount = () => {
    let total = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find((p) => p._id === item);
        if (itemInfo) total += itemInfo.price * cartItems[item];
      }
    }
    return total;
  };

  // ─── Favorites ────────────────────────────────────────────
  const loadFavorites = useCallback(async (tkn) => {
    try {
      const res = await axios.get(url + "/api/favorites/ids", { headers: { token: tkn } });
      if (res.data.success) setFavorites(res.data.data);
    } catch { /* silent */ }
  }, [url]);

  const toggleFavorite = async (foodId) => {
    if (!token) return false; // caller should prompt login
    try {
      const res = await axios.post(url + "/api/favorites/toggle", { foodId }, { headers: { token } });
      if (res.data.success) {
        if (res.data.isFavorite) {
          setFavorites((prev) => [...prev, foodId]);
        } else {
          setFavorites((prev) => prev.filter((id) => id !== foodId));
        }
        return res.data.isFavorite;
      }
    } catch { /* silent */ }
    return null;
  };

  const isFavorite = (foodId) => favorites.includes(foodId);

  // ─── Food list ─────────────────────────────────────────────
  const fetchFoodList = async () => {
    const response = await axios.get(url + "/api/food/list");
    setFoodList(response.data.data);
  };

  const loadCartData = async (tkn) => {
    const response = await axios.post(url + "/api/cart/get", {}, { headers: { token: tkn } });
    SetCartItems(response.data.cartData);
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        await loadCartData(savedToken);
        await loadFavorites(savedToken);
      }
    }
    loadData();
  }, []);

  const fetchUserName = async (tkn) => {
    try {
      const res = await axios.get(url + "/api/user/profile", { headers: { token: tkn } });
      if (res.data.success) {
        setUserName(res.data.data.name);
      }
    } catch {}
  };

  // Reload favorites and username when token changes (login/logout)
  useEffect(() => {
    if (token) {
      loadFavorites(token);
      fetchUserName(token);
    } else {
      setFavorites([]);
      setUserName("");
    }
  }, [token, loadFavorites]);

  const contextValue = {
    food_list,
    cartItems,
    SetCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    favorites,
    toggleFavorite,
    isFavorite,
    // Multi-restaurant cart enforcement
    cartRestaurantId,
    setCartRestaurantId,
    pendingCartItem,
    showCartConflictModal,
    confirmCartSwitch,
    cancelCartSwitch,
    userName,
    setUserName,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
