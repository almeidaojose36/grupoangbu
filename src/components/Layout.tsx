import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ArrowUpRight, ArrowUp, Plus } from 'lucide-react'
import { gsap, ScrollTrigger, useGSAP, MOTION_OK, EASE_EXPO } from '../lib/motion'
import { scrollToTarget, useLenis } from './SmoothScroll'
import Intro from './Intro'
import { companies, contact, LOGO, media, tel } from '../data/site'

const sections = [
    { id: 'sobre', label: 'O Grupo' },
    { id: 'empresas', label: 'Empresas', mega: true },
    { id: 'trajetoria', label: 'Trajectória' },
    { id: 'contacto', label: 'Contacto' },
]

export default function Layout() {
    const lenis = useLenis()
    const lenisRef = useRef(lenis)
    lenisRef.current = lenis
    const { pathname, hash } = useLocation()
    const navigate = useNavigate()
    const footerRef = useRef<HTMLElement>(null)
    const progressRef = useRef<HTMLElement>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [megaOpen, setMegaOpen] = useState(false)
    const [theme, setTheme] = useState<'dark' | 'light'>('dark')
    const [scrolled, setScrolled] = useState(false)
    const [hidden, setHidden] = useState(false)

    /* Jump to a home-page section, from any page. */
    const goTo = (id: string) => {
        setMenuOpen(false)
        setMegaOpen(false)
        // Unlock now: Lenis.start() resets, which would cancel a scroll begun while the menu was open.
        document.documentElement.classList.remove('is-locked')
        lenisRef.current?.start()
        if (id === 'contacto' || pathname === '/') {
            const el = document.getElementById(id)
            if (el) scrollToTarget(lenisRef.current, el)
        } else {
            navigate(`/#${id}`)
        }
    }

    /* Route change: reset scroll, re-measure triggers, honour #hash links. */
    useLayoutEffect(() => {
        setMenuOpen(false)
        setMegaOpen(false)
        scrollToTarget(lenisRef.current, 0, true)
        window.scrollTo(0, 0)
        ScrollTrigger.refresh()
        if (!hash) return
        const t = window.setTimeout(() => {
            const el = document.querySelector<HTMLElement>(hash)
            if (el) scrollToTarget(lenisRef.current, el)
        }, 400)
        return () => window.clearTimeout(t)
    }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

    /* Nav state: progress hairline, hide on scroll down, colour from the section beneath. */
    useEffect(() => {
        let last = window.scrollY
        let raf = 0
        const update = () => {
            raf = 0
            const y = window.scrollY
            const max = document.documentElement.scrollHeight - window.innerHeight
            if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`
            setScrolled(y > 40)
            if (Math.abs(y - last) > 8) {
                setHidden(y > last && y > window.innerHeight * 0.7)
                last = y
            }
            const under = document
                .elementsFromPoint(window.innerWidth / 2, 38)
                .map((el) => el.closest<HTMLElement>('[data-theme]'))
                .find((el) => el && !el.closest('.nav'))
            if (under) setTheme(under.dataset.theme === 'light' ? 'light' : 'dark')
        }
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
        update()
        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
            cancelAnimationFrame(raf)
        }
    }, [pathname])

    /* Lock page scroll while the full-screen menu is open. */
    useEffect(() => {
        document.documentElement.classList.toggle('is-locked', menuOpen)
        if (menuOpen) lenisRef.current?.stop()
        else lenisRef.current?.start()
    }, [menuOpen])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setMenuOpen(false)
                setMegaOpen(false)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    /* Footer: content rises out of the dark as it arrives; the wordmark letters stand up. */
    useGSAP(
        () => {
            const mm = gsap.matchMedia()
            mm.add(MOTION_OK, () => {
                gsap.from('.footer__inner', {
                    yPercent: -18,
                    opacity: 0.4,
                    ease: 'none',
                    scrollTrigger: { trigger: footerRef.current, start: 'top bottom', end: 'top 25%', scrub: true },
                })
                gsap.from('.footer__mark span', {
                    yPercent: 100,
                    duration: 1.4,
                    stagger: 0.07,
                    ease: EASE_EXPO,
                    scrollTrigger: { trigger: '.footer__mark', start: 'top 98%', once: true },
                })
            })
            return () => mm.revert()
        },
        { scope: footerRef, dependencies: [pathname], revertOnUpdate: true },
    )

    const navClass = [
        'nav',
        theme === 'light' && !menuOpen ? 'is-light' : '',
        scrolled || megaOpen ? 'is-scrolled' : '',
        hidden && !menuOpen && !megaOpen ? 'is-hidden' : '',
        megaOpen ? 'is-mega' : '',
    ].join(' ')

    return (
        <div className="app">
            <Intro />
            <a className="skip-link" href="#main">Saltar para o conteúdo</a>

            <header className={navClass} onMouseLeave={() => setMegaOpen(false)}>
                <div className="nav__inner container">
                    <Link to="/" className="nav__logo" aria-label="Grupo ANGBU, início">
                        <img src={LOGO} alt="Grupo ANGBU" width={768} height={199} />
                    </Link>

                    <nav className="nav__links" aria-label="Principal">
                        {sections.map((s) =>
                            s.mega ? (
                                <button
                                    key={s.id}
                                    className="nav__link"
                                    aria-expanded={megaOpen}
                                    aria-controls="mega"
                                    onClick={() => setMegaOpen((o) => !o)}
                                    onMouseEnter={() => setMegaOpen(true)}
                                >
                                    {s.label}
                                    <Plus size={13} className="nav__plus" aria-hidden />
                                </button>
                            ) : (
                                <a
                                    key={s.id}
                                    href={`${import.meta.env.BASE_URL}#${s.id}`}
                                    className="nav__link"
                                    onMouseEnter={() => setMegaOpen(false)}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        goTo(s.id)
                                    }}
                                >
                                    {s.label}
                                </a>
                            ),
                        )}
                    </nav>

                    <a
                        href="#contacto"
                        className="btn btn--sm nav__cta"
                        onClick={(e) => {
                            e.preventDefault()
                            goTo('contacto')
                        }}
                    >
                        <span>Fale connosco</span>
                        <ArrowUpRight size={16} aria-hidden />
                    </a>

                    <button
                        className={`burger ${menuOpen ? 'is-open' : ''}`}
                        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                        aria-expanded={menuOpen}
                        aria-controls="menu"
                        onClick={() => setMenuOpen((o) => !o)}
                    >
                        <span />
                        <span />
                    </button>
                </div>

                <div className="nav__progress" aria-hidden>
                    <i ref={progressRef} />
                </div>

                {/* Mega menu: the six companies */}
                <div id="mega" className={`mega ${megaOpen ? 'is-open' : ''}`} inert={!megaOpen}>
                    <div className="mega__inner container">
                        <div className="mega__lead">
                            <p className="eyebrow">As empresas do grupo</p>
                            <p className="mega__text">Seis empresas, um só padrão de excelência, de Cabinda para Angola.</p>
                            <a
                                href={`${import.meta.env.BASE_URL}#empresas`}
                                className="link-arrow"
                                onClick={(e) => {
                                    e.preventDefault()
                                    goTo('empresas')
                                }}
                            >
                                Ver o grupo <ArrowUpRight size={15} aria-hidden />
                            </a>
                        </div>
                        <ul className="mega__grid">
                            {companies.map((c, i) => (
                                <li key={c.slug}>
                                    <Link to={`/empresa/${c.slug}`} className="mega__item" onClick={() => setMegaOpen(false)}>
                                        <span className="mega__thumb">
                                            <img src={media(c.media).poster} alt="" loading="lazy" />
                                        </span>
                                        <span className="mega__meta">
                                            <span className="mega__num">0{i + 1}</span>
                                            <span className="mega__name">{c.name}</span>
                                            <span className="mega__sector">{c.sector}</span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </header>

            {/* Full-screen mobile menu */}
            <div id="menu" className={`menu ${menuOpen ? 'is-open' : ''}`} data-theme="dark" aria-hidden={!menuOpen} inert={!menuOpen}>
                <div className="menu__inner container">
                    <nav className="menu__primary" aria-label="Menu">
                        {sections.map((s, i) => (
                            <a
                                key={s.id}
                                href={`${import.meta.env.BASE_URL}#${s.id}`}
                                style={{ transitionDelay: menuOpen ? `${0.15 + i * 0.06}s` : '0s' }}
                                onClick={(e) => {
                                    e.preventDefault()
                                    goTo(s.id)
                                }}
                            >
                                <span className="menu__num">0{i + 1}</span>
                                {s.label}
                            </a>
                        ))}
                    </nav>
                    <div className="menu__companies">
                        <p className="eyebrow">Empresas</p>
                        <ul>
                            {companies.map((c) => (
                                <li key={c.slug}>
                                    <Link to={`/empresa/${c.slug}`} onClick={() => setMenuOpen(false)}>
                                        {c.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="menu__contact">
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                        <a href={tel(contact.phones[0])}>{contact.phones[0]}</a>
                    </div>
                </div>
            </div>

            <main id="main">
                <Outlet />
            </main>

            <footer id="contacto" className="footer" data-theme="dark" ref={footerRef}>
                <div className="footer__inner container">
                    <div className="footer__cta">
                        <p className="eyebrow">
                            <span className="dot" /> Contacto
                        </p>
                        <h2 className="display footer__title">
                            Vamos construir o <em>próximo</em> capítulo juntos.
                        </h2>
                        <div className="footer__actions">
                            <a className="btn btn--light" href={`mailto:${contact.email}`}>
                                <span>Escrever-nos</span>
                                <ArrowUpRight size={18} aria-hidden />
                            </a>
                            <a className="btn btn--ghost" href={tel(contact.phones[0])}>
                                <span>{contact.phones[0]}</span>
                            </a>
                        </div>
                    </div>

                    <div className="footer__grid">
                        <div className="glass">
                            <h3 className="eyebrow">Sede</h3>
                            <p>
                                {contact.address}
                                <br />
                                {contact.city}
                            </p>
                            <a
                                className="link-arrow"
                                href="https://www.google.com/maps/search/?api=1&query=Bairro+Deolinda+Rodrigues+Cabinda+Angola"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Ver no mapa <ArrowUpRight size={14} aria-hidden />
                            </a>
                        </div>
                        <div className="glass">
                            <h3 className="eyebrow">Telefone</h3>
                            <ul>
                                {contact.phones.map((p) => (
                                    <li key={p}>
                                        <a href={tel(p)}>{p}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="glass">
                            <h3 className="eyebrow">Email</h3>
                            <a className="footer__email" href={`mailto:${contact.email}`}>
                                {contact.email}
                            </a>
                            <p className="footer__note">www.grupoangbu.com</p>
                        </div>
                        <div className="glass">
                            <h3 className="eyebrow">Empresas</h3>
                            <ul>
                                {companies.map((c) => (
                                    <li key={c.slug}>
                                        <Link to={`/empresa/${c.slug}`}>{c.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="footer__base">
                        <img className="footer__logo on-dark-logo" src={LOGO} alt="Grupo ANGBU" width={768} height={199} loading="lazy" />
                        <span>© {new Date().getFullYear()} Grupo ANGBU, Lda. Todos os direitos reservados.</span>
                        <span>Cabinda, Angola</span>
                        <button className="to-top" onClick={() => scrollToTarget(lenisRef.current, 0)}>
                            Voltar ao topo <ArrowUp size={14} aria-hidden />
                        </button>
                    </div>
                </div>
                <div className="footer__mark display" aria-hidden>
                    {'ANGBU'.split('').map((l, i) => (
                        <span key={i}>{l}</span>
                    ))}
                </div>
            </footer>
        </div>
    )
}
