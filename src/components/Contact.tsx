export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-16">
          <span className="text-xs tracking-[0.3em] uppercase text-primary font-mono">Connect</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 mb-4">
            Let's <span className="gradient-text">Talk</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto" />
        </div>
        <p className="text-muted text-base sm:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
          I'm always open to discussing AI engineering, platform architecture,
          or governance research. Let's connect.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a
            href="mailto:nikhilesh.chinta38@gmail.com"
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            Send an Email
          </a>
          <a
            href="https://linkedin.com/in/nikhileshchinta"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-white/20 hover:border-primary/50 text-white font-medium rounded-lg transition-all"
          >
            Connect on LinkedIn
          </a>
        </div>
        <div className="flex items-center justify-center gap-8">
          {[
            { l: 'LinkedIn', h: 'https://linkedin.com/in/nikhileshchinta' },
            { l: 'GitHub', h: 'https://github.com/NikhileshChinta' },
            { l: 'Email', h: 'mailto:nikhilesh.chinta38@gmail.com' },
          ].map((link) => (
            <a key={link.l} href={link.h} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-white transition-colors">
              {link.l} ↗
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
