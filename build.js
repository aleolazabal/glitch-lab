const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const DIST = path.join(__dirname, 'dist');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
fs.mkdirSync(DIST, { recursive: true });

['index.html', 'v1.html'].forEach(f => {
  if (fs.existsSync(path.join(__dirname, f)))
    fs.copyFileSync(path.join(__dirname, f), path.join(DIST, f));
});

['assets'].forEach(d => {
  copyRecursive(path.join(__dirname, d), path.join(DIST, d));
});

let html = fs.readFileSync(path.join(__dirname, 'v2.html'), 'utf8');

const scriptRegex = /(<script[^>]*>)([\s\S]*?)(<\/script>)/gi;
let match;
let result = '';
let lastIndex = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  const [full, openTag, jsCode, closeTag] = match;
  result += html.slice(lastIndex, match.index);

  if (jsCode.trim().length > 500) {
    console.log(`Obfuscating script block (${jsCode.length} chars)...`);
    try {
      const obfuscated = JavaScriptObfuscator.obfuscate(jsCode, {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.4,
        deadCodeInjection: false,
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false,
        stringArray: true,
        stringArrayThreshold: 0.5,
        stringArrayEncoding: ['base64'],
        splitStrings: true,
        splitStringsChunkLength: 10,
        transformObjectKeys: false,
        unicodeEscapeSequence: false,
        target: 'browser',
        selfDefending: false,
        disableConsoleOutput: false,
        reservedNames: [
          'gl', 'canvas', 'video', 'state',
          'u_tex', 'u_feedback', 'u_res', 'u_texRes', 'u_time',
          'a_pos', 'v_uv', 'outCol'
        ]
      });
      result += openTag + obfuscated.getObfuscatedCode() + closeTag;
    } catch (err) {
      console.warn('Obfuscation failed for a script block, copying as-is:', err.message);
      result += full;
    }
  } else {
    result += full;
  }
  lastIndex = match.index + full.length;
}
result += html.slice(lastIndex);

result = result.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, (m, open, css, close) => {
  const minified = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*([{}:;,>~+])\s*/g, '$1')
    .replace(/;\s*}/g, '}')
    .replace(/\n+/g, '')
    .replace(/\s{2,}/g, ' ');
  return open + minified + close;
});

fs.writeFileSync(path.join(DIST, 'v2.html'), result, 'utf8');
console.log(`Build complete. Output: ${DIST}/v2.html (${(result.length / 1024).toFixed(1)} KB)`);
