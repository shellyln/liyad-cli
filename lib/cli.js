// Copyright (c) 2018, Shellyl_N and Authors
// license: ISC
// https://github.com/shellyln


const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
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


/**
 * Parse CLI arguments.
 * @param {string[]} args CLI arguments.
 * @returns {object} config object.
 */
function parseArgs(args) {
    let profileName = 'lisp';
    let lsxBootPath = void 0;
    let evalCode = void 0;
    let interactive = false;
    let safe= false;
    const fileNames = [];

    let optsPos = 0;

    ParseOpts: for (; optsPos < args.length; optsPos++) {
        const x = args[optsPos];
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
            profileName = args[optsPos];
            break;
        case '-e':
            optsPos++;
            evalCode = args[optsPos];
            break;
        case '-i': case '--interactive':
            interactive = true;
            break;
        case '--lsx-boot':
            optsPos++;
            lsxBootPath = args[optsPos];
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

    for (; optsPos < args.length; optsPos++) {
        const x = args[optsPos];
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

    for (; optsPos < args.length; optsPos++) {
        const x = args[optsPos];
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

    const appOpts = args.slice(optsPos);

    return ({
        profileName,
        lsxBootPath,
        evalCode,
        interactive,
        safe,
        fileNames,
        appOpts,
    });
}
exports.parseArgs = parseArgs;


/**
 * Require LSX bootstrap from file.
 * @param {string} curDir curent directory.
 * @param {string} lsxBootFileName LSX bootstrap JavaScript file.
 * @returns {object} LSX config object.
 */
function getLsxBoot(curDir, lsxBootFileName) {
    const id = require.resolve(lsxBootFileName, {paths: [
        curDir
    ]});
    return require(id);
}
exports.getLsxBoot = getLsxBoot;


/**
 * Get interpreter function from profile name.
 * @param {string} profile profile name.
 * @param {string} curDir curent directory.
 * @param {string} lsxBootFileName LSX bootstrap JavaScript file.
 * @returns {function} interpreter function.
 */
function getInterpreter(profile, curDir, lsxBootFileName) {
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
            const lsxBoot = getLsxBoot(curDir, lsxBootFileName);
            return liyad.LSX({
                jsx: lsxBoot.dom,
                jsxFlagment: lsxBoot.flagment,
                components: lsxBoot.components,
            });
        }
    case 'LSX_async':
        {
            const lsxBoot = getLsxBoot(curDir, lsxBootFileName);
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
exports.getInterpreter = getInterpreter;


/**
 * Eval codes.
 * @param {object} params config object.
 */
function cliCore(curDir, params) {
    const {
        profileName,
        lsxBootPath,
        evalCode,
        interactive,
        safe,
        fileNames,
        appOpts,
    } = params;

    const idMap = new Map();
    const filesPromises = [];

    let lisp = void 0;
    try {
        lisp = getInterpreter(profileName, curDir, lsxBootPath);
    } catch (e) {
        console.error(e.message);
        process.exit(-1);
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

    function getRequire(baseDir, callerProfile) {
        return ((name, profile) => {
            profile = profile || callerProfile;
            const lisp = getInterpreter(profile, curDir, lsxBootPath);
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
                lisp.setGlobals(getGlobals(path.dirname(id), path.basename(id), profile));
                const r = lisp(c);
                idMap.set(id, r);
                return r;
            }
        });
    }

    function getGlobals(baseDir, moduleName, profile) {
        return Object.assign({}, {
            '$argv': appOpts,
            '$__dirname': baseDir,
            '$__filename': path.join(baseDir, moduleName),
            '$__profile': profile,
        }, safe ? {} : {
            '$exit': (code) => process.exit(code),
            '$shell': (command) => child_process.execSync(command).toString('utf8'),
            '$shell-async': (command) => {
                return new Promise((resolve, reject) => {
                    child_process.exec(command, {encoding: 'utf8'}, (err, stdout) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(stdout);
                        }
                    });
                });
            },
            '$require': getRequire(baseDir, profile),
            '$node-require': (name) => {
                let id = name;
                if (name.startsWith('./') || name.startsWith('../')) {
                    id = path.join(fs.realpathSync(baseDir), name);
                }
                return require(id);
            },
            '$render': (c, cb) => {
                try {
                    const lsxBoot = getLsxBoot(curDir, lsxBootPath);
                    const p = lsxBoot.render(c);
                    if (p && typeof p === 'object' && typeof p.then === 'function') {
                        // accept promise-like (thenable) object
                        p.then(html => {
                            cb(null, html);
                        }, e => {
                            cb(e, null);
                        });
                    } else {
                        cb(null, p);
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
                lisp.setGlobals(getGlobals(curDir, '__entrypoint__', profileName));
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
                    getGlobals(path.dirname(fns[fns.length - 1]), path.basename(fns[fns.length - 1]), profileName) :
                    getGlobals(curDir, '__entrypoint__'), profileName);
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
exports.cliCore = cliCore;


/**
 * Run CLI.
 */
function cli() {
    return cliCore(fs.realpathSync(process.cwd()), parseArgs(process.argv.slice(2)));
}
exports.cli = cli;
