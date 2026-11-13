"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function usePageTransition() {
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scope.current) return;

    const ctx = gsap.context(() => {
      // Page header slide in
      gsap.from("[data-anim='header']", {
        y: -20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });

      // Balance card scale in
      gsap.from("[data-anim='balance']", {
        scale: 0.95,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.15,
      });

      // Staggered list items
      gsap.from("[data-anim='list-item']", {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.06,
        ease: "power2.out",
        delay: 0.25,
      });

      // Cards fade up
      gsap.from("[data-anim='card']", {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.2,
      });

      // Section headings
      gsap.from("[data-anim='section']", {
        y: 15,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.1,
      });

      // Action buttons (quick actions row)
      gsap.from("[data-anim='action']", {
        scale: 0.8,
        opacity: 0,
        duration: 0.35,
        stagger: 0.05,
        ease: "back.out(1.5)",
        delay: 0.35,
      });

      // Form elements
      gsap.from("[data-anim='form']", {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.15,
      });

      // Scroll-triggered items
      gsap.utils.toArray<HTMLElement>("[data-anim='scroll-item']").forEach((el, i) => {
        gsap.from(el, {
          y: 25,
          opacity: 0,
          duration: 0.45,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
          delay: i * 0.04,
        });
      });

      // Success/error screens
      gsap.from("[data-anim='result-icon']", {
        scale: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
        delay: 0.1,
      });

      gsap.from("[data-anim='result-text']", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.4,
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return scope;
}
