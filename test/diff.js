import { deepEqual } from 'node:assert'
import { readFileSync } from 'node:fs'
import { parse, unparse } from '../src/diff.js'
import { describe, it } from 'node:test'

describe('diff operations', () => {
  it('should correctly parse and unparse a diff file', () => {
    const content = readFileSync('./test/zoo.diff', 'utf8')
    const changes = parse(content)
    const unparsedContent = unparse(changes)
    deepEqual(
      unparsedContent,
      content,
      'The unparsed content should match the original content'
    )
  })
})
