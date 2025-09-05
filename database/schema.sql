-- HealthNavi Database Schema for Supabase
-- This file contains the complete database schema for the HealthNavi application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for Farcaster integration
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    farcaster_id TEXT UNIQUE NOT NULL,
    preferences JSONB DEFAULT '{}',
    queries_history JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Healthcare Providers table
CREATE TABLE healthcare_providers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    specialties TEXT[] DEFAULT '{}',
    insurance_accepted TEXT[] DEFAULT '{}',
    sliding_scale BOOLEAN DEFAULT FALSE,
    phone TEXT,
    website TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aid Programs table
CREATE TABLE aid_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    eligibility TEXT[] DEFAULT '{}',
    application_link TEXT NOT NULL,
    category TEXT NOT NULL,
    state TEXT,
    federal BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Resources table
CREATE TABLE community_resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    address TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    services TEXT[] DEFAULT '{}',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    hours_of_operation JSONB,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Queries table for analytics and personalization
CREATE TABLE user_queries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    intent TEXT,
    results_returned INTEGER DEFAULT 0,
    user_satisfied BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table for users to save providers/programs/resources
CREATE TABLE user_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('provider', 'aid_program', 'resource')),
    item_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

-- Create indexes for better performance
CREATE INDEX idx_healthcare_providers_specialties ON healthcare_providers USING GIN (specialties);
CREATE INDEX idx_healthcare_providers_insurance ON healthcare_providers USING GIN (insurance_accepted);
CREATE INDEX idx_healthcare_providers_location ON healthcare_providers (latitude, longitude);
CREATE INDEX idx_aid_programs_category ON aid_programs (category);
CREATE INDEX idx_aid_programs_state ON aid_programs (state);
CREATE INDEX idx_community_resources_type ON community_resources (type);
CREATE INDEX idx_community_resources_services ON community_resources USING GIN (services);
CREATE INDEX idx_community_resources_location ON community_resources (latitude, longitude);
CREATE INDEX idx_user_queries_user_id ON user_queries (user_id);
CREATE INDEX idx_user_queries_created_at ON user_queries (created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_healthcare_providers_updated_at BEFORE UPDATE ON healthcare_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_aid_programs_updated_at BEFORE UPDATE ON aid_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_resources_updated_at BEFORE UPDATE ON community_resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE aid_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Public read access for healthcare data
CREATE POLICY "Public read access for healthcare_providers" ON healthcare_providers FOR SELECT USING (true);
CREATE POLICY "Public read access for aid_programs" ON aid_programs FOR SELECT USING (true);
CREATE POLICY "Public read access for community_resources" ON community_resources FOR SELECT USING (true);

-- User-specific policies
CREATE POLICY "Users can read their own data" ON users FOR SELECT USING (auth.uid()::text = farcaster_id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid()::text = farcaster_id);
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (auth.uid()::text = farcaster_id);

CREATE POLICY "Users can read their own queries" ON user_queries FOR SELECT USING (user_id IN (SELECT id FROM users WHERE farcaster_id = auth.uid()::text));
CREATE POLICY "Users can insert their own queries" ON user_queries FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE farcaster_id = auth.uid()::text));

CREATE POLICY "Users can manage their own favorites" ON user_favorites FOR ALL USING (user_id IN (SELECT id FROM users WHERE farcaster_id = auth.uid()::text));

-- Insert sample data
INSERT INTO healthcare_providers (name, address, specialties, insurance_accepted, sliding_scale, phone, website) VALUES
('Community Health Center', '123 Main St, Springfield, IL 62701', ARRAY['Family Medicine', 'Pediatrics'], ARRAY['Medicaid', 'Medicare', 'Sliding Scale'], true, '(555) 123-4567', 'https://communityhealthcenter.org'),
('Free Clinic of Springfield', '456 Oak Ave, Springfield, IL 62702', ARRAY['General Medicine', 'Mental Health'], ARRAY['Uninsured', 'Sliding Scale'], true, '(555) 987-6543', null),
('Springfield Dental Care', '789 Elm St, Springfield, IL 62703', ARRAY['General Dentistry', 'Oral Surgery'], ARRAY['Medicaid', 'Delta Dental', 'Sliding Scale'], true, '(555) 456-7890', null),
('Mercy Hospital Emergency', '1000 Hospital Dr, Springfield, IL 62704', ARRAY['Emergency Medicine', 'Trauma Care'], ARRAY['Medicaid', 'Medicare', 'All Insurance'], false, '(555) 111-0000', 'https://mercyhospital.org'),
('Women''s Health Clinic', '555 Women''s Way, Springfield, IL 62705', ARRAY['Obstetrics', 'Gynecology', 'Family Planning'], ARRAY['Medicaid', 'Sliding Scale'], true, '(555) 222-3333', 'https://womenshealthclinic.org');

INSERT INTO aid_programs (name, description, eligibility, application_link, category, federal) VALUES
('SNAP (Food Stamps)', 'Supplemental Nutrition Assistance Program provides monthly benefits to buy groceries', ARRAY['Income below 130% of federal poverty level', 'US citizenship or eligible immigrant'], 'https://www.fns.usda.gov/snap', 'Food Assistance', true),
('LIHEAP (Energy Assistance)', 'Low Income Home Energy Assistance Program helps with heating and cooling costs', ARRAY['Income below 150% of federal poverty level', 'Received shut-off notice'], 'https://www.acf.hhs.gov/ocs/programs/liheap', 'Utility Assistance', true),
('GoodRx Prescription Discounts', 'Free prescription discount program offering up to 80% off medications', ARRAY['No income requirements', 'Available to all US residents'], 'https://www.goodrx.com', 'Prescription Assistance', false),
('WIC (Women, Infants, Children)', 'Nutrition program for pregnant women, new mothers, and children under 5', ARRAY['Income below 185% of federal poverty level', 'Pregnant, breastfeeding, or have children under 5'], 'https://www.fns.usda.gov/wic', 'Food Assistance', true),
('Medicaid', 'Health insurance program for low-income individuals and families', ARRAY['Income below 138% of federal poverty level', 'US citizenship or eligible immigrant'], 'https://www.medicaid.gov', 'Health Insurance', true);

INSERT INTO community_resources (name, type, address, contact_info, services) VALUES
('Springfield Food Bank', 'Food Bank', '321 Charity Ln, Springfield, IL 62704', '(555) 111-2222', ARRAY['Emergency food boxes', 'Free meals', 'Nutrition education']),
('Hope Shelter', 'Homeless Shelter', '654 Hope St, Springfield, IL 62705', '(555) 333-4444', ARRAY['Emergency housing', 'Case management', 'Job training']),
('Salvation Army Thrift Store', 'Clothing Assistance', '987 Donation Dr, Springfield, IL 62706', '(555) 555-6666', ARRAY['Free clothing vouchers', 'Household items', 'Emergency assistance']),
('United Way Resource Center', 'Multi-Service Center', '111 Unity Blvd, Springfield, IL 62707', '(555) 777-8888', ARRAY['Information and referral', 'Financial counseling', 'Emergency assistance']),
('Springfield Public Library', 'Community Center', '222 Library Ave, Springfield, IL 62708', '(555) 999-0000', ARRAY['Computer access', 'Job search assistance', 'Educational programs', 'Free WiFi']);
