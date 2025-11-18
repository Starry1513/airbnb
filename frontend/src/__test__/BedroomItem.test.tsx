import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BedroomItem } from '../components/listing/BedroomItem';

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type }: { children: React.ReactNode; onClick: () => void; type: string }) => (
    <button onClick={onClick} type={type} data-testid="remove-button">
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, type, min, placeholder }: { value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type: string; min: string; placeholder: string }) => (
    <input
      data-testid="beds-input"
      type={type}
      min={min}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (value: string) => void }) => (
    <div data-testid="select-wrapper" data-value={value} onClick={() => onValueChange('Queen')}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: () => <div data-testid="select-value">Value</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
}));

describe('BedroomItem Component', () => {
  const mockBedroom = {
    beds: 2,
    bedType: 'Queen',
  };

  describe('Rendering', () => {
    it('should render beds input field', () => {
      const handleUpdate = vi.fn();
      const handleRemove = vi.fn();

      render(
        <BedroomItem
          bedroom={mockBedroom}
          canRemove={true}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      );

      const input = screen.getByTestId('beds-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(2);
    });

    it('should render bed type selector', () => {
      const handleUpdate = vi.fn();
      const handleRemove = vi.fn();

      render(
        <BedroomItem
          bedroom={mockBedroom}
          canRemove={true}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      );

      const select = screen.getByTestId('select-wrapper');
      expect(select).toBeInTheDocument();
      expect(select).toHaveAttribute('data-value', 'Queen');
    });

    it('should render remove button when canRemove is true', () => {
      const handleUpdate = vi.fn();
      const handleRemove = vi.fn();

      render(
        <BedroomItem
          bedroom={mockBedroom}
          canRemove={true}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      );

      expect(screen.getByTestId('remove-button')).toBeInTheDocument();
    });

    it('should not render remove button when canRemove is false', () => {
      const handleUpdate = vi.fn();
      const handleRemove = vi.fn();

      render(
        <BedroomItem
          bedroom={mockBedroom}
          canRemove={false}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      );

      expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument();
    });

    it('should render all bed type options', () => {
      const handleUpdate = vi.fn();
      const handleRemove = vi.fn();

      render(
        <BedroomItem
          bedroom={mockBedroom}
          canRemove={true}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      );

      expect(screen.getByTestId('select-item-Single')).toBeInTheDocument();
      expect(screen.getByTestId('select-item-Double')).toBeInTheDocument();
      expect(screen.getByTestId('select-item-Queen')).toBeInTheDocument();
      expect(screen.getByTestId('select-item-King')).toBeInTheDocument();
      expect(screen.getByTestId('select-item-Bunk')).toBeInTheDocument();
    });
  });

  describe('Interactions - Bed Count', () => {
    it('should handle minimum bed count of 1', () => {
      const handleUpdate = vi.fn();
      const handleRemove = vi.fn();

      render(
        <BedroomItem
          bedroom={{ beds: 1, bedType: 'Single' }}
          canRemove={true}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      );

      const input = screen.getByTestId('beds-input');
      expect(input).toHaveAttribute('min', '1');
    });
  });

  describe('Interactions - Bed Type Selection', () => {
    it('should call onUpdate when bed type changes', async () => {
      const handleUpdate = vi.fn();
      const handleRemove = vi.fn();
      const user = userEvent.setup();

      render(
        <BedroomItem
          bedroom={mockBedroom}
          canRemove={true}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      );

      const select = screen.getByTestId('select-wrapper');
      await user.click(select);

      expect(handleUpdate).toHaveBeenCalled();
    });
  });

  describe('Interactions - Remove Button', () => {
    it('should call onRemove when remove button is clicked', async () => {
      const handleUpdate = vi.fn();
      const handleRemove = vi.fn();
      const user = userEvent.setup();

      render(
        <BedroomItem
          bedroom={mockBedroom}
          canRemove={true}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      );

      const removeButton = screen.getByTestId('remove-button');
      await user.click(removeButton);

      expect(handleRemove).toHaveBeenCalledTimes(1);
    });

    it('should call onRemove multiple times when remove button is clicked multiple times', async () => {
      const handleUpdate = vi.fn();
      const handleRemove = vi.fn();
      const user = userEvent.setup();

      render(
        <BedroomItem
          bedroom={mockBedroom}
          canRemove={true}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      );

      const removeButton = screen.getByTestId('remove-button');
      await user.click(removeButton);
      await user.click(removeButton);

      expect(handleRemove).toHaveBeenCalledTimes(2);
    });
  });

  describe('Different Bed Types', () => {
    it('should correctly render Single bed type', () => {
      const handleUpdate = vi.fn();
      const handleRemove = vi.fn();

      render(
        <BedroomItem
          bedroom={{ beds: 1, bedType: 'Single' }}
          canRemove={true}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      );

      const select = screen.getByTestId('select-wrapper');
      expect(select).toHaveAttribute('data-value', 'Single');
    });

    it('should correctly render King bed type', () => {
      const handleUpdate = vi.fn();
      const handleRemove = vi.fn();

      render(
        <BedroomItem
          bedroom={{ beds: 1, bedType: 'King' }}
          canRemove={true}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      );

      const select = screen.getByTestId('select-wrapper');
      expect(select).toHaveAttribute('data-value', 'King');
    });

    it('should correctly render Bunk bed type', () => {
      const handleUpdate = vi.fn();
      const handleRemove = vi.fn();

      render(
        <BedroomItem
          bedroom={{ beds: 2, bedType: 'Bunk' }}
          canRemove={true}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      );

      const select = screen.getByTestId('select-wrapper');
      expect(select).toHaveAttribute('data-value', 'Bunk');
    });
  });

  describe('Edge Cases', () => {
    it('should handle large bed count', () => {
      const handleUpdate = vi.fn();
      const handleRemove = vi.fn();

      render(
        <BedroomItem
          bedroom={{ beds: 10, bedType: 'Bunk' }}
          canRemove={true}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      );

      const input = screen.getByTestId('beds-input');
      expect(input).toHaveValue(10);
    });

    it('should handle minimum bed count of 1', () => {
      const handleUpdate = vi.fn();
      const handleRemove = vi.fn();

      render(
        <BedroomItem
          bedroom={{ beds: 1, bedType: 'Single' }}
          canRemove={true}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      );

      const input = screen.getByTestId('beds-input');
      expect(input).toHaveValue(1);
    });

    it('should not show remove button when there is only one bedroom', () => {
      const handleUpdate = vi.fn();
      const handleRemove = vi.fn();

      render(
        <BedroomItem
          bedroom={mockBedroom}
          canRemove={false}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      );

      expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument();
    });
  });
});
