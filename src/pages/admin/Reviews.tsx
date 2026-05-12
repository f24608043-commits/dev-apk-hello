import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminReviews() {
  const queryClient = useQueryClient();

  const { data: reviews } = useQuery({
    queryKey: ['admin_reviews'],
    queryFn: async () => { const { data } = await supabase.from('reviews').select('*, products(name), profiles(full_name, email)').order('created_at', { ascending: false }); return data ?? []; },
  });

  const approve = useMutation({
    mutationFn: async ({ id, is_approved }: { id: string; is_approved: boolean }) => { await supabase.from('reviews').update({ is_approved }).eq('id', id); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_reviews'] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('reviews').delete().eq('id', id); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_reviews'] }),
  });

  return (
    <div>
      <table className="w-full"><thead><tr className="border-b-2 border-foreground">
        <th className="label-text pb-2 text-left">PRODUCT</th><th className="label-text pb-2 text-left">USER</th><th className="label-text pb-2 text-center">RATING</th><th className="label-text pb-2 text-left">COMMENT</th><th className="label-text pb-2 text-center">APPROVED</th><th className="label-text pb-2 text-right">ACTIONS</th>
      </tr></thead><tbody>
      {reviews?.map(r => (
        <tr key={r.id} className="border-b border-border">
          <td className="py-2 text-sm">{(r.products as any)?.name}</td>
          <td className="py-2 font-mono text-xs">{(r.profiles as any)?.email}</td>
          <td className="py-2 text-center font-mono text-sm">{'★'.repeat(r.rating)}</td>
          <td className="py-2 text-xs text-muted-foreground max-w-xs truncate">{r.comment ?? '—'}</td>
          <td className="py-2 text-center">
            <button onClick={() => approve.mutate({ id: r.id, is_approved: !r.is_approved })} className={`font-mono text-xs font-bold ${r.is_approved ? 'text-success' : 'text-warning'}`}>{r.is_approved ? 'YES' : 'NO'}</button>
          </td>
          <td className="py-2 text-right">
            <button onClick={() => { if(confirm('Delete?')) del.mutate(r.id); }} className="font-mono text-xs text-destructive hover:underline">DELETE</button>
          </td>
        </tr>
      ))}
      </tbody></table>
    </div>
  );
}
