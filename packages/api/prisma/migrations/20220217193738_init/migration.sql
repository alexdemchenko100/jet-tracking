-- CreateTable
CREATE TABLE "Monitor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT E'active',
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT E'GET',
    "frequency" INTEGER NOT NULL,
    "bodyType" TEXT DEFAULT E'',
    "body" TEXT,
    "headers" TEXT,
    "queryParams" TEXT,
    "cookies" TEXT,
    "followRedirects" INTEGER DEFAULT 0,
    "timeout" INTEGER DEFAULT 30,
    "locations" TEXT DEFAULT E'',
    "assertions" JSONB DEFAULT '{}',
    "notifyEmail" TEXT,
    "env" JSONB DEFAULT '{}',

    CONSTRAINT "Monitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitorResult" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "err" TEXT NOT NULL,
    "headers" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodyJson" JSONB,
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
    "monitorId" TEXT NOT NULL,

    CONSTRAINT "MonitorResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Monitor_name_key" ON "Monitor"("name");

-- AddForeignKey
ALTER TABLE "MonitorResult" ADD CONSTRAINT "MonitorResult_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "Monitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
