import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FavoritesPage } from '../pages/Favorites';

describe('FavoritesPage', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render favorites title', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    const mockOnCitySelect = vi.fn();
    render(<FavoritesPage onCitySelect={mockOnCitySelect} />);

    expect(screen.getByText('⭐ My Favorite Cities')).toBeInTheDocument();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should load and display favorites', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, city: 'Madrid', created_at: '2024-01-15T12:00:00Z' },
        { id: 2, city: 'Barcelona', created_at: '2024-01-15T11:00:00Z' }
      ]
    });

    const mockOnCitySelect = vi.fn();
    render(<FavoritesPage onCitySelect={mockOnCitySelect} />);

    await waitFor(() => {
      expect(screen.getByText('📍 Madrid')).toBeInTheDocument();
      expect(screen.getByText('📍 Barcelona')).toBeInTheDocument();
    });
  });

  it('should show message when no favorites exist', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    const mockOnCitySelect = vi.fn();
    render(<FavoritesPage onCitySelect={mockOnCitySelect} />);

    await waitFor(() => {
      expect(screen.getByText(/No favorite cities yet/)).toBeInTheDocument();
    });
  });

  it('should call onCitySelect when a favorite is clicked', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, city: 'Madrid', created_at: '2024-01-15T12:00:00Z' }
      ]
    });

    const mockOnCitySelect = vi.fn();
    render(<FavoritesPage onCitySelect={mockOnCitySelect} />);

    await waitFor(() => {
      const city = screen.getByText('📍 Madrid');
      fireEvent.click(city);
      expect(mockOnCitySelect).toHaveBeenCalledWith('Madrid');
    });
  });

  it('should remove favorite when remove button is clicked', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, city: 'Madrid', created_at: '2024-01-15T12:00:00Z' }
        ]
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

    global.confirm = vi.fn(() => true);

    const mockOnCitySelect = vi.fn();
    render(<FavoritesPage onCitySelect={mockOnCitySelect} />);

    await waitFor(() => {
      const removeButton = screen.getByText('Remove ✕');
      fireEvent.click(removeButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api/favorites/Madrid'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('should handle API errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const mockOnCitySelect = vi.fn();
    render(<FavoritesPage onCitySelect={mockOnCitySelect} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load favorites/)).toBeInTheDocument();
    });
  });
});
