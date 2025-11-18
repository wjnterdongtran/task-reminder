# Task Reminder Manager

A modern, feature-rich task management application built with Next.js and Supabase. Manage your tasks with automatic reminders, drag-and-drop organization, and real-time synchronization across devices.

## Features

- **Kanban Board View**: Organize tasks across four status columns (Init, Working, Need Taking Care, Done)
- **List View**: Alternative view with search and filtering capabilities
- **Drag & Drop**: Intuitive task management with drag-and-drop reordering
- **Automatic Reminders**: Set custom reminder intervals for tasks
- **Real-time Sync**: Changes instantly reflected across all devices (via Supabase)
- **Markdown Support**: Rich text descriptions with markdown formatting
- **Multi-language**: Support for English and Vietnamese
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode UI**: Modern, sleek dark interface

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **Drag & Drop**: @dnd-kit
- **Markdown**: SimpleMDE Editor
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A Supabase account and project

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd task-reminder
pnpm install
```

### 2. Set Up Supabase

Follow the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:

1. Create a Supabase project
2. Get your credentials
3. Create the database tables (using MCP or SQL Editor)
4. Configure environment variables

**Quick setup**:

```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your-project-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Create Database Tables

**Option A: Using Supabase MCP** (Recommended - see [docs/SUPABASE_MCP_SETUP.md](./docs/SUPABASE_MCP_SETUP.md))

**Option B: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/schema.sql`
4. Execute the SQL

### 4. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
task-reminder/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── KanbanBoard.tsx   # Kanban board view
│   ├── TaskList.tsx      # List view
│   ├── TaskForm.tsx      # Create/edit form
│   ├── MigrationHelper.tsx # localStorage to Supabase migration
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── useTasks.ts       # Task CRUD operations
│   └── useTaskReminder.ts # Reminder system
├── lib/                   # Utilities and services
│   └── supabase/         # Supabase integration
│       ├── client.ts     # Supabase client config
│       ├── taskService.ts # Task database operations
│       └── database.types.ts # TypeScript types
├── types/                 # TypeScript type definitions
│   └── task.ts           # Task types and enums
├── locales/              # i18n translations
│   ├── en.json           # English
│   └── vi.json           # Vietnamese
├── supabase/             # Database schema and migrations
│   └── schema.sql        # Database schema
└── docs/                 # Documentation
    ├── SUPABASE_MCP_SETUP.md
    └── MIGRATION.md
```

## Data Migration

If you have existing tasks in localStorage, the app will automatically offer to migrate them to Supabase on first launch. See [docs/MIGRATION.md](./docs/MIGRATION.md) for details.

## Task Status Flow

1. **Init (0)**: New tasks start here
2. **Working (1)**: Tasks you're actively working on
3. **Need Taking Care (2)**: Tasks requiring attention (triggered by reminders)
4. **Done (3)**: Completed tasks

## Reminder System

- Set custom reminder intervals (in hours) for each task
- The system checks every 60 seconds
- When the interval passes, tasks automatically move to "Need Taking Care" status
- Interval resets when manually changing task status

## Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Never commit `.env.local` to version control!

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to add these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Security Considerations

The current setup uses public access for development. For production:

1. **Enable Authentication**: Add Supabase Auth
2. **Update RLS Policies**: Restrict access to authenticated users
3. **Add User Context**: Associate tasks with user IDs
4. **Secure Keys**: Never expose service_role key in client code

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for production security guidelines.

## Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Supabase MCP Setup](./docs/SUPABASE_MCP_SETUP.md)
- [Migration Guide](./docs/MIGRATION.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions:
- Check the documentation in the `docs/` folder
- Review the [Supabase documentation](https://supabase.com/docs)
- Create an issue in this repository
