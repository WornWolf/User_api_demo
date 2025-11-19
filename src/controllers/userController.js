const User = require("../models/userModel");
const cloudinary = require("cloudinary").v2

exports.createUser = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: "Please upload an image!" });
    }

    // แปลง upload_stream เป็น Promise
    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(fileBuffer);
      });
    };

    const result = await uploadToCloudinary(req.file.buffer);

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      avatarUrl: result.secure_url,
      cloudinary_id: result.public_id,
    });

    await newUser.save();

    res.status(201).json({ success: true, user: newUser });

  } catch (err) {
    res.status(500).send({ message: "Server error", err });
  }
};

exports.getAllUsers = async (req,res) => {
    try{
        const users = await User.find({})
        res.status(200).json(users);
    } catch (err) {
        res.status(500).send({message : "Server Error", err})
    }
}

exports.updateAvatar = async (req, res) => {
  console.log("req.file:", req.file); // เช็กไฟล์เข้ามาไหม
  
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    // ลบรูปเก่า
    if (user.cloudinary_id) await cloudinary.uploader.destroy(user.cloudinary_id);

    // อัปโหลดรูปใหม่จาก buffer
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: "avatars" }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
      stream.end(req.file.buffer);
    });

    user.avatarUrl = uploadResult.secure_url;
    user.cloudinary_id = uploadResult.public_id;
    await user.save();

    res.json({ success: true, avatarUrl: user.avatarUrl });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getUser = async (req,res) => {
    try {
    const user = await User.findById(req.params.id);
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ลบผู้ใช้
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    // ลบรูปจาก Cloudinary ถ้ามี
    if (user.cloudinary_id) {
      await cloudinary.uploader.destroy(user.cloudinary_id);
    }

    // ลบจาก DB
    await user.deleteOne();

    res.json({ success: true, message: "User deleted successfully" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ success: false, error: "Username and email are required" });
    }

    user.username = username;
    user.email = email;

    await user.save();

    res.json({ success: true, user }); // ส่ง user ใหม่กลับไป
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
