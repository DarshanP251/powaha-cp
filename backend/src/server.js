import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import app from "./app.js";

const PORT = process.env.PORT || 10000;

app.use(
  cors({
    origin: ["https://powaha-cp-1.onrender.com"],
    credentials: true,
  })
);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
