#!/usr/bin/env node

const ENTRY_LINE =
  'Delete the search history, keep the photos, tell the group chat I died as I lived: at full brightness with forty tabs open.';

const TOOL_NAME = 'full-brightness';
const VERSION = '1.0.0';
const DEFAULT_WIDTH = 68;
const MIN_WIDTH = 24;
const MAX_WIDTH = 160;
const EXIT_USAGE_ERROR = 2;

const ANSI = Object.freeze({
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  brightWhite: '\x1b[97m',
  brightYellow: '\x1b[93m',
});

/** @typedef {'plain' | 'fancy'} OutputMode */

/**
 * @typedef {object} CliOptions
 * @property {boolean} help
 * @property {boolean} version
 * @property {boolean} json
 * @property {OutputMode} mode
 * @property {boolean} modeWasExplicit
 * @property {number} width
 */

class UsageError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'UsageError';
  }
}

/** @returns {string} */
function usageText() {
  return [
    `${TOOL_NAME} ${VERSION}`,
    '',
    'Usage:',
    '  node main.ts [options]',
    '',
    'Options:',
    '  --plain       Print human-readable text (default)',
    '  --fancy       Print an ANSI-colored, box-drawn epitaph',
    '  --json        Print machine-readable JSON',
    `  --width N     Wrap text at N columns (${MIN_WIDTH}-${MAX_WIDTH}, default ${DEFAULT_WIDTH})`,
    '  --version     Print the version',
    '  --help        Show this help on stderr',
    '',
    'Exit codes:',
    '  0  Success',
    `  ${EXIT_USAGE_ERROR}  Invalid command line`,
  ].join('\n');
}

/**
 * @param {string} value
 * @returns {number}
 */
function parseWidth(value) {
  if (!/^\d+$/.test(value)) {
    throw new UsageError(`invalid width '${value}': expected an integer`);
  }

  const width = Number.parseInt(value, 10);
  if (width < MIN_WIDTH || width > MAX_WIDTH) {
    throw new UsageError(`invalid width '${value}': expected ${MIN_WIDTH}-${MAX_WIDTH} columns`);
  }

  return width;
}

/**
 * @param {string[]} argv
 * @returns {CliOptions}
 */
function parseArgs(argv) {
  /** @type {CliOptions} */
  const options = {
    help: false,
    version: false,
    json: false,
    mode: 'plain',
    modeWasExplicit: false,
    width: DEFAULT_WIDTH,
  };
  let widthWasSet = false;
  let positionalArgumentsOnly = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (positionalArgumentsOnly) {
      throw new UsageError(`unexpected argument '${argument}'`);
    }
    if (argument === '--') {
      positionalArgumentsOnly = true;
      continue;
    }
    if (argument === '--help') {
      options.help = true;
      continue;
    }
    if (argument === '--version') {
      options.version = true;
      continue;
    }
    if (argument === '--json') {
      options.json = true;
      continue;
    }
    if (argument === '--plain' || argument === '--fancy') {
      const nextMode = argument.slice(2);
      if (options.modeWasExplicit && options.mode !== nextMode) {
        throw new UsageError('choose only one output mode: --plain or --fancy');
      }
      options.mode = /** @type {OutputMode} */ (nextMode);
      options.modeWasExplicit = true;
      continue;
    }
    if (argument === '--width' || argument.startsWith('--width=')) {
      if (widthWasSet) {
        throw new UsageError('--width may only be given once');
      }

      let value;
      if (argument === '--width') {
        index += 1;
        value = argv[index];
        if (value === undefined) {
          throw new UsageError('--width requires a value');
        }
      } else {
        value = argument.slice('--width='.length);
      }

      options.width = parseWidth(value);
      widthWasSet = true;
      continue;
    }
    if (argument.startsWith('-')) {
      throw new UsageError(`unknown option '${argument}'`);
    }

    throw new UsageError(`unexpected argument '${argument}'`);
  }

  if (options.json && options.modeWasExplicit) {
    throw new UsageError('--json cannot be combined with --plain or --fancy');
  }

  return options;
}

/**
 * @param {string} text
 * @param {number} width
 * @returns {string[]}
 */
function wrapText(text, width) {
  const words = text.split(/\s+/u);
  /** @type {string[]} */
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length === 0) {
      currentLine = word;
      continue;
    }
    if (currentLine.length + 1 + word.length <= width) {
      currentLine = `${currentLine} ${word}`;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * @param {string} text
 * @param {number} width
 * @returns {string}
 */
function centerText(text, width) {
  const remaining = Math.max(0, width - text.length);
  const left = Math.floor(remaining / 2);
  return `${' '.repeat(left)}${text}${' '.repeat(remaining - left)}`;
}

/**
 * @param {string} text
 * @param {...string} styles
 * @returns {string}
 */
function paint(text, ...styles) {
  return `${styles.join('')}${text}${ANSI.reset}`;
}

/**
 * @param {string[]} lines
 * @param {number} width
 * @returns {string}
 */
function renderPlain(lines, width) {
  return lines.map((line) => centerText(line, width).trimEnd()).join('\n');
}

/**
 * @param {string[]} lines
 * @param {number} width
 * @returns {string}
 */
function renderFancy(lines, width) {
  const horizontal = '─'.repeat(width + 2);
  const border = {
    top: paint(`╭${horizontal}╮`, ANSI.dim),
    divider: paint(`├${horizontal}┤`, ANSI.dim),
    bottom: paint(`╰${horizontal}╯`, ANSI.dim),
    side: paint('│', ANSI.dim),
  };
  const title = centerText('FAMOUS LAST WORDS', width);
  const titleRow = `${border.side} ${paint(title, ANSI.brightYellow, ANSI.bold)} ${border.side}`;
  const bodyRows = lines.map((line) => {
    const paddedLine = line.padEnd(width, ' ');
    return `${border.side} ${paint(paddedLine, ANSI.brightWhite, ANSI.bold)} ${border.side}`;
  });

  return [border.top, titleRow, border.divider, ...bodyRows, border.bottom].join('\n');
}

/**
 * @param {string[]} lines
 * @param {number} width
 * @returns {string}
 */
function renderJson(lines, width) {
  const payload = { tool: TOOL_NAME, version: VERSION, width, line: ENTRY_LINE, lines };
  return `${JSON.stringify(payload, null, 2)}\n`;
}

/**
 * @param {CliOptions} options
 * @returns {string}
 */
function render(options) {
  const lines = wrapText(ENTRY_LINE, options.width);

  if (options.json) {
    return renderJson(lines, options.width);
  }
  if (options.mode === 'fancy') {
    return renderFancy(lines, options.width);
  }

  return renderPlain(lines, options.width);
}

/**
 * @param {string[]} argv
 * @returns {number}
 */
function run(argv) {
  let options;

  try {
    options = parseArgs(argv);
  } catch (error) {
    if (error instanceof UsageError) {
      process.stderr.write(`${TOOL_NAME}: ${error.message}\n`);
      process.stderr.write("Try 'node main.ts --help' for usage.\n");
      return EXIT_USAGE_ERROR;
    }

    throw error;
  }

  if (options.help) {
    process.stderr.write(`${usageText()}\n`);
    return 0;
  }
  if (options.version) {
    process.stdout.write(`${TOOL_NAME} ${VERSION}\n`);
    return 0;
  }

  process.stdout.write(`${render(options)}\n`);
  return 0;
}

process.exitCode = run(process.argv.slice(2));
