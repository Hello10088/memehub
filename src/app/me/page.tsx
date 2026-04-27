import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";
import { MemeGrid } from "~/components/meme/meme-grid";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  const myMemes = await api.meme.mine({ limit: 50 });
  const myFavorites = await api.favorite.listMine({ limit: 50 });

  return (
    <HydrateClient>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt=""
              width={64}
              height={64}
              className="size-16 rounded-full"
              unoptimized
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {(session.user.name ?? "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold">{session.user.name}</h1>
            <p className="text-muted-foreground">{session.user.email}</p>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold">
            My Uploads ({myMemes.length})
          </h2>
          <MemeGrid
            memes={myMemes}
            emptyMessage="You haven't uploaded any memes yet."
          />
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">
            My Favorites ({myFavorites.items.length})
          </h2>
          <MemeGrid
            memes={myFavorites.items}
            emptyMessage="You haven't favorited any memes yet."
          />
        </section>
      </main>
    </HydrateClient>
  );
}
