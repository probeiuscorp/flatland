export function next<T, V>(x: T | undefined, fn: (x: T) => V | undefined): V | undefined {
  if(x === undefined) return undefined;
  return fn(x);
}
