-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "SearchProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "price" INTEGER,
    "beds" DOUBLE PRECISION,
    "baths" DOUBLE PRECISION,
    "sqft" INTEGER,
    "acres" DOUBLE PRECISION,
    "url" TEXT,
    "source" TEXT NOT NULL,
    "description" TEXT,
    "facts" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceSighting" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "discoveredAt" TIMESTAMP(3) NOT NULL,
    "facts" JSONB,

    CONSTRAINT "SourceSighting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingScore" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "coverage" DOUBLE PRECISION NOT NULL,
    "criteria" JSONB NOT NULL,
    "scoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Listing_city_state_idx" ON "Listing"("city", "state");

-- CreateIndex
CREATE INDEX "SourceSighting_listingId_idx" ON "SourceSighting"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_profileId_listingId_key" ON "Reaction"("profileId", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingScore_profileId_listingId_key" ON "ListingScore"("profileId", "listingId");

-- AddForeignKey
ALTER TABLE "SourceSighting" ADD CONSTRAINT "SourceSighting_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "SearchProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingScore" ADD CONSTRAINT "ListingScore_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "SearchProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingScore" ADD CONSTRAINT "ListingScore_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

