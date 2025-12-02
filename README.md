# Shared Card Tracker

A modern web app for tracking shared credit card expenses between household and personal purchases. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Multiple Entry Methods:**
  - Manual entry with categorization
  - Single SMS parsing for quick transaction entry
  - Batch SMS import for processing multiple transactions at once

- **Smart SMS Parsing:**
  - Automatically extracts amount and merchant from bank SMS messages
  - Supports multiple currencies (USD, LKR, INR, EUR, GBP)
  - Works with various bank SMS formats

- **Transaction Categories:**
  - Household expenses (split with parents)
  - Personal expenses (your own)
  - Cash deposits tracking

- **Real-time Balance:**
  - See who owes whom at a glance
  - Visual indicators for positive/negative balances
  - Separate totals for household spending and deposits

- **Persistent Storage:**
  - All data stored locally in your browser
  - No account or login required
  - Privacy-first design

## Live Demo

[View on GitHub Pages](https://your-username.github.io/your-repo-name/)

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying to GitHub Pages.

Quick steps:
1. Push code to GitHub
2. Enable GitHub Pages with GitHub Actions
3. Access your deployed app

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Technology Stack

- React 19
- TypeScript
- Tailwind CSS v4
- Vite
- shadcn/ui components
- Framer Motion
- Phosphor Icons

## License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
