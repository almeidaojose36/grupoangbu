import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP, introWillPlay, finishIntro, EASE_EXPO } from '../lib/motion'
import { FOUNDED } from '../data/site'

/** First-visit curtain: the years count from the founding to today, then the curtain lifts. */
export default function Intro() {
    const [show, setShow] = useState(introWillPlay)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        document.documentElement.classList.toggle('is-locked', show)
    }, [show])

    useGSAP(
        () => {
            if (!show) return
            const year = ref.current!.querySelector('.intro__year')!
            const counter = { y: FOUNDED }
            gsap.timeline({ onComplete: () => setShow(false) })
                .from('.intro__brand .mask > *', { yPercent: 110, duration: 1, stagger: 0.08, ease: EASE_EXPO })
                .to(counter, {
                    y: new Date().getFullYear(),
                    duration: 1.2,
                    ease: 'power2.inOut',
                    onUpdate: () => (year.textContent = String(Math.round(counter.y))),
                }, 0.2)
                .fromTo('.intro__bar i', { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power2.inOut' }, 0.2)
                .to('.intro__brand .mask > *', { yPercent: -110, duration: 0.6, stagger: 0.05, ease: 'power3.in' }, '+=0.15')
                .call(finishIntro)
                .to(ref.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '<')
        },
        { scope: ref },
    )

    if (!show) return null
    return (
        <div className="intro" ref={ref} aria-hidden>
            <div className="intro__brand">
                <span className="mask">
                    <span className="intro__label">Grupo ANGBU · Cabinda, Angola</span>
                </span>
                <span className="mask">
                    <span className="intro__year display">{FOUNDED}</span>
                </span>
            </div>
            <div className="intro__bar">
                <i />
            </div>
        </div>
    )
}
