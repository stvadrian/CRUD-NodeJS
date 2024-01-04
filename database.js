const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "crud",
});

const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = {
  getUserByUsername,
  getCurrentDateTime,
  getAllUsers,
  getUserByUserID,
  pool,
  hashPassword,
  comparePassword,
};

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        console.error("Error while hashing the password:", err);
        reject(new Error("Password hashing error"));
      } else {
        resolve(hash);
      }
    });
  });
}

function comparePassword(enteredPassword, storedHash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(enteredPassword, storedHash, (err, result) => {
      if (err) {
        console.error("Error while comparing passwords:", err);
        reject(new Error("Password comparison error"));
      } else {
        resolve(result);
      }
    });
  });
}

function getUserByUsername(username, password, callback) {
  let query = "SELECT * FROM users WHERE user_username = ?";
  const values = [username];

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to MySQL:", err);
      callback("Database error");
      return;
    }

    connection.query(query, values, (queryErr, results) => {
      connection.release();
      if (queryErr) {
        console.error("Error executing query:", queryErr);
        callback("Query error");
        return;
      }

      if (results.length === 0) {
        callback(null, null); // User does not exist
      } else {
        const user = results[0];
        comparePassword(password, user.user_password)
          .then((isMatch) => {
            if (isMatch) {
              callback(null, user);
            } else {
              callback(null, false);
            }
          })
          .catch((error) => {
            console.error("Error comparing passwords:", error);
            // Handle the password comparison error
          });
      }
    });
  });
}

function getUserByUserID(userid, callback) {
  let query = "SELECT * FROM users WHERE user_id = ?";

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to MySQL:", err);
      callback("Database error");
      return;
    }

    connection.query(query, [userid], (queryErr, results) => {
      connection.release();
      if (queryErr) {
        console.error("Error executing query:", queryErr);
        callback("Query error");
        return;
      }

      const user = results[0];
      callback(null, user);
    });
  });
}

function getAllUsers(callback) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to MySQL:", err);
      callback("Database error");
      return;
    }

    connection.query("SELECT * FROM users", (queryErr, results) => {
      connection.release();
      if (queryErr) {
        console.error("Error executing query:", queryErr);
        callback("Query error");
        return;
      }

      callback(null, results);
    });
  });
}

function getCurrentDateTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = padValue(now.getMonth() + 1); // Months are zero-based
  const day = padValue(now.getDate());
  const hours = padValue(now.getHours());
  const minutes = padValue(now.getMinutes());
  const seconds = padValue(now.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function padValue(value) {
  return value < 10 ? `0${value}` : value;
}
