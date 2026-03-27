'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type AuthBarProps = {
  email?: string;
};

export default function AuthBar({ email }: AuthBarProps) {
  const supabase = createClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
      <div>
        <p className="text-sm text-slate-400">Conectado como</p>
        <p className="font-medium text-slate-100">{email || 'Usuário'}</p>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-2xl bg-red-500/15 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/25"
      >
        Sair
      </button>
    </div>
  );
}
