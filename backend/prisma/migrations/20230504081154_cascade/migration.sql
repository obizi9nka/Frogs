-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "wallet" TEXT NOT NULL,
    "pid" INTEGER,
    "level" INTEGER,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "percent" INTEGER NOT NULL DEFAULT 500,
    "sig" TEXT,
    "refererId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id","wallet")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_key" ON "User"("wallet");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_refererId_fkey" FOREIGN KEY ("refererId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
