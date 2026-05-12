import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

export default function AccountPage() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [saveMsg, setSaveMsg] = useState('');

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setSaveMsg('PROFILE_UPDATED.');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: any) => setSaveMsg(`ERROR: ${err.message}`),
  });

  const { data: orders } = useQuery({
    queryKey: ['my_orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && activeTab === 'orders',
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="display-heading mb-8 text-2xl">ACCOUNT</h1>

      <div className="mb-6 flex gap-0 border-b-2 border-foreground">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'profile' ? 'border-b-2 border-foreground text-foreground' : 'text-muted-foreground'}`}
        >
          PROFILE
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'orders' ? 'border-b-2 border-foreground text-foreground' : 'text-muted-foreground'}`}
        >
          ORDERS
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div>
            <label className="label-text mb-1 block">FULL NAME</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border-2 border-border bg-background p-2 font-mono text-sm outline-none focus:border-foreground"
            />
          </div>
          <div>
            <label className="label-text mb-1 block">EMAIL (READ-ONLY)</label>
            <input
              type="text"
              value={profile?.email ?? ''}
              readOnly
              className="w-full border-2 border-border bg-muted p-2 font-mono text-sm text-muted-foreground"
            />
          </div>
          <button
            onClick={() => saveProfile.mutate()}
            className="bg-foreground px-6 py-2 text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/80"
          >
            SAVE
          </button>
          {saveMsg && <p className="font-mono text-xs text-success">{saveMsg}</p>}
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          {!orders?.length ? (
            <p className="font-mono text-xs text-muted-foreground">NO ORDERS YET.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="label-text pb-2 text-left">ORDER</th>
                  <th className="label-text pb-2 text-left">DATE</th>
                  <th className="label-text pb-2 text-left">STATUS</th>
                  <th className="label-text pb-2 text-right">TOTAL</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border">
                    <td className="py-2 font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-2 font-mono text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-2"><span className={`status-${order.status}`}>{order.status?.toUpperCase()}</span></td>
                    <td className="py-2 text-right data-text text-sm">${Number(order.total).toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <Link to={`/account/orders/${order.id}`} className="font-mono text-xs text-accent hover:underline">VIEW</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
