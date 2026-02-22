import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RecentSearches } from '../components/RecentSearches';

describe('RecentSearches', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render search input and button', () => {
    const mockOnSearchSelect = vi.fn();
    const mockOnSearch = vi.fn();

    render(
      <RecentSearches onSearchSelect={mockOnSearchSelect} onSearch={mockOnSearch} />
    );

    expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('should load and display recent searches', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { city: 'Madrid', searched_at: '2024-01-15T12:00:00Z' },
        { city: 'Barcelona', searched_at: '2024-01-15T11:00:00Z' }
      ]
    });

    const mockOnSearchSelect = vi.fn();
    const mockOnSearch = vi.fn();

    render(
      <RecentSearches onSearchSelect={mockOnSearchSelect} onSearch={mockOnSearch} />
    );

    await waitFor(() => {
      expect(screen.getByText('📍 Madrid')).toBeInTheDocument();
      expect(screen.getByText('📍 Barcelona')).toBeInTheDocument();
    });
  });

  it('should call onSearchSelect when a recent search is clicked', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ city: 'Madrid', searched_at: '2024-01-15T12:00:00Z' }]
      });

    const mockOnSearchSelect = vi.fn();
    const mockOnSearch = vi.fn();

    render(
      <RecentSearches onSearchSelect={mockOnSearchSelect} onSearch={mockOnSearch} />
    );

    await waitFor(() => {
      const searchItem = screen.getByText('📍 Madrid');
      fireEvent.click(searchItem);
      expect(mockOnSearchSelect).toHaveBeenCalledWith('Madrid');
    });
  });

  it('should submit new search via form', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

    const mockOnSearchSelect = vi.fn();
    const mockOnSearch = vi.fn().mockResolvedValue(undefined);

    render(
      <RecentSearches onSearchSelect={mockOnSearchSelect} onSearch={mockOnSearch} />
    );

    const input = screen.getByPlaceholderText('Search for a city...');
    await userEvent.type(input, 'Paris');

    const button = screen.getByRole('button', { name: /search/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('Paris');
      expect(mockOnSearchSelect).toHaveBeenCalledWith('Paris');
    });
  });
});
