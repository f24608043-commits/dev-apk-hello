import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminUsers() {
  const { data: users } = useQuery({
    queryKey: ['admin_users'],
    queryFn: async () => { const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }); return data ?? []; },
  });

  return (
    <div>
      <table className="w-full"><thead><tr className="border-b-2 border-foreground"><th className="label-text pb-2 text-left">EMAIL</th><th className="label-text pb-2 text-left">NAME</th><th className="label-text pb-2 text-left">ROLE</th><th className="label-text pb-2 text-left">JOINED</th></tr></thead>
      <tbody>{users?.map(u => (
        <tr key={u.id} className="border-b border-border">
          <td className="py-2 font-mono text-xs">{u.email}</td>
          <td className="py-2 text-sm">{u.full_name || '—'}</td>
          <td className="py-2 font-mono text-xs font-bold uppercase">{u.role}</td>
          <td className="py-2 font-mono text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
        </tr>
      ))}</tbody></table>
    </div>
  );
}
