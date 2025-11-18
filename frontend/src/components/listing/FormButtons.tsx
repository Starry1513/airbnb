import { Button } from "@/components/ui/button";

interface FormButtonsProps {
  isSubmitting: boolean;
  isEditMode: boolean;
  onCancel: () => void;
}

export function FormButtons({
  isSubmitting,
  isEditMode,
  onCancel,
}: FormButtonsProps) {
  return (
    <div className="flex gap-3 pt-4">
      <Button
        type="submit"
        disabled={isSubmitting}
        className="flex-1"
        size="lg"
      >
        {isSubmitting
          ? isEditMode
            ? "Saving..."
            : "Creating..."
          : isEditMode
            ? "Save Changes"
            : "Create Listing"}
      </Button>
      <Button type="button" onClick={onCancel} variant="outline" size="lg">
        Cancel
      </Button>
    </div>
  );
}
