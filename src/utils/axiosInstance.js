import axios from "axios";

// Tạo một instance của axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000", // Địa chỉ backend API
  headers: {
    "Content-Type": "application/json",
  },
});

// Middleware để thêm token vào header nếu có
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Lỗi trong request interceptor:", error);
    return Promise.reject(error);
  }
);

// Middleware để xử lý lỗi trong response
axiosInstance.interceptors.response.use(
  (response) => response, // Nếu response thành công, trả về dữ liệu
  (error) => {
    if (error.response) {
      // Lỗi từ server (status code khác 2xx)
      console.error(
        "Lỗi trong response interceptor:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      // Không nhận được phản hồi từ server
      console.error("Không nhận được phản hồi từ server:", error.request);
    } else {
      // Lỗi khác
      console.error("Lỗi khác:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; // Đảm bảo export axiosInstance
