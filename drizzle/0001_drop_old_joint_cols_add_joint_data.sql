-- Drop 30 old nullable joint measurement columns
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_head_joint_1;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_sill_joint_1;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_head_joint_2;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_sill_joint_2;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_head_joint_3;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_sill_joint_3;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_head_joint_4;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_sill_joint_4;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_head_joint_5;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_sill_joint_5;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_head_joint_6;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_sill_joint_6;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_head_joint_7;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_sill_joint_7;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_head_joint_8;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_sill_joint_8;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_head_joint_9;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_sill_joint_9;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_head_joint_10;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_sill_joint_10;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_head_joint_11;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_sill_joint_11;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_head_joint_12;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_sill_joint_12;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_head_joint_13;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_sill_joint_13;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_head_joint_14;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_sill_joint_14;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_head_joint_15;
ALTER TABLE measurements DROP COLUMN IF EXISTS level_to_sill_joint_15;

-- Drop per-lite boundary columns (now computed from jointData at render time)
ALTER TABLE glass_lites DROP COLUMN IF EXISTS left_head;
ALTER TABLE glass_lites DROP COLUMN IF EXISTS left_sill;
ALTER TABLE glass_lites DROP COLUMN IF EXISTS right_head;
ALTER TABLE glass_lites DROP COLUMN IF EXISTS right_sill;
ALTER TABLE glass_lites DROP COLUMN IF EXISTS top_square;
ALTER TABLE glass_lites DROP COLUMN IF EXISTS bottom_square;
ALTER TABLE glass_lites DROP COLUMN IF EXISTS square_corners_note;
ALTER TABLE glass_lites DROP COLUMN IF EXISTS lite_shape;

-- Add jointData JSONB column
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS joint_data text;

-- Push schema update (adds missing columns, won't affect existing data)
