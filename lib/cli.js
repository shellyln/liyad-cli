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
  -p, --profile=...     select interpreter profile
                          S                   S-expression parser
                          L, lisp (default)   lisp interpreter (return single value)
                          LM                  lisp interpreter (return multiple values)
                          L_async, lisp_async lisp interpreter (return single value, enable async)
                          LM_async            lisp interpreter (return multiple values, enable async)
  -e, --eval=...        evaluate script
  -i, --interactive     always enter the REPL even if stdin does not appear to be a terminal
  -h, --help            print command line options
  -v, --version         print version informations
`
    )
}
exports.help = help;


function cli() {
    let profileName = 'lisp';
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
        case '-p':
            optsPos++;
            profileName = process.argv[optsPos];
            break;
        case '-e':
            optsPos++;
            evalCode = process.argv[optsPos];
            break;
        case '-i': case '--interactive':
            interactive = true;
            break;
        default:
            if (x.startsWith('--profile=')) {
                profileName = x.split('=', 2)[1];
            } else if (x.startsWith('--eval=')) {
                evalCode = x.split('=', 2)[1];
            } else {
                break ParseOpts;
            }
            break;
        }
    }

    let lisp = void 0;
    switch (profileName) {
    case 'S':
        lisp = liyad.S;
        break;
    case 'L': case 'lisp':
        lisp = liyad.lisp;
        break;
    case 'LM':
        lisp = liyad.LM;
        break;
    case 'L_async': case 'lisp_async':
        lisp = liyad.lisp_async;
        break;
    case 'LM_async':
        lisp = liyad.LM_async;
        break;
    default:
        console.error(`Unknown profile name is specified: ${profileName} .`);
        process.exit(-1);
        break;
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
    
    async function getCodes() {
        try {
            prepareFilePromises();
            const codes = await Promise.all(filesPromises);
            if (evalCode) {
                codes.push(evalCode);
            }
            return codes.join('\n');
        } catch (e) {
            console.error(e);
            process.exit(-1);
        }
    }

    const appOpts = process.argv.slice(optsPos);
    liyad.lisp.appendGlobals({
        '$argv': appOpts,
    });

    if (interactive || (!evalCode && fileNames.filter(x => x !== '-').length === 0 && process.stdin.isTTY)) {
        const repl = require('./repl');
        (async () => {
            try {
                const codes = await getCodes();
                await repl.startRepl(liyad.S, lisp, codes);
            } catch (e) {
                console.error(e);
                process.exit(-1);
            }
        })();
    } else {
        (async () => {
            try {
                const codes = await getCodes();
                let r = await lisp(codes);
                switch (typeof r) {
                case 'string':
                    break;
                case 'number': case 'boolean': case 'undefined':
                    r = String(r);
                    break;
                case 'object':
                    if (r === null) {
                        r = String(r);
                    } else if (r instanceof Date) {
                        r = String(r);
                    } else {
                        r = JSON.stringify(r);
                    }
                    break;
                default:
                    r = JSON.stringify(r);
                    break;
                }
                await io.writeToStdout(r);
            } catch (e) {
                console.error(e);
                process.exit(-1);
            }
        })();
    }
}
exports.cli = cli;
