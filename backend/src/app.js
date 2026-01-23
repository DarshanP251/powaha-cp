import express from "express";
import cors from "cors";

import auth from "./middlewares/auth.middleware.js";

// Route imports (IMPORTANT: include .js)
import authRoutes from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import cpRoutes from "./modules/cp/cp.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// AUTH ROUTES
app.use("/auth", authRoutes);

// ADMIN ROUTES (protected)
app.use("/admin", auth(["ADMIN"]), adminRoutes);

// CP ROUTES (auth handled inside)
app.use("/cp", cpRoutes);

// Health / root check
app.get("/", (req, res) => {
  res.send("POWAHA CP Backend Running 🚀");
});

export default app;
