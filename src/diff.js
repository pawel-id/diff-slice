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
 * Splits a list of changes into "to keep" and "to separate" arrays
 * based on specific conditions.
 *
 * @param {Object[]} changes - An array of changes, where each change
 * includes a header and hunk(s).
 * @param {Object} options - An object containing optional processing functions:
 * @param {function} options.processChange - A function to process the entire
 *     change, returning a boolean. If true, the change is moved into the
 *     separate list.
 * @param {function} options.processHunk - A function to process individual
 *     hunks, returning a boolean. If true, the hunk is moved to the separate
 *     list of changes.
 * @returns {{ keep: Object[], separate: Object[] }} - An object containing
 * two arrays:
 * - `keep`: Changes to keep
 * - `separate`: Changes to split out
 */
export function split(changes, options = {}) {
  const { processChange, processHunk } = options

  const keep = [] // Changes to keep
  const separate = [] // Changes to separate

  for (const change of changes) {
    // Check if the entire change should be split
    if (processChange && processChange(change)) {
      separate.push(change)
      continue
    }

    // If there's no hunks to process keep it entirely
    if (!change.hunks || !processHunk) {
      keep.push(change)
      continue
    }

    // Process hunks within the current change
    const keepHunks = []
    const separateHunks = []

    for (const hunk of change.hunks) {
      if (processHunk(hunk)) {
        // Move the hunk to the separate list
        separateHunks.push(hunk)
      } else {
        // Keep the hunk in the same change
        keepHunks.push(hunk)
      }
    }

    // Keep the modified change if it has any hunks left to keep
    if (keepHunks.length > 0) {
      keep.push({
        header: change.header, // Keep the original header
        hunks: keepHunks,
      })
    }

    // Separate hunks while keeping the original change structure if necessary
    if (separateHunks.length > 0) {
      separate.push({
        header: change.header, // Keep the original header for the separated hunks
        hunks: separateHunks, // Group all separate hunks in a single change
      })
    }
  }

  return { keep, separate }
}
