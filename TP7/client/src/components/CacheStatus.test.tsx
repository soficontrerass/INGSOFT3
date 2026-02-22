import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CacheStatus } from '../components/CacheStatus';

describe('CacheStatus', () => {
  it('should render with "Just now" for recent cache', () => {
    const mockOnRefresh = vi.fn();
    const now = new Date().toISOString();

    render(<CacheStatus cachedAt={now} onRefresh={mockOnRefresh} />);

    expect(screen.getByText(/Updated Just now/)).toBeInTheDocument();
  });

  it('should render with time ago calculation', () => {
    const mockOnRefresh = vi.fn();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    render(<CacheStatus cachedAt={fiveMinutesAgo} onRefresh={mockOnRefresh} />);

    expect(screen.getByText(/Updated 5m ago/)).toBeInTheDocument();
  });

  it('should call onRefresh when button is clicked', () => {
    const mockOnRefresh = vi.fn();

    render(<CacheStatus onRefresh={mockOnRefresh} />);

    const button = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(button);

    expect(mockOnRefresh).toHaveBeenCalled();
  });

  it('should disable button when isLoading is true', () => {
    const mockOnRefresh = vi.fn();

    render(<CacheStatus onRefresh={mockOnRefresh} isLoading={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Refreshing...')).toBeInTheDocument();
  });

  it('should show "Never" when cachedAt is undefined', () => {
    const mockOnRefresh = vi.fn();

    render(<CacheStatus onRefresh={mockOnRefresh} />);

    expect(screen.getByText(/Updated Never/)).toBeInTheDocument();
  });
});
