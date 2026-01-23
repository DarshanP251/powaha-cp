-- CreateEnum
CREATE TYPE "CpStatus" AS ENUM ('APPLIED', 'ACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "CpApplicationStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "community_partners" (
    "cp_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "status" "CpStatus" NOT NULL,
    "aoo" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_partners_pkey" PRIMARY KEY ("cp_id")
);

-- CreateTable
CREATE TABLE "cp_applications" (
    "application_id" TEXT NOT NULL,
    "cp_id" TEXT NOT NULL,
    "application_data" JSONB NOT NULL,
    "status" "CpApplicationStatus" NOT NULL,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cp_applications_pkey" PRIMARY KEY ("application_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "cp_id" TEXT,
    "created_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "cp_leads" (
    "lead_id" TEXT NOT NULL,
    "cp_id" TEXT NOT NULL,
    "church_name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "notes" TEXT,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cp_leads_pkey" PRIMARY KEY ("lead_id")
);

-- CreateTable
CREATE TABLE "incentives" (
    "incentive_id" TEXT NOT NULL,
    "cp_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "incentives_pkey" PRIMARY KEY ("incentive_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "cp_applications" ADD CONSTRAINT "cp_applications_cp_id_fkey" FOREIGN KEY ("cp_id") REFERENCES "community_partners"("cp_id") ON DELETE RESTRICT ON UPDATE CASCADE;
