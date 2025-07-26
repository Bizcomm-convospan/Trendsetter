
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntegrationsClient } from './IntegrationsClient';
import * as actions from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

jest.mock('@/app/actions', () => ({
  handleSaveWebhookUrl: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockedHandleSaveWebhookUrl = actions.handleSaveWebhookUrl as jest.Mock;
const mockedToast = jest.fn();

jest.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockedToast
    })
}))

describe('IntegrationsClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Zapier and Firebase integration cards correctly', () => {
    render(<IntegrationsClient />);
    expect(screen.getByText('Zapier')).toBeInTheDocument();
    expect(screen.getByText('Firebase')).toBeInTheDocument();
    expect(screen.getByLabelText('Your Zapier Webhook URL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Webhook URL' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Firebase Console' })).toBeInTheDocument();
  });

  it('calls the save webhook action with the correct URL', async () => {
    const user = userEvent.setup();
    mockedHandleSaveWebhookUrl.mockResolvedValue({ data: { success: true } });
    render(<IntegrationsClient />);

    const input = screen.getByLabelText('Your Zapier Webhook URL');
    const button = screen.getByRole('button', { name: 'Save Webhook URL' });
    const testUrl = 'https://hooks.zapier.com/hooks/catch/123/abc/';

    await user.type(input, testUrl);
    await user.click(button);

    await waitFor(() => {
        expect(mockedHandleSaveWebhookUrl).toHaveBeenCalledTimes(1);
        const formData = mockedHandleSaveWebhookUrl.mock.calls[0][0];
        expect(formData.get('webhookUrl')).toBe(testUrl);
    });

    await waitFor(() => {
        expect(mockedToast).toHaveBeenCalledWith({
            title: 'Success!',
            description: 'Your Zapier webhook URL has been saved.'
        });
    });
  });

  it('displays a validation error if the URL is invalid', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Please provide a valid URL.';
    mockedHandleSaveWebhookUrl.mockResolvedValue({ error: errorMessage, validationErrors: { webhookUrl: [errorMessage] } });

    render(<IntegrationsClient />);

    const input = screen.getByLabelText('Your Zapier Webhook URL');
    const button = screen.getByRole('button', { name: 'Save Webhook URL' });

    await user.type(input, 'invalid-url');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
       expect(mockedToast).toHaveBeenCalledWith({
            variant: 'destructive',
            title: 'Error',
            description: errorMessage
        });
    });
  });

   it('opens the firebase console link in a new tab', () => {
    render(<IntegrationsClient />);
    const firebaseLink = screen.getByRole('link', { name: 'Open Firebase Console' });
    expect(firebaseLink).toHaveAttribute('href', 'https://console.firebase.google.com/project/trendsetter-pro/overview');
    expect(firebaseLink).toHaveAttribute('target', '_blank');
  });

});
