import API from './axios.instance';



/* ================= GET ALL DOCS ================= */
export const getAllDocs = (data) => {
  return API.get(`/docs`, data);
};
