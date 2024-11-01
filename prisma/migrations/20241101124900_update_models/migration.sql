-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "credentialID" TEXT NOT NULL,
    "transports" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "credentialPublicKey" BYTEA NOT NULL,
    "counter" INTEGER NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Credential_credentialID_key" ON "Credential"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_userID_key" ON "Credential"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_userID_key" ON "Challenge"("userID");
