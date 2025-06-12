<template>
  <div class="login-container">
    <h1>Đăng Nhập</h1>
    <form @submit.prevent="dangNhap">
      <div class="form-group">
        <label for="username">Tên đăng nhập</label>
        <input v-model="username" id="username" placeholder="Tên đăng nhập" required />
      </div>
      <div class="form-group">
        <label for="password">Mật khẩu</label>
        <input v-model="password" id="password" type="password" placeholder="Mật khẩu" required />
      </div>
      <button type="submit">Đăng nhập</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import axiosInstance from "@/utils/axiosInstance";

export default {
  name: "LoginPage",
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    async dangNhap() {
      try {
        const response = await axiosInstance.post("/login", {
          Username: this.username,
          Password: this.password,
        });
        const { token, role } = response.data;

        // Lưu token và role vào localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        // Chuyển hướng dựa trên role
        if (role === "Admin") {
          this.$router.push("/admin-dashboard");
        } else if (role === "User") {
          this.$router.push("/user-dashboard");
        } else {
          this.errorMessage = "Role không hợp lệ!";
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.message || "Lỗi khi đăng nhập";
      }
    },
  },
};
</script>

<style scoped>
/* Container tổng thể */
.login-container {
  max-width: 400px;
  margin: 80px auto;
  padding: 40px;
  background: linear-gradient(145deg, #e6e9f0, #eef2f3);
  border-radius: 15px;
  box-shadow: 8px 8px 15px rgba(0, 0, 0, 0.1), -8px -8px 15px rgba(255, 255, 255, 0.8);
  font-family: 'Roboto', sans-serif;
  text-align: center;
}

/* Tiêu đề */
.login-container h1 {
  font-size: 32px;
  margin-bottom: 25px;
  color: #2c3e50;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

/* Nhóm nhập liệu */
.form-group {
  margin-bottom: 20px;
  text-align: left;
}

/* Label */
label {
  font-size: 14px;
  font-weight: bold;
  color: #34495e;
  margin-bottom: 8px;
  display: block;
}

/* Input */
input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccd1d9;
  border-radius: 10px;
  background-color: #f7f9fc;
  transition: all 0.3s ease;
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.7);
}

/* Input hiệu ứng khi focus */
input:focus {
  border-color: #1abc9c;
  background-color: #ffffff;
  outline: none;
  box-shadow: 0 0 5px rgba(26, 188, 156, 0.5);
}

/* Nút Đăng nhập */
button {
  width: 100%;
  padding: 15px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background: linear-gradient(145deg, #1abc9c, #16a085);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.2), -4px -4px 10px rgba(255, 255, 255, 0.7);
}

/* Hiệu ứng hover nút */
button:hover {
  background: linear-gradient(145deg, #16a085, #1abc9c);
  transform: translateY(-3px);
}

/* Thông báo lỗi */
.error {
  color: #e74c3c;
  font-size: 14px;
  font-weight: bold;
  margin-top: 15px;
}

/* Hiệu ứng form */
.login-container {
  animation: fadeIn 0.5s ease-out;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
