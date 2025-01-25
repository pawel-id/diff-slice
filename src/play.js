import fs from 'node:fs'
import { parse, split, unparse } from 'diff-slice'

const content = fs.readFileSync(process.argv[2], 'utf8')
const changes = parse(content)
console.log(JSON.stringify(changes, null, 2))

const pricebookEntries = {
  matchHunk: function (hunk) {
    return hunk.lines.some((line) => line.includes('PricebookEntry'))
  },
}

const { match, rest } = split(changes, pricebookEntries)
fs.writeFileSync('samples/match.diff', unparse(match))
fs.writeFileSync('samples/rest.diff', unparse(rest))
