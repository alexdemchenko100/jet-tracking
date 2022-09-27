-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL DEFAULT '',
    "owner" TEXT NOT NULL,
    "stripeCustomerId" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAccount" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT DEFAULT '',
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "token" TEXT,
    "tokenExpiryAt" TIMESTAMP(3),
    "accountId" UUID NOT NULL,

    CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonEnv" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountId" UUID NOT NULL,
    "env" JSONB NOT NULL,

    CONSTRAINT "MonEnv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Monitor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "frequency" INTEGER NOT NULL,
    "bodyType" TEXT DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "auth" JSONB NOT NULL DEFAULT '{}',
    "preScript" TEXT NOT NULL DEFAULT '',
    "headers" JSONB NOT NULL DEFAULT '[]',
    "queryParams" JSONB NOT NULL DEFAULT '[]',
    "cookies" TEXT,
    "followRedirects" INTEGER DEFAULT 0,
    "timeout" INTEGER DEFAULT 30,
    "locations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "assertions" JSONB NOT NULL DEFAULT '[]',
    "notifications" JSONB NOT NULL DEFAULT '{}',
    "notifyEmail" TEXT,
    "environments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "variables" JSONB NOT NULL DEFAULT '[]',
    "accountId" UUID NOT NULL,

    CONSTRAINT "Monitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitorResult" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "err" TEXT NOT NULL,
    "headers" JSONB NOT NULL DEFAULT '[]',
    "url" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodySize" INTEGER NOT NULL,
    "code" INTEGER NOT NULL,
    "codeStatus" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "waitTime" INTEGER NOT NULL,
    "dnsTime" INTEGER NOT NULL,
    "tcpTime" INTEGER NOT NULL,
    "tlsTime" INTEGER NOT NULL,
    "uploadTime" INTEGER NOT NULL,
    "ttfb" INTEGER NOT NULL,
    "downloadTime" INTEGER NOT NULL,
    "totalTime" INTEGER NOT NULL,
    "certExpiryDays" INTEGER NOT NULL,
    "certCommonName" TEXT NOT NULL,
    "assertResults" JSONB NOT NULL DEFAULT '[]',
    "monitorId" UUID NOT NULL,
    "accountId" UUID NOT NULL,

    CONSTRAINT "MonitorResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OndemandResult" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "err" TEXT NOT NULL,
    "headers" JSONB NOT NULL DEFAULT '[]',
    "url" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodySize" INTEGER NOT NULL,
    "code" INTEGER NOT NULL,
    "codeStatus" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "waitTime" INTEGER NOT NULL,
    "dnsTime" INTEGER NOT NULL,
    "tcpTime" INTEGER NOT NULL,
    "tlsTime" INTEGER NOT NULL,
    "uploadTime" INTEGER NOT NULL,
    "ttfb" INTEGER NOT NULL,
    "downloadTime" INTEGER NOT NULL,
    "totalTime" INTEGER NOT NULL,
    "certExpiryDays" INTEGER NOT NULL,
    "certCommonName" TEXT NOT NULL,
    "assertResults" JSONB NOT NULL DEFAULT '[]',
    "monitorId" UUID NOT NULL,
    "accountId" UUID NOT NULL,

    CONSTRAINT "OndemandResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationChannel" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "isDefaultEnabled" BOOLEAN NOT NULL DEFAULT false,
    "applyOnExistingMonitors" BOOLEAN NOT NULL DEFAULT false,
    "channel" JSONB NOT NULL DEFAULT '{}',
    "accountId" UUID NOT NULL,

    CONSTRAINT "NotificationChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" UUID NOT NULL,
    "monitorId" UUID,
    "resultId" UUID,
    "state" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT '',
    "data" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alert" JSONB NOT NULL DEFAULT '{}',
    "uiState" JSONB NOT NULL DEFAULT '{}',
    "accountId" UUID NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusPage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoUrl" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monitors" TEXT[],
    "accountId" UUID NOT NULL,

    CONSTRAINT "StatusPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingInfo" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billingPlanType" TEXT NOT NULL,
    "monitorRunsLimit" INTEGER,
    "accountId" UUID NOT NULL,

    CONSTRAINT "BillingInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_name_owner_key" ON "Account"("name", "owner");

-- CreateIndex
CREATE INDEX "UserAccount_userId_idx" ON "UserAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_email_accountId_key" ON "UserAccount"("email", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "MonEnv_name_accountId_key" ON "MonEnv"("name", "accountId");

-- CreateIndex
CREATE INDEX "Monitor_createdAt_idx" ON "Monitor" USING BRIN ("createdAt");

-- CreateIndex
CREATE INDEX "Monitor_accountId_idx" ON "Monitor"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Monitor_accountId_name_key" ON "Monitor"("accountId", "name");

-- CreateIndex
CREATE INDEX "MonitorResult_createdAt_idx" ON "MonitorResult" USING BRIN ("createdAt");

-- CreateIndex
CREATE INDEX "MonitorResult_monitorId_idx" ON "MonitorResult"("monitorId");

-- CreateIndex
CREATE INDEX "MonitorResult_accountId_idx" ON "MonitorResult"("accountId");

-- CreateIndex
CREATE INDEX "OndemandResult_accountId_idx" ON "OndemandResult"("accountId");

-- CreateIndex
CREATE INDEX "NotificationChannel_accountId_idx" ON "NotificationChannel"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationChannel_accountId_name_key" ON "NotificationChannel"("accountId", "name");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog" USING BRIN ("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_accountId_idx" ON "ActivityLog"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_accountId_key" ON "Settings"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "StatusPage_accountId_key" ON "StatusPage"("accountId");

-- CreateIndex
CREATE INDEX "BillingInfo_accountId_idx" ON "BillingInfo"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_name_userId_key" ON "ApiKey"("name", "userId");

-- AddForeignKey
ALTER TABLE "UserAccount" ADD CONSTRAINT "UserAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonEnv" ADD CONSTRAINT "MonEnv_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Monitor" ADD CONSTRAINT "Monitor_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitorResult" ADD CONSTRAINT "MonitorResult_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "Monitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitorResult" ADD CONSTRAINT "MonitorResult_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationChannel" ADD CONSTRAINT "NotificationChannel_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "Monitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "MonitorResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusPage" ADD CONSTRAINT "StatusPage_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingInfo" ADD CONSTRAINT "BillingInfo_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
