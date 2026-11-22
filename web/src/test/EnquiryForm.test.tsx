import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EnquiryForm from '../components/EnquiryForm';

const renderForm = (onSubmit = vi.fn().mockResolvedValue(undefined), onClose = vi.fn()) => {
  render(<EnquiryForm productId={7} productTitle="Gold ring" onSubmit={onSubmit} onClose={onClose} />);
  return { onSubmit, onClose };
};

describe('EnquiryForm', () => {
  it('validates required fields and sends nothing when invalid', async () => {
    const { onSubmit } = renderForm();

    await userEvent.click(screen.getByRole('button', { name: /send enquiry/i }));

    expect(screen.getByText('Please enter your name')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Please tell us what you would like to know')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the enquiry and shows a Thank you message', async () => {
    const { onSubmit } = renderForm();

    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Message'), 'Is this in stock?');
    await userEvent.click(screen.getByRole('button', { name: /send enquiry/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      productId: 7,
      name: 'Ada',
      email: 'ada@example.com',
      message: 'Is this in stock?',
    });
    expect(await screen.findByRole('status')).toHaveTextContent('Thank you');
  });

  it('shows an error when the submission fails', async () => {
    const failing = vi.fn().mockRejectedValue(new Error('nope'));
    renderForm(failing);

    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Message'), 'Hi');
    await userEvent.click(screen.getByRole('button', { name: /send enquiry/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong');
  });
});
