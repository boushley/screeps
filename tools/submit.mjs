#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_DIST = 'dist/main.js';
const DEFAULT_BRANCH = 'default';
const DEFAULT_SERVER = 'https://screeps.com';
const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

async function main() {
  const token = await loadToken();
  const branch = process.env.SCREEPS_BRANCH?.trim() || DEFAULT_BRANCH;
  const moduleName = process.env.SCREEPS_MODULE?.trim() || 'main';
  const distFile = process.env.SCREEPS_DIST?.trim() || DEFAULT_DIST;
  const shouldActivate = parseBoolean(process.env.SCREEPS_ACTIVATE_BRANCH);
  const baseUrl = normalizeBaseUrl(process.env.SCREEPS_SERVER?.trim() || DEFAULT_SERVER);

  const distPath = path.resolve(process.cwd(), distFile);
  const code = await readDist(distPath);

  await commitCode({ baseUrl, token, branch, moduleName, code });

  if (shouldActivate) {
    await activateBranch({ baseUrl, token, branch });
  }
}

async function loadToken() {
  if (process.env.SCREEPS_TOKEN?.trim()) {
    return process.env.SCREEPS_TOKEN.trim();
  }

  const tokenFile = process.env.SCREEPS_TOKEN_FILE?.trim();
  if (!tokenFile) {
    fail(
      'Missing Screeps auth token. Set SCREEPS_TOKEN or SCREEPS_TOKEN_FILE before running `npm run submit`.'
    );
  }

  try {
    const contents = await readFile(path.resolve(process.cwd(), tokenFile), 'utf8');
    const token = contents.trim();
    if (!token) {
      fail(`Token file ${tokenFile} is empty.`);
    }
    return token;
  } catch (error) {
    fail(`Unable to read token file ${tokenFile}: ${error.message || error}`);
  }
}

async function readDist(distPath) {
  try {
    return await readFile(distPath, 'utf8');
  } catch (error) {
    fail(`Unable to read ${distPath}. Run "npm run build" first: ${error.message || error}`);
  }
}

async function commitCode({ baseUrl, token, branch, moduleName, code }) {
  ensureFetch();

  const url = new URL('/api/user/code', baseUrl);
  const payload = {
    branch,
    modules: {
      [moduleName]: code,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Token': token,
    },
    body: JSON.stringify(payload),
  });

  await handleResponse(response, 'Code upload');
}

async function activateBranch({ baseUrl, token, branch }) {
  const url = new URL('/api/user/set-active-branch', baseUrl);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Token': token,
    },
    body: JSON.stringify({ branch }),
  });

  await handleResponse(response, 'Activate branch');
}

async function handleResponse(response, label) {
  const text = await response.text();
  const payload = safeJson(text);

  const info = [
    `${label} response: ${response.status} ${response.statusText}`,
    payload ? JSON.stringify(payload) : text,
  ];

  logRateLimit(response);

  if (!response.ok || payload?.ok !== 1) {
    fail(info.join('\n'));
  }

  console.log(info.join('\n'));
}

function logRateLimit(response) {
  const limit = response.headers.get('x-ratelimit-limit');
  const remaining = response.headers.get('x-ratelimit-remaining');
  const reset = response.headers.get('x-ratelimit-reset');

  if (!limit) return;

  const resetInfo = reset ? new Date(Number(reset) * 1000).toISOString() : 'unknown';
  console.log(`Rate limit: ${remaining}/${limit} remaining, resets at ${resetInfo}`);
}

function safeJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeBaseUrl(value) {
  if (!/^https?:\/\//i.test(value)) {
    return `https://${value}`;
  }
  return value.replace(/\/$/, '');
}

function parseBoolean(value) {
  if (!value) return false;
  return TRUE_VALUES.has(value.toLowerCase());
}

function ensureFetch() {
  if (typeof fetch === 'function') return;
  fail('Global fetch API is unavailable. Use Node.js 18 or newer.');
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
  throw new Error(message);
}

main().catch((error) => {
  if (!process.exitCode) {
    console.error(error?.stack || error?.message || error);
    process.exit(1);
  }
});
