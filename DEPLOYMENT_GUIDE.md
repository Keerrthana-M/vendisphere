# VendiSphere — Deployment Guide

> **Read every step carefully before clicking anything.** This guide walks you from
> zero to a live, publicly accessible application using free tiers of GitHub,
> MongoDB Atlas, Render, and Vercel.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Create the GitHub Repository](#2-create-the-github-repository)
3. [Verify and Copy the GitHub URL](#3-verify-and-copy-the-github-url)
4. [Create and Configure MongoDB Atlas](#4-create-and-configure-mongodb-atlas)
5. [Deploy the Backend to Render](#5-deploy-the-backend-to-render)
6. [Set Backend Environment Variables in Render](#6-set-backend-environment-variables-in-render)
7. [Deploy the Frontend to Vercel](#7-deploy-the-frontend-to-vercel)
8. [Set the Frontend API Base URL in Vercel](#8-set-the-frontend-api-base-url-in-vercel)
9. [Configure CORS and Cookie Authentication](#9-configure-cors-and-cookie-authentication)
10. [Test the Live Application](#10-test-the-live-application)
11. [Troubleshooting Deployment Failures](#11-troubleshooting-deployment-failures)

---

## 1. Architecture Overview

```
Browser (Vercel CDN)
  └── React/Vite Frontend  → https://vendisphere.vercel.app
         │  HTTPS requests to /api/*
         ▼
  Node.js/Express Backend  → https://vendisphere-api.onrender.com
         │  Mongoose queries
         ▼
  MongoDB Atlas (M0 Free)  → cloud.mongodb.com
```

| Layer    | Platform      | Cost | Notes                              |
|----------|---------------|------|------------------------------------|
| Frontend | Vercel        | Free | Automatic CDN, CI/CD on push       |
| Backend  | Render        | Free | Spins down after 15 min idle       |
| Database | MongoDB Atlas | Free | M0 cluster, 512 MB                 |
| Source   | GitHub        | Free | Triggers auto-deploy on push       |

> ⚠️ **Render free tier** cold-starts after 15 minutes of inactivity. The first request
> after a cold start can take 20–50 seconds. This is normal. Upgrade to a paid Render
> plan to avoid cold starts.

---

## 2. Create the GitHub Repository

> Skip this step if a remote named `origin` already points to your intended repository.

### Step 2.1 — Sign in to GitHub

1. Open **https://github.com** in your browser.
2. Click **Sign in** (top-right) and log in with your account `Keerrthana-M`.

### Step 2.2 — Create a new repository

1. Click the **+** icon (top-right) → **New repository**.
2. Fill in the form:
   - **Repository name**: `vendisphere`
   - **Description**: `VendiSphere — Smart Multi-Vendor E-Commerce & Vendor Intelligence Platform`
   - **Visibility**: ✅ Public *(required for free Vercel and Render deploys)*
   - **Initialize this repository with**: ❌ Leave ALL boxes **unchecked** (no README, no .gitignore, no license — the project already has these)
3. Click **Create repository**.
4. GitHub will show you an empty repository page. **Copy the HTTPS URL** shown in the "…or push an existing repository from the command line" section.
   It will look like: `https://github.com/Keerrthana-M/vendisphere.git`

### Step 2.3 — Add the remote and push

Open PowerShell in the project root (`C:\Users\Keerrthana M\Desktop\Multi vendor platform`) and run:

```powershell
# Add GitHub as the remote origin
git remote add origin https://github.com/Keerrthana-M/vendisphere.git

# Verify before pushing
git remote -v

# Stage all deployment-ready changes
git add -A

# Commit
git commit -m "feat: prepare VendiSphere for cloud deployment (Render + Vercel + Atlas)"

# Push to GitHub
git push -u origin master
```

When prompted, sign in with your GitHub username and a **Personal Access Token** (not your password):

- Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
- Click **Generate new token (classic)**
- Give it a name like `vendisphere-deploy`
- Check the `repo` scope only
- Click **Generate token** — copy it immediately (you won't see it again)
- Paste the token as the password when Git prompts you

---

## 3. Verify and Copy the GitHub URL

After pushing, go to: `https://github.com/Keerrthana-M/vendisphere`

You should see all project files including `client/`, `server/`, `README.md`, etc.

✅ This is your shareable GitHub repository URL.

---

## 4. Create and Configure MongoDB Atlas

> If you already have an Atlas cluster, skip to Step 4.4.

### Step 4.1 — Create an Atlas account

1. Go to **https://cloud.mongodb.com** and click **Try Free**.
2. Sign up or log in.

### Step 4.2 — Create a free M0 cluster

1. Click **Build a Database** → choose **M0 FREE**.
2. Select a **Cloud Provider** (AWS recommended) and a nearby **Region**.
3. Name your cluster (e.g. `VendiSphereCluster`).
4. Click **Create Deployment**.

### Step 4.3 — Create a database user

When prompted (or via **Database Access** → **Add New Database User**):
- **Username**: `vendisphere_admin` *(or any name you choose)*
- **Password**: Use the **Auto-generate** button — **save this password somewhere safe**
- **Roles**: `Read and write to any database`
- Click **Add User**.

### Step 4.4 — Allow network access from Render

1. In Atlas, go to **Network Access** → **Add IP Address**.
2. Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   > This is required because Render uses dynamic IPs. You can restrict it later with a static IP on a paid plan.
3. Click **Confirm**.

### Step 4.5 — Get your connection string

1. In Atlas, click **Connect** on your cluster → **Drivers**.
2. Select **Node.js** and version **5.5 or later**.
3. Copy the connection string. It looks like:
   ```
   mongodb+srv://vendisphere_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password.
5. Add your database name before the `?`:
   ```
   mongodb+srv://vendisphere_admin:YOURPASSWORD@cluster0.xxxxx.mongodb.net/vendisphere?retryWrites=true&w=majority
   ```
6. **Save this string** — you will paste it into Render in the next step.

> ⚠️ **NEVER paste this string into chat, source code, or commit it to Git.**

---

## 5. Deploy the Backend to Render

### Step 5.1 — Create a Render account

1. Go to **https://render.com** and click **Get Started for Free**.
2. Sign up with your GitHub account (easiest — Render gets access to your repos).

### Step 5.2 — Create a new Web Service

1. In the Render dashboard, click **New** → **Web Service**.
2. Connect your GitHub account if prompted.
3. Find and select your `vendisphere` repository.
4. Fill in the settings:
   - **Name**: `vendisphere-api`
   - **Region**: Same region as your Atlas cluster
   - **Branch**: `master`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
5. Click **Create Web Service** — do NOT deploy yet (set env vars first in Step 6).

---

## 6. Set Backend Environment Variables in Render

In your `vendisphere-api` service dashboard:

1. Click **Environment** in the left sidebar.
2. Click **Add Environment Variable** for each of the following:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` *(Render's default — leave as is)* |
| `MONGO_URI` | Your full Atlas connection string |
| `JWT_SECRET` | A strong random string (e.g. 32+ random characters) |
| `CLIENT_URL` | Your Vercel frontend URL (set this **after** Vercel deploy in Step 7) |
| `AI_API_KEY` | Your Gemini API key, or leave blank for local AI engine |

> 💡 To generate a strong `JWT_SECRET`, run in PowerShell:
> ```powershell
> [System.Web.Security.Membership]::GeneratePassword(40, 5)
> ```
> Or use: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx

3. Click **Save Changes** → then click **Deploy** (or trigger a manual deploy).
4. Watch the logs. You should see:
   ```
   [VendiSphere Backend] Server running on port 10000
   [MongoDB] Connected successfully: cluster0.xxxxx.mongodb.net
   ```

### Step 6.1 — Note your Render backend URL

After deploy, Render shows a URL like: `https://vendisphere-api.onrender.com`

**Save this URL** — you need it for Vercel and for the `CLIENT_URL` env var.

### Step 6.2 — Verify the health endpoint

Open in your browser:
```
https://vendisphere-api.onrender.com/api/health
```
Expected response:
```json
{ "status": "ok", "message": "VendiSphere API Server Running" }
```

---

## 7. Deploy the Frontend to Vercel

### Step 7.1 — Create a Vercel account

1. Go to **https://vercel.com** and click **Sign Up**.
2. Sign up with your GitHub account.

### Step 7.2 — Import the project

1. In the Vercel dashboard, click **Add New** → **Project**.
2. Select your `vendisphere` GitHub repository.
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client` *(important — click Edit and change this)*
   - **Build Command**: `npm run build` *(auto-detected)*
   - **Output Directory**: `dist` *(auto-detected)*
   - **Install Command**: `npm install` *(auto-detected)*
4. **Do NOT deploy yet** — set env vars first (Step 8).

---

## 8. Set the Frontend API Base URL in Vercel

Before clicking Deploy in Step 7:

1. In the Vercel project setup screen, scroll to **Environment Variables**.
2. Add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://vendisphere-api.onrender.com/api` |

3. Click **Deploy**.
4. Vercel builds the project (takes ~1 minute). When done, you get a URL like:
   `https://vendisphere.vercel.app`

---

## 9. Configure CORS and Cookie Authentication

### Update CORS on Render

Now that you have your Vercel URL, go back to Render:

1. **Environment** → update `CLIENT_URL` → paste your Vercel URL (e.g. `https://vendisphere.vercel.app`)
2. Click **Save Changes** → Render will redeploy automatically.

### Cookie / Credentials note

The backend uses **HTTP-only cookies** (`credentials: 'include'`). For this to work across
different domains (Vercel ↔ Render), you need:

- ✅ Both domains must be **HTTPS** (both Vercel and Render use HTTPS by default)
- ✅ The CORS `credentials: true` is already configured in `server.js`
- ✅ The frontend uses `credentials: 'include'` in `api.js`

> ⚠️ If you use a **custom domain** on Vercel, update `CLIENT_URL` on Render to that domain.

---

## 10. Test the Live Application

Open your Vercel URL (e.g. `https://vendisphere.vercel.app`) and verify each flow:

### Authentication
- [ ] Register a new customer account
- [ ] Log in as customer — should redirect to marketplace
- [ ] Log in as admin: `admin@vendisphere.com` / `admin123`
- [ ] Log in as vendor: `techvendor@vendisphere.com` / `password123`

### Customer Flow
- [ ] Browse products on the Marketplace
- [ ] Filter by category and price range
- [ ] Use the AI Shopping Assistant
- [ ] Add a product to the cart
- [ ] Complete checkout
- [ ] View order history and status

### Vendor Flow
- [ ] View Vendor Dashboard
- [ ] Create a new product listing
- [ ] Check Inventory Intelligence
- [ ] View vendor analytics

### Admin Flow
- [ ] View Admin Dashboard analytics
- [ ] Approve/reject a pending vendor
- [ ] View all users and orders

---

## 11. Troubleshooting Deployment Failures

### ❌ Render build fails: "Cannot find module"

**Cause**: `node_modules` is in `.gitignore` and not pushed (correct).
**Fix**: Make sure **Build Command** is `npm install` in Render settings, not blank.

---

### ❌ `[MongoDB] Connection Error`

**Cause**: Wrong `MONGO_URI` or Atlas IP whitelist not set.
**Fix**:
1. Double-check the connection string in Render's environment variables.
2. In MongoDB Atlas → **Network Access** → ensure `0.0.0.0/0` is listed.

---

### ❌ `CORS: origin not allowed` in browser console

**Cause**: `CLIENT_URL` in Render is not set or doesn't match the exact Vercel URL.
**Fix**:
1. Copy the Vercel URL exactly (no trailing slash).
2. Set it as `CLIENT_URL` in Render environment variables.
3. Trigger a Render redeploy.

---

### ❌ 404 on page refresh in the deployed frontend

**Cause**: Vercel tried to serve a server-side route for a React Router path.
**Fix**: The `client/vercel.json` file handles this — ensure it is committed and pushed.

---

### ❌ Login works but subsequent requests fail (401)

**Cause**: Cross-site cookies are blocked.
**Check**:
1. Both Vercel URL and Render URL must be `https://`
2. `credentials: 'include'` must be in fetch calls (already set in `api.js`)
3. CORS must have `credentials: true` (already set in `server.js`)

---

### ❌ Render backend returns 502 or times out (first request)

**Cause**: Free-tier Render services spin down after 15 minutes of inactivity.
**Fix**: Wait 30–60 seconds and try again — the cold start is normal on the free tier.
To avoid this, upgrade to a Render Starter plan ($7/month).

---

### ❌ `git push` rejected — "failed to push some refs"

**Cause**: Remote repository has commits your local doesn't have.
**Fix** (safe — never force push):
```powershell
git pull origin master --rebase
git push origin master
```

---

*Guide last updated: 2026-10-26*
