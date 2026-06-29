'use client';
import { useEffect } from 'react';

export default function ScrollObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            // Unobserve to trigger animation only once
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08, // Trigger when 8% of the element enters the viewport
        rootMargin: '0px 0px -40px 0px',
      }
    );

    // Initial scan
    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    // Handle dynamic DOM insertions (like when Clerk finishes loading or hydration completes)
    const mutationObserver = new MutationObserver(() => {
      const currentElements = document.querySelectorAll('.scroll-reveal:not(.reveal-active)');
      currentElements.forEach((el) => observer.observe(el));
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
