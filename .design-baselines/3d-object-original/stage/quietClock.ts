// @react-three/fiber still constructs THREE.Clock internally; three r185 logs
// a deprecation notice for it. Drop only that one upstream message.
if (typeof window !== "undefined" && !(window as Window & { __axClockPatched?: boolean }).__axClockPatched) {
  (window as Window & { __axClockPatched?: boolean }).__axClockPatched = true;
  const warn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].startsWith("THREE.Clock: This module has been deprecated")) {
      return;
    }
    warn(...args);
  };
}

export {};
