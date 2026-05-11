import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export default function AdminBlog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<any>(null);

  const { data: posts } = useQuery({
    queryKey: ['admin_blog'],
    queryFn: async () => { const { data } = await supabase.from('blog_posts').select('*, profiles(full_name)').order('created_at', { ascending: false }); return data ?? []; },
  });

  const save = useMutation({
    mutationFn: async (f: any) => {
      const payload = { title: f.title, slug: f.slug, content: f.content || null, cover_image_url: f.cover_image_url || null, is_published: f.is_published, author_id: f.author_id || user?.id };
      if (f.id) { const { error } = await supabase.from('blog_posts').update(payload).eq('id', f.id); if (error) throw error; }
      else { const { error } = await supabase.from('blog_posts').insert(payload); if (error) throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin_blog'] }); setForm(null); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('blog_posts').delete().eq('id', id); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_blog'] }),
  });

  function autoSlug(t: string) { return t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }

  return (
    <div>
      <button onClick={() => setForm({ title: '', slug: '', content: '', cover_image_url: '', is_published: false })} className="mb-6 bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest text-background">ADD POST</button>
      {form && (
        <div className="mb-8 border-2 border-foreground p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label-text mb-1 block">TITLE *</label><input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value, slug: form.id ? form.slug : autoSlug(e.target.value)})} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none" /></div>
            <div><label className="label-text mb-1 block">SLUG *</label><input type="text" value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none" /></div>
          </div>
          <div><label className="label-text mb-1 block">COVER IMAGE URL</label><input type="text" value={form.cover_image_url} onChange={(e) => setForm({...form, cover_image_url: e.target.value})} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none" /></div>
          <div><label className="label-text mb-1 block">CONTENT (HTML)</label><textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} rows={10} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none" /></div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({...form, is_published: e.target.checked})} className="accent-foreground" /><span className="text-xs">PUBLISHED</span></label>
          <div className="flex gap-4">
            <button onClick={() => save.mutate(form)} className="bg-foreground px-6 py-2 text-xs font-bold uppercase text-background">SAVE</button>
            <button onClick={() => setForm(null)} className="px-6 py-2 text-xs font-bold uppercase text-muted-foreground">CANCEL</button>
          </div>
        </div>
      )}
      <table className="w-full"><thead><tr className="border-b-2 border-foreground"><th className="label-text pb-2 text-left">TITLE</th><th className="label-text pb-2 text-left">AUTHOR</th><th className="label-text pb-2 text-left">DATE</th><th className="label-text pb-2 text-center">PUBLISHED</th><th className="label-text pb-2 text-right">ACTIONS</th></tr></thead>
      <tbody>{posts?.map(p => (
        <tr key={p.id} className="border-b border-border">
          <td className="py-2 text-sm font-medium">{p.title}</td>
          <td className="py-2 font-mono text-xs">{(p.profiles as any)?.full_name ?? '—'}</td>
          <td className="py-2 font-mono text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
          <td className="py-2 text-center font-mono text-xs">{p.is_published ? 'YES' : 'NO'}</td>
          <td className="py-2 text-right">
            <button onClick={() => setForm({...p})} className="mr-2 font-mono text-xs text-accent hover:underline">EDIT</button>
            <button onClick={() => { if(confirm('Delete?')) del.mutate(p.id); }} className="font-mono text-xs text-destructive hover:underline">DELETE</button>
          </td>
        </tr>
      ))}</tbody></table>
    </div>
  );
}
