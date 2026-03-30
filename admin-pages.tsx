// ============================================================
// FILE: frontend/src/app/admin/login/page.tsx
// ============================================================
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      router.push('/admin');
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-slate-400 mt-1">Portfolio Management System</p>
        </div>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm block mb-1">Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="text-slate-400 text-sm block mb-1">Password</label>
            <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-white font-semibold py-3 rounded-lg transition-all mt-2">
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}


// ============================================================
// FILE: frontend/src/app/admin/layout.tsx
// ============================================================
'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/projects', label: 'Projects', icon: '🚀' },
  { href: '/admin/skills', label: 'Skills', icon: '⚡' },
  { href: '/admin/experience', label: 'Experience', icon: '💼' },
  { href: '/admin/blogs', label: 'Blog Posts', icon: '📝' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: '💬' },
  { href: '/admin/contacts', label: 'Messages', icon: '✉️' },
  { href: '/admin/site', label: 'Site Settings', icon: '⚙️' },
  { href: '/admin/uploads', label: 'Media', icon: '🖼️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout, fetchMe } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchMe().then(() => {
      if (!useAuthStore.getState().isAuthenticated && pathname !== '/admin/login') {
        router.replace('/admin/login');
      }
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, pathname]);

  if (pathname === '/admin/login') return <>{children}</>;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 flex flex-col shadow-xl fixed h-full overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-white font-bold text-lg">Portfolio Admin</h2>
          <p className="text-slate-400 text-sm mt-1 truncate">{user?.name}</p>
        </div>
        <nav className="flex-1 p-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-all text-sm ${
                pathname === item.href ? 'bg-emerald-500/20 text-emerald-400 font-medium' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700 space-y-2">
          <a href="/" target="_blank" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white text-sm transition-all">
            <span>🌐</span> View Site
          </a>
          <button onClick={() => { logout(); router.push('/admin/login'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 text-sm transition-all">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 min-h-screen overflow-auto">{children}</main>
    </div>
  );
}


// ============================================================
// FILE: frontend/src/app/admin/page.tsx  (Dashboard)
// ============================================================
'use client';
import { useProjects, useBlogs, useContacts, useTestimonials, useSkills, useExperience } from '@/hooks/usePortfolio';

export default function AdminDashboard() {
  const { data: projectsData } = useProjects({ limit: 100 });
  const { data: blogsData } = useBlogs({ limit: 100 });
  const { data: contacts } = useContacts();
  const { data: testimonials } = useTestimonials();
  const { data: skills } = useSkills();
  const { data: experiences } = useExperience();

  const stats = [
    { label: 'Projects', value: projectsData?.total || 0, icon: '🚀', color: 'emerald', href: '/admin/projects' },
    { label: 'Blog Posts', value: blogsData?.total || 0, icon: '📝', color: 'blue', href: '/admin/blogs' },
    { label: 'Messages', value: contacts?.total || 0, icon: '✉️', color: 'yellow', href: '/admin/contacts' },
    { label: 'Testimonials', value: testimonials?.length || 0, icon: '💬', color: 'purple', href: '/admin/testimonials' },
    { label: 'Skills', value: skills?.length || 0, icon: '⚡', color: 'orange', href: '/admin/skills' },
    { label: 'Experience', value: experiences?.length || 0, icon: '💼', color: 'pink', href: '/admin/experience' },
  ];

  const newMessages = contacts?.data?.filter((c: any) => c.status === 'new') || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Portfolio management overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <a key={s.label} href={s.href} className="bg-slate-800 rounded-2xl p-5 hover:ring-2 hover:ring-emerald-500 transition-all">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold text-white">{s.value}</div>
            <div className="text-slate-400 text-sm">{s.label}</div>
          </a>
        ))}
      </div>

      {/* New Messages */}
      {newMessages.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">🔔 New Messages ({newMessages.length})</h2>
          <div className="space-y-3">
            {newMessages.slice(0, 5).map((msg: any) => (
              <div key={msg._id} className="flex justify-between items-start bg-slate-700 rounded-xl p-4">
                <div>
                  <p className="text-white font-medium">{msg.name}</p>
                  <p className="text-slate-400 text-sm">{msg.subject}</p>
                  <p className="text-slate-500 text-xs">{msg.email}</p>
                </div>
                <span className="text-slate-400 text-xs">{new Date(msg.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================================
// FILE: frontend/src/app/admin/projects/page.tsx
// ============================================================
'use client';
import { useState } from 'react';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject, useUploadFile } from '@/hooks/usePortfolio';

export default function AdminProjects() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', shortDescription: '', description: '', thumbnail: '', techStack: '', category: 'web', liveUrl: '', githubUrl: '', featured: false, isPublished: true });

  const { data, isLoading } = useProjects({ limit: 50 });
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const uploadFile = useUploadFile();

  const resetForm = () => { setForm({ title: '', shortDescription: '', description: '', thumbnail: '', techStack: '', category: 'web', liveUrl: '', githubUrl: '', featured: false, isPublished: true }); setEditing(null); setShowForm(false); };

  const handleEdit = (p: any) => { setEditing(p); setForm({ ...p, techStack: p.techStack?.join(', ') || '' }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, techStack: form.techStack.split(',').map((s: string) => s.trim()).filter(Boolean) };
    try {
      if (editing) await updateProject.mutateAsync({ id: editing._id, data: payload });
      else await createProject.mutateAsync(payload);
      resetForm();
    } catch (err: any) { alert(err?.message || 'Error saving project'); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const url = await uploadFile.mutateAsync(e.target.files[0]);
    setForm({ ...form, thumbnail: url });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all">+ Add Project</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-white font-semibold text-lg mb-6">{editing ? 'Edit Project' : 'New Project'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm block mb-1">Title *</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {['web', 'mobile', 'api', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm block mb-1">Short Description *</label>
              <input required value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm block mb-1">Description *</label>
              <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Thumbnail URL</label>
              <input value={form.thumbnail} onChange={e => setForm({...form, thumbnail: e.target.value})} placeholder="https://..." className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <label className="text-emerald-400 text-xs mt-1 cursor-pointer block">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                {uploadFile.isPending ? 'Uploading...' : '↑ Or upload image'}
              </label>
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Tech Stack (comma separated)</label>
              <input value={form.techStack} onChange={e => setForm({...form, techStack: e.target.value})} placeholder="React, Node.js, MongoDB" className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Live URL</label>
              <input type="url" value={form.liveUrl} onChange={e => setForm({...form, liveUrl: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">GitHub URL</label>
              <input type="url" value={form.githubUrl} onChange={e => setForm({...form, githubUrl: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex gap-6 items-center">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="accent-emerald-500" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.checked})} className="accent-emerald-500" />
                Published
              </label>
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all">{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {isLoading ? <div className="text-slate-400">Loading...</div> : (
        <div className="bg-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                {['Project', 'Category', 'Status', 'Featured', 'Views', 'Actions'].map(h => (
                  <th key={h} className="text-left text-slate-400 text-sm px-6 py-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((p: any) => (
                <tr key={p._id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.thumbnail && <img src={p.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                      <div>
                        <p className="text-white font-medium">{p.title}</p>
                        <p className="text-slate-500 text-xs">{p.techStack?.slice(0,3).join(', ')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{p.category}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.isPublished ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600 text-slate-400'}`}>
                      {p.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{p.featured ? '⭐ Yes' : 'No'}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{p.views}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p)} className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                      <button onClick={() => { if (confirm('Delete this project?')) deleteProject.mutate(p._id); }} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// ============================================================
// FILE: frontend/src/app/admin/site/page.tsx  (Site Settings)
// ============================================================
'use client';
import { useState, useEffect } from 'react';
import { useSiteSettings, useUpdateSite } from '@/hooks/usePortfolio';

export default function AdminSiteSettings() {
  const { data: site } = useSiteSettings();
  const updateSite = useUpdateSite();
  const [activeTab, setActiveTab] = useState('hero');
  const [form, setForm] = useState<any>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (site) setForm(site); }, [site]);

  const handleSave = async () => {
    try {
      await updateSite.mutateAsync(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) { alert(err?.message || 'Save failed'); }
  };

  const tabs = ['hero', 'about', 'contact', 'social', 'seo'];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Site Settings</h1>
        <button onClick={handleSave} disabled={updateSite.isPending}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all">
          {updateSite.isPending ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === t ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-2xl p-6">
        {/* HERO TAB */}
        {activeTab === 'hero' && form.hero && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Greeting', key: 'greeting' },
              { label: 'Name', key: 'name' },
              { label: 'CTA Text', key: 'ctaText' },
              { label: 'CTA Link', key: 'ctaLink' },
              { label: 'Resume URL', key: 'resumeUrl' },
              { label: 'Profile Image URL', key: 'profileImage' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-slate-400 text-sm block mb-1">{label}</label>
                <input value={form.hero[key] || ''} onChange={e => setForm({ ...form, hero: { ...form.hero, [key]: e.target.value } })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm block mb-1">Bio</label>
              <textarea rows={3} value={form.hero.bio || ''} onChange={e => setForm({ ...form, hero: { ...form.hero, bio: e.target.value } })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm block mb-1">Roles (comma separated)</label>
              <input value={form.hero.roles?.join(', ') || ''} onChange={e => setForm({ ...form, hero: { ...form.hero, roles: e.target.value.split(',').map((s: string) => s.trim()) } })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && form.about && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-slate-400 text-sm block mb-1">Description</label>
              <textarea rows={4} value={form.about.description || ''} onChange={e => setForm({ ...form, about: { ...form.about, description: e.target.value } })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
            {[
              { label: 'Years of Experience', key: 'yearsOfExperience', type: 'number' },
              { label: 'Projects Completed', key: 'projectsCompleted', type: 'number' },
              { label: 'Clients Satisfied', key: 'clientsSatisfied', type: 'number' },
              { label: 'Profile Image URL', key: 'profileImage', type: 'text' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-slate-400 text-sm block mb-1">{label}</label>
                <input type={type} value={form.about[key] || ''} onChange={e => setForm({ ...form, about: { ...form.about, [key]: type === 'number' ? +e.target.value : e.target.value } })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            ))}
            <div>
              <label className="text-slate-400 text-sm block mb-1">Availability</label>
              <select value={form.about.availability || 'available'} onChange={e => setForm({ ...form, about: { ...form.about, availability: e.target.value } })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="not-available">Not Available</option>
              </select>
            </div>
          </div>
        )}

        {/* CONTACT TAB */}
        {activeTab === 'contact' && form.contact && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['email', 'phone', 'whatsapp', 'address', 'timezone'].map(key => (
              <div key={key}>
                <label className="text-slate-400 text-sm block mb-1 capitalize">{key}</label>
                <input value={form.contact[key] || ''} onChange={e => setForm({ ...form, contact: { ...form.contact, [key]: e.target.value } })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            ))}
          </div>
        )}

        {/* SOCIAL TAB */}
        {activeTab === 'social' && form.social && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['github', 'linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'fiverr', 'upwork'].map(key => (
              <div key={key}>
                <label className="text-slate-400 text-sm block mb-1 capitalize">{key}</label>
                <input type="url" value={form.social[key] || ''} onChange={e => setForm({ ...form, social: { ...form.social, [key]: e.target.value } })}
                  placeholder="https://" className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            ))}
          </div>
        )}

        {/* SEO TAB */}
        {activeTab === 'seo' && form.seo && (
          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm block mb-1">SEO Title</label>
              <input value={form.seo.title || ''} onChange={e => setForm({ ...form, seo: { ...form.seo, title: e.target.value } })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Meta Description</label>
              <textarea rows={3} value={form.seo.description || ''} onChange={e => setForm({ ...form, seo: { ...form.seo, description: e.target.value } })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">Keywords (comma separated)</label>
              <input value={form.seo.keywords?.join(', ') || ''} onChange={e => setForm({ ...form, seo: { ...form.seo, keywords: e.target.value.split(',').map((s: string) => s.trim()) } })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1">OG Image URL</label>
              <input type="url" value={form.seo.ogImage || ''} onChange={e => setForm({ ...form, seo: { ...form.seo, ogImage: e.target.value } })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
