// Salestrig Studio rebrand — library .ts/.tsx code/operator labels.
// (Sentry names, Swagger title, MCP name, agency emails, etc.)
// EXCLUDES: is.general.server.side.ts (AGPL attribution comment) and
// testomonials.tsx (real third-party quotes — must not be reattributed).
// Run: node scripts/rebrand-libs.mjs [--dry]
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOT = 'libraries';
const SKIP = new Set(['is.general.server.side.ts', 'testomonials.tsx']);

const changed = [];
function walk(dir) {
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === 'dist') continue;
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(tsx?|mts)$/.test(e) && !SKIP.has(basename(p))) {
      const orig = readFileSync(p, 'utf8');
      const next = orig.replace(/#Postiz\b/g, '#Salestrig').replace(/\bPostiz\b/g, 'Salestrig Studio');
      if (next !== orig) {
        const n = (orig.match(/\bPostiz\b/g) || []).length;
        changed.push([p, n]);
        if (!DRY) writeFileSync(p, next);
      }
    }
  }
}
walk(ROOT);
console.log(`${DRY ? '[dry] would change' : 'changed'} ${changed.length} files:`);
changed.forEach(([f, n]) => console.log(`  ${n}x  ${f.replace(/\\/g, '/')}`));
