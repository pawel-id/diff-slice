import fs from 'node:fs'
import { parse, split, unparse } from './diff.js'

const content = fs.readFileSync(process.argv[2], 'utf8')
const changes = parse(content)
console.log(JSON.stringify(changes, null, 2))

function processHunk(hunk) {
  return hunk.lines.some((line) => line.includes('PricebookEntry'))
}

const { keep, separate } = split(changes, { processHunk })
fs.writeFileSync('samples/keep.diff', unparse(keep))
fs.writeFileSync('samples/separate.diff', unparse(separate))
