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
