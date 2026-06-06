// Salestrig Studio rebrand — user-visible COPY in frontend components.
// Case-sensitive, word-boundary "Postiz" -> "Salestrig Studio".
// Special-cases:  #Postiz -> #Salestrig (hashtag, no spaces allowed).
// Protected automatically (no word boundary / lowercase / different case):
//   MyPostizAgent, @postiz/*, postiz.com, @gitroom/*, POSTIZ_* env vars.
//
// Run: node scripts/rebrand-copy.mjs [--dry]
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOT = 'apps/frontend/src/components';

function rewrite(code) {
  return code
    .replace(/#Postiz\b/g, '#Salestrig')        // hashtag default
    .replace(/\bPostiz\b/g, 'Salestrig Studio'); // product name in copy
}

const changed = [];
function walk(dir) {
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === 'dist' || e === '.next') continue;
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(tsx?|mts)$/.test(e)) {
      const orig = readFileSync(p, 'utf8');
      const next = rewrite(orig);
      if (next !== orig) {
        const n = (orig.match(/\bPostiz\b|#Postiz\b/g) || []).length;
        changed.push([p, n]);
        if (!DRY) writeFileSync(p, next);
      }
    }
  }
}
walk(ROOT);
console.log(`${DRY ? '[dry] would change' : 'changed'} ${changed.length} files (${changed.reduce((a, [, n]) => a + n, 0)} replacements):`);
changed.forEach(([f, n]) => console.log(`  ${n}x  ${f.replace(/\\/g, '/')}`));
