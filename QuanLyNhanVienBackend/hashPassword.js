// Import thư viện bcrypt
const bcrypt = require('bcryptjs');

// Mật khẩu gốc cần mã hóa
const plainPassword = 'admin123'; // Thay bằng mật khẩu bạn muốn mã hóa

// Mã hóa mật khẩu
const hashedPassword = bcrypt.hashSync(plainPassword, 10); // 10 là số vòng lặp mã hóa

// In ra mật khẩu đã mã hóa
console.log('Hashed Password:', hashedPassword);
