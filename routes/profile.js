const express = require("express");
const router = express.Router();
const db = require("../database"); // Import the database module
const { requireAuth, preventAuth } = require("../middlewares/authMiddleware");

router.get("/", requireAuth, (req, res) => {
  const messageType = req.session.messageType;
  req.session.messageType = null;
  const message = req.session.message;
  req.session.message = null;
  const user = req.session.user;
  const active = "profile";

  res.render("pages/general/profile", { messageType, message, user, active });
});

router.post("/update", requireAuth, (req, res) => {
  const formData = req.body;
  const user = req.session.user;
  const update_at = db.getCurrentDateTime();
  const update_by = "NodeJS";

  db.pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to MySQL:", err);
      res.status(500).send("Database error");
      return;
    }

    connection.query(
      "UPDATE users SET user_fullname = ?, updated_at = ?, updated_by = ? WHERE user_id = ?",
      [formData.fullname, update_at, update_by, user.user_id],
      (queryErr, results) => {
        connection.release();
        if (queryErr) {
          console.error("Error executing query:", queryErr);
          res.status(500).send("Query error");
          return;
        }

        db.getUserByUserID(user.user_id, (err, user) => {
          if (err) {
            req.session.messageType = "error";
            req.session.message =
              "Unknown error has occurred. Please try again later.";
            res.redirect("/");
          }

          const updatedUserData = user;

          req.session.messageType = "success";
          req.session.message = "Success Update Data!";
          req.session.user = updatedUserData;

          res.redirect("/profile");
        });
      }
    );
  });
});

router.post("/change-password", requireAuth, (req, res) => {
  const formData = req.body;
  const user = req.session.user;
  const newPassword = formData.new_password;
  const currentPassword = formData.current_password;
  const update_at = db.getCurrentDateTime();
  const update_by = "NodeJS";

  db.comparePassword(currentPassword, user.user_password)
    .then((isMatch) => {
      if (!isMatch) {
        req.session.messageType = "error";
        req.session.message = "Current password does not matched!";

        res.redirect("/profile");
        return;
      }
    })
    .catch((error) => {
      console.error("Error comparing passwords:", error);
    });

  db.pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to MySQL:", err);
      res.status(500).send("Database error");
      return;
    }

    db.hashPassword(newPassword)
      .then((hash) => {
        connection.query(
          "UPDATE users SET user_password = ?, updated_at = ?, updated_by = ? WHERE user_id = ?",
          [hash, update_at, update_by, user.user_id],
          (queryErr, results) => {
            connection.release();
            if (queryErr) {
              console.error("Error executing query:", queryErr);
              res.status(500).send("Query error");
              return;
            }

            db.getUserByUserID(user.user_id, (err, user) => {
              if (err) {
                req.session.messageType = "error";
                req.session.message =
                  "Unknown error has occurred. Please try again later.";
                res.redirect("/");
                return;
              }

              const updatedUserData = user;

              req.session.messageType = "success";
              req.session.message = "Success Update Password!";
              req.session.user = updatedUserData;

              res.redirect("/profile");
              return;
            });
          }
        );
      })
      .catch((error) => {
        res.status(500).send("Password hashing error");
        return;
      });
  });
});

module.exports = router;
