// Copyright (c) 2018, Shellyl_N and Authors
// license: ISC
// https://github.com/shellyln


const x = require('./lib/cli');
for (const m in x) {
    if (Object.hasOwnProperty.call(x, m)) {
        exports[m] = x[m];
    }
}
