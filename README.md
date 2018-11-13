# Liyad CLI
### CLI and REPL for [Liyad](https://github.com/shellyln/liyad) (Lisp yet another DSL interpreter).

[![Liyad](https://shellyln.github.io/assets/image/liyad-logo.svg)](https://shellyln.github.io/liyad/)

[![npm](https://img.shields.io/npm/v/liyad-cli.svg)](https://www.npmjs.com/package/liyad-cli)
[![GitHub release](https://img.shields.io/github/release/shellyln/liyad-cli.svg)](https://github.com/shellyln/liyad-cli/releases)
[![Travis](https://img.shields.io/travis/shellyln/liyad-cli/master.svg)](https://travis-ci.org/shellyln/liyad-cli)
[![GitHub forks](https://img.shields.io/github/forks/shellyln/liyad-cli.svg?style=social&label=Fork)](https://github.com/shellyln/liyad-cli/fork)
[![GitHub stars](https://img.shields.io/github/stars/shellyln/liyad-cli.svg?style=social&label=Star)](https://github.com/shellyln/liyad-cli)

----

## Requirements

* Node >= 10

## Install

```bash
$ npm install -g liyad-cli
$ liyad --version
```

## CLI Usage

```
Usage: liyad [options] [ -- ] [ -e script | script.lisp | - ] [ -- ] [arguments]
       liyad [options]

Options:
  -                     script read from stdin (default; interactive mode if a tty)
  --                    indicate the end of CLI options / script files
  -p, --profile=...     select interpreter profile
                          S                   S-expression parser
                          L, lisp (default)   lisp interpreter (return single value)
                          LM                  lisp interpreter (return multiple values)
                          L_async, lisp_async lisp interpreter (return single value, enable async)
                          LM_async            lisp interpreter (return multiple values, enable async)
  --safe                run as safe mode (disable '$require' and '$node-require')
  -e, --eval=...        evaluate script
  -i, --interactive     always enter the REPL even if stdin does not appear to be a terminal
  -h, --help            print command line options
  -v, --version         print version informations
```

## Packaging to the single executable file.
Use [pkg](https://www.npmjs.com/package/pkg).

```bash
$ npm install -g pkg
$ git clone https://github.com/shellyln/liyad-cli.git
$ cd liyad-cli
$ pkg . --output liyad
$ ./liyad --version
```

----

## License
[ISC](https://github.com/shellyln/liyad-cli/blob/master/LICENSE.md)  
Copyright (c) 2018, Shellyl_N and Authors.
