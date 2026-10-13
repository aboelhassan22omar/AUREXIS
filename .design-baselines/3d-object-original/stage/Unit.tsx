"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { UnitShowcaseProps } from "@/components/stage/UnitShowcase";

const UnitShowcase = dynamic(() => import("@/components/stage/UnitShowcase"), {
  ssr: false,
});

type UnitProps = UnitShowcaseProps & {
  className?: string;
};

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Drop-in Aurexis Unit. Lazy-loads the 3D scene, fades it in once the GPU
 * is ready and shows a lit pedestal poster while loading or without WebGL.
 */
export default function Unit({ className = "", ...props }: UnitProps) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setWebgl(supportsWebGL());
  }, []);

  return (
    <div className={`ax-unit ${ready ? "is-ready" : ""} ${className}`.trim()}>
      <div className="ax-unit__poster" aria-hidden="true">
        <span className="ax-unit__halo" />
        <span className="ax-unit__pedestal" />
      </div>
      {webgl && (
        <div className="ax-unit__stage">
          <UnitShowcase {...props} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
