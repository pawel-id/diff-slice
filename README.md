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
lines and better hunks separation use: `git diff --unified=0 > file.patch` (this
implies --patch in terms of git diff). Later apply with corresponding option:
`git apply --unidiff-zero file.patch`
