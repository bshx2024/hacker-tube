import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, schema } from '../db';

export const auth = betterAuth({
  appName: 'HackerTube',
  baseURL: process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.hacker-tube.net',
  trustedOrigins: [
    'https://www.hacker-tube.net',
    'https://hacker-tube.net',
    'http://localhost:3000',
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
  ],
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
      clientId: process.env.GITHUB_CLIENT_ID || 'Ov23li2Xw1JqLbmzFs17',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'afe516dbd8ab787dbae88d6138c88ff6e1fae7e9',
      enabled: true,
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
