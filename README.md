# Jaanu Boutique E-Commerce Platform

A full-featured e-commerce platform for ethnic Indian wear, built with modern web technologies.

## Project info

**URL**: https://lovable.dev/projects/542ead0d-9065-4312-b44c-dcb2a4e3099e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/542ead0d-9065-4312-b44c-dcb2a4e3099e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **UI Library:** shadcn-ui components
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Backend:** Supabase (PostgreSQL database, Authentication, Storage)
- **Routing:** React Router v6
- **Form Handling:** React Hook Form with Zod validation
- **Notifications:** Sonner (toast notifications)

## Features

### Customer Features
- Browse products by category and subcategory
- Advanced search with filters (price, color, size, fabric, occasion)
- Product detail pages with image galleries
- Shopping cart with persistent storage
- Wishlist/Favorites
- User authentication (signup, login, password reset)
- Order history
- User profile management

### Admin Features
- Admin dashboard with analytics
- Product management (add, edit, delete)
- Inventory tracking and management
- User activity monitoring
- Bulk product operations

## Project Structure

```
src/
├── components/        # Reusable UI components
├── contexts/          # React Context providers
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries (Supabase client)
├── pages/             # Page components
├── services/          # API and business logic services
├── styles/            # Global styles and design tokens
├── types/             # TypeScript type definitions
└── utils/             # Helper functions
```

## Database Setup

See `SUPABASE_SETUP.md` for detailed database setup instructions.
Run the SQL scripts in the following order:
1. `RUN_THIS_IN_SUPABASE.sql` - Main database schema
2. `FIX_ADMIN_RLS.sql` - Row Level Security policies
3. `SQL_ADMIN_CHECK_FUNCTION.sql` - Admin utility functions

## Environment Variables

Create a `.env` file in the root directory with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How can I deploy this project?

### Option 1: Lovable
Simply open [Lovable](https://lovable.dev/projects/542ead0d-9065-4312-b44c-dcb2a4e3099e) and click on Share -> Publish.

### Option 2: Vercel / Netlify
See `DEPLOYMENT.md` for detailed deployment instructions to Vercel or Netlify.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
