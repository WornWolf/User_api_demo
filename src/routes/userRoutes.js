const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require('../middleware/upload');

router.post("/", upload.single("avatar"), userController.createUser)

router.get("/", userController.getAllUsers)

router.get("/:id", userController.getUser)

router.put("/:id/avatar", upload.single("avatar"), userController.updateAvatar);

router.delete("/:id", userController.deleteUser);

// Update user info (username & email)
router.put("/:id", express.json(), userController.updateUser);

module.exports = router