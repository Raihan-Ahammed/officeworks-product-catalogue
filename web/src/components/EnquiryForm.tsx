import { useState, type FormEvent } from 'react';
import type { EnquiryInput } from '../api';

interface Props {
  productId: number;
  productTitle: string;
  onSubmit: (input: EnquiryInput) => Promise<void>;
  onClose: () => void;
}

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

function validate(input: EnquiryInput): Errors {
  const errors: Errors = {};
  if (!input.name.trim()) errors.name = 'Please enter your name';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }
  if (!input.message.trim()) errors.message = 'Please tell us what you would like to know';
  return errors;
}

export default function EnquiryForm({ productId, productTitle, onSubmit, onClose }: Props) {
  const [input, setInput] = useState<EnquiryInput>({ productId, name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  const set = (field: keyof EnquiryInput) => (e: { target: { value: string } }) =>
    setInput((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validate(input);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setStatus('submitting');
    try {
      await onSubmit(input);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="enquiry-thanks" role="status">
        <h3>Thank you</h3>
        <p>We have received your enquiry and will get back to you shortly.</p>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  return (
    <form className="enquiry-form" onSubmit={submit} noValidate>
      <h3>Enquire about {productTitle}</h3>

      <label>
        Name
        <input value={input.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </label>

      <label>
        Email
        <input
          type="email"
          value={input.email}
          onChange={set('email')}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </label>

      <label>
        Message
        <textarea
          rows={4}
          value={input.message}
          onChange={set('message')}
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message && <span className="field-error">{errors.message}</span>}
      </label>

      {status === 'error' && (
        <p className="field-error" role="alert">
          Something went wrong sending your enquiry. Please try again.
        </p>
      )}

      <div className="enquiry-actions">
        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending…' : 'Send enquiry'}
        </button>
        <button type="button" onClick={onClose} disabled={status === 'submitting'}>
          Cancel
        </button>
      </div>
    </form>
  );
}
