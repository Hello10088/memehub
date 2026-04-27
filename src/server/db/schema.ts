import { relations, sql } from "drizzle-orm";
import { index, primaryKey, sqliteTableCreator } from "drizzle-orm/sqlite-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `memehub_cat_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    name: d.text({ length: 256 }),
    createdById: d
      .text({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ],
);

// ── MemeBox tables ──

export const memes = createTable(
  "meme",
  (d) => ({
    id: d.text({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: d.text({ length: 80 }).notNull(),
    description: d.text({ length: 300 }),
    imageUrl: d.text({ length: 2048 }).notNull(),
    thumbnailUrl: d.text({ length: 2048 }),
    fileKey: d.text({ length: 512 }),
    mimeType: d.text({ length: 50 }).notNull(),
    size: d.integer().notNull(),
    width: d.integer(),
    height: d.integer(),
    visibility: d.text({ enum: ["public", "private", "unlisted"] }).default("public").notNull(),
    uploaderId: d
      .text({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("meme_uploader_idx").on(t.uploaderId),
    index("meme_created_at_idx").on(t.createdAt),
    index("meme_visibility_idx").on(t.visibility),
  ],
);

export const tags = createTable(
  "tag",
  (d) => ({
    id: d.text({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: d.text({ length: 20 }).notNull().unique(),
    slug: d.text({ length: 30 }).notNull().unique(),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  }),
  (t) => [index("tag_slug_idx").on(t.slug)],
);

export const memeTags = createTable(
  "meme_tag",
  (d) => ({
    memeId: d
      .text({ length: 36 })
      .notNull()
      .references(() => memes.id, { onDelete: "cascade" }),
    tagId: d
      .text({ length: 36 })
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  }),
  (t) => [
    primaryKey({ columns: [t.memeId, t.tagId] }),
    index("meme_tag_tag_idx").on(t.tagId),
  ],
);

export const favorites = createTable(
  "favorite",
  (d) => ({
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    memeId: d
      .text({ length: 36 })
      .notNull()
      .references(() => memes.id, { onDelete: "cascade" }),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  }),
  (t) => [primaryKey({ columns: [t.userId, t.memeId] })],
);

// ── Relations ──

export const memesRelations = relations(memes, ({ one, many }) => ({
  uploader: one(users, { fields: [memes.uploaderId], references: [users.id] }),
  memeTags: many(memeTags),
  favorites: many(favorites),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  memeTags: many(memeTags),
}));

export const memeTagsRelations = relations(memeTags, ({ one }) => ({
  meme: one(memes, { fields: [memeTags.memeId], references: [memes.id] }),
  tag: one(tags, { fields: [memeTags.tagId], references: [tags.id] }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  meme: one(memes, { fields: [favorites.memeId], references: [memes.id] }),
}));

// ── Auth tables ──

export const users = createTable("user", (d) => ({
  id: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.text({ length: 255 }),
  email: d.text({ length: 255 }).notNull(),
  emailVerified: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  image: d.text({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  memes: many(memes),
  favorites: many(favorites),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.text({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.text({ length: 255 }).notNull(),
    providerAccountId: d.text({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.text({ length: 255 }),
    scope: d.text({ length: 255 }),
    id_token: d.text(),
    session_state: d.text({ length: 255 }),
  }),
  (t) => [
    primaryKey({
      columns: [t.provider, t.providerAccountId],
    }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.text({ length: 255 }).notNull().primaryKey(),
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.integer({ mode: "timestamp" }).notNull(),
  }),
  (t) => [index("session_userId_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.text({ length: 255 }).notNull(),
    token: d.text({ length: 255 }).notNull(),
    expires: d.integer({ mode: "timestamp" }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);
