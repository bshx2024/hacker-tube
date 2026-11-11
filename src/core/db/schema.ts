import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// SQLite "now" in epoch milliseconds
const sqliteNowMs = sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`;

export const user = sqliteTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'boolean' })
      .default(false)
      .notNull(),
    image: text('image'),
    role: text('role').default('user').notNull(),
    plan: text('plan').default('free').notNull(), // 'free' | 'pro'
    credits: integer('credits').default(5).notNull(), // Monthly free AI derivations
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .$onUpdate(() => new Date())
      .notNull(),
    utmSource: text('utm_source').default(''),
  },
  (table) => [
    index('idx_user_email').on(table.email),
    index('idx_user_created_at').on(table.createdAt),
  ]
);

export const session = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('idx_session_user_expires').on(table.userId, table.expiresAt),
    index('idx_session_token').on(table.token),
  ]
);

export const account = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', {
      mode: 'timestamp_ms',
    }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', {
      mode: 'timestamp_ms',
    }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('idx_account_user_id').on(table.userId),
    index('idx_account_provider_account').on(table.providerId, table.accountId),
  ]
);

export const verification = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('idx_verification_identifier').on(table.identifier),
  ]
);

export const bookmark = sqliteTable(
  'bookmark',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    videoId: text('video_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .notNull(),
  },
  (table) => [
    index('idx_bookmark_user_video').on(table.userId, table.videoId),
  ]
);

export const order = sqliteTable(
  'order',
  {
    id: text('id').primaryKey(),
    orderNo: text('order_no').unique().notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    userEmail: text('user_email'),
    status: text('status').notNull(), // 'created' | 'paid' | 'failed' | 'refunded'
    amount: integer('amount').notNull(), // amount in cents (e.g. 400 = $4.00)
    currency: text('currency').default('USD').notNull(),
    productId: text('product_id'),
    productName: text('product_name'),
    paymentType: text('payment_type').default('subscription'), // 'subscription' | 'one_time'
    paymentProvider: text('payment_provider').notNull(), // 'stripe' | 'creem' | 'paypal'
    transactionId: text('transaction_id'),
    paidAt: integer('paid_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('idx_order_user_status').on(table.userId, table.status),
    index('idx_order_transaction_provider').on(table.transactionId, table.paymentProvider),
  ]
);

export const subscription = sqliteTable(
  'subscription',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .unique()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    plan: text('plan').default('pro').notNull(),
    status: text('status').notNull(), // 'active' | 'cancelled' | 'past_due'
    paymentProvider: text('payment_provider').notNull(), // 'stripe' | 'creem'
    subscriptionId: text('subscription_id').unique(),
    currentPeriodStart: integer('current_period_start', { mode: 'timestamp_ms' }),
    currentPeriodEnd: integer('current_period_end', { mode: 'timestamp_ms' }),
    cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('idx_subscription_user').on(table.userId),
    index('idx_subscription_id').on(table.subscriptionId),
  ]
);

export const systemSetting = sqliteTable('system_setting', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sqliteNowMs)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const generatedNote = sqliteTable(
  'generated_note',
  {
    id: text('id').primaryKey(),
    youtubeId: text('youtube_id').unique().notNull(),
    youtubeUrl: text('youtube_url').notNull(),
    title: text('title').notNull(),
    channelTitle: text('channel_title').default('Technical Speaker').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    topic: text('topic').default('AI & Machine Learning').notNull(),
    duration: text('duration').default('30:00'),
    executiveSummary: text('executive_summary').notNull(),
    coreMentalModelsJson: text('core_mental_models_json').notNull(), // JSON string array
    keyTimestampsJson: text('key_timestamps_json').notNull(), // JSON string array of KeyTimestamp
    mathDerivationsJson: text('math_derivations_json').notNull(), // JSON string array of MathDerivation
    hnDebatesJson: text('hn_debates_json').notNull(), // JSON string array of HnDebate
    faqsJson: text('faqs_json'), // JSON string array of LectureFaq
    obsidianMarkdown: text('obsidian_markdown'),
    status: text('status').default('published').notNull(), // 'published' | 'private'
    wordCount: integer('word_count').default(0).notNull(),
    creatorUserId: text('creator_user_id'),
    creatorEmail: text('creator_email'),
    viewCount: integer('view_count').default(1).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sqliteNowMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('idx_generated_note_yt').on(table.youtubeId),
    index('idx_generated_note_status').on(table.status),
    index('idx_generated_note_creator').on(table.creatorUserId),
  ]
);
