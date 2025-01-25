import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { parse, split, unparse } from 'diff-slice'
import { describe, it } from 'node:test'

describe('diff operations', () => {
  it('should correctly parse and unparse a diff file', () => {
    const content = readFileSync('./test/zoo.diff', 'utf8')
    const changes = parse(content)
    const unparsedContent = unparse(changes)
    assert.deepEqual(
      unparsedContent,
      content,
      'The unparsed content should match the original content'
    )
  })
  it('should split diff content into parts correctly', () => {
    const content = readFileSync('./test/zoo.diff', 'utf8')
    const changes = parse(content)

    // find a change related to dog.txt file
    const findDog = (change) =>
      change.header.some((line) => line.includes('dog.txt'))

    // a dog.txt has two hunks
    const dogCompleteChange = changes.find(findDog)
    assert.equal(dogCompleteChange.hunks.length, 2)

    // filter out only hunks that contain the word 'friendly'
    const { match } = split(changes, {
      matchHunk: (hunk) => {
        return hunk.lines.some((line) => line.includes('friendly'))
      },
    })

    // only one hunk in dog.txt file matches
    const dogMatchChange = match.find(findDog)
    assert.equal(dogMatchChange.hunks.length, 1)
  })
})
