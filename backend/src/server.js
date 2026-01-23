import { runMigrations } from "./prismaMigrate.js";

if (process.env.NODE_ENV === "production") {
  runMigrations();
}


require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


console.log("DB URL:", process.env.DATABASE_URL);
