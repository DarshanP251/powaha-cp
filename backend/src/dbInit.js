import { execSync } from "child_process";

export function initDatabase() {
    try {
        console.log("📦 Syncing database schema (prisma db push)...");
        execSync(
            "node ./node_modules/prisma/build/index.js db push",
            { stdio: "inherit" }
        );
        console.log("✅ Database schema synced");
    } catch (err) {
        console.error("❌ Database sync failed:", err.message);
    }
}
