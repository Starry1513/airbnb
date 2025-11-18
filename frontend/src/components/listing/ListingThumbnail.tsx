import { isYouTubeUrl, getYouTubeEmbedUrl } from "../../utils/youtube";

interface ListingThumbnailProps {
  thumbnail: string | null;
  title: string;
}

export function ListingThumbnail({ thumbnail, title }: ListingThumbnailProps) {
  if (!thumbnail) {
    return (
      <div className="w-full h-48 bg-muted flex items-center justify-center">
        <span className="text-muted-foreground">No image</span>
      </div>
    );
  }

  if (isYouTubeUrl(thumbnail)) {
    return (
      <div className="w-full h-48 overflow-hidden">
        <iframe
          src={getYouTubeEmbedUrl(thumbnail) || ""}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="w-full h-48 overflow-hidden bg-muted flex items-center justify-center">
      <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
    </div>
  );
}
