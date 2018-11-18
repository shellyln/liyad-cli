#!/usr/bin/env node

// Copyright (c) 2018, Shellyl_N and Authors
// license: ISC
// https://github.com/shellyln



function help() {
    console.log(
`Usage: liyad [options] [ -- ] [ -e script | script.lisp | - ] [ -- ] [arguments]
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
                          LSX                 lisp interpreter (return single value, enable LSX)
                          LSX_async           lisp interpreter (return single value, enable LSX, enable async)
  --lsx-boot lsxboot.js LSX bootstrap JavaScript file; required if profile LSX or LSX_async is selected.
  --safe                run as safe mode (disable '$require' and '$node-require')
  -e, --eval=...        evaluate script
  -i, --interactive     always enter the REPL even if stdin does not appear to be a terminal
  -h, --help            print command line options
  -v, --version         print version informations
  --cli-version         print cli version informations
`
    )
}
exports.help = help;
