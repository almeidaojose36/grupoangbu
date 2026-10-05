import { useEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDown } from 'lucide-react'
import {
    gsap, ScrollTrigger, useGSAP, MOTION_OK, EASE_EXPO, whenIntroDone,
    revealLines, scrubWords, revealOnScroll, countUp, heroShrink, playWhenVisible, reducedMotion,
} from '../lib/motion'
import { scrollToTarget, useLenis } from '../components/SmoothScroll'
import { asset, clients, companies, leaders, media, milestones, team, teamPhoto, yearsActive } from '../data/site'
import journey from '../data/journey.json'

const NUMBER_WORDS: Record<number, string> = { 9: 'Nove', 10: 'Dez', 11: 'Onze', 12: 'Doze', 13: 'Treze', 14: 'Catorze', 15: 'Quinze' }


export default function Home() {
    const root = useRef<HTMLDivElement>(null)
    const lenis = useLenis()
    const stageTl = useRef<gsap.core.Timeline | null>(null)
    const years = yearsActive()
    const yearsWord = NUMBER_WORDS[years] ?? String(years)
    const staticLayout = reducedMotion()

    useEffect(() => {
        document.title = 'Grupo ANGBU | Seis empresas, uma visão para Angola'
    }, [])

    useGSAP(
        (_, contextSafe) => {
            const q = gsap.utils.selector(root)
            const mm = gsap.matchMedia()

            mm.add(
                { motion: MOTION_OK, reduce: '(prefers-reduced-motion: reduce)' },
                (ctx) => {
                    const { motion } = ctx.conditions as { motion: boolean }
                    root.current!.classList.toggle('is-static', !motion)

                    const disposeHeroVideo = playWhenVisible(q<HTMLVideoElement>('.hero video')[0], q('.hero')[0])
                    if (!motion) return disposeHeroVideo

                    /* ---------- HERO: load-in, then the pinned shrink ---------- */
                    const heroIn = gsap.timeline({ paused: true, defaults: { ease: EASE_EXPO } })
                        .from(q('.hero__title .line'), { yPercent: 118, duration: 1.5, stagger: 0.11 })
                        .from(q('.hero__zoom'), { scale: 1.35, duration: 2.6 }, 0)
                        .from(q('[data-hero-fade]'), { autoAlpha: 0, y: 28, duration: 1.3, stagger: 0.08 }, 0.4)
                        .from(q('.hero__foot'), { '--rule': 0, duration: 1.6, ease: 'expo.inOut' }, 0.3)
                    whenIntroDone(contextSafe!(() => heroIn.play()))

                    heroShrink(q('.hero')[0], q('.hero__frame')[0], q('.hero__media')[0], q('.hero__content')[0])
                        .fromTo(q('.hero__caption'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.65)

                    /* ---------- generic reveals ---------- */
                    q('.js-lines').forEach((el) => revealLines(el, { onScroll: true }))
                    q('.js-scrub').forEach((el) => scrubWords(el))
                    q<HTMLElement>('[data-count]').forEach((el) => countUp(el))
                    revealOnScroll(root.current!)

                    /* ---------- COMPANIES: one scroll-scrubbed camera journey through the group ---------- */
                    const stage = q('.stage')[0]
                    const film = q<HTMLVideoElement>('.film')[0]
                    const copies = q('.stage__copy')
                    const start = q('.film__start')[0]
                    const segs = q('.stage__seg')
                    const fills = q<HTMLElement>('.stage__seg i')
                    const arrivals = journey.arrivals.map((a) => a.time)
                    // Desktop scrubs a 1080p video; phones a portrait crop made for tall screens.
                    const variant = window.innerWidth < 760 ? 'tall' : 'wide'
                    film.poster = asset(`media/journey/${variant}.webp`)

                    // Seek to wherever the scroll says, one seek at a time so the decoder never queues up.
                    const clock = { t: 0 }
                    const seek = () => {
                        if (film.readyState < 1 || film.seeking) return
                        if (Math.abs(film.currentTime - clock.t) > 0.02) film.currentTime = clock.t
                    }
                    film.addEventListener('seeked', seek)
                    film.addEventListener('loadedmetadata', seek)

                    // Copy for company k appears as the camera approaches it (last 35% of the leg).
                    gsap.set(copies, { autoAlpha: 0, y: 40 })
                    let current = -2
                    const sync = () => {
                        const f = clock.t
                        let active = -1
                        arrivals.forEach((at, k) => {
                            const from = k === 0 ? 0 : arrivals[k - 1]
                            fills[k].style.transform = `scaleX(${gsap.utils.clamp(0, 1, (f - from) / (at - from))})`
                            if (f >= at - (at - from) * 0.35) active = k
                        })
                        if (active === current) return
                        if (current >= 0) gsap.to(copies[current], { autoAlpha: 0, y: -32, duration: 0.45, ease: 'power2.in', overwrite: true })
                        if (active >= 0) gsap.to(copies[active], { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.15, ease: EASE_EXPO, overwrite: true })
                        gsap.to(start, { autoAlpha: active < 0 ? 1 : 0, duration: 0.5, overwrite: true })
                        segs.forEach((s, j) => {
                            s.classList.toggle('is-active', j === active)
                            s.classList.toggle('is-done', j < active)
                        })
                        current = active
                    }

                    // Scroll distance follows footage time (constant camera speed) with a short hold at each company.
                    const HOLD = 2.8
                    const tl = gsap.timeline({
                        defaults: { ease: 'none' },
                        onUpdate: () => {
                            seek()
                            sync()
                        },
                        scrollTrigger: { trigger: stage, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
                    })
                    arrivals.forEach((at, k) => {
                        tl.to(clock, { t: at, duration: at - (k === 0 ? 0 : arrivals[k - 1]) })
                            .addLabel(`stop${k}`)
                            .to({}, { duration: HOLD })
                    })
                    stageTl.current = tl
                    sync()

                    // Start downloading shortly before the section; a muted play/pause primes iOS so it can seek.
                    ScrollTrigger.create({
                        trigger: stage,
                        start: 'top bottom+=150%',
                        once: true,
                        onEnter: () => {
                            film.src = asset(`media/journey/${variant}.mp4`)
                            film.play().then(() => film.pause(), () => {})
                        },
                    })

                    /* ---------- LETTER: the portrait unveils upward, then drifts with the scroll ---------- */
                    gsap.fromTo(q('.letter__portrait'), { clipPath: 'inset(100% 0% 0% 0% round 22px)' }, {
                        clipPath: 'inset(0% 0% 0% 0% round 22px)',
                        duration: 1.6,
                        ease: 'expo.inOut',
                        scrollTrigger: { trigger: q('.letter__portrait')[0], start: 'top 85%', once: true },
                    })
                    gsap.fromTo(q('.letter__portrait img'), { yPercent: -6, scale: 1.12 }, {
                        yPercent: 6,
                        scale: 1.02,
                        ease: 'none',
                        scrollTrigger: { trigger: q('.letter')[0], start: 'top bottom', end: 'bottom top', scrub: true },
                    })

                    /* ---------- JOURNEY: horizontal pinned track ---------- */
                    const track = q<HTMLElement>('.journey__track')[0]
                    const distance = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth)
                    const hTween = gsap.to(track, {
                        x: () => -distance(),
                        ease: 'none',
                        scrollTrigger: {
                            trigger: q('.journey')[0],
                            start: 'top top',
                            end: () => '+=' + distance(),
                            pin: true,
                            scrub: 1,
                            invalidateOnRefresh: true,
                        },
                    })
                    gsap.fromTo(q('.journey__progress i'), { scaleX: 0 }, {
                        scaleX: 1,
                        ease: 'none',
                        scrollTrigger: { trigger: q('.journey')[0], start: 'top top', end: () => '+=' + distance(), scrub: true },
                    })
                    q('.milestone').forEach((m) =>
                        ScrollTrigger.create({
                            trigger: m,
                            containerAnimation: hTween,
                            start: 'left 72%',
                            toggleClass: 'is-lit',
                        }),
                    )

                    /* ---------- CLIENTS: marquee that speeds up with scroll velocity ---------- */
                    const marquees = q('.marquee__inner').map((el, i) =>
                        gsap.fromTo(el, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: 38 + i * 6, ease: 'none', repeat: -1 }),
                    )
                    const marqueeBox = q('.marquees')[0]
                    const pauseMarquees = () => marquees.forEach((m) => m.pause())
                    const playMarquees = () => marquees.forEach((m) => m.play())
                    marqueeBox.addEventListener('mouseenter', pauseMarquees)
                    marqueeBox.addEventListener('mouseleave', playMarquees)
                    ScrollTrigger.create({
                        trigger: q('.clients')[0],
                        start: 'top bottom',
                        end: 'bottom top',
                        onUpdate: (self) => {
                            const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 220, 6)
                            marquees.forEach((m) =>
                                gsap.to(m, { timeScale: boost, duration: 0.2, overwrite: true, onComplete: () => { gsap.to(m, { timeScale: 1, duration: 1.4, overwrite: true }) } }),
                            )
                        },
                    })

                    return () => {
                        disposeHeroVideo()
                        film.removeEventListener('seeked', seek)
                        film.removeEventListener('loadedmetadata', seek)
                        marqueeBox.removeEventListener('mouseenter', pauseMarquees)
                        marqueeBox.removeEventListener('mouseleave', playMarquees)
                    }
                },
            )
            return () => mm.revert()
        },
        { scope: root },
    )

    /* Jump straight to a company from the progress bar (lands mid-hold). */
    const goToStage = (k: number) => {
        const tl = stageTl.current
        const st = tl?.scrollTrigger
        if (!tl || !st) {
            document.getElementById(`stage-${k}`)?.scrollIntoView({ behavior: 'smooth' })
            return
        }
        const time = tl.labels[`stop${k}`] + 1.4
        scrollToTarget(lenis, st.start + (st.end - st.start) * (time / tl.duration()))
    }

    return (
        <div ref={root} className="home">
            {/* ============ HERO ============ */}
            <section className="hero" data-theme="dark" aria-label="Grupo ANGBU">
                <div className="hero__sticky">
                <div className="hero__frame">
                    <div className="hero__media">
                        <div className="hero__zoom">
                            <video
                                className="hero__video"
                                src={media('cabinda').video}
                                poster={media('cabinda').poster}
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="auto"
                                aria-hidden
                            />
                        </div>
                    </div>
                    <div className="hero__shade" />
                </div>

                <div className="hero__content container">
                    <p className="eyebrow" data-hero-fade>
                        <span className="dot" /> Cabinda, Angola · Desde 2017
                    </p>
                    <h1 className="hero__title display">
                        <span className="line-mask"><span className="line">Seis empresas.</span></span>
                        <span className="line-mask"><span className="line"><em>Uma visão</em></span></span>
                        <span className="line-mask"><span className="line">para Angola.</span></span>
                    </h1>
                    <div className="hero__foot">
                        <p className="hero__lede" data-hero-fade>
                            Construção, internet, formação, tecnologia, comércio e nutrição animal. Um grupo angolano que serve
                            Cabinda com excelência há {years} anos.
                        </p>
                        <a
                            href="#sobre"
                            className="scroll-cue"
                            data-hero-fade
                            onClick={(e) => {
                                e.preventDefault()
                                scrollToTarget(lenis, '#sobre')
                            }}
                        >
                            <span>Descobrir</span>
                            <span className="scroll-cue__line" aria-hidden />
                        </a>
                    </div>
                </div>
                <p className="hero__caption eyebrow">Cabinda, sede do grupo desde 2017</p>
                </div>
            </section>

            {/* ============ MANIFESTO ============ */}
            <section id="sobre" className="manifesto" data-theme="light">
                <div className="container">
                    <div className="sec-head" data-reveal>
                        <h2 className="eyebrow">O Grupo</h2>
                        <span className="sec-num">(01)</span>
                    </div>
                    <p className="manifesto__text display js-scrub">
                        Nascemos em Cabinda a 18 de Abril de 2017 com uma ambição simples: servir com excelência. Hoje, seis
                        empresas constroem, conectam, formam e alimentam a região com a mesma exigência do primeiro dia.
                    </p>

                    <div className="manifesto__grid">
                        <div className="manifesto__story" data-reveal>
                            <p>
                                Fundado pelo Engº Ângelo Gabriel Buanga, o Grupo ANGBU é uma empresa angolana com foco na
                                prestação de serviços, comércio e indústria: da informática à construção civil, da formação
                                profissional ao fornecimento de internet e à produção de ração animal.
                            </p>
                            <p>A nossa sede fica no bairro Deolinda Rodrigues, em Cabinda.</p>
                            <a
                                href="#empresas"
                                className="link-arrow"
                                onClick={(e) => {
                                    e.preventDefault()
                                    scrollToTarget(lenis, '#empresas')
                                }}
                            >
                                Conhecer as empresas <ArrowDown size={15} aria-hidden />
                            </a>
                        </div>
                        <div className="pillars">
                            {[
                                ['Missão', 'Fornecer serviços e produtos de excelência que acrescentem valor e contribuam para o sucesso e o desenvolvimento sustentável dos nossos clientes.'],
                                ['Visão', 'Ser uma empresa de referência em Angola e em toda a África, reconhecida pela qualidade, pela inovação e pelo impacto positivo nas comunidades.'],
                                ['Valores', 'Integridade, inovação constante e responsabilidade social em cada acção que tomamos.'],
                            ].map(([t, d], i) => (
                                <div className="pillar" key={t} data-reveal={i * 0.08}>
                                    <span className="pillar__rule" data-rule />
                                    <h3 className="eyebrow">{t}</h3>
                                    <p>{d}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="stats">
                        {[
                            { value: years, suffix: '', label: 'Anos a servir Cabinda' },
                            { value: 6, suffix: '', label: 'Empresas especializadas' },
                            { value: 110, suffix: '+', label: 'Clientes regulares da Cab-Ração' },
                            { value: 10, suffix: 't', label: 'De ração produzidas por dia' },
                        ].map((s, i) => (
                            <div className="stat" key={s.label} data-reveal={i * 0.08}>
                                <span className="stat__value display">
                                    <span data-count={s.value}>{s.value}</span>
                                    {s.suffix && <span className="stat__suffix">{s.suffix}</span>}
                                </span>
                                <span className="stat__label">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ COMPANIES (pinned stages) ============ */}
            <section id="empresas" className="group" data-theme="dark">
                <div className="group__intro container">
                    <div className="sec-head" data-reveal>
                        <span className="eyebrow">As Empresas</span>
                        <span className="sec-num">(02)</span>
                    </div>
                    <div className="group__head">
                        <h2 className="section-title display js-lines">
                            Seis especialidades. <em>Um só</em> padrão de excelência.
                        </h2>
                        <p className="group__lede" data-reveal>
                            Cada empresa do grupo nasceu para responder a uma necessidade concreta do mercado angolano. Todas
                            partilham a mesma exigência.
                        </p>
                    </div>
                </div>

                <div className="stage stage--film" style={{ '--steps': 8 } as CSSProperties}>
                    <div className="stage__sticky">
                        <video className="film" muted playsInline preload="auto" aria-hidden />
                        <div className="film__shade" aria-hidden />
                        <p className="film__start eyebrow">
                            <span className="dot" /> Cabinda · o ponto de partida
                        </p>
                        <div className="stage__inner container">
                            <div className="stage__bar">
                                {companies.map((c, i) => (
                                    <button key={c.slug} className="stage__seg" onClick={() => goToStage(i)} aria-label={`Ver ${c.name}`}>
                                        <span className="stage__track"><i /></span>
                                        <span className="stage__label">
                                            <b>0{i + 1}</b> {c.name}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="stage__items">
                                {companies.map((c, i) => (
                                    <article className="stage__item" id={`stage-${i}`} key={c.slug}>
                                        <div className="stage__copy">
                                            <p className="eyebrow">
                                                <span className="stage__num">0{i + 1}</span> {c.sector} · desde {c.year}
                                            </p>
                                            <h3 className="stage__name display">{c.name}</h3>
                                            <p className="stage__summary">{c.summary}</p>
                                            <ul className="stage__points">
                                                {c.highlights.map((h) => (
                                                    <li key={h}>{h}</li>
                                                ))}
                                            </ul>
                                            <Link to={`/empresa/${c.slug}`} className="btn btn--light">
                                                <span>Explorar {c.name}</span>
                                                <ArrowUpRight size={18} aria-hidden />
                                            </Link>
                                        </div>
                                        {/* Still of the arrival frame, only for the reduced-motion layout. */}
                                        {staticLayout && <figure className="stage__shot">
                                            <img
                                                src={asset(`media/journey/stop-${i + 1}.webp`)}
                                                alt=""
                                                loading="lazy"
                                            />
                                        </figure>}
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ JOURNEY (horizontal) ============ */}
            <section id="trajetoria" className="journey" data-theme="light">
                <div className="journey__head container">
                    <div className="sec-head">
                        <span className="eyebrow">Trajectória</span>
                        <span className="sec-num">(03)</span>
                    </div>
                    <h2 className="section-title display">
                        {yearsWord} anos a <em>construir</em> confiança.
                    </h2>
                </div>
                <div className="journey__track">
                    {milestones.map((m, i) => (
                        <article className={`milestone ${i === milestones.length - 1 ? 'milestone--latest' : ''}`} key={m.year}>
                            <span className="milestone__year display">{m.year}</span>
                            <span className="milestone__tag eyebrow">{m.tag}</span>
                            <h3>{m.title}</h3>
                            <p>{m.text}</p>
                        </article>
                    ))}
                </div>
                <div className="journey__progress container" aria-hidden>
                    <span>
                        <i />
                    </span>
                </div>
            </section>

            {/* ============ LETTER FROM THE FOUNDER ============ */}
            <section className="letter" data-theme="dark">
                <div className="container letter__grid">
                    <div className="letter__aside">
                        <div className="sec-head" data-reveal>
                            <h2 className="eyebrow">Mensagem do Director Geral</h2>
                            <span className="sec-num">(04)</span>
                        </div>
                        <div className="letter__photo">
                            <div className="letter__portrait">
                                <img
                                    src={asset('media/ceo.webp')}
                                    alt="Engº Ângelo Gabriel Buanga, Fundador e Director Geral do Grupo ANGBU"
                                    width={1459}
                                    height={1078}
                                    loading="lazy"
                                />
                            </div>
                            <span className="letter__mark display" aria-hidden>“</span>
                        </div>
                    </div>
                    <figure className="letter__body">
                        <blockquote>
                            <p className="letter__quote display js-scrub">
                                Desde a fundação do Grupo ANGBU, a nossa missão tem sido clara: proporcionar serviços de
                                excelência que façam a diferença na vida dos nossos clientes e da comunidade em que actuamos.
                            </p>
                            <p className="letter__more" data-reveal>
                                O nosso compromisso com a qualidade, a integridade e a responsabilidade social continuará a guiar
                                as nossas acções enquanto expandimos os nossos horizontes e solidificamos a nossa posição no
                                mercado angolano.
                            </p>
                        </blockquote>
                        <figcaption className="signature" data-reveal>
                            <span className="signature__name display">Ângelo Gabriel Buanga</span>
                            <span className="eyebrow">Fundador e Director Geral</span>
                        </figcaption>
                    </figure>
                </div>
            </section>

            {/* ============ CLIENTS ============ */}
            <section className="clients" data-theme="light">
                <div className="container">
                    <div className="sec-head" data-reveal>
                        <span className="eyebrow">Confiança</span>
                        <span className="sec-num">(05)</span>
                    </div>
                    <h2 className="section-title display js-lines">
                        Instituições e empresas que <em>confiam</em> em nós.
                    </h2>
                </div>
                <div className="marquees">
                    {[clients.slice(0, 9), clients.slice(9)].map((row, r) => (
                        <div className={`marquee ${r ? 'marquee--alt' : ''}`} key={r}>
                            <ul className="marquee__inner">
                                {[...row, ...row].map((name, i) => (
                                    <li className="marquee__item display" key={i} aria-hidden={i >= row.length} data-dup={i >= row.length || undefined}>
                                        {name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============ LEADERSHIP ============ */}
            <section className="leaders" data-theme="light">
                <div className="container">
                    <div className="sec-head" data-reveal>
                        <span className="eyebrow">Liderança</span>
                        <span className="sec-num">(06)</span>
                    </div>
                    <h2 className="section-title display js-lines">
                        As pessoas por trás do <em>grupo</em>.
                    </h2>
                    <ol className="leaders__list">
                        {leaders.map((l, i) => (
                            <li className="leader" key={l.name} data-reveal={i * 0.05}>
                                <span className="leader__rule" data-rule />
                                <span className="leader__n">0{i + 1}</span>
                                <div className="leader__who">
                                    <img className="leader__photo" src={teamPhoto(l.photo)} alt="" width={360} height={360} loading="lazy" />
                                    <h3 className="leader__name display">{l.name}</h3>
                                </div>
                                <span className="leader__role eyebrow">{l.role}</span>
                                <p>{l.text}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ============ TEAM ============ */}
            <section id="equipa" className="team" data-theme="light">
                <div className="container">
                    <div className="sec-head" data-reveal>
                        <span className="eyebrow">Equipa</span>
                        <span className="sec-num">(07)</span>
                    </div>
                    <h2 className="section-title display js-lines">
                        Quem faz o grupo <em>acontecer</em> todos os dias.
                    </h2>
                    {team.map((g) => (
                        <div className="team__group" key={g.label}>
                            <div className="team__head" data-reveal>
                                <span className="team__rule" data-rule />
                                <h3 className="eyebrow">{g.label}</h3>
                                {g.company && (
                                    <Link to={`/empresa/${g.company}`} className="link-arrow">
                                        Ver empresa <ArrowUpRight size={14} aria-hidden />
                                    </Link>
                                )}
                            </div>
                            <ul className="team__grid">
                                {g.members.map((m, i) => (
                                    <li className="member" key={m.name} data-reveal={(i % 5) * 0.05}>
                                        <img className="member__photo" src={teamPhoto(m.photo)} alt="" width={360} height={360} loading="lazy" />
                                        <span className="member__name">{m.name}</span>
                                        <span className="member__role">{m.role}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
