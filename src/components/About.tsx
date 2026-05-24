export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs tracking-[0.3em] uppercase text-primary font-mono">About</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 mb-4">
            Who <span className="gradient-text">I Am</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5 text-muted leading-relaxed">
            <p>
              Platform and full-stack engineer with <span className="text-white font-semibold">4+ years</span> of production
              experience building AI-assisted developer tooling, cloud-native APIs,
              and enterprise automation systems.
            </p>
            <p>
              Currently leading <span className="text-white font-semibold">GitHub Copilot and AI governance rollouts</span>{' '}
              at Wipro, encompassing onboarding, policy, and compliance frameworks for
              500+ engineers across the organisation.
            </p>
            <p>
              Holds an <span className="text-white font-semibold">MSc in Advanced Computer Science</span> from the University
              of Leicester, with hands-on expertise in LLM integration, prompt
              engineering, and responsible AI adoption.
            </p>
            <p className="text-white/60 border-l-2 border-primary/40 pl-4 italic">
              Passionate about bridging the gap between AI capabilities and
              responsible deployment — building systems that are not just
              intelligent, but trustworthy and aligned with human values.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { n: '4+', l: 'Years Experience' },
              { n: '500+', l: 'Engineers Enabled' },
              { n: '15+', l: 'Projects Delivered' },
              { n: 'MSc', l: 'Advanced CS (Distinction)' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl p-6 text-center border border-white/5 bg-white/[0.02] hover:border-primary/20 hover:-translate-y-1 transition-all">
                <div className="text-3xl sm:text-4xl font-extrabold gradient-text">{s.n}</div>
                <div className="text-xs sm:text-sm text-muted mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
