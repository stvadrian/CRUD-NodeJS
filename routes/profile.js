const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {});

router.post("/", (req, res) => {
  const formData = req.body;

  db.getUserByUsername(formData.username, formData.password, (err, user) => {
    if (err) {
      req.session.messageType = "error";
      req.session.message =
        "Unknown error has occurred. Please try again later.";
      res.redirect("/");
    }

    if (!user) {
      req.session.messageType = "error";
      req.session.message = "Invalid credentials!";
      res.redirect("/");
    }
  });
});

module.exports = router;
