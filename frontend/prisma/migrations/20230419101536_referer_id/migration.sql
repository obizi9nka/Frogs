-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pid" INTEGER,
    "level" INTEGER,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wallet" TEXT NOT NULL,
    "percent" INTEGER NOT NULL DEFAULT 300,
    "sig" TEXT,
    "refererId" INTEGER,
    CONSTRAINT "User_refererId_fkey" FOREIGN KEY ("refererId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("date", "id", "level", "percent", "pid", "sig", "wallet") SELECT "date", "id", "level", "percent", "pid", "sig", "wallet" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
