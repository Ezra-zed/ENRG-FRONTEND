import { money } from '@/lib/format';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Check, Sun, Users, Zap } from 'lucide-react';
import { getGetHomeContentQueryKey, useGetHomeContent, SystemPreference } from '@workspace/api-client-react';
import { QueryState } from '@/components/feedback';


export function Home() {
  const [system, setSystem] = useState<SystemPreference>('on-grid');
  const query = useGetHomeContent({ type: system }, { query: { queryKey: getGetHomeContentQueryKey({ type: system }) } });
  const content = query.data;
  const fallback = {
    headline: system === 'on-grid' ? 'Your rooftop, working smarter.' : system === 'off-grid' ? 'Power that stays with you.' : 'The best of both worlds.',
    description: 'See what fits your home, your habits, and the way power reaches you.',
    benefits: ['Lower monthly electricity costs', 'One clear path from choice to installation', 'Support from verified local companies'],
    recommendedSize: system === 'on-grid' ? '2–4 kW' : '3–5 kW',
    startingPrice: 145000,
  };
  const item = content || fallback;
  return (
    <div>
      <section className="relative overflow-hidden bg-[#dfece0]">
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-16 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
          <div className="rise">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-card/70 px-3 py-1.5 text-xs font-bold text-accent">
              <span className="size-2 rounded-full bg-primary" />
              Solar, made human
            </div>
            <h1 data-testid="text-home-headline" className="max-w-2xl font-display text-[clamp(3.25rem,7vw,6.8rem)] font-bold leading-[.92] tracking-[-.07em] text-[#183d34]">
              Solar energy
              <br />
              <span className="text-accent">starts here.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#46645a]">Compare solar systems, explore solar equipment, connect with solar companies, and find the right solar solution for your home.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/quote" data-testid="link-home-quote" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3.5 text-sm font-bold text-accent-foreground hover:-translate-y-0.5 hover:shadow-xl">
                Tell us about your home <ArrowRight size={17} />
              </Link>
              <Link href="/marketplace" data-testid="link-home-marketplace" className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-card/60 px-5 py-3.5 text-sm font-bold text-accent hover:bg-card">
                Browse equipment
              </Link>
            </div>
          </div>
          <div className="rise rise-delay-2 relative min-h-[380px] overflow-hidden rounded-[2.5rem] bg-[#b4d1bf]">
            <div className="absolute -right-16 -top-12 size-72 rounded-full border-[24px] border-primary/70" />
            <div className="absolute -bottom-28 -left-10 size-80 rounded-full border-[30px] border-accent/80" />
            <div className="absolute inset-8 rotate-[-7deg] rounded-[2rem] border-2 border-[#6c9b82] bg-[#d2e2d0]/70 p-5 shadow-2xl">
              <div className="grid h-full grid-cols-4 gap-2.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="rounded-md border border-[#7ca58b] bg-[#a8c7b7]/80" />
                ))}
              </div>
            </div>
            <div className="absolute bottom-5 left-5 rounded-2xl bg-card/90 px-4 py-3 shadow-xl backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">The enrg approach</p>
              <p className="mt-1 font-display text-lg font-bold text-accent">Less guesswork. More daylight.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1320px] px-5 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Start with what you know</p>
            <h2 className="mt-3 max-w-sm font-display text-4xl font-bold leading-tight tracking-tight">Choose the right solar system for your home.</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Compare on-grid, off-grid, and hybrid solar systems to find an option that fits your home and energy needs.</p>
          </div>
          <div>
            <div className="grid gap-2 sm:grid-cols-3">
              {(['on-grid', 'off-grid', 'hybrid-grid'] as SystemPreference[]).map((type) => (
                <button key={type} data-testid={`button-system-${type}`} onClick={() => setSystem(type)} className={`rounded-2xl border p-4 text-left ${system === type ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-card hover:-translate-y-1 hover:shadow-lg'}`}>
                  <span className="mb-8 grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Zap size={17} />
                  </span>
                  <p className="font-display text-lg font-bold capitalize">{type.replaceAll('-', ' ')}</p>
                  <p className={`mt-1 text-xs ${system === type ? 'text-accent-foreground/75' : 'text-muted-foreground'}`}>{type === 'on-grid' ? 'Connected to the city grid' : type === 'off-grid' ? 'Independent power storage' : 'Grid plus battery backup'}</p>
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-3xl bg-[#f4e6bd] p-6 sm:p-8">
              <QueryState loading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#80651c]">A good fit for you</p>
                    <h3 data-testid="text-system-headline" className="mt-2 font-display text-2xl font-bold text-[#3c361e]">
                      {item.headline}
                    </h3>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-[#665a32]">{item.description}</p>
                    <ul className="mt-4 grid gap-2 text-sm text-[#4a4326]">
                      {item.benefits?.slice(0, 3).map((benefit) => (
                        <li key={benefit} className="flex items-center gap-2">
                          <Check size={15} className="text-accent" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-card/80 p-4">
                    <p className="text-xs text-muted-foreground">Typical home</p>
                    <p data-testid="text-recommended-size" className="mt-1 font-display text-2xl font-bold">
                      {item.recommendedSize || '2–4 kW'}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">From {money(item.startingPrice)}</p>
                  </div>
                </div>
              </QueryState>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-accent text-accent-foreground">
        <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-16 sm:grid-cols-3 lg:px-8">
          <div>
            <p className="font-display text-5xl font-bold">01</p>
            <p className="mt-4 font-semibold">Tell us what you need</p>
            <p className="mt-1 text-sm leading-6 text-accent-foreground/70">A few honest details about your home and your electricity use.</p>
          </div>
          <div>
            <p className="font-display text-5xl font-bold text-primary">02</p>
            <p className="mt-4 font-semibold">Meet your shortlist</p>
            <p className="mt-1 text-sm leading-6 text-accent-foreground/70">Relevant products and companies, not an endless catalogue.</p>
          </div>
          <div>
            <p className="font-display text-5xl font-bold">03</p>
            <p className="mt-4 font-semibold">Make the switch</p>
            <p className="mt-1 text-sm leading-6 text-accent-foreground/70">Compare quotes with the context to choose well.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={elementRef} className={`sarn-reveal ${visible ? 'is-visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const elementRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    let frameId = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          element.textContent = `${value.toLocaleString('en-IN')}${suffix}`;
          observer.disconnect();
          return;
        }
        const started = performance.now();
        let lastUpdate = started;
        const tick = (now: number) => {
          const progress = Math.min((now - started) / 1200, 1);
          if (progress === 1 || now - lastUpdate >= 50) {
            const count = Math.round(value * (1 - Math.pow(1 - progress, 3)));
            element.textContent = `${count.toLocaleString('en-IN')}${suffix}`;
            lastUpdate = now;
          }
          if (progress < 1) frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [value, suffix]);
  return <span ref={elementRef} className="sarn-count-up">0{suffix}</span>;
}

export function LandingPage() {
  const benefits = [
    {
      icon: Sun,
      number: '01',
      title: 'Know your return',
      text: 'See the economics of your rooftop before you commit, with a clear view of system fit and payback.',
    },
    {
      icon: Users,
      number: '02',
      title: 'Meet the right installer',
      text: 'Compare verified local companies with the context to ask better questions and choose with confidence.',
    },
    {
      icon: Zap,
      number: '03',
      title: 'Watch energy move',
      text: 'Bring equipment, quotes, and the next step into one calm, connected solar journey.',
    },
  ];
  return (
    <div className="sarn-landing">
      <section className="sarn-hero">
        <video className="sarn-hero-video" autoPlay muted loop playsInline poster="/intro-vid-enrg-poster.webp" aria-label="Solar panels in sunlight">
          <source src="/intro-vid-enrg.mp4" type="video/mp4" media="(min-width: 761px) and (prefers-reduced-motion: no-preference)" />
        </video>
        <div className="sarn-hero-overlay" />
        <div className="sarn-hero-lines" />
        <div className="sarn-hero-content">
          <div className="sarn-hero-copy">
            <p className="sarn-kicker sarn-load-1">
              <span className="sarn-live-dot" /> ENRG SOLAR SOLUTION / ENERGY, REFINED
            </p>
            <h1 className="sarn-title sarn-load-2">
              Own the
              <br />
              <em>sunlight.</em>
            </h1>
            <p className="sarn-hero-description sarn-load-3">A smarter solar marketplace for homes that want more from every ray.</p>
            <div className="sarn-hero-actions sarn-load-4">
              <Link href="/quote" className="sarn-glow-button" data-testid="link-sarn-hero-quote">
                Start your solar plan <ArrowRight size={17} />
              </Link>
              <Link href="/marketplace" className="sarn-text-link" data-testid="link-sarn-hero-marketplace">
                Explore the marketplace <span>↗</span>
              </Link>
            </div>
          </div>
          <div className="sarn-hero-readout sarn-load-4">
            <span className="sarn-readout-label">LIVE SOLAR INDEX</span>
            <strong>+24.8%</strong>
            <span>potential annual yield</span>
            <div className="sarn-sparkline">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
        <div className="sarn-scroll-cue">
          <span>Scroll to explore</span>
          <i />
        </div>
      </section>

      <section className="sarn-stats-band">
        <div className="sarn-stats-inner">
          <Reveal>
            <span className="sarn-stat-label">THE ENRG SIGNAL</span>
          </Reveal>
          <Reveal delay={80}>
            <div className="sarn-stat">
              <strong>
                <CountUp value={2400} suffix="+" />
              </strong>
              <span>homes exploring solar</span>
            </div>
          </Reveal>
          <Reveal delay={160}>
            <div className="sarn-stat">
              <strong>
                <CountUp value={18} suffix=".4k" />
              </strong>
              <span>tonnes CO₂ avoided</span>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <div className="sarn-stat">
              <strong>
                <CountUp value={96} suffix="%" />
              </strong>
              <span>customer confidence</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="sarn-section sarn-benefits">
        <div className="sarn-section-heading">
          <Reveal>
            <p className="sarn-kicker">ONE CLEAR CURRENT</p>
            <h2>
              Energy decisions,
              <br />
              <em>without the noise.</em>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p>From first calculation to final connection, SARN gives your next move a sharper signal.</p>
          </Reveal>
        </div>
        <div className="sarn-benefit-grid">
          {benefits.map((benefit, index) => (
            <Reveal key={benefit.number} delay={index * 100} className="sarn-benefit-wrap">
              <article className="sarn-glass-card">
                <div className="sarn-card-top">
                  <span>{benefit.number}</span>
                  <benefit.icon size={22} />
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
                <Link href={index === 1 ? '/signup' : '/quote'} aria-label={benefit.title} className="sarn-card-arrow">
                  <ArrowRight size={18} />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="sarn-section sarn-split">
        <Reveal className="sarn-orbit-visual">
          <div className="sarn-orbit orbit-one" />
          <div className="sarn-orbit orbit-two" />
          <div className="sarn-orbit-core">
            <Sun size={32} />
            <span>
              POWER
              <br />
              IN MOTION
            </span>
          </div>
          <div className="sarn-orbit-tag tag-one">ROOFTOP / 04.2 KW</div>
          <div className="sarn-orbit-tag tag-two">GRID READY / 98.6%</div>
        </Reveal>
        <Reveal className="sarn-split-copy" delay={120}>
          <p className="sarn-kicker">DESIGNED FOR REAL LIFE</p>
          <h2>
            Make the
            <br />
            <em>switch visible.</em>
          </h2>
          <p>Solar should feel less like a leap and more like a system you can understand. SARN connects the numbers, the people, and the hardware in one place.</p>
          <Link href="/quote" className="sarn-outline-button">
            Find your fit <ArrowRight size={16} />
          </Link>
        </Reveal>
      </section>

      <section className="sarn-section sarn-trust">
        <Reveal>
          <p className="sarn-kicker">A BETTER KIND OF ENERGY</p>
          <blockquote>“We stopped comparing promises and started comparing what actually fit our home.”</blockquote>
          <div className="sarn-quote-meta">
            <span className="sarn-avatar">AK</span>
            <span>
              <strong>Anika & Karan</strong>
              <small>Pune / SARN homeowners</small>
            </span>
          </div>
        </Reveal>
      </section>

      <section className="sarn-final-cta">
        <div className="sarn-final-glow" />
        <Reveal>
          <p className="sarn-kicker">YOUR ROOFTOP IS READY</p>
          <h2>
            Let’s make
            <br />
            <em>sunlight useful.</em>
          </h2>
          <Link href="/quote" className="sarn-glow-button" data-testid="link-sarn-final-quote">
            Build your solar plan <ArrowRight size={17} />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
