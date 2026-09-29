import { useState, type ChangeEvent, type FormEvent } from 'react';

export type SignupValues = { name: string; email: string; agree: boolean };

export function SignupForm({ onSubmit }: { onSubmit: (values: SignupValues) => void }) {
  const [form, setForm] = useState<SignupValues>({ name: '', email: '', agree: false });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // TODO: e.target の name / value / type / checked を使って form を更新する
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: onSubmit を呼ぶ
  };

  const canSubmit = false; // TODO

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
