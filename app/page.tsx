import FinanceApp from '@/components/FinanceApp';
import AuthBar from '@/components/AuthBar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <AuthBar email={data.user.email} />
        <FinanceApp />
      </div>
    </main>
  );
}