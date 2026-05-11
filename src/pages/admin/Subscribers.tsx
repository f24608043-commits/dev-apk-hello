import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminSubscribers() {
  const { data: subscribers } = useQuery({
    queryKey: ['admin_subscribers'],
    queryFn: async () => { const { data } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false }); return data ?? []; },
  });

  return (
    <div>
      <p className="mb-4 font-mono text-xs text-muted-foreground">TOTAL: {subscribers?.length ?? 0}</p>
      <table className="w-full"><thead><tr className="border-b-2 border-foreground"><th className="label-text pb-2 text-left">EMAIL</th><th className="label-text pb-2 text-left">DATE</th></tr></thead>
      <tbody>{subscribers?.map(s => (
        <tr key={s.id} className="border-b border-border">
          <td className="py-2 font-mono text-xs">{s.email}</td>
          <td className="py-2 font-mono text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
        </tr>
      ))}</tbody></table>
    </div>
  );
}
