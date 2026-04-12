const _warn = console.warn.bind(console);

console.warn = (...args: unknown[]): void => {
  if (typeof args[0] === "string" && args[0].includes("THREE.Clock")) return;
  _warn(...args);
};
