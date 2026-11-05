-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "awayTeamName" TEXT,
ADD COLUMN     "homeTeamName" TEXT,
ALTER COLUMN "homeTeamId" DROP NOT NULL,
ALTER COLUMN "awayTeamId" DROP NOT NULL;
