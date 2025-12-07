-- Create connections table for friend relationships
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure users aren't connected to themselves
  CONSTRAINT no_self_connection CHECK (requester_id != receiver_id),
  
  -- Prevent duplicate connections in both directions
  CONSTRAINT unique_connection UNIQUE (
    LEAST(requester_id, receiver_id),
    GREATEST(requester_id, receiver_id)
  )
);

-- Create indexes for faster lookups
CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_receiver ON connections(receiver_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_created_at ON connections(created_at DESC);

-- Enable RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own connections
CREATE POLICY "Users can view their connections"
  ON connections
  FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Allow users to insert connection requests
CREATE POLICY "Users can create connection requests"
  ON connections
  FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Allow users to update connection requests they received
CREATE POLICY "Users can update connections they received"
  ON connections
  FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Allow users to delete their own connections
CREATE POLICY "Users can delete their connections"
  ON connections
  FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on every update
CREATE TRIGGER update_connections_updated_at_trigger
  BEFORE UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION update_connections_updated_at();
