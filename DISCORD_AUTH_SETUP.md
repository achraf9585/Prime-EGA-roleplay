# Discord OAuth Setup Guide

## ✅ What I've Done

I've set up Discord OAuth authentication for your EGA Roleplay website. Users can now login with their Discord accounts!

## 📋 What You Need to Do

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "EGA Roleplay" (or whatever you want)
4. Click "Create"

### 2. Configure OAuth2

1. In your Discord application, go to **OAuth2** → **General**
2. Copy your **Client ID** and **Client Secret** (keep these safe!)
3. Add Redirect URLs:
   - For development: `http://localhost:3000/api/auth/callback/discord`
   - For production: `https://yourdomain.com/api/auth/callback/discord`

### 3. Create Environment File

Create a file named `.env.local` in your project root with:

```env
# Discord OAuth
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_secret_here
```

**To generate NEXTAUTH_SECRET**, run in terminal:
```bash
openssl rand -base64 32
```

Or use this online: https://generate-secret.vercel.app/32

### 4. Restart Dev Server

```bash
npm run dev
```

## 🎮 How It Works

1. **User clicks "Connect with Discord"** → Redirects to Discord OAuth
2. **User authorizes** → Discord sends user data back
3. **User is logged in** → Shows avatar and username in header
4. **User can logout** → Clears session

## 📦 What Was Installed

- `next-auth` - Authentication library for Next.js

## 📁 Files Created/Modified

- ✅ `src/app/api/auth/[...nextauth]/route.ts` - Auth API endpoint
- ✅ `src/components/AuthProvider.tsx` - Session provider
- ✅ `src/components/Header.tsx` - Updated with login/logout
- ✅ `src/app/layout.tsx` - Wrapped with AuthProvider

## 🔒 Security Features

- ✅ Client Secret stored in environment variables (never exposed to client)
- ✅ Secure session management with NextAuth
- ✅ CSRF protection built-in
- ✅ OAuth2 standard flow

## 🎨 UI Features

- Shows "Connect with Discord" button when logged out
- Shows user avatar and name when logged in
- Shows logout button when logged in
- Discord brand colors (purple/blue)

## 🚀 For Production

When deploying:
1. Update `NEXTAUTH_URL` to your production domain
2. Add production redirect URL in Discord app settings
3. Keep your secrets secure!

## 📝 User Data You Get

From Discord OAuth:
- User ID
- Username
- Avatar
- Email (if requested)
- Discriminator (#1234)

You can extend this in `src/app/api/auth/[...nextauth]/route.ts`

## 🛠️ Troubleshooting

**"Invalid redirect_uri"**
- Make sure redirect URL in Discord app matches exactly
- Check NEXTAUTH_URL is correct

**"Client authentication failed"**
- Double-check Client ID and Secret
- Make sure .env.local is in project root

**Session not persisting**
- Clear browser cookies
- Restart dev server after changing .env.local

## 🎯 Next Steps (Optional)

You can:
- Store user data in a database
- Check if user is in your Discord server
- Assign roles based on Discord roles
- Create protected pages (require login)

Need help? Let me know!
