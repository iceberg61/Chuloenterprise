import mongoose from "mongoose";

const CredentialSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  emailPassword: String,
  twoFA: String,
  isSold: { type: Boolean, default: false }, 
});

const LogSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },

  logo: String,

  quantity: { type: Number, default: 0 },

  credentials: { type: [CredentialSchema], default: [] },

  isSold: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Log || mongoose.model("Log", LogSchema);
