import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "@/components/LoginPage.vue";
import AdminDashboard from "@/components/AdminDashboard.vue";
import UserDashboard from "@/components/UserDashboard.vue"; // Đảm bảo đường dẫn đúng

const routes = [
  {
    path: "/",
    name: "Login",
    component: LoginPage,
  },
  {
    path: "/admin-dashboard",
    name: "BangDieuKhien",
    component: AdminDashboard,
    meta: { requiresAuth: true, role: "Admin" }, // Chỉ dành cho Admin
  },
  {
    path: "/user-dashboard",
    name: "UserDashboard",
    component: UserDashboard,
    meta: { requiresAuth: true, role: "User" }, // Chỉ dành cho User
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware kiểm tra xác thực và quyền truy cập
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Kiểm tra xem route có yêu cầu xác thực không
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
      return next({ path: "/" });
    }

    // Kiểm tra vai trò
    if (to.meta.role && to.meta.role !== role) {
      alert("Bạn không có quyền truy cập vào trang này!");
      return next(false); // Chặn truy cập
    }
  }

  next(); // Cho phép tiếp tục nếu hợp lệ
});

export default router;
