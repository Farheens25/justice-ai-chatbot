-- SQL Script to update the users table in Supabase
-- Run this script in the Supabase SQL Editor

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS aadhar_id VARCHAR(20),
ADD COLUMN IF NOT EXISTS department VARCHAR(255),
ADD COLUMN IF NOT EXISTS badge_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS specialization VARCHAR(100),
ADD COLUMN IF NOT EXISTS bar_council VARCHAR(255),
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending';

-- Case tracking + FIR workflow fields for citizen complaint flow
ALTER TABLE public.cases
  ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE public.cases
ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS complainant_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS complainant_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS complainant_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS complainant_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS complainant_pincode VARCHAR(10),
ADD COLUMN IF NOT EXISTS nearest_police_station VARCHAR(255),
ADD COLUMN IF NOT EXISTS evidence_text TEXT,
ADD COLUMN IF NOT EXISTS proof_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS case_strength INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fir_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS fir_registered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS progress_notes TEXT,
ADD COLUMN IF NOT EXISTS complaint_summary TEXT,
ADD COLUMN IF NOT EXISTS complaint_form_json JSONB,
ADD COLUMN IF NOT EXISTS case_analysis JSONB,
ADD COLUMN IF NOT EXISTS escalation_draft TEXT,
ADD COLUMN IF NOT EXISTS incident_date DATE,
ADD COLUMN IF NOT EXISTS incident_time TIME,
ADD COLUMN IF NOT EXISTS accused_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS witness_details TEXT,
ADD COLUMN IF NOT EXISTS urgency_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_protected_case BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS protected_reference_id VARCHAR(60);

CREATE INDEX IF NOT EXISTS idx_cases_protected_reference_id ON public.cases(protected_reference_id);

CREATE INDEX IF NOT EXISTS idx_cases_tracking_id ON public.cases(tracking_id);
