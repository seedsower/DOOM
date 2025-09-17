-- CreateTable
CREATE TABLE "token_claims" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletAddress" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerHash" TEXT NOT NULL,
    "claimedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txSignature" TEXT,
    "amount" INTEGER NOT NULL DEFAULT 734,
    "verified" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "verification_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletAddress" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerHash" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "attemptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT
);

-- CreateTable
CREATE TABLE "protocol_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "totalSupply" BIGINT NOT NULL DEFAULT 37000000,
    "circulatingSupply" BIGINT NOT NULL DEFAULT 37000000,
    "totalClaimed" BIGINT NOT NULL DEFAULT 0,
    "totalBurned" BIGINT NOT NULL DEFAULT 0,
    "uniqueHolders" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionText" TEXT NOT NULL,
    "answerHash" TEXT NOT NULL,
    "hint" TEXT,
    "pageRef" INTEGER,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "bunker_access" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletAddress" TEXT NOT NULL,
    "accessLevel" INTEGER NOT NULL DEFAULT 1,
    "tokenBalance" BIGINT NOT NULL DEFAULT 0,
    "lastChecked" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "token_claims_walletAddress_key" ON "token_claims"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "bunker_access_walletAddress_key" ON "bunker_access"("walletAddress");
