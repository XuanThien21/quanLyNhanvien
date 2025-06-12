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
  import axios from "axios";
  
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
          const response = await axios.post("http://localhost:5000/login", {
            Username: this.username,
            Password: this.password,
          });
  
          const { token, role } = response.data;
  
          // Lưu token và role vào localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("role", role);
  
          alert("Đăng nhập thành công!");
  
          // Phân quyền và chuyển hướng dựa trên vai trò
          if (role === "Admin") {
            this.$router.push("/admin-dashboard");
          } else if (role === "User") {
            this.$router.push("/user-dashboard");
          } else {
            this.errorMessage = "Vai trò không hợp lệ!";
          }
        } catch (error) {
          this.errorMessage = error.response?.data?.message || "Lỗi khi đăng nhập";
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .login-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  .form-group {
    margin-bottom: 15px;
  }
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  button:hover {
    background-color: #0056b3;
  }
  .error {
    color: red;
    margin-top: 10px;
    font-weight: bold;
  }
  </style>
  