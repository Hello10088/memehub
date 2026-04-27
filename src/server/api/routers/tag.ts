import { z } from "zod";
import { eq, like, desc, sql } from "drizzle-orm";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { tags, memeTags } from "~/server/db/schema";

export const tagRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        query: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
          count: sql<number>`COUNT(${memeTags.memeId})`.mapWith(Number),
        })
        .from(tags)
        .leftJoin(memeTags, eq(tags.id, memeTags.tagId))
        .groupBy(tags.id)
        .orderBy(desc(sql`COUNT(${memeTags.memeId})`))
        .limit(input.limit);

      return result;
    }),

  search: publicProcedure
    .input(z.object({ query: z.string().min(1).max(50) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.tags.findMany({
        where: like(tags.name, `%${input.query}%`),
        limit: 10,
      });
    }),
});
