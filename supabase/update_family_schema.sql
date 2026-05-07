-- Run this in your Supabase SQL Editor to update the FamilyApplications table
-- This adds the new fields needed for the updated Family Application form.

ALTER TABLE "FamilyApplications" 
ADD COLUMN IF NOT EXISTS family_name TEXT,
ADD COLUMN IF NOT EXISTS family_picture TEXT,
ADD COLUMN IF NOT EXISTS family_nationality TEXT,
ADD COLUMN IF NOT EXISTS family_description TEXT,
ADD COLUMN IF NOT EXISTS family_goals TEXT,
ADD COLUMN IF NOT EXISTS family_members JSONB;

-- If you want to delete the old columns, you can optionally run:
-- ALTER TABLE "FamilyApplications" DROP COLUMN ic_name, DROP COLUMN age, DROP COLUMN experience, DROP COLUMN backstory;
