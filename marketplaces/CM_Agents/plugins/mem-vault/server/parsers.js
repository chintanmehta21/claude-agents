// parsers.js — web-tree-sitter (WASM) based structural parsing. No native compilation.
'use strict';

const fs = require('fs');
const path = require('path');
const paths = require('./paths');

// Extension → language name (must match WASM file basename).
const EXT_LANG = {
  '.py': 'python',
  '.js': 'javascript', '.jsx': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.go': 'go',
  '.rs': 'rust',
  '.rb': 'ruby',
  '.java': 'java',
  '.c': 'c', '.h': 'c',
  '.cpp': 'cpp', '.cc': 'cpp', '.cxx': 'cpp', '.hpp': 'cpp', '.hh': 'cpp',
  '.cs': 'c_sharp',
  '.php': 'php',
  '.json': 'json',
  '.yaml': 'yaml', '.yml': 'yaml',
  '.toml': 'toml',
  '.html': 'html',
  '.css': 'css',
  '.bash': 'bash', '.sh': 'bash',
  '.md': 'markdown',
};

// Node kinds that map to our symbol "kind" string, per language.
const SYMBOL_KINDS = {
  python: {
    function_definition: 'function',
    class_definition: 'class',
    decorated_definition: 'function',
  },
  javascript: {
    function_declaration: 'function',
    function: 'function',
    arrow_function: 'function',
    class_declaration: 'class',
    method_definition: 'method',
    variable_declarator: 'variable',
  },
  typescript: {
    function_declaration: 'function',
    function: 'function',
    arrow_function: 'function',
    class_declaration: 'class',
    interface_declaration: 'interface',
    type_alias_declaration: 'type',
    enum_declaration: 'enum',
    method_definition: 'method',
    method_signature: 'method',
    abstract_method_signature: 'method',
    variable_declarator: 'variable',
  },
  tsx: {
    function_declaration: 'function',
    arrow_function: 'function',
    class_declaration: 'class',
    interface_declaration: 'interface',
    type_alias_declaration: 'type',
    method_definition: 'method',
  },
  go: {
    function_declaration: 'function',
    method_declaration: 'method',
    type_declaration: 'type',
  },
  rust: {
    function_item: 'function',
    struct_item: 'struct',
    enum_item: 'enum',
    trait_item: 'trait',
    impl_item: 'impl',
    mod_item: 'module',
  },
  java: {
    method_declaration: 'method',
    class_declaration: 'class',
    interface_declaration: 'interface',
    enum_declaration: 'enum',
  },
  c: { function_definition: 'function', struct_specifier: 'struct', enum_specifier: 'enum' },
  cpp: {
    function_definition: 'function',
    class_specifier: 'class',
    struct_specifier: 'struct',
    namespace_definition: 'namespace',
  },
  c_sharp: {
    method_declaration: 'method',
    class_declaration: 'class',
    interface_declaration: 'interface',
    struct_declaration: 'struct',
    enum_declaration: 'enum',
  },
  ruby: { method: 'method', class: 'class', module: 'module' },
  php: { function_definition: 'function', method_declaration: 'method', class_declaration: 'class' },
};

let _Parser = null;        // web-tree-sitter module (lazy)
let _initialized = false;
const _langCache = new Map();

/** Lazy-load web-tree-sitter. */
async function loadParser() {
  if (_Parser && _initialized) return _Parser;
  let mod;
  try {
    mod = require('web-tree-sitter');
  } catch (e) {
    throw new Error(
      'mem-vault: web-tree-sitter not installed.\n' +
        'Run `npm install --prefix "' + paths.pluginRoot() + '"` then retry.'
    );
  }
  // web-tree-sitter exports default Parser in newer versions.
  _Parser = mod.Parser || mod.default || mod;
  if (typeof _Parser.init === 'function') {
    await _Parser.init({
      locateFile() {
        // Resolve tree-sitter.wasm runtime from installed node_modules.
        try {
          return require.resolve('web-tree-sitter/tree-sitter.wasm');
        } catch {
          return path.join(paths.pluginRoot(), 'node_modules', 'web-tree-sitter', 'tree-sitter.wasm');
        }
      },
    });
  }
  _initialized = true;
  return _Parser;
}

/** Detect language from file path. */
function detectLanguage(file) {
  const ext = path.extname(file).toLowerCase();
  return EXT_LANG[ext] || null;
}

/** Load a language's WASM grammar and cache it. */
async function loadLanguage(lang) {
  if (_langCache.has(lang)) return _langCache.get(lang);
  const Parser = await loadParser();
  const Lang = Parser.Language || (_Parser && _Parser.Language);
  if (!Lang) throw new Error('mem-vault: web-tree-sitter Language API missing.');

  const wasmPath = findGrammarWasm(lang);
  if (!wasmPath) {
    throw new Error(`mem-vault: WASM grammar for '${lang}' not found. Run \`node scripts/bootstrap-grammars.js\`.`);
  }
  const language = await Lang.load(wasmPath);
  _langCache.set(lang, language);
  return language;
}

/** Find grammar wasm, searching bundled dir first, then tree-sitter-wasms package. */
function findGrammarWasm(lang) {
  const bundled = path.join(paths.grammarsDir(), `tree-sitter-${lang}.wasm`);
  if (fs.existsSync(bundled)) return bundled;
  // Fallback: tree-sitter-wasms package (installed via npm)
  const candidates = [
    path.join(paths.pluginRoot(), 'node_modules', 'tree-sitter-wasms', 'out', `tree-sitter-${lang}.wasm`),
  ];
  for (const p of candidates) if (fs.existsSync(p)) return p;
  return null;
}

/**
 * Build a symbol outline from a source file.
 * Returns an array of { name, kind, start_line, end_line, signature, parent }.
 */
async function outlineFile(filePath) {
  const lang = detectLanguage(filePath);
  if (!lang) return { lang: null, symbols: [], error: 'unsupported-extension' };
  const source = fs.readFileSync(filePath, 'utf8');
  return outlineSource(source, lang);
}

async function outlineSource(source, lang) {
  if (!SYMBOL_KINDS[lang]) {
    return { lang, symbols: [], error: 'no-symbol-map' };
  }
  const Parser = await loadParser();
  const language = await loadLanguage(lang);
  const parser = new Parser();
  parser.setLanguage(language);

  const tree = parser.parse(source);
  const root = tree.rootNode;
  const kindMap = SYMBOL_KINDS[lang];
  const symbols = [];

  function walk(node, parentName) {
    const mapped = kindMap[node.type];
    let nextParent = parentName;
    if (mapped) {
      const name = extractName(node) || '<anonymous>';
      const sig = signatureFor(node, source, lang);
      symbols.push({
        name,
        kind: mapped,
        start_line: node.startPosition.row + 1,
        end_line: node.endPosition.row + 1,
        signature: sig,
        parent: parentName || null,
      });
      if (mapped === 'class' || mapped === 'impl' || mapped === 'module' ||
          mapped === 'namespace' || mapped === 'interface') {
        nextParent = name;
      }
    }
    for (let i = 0; i < node.childCount; i++) walk(node.child(i), nextParent);
  }

  walk(root, null);
  tree.delete && tree.delete();
  parser.delete && parser.delete();
  return { lang, symbols };
}

/** Pull a reasonable "name" out of a definition node. */
function extractName(node) {
  // Try common name children.
  for (const fieldName of ['name', 'id']) {
    const child = node.childForFieldName ? node.childForFieldName(fieldName) : null;
    if (child) return child.text;
  }
  // Scan direct children for an identifier-ish node.
  for (let i = 0; i < node.childCount; i++) {
    const c = node.child(i);
    if (c.type === 'identifier' || c.type === 'type_identifier' ||
        c.type === 'property_identifier' || c.type === 'field_identifier' ||
        c.type === 'constant') {
      return c.text;
    }
  }
  return null;
}

/** One-line signature: first line of the node's source text, trimmed. */
function signatureFor(node, source, lang) {
  const text = source.slice(node.startIndex, node.endIndex).split('\n')[0];
  return text.trim().slice(0, 200);
}

/**
 * Slice a file by line range for smart_unfold.
 */
function unfoldLines(filePath, startLine, endLine) {
  const source = fs.readFileSync(filePath, 'utf8');
  const lines = source.split(/\r?\n/);
  const s = Math.max(1, startLine) - 1;
  const e = Math.min(lines.length, endLine);
  return lines.slice(s, e).join('\n');
}

module.exports = {
  detectLanguage,
  outlineFile,
  outlineSource,
  unfoldLines,
  findGrammarWasm,
  EXT_LANG,
  SYMBOL_KINDS,
};
