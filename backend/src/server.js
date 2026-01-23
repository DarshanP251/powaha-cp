import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("DB URL:", process.env.DATABASE_URL);
});

import cors from "cors";

app.use(
  cors({
    origin: [
      "https://powaha-cp-1.onrender.com",
    ],
    credentials: true
  })
);

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function ensureAdmin() {
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
  }
}

ensureAdmin();
