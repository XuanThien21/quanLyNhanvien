// Import các thư viện
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;

// Secret key cho JWT
const JWT_SECRET = "mysecretkey";

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Kết nối MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "vpntqlnv",
});

db.connect((err) => {
    if (err) {
        console.error("Kết nối cơ sở dữ liệu thất bại:", err.message);
        return;
    }
    console.log("Kết nối cơ sở dữ liệu thành công!");
});

// Middleware xác thực token JWT
function authenticateToken(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Bạn cần đăng nhập!" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token không hợp lệ!" });
        req.user = user;
        next();
    });
}

// Middleware phân quyền Admin
function authorizeAdmin(req, res, next) {
    if (req.user.Role !== "Admin") {
        return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
    }
    next();
}

// API: Đăng ký người dùng
app.post("/register", (req, res) => {
    const { Username, Password, Role, EmployeeID } = req.body;

    if (!Username || !Password || !Role) {
        return res.status(400).json({ message: "Thiếu thông tin cần thiết!" });
    }

    const hashedPassword = bcrypt.hashSync(Password, 10);

    const sql = "INSERT INTO Users (Username, Password, Role, EmployeeID) VALUES (?, ?, ?, ?)";
    db.query(sql, [Username, hashedPassword, Role, EmployeeID || null], (err) => {
        if (err) {
            console.error("Lỗi khi thêm người dùng:", err.message);
            return res.status(500).json({ message: "Lỗi khi thêm người dùng" });
        }
        res.json({ message: "Đăng ký thành công!" });
    });
});


// API: Check-in
app.post("/attendance/checkin", authenticateToken, (req, res) => {
    const employeeId = req.user.UserID;
    const today = new Date().toISOString().split("T")[0]; // Ngày hiện tại
    const checkInTime = new Date().toLocaleTimeString("vi-VN", { hour12: false });

    // Kiểm tra xem đã check-in chưa
    const checkSQL = "SELECT * FROM attendance WHERE EmployeeID = ? AND Date = ?";
    db.query(checkSQL, [employeeId, today], (err, results) => {
        if (err) {
            console.error("Lỗi kiểm tra check-in:", err.message);
            return res.status(500).json({ message: "Lỗi kiểm tra check-in!" });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: "Bạn đã check-in hôm nay!" });
        }

        // Chèn dữ liệu check-in vào bảng Attendance
        const insertSQL = `
            INSERT INTO attendance (EmployeeID, Date, CheckIn, Status) 
            VALUES (?, ?, ?, 'Đang Làm')
        `;
        db.query(insertSQL, [employeeId, today, checkInTime], (err) => {
            if (err) {
                console.error("Lỗi khi check-in:", err.message);
                return res.status(500).json({ message: "Lỗi khi check-in!" });
            }
            res.json({ message: "Check-in thành công!", checkInTime, status: "Đang Làm" });
        });
    });
});







// API: Check-out
app.post("/attendance/checkout", authenticateToken, (req, res) => {
    const employeeId = req.user.UserID;
    const today = new Date().toISOString().split("T")[0];
    const checkOutTime = new Date().toLocaleTimeString("vi-VN", { hour12: false });

    // Kiểm tra xem nhân viên đã check-in chưa
    const checkSQL = "SELECT * FROM attendance WHERE EmployeeID = ? AND Date = ?";
    db.query(checkSQL, [employeeId, today], (err, results) => {
        if (err) {
            console.error("Lỗi kiểm tra check-in:", err.message);
            return res.status(500).json({ message: "Lỗi kiểm tra check-in!" });
        }
        if (results.length === 0 || !results[0].CheckIn) {
            return res.status(400).json({ message: "Bạn chưa check-in hôm nay!" });
        }
        if (results[0].CheckOut) {
            return res.status(400).json({ message: "Bạn đã check-out rồi!" });
        }

        // Tính số giờ làm việc
        const checkInTime = results[0].CheckIn;
        const updateSQL = `
            UPDATE attendance 
            SET CheckOut = ?, 
                Status = 'Đã check-out',
                HoursWorked = TIMESTAMPDIFF(HOUR, CheckIn, ?) 
            WHERE EmployeeID = ? AND Date = ?
        `;
        db.query(updateSQL, [checkOutTime, checkOutTime, employeeId, today], (err) => {
            if (err) {
                console.error("Lỗi khi check-out:", err.message);
                return res.status(500).json({ message: "Lỗi khi check-out!" });
            }
            res.json({ message: "Check-out thành công!", checkOutTime });
        });
    });
});






// API: Đăng ký tham gia dự án
app.post("/register-project", authenticateToken, (req, res) => {
    const { projectId } = req.body;
    const employeeId = req.user.UserID; // Lấy EmployeeID từ user đăng nhập

    if (!projectId) {
        return res.status(400).json({ message: "Thiếu mã dự án!" });
    }

    // Kiểm tra xem dự án có tồn tại không
    const checkProjectSQL = "SELECT * FROM Projects WHERE ProjectID = ?";
    db.query(checkProjectSQL, [projectId], (err, results) => {
        if (err) {
            console.error("Lỗi khi kiểm tra dự án:", err.message);
            return res.status(500).json({ message: "Lỗi khi kiểm tra dự án!" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Dự án không tồn tại!" });
        }

        // Kiểm tra xem nhân viên đã đăng ký dự án chưa
        const checkRegistrationSQL = "SELECT * FROM EmployeeProjects WHERE EmployeeID = ? AND ProjectID = ?";
        db.query(checkRegistrationSQL, [employeeId, projectId], (err, results) => {
            if (err) {
                console.error("Lỗi khi kiểm tra đăng ký:", err.message);
                return res.status(500).json({ message: "Lỗi khi kiểm tra đăng ký!" });
            }
            if (results.length > 0) {
                return res.status(400).json({ message: "Bạn đã đăng ký dự án này rồi!" });
            }

            // Thêm bản ghi vào bảng EmployeeProjects
            const insertSQL = "INSERT INTO EmployeeProjects (EmployeeID, ProjectID) VALUES (?, ?)";
            db.query(insertSQL, [employeeId, projectId], (err) => {
                if (err) {
                    console.error("Lỗi khi đăng ký dự án:", err.message);
                    return res.status(500).json({ message: "Lỗi khi đăng ký dự án!" });
                }
                res.json({ message: "Đăng ký dự án thành công!" });
            });
        });
    });
});


// app.post("/register-project", authenticateToken, (req, res) => {
//     const employeeId = req.user.UserID;
//     const projectId = req.body.projectId;

//     const insertSQL = "INSERT INTO employee_project (employee_id, project_id) VALUES (?, ?)";
//     db.query(insertSQL, [employeeId, projectId], (err) => {
//         if (err) return res.status(500).json({ message: "Lỗi khi đăng ký dự án" });
//         res.json({ message: "Đăng ký dự án thành công!" });
//     });
// });

// API: Đổi mật khẩu
app.post("/change-password", authenticateToken, (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.UserID;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    // Lấy mật khẩu hiện tại từ database
    const getUserSQL = "SELECT Password FROM Users WHERE UserID = ?";
    db.query(getUserSQL, [userId], (err, results) => {
        if (err) {
            console.error("Lỗi khi lấy thông tin người dùng:", err.message);
            return res.status(500).json({ message: "Lỗi khi truy vấn cơ sở dữ liệu" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Người dùng không tồn tại!" });
        }

        const user = results[0];
        const isPasswordValid = bcrypt.compareSync(oldPassword, user.Password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Mật khẩu cũ không chính xác!" });
        }

        // Mã hóa mật khẩu mới
        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
        const updateSQL = "UPDATE Users SET Password = ? WHERE UserID = ?";

        db.query(updateSQL, [hashedNewPassword, userId], (err) => {
            if (err) {
                console.error("Lỗi khi cập nhật mật khẩu:", err.message);
                return res.status(500).json({ message: "Lỗi khi cập nhật mật khẩu!" });
            }
            res.json({ message: "Đổi mật khẩu thành công!" });
        });
    });
});




  // API: Chấm công (Nhân viên ghi lại thời gian chấm công)
  app.post("/attendance", authenticateToken, (req, res) => {
    const { date, status } = req.body;
    const employeeId = req.user.UserID; // Lấy ID nhân viên từ token

    if (!date || !status) {
        return res.status(400).json({ message: "Thiếu ngày hoặc trạng thái chấm công!" });
    }

    // Kiểm tra xem đã chấm công chưa
    const checkAttendanceSQL = "SELECT * FROM Attendance WHERE EmployeeID = ? AND Date = ?";
    db.query(checkAttendanceSQL, [employeeId, date], (err, results) => {
        if (err) {
            console.error("Lỗi khi kiểm tra chấm công:", err.message);
            return res.status(500).json({ message: "Lỗi khi kiểm tra chấm công!" });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "Bạn đã chấm công hôm nay rồi!" });
        }

        // Thêm bản ghi chấm công
        const insertSQL = "INSERT INTO Attendance (EmployeeID, Date, Status) VALUES (?, ?, ?)";
        db.query(insertSQL, [employeeId, date, status], (err) => {
            if (err) {
                console.error("Lỗi khi chấm công:", err.message);
                return res.status(500).json({ message: "Lỗi khi chấm công!" });
            }
            res.json({ message: "Chấm công thành công!" });
        });
    });
});

// API: Lấy danh sách chấm công của nhân viên
app.get("/my-attendance", authenticateToken, (req, res) => {
    const employeeId = req.user.UserID;

    const sql = `
        SELECT 
            a.AttendanceID, 
            a.Date, 
            a.CheckIn, 
            a.CheckOut, 
            a.Status, 
            TIMESTAMPDIFF(HOUR, a.CheckIn, a.CheckOut) AS HoursWorked,  -- Tính số giờ làm
            e.FirstName, 
            e.LastName,
            IFNULL(GROUP_CONCAT(DISTINCT p.ProjectName SEPARATOR ', '), '') AS projects
        FROM Attendance a
        LEFT JOIN Employees e ON a.EmployeeID = e.EmployeeID
        LEFT JOIN EmployeeProjects ep ON e.EmployeeID = ep.EmployeeID
        LEFT JOIN Projects p ON ep.ProjectID = p.ProjectID
        WHERE a.EmployeeID = ?
        GROUP BY a.AttendanceID, e.FirstName, e.LastName
    `;

    db.query(sql, [employeeId], (err, results) => {
        if (err) {
            console.error("Lỗi khi lấy dữ liệu chấm công:", err.message);
            return res.status(500).json({ message: "Lỗi khi lấy dữ liệu chấm công", error: err.message });
        }
        res.json(results);
    });
});









// API: Đăng nhập
app.post("/login", (req, res) => {
    const { Username, Password } = req.body;

    if (!Username || !Password) {
        return res.status(400).json({ message: "Vui lòng nhập đủ tên đăng nhập và mật khẩu!" });
    }

    const sql = "SELECT * FROM Users WHERE Username = ?";
    db.query(sql, [Username], (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn cơ sở dữ liệu:", err.message);
            return res.status(500).json({ message: "Lỗi khi truy vấn cơ sở dữ liệu" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Tài khoản không tồn tại" });
        }

        const user = results[0];
        const isPasswordValid = bcrypt.compareSync(Password, user.Password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Mật khẩu không đúng" });
        }

        const token = jwt.sign({ UserID: user.UserID, Role: user.Role }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Đăng nhập thành công", token, role: user.Role });
    });
});

// API: Lấy danh sách nhân viên (Chỉ Admin)
app.get("/employees", authenticateToken, (req, res) => {
    const sql = `
      SELECT 
        e.EmployeeID, 
        e.FirstName, 
        e.LastName, 
        e.DateOfBirth, 
        e.Gender, 
        e.PhoneNumber, 
        e.Email, 
        e.Address, 
        e.HireDate, 
        d.DepartmentName, 
        p.PositionName, 
        CONCAT(m.FirstName, ' ', m.LastName) AS ManagerName
      FROM Employees e
      LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
      LEFT JOIN Positions p ON e.PositionID = p.PositionID
      LEFT JOIN Employees m ON e.ManagerID = m.EmployeeID;
    `;
  
    db.query(sql, (err, results) => {
      if (err) {
        console.error("Lỗi khi lấy danh sách nhân viên:", err.message);
        return res.status(500).json({ message: "Lỗi khi truy vấn cơ sở dữ liệu" });
      }
      res.json(results);
    });
  });

// API: Thêm nhân viên (Chỉ Admin)
app.post("/employees", authenticateToken, authorizeAdmin, (req, res) => {
    const {
      FirstName,
      LastName,
      Email,
      DateOfBirth,
      Gender,
      PhoneNumber,
      Address,
      HireDate,
      DepartmentID,
      PositionID,
      ManagerID,
    } = req.body;
  
    const sql = `
      INSERT INTO Employees 
      (FirstName, LastName, Email, DateOfBirth, Gender, PhoneNumber, Address, HireDate, DepartmentID, PositionID, ManagerID) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [
        FirstName,
        LastName,
        Email,
        DateOfBirth,
        Gender,
        PhoneNumber,
        Address,
        HireDate,
        DepartmentID,
        PositionID,
        ManagerID,
      ],
      (err, result) => {
        if (err) {
          console.error("Lỗi khi thêm nhân viên:", err.message);
          return res.status(500).json({ message: "Lỗi khi thêm nhân viên" });
        }
        res.status(201).json({ message: "Thêm nhân viên thành công!", EmployeeID: result.insertId });
      }
    );
  });
  
// API: Đăng ký người dùng (Thêm tài khoản)
app.post("/register", (req, res) => {
    const { Username, Password, Role, EmployeeID } = req.body;
  
    if (!Username || !Password || !Role) {
      return res.status(400).json({ message: "Thiếu thông tin cần thiết!" });
    }
  
    const hashedPassword = bcrypt.hashSync(Password, 10);
  
    const sql = "INSERT INTO Users (Username, Password, Role, EmployeeID) VALUES (?, ?, ?, ?)";
    db.query(sql, [Username, hashedPassword, Role, EmployeeID || null], (err) => {
      if (err) {
        console.error("Lỗi khi thêm tài khoản:", err.message);
        return res.status(500).json({ message: "Lỗi khi thêm tài khoản" });
      }
      res.json({ message: "Đăng ký thành công!" });
    });
  });


//   thêm dự án
  app.post("/projects", authenticateToken, authorizeAdmin, (req, res) => {
    const { ProjectName, StartDate, EndDate, Budget, ManagerID } = req.body;

    if (!ProjectName || !StartDate) {
        return res.status(400).json({ message: "Tên dự án và ngày bắt đầu là bắt buộc!" });
    }

    const sql = `
        INSERT INTO Projects (ProjectName, StartDate, EndDate, Budget, ManagerID) 
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(
        sql,
        [ProjectName, StartDate, EndDate || null, Budget || null, ManagerID || null],
        (err, result) => {
            if (err) {
                console.error("Lỗi khi thêm dự án:", err.message);
                return res.status(500).json({ message: "Lỗi khi thêm dự án" });
            }
            res.status(201).json({ message: "Thêm dự án thành công!", ProjectID: result.insertId });
        }
    );
});



  

// API: Sửa nhân viên (Chỉ Admin)
app.put("/employees/:id", authenticateToken, authorizeAdmin, (req, res) => {
    const { id } = req.params;
    const {
      FirstName,
      LastName,
      Email,
      DateOfBirth,
      Gender,
      PhoneNumber,
      Address,
      HireDate,
      DepartmentID,
      PositionID,
      ManagerID,
    } = req.body;
  
    const sql = `
      UPDATE Employees 
      SET 
        FirstName = ?, 
        LastName = ?, 
        Email = ?, 
        DateOfBirth = ?, 
        Gender = ?, 
        PhoneNumber = ?, 
        Address = ?, 
        HireDate = ?, 
        DepartmentID = ?, 
        PositionID = ?, 
        ManagerID = ?
      WHERE EmployeeID = ?
    `;
    db.query(
      sql,
      [
        FirstName,
        LastName,
        Email,
        DateOfBirth,
        Gender,
        PhoneNumber,
        Address,
        HireDate,
        DepartmentID,
        PositionID,
        ManagerID,
        id,
      ],
      (err) => {
        if (err) {
          console.error("Lỗi khi sửa nhân viên:", err.message);
          return res.status(500).json({ message: "Lỗi khi sửa nhân viên" });
        }
        res.json({ message: "Sửa nhân viên thành công!" });
      }
    );
  });
  
// API: Sửa tài khoản
app.put("/users/:id", authenticateToken, authorizeAdmin, (req, res) => {
    const { id } = req.params;
    const { Username, Password, Role, EmployeeID } = req.body;

    const hashedPassword = Password ? bcrypt.hashSync(Password, 10) : null;

    const sql = `
        UPDATE Users
        SET 
            Username = ?, 
            Password = COALESCE(?, Password), 
            Role = ?, 
            EmployeeID = ?
        WHERE UserID = ?
    `;
    db.query(sql, [Username, hashedPassword, Role, EmployeeID, id], (err) => {
        if (err) {
            console.error("Lỗi khi sửa tài khoản:", err.message);
            return res.status(500).json({ message: "Lỗi khi sửa tài khoản" });
        }
        res.json({ message: "Sửa tài khoản thành công!" });
    });
});

//Sửa Dự án
app.put("/projects/:id", authenticateToken, authorizeAdmin, (req, res) => {
    const { id } = req.params;
    const { ProjectName, StartDate, EndDate, Budget, ManagerID } = req.body;

    if (!ProjectName || !StartDate) {
        return res.status(400).json({ message: "Tên dự án và ngày bắt đầu là bắt buộc!" });
    }

    const sql = `
        UPDATE Projects 
        SET 
            ProjectName = ?, 
            StartDate = ?, 
            EndDate = ?, 
            Budget = ?, 
            ManagerID = ?
        WHERE ProjectID = ?
    `;
    db.query(
        sql,
        [ProjectName, StartDate, EndDate || null, Budget || null, ManagerID || null, id],
        (err) => {
            if (err) {
                console.error("Lỗi khi sửa dự án:", err.message);
                return res.status(500).json({ message: "Lỗi khi sửa dự án" });
            }
            res.json({ message: "Sửa dự án thành công!" });
        }
    );
});




// API: Xóa nhân viên (Chỉ Admin)
app.delete("/employees/:id", authenticateToken, authorizeAdmin, (req, res) => {
    const { id } = req.params;
  
    const sql = "DELETE FROM Employees WHERE EmployeeID = ?";
    db.query(sql, [id], (err) => {
      if (err) {
        console.error("Lỗi khi xóa nhân viên:", err.message);
        return res.status(500).json({ message: "Lỗi khi xóa nhân viên" });
      }
      res.json({ message: "Xóa nhân viên thành công!" });
    });
  });
  
// API: Xóa tài khoản
app.delete("/users/:id", authenticateToken, authorizeAdmin, (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM Users WHERE UserID = ?";
    db.query(sql, [id], (err) => {
        if (err) {
            console.error("Lỗi khi xóa tài khoản:", err.message);
            return res.status(500).json({ message: "Lỗi khi xóa tài khoản" });
        }
        res.json({ message: "Xóa tài khoản thành công!" });
    });
});

//API: Xóa Dự Án
app.delete("/projects/:id", authenticateToken, authorizeAdmin, (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM Projects WHERE ProjectID = ?";
    db.query(sql, [id], (err) => {
        if (err) {
            console.error("Lỗi khi xóa dự án:", err.message);
            return res.status(500).json({ message: "Lỗi khi xóa dự án" });
        }
        res.json({ message: "Xóa dự án thành công!" });
    });
});


// API: Hủy đăng ký tham gia dự án
app.delete("/unregister-project/:projectId", authenticateToken, (req, res) => {
    const { projectId } = req.params;
    const employeeId = req.user.UserID; // Lấy EmployeeID từ user đăng nhập

    if (!projectId) {
        return res.status(400).json({ message: "Thiếu mã dự án!" });
    }

    // Kiểm tra xem nhân viên có đăng ký dự án hay không
    const checkRegistrationSQL = "SELECT * FROM EmployeeProjects WHERE EmployeeID = ? AND ProjectID = ?";
    db.query(checkRegistrationSQL, [employeeId, projectId], (err, results) => {
        if (err) {
            console.error("Lỗi khi kiểm tra đăng ký dự án:", err.message);
            return res.status(500).json({ message: "Lỗi khi kiểm tra đăng ký dự án!" });
        }
        if (results.length === 0) {
            return res.status(400).json({ message: "Bạn chưa đăng ký dự án này!" });
        }

        // Xóa bản ghi khỏi bảng EmployeeProjects
        const deleteSQL = "DELETE FROM EmployeeProjects WHERE EmployeeID = ? AND ProjectID = ?";
        db.query(deleteSQL, [employeeId, projectId], (err) => {
            if (err) {
                console.error("Lỗi khi hủy đăng ký dự án:", err.message);
                return res.status(500).json({ message: "Lỗi khi hủy đăng ký dự án!" });
            }
            res.json({ message: "Hủy đăng ký dự án thành công!" });
        });
    });
});



// Các API khác
app.get("/departments", authenticateToken, (req, res) => {
    const sql = `
        SELECT d.DepartmentID, d.DepartmentName, d.Location, 
               CONCAT(e.FirstName, ' ', e.LastName) AS ManagerName
        FROM Departments d
        LEFT JOIN Employees e ON d.ManagerID = e.EmployeeID
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn cơ sở dữ liệu:", err.message);
            return res.status(500).json({ message: "Lỗi khi truy vấn cơ sở dữ liệu" });
        }
        res.json(results);
    });
});

app.get("/projects", authenticateToken, (req, res) => {
    const sql = `
        SELECT 
            p.ProjectID, 
            p.ProjectName, 
            p.StartDate, 
            p.EndDate, 
            p.Budget, 
            p.ManagerID, 
            CONCAT(e.FirstName, ' ', e.LastName) AS ManagerName,
            GROUP_CONCAT(ep.EmployeeID SEPARATOR ', ') AS RegisteredEmployees
        FROM Projects p
        LEFT JOIN EmployeeProjects ep ON p.ProjectID = ep.ProjectID
        LEFT JOIN Employees e ON p.ManagerID = e.EmployeeID
        GROUP BY p.ProjectID
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi khi truy vấn cơ sở dữ liệu:", err.message);
            return res.status(500).json({ message: "Lỗi khi truy vấn cơ sở dữ liệu" });
        }
        res.json(results);
    });
});


app.get("/attendances", authenticateToken, (req, res) => {
    const sql = `
        SELECT 
            a.AttendanceID, 
            a.EmployeeID, 
            e.FirstName, 
            e.LastName, 
            a.Date, 
            a.CheckIn, 
            a.CheckOut, 
            a.Status, 
            GROUP_CONCAT(p.ProjectName SEPARATOR ', ') AS projects
        FROM Attendance a
        LEFT JOIN Employees e ON a.EmployeeID = e.EmployeeID
        LEFT JOIN EmployeeProjects ep ON a.EmployeeID = ep.EmployeeID
        LEFT JOIN Projects p ON ep.ProjectID = p.ProjectID
        GROUP BY a.AttendanceID
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi khi lấy danh sách chấm công:", err.message);
            return res.status(500).json({ message: "Lỗi khi truy vấn cơ sở dữ liệu" });
        }
        res.json(results);
    });
});


app.get("/attendance", authenticateToken, (req, res) => {
    const sql = "SELECT * FROM Attendance";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi khi truy vấn cơ sở dữ liệu:", err.message);
            return res.status(500).json({ message: "Lỗi khi truy vấn cơ sở dữ liệu" });
        }
        res.json(results);
    });
});

app.get("/positions", authenticateToken, (req, res) => {
    const sql = "SELECT * FROM Positions";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi khi truy vấn cơ sở dữ liệu:", err.message);
            return res.status(500).json({ message: "Lỗi khi truy vấn cơ sở dữ liệu" });
        }
        res.json(results);
    });
});

// API: Lấy danh sách người dùng
app.get("/users", authenticateToken, (req, res) => {
    const sql = `
        SELECT 
            u.UserID, 
            u.Username, 
            u.Role, 
            CONCAT(e.FirstName, ' ', e.LastName) AS EmployeeName
        FROM Users u
        LEFT JOIN Employees e ON u.EmployeeID = e.EmployeeID
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn cơ sở dữ liệu:", err.message);
            return res.status(500).json({ message: "Lỗi khi truy vấn cơ sở dữ liệu" });
        }
        res.json(results);
    });
});
// API: Lấy danh sách nhân viên cùng phòng ban
app.get("/my-department-employees", authenticateToken, (req, res) => {
    const { DepartmentID } = req.user;

    if (!DepartmentID) {
        return res.status(400).json({ message: "Không tìm thấy phòng ban của người dùng!" });
    }

    const sql = `
        SELECT 
            e.EmployeeID, 
            e.FirstName, 
            e.LastName, 
            e.Email, 
            e.PhoneNumber, 
            e.PositionID, 
            p.PositionName
        FROM Employees e
        LEFT JOIN Positions p ON e.PositionID = p.PositionID
        WHERE e.DepartmentID = ?
    `;
    db.query(sql, [DepartmentID], (err, results) => {
        if (err) {
            console.error("Lỗi khi lấy danh sách nhân viên cùng phòng ban:", err.message);
            return res.status(500).json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
        }
        res.json(results);
    });
});

// API: Lấy danh sách dự án của người dùng
app.get("/my-projects", authenticateToken, (req, res) => {
    const { UserID } = req.user;

    const sql = `
        SELECT 
            p.ProjectID, 
            p.ProjectName, 
            p.StartDate, 
            p.EndDate, 
            p.Budget
        FROM Projects p
        LEFT JOIN EmployeeProjects ep ON p.ProjectID = ep.ProjectID
        WHERE ep.EmployeeID = ?
    `;
    db.query(sql, [UserID], (err, results) => {
        if (err) {
            console.error("Lỗi khi lấy danh sách dự án:", err.message);
            return res.status(500).json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
        }
        res.json(results);
    });
});

// API: Lấy thông tin cá nhân của người dùng hiện tại
app.get("/my-profile", authenticateToken, (req, res) => {
    const { UserID } = req.user;
  
    const sql = `
        SELECT 
            e.EmployeeID, 
            e.FirstName, 
            e.LastName, 
            e.DepartmentID, 
            e.PositionID 
        FROM Employees e
        WHERE e.EmployeeID = ?
    `;
    db.query(sql, [UserID], (err, results) => {
      if (err) {
        console.error("Lỗi khi lấy thông tin người dùng:", err.message);
        return res.status(500).json({ message: "Lỗi khi truy vấn cơ sở dữ liệu" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy người dùng!" });
      }
      res.json(results[0]);
    });
  });
  
// API: Lấy danh sách vị trí cùng mức lương
app.get("/positions-salary", authenticateToken, (req, res) => {
    const sql = "SELECT PositionID, PositionName, BaseSalary FROM Positions";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi khi lấy danh sách vị trí:", err.message);
            return res.status(500).json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
        }
        res.json(results);
    });
});

// API: Cập nhật thông tin cá nhân
app.put("/update-profile", authenticateToken, (req, res) => {
    const { UserID } = req.user;
    const { FirstName, LastName, PhoneNumber, Address } = req.body;

    const sql = `
        UPDATE Employees
        SET 
            FirstName = ?, 
            LastName = ?, 
            PhoneNumber = ?, 
            Address = ?
        WHERE EmployeeID = ?
    `;
    db.query(sql, [FirstName, LastName, PhoneNumber, Address, UserID], (err) => {
        if (err) {
            console.error("Lỗi khi cập nhật thông tin cá nhân:", err.message);
            return res.status(500).json({ message: "Lỗi khi cập nhật thông tin cá nhân" });
        }
        res.json({ message: "Cập nhật thông tin cá nhân thành công!" });
    });
});


// Chạy server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
