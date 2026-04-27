import { z } from "zod";
import { and, eq, like, or, desc, sql, inArray, type SQL } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { memes, tags, memeTags, favorites } from "~/server/db/schema";

export const memeRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        tag: z.string().optional(),
        query: z.string().optional(),
        sort: z.enum(["latest", "popular"]).default("latest"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions: SQL<unknown>[] = [eq(memes.visibility, "public")];

      if (input.tag) {
        conditions.push(
          inArray(
            memes.id,
            ctx.db
              .select({ memeId: memeTags.memeId })
              .from(memeTags)
              .innerJoin(tags, eq(tags.id, memeTags.tagId))
              .where(eq(tags.slug, input.tag)),
          ),
        );
      }

      if (input.query) {
        const q = `%${input.query}%`;
        conditions.push(
          or(
            like(memes.title, q),
            like(memes.description, q),
            inArray(
              memes.id,
              ctx.db
                .select({ memeId: memeTags.memeId })
                .from(memeTags)
                .innerJoin(tags, eq(tags.id, memeTags.tagId))
                .where(like(tags.name, q)),
            ),
          )!,
        );
      }

      if (input.cursor && input.sort === "latest") {
        conditions.push(sql`${memes.createdAt} < ${Number(input.cursor)}`);
      }

      const whereClause = and(...conditions);
      const orderBy = input.sort === "latest"
        ? desc(memes.createdAt)
        : desc(sql`(SELECT COUNT(*) FROM ${favorites} WHERE ${favorites.memeId} = ${memes.id})`);

      const items = await ctx.db.query.memes.findMany({
        where: whereClause,
        orderBy,
        limit: input.limit + 1,
        with: {
          uploader: { columns: { id: true, name: true, image: true } },
          memeTags: { with: { tag: true } },
          favorites: { columns: { userId: true } },
        },
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop()!;
        nextCursor = input.sort === "latest"
          ? String(nextItem.createdAt.getTime())
          : nextItem.id;
      }

      const session = ctx.session;

      return {
        items: items.map((m) => ({
          id: m.id,
          title: m.title,
          imageUrl: m.imageUrl,
          thumbnailUrl: m.thumbnailUrl,
          tags: m.memeTags.map((mt) => ({ id: mt.tag.id, name: mt.tag.name, slug: mt.tag.slug })),
          favoriteCount: m.favorites.length,
          isFavorited: session ? m.favorites.some((f) => f.userId === session.user.id) : false,
          uploader: m.uploader,
          createdAt: m.createdAt,
        })),
        nextCursor,
      };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const meme = await ctx.db.query.memes.findFirst({
        where: eq(memes.id, input.id),
        with: {
          uploader: { columns: { id: true, name: true, image: true } },
          memeTags: { with: { tag: true } },
          favorites: { columns: { userId: true } },
        },
      });

      if (!meme) return null;

      if (meme.visibility === "private" && meme.uploaderId !== ctx.session?.user?.id) {
        return null;
      }

      const session = ctx.session;

      return {
        id: meme.id,
        title: meme.title,
        description: meme.description,
        imageUrl: meme.imageUrl,
        thumbnailUrl: meme.thumbnailUrl,
        mimeType: meme.mimeType,
        width: meme.width,
        height: meme.height,
        size: meme.size,
        visibility: meme.visibility,
        tags: meme.memeTags.map((mt) => ({ id: mt.tag.id, name: mt.tag.name, slug: mt.tag.slug })),
        favoriteCount: meme.favorites.length,
        isFavorited: session ? meme.favorites.some((f) => f.userId === session.user.id) : false,
        uploader: meme.uploader,
        createdAt: meme.createdAt,
        updatedAt: meme.updatedAt,
      };
    }),

  mine: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.memes.findMany({
        where: eq(memes.uploaderId, ctx.session.user.id),
        orderBy: desc(memes.createdAt),
        limit: input.limit,
        with: {
          uploader: { columns: { id: true, name: true, image: true } },
          memeTags: { with: { tag: true } },
          favorites: { columns: { userId: true } },
        },
      });

      return items.map((m) => ({
        id: m.id,
        title: m.title,
        imageUrl: m.imageUrl,
        thumbnailUrl: m.thumbnailUrl,
        visibility: m.visibility,
        tags: m.memeTags.map((mt) => ({ id: mt.tag.id, name: mt.tag.name, slug: mt.tag.slug })),
        favoriteCount: m.favorites.length,
        isFavorited: m.favorites.some((f) => f.userId === ctx.session.user.id),
        uploader: m.uploader,
        createdAt: m.createdAt,
      }));
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(80),
        description: z.string().max(300).optional(),
        imageUrl: z.string().min(1).max(2048),
        thumbnailUrl: z.string().max(2048).optional(),
        fileKey: z.string().max(512).optional(),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
        size: z.number().int().positive().max(10 * 1024 * 1024),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
        visibility: z.enum(["public", "private", "unlisted"]).default("public"),
        tags: z.array(z.string().min(1).max(20)).max(10).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const memeId = crypto.randomUUID();

      await ctx.db.insert(memes).values({
        id: memeId,
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        thumbnailUrl: input.thumbnailUrl,
        fileKey: input.fileKey,
        mimeType: input.mimeType,
        size: input.size,
        width: input.width,
        height: input.height,
        visibility: input.visibility,
        uploaderId: ctx.session.user.id,
      });

      if (input.tags.length > 0) {
        for (const tagName of input.tags) {
          const slug = tagName.toLowerCase().replace(/\s+/g, "-");
          const existing = await ctx.db.query.tags.findFirst({ where: eq(tags.slug, slug) });
          const tagId = existing?.id ?? crypto.randomUUID();

          if (!existing) {
            await ctx.db.insert(tags).values({ id: tagId, name: tagName, slug });
          }

          await ctx.db.insert(memeTags).values({ memeId, tagId });
        }
      }

      return { id: memeId };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const meme = await ctx.db.query.memes.findFirst({
        where: eq(memes.id, input.id),
      });

      if (!meme) throw new Error("Meme not found");
      if (meme.uploaderId !== ctx.session.user.id) throw new Error("Forbidden");

      await ctx.db.delete(memes).where(eq(memes.id, input.id));
    }),
});
