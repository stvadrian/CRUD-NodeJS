const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "crud",
});

module.exports = {
  getUserByUsername,
  getCurrentDateTime,
  getAllUsers,
  pool,
};

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
        if (password && user.user_password !== password) {
          callback(null, false); // Password does not match
        } else {
          callback(null, user); // User found and password matches (or password check is not requested)
        }
      }
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
