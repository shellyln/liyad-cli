# Liyad CLI
### CLI and REPL for [Liyad](https://github.com/shellyln/liyad) (Lisp yet another DSL interpreter).


----

## Requirements

* Node >= 10

## Install

```bash
$ npm install -g liyad-cli
$ liyad
```

## CLI Usage

```
Usage: liyad [options] [ -- ] [ -e script | script.lisp | - ] [ -- ] [arguments]
       liyad [options]

Options:
  -                     script read from stdin (default; interactive mode if a tty)
  --                    indicate the end of CLI options / script files
  -e, --eval=...        evaluate script
  -i, --interactive     always enter the REPL even if stdin does not appear to be a terminal
  -h, --help            print command line options
  -v, --version         print version informations
```

## Packaging to the single executable file.
Use [pkg](https://www.npmjs.com/package/pkg).

```bash
$ npm install -g pkg
$ pkg . --output liyad
$ ./liyad
```

----

## License
[ISC](https://github.com/shellyln/liyad-cli/blob/master/LICENSE.md)  
Copyright (c) 2018, Shellyl_N and Authors.
