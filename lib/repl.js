// Copyright (c) 2018, Shellyl_N and Authors
// license: ISC
// https://github.com/shellyln


const readline = require('readline');
const dbg = require('./dbg');



function startRepl(liyad, startup) {
    const prompt = '>>> ';
    let pkgName = 'Liyad';
    let pkgVer = '0.0.0';

    const S = liyad.S;

    try {
        const pkgJson = require('liyad/package.json');
        pkgName = pkgJson.name;
        pkgVer = pkgJson.version;
    } catch (e) {
        // eslint-disable-next-line no-empty
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt,
    });

    const replRef = {};
    liyad.lisp.appendGlobals({
        '$pause': dbg.createDebugger(replRef, rl),
    });

    const repl = liyad.lisp.repl();
    replRef.repl = repl;

    if (startup && startup.trim().length > 0) {
        console.dir(repl(startup));
    }

    console.log(`${pkgName} ${pkgVer} CLI (REPL)\nType ^C to exit.\n`);
    rl.prompt();

    let buf = '';

    rl.on('line', (input) => {
        buf += input;

        try {
            S(buf);
        } catch (e0) {
            // TODO: Use 'e0 instanceof ???'
            if (String(e0).includes('Unexpected termination of script')) {
                buf += '\n';
                rl.setPrompt('... ');
                rl.prompt();
                return;
            }
        }

        try {
            const trimmed = buf.trim();
            if (trimmed.length > 0) {
                if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
                    console.dir(repl(buf));
                } else {
                    console.dir(repl(`($last\n\n ${buf} \n\n)`));
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            buf = '';
        }

        rl.setPrompt(prompt);
        rl.prompt();
    })
    .on('close', () => {
        console.log('Bye!');
        process.exit(0);
    });
}
exports.startRepl = startRepl;
