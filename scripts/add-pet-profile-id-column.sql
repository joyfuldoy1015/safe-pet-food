ALTER TABLE pet_log_posts ADD COLUMN IF NOT EXISTS pet_profile_id TEXT;

CREATE INDEX IF NOT EXISTS idx_pet_log_posts_pet_profile_id ON pet_log_posts(pet_profile_id);
