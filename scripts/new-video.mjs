import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const args = process.argv.slice(2);
const name = args.find((a, i) => !a.startsWith('-') && args[i - 1] !== '--mode');
const modeAt = args.indexOf('--mode');
const mode = modeAt >= 0 ? args[modeAt + 1] : 'general';

if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
  console.error('Usage: npm run new -- <lowercase-name> --mode general|customer');
  process.exit(1);
}
if (!['general', 'customer'].includes(mode)) {
  console.error('Mode must be general or customer.');
  process.exit(1);
}

const target = join(root, 'videos', name);
if (existsSync(target)) {
  console.error(`Refusing to overwrite existing project: ${target}`);
  process.exit(1);
}

mkdirSync(dirname(target), { recursive: true });
cpSync(join(root, 'starter'), target, { recursive: true });
mkdirSync(join(target, 'project'), { recursive: true });
cpSync(join(root, 'templates', mode, 'brief.md'), join(target, 'project', 'brief.md'));
for (const file of [
  'STATUS.md',
  'brand.md',
  'facts-and-claims.md',
  'story.md',
  'visual-direction.md',
  'storyboard.md',
  'script.md',
  'production-plan.md',
]) {
  cpSync(join(root, 'templates', file), join(target, 'project', file));
}
const statusPath = join(target, 'project', 'STATUS.md');
writeFileSync(
  statusPath,
  readFileSync(statusPath, 'utf8')
    .replace('- Name:', `- Name: ${name}`)
    .replace('- Mode: General / Customer', `- Mode: ${mode === 'customer' ? 'Customer' : 'General'}`),
);
// Copy all phase skills so users can enter at any phase or use the orchestrator.
mkdirSync(join(target, '.glean'), { recursive: true });
cpSync(join(root, '.glean', 'skills'), join(target, '.glean', 'skills'), { recursive: true });
// Keep each generated project self-contained when it becomes its own repository.
cpSync(join(root, 'references'), join(target, 'references'), { recursive: true });
for (const file of ['QA_CHECKLIST.md', 'NOTICE.md', 'WORKFLOW.md', 'SKILLS.md']) {
  cpSync(join(root, file), join(target, file));
}

const pkgPath = join(target, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.name = name;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

const titlePath = join(target, 'index.html');
writeFileSync(
  titlePath,
  readFileSync(titlePath, 'utf8').replace(
    '<title>Glean × ExampleCo · One front door for the whole customer journey</title>',
    `<title>${basename(name)} · Glean risograph editorial explainer</title>`,
  ),
);

console.log(`Created ${target}`);
console.log(`Mode: ${mode}`);
console.log('Next:');
console.log(`  cd ${target}`);
console.log('  npm install');
console.log('  cp .env.example .env');
console.log('  complete project/brief.md');
console.log('  open this folder in Glean Desktop, run /reload, and invoke risograph-explainer-workflow');
