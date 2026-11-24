const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Koneksi database (otomatis menggunakan TiDB Cloud saat di Vercel)
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "music_app",
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Route halaman utama
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Registrasi
app.post("/signup", (req, res) => {
    const { username, email, password, name } = req.body;
    const sql = `INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)`;

    db.query(sql, [username, email, password, name], (err, result) => {
        if (err) return res.json({ success: false, message: err });
        res.json({ success: true, message: "Registrasi berhasil!" });
    });
});

// API Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;

    db.query(sql, [username, password], (err, result) => {
        if (err) return res.json({ success: false, message: err });

        if (result.length > 0) {
            res.json({ success: true, message: "Login berhasil!" });
        } else {
            res.json({ success: false, message: "Username atau password salah!" });
        }
    });
});

app.post("/create-playlist", (req, res) => {
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
