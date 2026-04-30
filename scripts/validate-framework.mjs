#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CONCEPTS_DIR = join(ROOT, 'src/content/concepts');
const CATEGORIES_DIR = join(ROOT, 'src/content/categories');
const FRAMEWORK_DIR = join(ROOT, 'src/content/framework');

const VALID_CATEGORIES = ['axioms', 'constraints', 'design-requirements'];
const VALID_STATUSES = ['placeholder', 'canonical-entry', 'full-essay'];

const errors = [];
const fail = (msg) => errors.push(msg);

async function listFiles(dir, ext) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir);
  return entries.filter((f) => f.endsWith(ext)).map((f) => join(dir, f));
}

function parseFrontmatter(raw, file) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    fail(`${file}: missing frontmatter block`);
    return null;
  }
  const lines = match[1].split(/\r?\n/);
  const data = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '' || line.trim().startsWith('#')) {
      i++;
      continue;
    }
    const kv = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (!kv) {
      i++;
      continue;
    }
    const [, key, rawValue] = kv;
    if (rawValue === '') {
      const arr = [];
      i++;
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        arr.push(lines[i].replace(/^\s*-\s+/, '').trim().replace(/^["']|["']$/g, ''));
        i++;
      }
      data[key] = arr;
      continue;
    }
    const inline = rawValue.match(/^\[(.*)\]$/);
    if (inline) {
      data[key] = inline[1]
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else {
      data[key] = rawValue.trim().replace(/^["']|["']$/g, '');
    }
    i++;
  }
  return data;
}

async function loadConcepts() {
  const dir = CONCEPTS_DIR;
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir);
  const files = entries
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((f) => join(dir, f));
  const concepts = [];
  for (const file of files) {
    const raw = await readFile(file, 'utf8');
    const data = parseFrontmatter(raw, file);
    if (!data) continue;
    const slug = basename(file).replace(/\.(md|mdx)$/, '');
    concepts.push({ slug, file, data });
  }
  return concepts;
}

async function loadJson(dir) {
  const files = await listFiles(dir, '.json');
  const out = [];
  for (const file of files) {
    try {
      const raw = await readFile(file, 'utf8');
      out.push({ slug: basename(file, '.json'), file, data: JSON.parse(raw) });
    } catch (e) {
      fail(`${file}: invalid JSON — ${e.message}`);
    }
  }
  return out;
}

const [concepts, categories, framework] = await Promise.all([
  loadConcepts(),
  loadJson(CATEGORIES_DIR),
  loadJson(FRAMEWORK_DIR),
]);

const conceptSlugs = new Set(concepts.map((c) => c.slug));
const categorySlugs = new Set(categories.map((c) => c.data.slug));

for (const c of categories) {
  if (!VALID_CATEGORIES.includes(c.data.slug)) {
    fail(`${c.file}: category slug "${c.data.slug}" must be one of ${VALID_CATEGORIES.join(', ')}`);
  }
}

const seenIndex = new Map();
for (const c of concepts) {
  const { data, file, slug } = c;
  if (!data.category) fail(`${file}: missing required "category"`);
  else if (!VALID_CATEGORIES.includes(data.category)) {
    fail(`${file}: category "${data.category}" must be one of ${VALID_CATEGORIES.join(', ')}`);
  } else if (!categorySlugs.has(data.category)) {
    fail(`${file}: category "${data.category}" has no entry in src/content/categories`);
  }
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    fail(`${file}: status "${data.status}" must be one of ${VALID_STATUSES.join(', ')}`);
  }
  for (const ref of data.references ?? []) {
    if (!conceptSlugs.has(ref)) {
      fail(`${file}: references unknown concept slug "${ref}"`);
    }
  }
  if (data.category && data.category_index) {
    const key = `${data.category}:${data.category_index}`;
    const prior = seenIndex.get(key);
    if (prior) {
      fail(`Duplicate category_index ${data.category_index} in "${data.category}": "${prior}" and "${slug}"`);
    }
    seenIndex.set(key, slug);
  }
}

for (const f of framework) {
  for (const cat of f.data.categories ?? []) {
    if (!categorySlugs.has(cat)) {
      fail(`${f.file}: framework references unregistered category "${cat}"`);
    }
  }
}

if (errors.length) {
  console.error('[validate-framework] FAIL');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

console.log(
  `[validate-framework] OK — ${concepts.length} concept(s), ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}, ${framework.length} framework root entr${framework.length === 1 ? 'y' : 'ies'}.`,
);
