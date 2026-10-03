import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap, ScrollTrigger, reducedMotion, whenIntroDone, introWillPlay } from '../lib/motion'

const LenisContext = createContext<Lenis | null>(null)
export const useLenis = () => useContext(LenisContext)

/** Scroll to an element or y position, smoothly when Lenis is running. */
export function scrollToTarget(lenis: Lenis | null, target: string | number | HTMLElement, immediate = false) {
    if (lenis) {
        lenis.scrollTo(target, { immediate, force: true, duration: 1.6 })
        return
    }
    const y = typeof target === 'number' ? target
        : (typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target)?.getBoundingClientRect().top
    if (y == null) return
    window.scrollTo({ top: typeof target === 'number' ? y : y + window.scrollY, behavior: immediate || reducedMotion() ? 'auto' : 'smooth' })
}

/**
 * Lenis smooth scrolling driven by GSAP's ticker so ScrollTrigger scrubs stay in
 * lockstep with the eased scroll (the Scrolling-Effect pattern). Touch devices keep
 * native scrolling, and reduced-motion users get no smoothing at all.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
    const [lenis, setLenis] = useState<Lenis | null>(null)

    useEffect(() => {
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
        document.fonts?.ready.then(() => ScrollTrigger.refresh())
        if (reducedMotion()) return

        const instance = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 0.95,
        })
        instance.on('scroll', ScrollTrigger.update)
        const tick = (time: number) => instance.raf(time * 1000)
        gsap.ticker.add(tick)
        gsap.ticker.lagSmoothing(0)

        if (introWillPlay) instance.stop()
        whenIntroDone(() => instance.start())

        setLenis(instance)
        return () => {
            gsap.ticker.remove(tick)
            instance.destroy()
            setLenis(null)
        }
    }, [])

    return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
