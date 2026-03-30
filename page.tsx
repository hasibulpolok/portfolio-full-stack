// ============================================================
// FILE: frontend/src/app/page.tsx  (Public Portfolio - Homepage)
// ============================================================
'use client';
import { useSiteSettings, useProjects, useSkills, useExperience, useBlogs, useTestimonials, useSubmitContact } from '@/hooks/usePortfolio';
import { useState } from 'react';

// ---- HERO SECTION ----
function HeroSection({ hero }: { hero: any }) {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6">
      <div className="max-w-4xl mx-auto text-center">
        {hero?.profileImage && (
          <img src={hero.profileImage} alt={hero.name} className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-emerald-500 shadow-2xl" />
        )}
        <p className="text-emerald-400 text-lg mb-2">{hero?.greeting}</p>
        <h1 className="text-5xl font-bold mb-4">{hero?.name}</h1>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {hero?.roles?.map((r: string, i: number) => (
            <span key={i} className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-4 py-1.5 rounded-full text-sm">{r}</span>
          ))}
        </div>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">{hero?.bio}</p>
        <div className="flex gap-4 justify-center">
          <a href={hero?.ctaLink || '#projects'} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition-all">{hero?.ctaText || 'View My Work'}</a>
          {hero?.resumeUrl && (
            <a href={hero.resumeUrl} target="_blank" rel="noreferrer" className="border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 px-8 py-3 rounded-lg font-semibold transition-all">Download CV</a>
          )}
        </div>
      </div>
    </section>
  );
}

// ---- ABOUT SECTION ----
function AboutSection({ about }: { about: any }) {
  return (
    <section id="about" className="py-20 bg-slate-800/50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">{about?.title || 'About Me'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {about?.profileImage && (
            <img src={about.profileImage} alt="About" className="rounded-2xl shadow-2xl w-full max-h-96 object-cover" />
          )}
          <div>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">{about?.description}</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Years Experience', value: about?.yearsOfExperience },
                { label: 'Projects Done', value: about?.projectsCompleted },
                { label: 'Happy Clients', value: about?.clientsSatisfied },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-700 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-400">{stat.value || 0}+</div>
                  <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            {about?.availability === 'available' && (
              <div className="mt-6 flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Available for new projects
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- SKILLS SECTION ----
function SkillsSection({ skills }: { skills: any[] }) {
  const grouped = skills?.reduce((acc: any, s: any) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <section id="skills" className="py-20 bg-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Skills & Technologies</h2>
        {Object.entries(grouped || {}).map(([cat, items]: any) => (
          <div key={cat} className="mb-10">
            <h3 className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">{cat}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((s: any) => (
                <div key={s._id} className="bg-slate-800 rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-white font-medium">{s.name}</span>
                    <span className="text-emerald-400 text-sm">{s.proficiency}%</span>
                  </div>
                  <div className="bg-slate-700 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${s.proficiency}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---- PROJECTS SECTION ----
function ProjectsSection({ projects }: { projects: any[] }) {
  return (
    <section id="projects" className="py-20 bg-slate-800/50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((p: any) => (
            <a href={`/projects/${p.slug}`} key={p._id} className="bg-slate-800 rounded-2xl overflow-hidden hover:ring-2 hover:ring-emerald-500 transition-all group">
              <div className="relative overflow-hidden">
                <img src={p.thumbnail} alt={p.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
                {p.featured && <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">Featured</span>}
              </div>
              <div className="p-5">
                <h3 className="text-white font-semibold text-lg mb-2">{p.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{p.shortDescription}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {p.techStack?.slice(0, 4).map((t: string) => (
                    <span key={t} className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">{t}</span>
                  ))}
                </div>
                <div className="flex gap-3">
                  {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 text-sm" onClick={e => e.stopPropagation()}>Live ↗</a>}
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-300 text-sm" onClick={e => e.stopPropagation()}>GitHub ↗</a>}
                </div>
              </div>
            </a>
          ))}
        </div>
        <div className="text-center mt-10">
          <a href="/projects" className="border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 px-8 py-3 rounded-lg font-semibold transition-all">View All Projects</a>
        </div>
      </div>
    </section>
  );
}

// ---- EXPERIENCE SECTION ----
function ExperienceSection({ experiences }: { experiences: any[] }) {
  return (
    <section id="experience" className="py-20 bg-slate-900">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Experience</h2>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-700"></div>
          {experiences?.map((exp: any) => (
            <div key={exp._id} className="relative pl-16 mb-10">
              <div className="absolute left-4 top-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
              <div className="bg-slate-800 rounded-2xl p-6">
                <div className="flex flex-wrap justify-between items-start mb-2">
                  <h3 className="text-white font-semibold text-lg">{exp.title}</h3>
                  <span className="text-slate-400 text-sm">
                    {new Date(exp.startDate).getFullYear()} – {exp.isCurrent ? 'Present' : new Date(exp.endDate).getFullYear()}
                  </span>
                </div>
                <p className="text-emerald-400 mb-1">{exp.company}</p>
                <p className="text-slate-400 text-sm mb-2">{exp.location} · {exp.type}</p>
                <p className="text-slate-300 text-sm mb-3">{exp.description}</p>
                <div className="flex flex-wrap gap-2">
                  {exp.techStack?.map((t: string) => (
                    <span key={t} className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- BLOG SECTION ----
function BlogSection({ blogs }: { blogs: any[] }) {
  return (
    <section id="blog" className="py-20 bg-slate-800/50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Latest Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs?.map((b: any) => (
            <a href={`/blog/${b.slug}`} key={b._id} className="bg-slate-800 rounded-2xl overflow-hidden hover:ring-2 hover:ring-emerald-500 transition-all">
              <img src={b.coverImage} alt={b.title} className="w-full h-44 object-cover" />
              <div className="p-5">
                <div className="flex gap-2 flex-wrap mb-2">
                  {b.tags?.slice(0, 3).map((t: string) => (
                    <span key={t} className="text-emerald-400 text-xs">#{t}</span>
                  ))}
                </div>
                <h3 className="text-white font-semibold mb-2">{b.title}</h3>
                <p className="text-slate-400 text-sm mb-3">{b.excerpt}</p>
                <span className="text-slate-500 text-xs">{b.readTime} min read</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- TESTIMONIALS SECTION ----
function TestimonialsSection({ testimonials }: { testimonials: any[] }) {
  return (
    <section id="testimonials" className="py-20 bg-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">What Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials?.filter((t: any) => t.isApproved).map((t: any) => (
            <div key={t._id} className="bg-slate-800 rounded-2xl p-6">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
              </div>
              <p className="text-slate-300 italic mb-6">"{t.content}"</p>
              <div className="flex items-center gap-3">
                {t.avatar && <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />}
                <div>
                  <p className="text-white font-medium">{t.name}</p>
                  <p className="text-slate-400 text-sm">{t.title}{t.company && ` @ ${t.company}`}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- CONTACT SECTION ----
function ContactSection({ contact, social }: { contact: any; social: any }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', phone: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const submitContact = useSubmitContact();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await submitContact.mutateAsync(form);
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '', phone: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-20 bg-slate-800/50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Get In Touch</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <p className="text-slate-300 text-lg mb-8">Have a project in mind? Let's talk and build something amazing together.</p>
            <div className="space-y-4 mb-8">
              {contact?.email && <div className="flex items-center gap-3 text-slate-300"><span className="text-emerald-400">✉</span>{contact.email}</div>}
              {contact?.phone && <div className="flex items-center gap-3 text-slate-300"><span className="text-emerald-400">📞</span>{contact.phone}</div>}
              {contact?.address && <div className="flex items-center gap-3 text-slate-300"><span className="text-emerald-400">📍</span>{contact.address}</div>}
            </div>
            <div className="flex gap-4">
              {Object.entries(social || {}).filter(([, v]) => v).map(([k, v]) => (
                <a key={k} href={v as string} target="_blank" rel="noreferrer"
                   className="bg-slate-700 hover:bg-emerald-500 text-slate-300 hover:text-white w-10 h-10 rounded-lg flex items-center justify-center transition-all text-sm uppercase">
                  {k[0]}
                </a>
              ))}
            </div>
          </div>
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === 'sent' && <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 p-4 rounded-lg">Message sent! I'll get back to you soon.</div>}
            {status === 'error' && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg">Something went wrong. Please try again.</div>}
            <div className="grid grid-cols-2 gap-4">
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Your Name" className="col-span-1 bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                placeholder="Email Address" className="col-span-1 bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
              placeholder="Subject" className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
              placeholder="Your Message" className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            <button type="submit" disabled={status === 'sending'}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-white font-semibold py-3 rounded-lg transition-all">
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ---- MAIN PAGE ----
export default function HomePage() {
  const { data: site, isLoading: siteLoading } = useSiteSettings();
  const { data: projectsData } = useProjects({ featured: true, limit: 6 });
  const { data: skills } = useSkills();
  const { data: experiences } = useExperience();
  const { data: blogsData } = useBlogs({ limit: 3 });
  const { data: testimonials } = useTestimonials();

  if (siteLoading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-emerald-400 text-lg">Loading...</div>
    </div>
  );

  return (
    <main className="bg-slate-900">
      <HeroSection hero={site?.hero} />
      <AboutSection about={site?.about} />
      <SkillsSection skills={skills || []} />
      <ProjectsSection projects={projectsData?.data || []} />
      <ExperienceSection experiences={experiences || []} />
      <BlogSection blogs={blogsData?.data || []} />
      <TestimonialsSection testimonials={testimonials || []} />
      <ContactSection contact={site?.contact} social={site?.social} />
    </main>
  );
}
