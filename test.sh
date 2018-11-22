#!/usr/bin/env bash
set -eu
trap 'echo Error at Line $LINENO "$@"' ERR


echo 'test version options'
node cli-main.js --version
node cli-main.js -v

echo 'test help options'
node cli-main.js --help
node cli-main.js -h

echo 'test inline eval options'
[[ $(node cli-main.js --eval='(+ 1 2 3)') = 6 ]] || (echo 'failed' && false)
[[ $(node cli-main.js -e '(+ 1 2 3)') = 6 ]] || (echo 'failed' && false)
[[ $(node cli-main.js -e '($concat "a" "b")') = 'ab' ]] || (echo 'failed' && false)

echo 'test load scripts from file'
[[ $(node cli-main.js tests/case-0001.lisp) = 'Hello, 120!' ]] || (echo 'failed' && false)


echo 'All done!'
