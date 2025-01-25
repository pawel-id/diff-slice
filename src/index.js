/**
 * Splits the content of a diff file into an array of changes.
 *
 * @param {string} content - The content of the unidiff file as a string.
 * @returns {string[]} - An array of individual changes.
 */
export function parse(content) {
  return splitChanges(content).map((change) => parseChange(change))
}

function splitChanges(content) {
  return content
    .split(/^diff --git/m)
    .slice(1)
    .map((change) => `diff --git${change}`)
}

/**
 *
 * @param {string[]} changeStr
 * @returns
 */
function parseChange(changeStr) {
  const lines = changeStr.split('\n')

  let header = []
  let hunks
  let currentHunk

  for (const line of lines) {
    // header
    if (hunks === undefined) {
      if (!line.startsWith('@@')) {
        header.push(line)
        continue
      } else {
        hunks = []
      }
    }

    // hunks
    if (line.startsWith('@@')) {
      if (currentHunk) {
        hunks.push(currentHunk)
      }
      currentHunk = { range: line, lines: [] }
    } else {
      currentHunk.lines.push(line)
    }
  }

  if (currentHunk) {
    hunks.push(currentHunk)
  }

  return { header, hunks }
}

function unparseChange(change) {
  let result = [change.header]
  if (change.hunks && change.hunks.length > 0) {
    result.push(change.hunks.map((hunk) => [hunk.range, hunk.lines]))
  }
  return result.flat(Infinity).join('\n')
}

export function unparse(changes) {
  return changes.map((change) => unparseChange(change)).join('')
}

/**
 * Splits a list of changes into "match" and "rest" arrays based on specific
 *  conditions.
 *
 * @param {Object[]} changes - An array of changes, where each change
 * includes a header and hunk(s).
 * @param {Object} options - An object containing optional processing functions:
 * @param {function} options.matchChange - A function to process the entire
 *     change, returning a boolean. If true, the change is kept in matching
 *     list.
 * @param {function} options.matchHunk - A function to process individual
 *     hunks, returning a boolean. If true, the hunk is moved to matching
 *     list of changes.
 * @returns {{ match: Object[], rest: Object[] }} - An object containing
 * two arrays:
 * - `match`: matching changes
 * - `rest`: rest of changes
 */
export function split(changes, options = {}) {
  const { matchChange, matchHunk } = options

  const match = [] // matching changes
  const rest = [] // rest of changes

  for (const change of changes) {
    // Check if the entire change match criteria
    if (matchChange && matchChange(change)) {
      match.push(change)
      continue
    }

    // If there's no hunks to process move it to rest entirely
    if (!change.hunks || !matchHunk) {
      rest.push(change)
      continue
    }

    // Process hunks within the current change
    const restHunks = []
    const matchHunks = []

    for (const hunk of change.hunks) {
      if (matchHunk(hunk)) {
        matchHunks.push(hunk)
      } else {
        restHunks.push(hunk)
      }
    }

    // Matching hunks
    if (matchHunks.length > 0) {
      match.push({
        header: change.header, // keep the original header
        hunks: matchHunks,
      })
    }

    // Rest of hunks
    if (restHunks.length > 0) {
      rest.push({
        header: change.header, // keep the original header
        hunks: restHunks,
      })
    }
  }

  return { match, rest }
}
