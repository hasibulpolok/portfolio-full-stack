// ============================================================
// FILE: frontend/src/app/admin/skills/page.tsx
// ============================================================
'use client';
import { useState } from 'react';
import { useSkills, useCreateSkill, useUpdateSkill, useDeleteSkill } from '@/hooks/usePortfolio';

const CATEGORIES = ['frontend', 'backend', 'database', 'devops', 'design', 'tools', 'other'];

export default function AdminSkills() {
  const [form, setForm] = useState({ name: '', icon: '', category: 'frontend', proficiency: 80, order: 0, isVisible: true });
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: skills } = useSkills();
  const create = useCreateSkill();
  const update = useUpdateSkill();
  const remove = useDeleteSkill();

  const reset = () => { setForm({ name: '', icon: '', category: 'frontend', proficiency: 80, order: 0, isVisible: true }); setEditing(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await update.mutateAsync({ id: editing._id, data: form });
      else await create.mutateAsync(form);
      reset();
    } catch (err: any) { alert(err?.message || 'Error'); }
  };

  const grouped = skills?.reduce((acc: any, s: any) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Skills</h1>
        <button onClick={() => { reset(); setShowForm(true); }} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium">+ Add Skill</button>
      </div>

      {showForm && (
        <div className="bg-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-white font-semibold mb-4">{editing ? 'Edit Skill' : 'New Skill'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-400 text-sm block mb-1">Name *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Category *</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Proficiency (0-100)</label>
              <input type="number" min="0" max="100" value={form.proficiency} onChange={e => setForm({...form, proficiency: +e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Icon (URL or emoji)</label>
              <input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Order</label>
              <input type="number" value={form.order} onChange={e => setForm({...form, order: +e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input type="checkbox" checked={form.isVisible} onChange={e => setForm({...form, isVisible: e.target.checked})} className="accent-emerald-500" />
                Visible
              </label>
            </div>
            <div className="col-span-full flex gap-3">
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={reset} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-lg font-medium">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {Object.entries(grouped || {}).map(([cat, items]: any) => (
        <div key={cat} className="mb-6">
          <h3 className="text-emerald-400 text-xs uppercase tracking-widest mb-3">{cat}</h3>
          <div className="bg-slate-800 rounded-2xl overflow-hidden">
            {items.map((s: any, i: number) => (
              <div key={s._id} className={`flex items-center justify-between px-6 py-4 ${i < items.length - 1 ? 'border-b border-slate-700/50' : ''}`}>
                <div className="flex items-center gap-4">
                  {s.icon && <span className="text-xl">{s.icon}</span>}
                  <div>
                    <span className="text-white font-medium">{s.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="bg-slate-700 rounded-full h-1.5 w-24">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${s.proficiency}%` }}></div>
                      </div>
                      <span className="text-slate-400 text-xs">{s.proficiency}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`text-xs px-2 py-0.5 rounded ${s.isVisible ? 'text-emerald-400' : 'text-slate-500'}`}>{s.isVisible ? 'Visible' : 'Hidden'}</span>
                  <button onClick={() => { setEditing(s); setForm({...s}); setShowForm(true); }} className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                  <button onClick={() => { if (confirm('Delete?')) remove.mutate(s._id); }} className="text-red-400 hover:text-red-300 text-sm">Del</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


// ============================================================
// FILE: frontend/src/app/admin/contacts/page.tsx
// ============================================================
'use client';
import { useState } from 'react';
import { useContacts } from '@/hooks/usePortfolio';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminContacts() {
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const { data, isLoading } = useContacts(statusFilter ? { status: statusFilter } : {});
  const qc = useQueryClient();

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/contact/${id}/status`, { status });
    qc.invalidateQueries({ queryKey: ['contacts'] });
  };

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-400',
    read: 'bg-slate-500/20 text-slate-400',
    replied: 'bg-emerald-500/20 text-emerald-400',
    archived: 'bg-red-500/20 text-red-400',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Messages <span className="text-slate-400 text-lg">({data?.total || 0})</span></h1>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-800 text-white rounded-lg px-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">All Status</option>
          {['new', 'read', 'replied', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* List */}
        <div className="bg-slate-800 rounded-2xl overflow-hidden">
          {isLoading ? <div className="p-6 text-slate-400">Loading...</div> : (
            data?.data?.map((msg: any) => (
              <div key={msg._id} onClick={() => { setSelected(msg); updateStatus(msg._id, 'read'); }}
                className={`p-4 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/30 transition-all ${selected?._id === msg._id ? 'bg-slate-700/50' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-white font-medium">{msg.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[msg.status]}`}>{msg.status}</span>
                </div>
                <p className="text-slate-300 text-sm">{msg.subject}</p>
                <p className="text-slate-500 text-xs mt-1">{msg.email} · {new Date(msg.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="bg-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">{selected.name}</h3>
                <p className="text-slate-400">{selected.email}</p>
                {selected.phone && <p className="text-slate-400 text-sm">{selected.phone}</p>}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${statusColors[selected.status]}`}>{selected.status}</span>
            </div>
            <h4 className="text-emerald-400 font-medium mb-2">{selected.subject}</h4>
            <p className="text-slate-300 leading-relaxed mb-6">{selected.message}</p>
            <div className="flex gap-3">
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                onClick={() => updateStatus(selected._id, 'replied')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                Reply via Email
              </a>
              <button onClick={() => updateStatus(selected._id, 'archived')} className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg text-sm transition-all">Archive</button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl p-6 flex items-center justify-center text-slate-500">
            Select a message to view
          </div>
        )}
      </div>
    </div>
  );
}


// ============================================================
// FILE: frontend/src/app/admin/experience/page.tsx
// ============================================================
'use client';
import { useState } from 'react';
import { useExperience, useCreateExperience, useDeleteExperience } from '@/hooks/usePortfolio';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

const EXP_TYPES = ['full-time', 'part-time', 'freelance', 'contract', 'internship'];

export default function AdminExperience() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const emptyForm = { title: '', company: '', companyUrl: '', location: '', type: 'freelance', startDate: '', endDate: '', isCurrent: false, description: '', responsibilities: '', techStack: '' };
  const [form, setForm] = useState(emptyForm);

  const { data: experiences } = useExperience();
  const create = useCreateExperience();
  const remove = useDeleteExperience();
  const qc = useQueryClient();

  const reset = () => { setForm(emptyForm); setEditing(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      responsibilities: form.responsibilities.split('\n').filter(Boolean),
      techStack: form.techStack.split(',').map(s => s.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        await api.patch(`/experience/${editing._id}`, payload);
        qc.invalidateQueries({ queryKey: ['experience'] });
      } else {
        await create.mutateAsync(payload);
      }
      reset();
    } catch (err: any) { alert(err?.message || 'Error'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Experience</h1>
        <button onClick={() => { reset(); setShowForm(true); }} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium">+ Add Experience</button>
      </div>

      {showForm && (
        <div className="bg-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-white font-semibold mb-4">{editing ? 'Edit' : 'New'} Experience</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[{ label: 'Job Title *', key: 'title', req: true }, { label: 'Company *', key: 'company', req: true }, { label: 'Company URL', key: 'companyUrl' }, { label: 'Location', key: 'location' }].map(({ label, key, req }) => (
              <div key={key}>
                <label className="text-slate-400 text-sm block mb-1">{label}</label>
                <input required={req} value={(form as any)[key]} onChange={e => setForm({...form, [key]: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            ))}
            <div>
              <label className="text-slate-400 text-sm block mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {EXP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-slate-400 text-sm block mb-1">Start Date *</label>
                <input type="date" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              {!form.isCurrent && (
                <div className="flex-1">
                  <label className="text-slate-400 text-sm block mb-1">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              )}
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input type="checkbox" checked={form.isCurrent} onChange={e => setForm({...form, isCurrent: e.target.checked})} className="accent-emerald-500" />
                Currently Working Here
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm block mb-1">Description *</label>
              <textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm block mb-1">Responsibilities (one per line)</label>
              <textarea rows={4} value={form.responsibilities} onChange={e => setForm({...form, responsibilities: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm block mb-1">Tech Stack (comma separated)</label>
              <input value={form.techStack} onChange={e => setForm({...form, techStack: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={reset} className="bg-slate-700 text-white px-6 py-2.5 rounded-lg font-medium">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {experiences?.map((exp: any) => (
          <div key={exp._id} className="bg-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-semibold text-lg">{exp.title}</h3>
                <p className="text-emerald-400">{exp.company}</p>
                <p className="text-slate-400 text-sm mt-1">
                  {exp.type} · {exp.location} · {new Date(exp.startDate).getFullYear()} – {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  setEditing(exp);
                  setForm({...exp, responsibilities: exp.responsibilities?.join('\n') || '', techStack: exp.techStack?.join(', ') || '',
                    startDate: exp.startDate ? exp.startDate.split('T')[0] : '',
                    endDate: exp.endDate ? exp.endDate.split('T')[0] : ''});
                  setShowForm(true);
                }} className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                <button onClick={() => { if (confirm('Delete?')) remove.mutate(exp._id); }} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ============================================================
// FILE: frontend/src/app/admin/testimonials/page.tsx
// ============================================================
'use client';
import { useState } from 'react';
import { useTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial } from './hooks';

// Helper: re-export mutation hooks for testimonials (use the ones from usePortfolio)
// import { ... } from '@/hooks/usePortfolio';

export default function AdminTestimonials() {
  // Note: wire up with usePortfolio hooks as shown in other pages
  // Full implementation follows same pattern as Projects page
  // using useTestimonials, create/update/delete mutations
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-4">Testimonials</h1>
      <p className="text-slate-400">
        Implement this page following the same pattern as the Projects admin page.
        Use: useTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial hooks.
        Fields: name, title, company, content (textarea), rating (1-5), platform, isApproved, isFeatured.
      </p>
    </div>
  );
}


// ============================================================
// FILE: frontend/src/app/projects/[slug]/page.tsx
// ============================================================
'use client';
import { useProject } from '@/hooks/usePortfolio';
import { useParams } from 'next/navigation';

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading } = useProject(slug);

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-emerald-400">Loading...</div></div>;
  if (!project) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-slate-400">Project not found</div></div>;

  return (
    <main className="min-h-screen bg-slate-900 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <a href="/projects" className="text-emerald-400 hover:text-emerald-300 mb-6 block">← Back to Projects</a>
        <div className="bg-slate-800 rounded-2xl overflow-hidden">
          <img src={project.thumbnail} alt={project.title} className="w-full h-72 object-cover" />
          <div className="p-8">
            <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-white">{project.title}</h1>
              <div className="flex gap-3">
                {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Live Demo ↗</a>}
                {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium">GitHub ↗</a>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {project.techStack?.map((t: string) => <span key={t} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">{t}</span>)}
            </div>
            <p className="text-slate-300 leading-relaxed text-lg">{project.description}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
