// Salestrig Studio rebrand codemod — replaces ONLY brand-name expressions with
// the central brandName() helper. Leaves @gitroom/@postiz package names,
// POSTIZ_* env vars, analytics domains, and all other code untouched.
//
// Run: node scripts/rebrand-titles.mjs            (apply)
//      node scripts/rebrand-titles.mjs --dry      (preview)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOTS = ['apps/frontend/src', 'apps/backend/src', 'libraries'];
const HELPER = '@gitroom/helpers/utils/is.general.server.side';
const importRe = new RegExp(
  `import\\s*\\{([^}]*)\\}\\s*from\\s*['"]${HELPER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?`
);

/** Specific, unambiguous brand expressions → replacement. */
function rewrite(code) {
  return code
    // `${isGeneralServerSide() ? 'Postiz Calendar' : 'Gitroom Launches'}` -> `${brandName()} Calendar`
    .replace(
      /\$\{\s*isGeneralServerSide\(\)\s*\?\s*'Postiz Calendar'\s*:\s*'Gitroom Launches'\s*\}/g,
      '${brandName()} Calendar'
    )
    // isGeneralServerSide() ? 'Postiz' : 'Gitroom'  -> brandName()
    .replace(
      /isGeneralServerSide\(\)\s*\?\s*'Postiz'\s*:\s*'Gitroom'/g,
      'brandName()'
    )
    // hardcoded 'Postiz - Agent' -> `${brandName()} - Agent`
    .replace(/'Postiz - Agent'/g, '`${brandName()} - Agent`');
}

function fixImports(code) {
  const usesBrand = /brandName\(/.test(code);
  const usesIsGeneral = /isGeneralServerSide\(/.test(code);
  const m = code.match(importRe);
  if (m) {
    const names = new Set(
      m[1].split(',').map((s) => s.trim()).filter(Boolean)
    );
    if (usesBrand) names.add('brandName');
    if (!usesIsGeneral) names.delete('isGeneralServerSide');
    const repl = names.size
      ? `import { ${[...names].join(', ')} } from '${HELPER}';`
      : '';
    return code.replace(importRe, repl).replace(/^\s*\n/gm, (s, o) => (o === code.indexOf(repl) ? '' : s));
  }
  if (usesBrand) {
    // inject after the first import line
    const lines = code.split('\n');
    const idx = lines.findIndex((l) => /^import\b/.test(l));
    const at = idx >= 0 ? idx + 1 : 0;
    lines.splice(at, 0, `import { brandName } from '${HELPER}';`);
    return lines.join('\n');
  }
  return code;
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
      let next = rewrite(orig);
      if (next !== orig) next = fixImports(next);
      if (next !== orig) {
        changed.push(p);
        if (!DRY) writeFileSync(p, next);
      }
    }
  }
}

for (const r of ROOTS) {
  try { walk(r); } catch (e) { /* root may not exist */ }
}
console.log(`${DRY ? '[dry] would change' : 'changed'} ${changed.length} files:`);
changed.forEach((f) => console.log('  ' + f.replace(/\\/g, '/')));
