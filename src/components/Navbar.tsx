const links = ['About', 'Experience', 'Projects', 'Skills', 'Contact']

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#hero" className="text-xl font-bold gradient-text">
          Nikhilesh<span className="text-white/40">.</span>dev
        </a>
        <div className="hidden sm:flex items-center gap-6">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-muted hover:text-white transition-colors">
              {l}
            </a>
          ))}
          <a href="#contact" className="ml-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-all">
            Hire Me
          </a>
        </div>
      </div>
    </nav>
  )
}
