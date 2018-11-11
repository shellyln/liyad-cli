#!/usr/bin/env node

// Copyright (c) 2018, Shellyl_N and Authors
// license: ISC
// https://github.com/shellyln


const liyad = require('liyad');
const io = require('./io');



function help() {
    console.log(
`Usage: liyad [options] [ -- ] [ -e script | script.lisp | - ] [ -- ] [arguments]
       liyad [options]

Options:
  -                     script read from stdin (default; interactive mode if a tty)
  --                    indicate the end of CLI options / script files
  -e, --eval=...        evaluate script
  -i, --interactive     always enter the REPL even if stdin does not appear to be a terminal
  -h, --help            print command line options
  -v, --version         print version informations
`
    )
}
exports.help = help;


function cli() {
    let evalCode = void 0;
    let optsPos = 2;
    let interactive = false;

    ParseOpts: for (; optsPos < process.argv.length; optsPos++) {
        const x = process.argv[optsPos];
        switch (x) {
        case '--help': case '-h': case '-?':
            help();
            process.exit(0);
            break;
        case '--version': case '-v':
            console.log(require('liyad/package.json').version);
            process.exit(0);
            break;
        case '--':
            optsPos++;
            break ParseOpts;
        case '-e':
            optsPos++;
            evalCode = process.argv[optsPos];
            break;
        case '-i': case '--interactive':
            interactive = true;
            break;
        default:
            if (x.startsWith('--eval=')) {
                evalCode = x.split('=', 2)[1];
            } else {
                break ParseOpts;
            }
            break;
        }
    }

    const fileNames = [];
    const filesPromises = [];
    for (; optsPos < process.argv.length; optsPos++) {
        const x = process.argv[optsPos];
        if (x === '-') {
            fileNames.push(x);
        } else if (x === '--') {
            optsPos++;
            break;
        } else if (x.startsWith('-')) {
            break;
        } else {
            fileNames.push(x);
        }
    }

    function prepareFilePromises() {
        for (const x of fileNames) {
            if (x === '-' && !process.stdin.isTTY && !interactive) {
                filesPromises.push(io.readFromStdin());
            } else {
                filesPromises.push(io.readFromFile(x));
            }
        }
        if (filesPromises.length === 0 && !process.stdin.isTTY && !interactive) {
            filesPromises.push(io.readFromStdin());
        }
    }

    const appOpts = process.argv.slice(optsPos);
    liyad.lisp.appendGlobals({
        '$argv': appOpts,
    });

    if (interactive || (!evalCode && fileNames.filter(x => x !== '-').length === 0 && process.stdin.isTTY)) {
        const repl = require('./repl');
        prepareFilePromises();
        (async () => {
            try {
                const codes = await Promise.all(filesPromises);
                if (evalCode) {
                    codes.push(evalCode);
                }
                repl.startRepl(liyad, codes.join('\n'));
            } catch (e) {
                console.error(e);
                process.exit(-1);
            }
        })();
    } else {
        (async () => {
            try {
                prepareFilePromises();
                const codes = await Promise.all(filesPromises);
                if (evalCode) {
                    codes.push(evalCode);
                }
                await io.writeToStdout(JSON.stringify(liyad.lisp(codes.join('\n'))));
            } catch (e) {
                console.error(e);
                process.exit(-1);
            }
        })();
    }
}
exports.cli = cli;
