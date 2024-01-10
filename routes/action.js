const express = require("express");
const router = express.Router();
const db = require("../database"); // Import the database module
const { requireAuth } = require("../middlewares/authMiddleware");
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });

router.post("/delete/user", csrfProtection, requireAuth, (req, res) => {
  const formData = req.body;
  const user_id = formData.user_id;
  const referer = req.headers.referer || "/";

  db.pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to MySQL:", err);
      res.status(500).send("Database error");
      return;
    }

    connection.query(
      "DELETE FROM users WHERE user_id = ?",
      user_id,
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
