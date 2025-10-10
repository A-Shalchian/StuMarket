# College Marketplace Project Conventions

## 🚨 Critical Rules

### Database & SQL Files
- **NEVER create new SQL files** like `storage-setup.sql`, `fix-marketplace-rls.sql`, etc.
- **ALWAYS add SQL changes to existing files:**
  - Schema changes, tables, functions → `db/db.sql`
  - Row Level Security policies → `db/rls.sql`
- Keep all database setup consolidated in these two files

### File Organization
- Don't scatter related code across multiple files
- Keep things consolidated unless there's a clear architectural reason to split

## Project Structure

### App Directory (Next.js App Router)
- `app/` - Next.js 13+ app directory with file-based routing
- Client components in separate files with `-client.tsx` suffix
- Server components are default

### Database
- Using Supabase (PostgreSQL)
- Two main SQL files: `db/db.sql` and `db/rls.sql`
- All database changes must go through these files

### Components
- `components/` - Reusable React components
- Organized by feature (auth, verification, etc.)

## Active Features
- Google One Tap authentication
- Email verification system
- User dashboard with notifications
- Marketplace/listings functionality

## Tech Stack
- Next.js (App Router)
- TypeScript
- Supabase (PostgreSQL + Auth + Storage)
- React

## General Guidelines
- When in doubt, ask before creating new files
- Consolidate related functionality
- Follow existing patterns in the codebase
