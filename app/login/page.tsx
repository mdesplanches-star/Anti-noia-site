'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [modoCadastro, setModoCadastro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMensagem('');

    if (modoCadastro) {
      const { error, data } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (error) {
        setMensagem(error.message);
      } else {
        const user = data.user;
        if (user) {
          await supabase.from('profiles').upsert({
            id: user.id,
            nome: email.split('@')[0],
            email: user.email,
          });
        }
        setMensagem('Conta criada com sucesso. Agora faça login.');
        setModoCadastro(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        setMensagem('Email ou senha inválidos.');
      } else {
        router.push('/');
        router.refresh();
      }
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl">
        <div className="mb-6">
          <p className="mb-2 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
            Anti-Noia Finance
          </p>
          <h1 className="text-2xl font-bold">
            {modoCadastro ? 'Criar conta' : 'Entrar'}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {modoCadastro
              ? 'Crie seu acesso para salvar tudo na nuvem.'
              : 'Entre para acessar seu painel financeiro.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <input
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-400"
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-400"
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 py-3 font-semibold transition hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? 'Carregando...' : modoCadastro ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        {mensagem && (
          <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {mensagem}
          </div>
        )}

        <button
          type="button"
          onClick={() => setModoCadastro(!modoCadastro)}
          className="mt-5 text-sm text-slate-300 underline"
        >
          {modoCadastro ? 'Já tenho conta' : 'Quero criar conta'}
        </button>
      </div>
    </main>
  );
}
