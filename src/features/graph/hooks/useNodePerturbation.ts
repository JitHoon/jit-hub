"use client";

import { useEffect, useRef } from "react";
import type { ForceGraphMethods } from "react-force-graph-3d";

import type { ForceGraph3DNode } from "../types/layout";

const PERTURB_AMPLITUDE = 2.5;
const PERTURB_SPEED = 0.0004;
const PERTURB_PHASE_SPREAD = 137.5;

interface NodeBaseCoords {
  bx: number;
  by: number;
  bz: number;
  phase: number;
}

export function useNodePerturbation(
  graphRef: React.RefObject<ForceGraphMethods | undefined>,
  active: boolean,
): void {
  const rafRef = useRef<number | null>(null);
  const baseCoordsRef = useRef<Map<string | number, NodeBaseCoords>>(new Map());

  useEffect(() => {
    if (!active) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    function captureBaseCoords(): boolean {
      const fg = graphRef.current;
      if (!fg) return false;

      const data = fg.graphData();
      const nodes = data.nodes as ForceGraph3DNode[];
      if (nodes.length === 0) return false;

      const map = baseCoordsRef.current;
      let needsCapture = false;
      for (const node of nodes) {
        const id = node.id ?? "";
        if (!map.has(id)) {
          needsCapture = true;
          break;
        }
      }

      if (!needsCapture) return true;

      map.clear();
      nodes.forEach((node, index) => {
        const id = node.id ?? "";
        map.set(id, {
          bx: node.x ?? 0,
          by: node.y ?? 0,
          bz: node.z ?? 0,
          phase: (index * PERTURB_PHASE_SPREAD * Math.PI) / 180,
        });
      });

      return true;
    }

    function tick(timestamp: number): void {
      const fg = graphRef.current;
      if (!fg) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!captureBaseCoords()) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const data = fg.graphData();
      const nodes = data.nodes as ForceGraph3DNode[];
      const map = baseCoordsRef.current;

      for (const node of nodes) {
        const id = node.id ?? "";
        const base = map.get(id);
        if (!base) continue;

        const t = timestamp * PERTURB_SPEED + base.phase;
        node.x = base.bx + Math.sin(t) * PERTURB_AMPLITUDE;
        node.y = base.by + Math.sin(t * 1.3 + 1.0) * PERTURB_AMPLITUDE;
        node.z = base.bz + Math.sin(t * 0.7 + 2.1) * PERTURB_AMPLITUDE;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [active, graphRef]);
}
