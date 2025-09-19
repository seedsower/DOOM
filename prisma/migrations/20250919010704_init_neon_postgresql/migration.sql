-- CreateTable
CREATE TABLE "public"."token_claims" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerHash" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txSignature" TEXT,
    "amount" INTEGER NOT NULL DEFAULT 734,
    "metadata" JSONB,

    CONSTRAINT "token_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_attempts" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerHash" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "verification_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."protocol_metrics" (
    "id" TEXT NOT NULL,
    "totalClaims" INTEGER NOT NULL DEFAULT 0,
    "totalTokensMinted" BIGINT NOT NULL DEFAULT 0,
    "lastClaimAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protocol_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."questions" (
    "id" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "answerHash" TEXT NOT NULL,
    "hint" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bunker_access" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "accessLevel" INTEGER NOT NULL DEFAULT 1,
    "tokenBalance" BIGINT NOT NULL DEFAULT 0,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bunker_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_claims_walletAddress_key" ON "public"."token_claims"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "bunker_access_walletAddress_key" ON "public"."bunker_access"("walletAddress");
