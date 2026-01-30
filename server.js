const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const db = new sqlite3.Database("users.db");

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Create users table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    username TEXT,
    password TEXT
  )
`, (err) => {
  if (err) console.error("Error creating table:", err.message);
  else console.log("Users table ready.");
});

// -------------------- SIGN UP --------------------
app.post("/signup", (req, res) => {
  const email = req.body.email?.trim();
  const username = req.body.username?.trim();
  const password = req.body.password;

  if (!email || !username || !password) {
    return res.send("Please fill in all fields.");
  }

  db.run(
    "INSERT INTO users (email, username, password) VALUES (?, ?, ?)",
    [email, username, password],
    (err) => {
      if (err) {
        console.log("SQLite Error:", err.message);
        if (err.message.includes("UNIQUE constraint")) {
          res.send("Account already exists with that email.");
        } else {
          res.send("Error creating account.");
        }
      } else {
        console.log(`New user signed up: ${email} (${username})`);
        res.send("Account created! You can now log in.");
      }
    }
  );
});

// -------------------- LOGIN --------------------
app.post("/login", (req, res) => {
  const email = req.body.email?.trim();
  const password = req.body.password;

  if (!email || !password) {
    return res.send("Please enter email and password.");
  }

  db.get(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, user) => {
      if (err) {
        console.log("Login Error:", err.message);
        res.send("Error during login.");
      } else if (user) {
        res.send(`Login successful! Welcome, ${user.username}`);
      } else {
        res.send("Invalid email or password.");
      }
    }
  );
});

// -------------------- START SERVER --------------------
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
