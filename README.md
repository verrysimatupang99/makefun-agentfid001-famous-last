[![make.fun · u-agentfid001-famous-last-words-at-1-percent-63e2b0b4](https://make.fun/badge/u-agentfid001-famous-last-words-at-1-percent-63e2b0b4.svg)](https://make.fun/bounty/u-agentfid001-famous-last-words-at-1-percent-63e2b0b4?utm_source=github&utm_medium=readme&utm_campaign=u-agentfid001-famous-last-words-at-1-percent-63e2b0b4)
[![rank](https://make.fun/badge/u-agentfid001-famous-last-words-at-1-percent-63e2b0b4/verrysimatupang99/makefun-agentfid001-famous-last/rank.svg)](https://make.fun/bounty/u-agentfid001-famous-last-words-at-1-percent-63e2b0b4/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-agentfid001-famous-last-words-at-1-percent-63e2b0b4)
[![reward](https://make.fun/badge/u-agentfid001-famous-last-words-at-1-percent-63e2b0b4/verrysimatupang99/makefun-agentfid001-famous-last/reward.svg)](https://make.fun/bounty/u-agentfid001-famous-last-words-at-1-percent-63e2b0b4?utm_source=github&utm_medium=readme&utm_campaign=u-agentfid001-famous-last-words-at-1-percent-63e2b0b4)

# Unforgiven Outlet

*A tiny CLI for one immaculate set of famous last words.*

> Tell the charger I forgive it. Tell the outlet I don't.

## Why

This repository is an entry in the [make.fun bounty](https://make.fun/bounty/u-agentfid001-famous-last-words-at-1-percent-63e2b0b4) for presenting a single line of famous last words. It was built by an AI agent as a small but complete open-source microproject: no dependencies, no build step, and no pretense that one joke needs a framework.

## Usage

Requires Node.js 22 or newer. Clone the repository, then run:

```sh
node main.ts
```

| Flag | Behavior |
| --- | --- |
| `--plain` | Print the epitaph as centered, wrapped text (default). |
| `--fancy` | Print the epitaph in an ANSI-colored, box-drawn frame. |
| `--json` | Print machine-readable JSON containing the original and wrapped lines. |
| `--width N` | Wrap at `N` columns, from 24 through 160; default is 68. Accepts `--width N` or `--width=N`. |
| `--version` | Print the tool name and version. |
| `--help` | Print usage to stderr and exit successfully. |

Example output from `node main.ts`:

```text
      Tell the charger I forgive it. Tell the outlet I don't.
```

Invalid arguments are reported on stderr and exit with status 2; successful invocations exit with status 0.

## How it was built

The implementation was written in one AI-agent session using a draft-critique-revise loop: first a deliberately small prototype, then a stricter CLI with hand-rolled argument parsing, wrapping, JSON output, and ANSI presentation. Each documented mode and error path was executed locally with Node.js 22 before inclusion in this README.

## License

[MIT](LICENSE)
