// instrument.js — Sentry initialization
// MUST be the very first import in index.js (before express, mongoose, etc.)
// This file is intentionally kept separate so it can be easily found and updated.

import * as Sentry from '@sentry/node'

Sentry.init({
  // DSN is loaded from SENTRY_DSN env var
  // Set this in Render dashboard → momentdrop-backend → Environment
  // Get your DSN from: sentry.io → Project → Settings → Client Keys
  dsn: process.env.SENTRY_DSN,

  // Traces every request to measure performance
  tracesSampleRate: 1.0,

  // Only enable in production — skip in test/dev to avoid noise
  enabled: process.env.NODE_ENV === 'production',
})
