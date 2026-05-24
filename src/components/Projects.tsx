const projects = [
  {
    title: 'GitHub Copilot Enterprise Rollout',
    subtitle: 'AI Developer Tooling Platform',
    period: 'Wipro — 2025',
    desc: 'Led enterprise-scale deployment of GitHub Copilot to 500+ engineers with onboarding workflows, training, adoption dashboards, and AI governance policies.',
    tags: ['GitHub Copilot', 'AI Governance', 'GitHub Actions', 'Python'],
    highlights: ['500+ engineers onboarded', 'Enterprise AI governance framework', 'Productivity analytics dashboard'],
  },
  {
    title: 'Full-Stack Cloud Migration Suite',
    subtitle: 'Cloud-Native Modernisation',
    period: 'Astin IT Solutions — 2023–2024',
    desc: 'Migrated 3+ client apps from on-prem to AWS/Azure, rearchitecting monoliths into cloud-native microservices with automated CI/CD pipelines.',
    tags: ['AWS', 'Azure', 'Node.js', 'React', 'Docker'],
    highlights: ['Zero-downtime migrations', 'Automated CI/CD pipelines', '40% faster deployments'],
  },
  {
    title: 'REST/GraphQL API Platform',
    subtitle: 'Production-Grade API Gateway',
    period: 'Astin IT Solutions — 2023–2024',
    desc: 'Unified API platform with OAuth2 auth, rate-limiting, versioned endpoints, and payment gateway integration with webhook processing.',
    tags: ['Node.js', 'Express', 'GraphQL', 'OAuth2', 'PostgreSQL'],
    highlights: ['1M+ requests/month at 99.9% uptime', 'Multi-tenant auth', 'Webhook retry logic'],
  },
  {
    title: 'AI Governance & Policy Framework',
    subtitle: 'Responsible AI Adoption',
    period: 'Wipro — 2025',
    desc: 'Comprehensive AI governance policies for enterprise LLM adoption — acceptable use, data privacy, security guardrails, and regulatory alignment.',
    tags: ['AI Governance', 'LLM Safety', 'Policy Design', 'Compliance'],
    highlights: ['Enterprise-wide AI policy', 'LLM security guidelines', 'Regulatory compliance'],
  },
  {
    title: 'Developer Productivity Dashboard',
    subtitle: 'AI-Driven Engineering Analytics',
    period: 'Wipro — 2025',
    desc: 'Analytics dashboards tracking developer productivity post-Copilot — cycle time, PR throughput, and satisfaction metrics for data-informed decisions.',
    tags: ['Python', 'React', 'Analytics', 'GitHub API'],
    highlights: ['Real-time metrics dashboard', 'Data-driven tooling decisions', '25% faster PR cycle time'],
  },
]

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs tracking-[0.3em] uppercase text-primary font-mono">Portfolio</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 mb-4">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 sm:p-8 group">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 text-lg">
                {['🤖', '☁️', '🔌', '🛡️', '📊'][i]}
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:gradient-text transition-all">{p.title}</h3>
              <p className="text-xs text-primary/80 font-mono mb-1">{p.subtitle}</p>
              <p className="text-[11px] text-muted mb-4">{p.period}</p>
              <p className="text-sm text-muted leading-relaxed mb-5">{p.desc}</p>
              <div className="space-y-1 mb-5">
                {p.highlights.map((h, j) => (
                  <div key={j} className="flex items-start gap-2 text-xs text-muted">
                    <span className="text-primary mt-0.5 shrink-0">✦</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="px-2.5 py-1 bg-white/5 border border-white/10 text-muted text-[10px] rounded-full">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
