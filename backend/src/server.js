import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

import app from "./app.js";

const prisma = new PrismaClient();
const PORT = process.env.PORT || 10000;

/* -------------------- MIDDLEWARE -------------------- */
app.use(
  cors({
    origin: ["https://powaha-cp-1.onrender.com"],
    credentials: true,
  })
);

/* -------------------- ADMIN BOOTSTRAP -------------------- */
async function ensureAdmin() {
  try {
    const adminEmail = "admin@powaha.com";

    const existing = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existing) {
      const hashed = await bcrypt.hash("admin123", 10);

      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashed,
          role: "ADMIN",
        },
      });

      console.log("✅ Admin user created");
    } else {
      console.log("ℹ️ Admin already exists");
    }
  } catch (err) {
    console.error("❌ ensureAdmin error:", err);
  }
}

await ensureAdmin();

/* -------------------- START SERVER -------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("DB URL:", process.env.DATABASE_URL);
});
