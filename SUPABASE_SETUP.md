# Supabase Integration Setup

## Prerequisites
1. A Supabase project with a `requests` table
2. Supabase project URL and anon key

## Setup Instructions

### 1. Create Environment Variables
Create a `.env.local` file in your project root with your Supabase credentials:

```bash
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Update Supabase Configuration
Edit `src/lib/supabase.ts` and replace the placeholder values:

```typescript
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
```

### 3. Database Schema
The dashboard expects a `requests` table with the following structure:

```sql
CREATE TABLE requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  request_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  description TEXT,
  category TEXT,
  assigned_to TEXT,
  resolution_notes TEXT
);
```

### 4. Row Level Security (RLS)
Enable RLS and create policies for your `requests` table:

```sql
-- Enable RLS
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Create policy for reading requests (adjust as needed)
CREATE POLICY "Allow read access to requests" ON requests
  FOR SELECT USING (true);

-- Create policy for inserting requests
CREATE POLICY "Allow insert access to requests" ON requests
  FOR INSERT WITH CHECK (true);

-- Create policy for updating requests
CREATE POLICY "Allow update access to requests" ON requests
  FOR UPDATE USING (true);

-- Create policy for deleting requests
CREATE POLICY "Allow delete access to requests" ON requests
  FOR DELETE USING (true);
```

## Features

### Dashboard Analytics
- **Total Requests**: Count of all requests
- **Status Breakdown**: Pending, In Progress, Completed, Cancelled
- **Category Analysis**: Requests grouped by category
- **Priority Distribution**: Requests by priority level
- **Recent Requests**: Latest 10 requests with details

### Data Visualization
- Progress bars for category distribution
- Color-coded status indicators
- Priority badges with appropriate colors
- Real-time data refresh capability

### Error Handling
- Connection error display with retry option
- Loading states during data fetch
- Graceful fallback for missing data

## Usage

1. **Admin Login**: Use `admin@cloudwick.com` / `password`
2. **Dashboard Tab**: View real-time analytics from Supabase
3. **Knowledge Base Tab**: Access Merton FOI application
4. **Refresh Button**: Manually refresh dashboard data

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and anon key
- Check that RLS policies allow access
- Ensure the `requests` table exists with correct schema

### Data Not Loading
- Check browser console for errors
- Verify Supabase project is active
- Confirm table has data for testing

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Check that environment variables are properly set
- Verify TypeScript types match your database schema
