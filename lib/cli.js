#!/usr/bin/env node

// Copyright (c) 2018, Shellyl_N and Authors
// license: ISC
// https://github.com/shellyln


const fs = require('fs');
const path = require('path');
const liyad = require('liyad');
const io = require('./io');
const help = require('./help').help;



// dummy handler
require.extensions['.lisp'] = function(mod, filename) {
    const content = fs.readFileSync(filename, 'utf8');
    try {
        mod.exports = content;
    } catch (e) {
        e.message = filename + ': ' + e.message;
        throw e;
    }
};


function cli() {
    const cwd = fs.realpathSync(process.cwd());
    let profileName = 'lisp';
    let lsxBootPath = void 0;
    let evalCode = void 0;
    let optsPos = 2;
    let interactive = false;
    let safe= false;

    function getLsxBoot(lsxBootFileName) {
        const id = require.resolve(lsxBootFileName, {paths: [
            cwd
        ]});
        return require(id);
    }

    function getInterpreter(profile, lsxBootFileName) {
        switch (profile) {
        case 'S':
            return liyad.S;
        case 'L': case 'lisp':
            return liyad.lisp;
        case 'LM':
            return liyad.LM;
        case 'L_async': case 'lisp_async':
            return liyad.lisp_async;
        case 'LM_async':
            return liyad.LM_async;
        case 'LSX':
            {
                const lsxBoot = getLsxBoot(lsxBootFileName);
                return liyad.LSX({
                    jsx: lsxBoot.dom,
                    jsxFlagment: lsxBoot.flagment,
                    components: lsxBoot.components,
                });
            }
        case 'LSX_async':
            {
                const lsxBoot = getLsxBoot(lsxBootFileName);
                return liyad.LSX_async({
                    jsx: lsxBoot.dom,
                    jsxFlagment: lsxBoot.flagment,
                    components: lsxBoot.components,
                });
            }
        default:
            throw new Error(`Unknown profile name is specified: ${profile} .`);
        }
    }

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
        case '--cli-version':
            console.log(require('../package.json').version);
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
        case '--lsx-boot':
            optsPos++;
            lsxBootPath = process.argv[optsPos];
            break;
        case '--safe':
            safe = true;
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
    try {
        lisp = getInterpreter(profileName, lsxBootPath);
    } catch (e) {
        console.error(e.message);
        process.exit(-1);
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

    const idMap = new Map();
    function getRequire(baseDir) {
        return ((name, profile) => {
            const lisp = getInterpreter(profile || profileName, lsxBootPath);
            let id = void 0;
            if (name.startsWith('./') || name.startsWith('../')) {
                id = path.join(fs.realpathSync(baseDir), name);
            } else {
                id = require.resolve(name, {paths: [
                    baseDir
                ]});
            }
            if (! id.endsWith('.lisp')) {
                let p = path.join(id, '__init__.lisp');
                if (! fs.existsSync(p)) {
                    p = id + '.lisp';
                }
                id = p;
            }
            if (idMap.has(id)) {
                return idMap.get(id);
            } else {
                const c = io.readFromFileSync(id);
                lisp.setGlobals(getGlobals(path.dirname(id), path.basename(id)));
                const r = lisp(c);
                idMap.set(id, r);
                return r;
            }
        });
    }

    function getGlobals(baseDir, moduleName) {
        return Object.assign({}, {
            '$argv': appOpts,
            '$__dirname': baseDir,
            '$__filename': path.join(baseDir, moduleName),
        }, safe ? {} : {
            '$require': getRequire(baseDir),
            '$node-require': (name) => {
                let id = name;
                if (name.startsWith('./') || name.startsWith('../')) {
                    id = path.join(fs.realpathSync(baseDir), name);
                }
                return require(id);
            },
            '$render': (c, cb) => {
                try {
                    const lsxBoot = getLsxBoot(lsxBootPath);
                    const p = lsxBoot.render(c);
                    if (p instanceof Promise) {
                        p.then(html => {
                            cb(null, html);
                        }, e => {
                            cb(e, null);
                        });
                    } else {
                        cb(null, lsxBoot.render(c));
                    }
                } catch (err) {
                    cb(err, null);
                }
            },
        });
    }

    if (interactive || (!evalCode && fileNames.filter(x => x !== '-').length === 0 && process.stdin.isTTY)) {
        const repl = require('./repl');
        (async () => {
            try {
                const codes = await getCodes();
                lisp.setGlobals(getGlobals(cwd, '__entrypoint__'));
                await repl.startRepl(liyad.S, lisp, codes);
            } catch (e) {
                console.error(e);
                process.exit(-1);
            }
        })();
    } else {
        (async () => {
            try {
                const fns = fileNames.filter(x => x !== '-');
                const codes = await getCodes();
                lisp.setGlobals(fns.length > 0 ?
                    getGlobals(path.dirname(fns[fns.length - 1]), path.basename(fns[fns.length - 1])) :
                    getGlobals(cwd, '__entrypoint__'));
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
