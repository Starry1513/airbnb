import { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateListingData } from '@/utils/listingValidation';
import { populateFormFromJson, FormSetters } from '@/utils/formPopulation';

interface JSONUploadSectionProps {
  setters: FormSetters;
  setError: (value: string) => void;
  setSuccessMessage: (value: string) => void;
}

export function JSONUploadSection({ setters, setError, setSuccessMessage }: JSONUploadSectionProps) {
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) { setError('Please upload a JSON file (.json)'); return; }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        const validation = validateListingData(jsonData);
        if (!validation.valid) { setError(validation.error || 'Invalid JSON structure'); return; }
        populateFormFromJson(jsonData, setters);
        setError('');
        setSuccessMessage('JSON file loaded successfully! Please review the form and submit.');
      } catch (error) {
        setError(`Failed to parse JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
      <Label htmlFor="json-upload" className="text-base font-semibold">Upload JSON File (Optional)</Label>
      <p className="text-sm text-muted-foreground mb-2">
        Upload a JSON file to automatically fill the form. Use the example file <code className="text-xs bg-background px-1 py-0.5 rounded">2.6.json</code> in the project root.
      </p>
      <Input id="json-upload" type="file" accept=".json" onChange={handleFileUpload} className="cursor-pointer" />
      <p className="text-xs text-muted-foreground">
        The JSON file should contain: title, address, price, thumbnail (optional), and metadata (propertyType, bathrooms, bedrooms, amenities).
      </p>
    </div>
  );
}
