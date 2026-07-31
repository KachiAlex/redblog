-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL,
    "igUserId" TEXT NOT NULL,
    "igUsername" TEXT NOT NULL,
    "igProfilePic" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "scannedFrom" TEXT NOT NULL DEFAULT 'oauth',
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "igPostId" TEXT NOT NULL,
    "permalink" TEXT NOT NULL,
    "embedHtml" TEXT,
    "embedTitle" TEXT,
    "caption" TEXT,
    "thumbnailUrl" TEXT,
    "videoUrl" TEXT,
    "videoFilePath" TEXT,
    "mediaType" TEXT NOT NULL DEFAULT 'VIDEO',
    "source" TEXT NOT NULL DEFAULT 'oauth',
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPage" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "customDomain" TEXT,
    "themePrimary" TEXT NOT NULL DEFAULT '#ec4899',
    "themeAccent" TEXT NOT NULL DEFAULT '#f97316',
    "themeLayout" TEXT NOT NULL DEFAULT 'grid',
    "title" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "postId" TEXT,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_igUserId_key" ON "Creator"("igUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_igUsername_key" ON "Creator"("igUsername");

-- CreateIndex
CREATE UNIQUE INDEX "Post_igPostId_key" ON "Post"("igPostId");

-- CreateIndex
CREATE INDEX "Post_creatorId_idx" ON "Post"("creatorId");

-- CreateIndex
CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPage_creatorId_key" ON "BlogPage"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPage_slug_key" ON "BlogPage"("slug");

-- CreateIndex
CREATE INDEX "Analytics_creatorId_idx" ON "Analytics"("creatorId");

-- CreateIndex
CREATE INDEX "Analytics_date_idx" ON "Analytics"("date");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPage" ADD CONSTRAINT "BlogPage_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

