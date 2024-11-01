/*
  Warnings:

  - A unique constraint covering the columns `[userID]` on the table `Credential` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Credential_userID_key" ON "Credential"("userID");
