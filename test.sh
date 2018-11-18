#!/usr/bin/env bash
set -eu
trap 'echo Error at Line $LINENO "$@"' ERR


echo 'test version options'
node index.js --version
node index.js -v

echo 'test help options'
node index.js --help
node index.js -h

echo 'test inline eval options'
[[ $(node index.js --eval='(+ 1 2 3)') = 6 ]] || (echo 'failed' && false)
[[ $(node index.js -e '(+ 1 2 3)') = 6 ]] || (echo 'failed' && false)
[[ $(node index.js -e '($concat "a" "b")') = 'ab' ]] || (echo 'failed' && false)

echo 'test load scripts from file'
[[ $(node index.js tests/case-0001.lisp) = 'Hello, 120!' ]] || (echo 'failed' && false)


echo 'All done!'
