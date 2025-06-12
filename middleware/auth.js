const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_secret_key"; // Thay bằng bí mật thực tế của bạn

// Middleware xác thực token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token không được cung cấp" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token không hợp lệ" });

    req.user = user; // Lưu thông tin user (bao gồm Role) từ token vào request
    next();
  });
}

// Middleware kiểm tra quyền Admin
function authorizeAdmin(req, res, next) {
  if (req.user.Role !== "Admin") {
    return res.status(403).json({ message: "Bạn không có quyền truy cập" });
  }
  next();
}

module.exports = { authenticateToken, authorizeAdmin };
