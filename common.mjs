import { createHash } from 'node:crypto';
export const canonical = value => JSON.stringify(value, (_key, val) => {
  if (val && typeof val === 'object' && !Array.isArray(val))
    return Object.fromEntries(Object.entries(val).sort(([a],[b]) => a<b?-1:a>b?1:0));
  return val;
});
export const digest = value => createHash('sha256').update(typeof value === 'string' ? value : canonical(value)).digest('hex');
export function requireCondition(ok, code) { if (!ok) throw new Error(code); }
export function mean(values) { return values.length ? values.reduce((a,b)=>a+b,0)/values.length : null; }
export const NOTICE = 'SYNTHETIC OFFLINE CONTRACT DEMONSTRATION — NOT RESEARCH RESULTS';
