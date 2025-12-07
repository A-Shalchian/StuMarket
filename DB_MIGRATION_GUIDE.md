# Database Migration Guide - Connections System

## Running the Migration

### Option 1: Using Supabase Dashboard (Recommended)
1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select your StuMarket project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy and paste the contents of `db/connections-setup.sql`
6. Click **Run**
7. Confirm the migration completed successfully

### Option 2: Using Supabase CLI
```bash
# Install Supabase CLI (if not already installed)
npm install -g @supabase/cli

# Login to Supabase
supabase login

# Link your project
supabase link

# Run the migration
supabase db push
```

## Migration Contents

The `connections-setup.sql` file creates:

### Tables
- **connections**: Stores friend request and connection relationships between users

### Columns
- `id`: Unique identifier (UUID)
- `requester_id`: User who sent the request
- `receiver_id`: User who received the request
- `status`: 'pending', 'accepted', or 'blocked'
- `created_at`: Timestamp of request creation
- `updated_at`: Timestamp of last update

### Constraints
- **no_self_connection**: Prevents users from connecting to themselves
- **unique_connection**: Prevents duplicate connections between same users
- **Foreign Keys**: References auth.users table with CASCADE delete

### Indexes (for performance)
- `idx_connections_requester`: Fast lookup by requester
- `idx_connections_receiver`: Fast lookup by receiver  
- `idx_connections_status`: Fast lookup by status
- `idx_connections_created_at`: Fast lookup by date

### Security (Row Level Security)
- Users can only view their own connections
- Users can only create requests as the requester
- Users can only update requests they received
- Users can only delete their own connections
- Automatic trigger updates `updated_at` timestamp

## Verification

After running the migration, verify it worked:

```sql
-- Check if connections table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'connections';

-- Check if RLS is enabled
SELECT * FROM pg_tables 
WHERE tablename = 'connections' 
AND rowsecurity = true;

-- Test inserting a connection (replace with real user IDs)
INSERT INTO connections (requester_id, receiver_id, status) 
VALUES ('user-uuid-1', 'user-uuid-2', 'pending');

-- Verify it was inserted
SELECT * FROM connections LIMIT 1;
```

## Rollback (if needed)

If you need to remove the connections system:

```sql
-- Drop the connections table
DROP TABLE IF EXISTS connections CASCADE;

-- This will also drop the associated function and trigger
```

## Troubleshooting

### Error: "relation 'connections' already exists"
- The table already exists from a previous migration
- Either use `DROP TABLE connections CASCADE;` first, or modify the migration to use `CREATE TABLE IF NOT EXISTS`

### Error: "permission denied for schema public"
- Check that your database role has proper permissions
- Verify you're logged in as an admin user in Supabase

### RLS policies not working
- Verify RLS is enabled: `ALTER TABLE connections ENABLE ROW LEVEL SECURITY;`
- Check the policies exist: `SELECT * FROM pg_policies WHERE tablename = 'connections';`

## Next Steps

After migration:
1. Start your Next.js development server: `npm run dev`
2. Navigate to `http://localhost:3000/connections`
3. Log in with a test account
4. Test the friend request functionality
5. Verify messages can be sent between friends
