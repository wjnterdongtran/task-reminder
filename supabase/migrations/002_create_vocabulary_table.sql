-- Create vocabulary table for English learning feature
CREATE TABLE IF NOT EXISTS vocabulary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    word TEXT NOT NULL,
    ipa TEXT DEFAULT '',
    meaning TEXT DEFAULT '',
    usage TEXT DEFAULT '',
    cultural_context TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_favorite BOOLEAN DEFAULT FALSE,
    review_count INTEGER DEFAULT 0,
    last_reviewed_at TIMESTAMPTZ
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_vocabulary_word ON vocabulary(word);
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id ON vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_is_favorite ON vocabulary(is_favorite);

-- Enable Row Level Security
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own vocabulary
CREATE POLICY "Users can view own vocabulary" ON vocabulary
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy: Users can insert their own vocabulary
CREATE POLICY "Users can insert own vocabulary" ON vocabulary
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own vocabulary
CREATE POLICY "Users can update own vocabulary" ON vocabulary
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy: Users can delete their own vocabulary
CREATE POLICY "Users can delete own vocabulary" ON vocabulary
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically set user_id on insert
CREATE OR REPLACE FUNCTION set_vocabulary_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id := auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_vocabulary_user_id_trigger
    BEFORE INSERT ON vocabulary
    FOR EACH ROW
    EXECUTE FUNCTION set_vocabulary_user_id();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vocabulary_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vocabulary_timestamp_trigger
    BEFORE UPDATE ON vocabulary
    FOR EACH ROW
    EXECUTE FUNCTION update_vocabulary_timestamp();
