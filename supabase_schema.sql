
-- Create Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  user_id UUID -- Optional: link to auth.users.id
);

-- Enable Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all for now (if not using auth yet)
-- OR specific to user_id:
CREATE POLICY "Users can see their own transactions"
ON transactions FOR ALL
USING (auth.uid() = user_id);

-- If you want public access for a demo:
-- CREATE POLICY "Public Access" ON transactions FOR ALL USING (true);
