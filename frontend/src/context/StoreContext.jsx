import { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, SetCartItems] = useState({});
  const url = "http://localhost:4000";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [favorites, setFavorites] = useState({ foods: [], restaurants: [] });
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  // ─── Cart ──────────────────────────────────────────────────
  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      SetCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      SetCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
    }
  };

  const removeFromCart = async (itemId) => {
    SetCartItems((prev) => {
      const updated = { ...prev };
      if (updated[itemId] > 0) {
        updated[itemId] -= 1;
        if (updated[itemId] === 0) delete updated[itemId];
      }
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
      if (res.data.success) {
        const data = res.data.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setFavorites({
            foods: data.foods || [],
            restaurants: data.restaurants || []
          });
        } else {
          setFavorites({
            foods: Array.isArray(data) ? data : [],
            restaurants: []
          });
        }
      }
    } catch { /* silent */ }
  }, [url]);

  const toggleFavorite = async ({ foodId, restaurantId }) => {
    if (!token) return false;
    try {
      const payload = foodId ? { foodId } : { restaurantId };
      const res = await axios.post(url + "/api/favorites/toggle", payload, { headers: { token } });
      if (res.data.success) {
        if (res.data.isFavorite) {
          setFavorites((prev) => ({
            foods: foodId ? [...prev.foods, foodId] : prev.foods,
            restaurants: restaurantId ? [...prev.restaurants, restaurantId] : prev.restaurants
          }));
        } else {
          setFavorites((prev) => ({
            foods: foodId ? prev.foods.filter(id => id !== foodId) : prev.foods,
            restaurants: restaurantId ? prev.restaurants.filter(id => id !== restaurantId) : prev.restaurants
          }));
        }
        return res.data.isFavorite;
      }
    } catch { /* silent */ }
    return null;
  };

  const isFavorite = (id, type = "food") => {
    if (type === "food") {
      return Array.isArray(favorites.foods) && favorites.foods.includes(id);
    }
    return Array.isArray(favorites.restaurants) && favorites.restaurants.includes(id);
  };

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
        setUserId(res.data.data._id);
      }
    } catch {}
  };

  // Reload favorites and username when token changes (login/logout)
  useEffect(() => {
    if (token) {
      loadFavorites(token);
      fetchUserName(token);
    } else {
      setFavorites({ foods: [], restaurants: [] });
      setUserName("");
      setUserId("");
    }
  }, [token, loadFavorites]);

  const formatPrice = (amount) => {
    return "₹" + Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

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
    formatPrice,
    favorites,
    toggleFavorite,
    isFavorite,
    userName,
    setUserName,
    userId,
    setUserId,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
