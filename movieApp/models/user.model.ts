import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
});

export const UserModel = mongoose.model("User", userSchema);
