import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname,'..');
const emitted = new Set(), code = ['const __modules = {};'];
async function bundle(file) {
  if(emitted.has(file))return;
  let source=await readFile(path.join(root,file),'utf8');
  const imports=[...source.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?/g)];
  for(const match of imports) {
    const dependency=path.posix.normalize(path.posix.join(path.posix.dirname(file),match[2]));
    await bundle(dependency);
    const bindings=match[1].split(',').map(s=>s.trim().replace(/\s+as\s+/,': ')).join(', ');
    source=source.replace(match[0],`const { ${bindings} } = __modules[${JSON.stringify(dependency)}];`);
  }
  const names=[...source.matchAll(/export\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)/g)].map(m=>m[1]);
  source=source.replace(/export\s+(?=(?:async\s+)?(?:function|const|let|class)\s)/g,'');
  code.push(`__modules[${JSON.stringify(file)}] = (() => {\n${source}\nreturn {${names.join(',')}};\n})();`);
  emitted.add(file);
}
await bundle('src/main.js');
let html=await readFile(path.join(root,'index.html'),'utf8');
// Fonts are inlined as data URIs so the single file needs nothing at runtime.
async function inlineFonts(css){for(const m of [...css.matchAll(/url\("(fonts\/[\w.-]+\.woff2)"\)/g)])css=css.replace(m[0],`url("data:font/woff2;base64,${(await readFile(path.join(root,'styles',m[1]))).toString('base64')}")`);return css;}
for(const file of ['styles/tokens.css','styles/app.css']) html=html.replace(`<link rel="stylesheet" href="./${file}">`,`<style>${await inlineFonts(await readFile(path.join(root,file),'utf8'))}</style>`);
html=html.replace('<script type="module" src="./src/main.js"></script>','');
html=html.replace('</body>',`<script>${code.join('\n').replace(/<\/script/gi,'<\\/script')}</script></body>`);
await mkdir(path.join(root,'offline'),{recursive:true});
await writeFile(path.join(root,'offline/SmartPrep.html'),html);
console.log(`Built offline/SmartPrep.html (${Math.round(Buffer.byteLength(html)/1024)} KiB, ${emitted.size} modules).`);
