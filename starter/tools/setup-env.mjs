import { chmodSync, copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ENV_PATH = resolve(ROOT, '.env');
const EXAMPLE_PATH = resolve(ROOT, '.env.example');

const DEFAULT_ENV = `# Local production settings. Never commit or share this file.
ELEVENLABS_API_KEY=
# Set after voice auditions.
ELEVEN_VOICE_ID=
ELEVEN_MODEL=eleven_v3
ELEVEN_STABILITY=0.5
ELEVEN_STYLE=0.15
ELEVEN_SPEED=1.0
# Post-generation tempo; 1.075 is 7.5% faster without changing pitch.
VO_TEMPO=1.075
`;

const DEFAULTS = {
  ELEVENLABS_API_KEY: '',
  ELEVEN_VOICE_ID: '',
  ELEVEN_MODEL: 'eleven_v3',
  ELEVEN_STABILITY: '0.5',
  ELEVEN_STYLE: '0.15',
  ELEVEN_SPEED: '1.0',
  VO_TEMPO: '1.075',
};

function flag(name) {
  return process.argv.includes(`--${name}`);
}

function arg(name) {
  const at = process.argv.indexOf(`--${name}`);
  return at >= 0 ? process.argv[at + 1] : undefined;
}

function parse(text) {
  const values = {};
  for (const line of text.split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) values[match[1]] = match[2].replace(/^['"]|['"]$/g, '').trim();
  }
  return values;
}

function isConfigured(value) {
  if (!value) return false;
  return !/^(paste|replace|your[_-]?|example|changeme|todo)/i.test(value);
}

function ensureEnv() {
  let source;
  if (existsSync(ENV_PATH)) {
    source = 'existing';
  } else if (existsSync(EXAMPLE_PATH)) {
    copyFileSync(EXAMPLE_PATH, ENV_PATH);
    source = 'copied-example';
  } else {
    writeFileSync(ENV_PATH, DEFAULT_ENV, { mode: 0o600 });
    source = 'built-in-template';
  }

  let text = readFileSync(ENV_PATH, 'utf8');
  const values = parse(text);
  const missing = Object.entries(DEFAULTS).filter(([key]) => !(key in values));
  if (missing.length) {
    if (text && !text.endsWith('\n')) text += '\n';
    text += `\n# Added automatically by npm run env:setup.\n`;
    text += missing.map(([key, value]) => `${key}=${value}`).join('\n') + '\n';
    writeFileSync(ENV_PATH, text, { mode: 0o600 });
  }
  chmodSync(ENV_PATH, 0o600);
  return source;
}

function setVariable(key, value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error(`Invalid ${key} format.`);
  const lines = readFileSync(ENV_PATH, 'utf8').split('\n');
  let found = false;
  const updated = lines.map((line) => {
    if (new RegExp(`^\\s*${key}\\s*=`).test(line)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });
  if (!found) updated.push(`${key}=${value}`);
  writeFileSync(ENV_PATH, updated.join('\n'), { mode: 0o600 });
}

const source = ensureEnv();
const voice = arg('set-voice');
if (voice) setVariable('ELEVENLABS_VOICE_ID', voice);

const values = parse(readFileSync(ENV_PATH, 'utf8'));
const keyReady = isConfigured(values.ELEVENLABS_API_KEY);
const voiceReady = isConfigured(values.ELEVENLABS_VOICE_ID);
const requireVoice = flag('require-voice');

console.log(`Environment file: ${ENV_PATH}`);
console.log(`Preparation: ${source}`);
console.log(`ElevenLabs API key: ${keyReady ? 'configured' : 'ACTION REQUIRED'}`);
console.log(`ElevenLabs voice ID: ${voiceReady ? 'configured' : 'not selected'}`);
console.log('Secret values were not displayed.');

if (!keyReady) {
  console.log('\nUSER ACTION REQUIRED');
  console.log('1. Open the exact .env file shown above.');
  console.log('2. Paste the key after ELEVENLABS_API_KEY= with no extra spaces.');
  console.log('3. Save the file, return to Tau, and confirm that the key is saved.');
  console.log('Do not paste the API key into chat, a document, Slack, or GitHub.');
}

if (voice && voiceReady) console.log('\nVoice ID saved without displaying or changing the API key.');

if (flag('check')) {
  if (!keyReady) {
    console.error('\nEnvironment check failed: ElevenLabs API key is not configured.');
    process.exit(2);
  }
  if (requireVoice && !voiceReady) {
    console.error('\nEnvironment check failed: ElevenLabs voice ID is not configured.');
    process.exit(3);
  }
  console.log('\nEnvironment check passed.');
}
