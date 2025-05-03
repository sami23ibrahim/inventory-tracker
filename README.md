# Inventory Tracker

A real-time inventory tracking system with Slack notifications.

## Local Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your local environment variables (use `.env.example` as a template)
4. Start the development server:
   ```bash
   npm start
   ```
5. Start the notification server:
   ```bash
   node slack-notify-server.js
   ```

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Slack Configuration
REACT_APP_SLACK_WEBHOOK_URL=your_slack_webhook_url

# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server Configuration
REACT_APP_NOTIFICATION_SERVER_URL=http://localhost:4000
```

## Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in the Vercel dashboard
4. Deploy!

The application will be automatically deployed when you push to your main branch.

## Features

- Real-time inventory tracking
- Slack notifications for low stock
- Mobile-friendly interface
- Secure PIN protection for rooms
- Image upload support
- Search functionality
