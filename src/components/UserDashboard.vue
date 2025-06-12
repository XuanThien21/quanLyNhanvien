<template>
  <div class="bang-dieu-khien">
    <!-- Menu Nằm Trên -->
    <header class="menu-ben-tren">
      <h2>📊 Quản Lý Hệ Thống</h2>
      <nav>
        <ul>
          <li @click="chonDanhMuc('duAn')">📁 Danh sách Dự án</li>
          <li @click="chonDanhMuc('chamCong')">⏳ Chấm công</li>
          <li @click="chonDanhMuc('doiMatKhau')">🔑 Đổi Mật Khẩu</li>
        </ul>
      </nav>
      <router-link to="/" class="nut-dang-xuat">🚪 Đăng xuất</router-link>
    </header>

    <!-- Nội Dung Chính -->
    <main class="noi-dung-chinh">
     

      <div v-if="mucHienTai === 'doiMatKhau'">
        <h2>🔐 Đổi Mật Khẩu</h2>
        <form @submit.prevent="doiMatKhau">
          <label for="matKhauCu">Mật khẩu cũ:</label>
          <input type="password" v-model="matKhauCu" required />

          <label for="matKhauMoi">Mật khẩu mới:</label>
          <input type="password" v-model="matKhauMoi" required />

          <label for="xacNhanMatKhauMoi">Xác nhận mật khẩu mới:</label>
          <input type="password" v-model="xacNhanMatKhauMoi" required />

          <button type="submit" class="nut-doi-mat-khau">🔄 Đổi Mật Khẩu</button>
        </form>
      </div>

      <!-- Quản lý Dự án -->
      <div v-if="mucHienTai === 'duAn'">
        <h2>📌 Danh sách Dự án</h2>
        <table class="bang">
          <thead>
            <tr>
              <th>📜 Tên Dự án</th>
              <th>📅 Bắt đầu</th>
              <th>🏁 Kết thúc</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="duAn in duAns" :key="duAn.ProjectID">
              <td>{{ duAn.ProjectName }}</td>
              <td>{{ formatDate(duAn.StartDate) }}</td>
              <td>{{ duAn.EndDate ? formatDate(duAn.EndDate) : 'Chưa hoàn thành' }}</td>
              <td>
                <button class="nut-dang-ky" @click="dangKyDuAn(duAn.ProjectID)">➕ Đăng ký</button>
                <button class="nut-xoa" @click="huyDangKyDuAn(duAn.ProjectID)">❌ Hủy</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quản lý chấm công -->
      <div v-else-if="mucHienTai === 'chamCong'">
        <h2>🕒 Chấm công</h2>
        <div class="nut-cham-cong-container">
          <button class="nut-cham-cong" @click="checkIn">✅ Check-in</button>
          <button class="nut-cham-cong" @click="checkOut">❌ Check-out</button>
        </div>
        
        <!-- Bảng chấm công -->
        <table class="bang">
          <thead>
            <tr>
              <th>👤 Nhân viên</th>
              <th>✅ Trạng thái</th>
              <th>📆 Ngày</th>
              <th>🕒 Check-in</th>
              <th>🕒 Check-out</th>
              <th>📌 Dự án đã đăng ký</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="chamCong in chamCongHienTai" :key="chamCong.AttendanceID">
              <td>{{ chamCong.FirstName }} {{ chamCong.LastName }}</td>
              <td>{{ chamCong.Status }}</td>
              <td>{{ formatDate(chamCong.Date) }}</td>
              <td>{{ chamCong.CheckIn || 'Chưa Check-in' }}</td>
              <td>{{ chamCong.CheckOut || 'Chưa Check-out' }}</td>
             
              <td>
                <ul v-if="chamCong.projects">
                  <li v-for="duAn in chamCong.projects.split(', ')" :key="duAn">{{ duAn }}</li>
                </ul>
                <p v-else>Chưa đăng ký</p>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Phân trang -->
        <div class="phan-trang">
          <button @click="trangHienTai--" :disabled="trangHienTai === 1">⬅️ Trang trước</button>
          <span>Trang {{ trangHienTai }} / {{ tongSoTrang }}</span>
          <button @click="trangHienTai++" :disabled="trangHienTai >= tongSoTrang">➡️ Trang sau</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axiosInstance from "@/utils/axiosInstance";

export default {
  name: "BangDieuKhien",
  data() {
    return {
      mucHienTai: "duAn",
      duAns: [],
      chamCongs: [],
      trangHienTai: 1,
      soLuongMoiTrang: 4,
      matKhauCu: "",
      matKhauMoi: "",
      xacNhanMatKhauMoi: "",
    };
  },
  computed: {
    chamCongHienTai() {
      const batDau = (this.trangHienTai - 1) * this.soLuongMoiTrang;
      return this.chamCongs.slice(batDau, batDau + this.soLuongMoiTrang);
    },
    tongSoTrang() {
      return Math.ceil(this.chamCongs.length / this.soLuongMoiTrang);
    },
  },
  methods: {
    // Chuyển danh mục
    chonDanhMuc(muc) {
      this.mucHienTai = muc;
      this.fetchData();
    },

    async fetchData() {
      try {
        if (this.mucHienTai === "duAn") {
          const response = await axiosInstance.get("/projects");
          this.duAns = response.data;
        } else if (this.mucHienTai === "chamCong") {
          const response = await axiosInstance.get("/attendances");
          this.chamCongs = response.data;
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    },


    async doiMatKhau() {
  if (this.matKhauMoi !== this.xacNhanMatKhauMoi) {
    alert("Mật khẩu mới không khớp!");
    return;
  }
  try {
    await axiosInstance.post("/change-password", {
      oldPassword: this.matKhauCu,
      newPassword: this.matKhauMoi,
    });
    alert("Đổi mật khẩu thành công!");
  } catch (error) {
    alert("Lỗi: " + (error.response?.data?.message || "Không thể đổi mật khẩu"));
  }
},


    async dangKyDuAn(projectId) {
  try {
    if (!projectId) {
      alert("Dự án không hợp lệ!");
      return;
    }
    
    const response = await axiosInstance.post("/register-project", { projectId });
    
    if (response.status === 200) {
      alert("Đăng ký dự án thành công!");
      this.fetchData();
    } else {
      alert("Có lỗi xảy ra khi đăng ký dự án.");
    }
  } catch (error) {
    console.error("Lỗi khi đăng ký dự án:", error);
    alert(`Lỗi: ${error.response?.data?.message || "Lỗi không xác định"}`);
  }
},


async huyDangKyDuAn(projectId) {
  try {
    if (!projectId) {
      alert("Dự án không hợp lệ!");
      return;
    }

    const response = await axiosInstance.delete(`/unregister-project/${projectId}`);

    if (response.status === 200) {
      alert("Hủy đăng ký dự án thành công!");
      this.fetchData();
    } else {
      alert("Có lỗi xảy ra khi hủy đăng ký.");
    }
  } catch (error) {
    console.error("Lỗi khi hủy đăng ký dự án:", error);
    alert(`Lỗi: ${error.response?.data?.message || "Lỗi không xác định"}`);
  }
},


async checkIn() {
  try {
    const response = await axiosInstance.post("/attendance/checkin");
    if (response.status === 200) {
      alert(`Check-in thành công lúc: ${response.data.checkInTime}`);
      this.fetchData();
    }
  } catch (error) {
    console.error("Lỗi khi Check-in:", error);
    alert(error.response?.data?.message || "Lỗi không xác định khi check-in!");
  }
},


async checkOut() {
  try {
    const response = await axiosInstance.post("/attendance/checkout");
    if (response.status === 200) {
      alert(`Check-out thành công lúc: ${response.data.checkOutTime}`);
      this.fetchData();
    }
  } catch (error) {
    console.error("Lỗi khi Check-out:", error);
    alert(error.response?.data?.message || "Lỗi không xác định khi check-out!");
  }
},



    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("vi-VN");
    },
  },
  created() {
    this.fetchData();
  },
};
</script>



<style scoped>
/* ======= BỐ CỤC TỔNG THỂ ======= */
body {
  font-family: "Poppins", sans-serif;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}

/* ======= MENU ======= */
.menu-ben-tren {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #1976d2, #0d47a1);
  color: white;
  padding: 15px 30px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  border-radius: 12px 12px 0 0;
}

.menu-ben-tren h2 {
  font-size: 24px;
  font-weight: bold;
}

.menu-ben-tren nav ul {
  display: flex;
  list-style: none;
  gap: 25px;
}

.menu-ben-tren ul li {
  cursor: pointer;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  transition: 0.3s;
  font-weight: bold;
}

.menu-ben-tren ul li:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.nut-dang-xuat {
  padding: 12px 18px;
  background-color: #e74c3c;
  color: white;
  border-radius: 10px;
  transition: 0.3s;
  font-weight: bold;
  text-decoration: none;
}

.nut-dang-xuat:hover {
  background-color: #c0392b;
  transform: scale(1.1);
}

/* ======= NỘI DUNG ======= */
.noi-dung-chinh {
  padding: 30px;
  background: white;
  box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  margin: 20px;
}

h2 {
  color: #0d47a1;
  border-bottom: 3px solid #1e88e5;
  padding-bottom: 8px;
}

/* ======= BẢNG ======= */
.bang {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  text-align: center;
}

.bang th, .bang td {
  border: 1px solid #ddd;
  padding: 15px;
  font-size: 16px;
}

.bang th {
  background: #1e88e5;
  color: white;
  font-weight: bold;
}

.bang tr:nth-child(even) {
  background: #e3f2fd;
}

.bang tr:hover {
  background: #bbdefb;
}

/* ======= NÚT ======= */
button, .nut-dang-ky, .nut-xoa, .nut-cham-cong {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
}

.nut-dang-ky {
  background: #2ecc71;
  color: white;
}
.nut-dang-ky:hover {
  background: #27ae60;
}

.nut-xoa {
  background: #e74c3c;
  color: white;
}
.nut-xoa:hover {
  background: #c0392b;
}

.nut-cham-cong {
  background: #1e88e5;
  color: white;
}
.nut-cham-cong:hover {
  background: #0d47a1;
}

/* ======= FORM ======= */
input, select {
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

input:focus, select:focus {
  border-color: #1e88e5;
  box-shadow: 0 0 6px rgba(30, 136, 229, 0.5);
}

/* ======= PHÂN TRANG ======= */
.phan-trang {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.phan-trang button {
  padding: 10px 15px;
  background: #1e88e5;
  color: white;
  border-radius: 8px;
  font-weight: bold;
  transition: 0.3s;
}

.phan-trang button:disabled {
  background: #b0bec5;
}

.phan-trang button:hover:not(:disabled) {
  background: #1565c0;
}

.phan-trang span {
  font-size: 16px;
  font-weight: bold;
}


</style>
