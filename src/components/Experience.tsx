const exp = [
  {
    period: 'Sep 2025 – Present',
    role: 'Platform Engineer — AI & Developer Tooling',
    company: 'Wipro · Hyderabad, India',
    items: [
      'Architected enterprise-scale rollout of GitHub Copilot to 500+ engineers, including onboarding, training, and adoption dashboards.',
      'Authored AI governance policies covering LLM acceptable use, data security, IP protection, and regulatory compliance.',
      'Built workflow automation into CI/CD pipelines using GitHub Actions, reducing deployment cycle time.',
      'Partnered with business leads to embed responsible AI practices into engineering workflows.',
    ],
  },
  {
    period: 'Aug 2022 – Feb 2025',
    role: 'Software Developer — Full-Stack & Cloud',
    company: 'Astin IT Solutions · Birmingham, UK',
    items: [
      'Designed full-stack apps using Python, Node.js, Express, and React for production deployments.',
      'Built RESTful and GraphQL APIs with versioning, rate-limiting, and OAuth2 authentication.',
      'Migrated 3+ client apps to AWS and Azure, managing infrastructure and performance optimisation.',
      'Established CI/CD pipelines with GitHub Actions, eliminating manual release steps.',
    ],
  },
  {
    period: 'Jan 2021 – Dec 2021',
    role: 'Web Developer',
    company: 'CloudyPeople · Leicester, UK',
    items: [
      'Built responsive SPAs using React, Bootstrap, and React Router in Agile sprints.',
      'Developed RESTful services with Core Java and Spring Boot.',
      'Load testing with JMeter and automated API testing with Selenium and Cucumber.',
    ],
  },
]

export default function Experience() {
  return (
    <section id="experience" className="py-24 px-6 bg-white/[0.02]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs tracking-[0.3em] uppercase text-primary font-mono">Career</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 mb-4">
            Experience <span className="gradient-text">Timeline</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto" />
        </div>
        <div className="space-y-12">
          {exp.map((e, i) => (
            <div key={i} className="relative pl-8 border-l-2 border-primary/30">
              <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs text-primary font-mono">{e.period}</span>
              <h3 className="text-lg font-bold text-white mt-1">{e.role}</h3>
              <p className="text-sm text-muted mb-3">{e.company}</p>
              <ul className="space-y-2">
                {e.items.map((item, j) => (
                  <li key={j} className="text-sm text-muted flex items-start gap-2">
                    <span className="text-primary mt-1.5 shrink-0">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
