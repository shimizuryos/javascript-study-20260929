import { useState, type ChangeEvent, type FormEvent } from 'react';

export type SignupValues = { name: string; email: string; agree: boolean };

export function SignupForm({ onSubmit }: { onSubmit: (values: SignupValues) => void }) {
  const [form, setForm] = useState<SignupValues>({ name: '', email: '', agree: false });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(form);
  };

  const canSubmit = form.name !== '' && form.email.includes('@') && form.agree;

  return (
    <form onSubmit={handleSubmit}>
      <label>
        名前
        <input name="name" value={form.name} onChange={handleChange} />
      </label>
      <label>
        メールアドレス
        <input name="email" value={form.email} onChange={handleChange} />
      </label>
      <label>
        <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
        利用規約に同意する
      </label>
      <button type="submit" disabled={!canSubmit}>
        登録
      </button>
    </form>
  );
}
