const categories = [
  {
    title: 'AI & LLM',
    skills: [
      { n: 'GitHub Copilot', l: 95 },
      { n: 'Prompt Engineering', l: 90 },
      { n: 'LLM API Integration', l: 88 },
      { n: 'AI Governance', l: 85 },
    ],
  },
  {
    title: 'Languages',
    skills: [
      { n: 'Python', l: 92 },
      { n: 'JavaScript / Node.js', l: 90 },
      { n: 'TypeScript', l: 85 },
      { n: 'Java', l: 80 },
    ],
  },
  {
    title: 'Frontend',
    skills: [
      { n: 'React', l: 92 },
      { n: 'Tailwind CSS', l: 88 },
      { n: 'HTML / CSS', l: 92 },
    ],
  },
  {
    title: 'Backend & APIs',
    skills: [
      { n: 'Node.js / Express', l: 90 },
      { n: 'Spring Boot', l: 80 },
      { n: 'RESTful APIs', l: 92 },
      { n: 'GraphQL', l: 78 },
    ],
  },
  {
    title: 'Cloud & DevOps',
    skills: [
      { n: 'AWS', l: 82 },
      { n: 'Azure', l: 80 },
      { n: 'GitHub Actions', l: 90 },
      { n: 'CI/CD', l: 88 },
      { n: 'Docker', l: 82 },
    ],
  },
  {
    title: 'Databases',
    skills: [
      { n: 'MongoDB', l: 85 },
      { n: 'MySQL', l: 85 },
      { n: 'PostgreSQL', l: 78 },
      { n: 'Redis', l: 75 },
    ],
  },
]

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-6 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs tracking-[0.3em] uppercase text-primary font-mono">Expertise</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 mb-4">
            Tech <span className="gradient-text">Stack</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.title} className="glass-card rounded-2xl p-6 sm:p-8">
              <h3 className="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-6">{cat.title}</h3>
              <div className="space-y-4">
                {cat.skills.map((s) => (
                  <div key={s.n}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">{s.n}</span>
                      <span className="text-muted text-xs font-mono">{s.l}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${s.l}%`, background: 'linear-gradient(90deg, #0ea5e9, #6366f1)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
