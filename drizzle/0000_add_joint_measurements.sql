-- Migration: add joint height measurements for multi-lite frames
-- Adds per-boundary height measurements and per-lite square status

-- Add joint measurement columns to measurements table (existing table)
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_head_joint_1 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_sill_joint_1 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_head_joint_2 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_sill_joint_2 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_head_joint_3 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_sill_joint_3 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_head_joint_4 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_sill_joint_4 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_head_joint_5 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_sill_joint_5 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_head_joint_6 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_sill_joint_6 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_head_joint_7 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_sill_joint_7 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_head_joint_8 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_sill_joint_8 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_head_joint_9 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_sill_joint_9 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_head_joint_10 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_sill_joint_10 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_head_joint_11 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_sill_joint_11 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_head_joint_12 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_sill_joint_12 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_head_joint_13 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_sill_joint_13 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_head_joint_14 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_sill_joint_14 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_head_joint_15 decimal(8,4);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS level_to_sill_joint_15 decimal(8,4);

-- Add per-lite boundary and square columns to glass_lites table (existing table)
ALTER TABLE glass_lites ADD COLUMN IF NOT EXISTS left_head decimal(8,4);
ALTER TABLE glass_lites ADD COLUMN IF NOT EXISTS left_sill decimal(8,4);
ALTER TABLE glass_lites ADD COLUMN IF NOT EXISTS right_head decimal(8,4);
ALTER TABLE glass_lites ADD COLUMN IF NOT EXISTS right_sill decimal(8,4);
ALTER TABLE glass_lites ADD COLUMN IF NOT EXISTS top_square boolean NOT NULL DEFAULT true;
ALTER TABLE glass_lites ADD COLUMN IF NOT EXISTS bottom_square boolean NOT NULL DEFAULT true;
ALTER TABLE glass_lites ADD COLUMN IF NOT EXISTS square_corners_note varchar(100);
ALTER TABLE glass_lites ADD COLUMN IF NOT EXISTS lite_shape varchar(30) NOT NULL DEFAULT 'rectangular';
