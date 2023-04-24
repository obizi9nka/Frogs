-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "pid" INTEGER,
    "level" INTEGER,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wallet" TEXT NOT NULL,
    "percent" INTEGER NOT NULL DEFAULT 300,
    "sig" TEXT,
    "refererId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_refererId_fkey" FOREIGN KEY ("refererId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
