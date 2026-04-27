import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Allowed: jpg, png, webp, gif" },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10MB" },
      { status: 400 },
    );
  }

  const ext = file.type.split("/")[1] ?? "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadsDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  const url = `/uploads/${filename}`;

  return NextResponse.json({
    url,
    mimeType: file.type,
    size: file.size,
  });
}
