import { createContext, useContext, useState } from "react";

export const AdminContext = createContext(null);

const AdminContextProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(localStorage.getItem("adminToken") || "");
  const [adminName, setAdminName] = useState(localStorage.getItem("adminName") || "");
  const [adminRole, setAdminRole] = useState(localStorage.getItem("adminRole") || "");
  const [restaurantId, setRestaurantId] = useState(localStorage.getItem("restaurantId") || null);
  const url = "http://localhost:4000";

  const adminLogin = (token, name, role, restId) => {
    setAdminToken(token);
    setAdminName(name);
    setAdminRole(role || "");
    setRestaurantId(restId || null);
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminName", name);
    localStorage.setItem("adminRole", role || "");
    if (restId) localStorage.setItem("restaurantId", restId);
    else localStorage.removeItem("restaurantId");
  };

  const adminLogout = () => {
    setAdminToken("");
    setAdminName("");
    setAdminRole("");
    setRestaurantId(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("restaurantId");
  };

  return (
    <AdminContext.Provider value={{ adminToken, adminName, adminRole, restaurantId, adminLogin, adminLogout, url }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
export default AdminContextProvider;
