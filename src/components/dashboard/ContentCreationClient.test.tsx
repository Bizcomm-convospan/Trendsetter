
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentCreationClient } from './ContentCreationClient';
import * as actions from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import * as firebase from '@/lib/firebase';

// Mock server actions
jest.mock('@/app/actions', () => ({
  handleGenerateArticle: jest.fn(),
  handlePublishArticle: jest.fn(),
  handleGenerateImage: jest.fn(),
  handleGenerateHeadlines: jest.fn(),
}));

// Mock Firestore
jest.mock('@/lib/firebase', () => ({
  db: {}, // Mock db object
  // Mock onSnapshot to return an unsubscribe function
  collection: jest.fn(() => ({})),
  query: jest.fn(() => ({})),
  where: jest.fn(() => ({})),
  orderBy: jest.fn(() => ({})),
  onSnapshot: jest.fn((query, callback) => {
    // Immediately invoke callback with empty data for initial render
    callback({ docs: [] }); 
    return jest.fn(); // Return a mock unsubscribe function
  }),
}));

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

const mockedHandleGenerateArticle = actions.handleGenerateArticle as jest.Mock;
const mockedHandlePublishArticle = actions.handlePublishArticle as jest.Mock;
const mockedOnSnapshot = firebase.onSnapshot as jest.Mock;
const mockedToast = jest.fn();

describe('ContentCreationClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockedToast });

    // Reset onSnapshot to return empty docs by default
    mockedOnSnapshot.mockImplementation((query, callback) => {
        callback({ docs: [] });
        return jest.fn();
    });
  });

  it('renders the component and generation form correctly', () => {
    render(<ContentCreationClient />);

    expect(screen.getByText('Generate a New Article')).toBeInTheDocument();
    expect(screen.getByLabelText(/Topic or Keyword/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Article/i })).toBeInTheDocument();
  });

  it('handles article generation and displays a success toast', async () => {
    const user = userEvent.setup();
    mockedHandleGenerateArticle.mockResolvedValue({
      data: { title: 'New Test Article', content: '...', meta: {}, featuredImagePrompt: '' },
    });

    render(<ContentCreationClient />);

    const topicInput = screen.getByLabelText(/Topic or Keyword/i);
    const generateButton = screen.getByRole('button', { name: /Generate Article/i });

    await user.type(topicInput, 'My test topic');
    await user.click(generateButton);

    await waitFor(() => {
      expect(mockedHandleGenerateArticle).toHaveBeenCalled();
      expect(mockedToast).toHaveBeenCalledWith({
        title: 'Article Generated!',
        description: `"New Test Article" is now available as a draft.`,
      });
      // The input should be cleared on success
      expect(topicInput).toHaveValue('');
    });
  });

  it('displays draft articles from Firestore', async () => {
    const mockDrafts = [
      {
        id: 'draft1',
        title: 'My First Draft',
        status: 'draft',
        createdAt: { toDate: () => new Date() },
        topic: 'testing',
        featuredImagePrompt: 'A test image'
      },
    ];

    // Configure onSnapshot to return our mock draft
    mockedOnSnapshot.mockImplementation((query, callback) => {
      // The first argument to onSnapshot is the query. We can inspect it if needed.
      // We only care about the callback for this test.
      // We check if the query is for 'drafts' to return the right data.
      // This is a bit brittle, but shows how to handle multiple listeners.
      // A better way would be to inspect the query object itself.
      if (query.toString().includes("draft")) {
          callback({ docs: mockDrafts.map(d => ({ id: d.id, data: () => d })) });
      } else {
          callback({ docs: [] });
      }
      return jest.fn();
    });

    render(<ContentCreationClient />);

    await waitFor(() => {
      expect(screen.getByText('My First Draft')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Publish/i })).toBeInTheDocument();
    });
  });

  it('handles publishing an article and shows a success toast', async () => {
    const user = userEvent.setup();
    const mockDrafts = [
      { id: 'draft1', title: 'Article to Publish', content: '...', createdAt: { toDate: () => new Date() } }
    ];

    mockedOnSnapshot.mockImplementation((query, callback) => {
        callback({ docs: mockDrafts.map(d => ({ id: d.id, data: () => d })) });
        return jest.fn();
    });
    
    mockedHandlePublishArticle.mockResolvedValue({ data: { success: true } });

    render(<ContentCreationClient />);

    const publishButton = await screen.findByRole('button', { name: /Publish/i });
    await user.click(publishButton);

    await waitFor(() => {
        expect(mockedHandlePublishArticle).toHaveBeenCalledWith('draft1');
        expect(mockedToast).toHaveBeenCalledWith({
            title: 'Article Published!',
            description: 'Your article has been sent to WordPress.'
        });
    });
  });

  it('shows an error toast if publishing fails', async () => {
    const user = userEvent.setup();
    const mockDrafts = [
      { id: 'draft1', title: 'Article to Publish', content: '...', createdAt: { toDate: () => new Date() } }
    ];
    
    mockedOnSnapshot.mockImplementation((query, callback) => {
        callback({ docs: mockDrafts.map(d => ({ id: d.id, data: () => d })) });
        return jest.fn();
    });

    mockedHandlePublishArticle.mockResolvedValue({ error: 'Webhook failed' });

    render(<ContentCreationClient />);

    const publishButton = await screen.findByRole('button', { name: /Publish/i });
    await user.click(publishButton);

    await waitFor(() => {
        expect(mockedToast).toHaveBeenCalledWith({
            variant: 'destructive',
            title: 'Publishing Failed',
            description: 'Webhook failed'
        });
    });
  });
});
