
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrendDiscoveryClient } from './TrendDiscoveryClient';
import * as actions from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

// Mock the server action module
jest.mock('@/app/actions', () => ({
  handleDiscoverTrends: jest.fn(),
}));

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockedHandleDiscoverTrends = actions.handleDiscoverTrends as jest.Mock;
const mockedUseToast = useToast as jest.Mock;
const mockedToast = jest.fn();

describe('TrendDiscoveryClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseToast.mockImplementation(() => ({
      toast: mockedToast,
    }));
  });

  it('renders correctly and discovers trends on form submission', async () => {
    const user = userEvent.setup();
    mockedHandleDiscoverTrends.mockResolvedValue({
      data: {
        discoveredTrends: [
          {
            title: 'AI in Agriculture',
            description: 'New tech for farming.',
            keywords: ['ai', 'agritech'],
          },
        ],
      },
    });

    render(<TrendDiscoveryClient onSelectTopic={() => {}} />);

    const topicInput = screen.getByLabelText(/Focus Topic/i);
    const submitButton = screen.getByRole('button', { name: /Discover Trends/i });

    expect(topicInput).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();

    await user.type(topicInput, 'Agriculture');
    await user.click(submitButton);

    // After clicking, the button should be disabled and loading UI shown
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Discover Trends/i })).toBeDisabled();
      expect(screen.getByText(/Awaiting AI output.../i)).toBeInTheDocument();
    });

    // After the action resolves, the results should be displayed
    await waitFor(() => {
      expect(screen.getByText('AI in Agriculture')).toBeInTheDocument();
      expect(screen.getByText('New tech for farming.')).toBeInTheDocument();
      expect(screen.getByText('agritech')).toBeInTheDocument();
    });

    // Button should be enabled again
    expect(screen.getByRole('button', { name: /Discover Trends/i })).not.toBeDisabled();

    // Toast should be called
    expect(mockedToast).toHaveBeenCalledWith({
      title: 'Trends Discovered!',
      description: 'Found 1 potential trends.',
    });
  });

  it('displays an error toast when the action fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Network error, please try again.';
    mockedHandleDiscoverTrends.mockResolvedValue({
      error: errorMessage,
    });

    render(<TrendDiscoveryClient onSelectTopic={() => {}} />);
    const submitButton = screen.getByRole('button', { name: /Discover Trends/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error Discovering Trends',
        description: errorMessage,
      });
    });

    // Ensure no results table is rendered
    expect(screen.queryByText(/Discovered Trends/)).not.toBeInTheDocument();
    // Button should be enabled again
    expect(submitButton).not.toBeDisabled();
  });

  it('calls onSelectTopic when "Use this Topic" is clicked', async () => {
    const user = userEvent.setup();
    const onSelectTopicMock = jest.fn();
    mockedHandleDiscoverTrends.mockResolvedValue({
      data: {
        discoveredTrends: [
          {
            title: 'Sustainable Energy',
            description: 'The future is green.',
            keywords: ['solar', 'wind'],
          },
        ],
      },
    });

    render(<TrendDiscoveryClient onSelectTopic={onSelectTopicMock} />);
    const submitButton = screen.getByRole('button', { name: /Discover Trends/i });
    await user.click(submitButton);

    const useTopicButton = await screen.findByRole('button', { name: /Use this Topic/i });
    await user.click(useTopicButton);

    expect(onSelectTopicMock).toHaveBeenCalledWith('Sustainable Energy');
  });
});
