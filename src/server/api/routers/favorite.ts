import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { favorites } from "~/server/db/schema";

export const favoriteRouter = createTRPCRouter({
  toggle: protectedProcedure
    .input(z.object({ memeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.favorites.findFirst({
        where: and(
          eq(favorites.userId, ctx.session.user.id),
          eq(favorites.memeId, input.memeId),
        ),
      });

      if (existing) {
        await ctx.db
          .delete(favorites)
          .where(
            and(
              eq(favorites.userId, ctx.session.user.id),
              eq(favorites.memeId, input.memeId),
            ),
          );

        const count = await ctx.db
          .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
          .from(favorites)
          .where(eq(favorites.memeId, input.memeId));

        return { favorited: false, count: count[0]?.count ?? 0 };
      }

      await ctx.db.insert(favorites).values({
        userId: ctx.session.user.id,
        memeId: input.memeId,
      });

      const count = await ctx.db
        .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
        .from(favorites)
        .where(eq(favorites.memeId, input.memeId));

      return { favorited: true, count: count[0]?.count ?? 0 };
    }),

  listMine: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.favorites.findMany({
        where: eq(favorites.userId, ctx.session.user.id),
        orderBy: (favs, { desc }) => [desc(favs.createdAt)],
        limit: input.limit + 1,
        with: {
          meme: {
            with: {
              memeTags: { with: { tag: true } },
              favorites: { columns: { userId: true } },
              uploader: { columns: { id: true, name: true, image: true } },
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop()!;
        nextCursor = String(nextItem.createdAt.getTime());
      }

      return {
        items: items.map((f) => ({
          id: f.meme.id,
          title: f.meme.title,
          imageUrl: f.meme.imageUrl,
          thumbnailUrl: f.meme.thumbnailUrl,
          tags: f.meme.memeTags.map((mt) => ({ id: mt.tag.id, name: mt.tag.name, slug: mt.tag.slug })),
          favoriteCount: f.meme.favorites.length,
          isFavorited: true,
          uploader: f.meme.uploader,
          createdAt: f.meme.createdAt,
        })),
        nextCursor,
      };
    }),
});
