import API from './axios.instance';

/* ================= GET ALL DOCS ================= */
export const getAllDocs = (data) => {
  return API.get(`/docs`, data);
};

/* ================= GET DOCS BY CATEGORY ================= */
export const getDocsByCategory = (categoryId) => {
  return API.get(`/docs?category=${categoryId}`);
};

/* ================= GET ALL CATEGORIES ================= */
export const getAllCategories = () => {
  return API.get(`/categories`);
};

/* ================= TRACK READING ================= */
export const trackReading = (docId) => {
  return API.get(`/docs/${docId}/read`);
};
