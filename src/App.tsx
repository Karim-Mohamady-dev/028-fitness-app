import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Barbell,
  CalendarCheck,
  Check,
  ChartLine,
  Flame,
  Heart,
  List,
  Timer,
  Users,
  X,
} from '@phosphor-icons/react'
import { getInitialLang, locales, saveLang, type Dict, type Lang } from './i18n'

const ICONS: Record<string, typeof ChartLine> = {
  CalendarCheck,
  ChartLine,
  Users,
  Heart,
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    el.querySelectorAll('.reveal').forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
  return ref
}

function Tagline({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const words = text.split(' ')
  return (
    <section aria-label="tagline" className="mx-auto max-w-6xl px-4 py-24 sm:px-8">
      <div ref={ref} className="mx-auto max-w-[680px]">
        <p className="heading-3 text-white sm:text-5xl sm:leading-none">
          {words.map((w, i) => (
            <span key={i} className={`tagline-word ${on ? 'on' : ''}`} style={{ transitionDelay: on ? `${i * 60}ms` : '0ms' }}>
              {w}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}

function loadSet(key: string): Set<number> {
  try {
    const raw = localStorage.getItem(key)
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set()
  } catch {
    return new Set()
  }
}

function App() {
  const [lang, setLang] = useState<Lang>(() => getInitialLang())
  const dict: Dict = locales[lang]
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [planIdx, setPlanIdx] = useState(0)
  const [doneDays, setDoneDays] = useState<Set<number>>(() => loadSet('pulsefit-week'))
  const [doneHabits, setDoneHabits] = useState<Set<number>>(() => loadSet('pulsefit-habits'))
  const rootRef = useReveal()

  const changeLang = (l: Lang) => {
    setLang(l)
    saveLang(l)
  }

  const toggleDay = (i: number) => {
    setDoneDays((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      try {
        localStorage.setItem('pulsefit-week', JSON.stringify([...next]))
      } catch {
        /* storage unavailable */
      }
      return next
    })
  }
  const toggleHabit = (i: number) => {
    setDoneHabits((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      try {
        localStorage.setItem('pulsefit-habits', JSON.stringify([...next]))
      } catch {
        /* storage unavailable */
      }
      return next
    })
  }
  const resetWeek = () => {
    setDoneDays(new Set())
    try {
      localStorage.removeItem('pulsefit-week')
    } catch {
      /* storage unavailable */
    }
  }

  const plan = dict.demo.plans[planIdx]
  const trainDays = dict.demo.workouts.filter((w) => w !== 'Rest' && w !== 'راحة').length
  const doneCount = [...doneDays].filter((i) => dict.demo.workouts[i] !== 'Rest' && dict.demo.workouts[i] !== 'راحة').length
  const pct = trainDays ? Math.round((doneCount / trainDays) * 100) : 0

  const navLinks = [
    { href: '#plans', label: dict.nav.links[0] },
    { href: '#how', label: dict.nav.links[1] },
    { href: '#pricing', label: dict.nav.links[2] },
    { href: '#faq', label: dict.nav.links[3] },
  ]

  return (
    <div ref={rootRef} className="min-h-screen bg-[#181818] text-white">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:rounded-lg focus:bg-orange-700 focus:px-4 focus:py-2 focus:text-white">
        {lang === 'ar' ? 'تخطَّ إلى المحتوى' : 'Skip to content'}
      </a>

      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <nav aria-label="main" className="flex w-full max-w-5xl items-center justify-between rounded-2xl border border-[#313131] bg-[#1f1f1f]/90 px-4 py-2 shadow-sm backdrop-blur-md">
          <a href="#top" className="flex items-center gap-2" aria-current="page">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-700 text-white">
              <Flame size={20} weight="bold" />
            </span>
            <span className="title-1 font-semibold">{dict.nav.brand}</span>
          </a>
          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="body-5 text-neutral-300 transition-colors duration-300 ease-base hover:text-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-[#313131] p-1" role="group" aria-label={dict.nav.langLabel}>
              <button type="button" onClick={() => changeLang('en')} aria-pressed={lang === 'en'} className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-300 ease-base ${lang === 'en' ? 'bg-orange-700 text-white' : 'text-neutral-300 hover:text-orange-400'}`}>
                EN
              </button>
              <button type="button" onClick={() => changeLang('ar')} aria-pressed={lang === 'ar'} className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-300 ease-base ${lang === 'ar' ? 'bg-orange-700 text-white' : 'text-neutral-300 hover:text-orange-400'}`}>
                عربي
              </button>
            </div>
            <a href="#pricing" className="button-sm hidden rounded-xl bg-orange-700 px-3 py-2 text-white transition-all duration-300 ease-base hover:bg-orange-800 active:scale-[0.98] sm:inline-block">
              {dict.nav.cta}
            </a>
            <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="menu" className="rounded-lg p-2 text-neutral-200 hover:bg-[#272727] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 md:hidden">
              {menuOpen ? <X size={22} /> : <List size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#181818]/95 pt-24 backdrop-blur-md md:hidden">
          <ul className="flex flex-col gap-2 px-8">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setMenuOpen(false)} className="title-1 block rounded-xl px-4 py-3 hover:bg-[#272727]">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#pricing" onClick={() => setMenuOpen(false)} className="button-md mt-4 block rounded-xl bg-orange-700 px-4 py-2 text-center text-white">
                {dict.nav.cta}
              </a>
            </li>
          </ul>
        </div>
      )}

      <main id="main">
        <section id="top" className="px-4 pb-16 pt-32 sm:px-8 sm:pt-40">
          <div className="mx-auto max-w-6xl">
            <div className="reveal mx-auto max-w-[680px] text-center">
              <p className="caption-4 inline-block rounded-full border border-orange-700/50 bg-orange-700/10 px-3 py-1 text-orange-300">{dict.hero.eyebrow}</p>
              <h1 className="hero-gradient-text-dark heading-1 mt-6 text-4xl sm:text-6xl">{dict.hero.title}</h1>
              <p className="body-3 mx-auto mt-6 max-w-[680px] text-neutral-300">{dict.hero.subtitle}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a href="#plans" className="button-md inline-flex items-center gap-2 rounded-xl bg-orange-700 px-3 py-2 text-white transition-all duration-300 ease-base hover:bg-orange-800 active:scale-[0.98]">
                  {dict.hero.ctaPrimary} <ArrowRight size={18} />
                </a>
                <a href="#how" className="button-md rounded-xl border border-[#313131] bg-[#1f1f1f] px-3 py-2 text-white transition-all duration-300 ease-base hover:border-orange-700 hover:text-orange-400 active:scale-[0.98]">
                  {dict.hero.ctaSecondary}
                </a>
              </div>
              <p className="caption-2 mt-8 text-neutral-400">{dict.hero.proofText}</p>
            </div>

            <div className="reveal mx-auto mt-16 max-w-3xl rounded-2xl border border-[#313131] bg-[#1f1f1f] p-4 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="caption-4 text-neutral-400">{lang === 'ar' ? 'لوحة هذا الأسبوع' : 'This week dashboard'}</p>
                  <p className="title-1 mt-1 font-semibold">{plan.name}</p>
                </div>
                <span className="flex items-center gap-2 rounded-full bg-orange-700/10 px-3 py-1 text-orange-300">
                  <Flame size={16} /> <span className="caption-4 font-semibold">{pct}%</span>
                </span>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="caption-4 text-neutral-400">{lang === 'ar' ? 'جلسات منجزة' : 'Sessions done'}</p>
                  <p className="caption-4 text-neutral-400">{doneCount} / {trainDays}</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#272727]">
                  <div className="h-full rounded-full bg-orange-700 transition-all duration-500 ease-base" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Barbell, label: lang === 'ar' ? 'جلسات هذا الأسبوع' : 'Sessions this week', value: String(trainDays) },
                  { icon: Timer, label: lang === 'ar' ? 'مدة الجلسة' : 'Session length', value: plan.duration },
                  { icon: ChartLine, label: lang === 'ar' ? 'التركيز' : 'Focus', value: plan.focus },
                ].map((c) => (
                  <div key={c.label} className="rounded-xl border border-[#313131] bg-[#272727] p-4">
                    <c.icon size={22} className="text-orange-400" />
                    <p className="caption-4 mt-2 text-neutral-400">{c.label}</p>
                    <p className="title-3 mt-1 font-semibold">{c.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-8">
          <div className="reveal max-w-[680px]">
            <p className="caption-4 text-orange-400">{dict.benefits.eyebrow}</p>
            <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.benefits.title}</h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {dict.benefits.items.map((b) => {
              const Icon = ICONS[b.icon] ?? ChartLine
              return (
                <article key={b.title} className="reveal rounded-2xl border border-[#313131] bg-[#1f1f1f] p-8 transition-all duration-300 ease-base hover:border-orange-700/50">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-700/10 text-orange-400">
                    <Icon size={24} />
                  </span>
                  <h3 className="heading-6 mt-6">{b.title}</h3>
                  <p className="body-3 mt-2 text-neutral-300">{b.text}</p>
                </article>
              )
            })}
          </div>
        </section>

        <Tagline text={dict.tagline} />

        <section id="how" className="bg-[#1f1f1f] px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="reveal max-w-[680px]">
              <p className="caption-4 text-orange-400">{dict.how.eyebrow}</p>
              <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.how.title}</h2>
            </div>
            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              {dict.how.steps.map((s, i) => (
                <li key={s.title} className="reveal rounded-2xl border border-[#313131] bg-[#272727] p-8">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-700 text-base font-semibold text-white">{i + 1}</span>
                  <h3 className="heading-6 mt-6">{s.title}</h3>
                  <p className="body-3 mt-2 text-neutral-300">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Weekly planner demo */}
        <section id="plans" className="mx-auto max-w-6xl px-4 py-24 sm:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <p className="caption-4 text-orange-400">{dict.demo.eyebrow}</p>
            <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.demo.title}</h2>
            <p className="body-3 mt-4 text-neutral-300">{dict.demo.subtitle}</p>
          </div>
          <div className="reveal mt-12 flex flex-wrap justify-center gap-4" role="tablist" aria-label="plans">
            {dict.demo.plans.map((p, i) => (
              <button key={p.name} type="button" role="tab" aria-selected={planIdx === i} onClick={() => setPlanIdx(i)} className={`rounded-xl border px-3 py-2 transition-all duration-300 ease-base active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${planIdx === i ? 'border-orange-700 bg-orange-700 text-white' : 'border-[#313131] bg-[#1f1f1f] text-neutral-200 hover:border-orange-700'}`}>
                <span className="button-md block">{p.name}</span>
                <span className="caption-5 block opacity-80">{p.level}</span>
              </button>
            ))}
          </div>
          <div className="reveal mx-auto mt-8 max-w-3xl rounded-2xl border border-[#313131] bg-[#1f1f1f] p-6 sm:p-8">
            <p className="title-1 font-semibold">{plan.name}</p>
            <p className="body-3 mt-2 text-neutral-300">{plan.desc}</p>
            <p className="caption-2 mt-4 text-neutral-400">{plan.duration} · {plan.focus}</p>
            <div className="mt-8 space-y-2">
              {dict.demo.days.map((day, i) => {
                const isRest = dict.demo.workouts[i] === 'Rest' || dict.demo.workouts[i] === 'راحة'
                const done = doneDays.has(i)
                return (
                  <button key={day} type="button" onClick={() => !isRest && toggleDay(i)} disabled={isRest} aria-pressed={done} className={`flex w-full items-center justify-between rounded-xl border px-4 py-2 text-start transition-all duration-300 ease-base focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${isRest ? 'cursor-default border-[#313131] bg-[#272727] opacity-60' : done ? 'border-orange-700 bg-orange-700/10' : 'border-[#313131] bg-[#272727] hover:border-orange-700 active:scale-[0.98]'}`}>
                    <span className="flex items-center gap-4">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${done ? 'border-orange-700 bg-orange-700 text-white' : 'border-[#313131] text-neutral-400'}`}>
                        {done && <Check size={16} weight="bold" />}
                      </span>
                      <span>
                        <span className="title-3 block font-semibold">{day}</span>
                        <span className="caption-2 block text-neutral-400">{dict.demo.workouts[i]}</span>
                      </span>
                    </span>
                    <span className="caption-4 text-neutral-400">{isRest ? '' : done ? dict.demo.doneLabel : ''}</span>
                  </button>
                )
              })}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <p className="caption-2 text-neutral-400">
                {doneCount} / {trainDays} {lang === 'ar' ? 'جلسات منجزة' : 'sessions done'}
              </p>
              <button type="button" onClick={resetWeek} className="button-sm rounded-xl border border-[#313131] px-3 py-2 text-neutral-200 transition-all duration-300 ease-base hover:border-orange-700 hover:text-orange-400 active:scale-[0.98]">
                {dict.demo.reset}
              </button>
            </div>
          </div>

          {/* Habits */}
          <div className="reveal mx-auto mt-8 max-w-3xl rounded-2xl border border-[#313131] bg-[#1f1f1f] p-6 sm:p-8">
            <h3 className="heading-5">{dict.demo.habits.title}</h3>
            <ul className="mt-6 space-y-2">
              {dict.demo.habits.items.map((h, i) => {
                const done = doneHabits.has(i)
                return (
                  <li key={h.label}>
                    <button type="button" onClick={() => toggleHabit(i)} aria-pressed={done} className={`flex w-full items-center justify-between rounded-xl border px-4 py-2 text-start transition-all duration-300 ease-base focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${done ? 'border-orange-700 bg-orange-700/10' : 'border-[#313131] bg-[#272727] hover:border-orange-700 active:scale-[0.98]'}`}>
                      <span className="flex items-center gap-4">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${done ? 'border-orange-700 bg-orange-700 text-white' : 'border-[#313131] text-neutral-400'}`}>
                          {done && <Check size={16} weight="bold" />}
                        </span>
                        <span className={`title-3 font-medium ${done ? 'line-through opacity-60' : ''}`}>{h.label}</span>
                      </span>
                      <span className="caption-4 text-orange-400">+{h.xp} {lang === 'ar' ? 'نقاط' : 'pts'}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-8">
          <div className="reveal max-w-[680px]">
            <p className="caption-4 text-orange-400">{dict.testimonials.eyebrow}</p>
            <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.testimonials.title}</h2>
            <p className="caption-2 mt-4 rounded-lg bg-orange-700/10 px-3 py-2 text-orange-300">{dict.testimonials.note}</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {dict.testimonials.items.map((t) => (
              <figure key={t.name} className="reveal rounded-2xl border border-[#313131] bg-[#1f1f1f] p-8">
                <blockquote className="body-3 mt-4 text-neutral-200">{t.quote}</blockquote>
                <figcaption className="mt-6">
                  <p className="title-3 font-semibold">{t.name}</p>
                  <p className="caption-2 text-neutral-400">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="pricing" className="bg-[#1f1f1f] px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="reveal max-w-[680px]">
              <p className="caption-4 text-orange-400">{dict.pricing.eyebrow}</p>
              <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.pricing.title}</h2>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {dict.pricing.plans.map((p) => (
                <article key={p.name} className={`reveal rounded-2xl border bg-[#272727] p-8 ${p.name === 'Coach' || p.name === 'المدرب' ? 'border-orange-700' : 'border-[#313131]'}`}>
                  <h3 className="heading-5">{p.name}</h3>
                  <p className="heading-3 mt-4">{p.price}</p>
                  <p className="caption-2 text-neutral-400">{p.period}</p>
                  <ul className="mt-6 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="body-5 flex items-start gap-2 text-neutral-200">
                        <Check size={16} weight="bold" className="mt-1 shrink-0 text-orange-400" /> {f}
                      </li>
                    ))}
                  </ul>
                  <a href="#plans" className={`button-md mt-8 block rounded-xl px-3 py-2 text-center transition-all duration-300 ease-base active:scale-[0.98] ${p.name === 'Coach' || p.name === 'المدرب' ? 'bg-orange-700 text-white hover:bg-orange-800' : 'border border-[#313131] hover:border-orange-700 hover:text-orange-400'}`}>
                    {p.cta}
                  </a>
                </article>
              ))}
            </div>
            <p className="caption-2 mt-8 text-neutral-400">{dict.pricing.note}</p>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-4xl px-4 py-24 sm:px-8">
          <div className="reveal max-w-[680px]">
            <p className="caption-4 text-orange-400">{dict.faq.eyebrow}</p>
            <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.faq.title}</h2>
          </div>
          <div className="mt-12 space-y-4">
            {dict.faq.items.map((f, i) => (
              <div key={f.q} className="reveal rounded-2xl border border-[#313131] bg-[#1f1f1f]">
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i} className="flex w-full items-center justify-between gap-4 px-6 py-4 text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-2xl">
                  <span className="title-3 font-semibold">{f.q}</span>
                  <span className="text-orange-400 transition-transform duration-500 ease-base" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {openFaq === i && <p className="body-3 px-6 pb-6 text-neutral-300">{f.a}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-8">
          <div className="reveal rounded-2xl bg-orange-700 px-8 py-16 text-center text-white">
            <h2 className="heading-2 mx-auto max-w-[680px] text-4xl sm:text-5xl">{dict.finalCta.title}</h2>
            <p className="body-3 mx-auto mt-4 max-w-[680px] text-orange-100">{dict.finalCta.text}</p>
            <a href="#plans" className="button-md mt-8 inline-block rounded-xl bg-white px-3 py-2 text-orange-800 transition-all duration-300 ease-base hover:bg-orange-50 active:scale-[0.98]">
              {dict.finalCta.cta}
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#313131] bg-[#1f1f1f] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-4">
            <div>
              <p className="title-1 flex items-center gap-2 font-semibold">
                <Flame size={20} className="text-orange-400" /> {dict.nav.brand}
              </p>
              <p className="body-3 mt-4 text-neutral-300">{dict.footer.brandText}</p>
            </div>
            {dict.footer.columns.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <p className="title-3 font-semibold">{c.title}</p>
                <ul className="mt-4 space-y-2">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="#top" className="body-5 text-neutral-300 transition-colors duration-300 ease-base hover:text-orange-400">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-[#313131] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="caption-2 text-neutral-400">© 2026 {dict.nav.brand}. {dict.footer.copyright}</p>
            <p className="caption-2 text-neutral-400">{dict.footer.madeWith}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
