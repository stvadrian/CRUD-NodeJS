const express = require("express");
const session = require("express-session");
const db = require("./database"); // Import the database module
const profileRoutes = require("./routes/profile"); // Import user-related routes
const actionRoutes = require("./routes/action"); // Import user-related routes
const bodyParser = require("body-parser");
const { requireAuth, preventAuth } = require("./middlewares/authMiddleware");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.set("view engine", "ejs"); // Set the view engine to EJS
app.set("views", __dirname + "/views"); // Specify the directory for views/templates

// Set up session middleware
app.use(
  session({
    secret: "ABCDE", // Replace with a secret key for session encryption
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure to true if using HTTPS
  })
);

// Mount user-related routes
app.use("/profile", profileRoutes);
app.use("/action", actionRoutes);

app.get("/", preventAuth, (req, res) => {
  const messageType = req.session.messageType;
  req.session.messageType = null;
  const message = req.session.message;
  req.session.message = null;

  res.render("pages/auth/login", { messageType, message });
});
app.post("/login", preventAuth, (req, res) => {
  const formData = req.body;

  db.getUserByUsername(formData.username, formData.password, (err, user) => {
    if (err) {
      req.session.messageType = "error";
      req.session.message =
        "Unknown error has occurred. Please try again later.";
      res.redirect("/");
      return;
    }

    if (!user) {
      req.session.messageType = "error";
      req.session.message = "Invalid credentials!";
      res.redirect("/");
      return;
    } else {
      req.session.user = user; // Set user information in the session
      res.redirect("/dashboard");
      return;
    }
  });
});

app.get("/register", preventAuth, (req, res) => {
  const messageType = req.session.messageType;
  req.session.messageType = null;
  const message = req.session.message;
  req.session.message = null;

  res.render("pages/auth/register", { messageType, message });
});
app.post("/register", preventAuth, (req, res) => {
  const formData = req.body;

  db.getUserByUsername(formData.username, null, (err, user) => {
    if (err) {
      req.session.messageType = "error";
      req.session.message =
        "Unknown error has occurred. Please try again later.";
      res.redirect("/register");
      return;
    }

    if (user) {
      req.session.messageType = "error";
      req.session.message = "Username Already Exist!";
      res.redirect("/register");
    } else {
      db.pool.getConnection((err, connection) => {
        if (err) {
          console.error("Error connecting to MySQL:", err);
          res.status(500).send("Database error");
          return;
        }

        const newUser = {};
        for (const key in formData) {
          if (Object.hasOwnProperty.call(formData, key)) {
            newUser[`user_${key}`] = formData[key];
          }
        }

        db.hashPassword(newUser["user_password"])
          .then((hash) => {
            newUser["user_password"] = hash;
            const formattedDateTime = db.getCurrentDateTime();
            newUser["created_at"] = formattedDateTime;
            newUser["created_by"] = "NodeJS";

            connection.query(
              "INSERT INTO users SET ?",
              newUser,
              (queryErr, results) => {
                connection.release();
                if (queryErr) {
                  console.error("Error executing query:", queryErr);
                  res.status(500).send("Query error");
                  return;
                }
                console.log("New user inserted:", results.insertId);
                req.session.messageType = "success";
                req.session.message = "Success! Please Login Now";

                res.redirect("/");
                return;
              }
            );
          })
          .catch((error) => {
            // Handle the password hashing error
            res.status(500).send("Password hashing error");
          });
      });
    }
  });
});

app.get("/dashboard", requireAuth, (req, res) => {
  const messageType = req.session.messageType;
  req.session.messageType = null;
  const message = req.session.message;
  req.session.message = null;
  const user = req.session.user;

  if (user) {
    const active = "dashboard";
    const title = "My Dashboard";
    db.getAllUsers((err, registeredUsers) => {
      if (err) {
        console.error(err);
        registeredUsers = [];
      }

      res.render("pages/general/dashboard", {
        user,
        messageType,
        message,
        active,
        registeredUsers,
        title,
      });
    });
  } else {
    res.redirect("/");
  }
});

app.get("/logout", requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Internal Server Error");
    }

    res.redirect("/");
  });
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});
