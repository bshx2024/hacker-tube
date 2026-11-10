import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, schema } from '../db';

export const auth = betterAuth({
  appName: 'HackerTube',
  baseURL: process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.hacker-tube.net',
  secret: process.env.AUTH_SECRET || 'hackertube-auth-secret-change-in-production-2026',
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
        required: false,
      },
      plan: {
        type: 'string',
        defaultValue: 'free',
        required: false,
      },
      credits: {
        type: 'number',
        defaultValue: 5,
        required: false,
      },
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      enabled: !!process.env.GITHUB_CLIENT_ID,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
});
