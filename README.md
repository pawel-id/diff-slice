# Diff split

This utility splits a diff file into chunks based on specific criteria. It is
useful for breaking down large commits into smaller, more manageable pieces.

a diff format:

- wikipedia https://en.wikipedia.org/wiki/Diff#Unified_format
- diff format https://git-scm.com/docs/diff-format

notable npm packages:

- https://www.npmjs.com/package/diff
- https://www.npmjs.com/package/unidiff

In order to prepare diff to be split generate it without unnecessary context
lines: `git diff --unified=0` (this implies --patch in terms of git diff)
