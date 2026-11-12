import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import path from 'path';
import fs from 'fs';
import * as schema from './schema';

const isVercel = !!process.env.VERCEL;
const defaultDbPath = isVercel
  ? path.join('/tmp', 'hackertube.db')
  : path.join(process.cwd(), 'data', 'hackertube.db');

const dbUrl = process.env.DATABASE_URL || `file:${defaultDbPath}`;

if (dbUrl.startsWith('file:')) {
  const filePath = dbUrl.replace(/^file:/, '');
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  } catch {}
}

const client = createClient({
  url: dbUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

// Auto-bootstrap tables on local SQLite or remote Turso/LibSQL
try {
  client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS "user" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "email_verified" integer DEFAULT 0 NOT NULL,
        "image" text,
        "role" text DEFAULT 'user' NOT NULL,
        "plan" text DEFAULT 'free' NOT NULL,
        "credits" integer DEFAULT 5 NOT NULL,
        "created_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
        "updated_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
        "utm_source" text DEFAULT ''
      );
      CREATE TABLE IF NOT EXISTS "session" (
        "id" text PRIMARY KEY NOT NULL,
        "expires_at" integer NOT NULL,
        "token" text NOT NULL UNIQUE,
        "created_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
        "updated_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
        "ip_address" text,
        "user_agent" text,
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS "account" (
        "id" text PRIMARY KEY NOT NULL,
        "account_id" text NOT NULL,
        "provider_id" text NOT NULL,
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "access_token" text,
        "refresh_token" text,
        "id_token" text,
        "access_token_expires_at" integer,
        "refresh_token_expires_at" integer,
        "scope" text,
        "password" text,
        "created_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
        "updated_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
      );
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" text PRIMARY KEY NOT NULL,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expires_at" integer NOT NULL,
        "created_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
        "updated_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
      );
      CREATE TABLE IF NOT EXISTS "bookmark" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "video_id" text NOT NULL,
        "created_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
      );
      CREATE TABLE IF NOT EXISTS "order" (
        "id" text PRIMARY KEY NOT NULL,
        "order_no" text NOT NULL UNIQUE,
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "user_email" text,
        "status" text NOT NULL,
        "amount" integer NOT NULL,
        "currency" text DEFAULT 'USD' NOT NULL,
        "product_id" text,
        "product_name" text,
        "payment_type" text DEFAULT 'subscription',
        "payment_provider" text NOT NULL,
        "transaction_id" text,
        "paid_at" integer,
        "created_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
        "updated_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
      );
      CREATE TABLE IF NOT EXISTS "subscription" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
        "plan" text DEFAULT 'pro' NOT NULL,
        "status" text NOT NULL,
        "payment_provider" text NOT NULL,
        "subscription_id" text UNIQUE,
        "current_period_start" integer,
        "current_period_end" integer,
        "cancel_at_period_end" integer DEFAULT 0,
        "created_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
        "updated_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
      );
      CREATE TABLE IF NOT EXISTS "system_setting" (
        "key" text PRIMARY KEY NOT NULL,
        "value" text NOT NULL,
        "updated_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
      );
      CREATE TABLE IF NOT EXISTS "generated_note" (
        "id" text PRIMARY KEY NOT NULL,
        "slug" text UNIQUE,
        "youtube_id" text NOT NULL UNIQUE,
        "youtube_url" text NOT NULL,
        "title" text NOT NULL,
        "channel_title" text DEFAULT 'Technical Speaker' NOT NULL,
        "thumbnail_url" text,
        "topic" text DEFAULT 'AI & Machine Learning' NOT NULL,
        "duration" text DEFAULT '30:00',
        "executive_summary" text NOT NULL,
        "core_mental_models_json" text NOT NULL,
        "key_timestamps_json" text NOT NULL,
        "math_derivations_json" text NOT NULL,
        "hn_debates_json" text NOT NULL,
        "faqs_json" text,
        "obsidian_markdown" text,
        "status" text DEFAULT 'published' NOT NULL,
        "word_count" integer DEFAULT 0 NOT NULL,
        "creator_user_id" text,
        "creator_email" text,
        "view_count" integer DEFAULT 1 NOT NULL,
        "created_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
        "updated_at" integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
      );
    `).then(() => {
      // Safe non-blocking column migration for existing tables
      client.execute('ALTER TABLE "generated_note" ADD COLUMN "slug" text;').catch(() => {});
    }).catch(() => {});
  } catch {}

export const db = drizzle(client, { schema });
export { schema };
