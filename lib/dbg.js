// Copyright (c) 2018, Shellyl_N and Authors
// license: ISC
// https://github.com/shellyln


const fs = require('fs');


function createDebugger(replRef, rl /* readline */) {
    return ((...args) => {
        const repl = replRef.repl;

        if (args.length > 0 && !args[0]) {
            return;
        }

        let fdStdin;
        let fdStdinOpened = false;
        try {
            // process.stdin is pipe on *nix environment.
            // Error is occured if fs.readSync(0, ...) is called.
            //    "Error: ESPIPE: invalid seek, read"
            fdStdin = fs.openSync('/dev/stdin', 'rs');
            fdStdinOpened = true;
        } catch (e) {
            // eslint-disable-next-line no-empty
        }

        try {
            const sab = new SharedArrayBuffer(8);
            const s32ar = new Int32Array(sab);
            const buf = Buffer.alloc(1024);
            rl.pause();

            fs.writeSync(1, 'type "exit" to quit debugger.\n');
            for (let lineNum = 0; ; lineNum++) {
                const ldbPrompt = `ldb(${lineNum}) > `;
                process.stdout.cursorTo(0, process.stdout.rows - 1);
                fs.writeSync(1, ldbPrompt);

                let str = '';
                let lineBuf = [];
                let recMaxRows = 0;
                for (;;) {
                    Atomics.wait(s32ar, 0, 0, 100);
                    const numRead = fs.readSync(fdStdin || 0, buf, 0, 100); // <- Don't set position on *nix environment.
                    let s0 = buf.toString('utf8', 0, numRead);

                    for (const c of s0) {
                        if (c ==='\u0003') {
                            process.exit(0);
                        } else if (c === '\u0008' || c ==='\u007f') {
                            if (lineBuf.length > 0) {
                                lineBuf.length--;
                            }
                        } else {
                            lineBuf.push(c);
                        }
                    }

                    const rows = Math.ceil((ldbPrompt.length + str.length) / process.stdout.columns);
                    recMaxRows = Math.max(recMaxRows, rows);
                    process.stdout.cursorTo(0, Math.max(process.stdout.rows - recMaxRows, 0));
                    process.stdout.clearScreenDown();

                    str = lineBuf.join('');
                    fs.writeSync(1, ldbPrompt + str);

                    if (str.includes('\r') || str.includes('\n')) {
                        break;
                    }
                }
                const trimmed = str.trim();
                if (trimmed === 'exit') {
                    break;
                }
                if (trimmed.length > 0) {
                    try {
                        let v;
                        if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
                            v = repl(str);
                        } else {
                            v = repl(`($last\n\n ${str} \n\n)`);
                        }
                        fs.writeSync(1, `\nType: ${typeof v}, Value: ${JSON.stringify(v)}\n`);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }

        if (fdStdinOpened) {
            try {
                fs.closeSync(fdStdin);
            } catch (e) {
                console.error(e);
            }
        }

        console.log();
        rl.resume();
    });
}
exports.createDebugger = createDebugger;
