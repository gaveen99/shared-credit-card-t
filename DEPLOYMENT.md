# GitHub Pages Deployment Guide

This app is configured to automatically deploy to GitHub Pages whenever you push to the main branch.

## Setup Instructions

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click on **Settings**
   - Navigate to **Pages** in the left sidebar
   - Under **Source**, select **GitHub Actions**
   - The deployment will start automatically

3. **Access your app:**
   - Once deployed, your app will be available at:
   - `https://<your-username>.github.io/<repository-name>/`
   - The URL will be shown in the Actions tab once deployment completes

## Manual Deployment

You can also trigger a manual deployment:
1. Go to the **Actions** tab in your repository
2. Click on **Deploy to GitHub Pages** workflow
3. Click **Run workflow**

## Local Testing

To test the production build locally:
```bash
npm run build
npm run preview
```

## Notes

- The app uses relative paths (`base: './'`) to work correctly on GitHub Pages
- All data is stored locally in the browser using the Spark KV storage
- Each user's data is private to their browser
- No backend server is required
