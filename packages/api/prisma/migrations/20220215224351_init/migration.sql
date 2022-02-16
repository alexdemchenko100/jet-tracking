-- CreateTable
CREATE TABLE "Monitor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL,
    "headers" TEXT NOT NULL,
    "queryParams" TEXT NOT NULL,
    "cookies" TEXT NOT NULL,

    CONSTRAINT "Monitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitorResult" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "err" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodySize" INTEGER NOT NULL,
    "code" INTEGER NOT NULL,
    "codeStatus" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "dnsLookupTime" INTEGER NOT NULL,
    "tcpConnectTime" INTEGER NOT NULL,
    "tlsHandshakeTime" INTEGER NOT NULL,
    "timeToFirstByte" INTEGER NOT NULL,
    "totalTime" INTEGER NOT NULL,
    "certExpiryDays" INTEGER NOT NULL,
    "certCommonName" TEXT NOT NULL,

    CONSTRAINT "MonitorResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Monitor_name_key" ON "Monitor"("name");
