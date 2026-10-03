import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowLeft } from 'lucide-react'
import {
    gsap, useGSAP, MOTION_OK, EASE_EXPO, whenIntroDone,
    revealLines, scrubWords, revealOnScroll, heroShrink, playWhenVisible,
} from '../lib/motion'
import { companies, media, type Company } from '../data/site'

export default function CompanyPage({ company }: { company: Company }) {
    const root = useRef<HTMLDivElement>(null)
    const index = companies.indexOf(company)
    const next = companies[(index + 1) % companies.length]
    const m = media(company.media)
    const still = !company.hasVideo

    useEffect(() => {
        document.title = `${company.fullName} | Grupo ANGBU`
    }, [company])

    useGSAP(
        (_, contextSafe) => {
            const q = gsap.utils.selector(root)
            const mm = gsap.matchMedia()
            mm.add({ motion: MOTION_OK, reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
                const { motion } = ctx.conditions as { motion: boolean }
                root.current!.classList.toggle('is-static', !motion)
                const video = q<HTMLVideoElement>('.hero video')[0]
                const disposeVideo = video ? playWhenVisible(video, q('.hero')[0]) : () => {}
                if (!motion) return disposeVideo

                const heroIn = gsap.timeline({ paused: true, defaults: { ease: EASE_EXPO } })
                    .from(q('.hero__title .line'), { yPercent: 118, duration: 1.4, stagger: 0.1 })
                    .from(q('.hero__zoom'), { scale: 1.3, duration: 2.4 }, 0)
                    .from(q('[data-hero-fade]'), { autoAlpha: 0, y: 24, duration: 1.2, stagger: 0.07 }, 0.3)
                    .from(q('.hero__foot'), { '--rule': 0, duration: 1.6, ease: 'expo.inOut' }, 0.25)
                whenIntroDone(contextSafe!(() => heroIn.play()))

                if (still) {
                    gsap.to(q('.hero__media'), {
                        yPercent: 12,
                        ease: 'none',
                        scrollTrigger: { trigger: q('.hero')[0], start: 'top top', end: 'bottom top', scrub: true },
                    })
                } else {
                    heroShrink(q('.hero')[0], q('.hero__frame')[0], q('.hero__media')[0], q('.hero__content')[0])
                }

                q('.js-lines').forEach((el) => revealLines(el, { onScroll: true }))
                q('.js-scrub').forEach((el) => scrubWords(el))
                revealOnScroll(root.current!)

                const band = q('.band')[0]
                if (band) {
                    gsap.fromTo(q('.band__img'), { yPercent: -10, scale: 1.18 }, {
                        yPercent: 10,
                        scale: 1.02,
                        ease: 'none',
                        scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: true },
                    })
                    gsap.from(q('.band__quote .line'), {
                        yPercent: 110,
                        duration: 1.4,
                        stagger: 0.1,
                        ease: EASE_EXPO,
                        scrollTrigger: { trigger: band, start: 'top 60%', once: true },
                    })
                }
                return disposeVideo
            })
            return () => mm.revert()
        },
        { scope: root },
    )

    return (
        <div ref={root} className="company">
            {/* ============ HERO ============ */}
            <section className={`hero hero--company ${still ? 'hero--still' : ''}`} data-theme="dark">
                <div className="hero__sticky">
                <div className="hero__frame">
                    <div className="hero__media">
                        <div className="hero__zoom">
                            {still ? (
                                <img className="hero__video" src={m.poster} alt="" />
                            ) : (
                                <video className="hero__video" src={m.video} poster={m.poster} autoPlay muted loop playsInline preload="auto" aria-hidden />
                            )}
                        </div>
                    </div>
                    <div className="hero__shade" />
                </div>

                <div className="hero__content container">
                    <p className="eyebrow" data-hero-fade>
                        <Link to="/#empresas" className="crumb">
                            <ArrowLeft size={14} aria-hidden /> Grupo ANGBU
                        </Link>
                        <span className="crumb__sep">/</span> Empresa 0{index + 1} de 0{companies.length}
                    </p>
                    <h1 className="hero__title display">
                        <span className="line-mask"><span className="line">{company.name}</span></span>
                    </h1>
                    <div className="hero__foot">
                        <p className="hero__lede" data-hero-fade>{company.tagline}</p>
                        <dl className="hero__meta" data-hero-fade>
                            <div>
                                <dt>Fundada</dt>
                                <dd>{company.year}</dd>
                            </div>
                            <div>
                                <dt>Sector</dt>
                                <dd>{company.sector}</dd>
                            </div>
                            <div>
                                <dt>Sede</dt>
                                <dd>Cabinda</dd>
                            </div>
                        </dl>
                    </div>
                </div>
                </div>
            </section>

            {/* ============ OVERVIEW ============ */}
            <section className="overview" data-theme="light">
                <div className="container">
                    <div className="sec-head" data-reveal>
                        <span className="eyebrow">{company.fullName}</span>
                        <span className="sec-num">(01)</span>
                    </div>
                    <p className="overview__statement display js-scrub">{company.statement}</p>
                    <div className="overview__grid">
                        <div className="overview__text">
                            {company.paragraphs.map((p, i) => (
                                <p key={i} data-reveal={i * 0.08}>{p}</p>
                            ))}
                        </div>
                        <div className="overview__stats">
                            {company.stats.map((s, i) => (
                                <div className="stat" key={s.label} data-reveal={i * 0.08}>
                                    <span className="stat__value display">{s.value}</span>
                                    <span className="stat__label">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ SERVICES ============ */}
            <section className="services" data-theme="dark">
                <div className="container services__grid">
                    <div className="services__aside">
                        <div className="sec-head" data-reveal>
                            <span className="eyebrow">O que fazemos</span>
                            <span className="sec-num">(02)</span>
                        </div>
                        <h2 className="section-title display js-lines">{company.servicesTitle}</h2>
                        <p className="services__note" data-reveal>
                            {company.fullName} · uma empresa do Grupo ANGBU desde {company.year}.
                        </p>
                    </div>
                    <ol className="services__list">
                        {company.services.map((s, i) => (
                            <li className="service" key={s.title} data-reveal={i * 0.04}>
                                <span className="service__rule" data-rule />
                                <span className="service__n">0{i + 1}</span>
                                <div>
                                    <h3 className="service__title display">{s.title}</h3>
                                    {s.desc && <p className="service__desc">{s.desc}</p>}
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ============ IMAGE BAND ============ */}
            {!still && (
                <section className="band" data-theme="dark" aria-label={company.bandQuote}>
                    <img className="band__img" src={m.band} alt="" loading="lazy" />
                    <div className="band__shade" />
                    <p className="band__quote display container">
                        <span className="line-mask"><span className="line">{company.bandQuote}</span></span>
                    </p>
                </section>
            )}

            {/* ============ CLIENTS / COURSES ============ */}
            {company.list && (
                <section className="roster" data-theme="light">
                    <div className="container">
                        <div className="sec-head" data-reveal>
                            <span className="eyebrow">{company.listTitle}</span>
                            <span className="sec-num">(03)</span>
                        </div>
                        <h2 className="section-title display js-lines">
                            {company.listTitle === 'Catálogo de cursos' ? (
                                <>{company.list.length} cursos para <em>crescer</em>.</>
                            ) : (
                                <>Quem <em>confia</em> em nós.</>
                            )}
                        </h2>
                        <ol className="roster__list">
                            {company.list.map((item, i) => (
                                <li key={item} data-reveal={(i % 3) * 0.05}>
                                    <span className="roster__n">{String(i + 1).padStart(2, '0')}</span>
                                    {item}
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>
            )}

            {/* ============ NEXT COMPANY ============ */}
            <section className="next" data-theme="dark">
                <div className="container">
                    <Link to={`/empresa/${next.slug}`} className="next__link">
                        <span className="eyebrow">Próxima empresa</span>
                        <span className="next__name display">
                            {next.name}
                            <ArrowUpRight className="next__arrow" aria-hidden />
                        </span>
                        <span className="next__sector">{next.sector} · desde {next.year}</span>
                        <span className="next__thumb" aria-hidden>
                            <img src={media(next.media).poster} alt="" loading="lazy" />
                        </span>
                    </Link>
                    <Link to="/#empresas" className="link-arrow next__all">
                        <ArrowLeft size={15} aria-hidden /> Todas as empresas
                    </Link>
                </div>
            </section>
        </div>
    )
}
