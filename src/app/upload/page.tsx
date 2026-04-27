import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { MemeUploadForm } from "~/components/meme/meme-upload-form";

export default async function UploadPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-extrabold">
        Upload your current mood
      </h1>
      <MemeUploadForm />
    </main>
  );
}
