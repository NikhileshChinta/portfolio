import { useEffect, useState } from 'react'

const roles = [
  'AI Software Engineer',
  'Platform & Full-Stack Engineer',
  'LLM & AI Integration Specialist',
  'AI Governance Researcher',
]

export default function Hero() {
  const [text, setText] = useState('')
  const [idx, setIdx] = useState(0)
  const [ci, setCi] = useState(0)
  const [del, setDel] = useState(false)

  useEffect(() => {
    const cur = roles[idx]
    let t: ReturnType<typeof setTimeout>
    if (!del && ci < cur.length) {
      t = setTimeout(() => { setText(cur.slice(0, ci + 1)); setCi(ci + 1) }, 60)
    } else if (del && ci > 0) {
      t = setTimeout(() => { setText(cur.slice(0, ci - 1)); setCi(ci - 1) }, 30)
    } else if (!del && ci === cur.length) {
      t = setTimeout(() => setDel(true), 2500)
    } else if (del && ci === 0) {
      setDel(false); setIdx((idx + 1) % roles.length)
    }
    return () => clearTimeout(t)
  }, [ci, del, idx])

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs tracking-wider uppercase mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Available for opportunities
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
          Hi, I'm <span className="gradient-text">Nikhilesh</span>{' '}
          <span className="text-white/90">Chinta</span>
        </h1>
        <div className="h-12 flex items-center justify-center mb-6">
          <span className="text-xl sm:text-2xl text-muted font-light">
            {text}
            <span className="inline-block w-0.5 h-6 bg-primary ml-1 animate-pulse" />
          </span>
        </div>
        <p className="text-muted text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Building intelligent systems at scale — from AI-powered developer tooling
          and cloud-native APIs to enterprise automation and responsible AI governance.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <a href="#projects" className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5">
            View My Work
          </a>
          <a href="#contact" className="px-6 py-3 border border-white/20 hover:border-primary/50 text-white font-medium rounded-lg transition-all hover:-translate-y-0.5">
            Get In Touch
          </a>
        </div>
      </div>
    </section>
  )
}
