import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)
gsap.defaults({ ease: 'power3.out' })

export { gsap, ScrollTrigger, SplitText, useGSAP }

export const EASE_EXPO = 'expo.out'
export const MOTION_OK = '(prefers-reduced-motion: no-preference)'
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- intro curtain coordination ---------- */
const INTRO_KEY = 'angbu-intro-seen'
let introResolve: () => void = () => {}
const introPromise = new Promise<void>((r) => (introResolve = r))

const readSeen = () => {
    try {
        return sessionStorage.getItem(INTRO_KEY) === '1'
    } catch {
        return true
    }
}

export const introWillPlay = typeof window !== 'undefined' && !reducedMotion() && !readSeen()
if (!introWillPlay) introResolve()

export const finishIntro = () => {
    try {
        sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
        /* storage unavailable: the intro simply plays again next visit */
    }
    introResolve()
}

export const whenIntroDone = (cb: () => void) => {
    introPromise.then(cb)
}

/* ---------- reusable scroll effects ---------- */

/** Mask-reveals each line of a heading, either on load or when it scrolls into view. */
export function revealLines(target: Element, opts: { delay?: number; onScroll?: boolean } = {}) {
    const split = SplitText.create(target, { type: 'lines', mask: 'lines', linesClass: 'line', autoSplit: true,
        onSplit(self) {
            return gsap.from(self.lines, {
                yPercent: 110,
                duration: 1.25,
                stagger: 0.1,
                ease: EASE_EXPO,
                delay: opts.delay ?? 0,
                scrollTrigger: opts.onScroll ? { trigger: target, start: 'top 88%', once: true } : undefined,
            })
        },
    })
    return split
}

/** Words brighten from faint to full as the paragraph is scrolled through (scrubbed). */
export function scrubWords(target: Element, opts: { start?: string; end?: string } = {}) {
    return SplitText.create(target, { type: 'words', wordsClass: 'word', autoSplit: true,
        onSplit(self) {
            return gsap.fromTo(self.words, { opacity: 0.16 }, {
                opacity: 1,
                ease: 'none',
                stagger: 0.08,
                scrollTrigger: { trigger: target, start: opts.start ?? 'top 80%', end: opts.end ?? 'bottom 55%', scrub: true },
            })
        },
    })
}

/** Fades + lifts every [data-reveal] element inside scope as it enters the viewport. */
export function revealOnScroll(scope: Element) {
    scope.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
            y: 36,
            autoAlpha: 0,
            duration: 1.1,
            delay: Number(el.dataset.reveal) || 0,
            ease: EASE_EXPO,
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        })
    })
    scope.querySelectorAll<HTMLElement>('[data-rule]').forEach((el) => {
        gsap.from(el, {
            scaleX: 0,
            transformOrigin: 'left center',
            duration: 1.4,
            ease: 'expo.inOut',
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        })
    })
}

/** Counts a number up when it scrolls into view. */
export function countUp(el: HTMLElement) {
    const end = Number(el.dataset.count)
    const obj = { v: 0 }
    gsap.to(obj, {
        v: end,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => (el.textContent = Math.round(obj.v).toString()),
    })
}

/**
 * The signature hero move: the full-bleed media holds (CSS sticky), then shrinks into a
 * framed window while the headline drifts away. Sticky rather than a GSAP pin because
 * switching a playing <video>'s ancestor to position:fixed stops Chromium painting it.
 */
export function heroShrink(section: Element, frame: Element, media: Element, content: Element) {
    const mobile = window.innerWidth < 760
    const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: true },
    })
    tl.to(frame, { clipPath: mobile ? 'inset(6% 4% 6% 4% round 18px)' : 'inset(9% 5% 9% 5% round 28px)', ease: 'none' }, 0)
        .fromTo(media, { scale: 1.12 }, { scale: 1, ease: 'none' }, 0)
        .to(content, { yPercent: -18, autoAlpha: 0, ease: 'power1.in', duration: 0.6 }, 0)
    return tl
}

/** Pause a video while it is off screen so only visible media decodes. Returns a cleanup. */
export function playWhenVisible(video: HTMLVideoElement, trigger: Element = video) {
    const st = ScrollTrigger.create({
        trigger,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
            if (self.isActive) video.play().catch(() => {})
            else video.pause()
        },
    })
    // Chrome pauses muted video in background tabs; pick it back up on return.
    const onVisible = () => {
        if (document.visibilityState === 'visible' && st.isActive) video.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
}
