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
                          LSX                 lisp interpreter (return single value, enable LSX)
                          LSX_async           lisp interpreter (return single value, enable LSX, enable async)
  --lsx-boot lsxboot.js LSX bootstrap JavaScript file; required if profile LSX or LSX_async is selected.
  --safe                run as safe mode (disable '$require' and '$node-require')
  -e, --eval=...        evaluate script
  -i, --interactive     always enter the REPL even if stdin does not appear to be a terminal
  -h, --help            print command line options
  -v, --version         print version informations
  --cli-version         print cli version informations
```

## LSX bootstrap file example

lsxboot.js
```javascript
const React = require('react');
const ReactDOMServer = require('react-dom/server');


class Hello extends React.Component {
    render() {
        return (React.createElement("div", {}, "hello"));
    }
}


exports.dom = React.createElement;
exports.flagment = React.Fragment;
exports.render = ReactDOMServer.renderToStaticMarkup;
exports.components = {
    Hello,
};
```


## Packaging to the single executable file.
Use [pkg](https://www.npmjs.com/package/pkg).

```bash
$ npm install -g pkg
$ git clone https://github.com/shellyln/liyad-cli.git
$ cd liyad-cli
$ npm ci
$ pkg . --output liyad
$ ./liyad --version
```

## Packaging and publish your codes as the NPM module.
See [liyad-lisp-pkg-example](https://github.com/shellyln/liyad-lisp-pkg-example) and [liyad-webapp-example](https://github.com/shellyln/liyad-webapp-example)

### Usage of package:

```bash
$ npm install -g liyad-cli

$ mkdir myapp
$ cd myapp
$ npm install liyad-lisp-pkg-example

$ vi app.lisp
```

app.lisp
```lisp
($let ex ($require "liyad-lisp-pkg-example"))

;; Benchmarks
($console-log (::ex:tarai 12 6 0))
($console-log (::ex:fib 10))
($console-log (::ex:fac 10))

;; Run the web server on port 3000.
($let url ($node-require "url"))

(::ex:#get "/" (-> (req res)
    ($let u (::url:parse ::req:url))
    (::res@writeHead 200 (# (Content-Type "text/html")))
    (::res@end ($concat "hit / ," ::req:method "," ::u:path)) ) )

(::ex:serve 3000) ($last "start server")
```

```bash
$ liyad app.lisp

12
55
3628800
start server
```


## Additional operators and constants

### $exit
* `($exit [ code ])`
    * Exit the process.
    * returns: never.
    * `code`: exit code.

### $require
* `($require id [ profile ])`
    * Load lisp code from other file.
    * returns: Exported functions and variables.
    * `id`: Load from relative path if `id` starts with `./` or `../`. Otherwise load from local or global `node_modules`.
    * `profile`: (optional) interpreter profile (S/L/lisp/LM/L_async/lisp_async/LM_async).
        * default value is selected by CLI option `-p` or `--profile`.

### $node-require
* `($node-require id)`
    * Load JavaScript code from other file.
    * returns: Exported functions and variables.
    * `id`: Load from relative path if `id` starts with `./` or `../`. Otherwise load from local or global `node_modules`.

### $render
* `($render jsxElement callback)`
    * Render jsxElement by `LSX-bootstrap.render()` and pass rendering result string or error to `callback`.
    * returns: `undefined`
    * `jsxElement`: object returned by `LSX-bootstrap.dom()`.
    * `callback(error, html)`: callback function called on end of rendering `jsxElement`.
        * `error`: not null if error is occured.
        * `html`: rendering result html; null if error is occured.


## Additional operator on REPL

### $pause
* `($pause id [ cond ])`
    * Pause execution and start debugger
    * returns: `undefined`
    * `cond`: if it present, pause if condition is `true`.


## API

### parseArgs
* `parseArgs(args)`
    * Parse CLI arguments.
    * returns: config object.
    * `args`: CLI arguments.
* example: `parseArgs(['-p', 'LSX_async', '--lsx-boot', 'lsxboot.js', 'app.lisp'])`

### cliCore
* `cliCore(curDir, params)`
    * Evaluate codes.
    * returns: `undefined`
    * `curDir`: current directory.
    * `params`: config object.
* example: `cliCore(fs.realpathSync(process.cwd()), parseArgs(process.argv.slice(2)))`

### cli
* `cli()`
    * Run CLI.
    * returns: `undefined`


----

## License
[ISC](https://github.com/shellyln/liyad-cli/blob/master/LICENSE.md)  
Copyright (c) 2018, Shellyl_N and Authors.
