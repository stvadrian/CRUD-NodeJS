const express = require("express");
const router = express.Router();
const db = require("../database"); // Import the database module

router.post("/delete/user", (req, res) => {
  const formData = req.body;
  const referer = req.headers.referer || "/"; // Get the referring URL

  db.pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to MySQL:", err);
      res.status(500).send("Database error");
      return;
    }

    connection.query(
      "DELETE FROM users WHERE ?",
      formData,
      (queryErr, results) => {
        connection.release();
        if (queryErr) {
          console.error("Error executing query:", queryErr);
          res.status(500).send("Query error");
          return;
        }
        req.session.messageType = "success";
        req.session.message = "Success Delete Data!";

        res.redirect(referer);
      }
    );
  });
});

module.exports = router;
