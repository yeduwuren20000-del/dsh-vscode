import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(join(root, 'src/parts.json'), 'utf8'));
let mismatches = 0;
for (const [name, parts] of Object.entries(manifest)) {
  const text = (await Promise.all(parts.map(path => readFile(join(root, 'src', path), 'utf8')))).join('');
  const target = join(root, 'lib', name === 'host' ? 'index.js' : 'client.js');
  if (process.argv.includes('--check')) {
    const current = await readFile(target, 'utf8');
    if (current !== text) { console.error(`${name}: generated output differs from ${target}`); mismatches++; }
    else console.log(`${name}: source and build match`);
  } else {
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, text, 'utf8');
    console.log(`${name}: wrote ${target}`);
  }
}
if (mismatches) process.exitCode = 1;
