// Salestrig Studio rebrand — i18n locale JSON VALUES only.
// Replaces capitalized brand words in translated values across ALL locales,
// while preserving JSON KEYS (which contain `_postiz`/`_gitroom` identifiers)
// and the upstream GitHub attribution URL (lowercase `gitroomhq/postiz-app`).
// Run: node scripts/rebrand-i18n.mjs [--dry]
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOT = 'libraries/react-shared-libraries/src/translation/locales';

function fixValue(v) {
  if (typeof v !== 'string') return v;
  // Only capitalized brand words appear in values; lowercase (URLs/keys) untouched.
  return v.replace(/\bPostiz\b/g, 'Salestrig Studio').replace(/\bGitroom\b/g, 'Salestrig Studio');
}
function walkVal(o) {
  if (Array.isArray(o)) return o.map(walkVal);
  if (o && typeof o === 'object') {
    const out = {};
    for (const k of Object.keys(o)) out[k] = walkVal(o[k]); // keys preserved verbatim
    return out;
  }
  return fixValue(o);
}

const changed = [];
function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (e.endsWith('.json')) {
      const orig = readFileSync(p, 'utf8');
      let data;
      try { data = JSON.parse(orig); } catch { continue; }
      const next = JSON.stringify(walkVal(data), null, 2) + '\n';
      if (next !== orig) {
        const n = (orig.match(/\bPostiz\b|\bGitroom\b/g) || []).length;
        changed.push([p, n]);
        if (!DRY) writeFileSync(p, next);
      }
    }
  }
}
walk(ROOT);
console.log(`${DRY ? '[dry] would change' : 'changed'} ${changed.length} locale files:`);
changed.forEach(([f, n]) => console.log(`  ${n}x  ${f.replace(/\\/g, '/').split('/locales/')[1]}`));
