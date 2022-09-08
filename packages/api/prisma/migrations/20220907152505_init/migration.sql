-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "stripeCustomerId" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '',
    "isCurrentAccount" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "token" TEXT,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonEnv" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "env" JSONB NOT NULL,

    CONSTRAINT "MonEnv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Monitor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "frequency" INTEGER NOT NULL,
    "bodyType" TEXT DEFAULT '',
    "body" TEXT,
    "auth" JSONB NOT NULL DEFAULT '{}',
    "preScript" TEXT NOT NULL DEFAULT '',
    "headers" JSONB NOT NULL DEFAULT '[]',
    "queryParams" JSONB NOT NULL DEFAULT '[]',
    "cookies" TEXT,
    "followRedirects" INTEGER DEFAULT 0,
    "timeout" INTEGER DEFAULT 30,
    "locations" TEXT[],
    "assertions" JSONB NOT NULL DEFAULT '[]',
    "notifications" JSONB NOT NULL DEFAULT '{}',
    "notifyEmail" TEXT,
    "env" JSONB NOT NULL DEFAULT '[]',
    "variables" JSONB NOT NULL DEFAULT '[]',
    "accountId" TEXT NOT NULL,

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
    "monitorId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "MonitorResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationChannel" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "isDefaultEnabled" BOOLEAN NOT NULL DEFAULT false,
    "applyOnExistingMonitors" BOOLEAN NOT NULL DEFAULT false,
    "channel" JSONB NOT NULL DEFAULT '{}',
    "accountId" TEXT NOT NULL,

    CONSTRAINT "NotificationChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationState" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" TEXT NOT NULL,
    "monitorId" TEXT,
    "state" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "resultId" UUID,

    CONSTRAINT "NotificationState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alert" JSONB NOT NULL DEFAULT '{}',
    "uiState" JSONB NOT NULL DEFAULT '{}',
    "accountId" TEXT NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationEmail" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "token" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "NotificationEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusPage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoUrl" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monitors" TEXT[],
    "accountId" TEXT NOT NULL,

    CONSTRAINT "StatusPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingInfo" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billingPlanType" TEXT NOT NULL,
    "monitorRunsLimit" INTEGER,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "BillingInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_name_key" ON "Account"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_email_accountId_key" ON "UserAccount"("email", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "MonEnv_name_accountId_key" ON "MonEnv"("name", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Monitor_name_accountId_key" ON "Monitor"("name", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationChannel_name_accountId_key" ON "NotificationChannel"("name", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_accountId_key" ON "Settings"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationEmail_email_key" ON "NotificationEmail"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StatusPage_name_accountId_key" ON "StatusPage"("name", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingInfo_id_key" ON "BillingInfo"("id");

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
ALTER TABLE "NotificationState" ADD CONSTRAINT "NotificationState_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "Monitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationState" ADD CONSTRAINT "NotificationState_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "MonitorResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationState" ADD CONSTRAINT "NotificationState_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEmail" ADD CONSTRAINT "NotificationEmail_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusPage" ADD CONSTRAINT "StatusPage_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingInfo" ADD CONSTRAINT "BillingInfo_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
