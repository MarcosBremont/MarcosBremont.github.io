import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const appPath = path.join(repoRoot, 'app.js');
const versionPath = path.join(repoRoot, 'version.json');

function isoUtcNoMillis(date = new Date()) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function parseVersionFromAppJs() {
  if (!fs.existsSync(appPath)) return null;
  const src = fs.readFileSync(appPath, 'utf8');
  const match = src.match(/dash-version-badge[^>]*>v(\d+\.\d+)</i);
  return match ? match[1] : null;
}

function resolveVersion() {
  const forced = String(process.env.BUILD_VERSION || '').trim().replace(/^v/i, '');
  if (forced) return forced;

  const fromCode = parseVersionFromAppJs();
  if (fromCode) return fromCode;

  const useRunNumber = String(process.env.USE_RUN_NUMBER_VERSION || '').toLowerCase() === 'true';
  const runNumber = String(process.env.GITHUB_RUN_NUMBER || '').trim();
  const major = String(process.env.VERSION_MAJOR || '').trim();
  if (useRunNumber && runNumber && major) return `${major}.${runNumber}`;

  return '0.0';
}

const payload = {
  version: resolveVersion(),
  updatedAt: isoUtcNoMillis(),
};

fs.writeFileSync(versionPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
console.log(`version.json updated -> ${payload.version} @ ${payload.updatedAt}`);
