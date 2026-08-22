"use client";

/**
 * Compatibility shim.
 *
 * The AUREXIS robot is now rendered once from the persistent
 * GlobalRobotGuide mounted in the root layout. Keeping this
 * component prevents existing Hero imports from breaking while
 * guaranteeing that a second Canvas/WebGL context is not created.
 */
export default function AurexisHeroAgent() {
  return null;
}
