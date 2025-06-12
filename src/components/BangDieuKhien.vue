<template>
    <div class="bang-dieu-khien">
      <!-- Menu Bên Trái -->
      <aside class="menu-ben-trai">
        <h2>Danh Mục</h2>
        <ul>
          <li @click="chonDanhMuc('nhanVien')">Quản lý Nhân viên</li>
          <li @click="chonDanhMuc('phongBan')">Quản lý Phòng ban</li>
          <li @click="chonDanhMuc('duAn')">Quản lý Dự án</li>
          <li @click="chonDanhMuc('chamCong')">Chấm công</li>
          <li @click="chonDanhMuc('viTri')">Quản lý Vị trí</li>
        </ul>
        <router-link to="/" class="nut-dang-xuat">Đăng xuất</router-link>
      </aside>
  
      <!-- Nội Dung Chính -->
      <main class="noi-dung-chinh">
        <h1>Quản lý {{ mucHienTai }}</h1>
        <div v-if="mucHienTai === 'nhanVien'">
          <h2>Danh sách Nhân viên</h2>
          <button @click="hienModalThem" class="btn-them">Thêm Nhân viên</button>
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ và Tên</th>
                <th>Email</th>
                <th>Phòng ban</th>
                <th>Vị trí</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="nhanVien in nhanViens" :key="nhanVien.EmployeeID">
                <td>{{ nhanVien.EmployeeID }}</td>
                <td>{{ nhanVien.FirstName }} {{ nhanVien.LastName }}</td>
                <td>{{ nhanVien.Email }}</td>
                <td>{{ nhanVien.DepartmentName }}</td>
                <td>{{ nhanVien.PositionName }}</td>
                <td>
                  <button @click="hienModalSua(nhanVien)">Sửa</button>
                  <button @click="xoaNhanVien(nhanVien.EmployeeID)">Xóa</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else-if="mucHienTai === 'phongBan'">
        <h2>Danh sách Phòng ban</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Phòng Ban</th>
              <th>Vị trí</th>
              <th>Quản lý</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="phongBan in phongBans" :key="phongBan.DepartmentID">
              <td>{{ phongBan.DepartmentID }}</td>
              <td>{{ phongBan.DepartmentName }}</td>
              <td>{{ phongBan.Location }}</td>
              <td>{{ phongBan.ManagerName }}</td>
            </tr>
          </tbody>
        </table>
      </div>

       <!-- Quản lý Dự án -->
       <div v-else-if="mucHienTai === 'duAn'">
        <h2>Danh sách Dự án</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Dự Án</th>
              <th>Ngày Bắt Đầu</th>
              <th>Ngày Kết Thúc</th>
              <th>Quản lý</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="duAn in duAns" :key="duAn.ProjectID">
              <td>{{ duAn.ProjectID }}</td>
              <td>{{ duAn.ProjectName }}</td>
              <td>{{ formatDate(duAn.StartDate) }}</td>
              <td>{{ formatDate(duAn.EndDate) }}</td>

              <td>{{ duAn.ManagerName }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Chấm công -->
      <div v-else-if="mucHienTai === 'chamCong'">
        <h2>Danh sách Chấm công</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nhân viên</th>
              <th>Ngày</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="chamCong in chamCongs" :key="chamCong.AttendanceID">
              <td>{{ chamCong.AttendanceID }}</td>
              <td>{{ chamCong.EmployeeName }}</td>
              <td>{{ formatDate(chamCong.Date) }}</td>
              <td>{{ chamCong.CheckIn }}</td>
              <td>{{ chamCong.CheckOut }}</td>
              <td>{{ chamCong.Status }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quản lý Vị trí -->
      <div v-else-if="mucHienTai === 'viTri'">
        <h2>Danh sách Vị trí</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Vị trí</th>
              <th>Lương cơ bản</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="viTri in viTris" :key="viTri.PositionID">
              <td>{{ viTri.PositionID }}</td>
              <td>{{ viTri.PositionName }}</td>
              <td>{{ viTri.BaseSalary }}</td>
            </tr>
          </tbody>
        </table>
      </div>
        <!-- Modal Thêm/Sửa Nhân Viên -->
        <div v-if="modalVisible" class="modal">
          <div class="modal-content">
            <h3>{{ isEditing ? 'Sửa Nhân Viên' : 'Thêm Nhân Viên' }}</h3>
            <form @submit.prevent="isEditing ? capNhatNhanVien() : themNhanVien()">
              <label for="firstName">Họ:</label>
              <input type="text" id="firstName" v-model="currentNhanVien.FirstName" required />
  
              <label for="lastName">Tên:</label>
              <input type="text" id="lastName" v-model="currentNhanVien.LastName" required />
  
              <label for="email">Email:</label>
              <input type="email" id="email" v-model="currentNhanVien.Email" required />
  
              <label for="department">Phòng ban:</label>
              <input type="text" id="department" v-model="currentNhanVien.DepartmentName" required />
  
              <label for="position">Vị trí:</label>
              <input type="text" id="position" v-model="currentNhanVien.PositionName" required />
  
              <button type="submit">{{ isEditing ? 'Cập nhật' : 'Thêm mới' }}</button>
              <button type="button" @click="dongModal">Hủy</button>
            </form>
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
        mucHienTai: "nhanVien", // Danh mục mặc định
        nhanViens: [],
        modalVisible: false,
        isEditing: false,
        currentNhanVien: {
          EmployeeID: null,
          FirstName: "",
          LastName: "",
          Email: "",
          DepartmentName: "",
          PositionName: "",
        },
      };
    },
    methods: {

        formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      return date.toLocaleDateString("vi-VN", options);
    },
      // Chọn danh mục
      chonDanhMuc(muc) {
        this.mucHienTai = muc;
      },
      
  
      // Lấy dữ liệu từ backend
      async fetchData() {
         try {
        const [nhanVienRes, phongBanRes, duAnRes, chamCongRes, viTriRes] = await Promise.all([
          axiosInstance.get("/employees"),
          axiosInstance.get("/departments"),
          axiosInstance.get("/projects"),
          axiosInstance.get("/attendances"),
          axiosInstance.get("/positions"),
        ]);
        this.nhanViens = nhanVienRes.data;
        this.phongBans = phongBanRes.data;
        this.duAns = duAnRes.data;
        this.chamCongs = chamCongRes.data;
        this.viTris = viTriRes.data;
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    },

  
      // Hiển thị modal thêm nhân viên
      hienModalThem() {
        this.isEditing = false;
        this.currentNhanVien = {
          EmployeeID: null,
          FirstName: "",
          LastName: "",
          Email: "",
          DepartmentName: "",
          PositionName: "",
        };
        this.modalVisible = true;
      },
  
      // Hiển thị modal sửa nhân viên
      hienModalSua(nhanVien) {
        this.isEditing = true;
        this.currentNhanVien = { ...nhanVien };
        this.modalVisible = true;
      },
  
      // Thêm nhân viên
      async themNhanVien() {
        try {
          await axiosInstance.post("/employees", this.currentNhanVien);
          alert("Thêm nhân viên thành công!");
          this.dongModal();
          this.fetchData();
        } catch (error) {
          console.error("Lỗi khi thêm nhân viên:", error);
          alert("Lỗi khi thêm nhân viên.");
        }
      },
  
      // Cập nhật nhân viên
      async capNhatNhanVien() {
        try {
          await axiosInstance.put(`/employees/${this.currentNhanVien.EmployeeID}`, this.currentNhanVien);
          alert("Cập nhật nhân viên thành công!");
          this.dongModal();
          this.fetchData();
        } catch (error) {
          console.error("Lỗi khi cập nhật nhân viên:", error);
          alert("Lỗi khi cập nhật nhân viên.");
        }
      },
  
      // Xóa nhân viên
      async xoaNhanVien(employeeID) {
        if (confirm("Bạn có chắc muốn xóa nhân viên này không?")) {
          try {
            await axiosInstance.delete(`/employees/${employeeID}`);
            alert("Xóa nhân viên thành công!");
            this.fetchData();
          } catch (error) {
            console.error("Lỗi khi xóa nhân viên:", error);
            alert("Lỗi khi xóa nhân viên.");
          }
        }
      },
  
      // Đóng modal
      dongModal() {
        this.modalVisible = false;
      },
    },
    mounted() {
      this.fetchData();
    },
  };
  </script>
  
  <style scoped>
  /**** Cấu hình CSS ****/
  .bang-dieu-khien {
    display: flex;
    font-family: Arial, sans-serif;
    background-color: #f4f4f9;
    height: 100vh;
    overflow: hidden;
  }
  
  .menu-ben-trai {
    width: 250px;
    background-color: #2c3e50;
    color: white;
    padding: 20px;
    height: 100vh;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  }
  
  .menu-ben-trai h2 {
    font-size: 22px;
    margin-bottom: 20px;
    text-align: center;
    color: #ecf0f1;
  }
  
  .menu-ben-trai ul {
    list-style: none;
    padding: 0;
  }
  
  .menu-ben-trai ul li {
    padding: 15px 20px;
    cursor: pointer;
    background-color: #34495e;
    margin-bottom: 10px;
    border-radius: 5px;
    transition: background-color 0.3s ease;
    font-size: 16px;
  }
  
  .menu-ben-trai ul li:hover {
    background-color: #1abc9c;
    color: white;
  }
  
  .nut-dang-xuat {
    display: block;
    margin-top: 30px;
    padding: 12px;
    background-color: #e74c3c;
    text-align: center;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-size: 16px;
    transition: background-color 0.3s ease;
  }
  
  .nut-dang-xuat:hover {
    background-color: #c0392b;
  }
  
  .noi-dung-chinh {
    flex: 1;
    padding: 30px;
    background-color: white;
    overflow-y: auto;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .data-table th {
    background-color: #2c3e50;
    color: #fff;
    font-weight: bold;
    text-transform: uppercase;
    padding: 12px;
  }
  
  .data-table td {
    padding: 12px;
    border-bottom: 1px solid #ddd;
  }
  
  button {
    padding: 8px 12px;
    margin: 5px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    opacity: 0.9;
  }
  
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    width: 400px;
    max-width: 100%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .modal-content h3 {
    margin-bottom: 15px;
  }
  
  .modal-content form label {
    display: block;
    margin: 10px 0 5px;
  }
  
  .modal-content form input {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  
  .modal-content form button {
    padding: 10px;
    margin-top: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  </style>
  