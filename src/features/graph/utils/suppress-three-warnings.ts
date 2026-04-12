const _warn = console.warn.bind(console);

// three-render-objects, 3d-force-graph 내부에서 사용하는 THREE.Clock이
// three.js r183에서 deprecated되어 발생하는 경고를 억제
console.warn = (...args: unknown[]): void => {
  if (typeof args[0] === "string" && args[0].includes("THREE.Clock")) return;
  _warn(...args);
};
