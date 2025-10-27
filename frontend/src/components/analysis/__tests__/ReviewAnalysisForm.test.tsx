import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReviewAnalysisForm } from '../ReviewAnalysisForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: '123',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      subscription_tier: 'free',
      created_at: '2023-01-01T00:00:00Z',
    },
  }),
}));

// Mock the API service
vi.mock('@/services/ReviewAnalysisAPIService', () => ({
  reviewAnalysisAPI: {
    createReviewAnalysis: vi.fn(),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ReviewAnalysisForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with all required fields', () => {
    renderWithProviders(<ReviewAnalysisForm />);
    
    expect(screen.getByText('Analyze Competitors')).toBeInTheDocument();
    expect(screen.getByLabelText(/restaurant name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/analysis tier/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze competitors/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithProviders(<ReviewAnalysisForm />);
    
    const submitButton = screen.getByRole('button', { name: /analyze competitors/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Restaurant name is required')).toBeInTheDocument();
      expect(screen.getByText('Location is required')).toBeInTheDocument();
    });
  });

  it('has mobile-optimized input heights', () => {
    renderWithProviders(<ReviewAnalysisForm />);
    
    const restaurantInput = screen.getByLabelText(/restaurant name/i);
    const locationInput = screen.getByLabelText(/location/i);
    
    // Check that inputs have mobile-optimized classes
    expect(restaurantInput).toHaveClass('h-12', 'text-base');
    expect(locationInput).toHaveClass('h-12', 'text-base');
  });

  it('shows tier selector with free tier selected for free users', () => {
    renderWithProviders(<ReviewAnalysisForm />);
    
    expect(screen.getByText('Free Analysis')).toBeInTheDocument();
    expect(screen.getByText('Premium Analysis')).toBeInTheDocument();
    expect(screen.getByText('2 competitors')).toBeInTheDocument();
    expect(screen.getByText('5 competitors')).toBeInTheDocument();
  });

  it('includes category dropdown with restaurant options', () => {
    renderWithProviders(<ReviewAnalysisForm />);
    
    const categorySelect = screen.getByLabelText(/category/i);
    expect(categorySelect).toBeInTheDocument();
  });
});