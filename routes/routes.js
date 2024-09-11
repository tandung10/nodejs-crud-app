const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer"); // multer for file uploads

// image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("image");

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find(); // No callback, just await the promise
    res.render("index", { title: "User List", users: users });
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred while retrieving users");
  }
});

router.get("/add", (req, res) => {
  res.render("add-user", { title: "Add User" });
});

// Add a new user
router.post("/add", upload, async (req, res) => {
  try {
    const user = new User(req.body);
    user.image = req.file.filename;
    await user.save(); // Use async/await instead of callback

    req.session.message = {
      type: "success",
      message: "User added successfully",
    };

    res.redirect("/");
  } catch (err) {
    res.status(400).send("Unable to save data");
  }
});

// Edit user
router.get("/edit/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("edit-user", { title: "Edit User", user: user });
  } catch (err) {
    res.status(404).send("User not found");
  }
});

// Update user
router.post("/update/:id", upload, async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    user.name = req.body.name;
    user.email = req.body.email;
    user.image = req.file.filename;
    await user.save();
    req.session.message = {
      type: "success",
      message: "User updated successfully",
    };
    res.redirect("/");
  } catch (err) {
    res.status(404).send("User not found");
  }
});

// Delete user
router.get("/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.session.message = {
      type: "success",
      message: "User deleted successfully",
    };
    res.redirect("/");
  } catch (err) {
    res.status(404).send("User not found");
  }
});

module.exports = router;
