import { Cat } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Cat className="size-4" />
          MemeBox
        </div>
        <p>Your personal meme toolbox. Upload, organize, and share.</p>
      </div>
    </footer>
  );
}
