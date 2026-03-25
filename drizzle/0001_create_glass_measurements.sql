-- drizzle/0001_create_glass_measurements.sql

CREATE TABLE IF NOT EXISTS measurements (
  id SERIAL PRIMARY KEY,
  job_name VARCHAR(255) NOT NULL,
  frame_number VARCHAR(50) NOT NULL,
  number_of_lites INTEGER NOT NULL,
  mullion_width DECIMAL(8,4),
  
  -- Glass bite (per side)
  glass_bite_top DECIMAL(8,4) NOT NULL DEFAULT 0.375,
  glass_bite_bottom DECIMAL(8,4) NOT NULL DEFAULT 0.375,
  glass_bite_left DECIMAL(8,4) NOT NULL DEFAULT 0.375,
  glass_bite_right DECIMAL(8,4) NOT NULL DEFAULT 0.375,
  
  -- Glass type (frame level - propagates to lites)
  glass_type VARCHAR(50) NOT NULL DEFAULT 'Annealed',
  glass_thickness VARCHAR(20) NOT NULL DEFAULT '1/4"',
  
  -- Frame notes (edge work, polish, etc.)
  frame_notes TEXT,
  
  -- Photo URL (stored in cloud storage)
  photo_url VARCHAR(500),
  photo_caption TEXT,
  
  -- Level line measurements
  level_to_head_left DECIMAL(8,4) NOT NULL,
  level_to_head_right DECIMAL(8,4) NOT NULL,
  level_to_sill_left DECIMAL(8,4) NOT NULL,
  level_to_sill_right DECIMAL(8,4) NOT NULL,
  
  -- Plumb line measurements
  plumb_to_left_head DECIMAL(8,4) NOT NULL,
  plumb_to_right_head DECIMAL(8,4) NOT NULL,
  plumb_to_left_sill DECIMAL(8,4) NOT NULL,
  plumb_to_right_sill DECIMAL(8,4) NOT NULL,
  
  -- Calculated dimensions
  total_frame_width DECIMAL(8,4) NOT NULL,
  total_frame_height DECIMAL(8,4) NOT NULL,
  is_out_of_square BOOLEAN NOT NULL DEFAULT false,
  squareness_variance DECIMAL(8,4),
  
  -- Metadata
  measured_by VARCHAR(100) NOT NULL,
  measured_at TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS glass_lites (
  id SERIAL PRIMARY KEY,
  measurement_id INTEGER NOT NULL REFERENCES measurements(id) ON DELETE CASCADE,
  lite_number INTEGER NOT NULL,
  width DECIMAL(8,4) NOT NULL,
  height DECIMAL(8,4) NOT NULL,
  width_decimal DECIMAL(10,6) NOT NULL,
  height_decimal DECIMAL(10,6) NOT NULL,
  
  -- Glass properties (inherited from frame, but can override)
  glass_type VARCHAR(50),
  glass_thickness VARCHAR(20),
  
  -- Lite-specific notes (edge work, holes, cutouts)
  lite_notes TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_name ON measurements(job_name);
CREATE INDEX IF NOT EXISTS idx_frame_number ON measurements(frame_number);
CREATE INDEX IF NOT EXISTS idx_measured_at ON measurements(measured_at);
CREATE INDEX IF NOT EXISTS idx_measurement_id ON glass_lites(measurement_id);
CREATE INDEX IF NOT EXISTS idx_lite_number ON glass_lites(lite_number);
