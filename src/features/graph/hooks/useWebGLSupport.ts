"use client";

import { useState } from "react";

interface WebGLSupportResult {
  supported: boolean | null;
}

function detectWebGLSupport(): boolean | null {
  if (typeof window === "undefined") return null;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
  return context !== null;
}

export function useWebGLSupport(): WebGLSupportResult {
  const [supported] = useState<boolean | null>(detectWebGLSupport);
  return { supported };
}
