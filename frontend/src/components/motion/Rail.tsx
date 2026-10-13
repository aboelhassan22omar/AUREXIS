"use client";

import {
  Children,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type RailProps = {
  children: ReactNode;
  className?: string;
  label: string;
};

/**
 * A Bootstrap row that becomes a swipeable, snapping carousel on phones
 * (with page dots) and stays a normal grid from tablet up.
 */
export default function Rail({ children, className = "", label }: RailProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const count = Children.count(children);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const max = element.scrollWidth - element.clientWidth;
      setActive(max <= 0 ? 0 : Math.round((element.scrollLeft / max) * (count - 1)));
    };
    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    element.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", onScroll);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [count]);

  function goTo(index: number) {
    const element = ref.current;
    const target = element?.children[index] as HTMLElement | undefined;

    if (element && target) {
      element.scrollTo({ left: target.offsetLeft - element.offsetLeft - 20, behavior: "smooth" });
    }
  }

  return (
    <>
      <div ref={ref} className={`row ax-rail ${className}`.trim()} role="region" aria-label={label}>
        {children}
      </div>
      {count > 1 && (
        <div className="ax-rail__dots" role="tablist" aria-label={`${label} pages`}>
          {Array.from({ length: count }, (_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-label={`Show item ${index + 1} of ${count}`}
              className={active === index ? "is-active" : undefined}
              onClick={() => goTo(index)}
            >
              <span />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
