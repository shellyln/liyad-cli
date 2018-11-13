// Copyright (c) 2018, Shellyl_N and Authors
// license: ISC
// https://github.com/shellyln


const fs    = require('fs');
const util  = require('util');



function readFromStdin() {
    return new Promise((resolve) => {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        let inputData = '';

        process.stdin.on('data', (chunk) => {
            inputData += chunk;
        });

        process.stdin.on('end', () => {
            resolve(inputData);
        });
    });
}
exports.readFromStdin = readFromStdin;


function writeToStdout(data) {
    return new Promise((resolve) => {
        const done = process.stdout.write(data);
        if (done) {
            resolve();
        } else {
            process.stdout.once('drain', () => {
                resolve();
            });
        }
    });
}
exports.writeToStdout = writeToStdout;


function readFromFile(inputPath) {
    return util.promisify(fs.readFile)(inputPath, { encoding: 'utf8' });
}
exports.readFromFile = readFromFile;


function readFromFileSync(inputPath) {
    return fs.readFileSync(inputPath, { encoding: 'utf8' });
}
exports.readFromFileSync = readFromFileSync;
