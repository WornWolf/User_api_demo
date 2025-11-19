const express = require("express");
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const cloudinary = require('cloudinary').v2;
const cors = require('cors')
const path = require('path')
const userRoutes = require("./src/routes/userRoutes")

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000

app.use(cors())

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname,"public")));

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected sucessfully."))
    .catch((err)=> console.error("MongoDB connection error:", err))

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_KEY_SECRET
})

app.use('/api/users', userRoutes);

app.use("/", (req,res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    console.log(`http://localhost:${PORT}`)
})