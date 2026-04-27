import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-extrabold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-primary px-6 py-2.5 font-medium text-primary-foreground transition hover:opacity-90"
      >
        Back to Home
      </Link>
    </main>
  );
}
