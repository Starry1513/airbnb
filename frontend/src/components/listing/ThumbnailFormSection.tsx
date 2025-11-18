import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ThumbnailFormSectionProps {
  thumbnail: string;
  setThumbnail: (value: string) => void;
}

export function ThumbnailFormSection({
  thumbnail,
  setThumbnail,
}: ThumbnailFormSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="thumbnail">Thumbnail (optional)</Label>
      <Input
        id="thumbnail"
        type="text"
        value={thumbnail}
        onChange={(e) => setThumbnail(e.target.value)}
        placeholder="Image URL, base64 string, or YouTube URL"
      />
      <p className="text-sm text-muted-foreground">
        Supports image URLs, base64 strings, or YouTube video URLs (e.g.,
        https://www.youtube.com/watch?v=...)
      </p>
    </div>
  );
}
