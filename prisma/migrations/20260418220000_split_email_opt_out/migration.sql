-- Split emailOptOut into announcementEmailOptOut and discussionEmailOptOut.
-- Preserve existing opt-out values by copying emailOptOut into both new columns.

-- AlterTable
ALTER TABLE "User"
  ADD COLUMN "announcementEmailOptOut" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "discussionEmailOptOut"   BOOLEAN NOT NULL DEFAULT false;

-- Migrate existing opt-out flag to both new columns
UPDATE "User" SET
  "announcementEmailOptOut" = "emailOptOut",
  "discussionEmailOptOut"   = "emailOptOut";

-- Drop old column
ALTER TABLE "User" DROP COLUMN "emailOptOut";
