import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const MCP_SERVER_URL = 'https://mcp.cloudflare.com/mcp';
const MCP_REMOTE_VERSION = '0.1.37';
const MCP_REMOTE_CONFIG_VERSIONS = [MCP_REMOTE_VERSION, '0.1.36'];
const MCP_AUTH_HASH = process.env.CF_MCP_AUTH_HASH || '6244cf5467a6f706b7b55d5e88d4e4c4';
const ACCOUNT_ID = process.env.CF_ACCOUNT_ID || 'c27c3d9e70c028c8076add760bc0a638';
const PROJECT_NAME = process.env.CF_PAGES_PROJECT || 'zaynjarvis-com';
const BUILD_DIR = process.env.CF_PAGES_BUILD_DIR || 'dist';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function writeMcpAuth() {
  for (const version of MCP_REMOTE_CONFIG_VERSIONS) {
    const authDir = path.join(os.homedir(), '.mcp-auth', `mcp-remote-${version}`);
    fs.mkdirSync(authDir, { recursive: true, mode: 0o700 });
    fs.writeFileSync(
      path.join(authDir, `${MCP_AUTH_HASH}_client_info.json`),
      requireEnv('CF_MCP_CLIENT_INFO_JSON'),
      { mode: 0o600 },
    );
    fs.writeFileSync(
      path.join(authDir, `${MCP_AUTH_HASH}_tokens.json`),
      requireEnv('CF_MCP_TOKENS_JSON'),
      { mode: 0o600 },
    );
  }
}

function createMcpClient() {
  const child = spawn(
    'npx',
    ['-y', `mcp-remote@${MCP_REMOTE_VERSION}`, MCP_SERVER_URL],
    { stdio: ['pipe', 'pipe', 'pipe'] },
  );

  let nextId = 1;
  const pending = new Map();
  let stdoutBuffer = '';
  let stderrBuffer = '';

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    stdoutBuffer += chunk;
    for (;;) {
      const newline = stdoutBuffer.indexOf('\n');
      if (newline === -1) break;
      const line = stdoutBuffer.slice(0, newline).trim();
      stdoutBuffer = stdoutBuffer.slice(newline + 1);
      if (!line) continue;
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        continue;
      }
      if (message.id && pending.has(message.id)) {
        const { resolve, reject } = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) reject(new Error(JSON.stringify(message.error)));
        else resolve(message.result);
      }
    }
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    stderrBuffer += chunk;
    const lines = stderrBuffer.split('\n');
    stderrBuffer = lines.pop() || '';
    for (const line of lines) {
      if (line.includes('[ERROR]') || line.includes('Fatal error')) {
        process.stderr.write(`${line}\n`);
      }
    }
  });

  function request(method, params = {}) {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`MCP request timed out: ${method}`));
      }, 120_000);
      pending.set(id, {
        resolve: (value) => {
          clearTimeout(timeout);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });
      child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
    });
  }

  async function initialize() {
    await request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'zaynjarvis-com-pages-deploy', version: '0.1.0' },
    });
    child.stdin.write(`${JSON.stringify({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
      params: {},
    })}\n`);
  }

  async function execute(code) {
    const result = await request('tools/call', {
      name: 'execute',
      arguments: { code, account_id: ACCOUNT_ID },
    });
    const text = result.content?.find((item) => item.type === 'text')?.text || '';
    if (result.isError) {
      throw new Error(text || 'Cloudflare MCP execute failed');
    }
    return JSON.parse(text);
  }

  function close() {
    child.kill('SIGTERM');
  }

  return { initialize, execute, close };
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.map': 'application/json',
    '.json': 'application/json',
    '.webmanifest': 'application/manifest+json',
    '.svg': 'image/svg+xml',
    '.xml': 'application/xml',
    '.txt': 'text/plain',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
  }[ext] || 'application/octet-stream';
}

function collectFiles(root) {
  const ignored = new Set([
    '_routes.json',
    '_worker.js',
    'functions',
    'node_modules',
    '.git',
    '.wrangler',
    '.DS_Store',
  ]);

  function walk(dir, base = '') {
    const files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const relative = base ? `${base}/${entry.name}` : entry.name;
      if (ignored.has(relative) || ignored.has(entry.name)) continue;
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) files.push(...walk(absolute, relative));
      if (entry.isFile()) {
        const contents = fs.readFileSync(absolute);
        const ext = path.extname(relative).slice(1);
        const hash = crypto.createHash('sha256')
          .update(contents.toString('base64'))
          .update(ext)
          .digest('hex')
          .slice(0, 32);
        files.push({
          relative,
          absolute,
          hash,
          contentType: contentType(relative),
          sizeInBytes: contents.byteLength,
        });
      }
    }
    return files;
  }

  return walk(root);
}

async function cloudflareUpload(pathname, jwt, body) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${pathname}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok || json.success === false) {
    throw new Error(`${pathname} failed: ${JSON.stringify(json.errors || json)}`);
  }
  return json.result;
}

async function uploadAssets(files, jwt) {
  const hashes = files.map((file) => file.hash);
  const missing = await cloudflareUpload('/pages/assets/check-missing', jwt, { hashes });
  const missingSet = new Set(missing);
  const filesToUpload = files.filter((file) => missingSet.has(file.hash));

  if (filesToUpload.length) {
    const payload = filesToUpload.map((file) => ({
      key: file.hash,
      value: fs.readFileSync(file.absolute).toString('base64'),
      metadata: { contentType: file.contentType },
      base64: true,
    }));
    await cloudflareUpload('/pages/assets/upload', jwt, payload);
  }
  await cloudflareUpload('/pages/assets/upsert-hashes', jwt, { hashes });

  console.log(`Uploaded ${filesToUpload.length} changed asset(s); ${files.length - filesToUpload.length} cached.`);
}

function multipartBody(fields, files) {
  const boundary = `----zayn-pages-${Date.now().toString(16)}`;
  const parts = [];
  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') continue;
    parts.push(`--${boundary}`, `Content-Disposition: form-data; name="${name}"`, '', String(value));
  }
  for (const file of files) {
    if (!file.content) continue;
    parts.push(
      `--${boundary}`,
      `Content-Disposition: form-data; name="${file.name}"; filename="${file.filename}"`,
      `Content-Type: ${file.contentType}`,
      '',
      file.content,
    );
  }
  parts.push(`--${boundary}--`, '');
  return { boundary, body: parts.join('\r\n') };
}

async function main() {
  writeMcpAuth();

  const root = path.resolve(BUILD_DIR);
  if (!fs.existsSync(root)) {
    throw new Error(`Build directory does not exist: ${root}`);
  }

  const client = createMcpClient();
  try {
    await client.initialize();
    const uploadToken = await client.execute(`async () => {
      const r = await cloudflare.request({ method: 'GET', path: \`/accounts/\${accountId}/pages/projects/${PROJECT_NAME}/upload-token\` });
      return { jwt: r.result.jwt };
    }`);

    const files = collectFiles(root);
    const manifest = Object.fromEntries(files.map((file) => [`/${file.relative}`, file.hash]));
    await uploadAssets(files, uploadToken.jwt);

    const commitHash = process.env.GITHUB_SHA || process.env.CF_PAGES_COMMIT_HASH || 'manual';
    const commitMessage = process.env.CF_PAGES_COMMIT_MESSAGE || process.env.GITHUB_REF_NAME || 'Deploy from GitHub Actions';
    const headersPath = path.join(root, '_headers');
    const redirectsPath = path.join(root, '_redirects');
    const upload = multipartBody(
      {
        manifest: JSON.stringify(manifest),
        branch: process.env.GITHUB_REF_NAME || 'main',
        commit_hash: commitHash,
        commit_message: commitMessage,
        commit_dirty: 'false',
      },
      [
        {
          name: '_headers',
          filename: '_headers',
          contentType: 'text/plain',
          content: fs.existsSync(headersPath) ? fs.readFileSync(headersPath, 'utf8') : '',
        },
        {
          name: '_redirects',
          filename: '_redirects',
          contentType: 'text/plain',
          content: fs.existsSync(redirectsPath) ? fs.readFileSync(redirectsPath, 'utf8') : '',
        },
      ],
    );

    const deployment = await client.execute(`async () => {
      const r = await cloudflare.request({
        method: 'POST',
        path: \`/accounts/\${accountId}/pages/projects/${PROJECT_NAME}/deployments\`,
        contentType: ${JSON.stringify(`multipart/form-data; boundary=${upload.boundary}`)},
        rawBody: true,
        body: ${JSON.stringify(upload.body)}
      });
      return {
        id: r.result.id,
        url: r.result.url,
        environment: r.result.environment,
        latest_stage: r.result.latest_stage
      };
    }`);

    console.log(`Created deployment ${deployment.id}: ${deployment.url}`);
  } finally {
    client.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
