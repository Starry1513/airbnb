import { Button } from "@/components/ui/button";

interface ListingActionsProps {
  listingId: number;
  published: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

export function ListingActions({
  listingId: _listingId,
  published,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
}: ListingActionsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button onClick={onEdit} variant="outline" size="sm" className="flex-1">
          Edit
        </Button>
        <Button onClick={onDelete} variant="destructive" size="sm" className="flex-1">
          Delete
        </Button>
      </div>
      {published ? (
        <Button onClick={onUnpublish} variant="secondary" size="sm" className="w-full">
          Unpublish
        </Button>
      ) : (
        <Button onClick={onPublish} variant="default" size="sm" className="w-full">
          Publish
        </Button>
      )}
    </div>
  );
}
