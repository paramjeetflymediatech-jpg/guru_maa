import API from './axios.instance';

/* ================= REGISTER ================= */
export const registerUser = (data) => {
  // name, email, phone, password
  return API.post('/auth/register', data);
};

/* ================= LOGIN ================= */
export const loginUser = (data) => {
  // email, password
  return API.post('/auth/login', data);
};

/* ================= VERIFY OTP ================= */
export const verifyOtp = (data) => {
  // email, userId, otp
  return API.post('/auth/verify-otp', data);
};

/* ================= RESEND OTP ================= */
export const resendOtp = (data) => {
  // email, userId
  return API.post('/auth/resend-otp', data);
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = (email) => {
  return API.post('/auth/forgot-password', { email });
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = (data) => {
  // email, otp, newPassword
  return API.post('/auth/reset-password', data);
};

/* ================= PROFILE UPDATE ================= */
export const profileUpdate = (id, data) => {
  return API.put(`/auth/profile/${id}`, data);
};
