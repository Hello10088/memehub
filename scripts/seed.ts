import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import * as schema from "../src/server/db/schema";

const db = drizzle(
  createClient({ url: "file:./db.sqlite" }),
  { schema },
);

const sampleMemes = [
  {
    title: "When the deadline is tomorrow",
    tags: ["加班", "破防", "无语"],
    image: "https://picsum.photos/seed/meme1/400/400",
  },
  {
    title: "Monday morning vibe",
    tags: ["上班", "摸鱼", "装傻"],
    image: "https://picsum.photos/seed/meme2/400/400",
  },
  {
    title: "Thanks boss for the opportunity",
    tags: ["老板", "阴阳怪气", "感谢"],
    image: "https://picsum.photos/seed/meme3/400/400",
  },
  {
    title: "Group project teammate",
    tags: ["学习", "敷衍", "室友"],
    image: "https://picsum.photos/seed/meme4/400/400",
  },
  {
    title: "When someone says let's catch up",
    tags: ["社恐", "拒绝", "敷衍"],
    image: "https://picsum.photos/seed/meme5/400/400",
  },
  {
    title: "HR: We're like a family here",
    tags: ["上班", "阴阳怪气", "老板"],
    image: "https://picsum.photos/seed/meme6/400/400",
  },
  {
    title: "Me in a meeting I didn't need to be in",
    tags: ["无语", "上班", "摸鱼"],
    image: "https://picsum.photos/seed/meme7/400/400",
  },
  {
    title: "When the wifi goes down for 5 seconds",
    tags: ["破防", "生气", "无语"],
    image: "https://picsum.photos/seed/meme8/400/400",
  },
  {
    title: "The teacher when the homework is due",
    tags: ["老师", "催促", "学习"],
    image: "https://picsum.photos/seed/meme9/400/400",
  },
  {
    title: "Valentine's day alone",
    tags: ["情侣", "破防", "社恐"],
    image: "https://picsum.photos/seed/meme10/400/400",
  },
  {
    title: "When you see free food",
    tags: ["开心", "摸鱼", "感谢"],
    image: "https://picsum.photos/seed/meme11/400/400",
  },
  {
    title: "Friend: Can you do me a small favor?",
    tags: ["拒绝", "敷衍", "阴阳怪气"],
    image: "https://picsum.photos/seed/meme12/400/400",
  },
];

async function seed() {
  console.log("Seeding database...");

  // Get first user (if any) to assign as uploader
  const [firstUser] = await db.select().from(schema.users).limit(1);

  if (!firstUser) {
    console.log("No users found. Please sign in first to create a user, then re-run seed.");
    return;
  }

  for (const item of sampleMemes) {
    const memeId = crypto.randomUUID();

    await db.insert(schema.memes).values({
      id: memeId,
      title: item.title,
      description: null,
      imageUrl: item.image,
      thumbnailUrl: item.image,
      mimeType: "image/jpeg",
      size: 102400,
      visibility: "public",
      uploaderId: firstUser.id,
    });

    for (const tagName of item.tags) {
      const slug = tagName.toLowerCase().replace(/\s+/g, "-");
      const [existing] = await db.select().from(schema.tags).where(eq(schema.tags.slug, slug));
      let tagId: string;
      if (!existing) {
        tagId = crypto.randomUUID();
        await db.insert(schema.tags).values({ id: tagId, name: tagName, slug });
      } else {
        tagId = existing.id;
      }
      await db.insert(schema.memeTags).values({ memeId, tagId });
    }

    console.log(`  Created meme: ${item.title}`);
  }

  console.log(`Done! Created ${sampleMemes.length} sample memes.`);
}

seed().catch(console.error);
