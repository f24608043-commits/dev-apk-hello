import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const { data: settings } = useQuery({
    queryKey: ['admin_settings'],
    queryFn: async () => { const { data } = await supabase.from('settings').select('*').order('key'); return data ?? []; },
  });

  const upsert = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const existing = settings?.find(s => s.key === key);
      if (existing) { await supabase.from('settings').update({ value }).eq('id', existing.id); }
      else { await supabase.from('settings').insert({ key, value }); }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin_settings'] }); setNewKey(''); setNewValue(''); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('settings').delete().eq('id', id); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_settings'] }),
  });

  return (
    <div>
      <div className="mb-8 border-2 border-foreground p-6">
        <h2 className="label-text mb-4">ADD / UPDATE SETTING</h2>
        <div className="flex gap-4">
          <input type="text" placeholder="KEY" value={newKey} onChange={(e) => setNewKey(e.target.value)} className="flex-1 border-2 border-border bg-background p-2 font-mono text-xs outline-none" />
          <input type="text" placeholder="VALUE" value={newValue} onChange={(e) => setNewValue(e.target.value)} className="flex-1 border-2 border-border bg-background p-2 font-mono text-xs outline-none" />
          <button onClick={() => upsert.mutate({ key: newKey, value: newValue })} className="bg-foreground px-6 py-2 text-xs font-bold uppercase text-background">SAVE</button>
        </div>
      </div>
      <table className="w-full"><thead><tr className="border-b-2 border-foreground"><th className="label-text pb-2 text-left">KEY</th><th className="label-text pb-2 text-left">VALUE</th><th className="label-text pb-2 text-right">ACTIONS</th></tr></thead>
      <tbody>{settings?.map(s => (
        <tr key={s.id} className="border-b border-border">
          <td className="py-2 font-mono text-xs font-bold">{s.key}</td>
          <td className="py-2 font-mono text-xs">{s.value}</td>
          <td className="py-2 text-right">
            <button onClick={() => { setNewKey(s.key); setNewValue(s.value ?? ''); }} className="mr-2 font-mono text-xs text-accent hover:underline">EDIT</button>
            <button onClick={() => { if(confirm('Delete?')) del.mutate(s.id); }} className="font-mono text-xs text-destructive hover:underline">DELETE</button>
          </td>
        </tr>
      ))}</tbody></table>
    </div>
  );
}
