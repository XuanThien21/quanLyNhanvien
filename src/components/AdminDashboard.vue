<template>
    
  <div class="bang-dieu-khien">
      
    <!-- Menu Bên Trái -->
    <aside class="menu-ben-trai">
      
      <h2>⚙️ Danh Mục</h2>
      <ul>
        <li @click="chonDanhMuc('trangChu')">🏠 Trang Chủ</li>
        <li @click="chonDanhMuc('nhanVien')">📁 Quản lý Nhân viên</li>
        <li @click="chonDanhMuc('phongBan')">📁 Quản lý Phòng ban</li>
        <li @click="chonDanhMuc('duAn')">📁 Quản lý Dự án</li>
        <li @click="chonDanhMuc('chamCong')">⏳ Chấm công</li>
        <li @click="chonDanhMuc('viTri')">📁 Quản lý Vị trí</li>
        <li @click="chonDanhMuc('taiKhoan')">📁 Quản lý Tài khoản</li>
      </ul>
      <router-link to="/" class="nut-dang-xuat">🚪 Đăng xuất</router-link>
    </aside>

    <!-- Nội Dung Chính -->
    <main class="noi-dung-chinh">
      
      <div v-if="mucHienTai === 'trangChu'" class="trang-chu">
        <h1>Trang Quản trị (Admin)</h1>
  <p>Chào mừng bạn đến với trang quản trị.</p>
        <img :src="bannerImage" alt="Banner" class="banner">
  
</div>
      <!-- Quản lý Nhân viên -->
<div v-if="mucHienTai === 'nhanVien'">
  <h2>Danh sách Nhân viên</h2>
  <button @click="hienModalThem" class="btn-them">Thêm Nhân viên</button>
  <table class="data-table">
    <thead>
      <tr>
        <th>🔽 Mã Nhân Viên</th>
        <th>🤵 Họ và Tên</th>
        <th>📧 Email</th>
        <th>🕕 Ngày sinh</th>
        <th>👨‍👧 Giới tính</th>
        <th>☎️ Số điện thoại</th>
        <th>🚩 Địa chỉ</th>
        <th>🏛️ Phòng ban</th>
        <th>🚩 Vị trí</th>
        <th>👨‍⚖️ Người quản lý</th>
        <th>🛠️ Hành động</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="nhanVien in nhanViens" :key="nhanVien.EmployeeID">
        <td>{{ nhanVien.EmployeeID }}</td>
        <td>{{ nhanVien.FirstName }} {{ nhanVien.LastName }}</td>
        <td>{{ nhanVien.Email }}</td>
        <td>{{ formatDate(nhanVien.DateOfBirth) }}</td>
        <td>{{ nhanVien.Gender }}</td>
        <td>{{ nhanVien.PhoneNumber }}</td>
        <td>{{ nhanVien.Address }}</td>
        <td>{{ nhanVien.DepartmentName }}</td>
        <td>{{ nhanVien.PositionName }}</td>
        <td>{{ nhanVien.ManagerName || 'Không có' }}</td>
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
            <th>🔽 Mã Phòng Ban</th>
            <th>🤵 Tên Phòng Ban</th>
            <th>🚩 Vị trí</th>
            <th>🤵 Quản lý</th>
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

    <div v-if="modalVisible && mucHienTai === 'duAn'" class="modal">
  <div class="modal-content">
    <h3>{{ isEditing ? 'Sửa Dự án' : 'Thêm Dự án' }}</h3>
    <form @submit.prevent="isEditing ? capNhatDuAn() : themDuAn()">
      <label for="projectName">Tên Dự án:</label>
      <input type="text" id="projectName" v-model="currentDuAn.ProjectName" required />

      <label for="startDate"> Ngày Bắt đầu:</label>
      <input type="date" id="startDate" v-model="currentDuAn.StartDate" required />

      <label for="endDate"> Ngày Kết thúc:</label>
      <input type="date" id="endDate" v-model="currentDuAn.EndDate" />

      <label for="budget">Ngân sách:</label>
      <input type="number" id="budget" v-model="currentDuAn.Budget" step="0.01" />

      <label for="manager">Quản lý Dự án:</label>
      <select id="manager" v-model="currentDuAn.ManagerID">
        <option value="">Không có</option>
        <option v-for="nhanVien in nhanViens" :key="nhanVien.EmployeeID" :value="nhanVien.EmployeeID">
          {{ nhanVien.FirstName }} {{ nhanVien.LastName }}
        </option>
      </select>

      <button type="submit">{{ isEditing ? 'Cập nhật' : 'Thêm mới' }}</button>
      <button type="button" @click="dongModal">Hủy</button>
    </form>
  </div>
</div>
<!-- Quản lý dự án -->
<div v-else-if="mucHienTai === 'duAn'" class="noi-dung-chinh">
  <h2>Danh sách Dự án</h2>
  <button @click="hienModalThemDuAn" class="btn-them">Thêm Dự án</button>
  <table class="data-table">
    <thead>
      <tr>
        <th>🔽 Mã Dự Án</th>
        <th>📜 Tên Dự Án</th>
        <th>📅 Ngày Bắt Đầu</th>
        <th>🏁 Ngày Kết Thúc</th>
        <th>💰 Ngân Sách</th>
        <th>📁 Quản lý</th>
        <th>🛠️ Hành động</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="duAn in duAns" :key="duAn.ProjectID">
  <td>{{ duAn.ProjectID }}</td>
  <td>{{ duAn.ProjectName }}</td>
  <td>{{ formatDate(duAn.StartDate) }}</td>
  <td>{{ formatDate(duAn.EndDate) }}</td>
  <td>{{ duAn.Budget }}</td>
  <td>{{ duAn.ManagerName || 'Không có' }}</td>
  <td>
    <button @click="hienModalSuaDuAn(duAn)">Sửa</button>
    <button @click="xoaDuAn(duAn.ProjectID)">Xóa</button>
  </td>
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
            <th>🔽 Mã Nhân Viên</th>
            <th>🤵 Nhân viên</th>
            <th>📅 Ngày</th>
            <th>✅ Check In</th>
            <th>❌ Check Out</th>
            <th>⭕ Trạng thái</th>
          </tr>
        </thead>
        <tbody>
      <tr v-for="chamCong in chamCongs" :key="chamCong.AttendanceID">
        <td>{{ chamCong.EmployeeID }}</td>
        <td>{{ chamCong.FirstName }} {{ chamCong.LastName }}</td>
        <td>{{ formatDate(chamCong.Date) }}</td>
        <td>{{ chamCong.CheckIn || 'Chưa Check-in' }}</td>
        <td>{{ chamCong.CheckOut || 'Chưa Check-out' }}</td>
        <td>{{ hienThiTrangThai(chamCong) }}</td>
        
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
            <th>🔽 Mã Vị trí</th>
            <th>🚩 Tên Vị trí</th>
            <th>💰 Lương cơ bản</th>
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
    <!-- quản lý tài khoản -->
    <div v-else-if="mucHienTai === 'taiKhoan'">
      <h2>Quản lý Tài khoản</h2>
      <button @click="hienModalThemTaiKhoan" class="btn-them">Thêm Tài khoản</button>
      <table class="data-table">
        <thead>
          <tr>
            <th>🔽 Mã Tài Khoản</th>
            <th>🤵 Tên đăng nhập</th>
            <th>📢 Vai trò</th>
            <th>📢 Tên nhân viên</th>
            <th>🛠️Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="taiKhoan in taiKhoans" :key="taiKhoan.UserID">
            <td>{{ taiKhoan.UserID }}</td>
            <td>{{ taiKhoan.Username }}</td>
            <td>{{ taiKhoan.Role }}</td>
            <td>{{ taiKhoan.EmployeeName || 'Không liên kết' }}</td>
            <td>
              <button @click="hienModalSuaTaiKhoan(taiKhoan)">Sửa</button>
              <button @click="xoaTaiKhoan(taiKhoan.UserID)">Xóa</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </main>



     <!-- Modal Thêm/Sửa Nhân viên -->
     <div v-if="modalVisible && mucHienTai === 'nhanVien'" class="modal">
  <div class="modal-content">
    <h3>{{ isEditing ? 'Sửa Nhân viên' : 'Thêm Nhân viên' }}</h3>
    <form @submit.prevent="isEditing ? capNhatNhanVien() : themNhanVien()">
      <!-- Thông tin cơ bản -->
      <label for="firstName">Họ:</label>
      <input type="text" id="firstName" v-model="currentNhanVien.FirstName" required />

      <label for="lastName">Tên:</label>
      <input type="text" id="lastName" v-model="currentNhanVien.LastName" required />

      <label for="email">Email:</label>
      <input type="email" id="email" v-model="currentNhanVien.Email" required />

      <label for="dateOfBirth">Ngày sinh:</label>
      <input type="date" id="dateOfBirth" v-model="currentNhanVien.DateOfBirth" required />

      <label for="gender">Giới tính:</label>
      <select id="gender" v-model="currentNhanVien.Gender" required>
        <option value="Male">Nam</option>
        <option value="Female">Nữ</option>
        <option value="Other">Khác</option>
      </select>

      <!-- Số điện thoại và địa chỉ -->
      <label for="phoneNumber">Số điện thoại:</label>
      <input type="text" id="phoneNumber" v-model="currentNhanVien.PhoneNumber" />

      <label for="address">Địa chỉ:</label>
      <input type="text" id="address" v-model="currentNhanVien.Address" />

      <!-- Ngày tuyển dụng -->
      <label for="hireDate">Ngày tuyển dụng:</label>
      <input type="date" id="hireDate" v-model="currentNhanVien.HireDate" required />

      <!-- Phòng ban -->
      <label for="department">Phòng ban:</label>
      <select id="department" v-model="currentNhanVien.DepartmentID" required>
        <option v-for="phongBan in phongBans" :key="phongBan.DepartmentID" :value="phongBan.DepartmentID">
          {{ phongBan.DepartmentName }}
        </option>
      </select>

      <!-- Vị trí -->
      <label for="position">Vị trí:</label>
      <select id="position" v-model="currentNhanVien.PositionID" required>
        <option v-for="viTri in viTris" :key="viTri.PositionID" :value="viTri.PositionID">
          {{ viTri.PositionName }}
        </option>
      </select>

      <!-- Người quản lý -->
      <label for="manager">Người quản lý:</label>
      <select id="manager" v-model="currentNhanVien.ManagerID">
        <option value="">Không có</option>
        <option v-for="nhanVien in nhanViens" :key="nhanVien.EmployeeID" :value="nhanVien.EmployeeID">
          {{ nhanVien.FirstName }} {{ nhanVien.LastName }}
        </option>
      </select>

      <!-- Nút hành động -->
      <button type="submit">{{ isEditing ? 'Cập nhật' : 'Thêm mới' }}</button>
      <button type="button" @click="dongModal">Hủy</button>
    </form>
  </div>
</div>


<!-- Modal Thêm/Sửa Tài khoản -->
<div v-if="modalVisible && mucHienTai === 'taiKhoan'" class="modal">
  <div class="modal-content">
    <h3>{{ isEditing ? 'Sửa Tài khoản' : 'Thêm Tài khoản' }}</h3>
    <form @submit.prevent="isEditing ? capNhatTaiKhoan() : themTaiKhoan()">
      <label for="username">Tên đăng nhập:</label>
      <input type="text" id="username" v-model="currentTaiKhoan.Username" required />
      <label for="password">Mật khẩu:</label>
      <input type="password" id="password" v-model="currentTaiKhoan.Password" :required="!isEditing" />
      <label for="role">Vai trò:</label>
      <select id="role" v-model="currentTaiKhoan.Role" required>
        <option value="Admin">Admin</option>
        <option value="User">User</option>
      </select>
      <label for="employeeID">ID Nhân viên:</label>
      <input type="number" id="employeeID" v-model="currentTaiKhoan.EmployeeID" />
      <button type="submit">{{ isEditing ? 'Cập nhật' : 'Thêm mới' }}</button>
      <button type="button" @click="dongModal">Hủy</button>
    </form>
  </div>
</div>

  </div>
</template>

  
  
  <script>
import axiosInstance from "@/utils/axiosInstance";

export default {
  name: "AdminDashboard",
  data() {
    return {
      mucHienTai: "trangChu", // Danh mục mặc định
      bannerImage: require("@/assets/logo-vnpt-1.jpg"), 
      nhanViens: [],
      phongBans: [],
      duAns: [],
      chamCongs: [],
      viTris: [],
      taiKhoans: [],

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
      currentTaiKhoan: {
        UserID: null,
        Username: "",
        Password: "",
        Role: "",
        EmployeeID: null,
      },
      currentDuAn: {
      ProjectID: null,
      ProjectName: "",
      StartDate: "",
      EndDate: "",
      Budget: null,
      ManagerID: null,
    },
    };
  },
  
  methods: {
    // Chọn danh mục
    chonDanhMuc(muc) {
      this.mucHienTai = muc;
      if (muc === "taiKhoan") {
        this.fetchUsers();
      } else {
        this.fetchData();
      }
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
        this.chamCongs = chamCongRes.data || [];
        this.viTris = viTriRes.data;
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    },
    async checkIn(employeeId) {
    try {
      const response = await axiosInstance.post(`/attendance/checkin`, { employeeId });
      alert(`✅ Check-in thành công! Thời gian: ${response.data.checkInTime}`);
      this.fetchData();
    } catch (error) {
      console.error("❌ Lỗi khi check-in:", error);
      alert(error.response?.data?.message || "Lỗi khi check-in.");
    }
},


  
   // Gửi yêu cầu check-out
   async checkOut(employeeId) {
    try {
      const response = await axiosInstance.post(`/attendance/checkout`, { employeeId });
      alert(`✅ Check-out thành công! Thời gian: ${response.data.checkOutTime}`);
      this.fetchData(); // Load lại danh sách chấm công sau khi check-out
    } catch (error) {
      console.error("❌ Lỗi khi check-out:", error);
      alert(error.response?.data?.message || "Lỗi khi check-out.");
    }
},


    // Lấy danh sách tài khoản
    async fetchUsers() {
      try {
        const response = await axiosInstance.get("/users");
        this.taiKhoans = response.data;
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tài khoản:", error);
      }
    },

    // Hiển thị modal thêm tài khoản
    hienModalThemTaiKhoan() {
      this.isEditing = false;
      this.currentTaiKhoan = {
        UserID: null,
        Username: "",
        Password: "",
        Role: "",
        EmployeeID: null,
      };
      this.modalVisible = true;
    },
    

    // Hiển thị thêm dự án
    hienModalThemDuAn() {
    this.isEditing = false;
    this.currentDuAn = {
      ProjectID: null,
      ProjectName: "",
      StartDate: "",
      EndDate: "",
      Budget: null,
      ManagerID: null,
    };
    this.modalVisible = true;
  },
    // Hiển thị modal sửa tài khoản
    hienModalSuaTaiKhoan(taiKhoan) {
      this.isEditing = true;
  this.currentTaiKhoan = {
    UserID: taiKhoan.UserID,
    Username: taiKhoan.Username,
    Password: "", // Không hiển thị mật khẩu
    Role: taiKhoan.Role,
    EmployeeID: taiKhoan.EmployeeID,
  };
  this.modalVisible = true;
    },

    hienThiTrangThai(chamCong) {
    if (!chamCong.CheckIn) return "Chưa Check-in";
    if (!chamCong.CheckOut) return "Đang làm việc";
    return "Đã check-out";
  },
//hiển thị sửa dự án
    hienModalSuaDuAn(duAn) {
    this.isEditing = true;
    this.currentDuAn = {
      ...duAn,
      StartDate: duAn.StartDate.split("T")[0],
      EndDate: duAn.EndDate ? duAn.EndDate.split("T")[0] : "",
    };
    this.modalVisible = true;
  },

    
    
    
   


    // Đóng modal
    dongModal() {
      this.modalVisible = false;
    },

    // Định dạng ngày
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      return date.toLocaleDateString("vi-VN", options);
    },

    // Hiển thị modal thêm nhân viên
    // Hiển thị modal thêm
    hienModalThem() {
  if (this.mucHienTai === "nhanVien") {
    this.isEditing = false;
    this.currentNhanVien = {
      EmployeeID: null,
      FirstName: "",
      LastName: "",
      Email: "",
      DateOfBirth: "",
      Gender: "Male",
      PhoneNumber: "",
      Address: "",
      HireDate: "",
      DepartmentID: null,
      PositionID: null,
      ManagerID: null,
    };
    this.isEditing = false; // Thiết lập chế độ thêm mới
    this.modalVisible = true; // Hiển thị modal
  } else if (this.mucHienTai === "taiKhoan") {
    this.currentTaiKhoan = {
      UserID: null,
      Username: "",
      Password: "",
      Role: "",
      EmployeeID: null,
    };
    this.isEditing = false; // Thiết lập chế độ thêm mới
    this.modalVisible = true; // Hiển thị modal
  }
},


    // Hiển thị modal sửa nhân viên
    hienModalSua(item) {
  this.isEditing = true;

  if (this.mucHienTai === "nhanVien") {
    this.currentNhanVien = { ...item };

    // Định dạng ngày sinh và ngày tuyển dụng để hiển thị đúng trong input type="date"
    if (this.currentNhanVien.DateOfBirth) {
      this.currentNhanVien.DateOfBirth = this.currentNhanVien.DateOfBirth.split("T")[0];
    }
    if (this.currentNhanVien.HireDate) {
      this.currentNhanVien.HireDate = this.currentNhanVien.HireDate.split("T")[0];
    }
  }

  this.modalVisible = true;
},



    // Thêm nhân viên
    async themNhanVien() {
  try {
    // Đảm bảo định dạng ngày là 'YYYY-MM-DD'
    const formattedNhanVien = {
      ...this.currentNhanVien,
      DateOfBirth: this.formatDateForServer(this.currentNhanVien.DateOfBirth),
      HireDate: this.formatDateForServer(this.currentNhanVien.HireDate),
    };

    await axiosInstance.post("/employees", formattedNhanVien);
    alert("Thêm nhân viên thành công!");
    this.dongModal();
    this.fetchData();
  } catch (error) {
    console.error("Lỗi khi thêm nhân viên:", error);
    alert("Lỗi khi thêm nhân viên.");
  }
},

formatDateForServer(date) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (`0${d.getMonth() + 1}`).slice(-2);
  const day = (`0${d.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
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
    async themTaiKhoan() {
    try {
      const url = "/register";
      await axiosInstance.post(url, this.currentTaiKhoan);
      alert("Thêm tài khoản thành công!");
      this.fetchUsers(); // Tải lại danh sách tài khoản
      this.dongModal();
    } catch (error) {
      console.error("Lỗi khi thêm tài khoản:", error.response || error.message);
      alert(error.response?.data?.message || "Không thể thêm tài khoản. Vui lòng thử lại.");
    }
  },

// Cập nhật tài khoản
async capNhatTaiKhoan() {
  try {
    if (!this.currentTaiKhoan.UserID) {
      alert("Không thể xác định tài khoản cần cập nhật.");
      return;
    }

    // Clone payload để xử lý
    const payload = { ...this.currentTaiKhoan };

    // Xóa trường Password nếu không được chỉnh sửa
    if (!payload.Password || payload.Password.trim() === "") {
      delete payload.Password;
    }

    // Log dữ liệu để kiểm tra trước khi gửi request
    console.log("Dữ liệu cập nhật tài khoản:", payload);

    // Bắt đầu cập nhật
    const url = `/users/${this.currentTaiKhoan.UserID}`;
    await axiosInstance.put(url, payload);

    // Thông báo và cập nhật lại danh sách
    alert("Cập nhật tài khoản thành công!");
    await this.fetchUsers();
    this.dongModal();
  } catch (error) {
    // Xử lý lỗi
    console.error("Lỗi khi cập nhật tài khoản:", error.response || error.message);

    const errorMessage =
      error.response?.data?.message || "Không thể cập nhật tài khoản. Vui lòng thử lại.";
    alert(errorMessage);
  }
},


    // Xóa tài khoản
    async xoaTaiKhoan(id) {
  if (confirm("Bạn có chắc chắn muốn xóa tài khoản này không?")) {
    try {
      const url = `/users/${id}`; // Endpoint để xóa tài khoản
      await axiosInstance.delete(url); // Gửi yêu cầu xóa
      alert("Xóa tài khoản thành công!");
      this.fetchData("taiKhoan"); // Tải lại danh sách tài khoản
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản:", error);
      alert("Không thể xóa tài khoản. Vui lòng thử lại.");
    }
  }
    },
    async themDuAn() {
    try {
      await axiosInstance.post("/projects", this.currentDuAn);
      alert("Thêm Dự án thành công!");
      this.dongModal();
      this.fetchData();
    } catch (error) {
      console.error("Lỗi khi thêm dự án:", error);
      alert("Lỗi khi thêm dự án.");
    }
  },
  async capNhatDuAn() {
    try {
      await axiosInstance.put(`/projects/${this.currentDuAn.ProjectID}`, this.currentDuAn);
      alert("Cập nhật Dự án thành công!");
      this.dongModal();
      this.fetchData();
    } catch (error) {
      console.error("Lỗi khi cập nhật dự án:", error);
      alert("Lỗi khi cập nhật dự án.");
    }
  },
  async xoaDuAn(projectID) {
    if (confirm("Bạn có chắc chắn muốn xóa dự án này không?")) {
      try {
        await axiosInstance.delete(`/projects/${projectID}`);
        alert("Xóa dự án thành công!");
        this.fetchData();
      } catch (error) {
        console.error("Lỗi khi xóa dự án:", error);
        alert("Lỗi khi xóa dự án.");
      }
    }
  },

  },

  
  

    
  mounted() {
    this.fetchData();
  },
};
</script>

  
  <style scoped>
  /**** Bố cục chung ****/
  .bang-dieu-khien {
    display: flex;
    font-family: 'Roboto', Arial, sans-serif;
    background-color: #f8f9fa;
    height: 100vh;
    overflow: hidden;
    color: #333;
  }
  
  /* Menu Bên Trái */
  .menu-ben-trai {
    width: 250px;
    background-color: #343a40;
    color: white;
    padding: 20px;
    height: 100vh;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  }
  
  .menu-ben-trai h2 {
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
    color: #f8f9fa;
    font-weight: bold;
  }
  
  .menu-ben-trai ul {
    list-style: none;
    padding: 0;
  }
  
  .menu-ben-trai ul li {
    padding: 15px;
    cursor: pointer;
    background-color: #495057;
    margin-bottom: 10px;
    border-radius: 8px;
    transition: background-color 0.3s ease, transform 0.2s;
    font-size: 18px;
    text-align: center;
  }
  
  .menu-ben-trai ul li:hover {
    background-color: #1abc9c;
    color: white;
    transform: translateX(5px);
  }
  
  .nut-dang-xuat {
    display: block;
    margin-top: 30px;
    padding: 12px;
    background-color: #e74c3c;
    text-align: center;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-size: 16px;
    transition: background-color 0.3s ease, transform 0.2s;
  }
  
  .nut-dang-xuat:hover {
    background-color: #c0392b;
    transform: scale(1.05);
  }
  
  /* Nội dung Chính */
  .noi-dung-chinh {
    flex: 1;
    padding: 30px;
    background-color: white;
    overflow-y: auto;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  }
  
  .noi-dung-chinh h1 {
    font-size: 32px;
    margin-bottom: 20px;
    color: #2c3e50;
    border-bottom: 3px solid #1abc9c;
    padding-bottom: 10px;
    font-weight: bold;
  }
  
  .noi-dung-chinh h2 {
    font-size: 24px;
    margin-bottom: 15px;
    color: #495057;
    font-weight: bold;
  }
  
  .noi-dung-chinh p {
    font-size: 18px;
    color: #6c757d;
  }
  
  /* Bảng Dữ Liệu */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    background-color: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  .data-table th {
    background-color: #1abc9c;
    color: #fff;
    font-weight: bold;
    text-transform: uppercase;
    padding: 15px;
  }
  
  .data-table td {
    padding: 12px;
    border-bottom: 1px solid #ddd;
    color: #333;
  }
  
  .data-table tr:nth-child(even) {
    background-color: #f2f2f2;
  }
  
  .data-table tr:hover {
    background-color: #e9f5f3;
  }
  
  button {
    padding: 10px 15px;
    margin: 5px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.3s, transform 0.2s;
  }
  
  button:hover {
    transform: scale(1.05);
  }
  
  button:nth-child(1) {
    background-color: #007bff;
    color: white;
  }
  
  button:nth-child(2) {
    background-color: #ffc107;
    color: white;
  }
  
  button:nth-child(3) {
    background-color: #dc3545;
    color: white;
  }
  
  /* Modal */
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
    padding: 30px;
    border-radius: 12px;
    width: 500px;
    max-width: 90%;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    animation: fadeIn 0.3s ease-out;
  }

  .modal-content h3 {
    margin-bottom: 20px;
    color: #2c3e50;
    font-size: 28px;
    text-align: center;
    font-weight: bold;
    border-bottom: 2px solid #1abc9c;
    padding-bottom: 10px;
  }

  .modal-content form label {
    display: block;
    margin: 10px 0 5px;
    font-weight: bold;
    color: #495057;
    font-size: 14px;
  }

  .modal-content form input,
  .modal-content form select,
  .modal-content form textarea {
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    font-family: 'Roboto', Arial, sans-serif;
    color: #495057;
    transition: border-color 0.3s;
  }

  .modal-content form input:focus,
  .modal-content form select:focus,
  .modal-content form textarea:focus {
    border-color: #1abc9c;
    outline: none;
    box-shadow: 0 0 5px rgba(26, 188, 156, 0.5);
  }

  .modal-content form button {
    width: 100%;
    padding: 12px;
    margin-top: 10px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    background-color: #1abc9c;
    color: white;
    transition: background-color 0.3s ease, transform 0.2s;
  }

  .modal-content form button:hover {
    background-color: #16a085;
    transform: scale(1.05);
  }

  .modal-content form button.cancel {
    background-color: #e74c3c;
    margin-top: 15px;
  }

  .modal-content form button.cancel:hover {
    background-color: #c0392b;
  }

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

  /* Custom Scrollbar */
  .modal-content {
    overflow-y: auto;
    max-height: 80vh;
  }

  .modal-content::-webkit-scrollbar {
    width: 8px;
  }

  .modal-content::-webkit-scrollbar-thumb {
    background: #1abc9c;
    border-radius: 8px;
  }

  .modal-content::-webkit-scrollbar-thumb:hover {
    background: #16a085;
  }
  .data-table td:nth-child(6) {
  font-weight: bold;
}

.data-table td:nth-child(6):contains("Chưa Check-in") {
  color: red;
}

.data-table td:nth-child(6):contains("Đang làm việc") {
  color: orange;
}

.data-table td:nth-child(6):contains("Đã check-out") {
  color: green;
}
.trang-chu {
  text-align: center;
}
.banner {
  width: 100%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
}

  </style>
  