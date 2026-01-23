import { execSync } from "child_process";

export function runMigrations() {
  try {
    console.log("Running Prisma migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("Prisma migrations completed");
  } catch (err) {
    console.error("Migration failed:", err.message);
  }
}
