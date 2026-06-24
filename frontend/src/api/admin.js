import api from "./axios";

// ---- Dashboard ----
export const getDashboardStats = () => api.get("/admin/stats");

// ---- Products ----
export const getAdminProducts = (params) => api.get("/admin/products", { params });
export const createProduct = (formData) =>
  api.post("/admin/products", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateProduct = (id, formData) =>
  api.put(`/admin/products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteProduct = (id) => api.delete(`/admin/products/${id}`);
export const deleteProductImage = (productId, imageId) =>
  api.delete(`/admin/products/${productId}/images/${imageId}`);

// ---- Categories ----
export const createCategory = (formData) =>
  api.post("/admin/categories", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateCategory = (id, formData) =>
  api.put(`/admin/categories/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`);

// ---- Orders ----
export const getAdminOrders = (params) => api.get("/admin/orders", { params });
export const updateOrderStatus = (id, status) => api.put(`/admin/orders/${id}/status`, { status });

// ---- Customers ----
export const getAdminUsers = (params) => api.get("/admin/users", { params });
export const toggleBlockUser = (id) => api.put(`/admin/users/${id}/block`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// ---- Coupons ----
export const getAdminCoupons = () => api.get("/admin/coupons");
export const createCoupon = (data) => api.post("/admin/coupons", data);
export const updateCoupon = (id, data) => api.put(`/admin/coupons/${id}`, data);
export const deleteCoupon = (id) => api.delete(`/admin/coupons/${id}`);
