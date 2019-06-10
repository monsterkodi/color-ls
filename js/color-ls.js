// koffee 0.56.0

/*
 0000000   0000000   000       0000000   00000000           000       0000000
000       000   000  000      000   000  000   000          000      000
000       000   000  000      000   000  0000000    000000  000      0000000
000       000   000  000      000   000  000   000          000           000
 0000000   0000000   0000000   0000000   000   000          0000000  0000000
 */
var BG, BW, ansi, args, base1, bold, colors, dirString, dotString, extString, fg, fs, fw, getPrefix, groupMap, groupName, groupname, ignore, initArgs, karg, linkString, listDir, listFiles, log_error, lpad, main, moduleMain, nameString, ownerName, ownerString, pathDepth, ref, reset, rightsString, rpad, rwxString, sizeString, slash, sort, startTime, stats, time, timeString, token, userMap, username, util,
    indexOf = [].indexOf;

startTime = typeof (base1 = process.hrtime).bigint === "function" ? base1.bigint() : void 0;

ref = require('kstr'), lpad = ref.lpad, rpad = ref.rpad, time = ref.time;

fs = require('fs');

slash = require('kslash');

ansi = require('ansi-256-colors');

util = require('util');

args = null;

token = {};

bold = '\x1b[1m';

reset = ansi.reset;

fg = ansi.fg.getRgb;

BG = ansi.bg.getRgb;

fw = function(i) {
    return ansi.fg.grayscale[i];
};

BW = function(i) {
    return ansi.bg.grayscale[i];
};

stats = {
    num_dirs: 0,
    num_files: 0,
    hidden_dirs: 0,
    hidden_files: 0,
    maxOwnerLength: 0,
    maxGroupLength: 0,
    brokenLinks: []
};

if (!module.parent || module.parent.id === '.') {
    karg = require('karg');
    args = karg("color-ls\n    paths         . ? the file(s) and/or folder(s) to display . **\n    all           . ? show dot files                  . = false\n    dirs          . ? show only dirs                  . = false\n    files         . ? show only files                 . = false\n    bytes         . ? include size                    . = false\n    mdate         . ? include modification date       . = false\n    long          . ? include size and date           . = false\n    owner         . ? include owner and group         . = false\n    rights        . ? include rights                  . = false\n    size          . ? sort by size                    . = false\n    time          . ? sort by time                    . = false\n    kind          . ? sort by kind                    . = false\n    nerdy         . ? use nerd font icons             . = false\n    pretty        . ? pretty size and age             . = true\n    ignore        . ? don't recurse into              . = node_modules\n    info          . ? show statistics                 . = false . - I\n    alphabetical  . ? don't group dirs before files   . = false . - A\n    offset        . ? indent short listings           . = false . - O\n    recurse       . ? recurse into subdirs            . = false . - R\n    tree          . ? recurse and indent              . = false . - T\n    depth         . ? recursion depth                 . = ∞     . - D\n    find          . ? filter with a regexp                      . - F\n    debug                                             . = false . - X\n\nversion      " + (require(__dirname + "/../package.json").version));
}

initArgs = function() {
    var noon, ref1, ref2;
    if (args.size) {
        args.files = true;
    }
    if (args.long) {
        args.bytes = true;
        args.mdate = true;
    }
    if (args.tree) {
        args.recurse = true;
        args.offset = false;
    }
    if (args.dirs && args.files) {
        args.dirs = args.files = false;
    }
    if ((ref1 = args.ignore) != null ? ref1.length : void 0) {
        args.ignore = args.ignore.split(' ');
    } else {
        args.ignore = [];
    }
    if (args.depth === '∞') {
        args.depth = 2e308;
    } else {
        args.depth = Math.max(0, parseInt(args.depth));
    }
    if (Number.isNaN(args.depth)) {
        args.depth = 0;
    }
    if (args.debug) {
        noon = require('noon');
        console.log(noon.stringify(args, {
            colors: true
        }));
    }
    if (!(((ref2 = args.paths) != null ? ref2.length : void 0) > 0)) {
        return args.paths = ['.'];
    }
};

colors = {
    'coffee': [bold + fg(4, 4, 0), fg(1, 1, 0), fg(2, 2, 0)],
    'koffee': [bold + fg(5, 5, 0), fg(1, 0, 0), fg(3, 1, 0)],
    'py': [bold + fg(0, 3, 0), fg(0, 1, 0), fg(0, 2, 0)],
    'rb': [bold + fg(4, 0, 0), fg(1, 0, 0), fg(2, 0, 0)],
    'json': [bold + fg(4, 0, 4), fg(1, 0, 1), fg(2, 0, 1)],
    'cson': [bold + fg(4, 0, 4), fg(1, 0, 1), fg(2, 0, 2)],
    'noon': [bold + fg(4, 4, 0), fg(1, 1, 0), fg(2, 2, 0)],
    'plist': [bold + fg(4, 0, 4), fg(1, 0, 1), fg(2, 0, 2)],
    'js': [bold + fg(5, 0, 5), fg(2, 0, 2), fg(3, 0, 3)],
    'cpp': [bold + fg(5, 4, 0), fw(3), fg(3, 2, 0)],
    'h': [fg(3, 1, 0), fw(3), fg(2, 1, 0)],
    'pyc': [fw(5), fw(3), fw(4)],
    'log': [fw(5), fw(2), fw(3)],
    'log': [fw(5), fw(2), fw(3)],
    'txt': [fw(20), fw(3), fw(4)],
    'md': [bold + fw(20), fw(3), fw(4)],
    'markdown': [bold + fw(20), fw(3), fw(4)],
    'sh': [bold + fg(5, 1, 0), fg(2, 0, 0), fg(3, 0, 0)],
    'png': [bold + fg(5, 0, 0), fg(2, 0, 0), fg(3, 0, 0)],
    'jpg': [bold + fg(0, 3, 0), fg(0, 2, 0), fg(0, 2, 0)],
    'pxm': [bold + fg(1, 1, 5), fg(0, 0, 2), fg(0, 0, 4)],
    'tiff': [bold + fg(1, 1, 5), fg(0, 0, 3), fg(0, 0, 4)],
    '_default': [fw(15), fw(4), fw(10)],
    '_dir': [bold + BG(0, 0, 2) + fw(23), fg(1, 1, 5), bold + BG(0, 0, 2) + fg(2, 2, 5)],
    '_.dir': [bold + BG(0, 0, 1) + fw(23), bold + BG(0, 0, 1) + fg(1, 1, 5), bold + BG(0, 0, 1) + fg(2, 2, 5)],
    '_link': {
        'arrow': fg(1, 0, 1),
        'path': fg(4, 0, 4),
        'broken': BG(5, 0, 0) + fg(5, 5, 0)
    },
    '_arrow': BW(2) + fw(0),
    '_header': [bold + BW(2) + fg(3, 2, 0), fw(4), bold + BW(2) + fg(5, 5, 0)],
    '_size': {
        b: [fg(0, 0, 3), fg(0, 0, 2)],
        kB: [fg(0, 0, 5), fg(0, 0, 3)],
        MB: [fg(1, 1, 5), fg(0, 0, 4)],
        GB: [fg(4, 4, 5), fg(2, 2, 5)],
        TB: [fg(4, 4, 5), fg(2, 2, 5)]
    },
    '_users': {
        root: fg(3, 0, 0),
        "default": fg(1, 0, 1)
    },
    '_groups': {
        wheel: fg(1, 0, 0),
        staff: fg(0, 1, 0),
        admin: fg(1, 1, 0),
        "default": fg(1, 0, 1)
    },
    '_error': [bold + BG(5, 0, 0) + fg(5, 5, 0), bold + BG(5, 0, 0) + fg(5, 5, 5)],
    '_rights': {
        'r+': bold + BW(1) + fw(6),
        'r-': reset + BW(1) + fw(2),
        'w+': bold + BW(1) + fg(2, 2, 5),
        'w-': reset + BW(1) + fw(2),
        'x+': bold + BW(1) + fg(5, 0, 0),
        'x-': reset + BW(1) + fw(2)
    }
};

userMap = {};

username = function(uid) {
    var childp, e;
    if (!userMap[uid]) {
        try {
            childp = require('child_process');
            userMap[uid] = childp.spawnSync("id", ["-un", "" + uid]).stdout.toString('utf8').trim();
        } catch (error1) {
            e = error1;
            console.log(e);
        }
    }
    return userMap[uid];
};

groupMap = null;

groupname = function(gid) {
    var childp, e, gids, gnms, i, j, ref1;
    if (!groupMap) {
        try {
            childp = require('child_process');
            gids = childp.spawnSync("id", ["-G"]).stdout.toString('utf8').split(' ');
            gnms = childp.spawnSync("id", ["-Gn"]).stdout.toString('utf8').split(' ');
            groupMap = {};
            for (i = j = 0, ref1 = gids.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
                groupMap[gids[i]] = gnms[i];
            }
        } catch (error1) {
            e = error1;
            console.log(e);
        }
    }
    return groupMap[gid];
};

if ('function' === typeof process.getuid) {
    colors['_users'][username(process.getuid())] = fg(0, 4, 0);
}

log_error = function() {
    return console.log(" " + colors['_error'][0] + " " + bold + arguments[0] + (arguments.length > 1 && (colors['_error'][1] + [].slice.call(arguments).slice(1).join(' ')) || '') + " " + reset);
};

linkString = function(file) {
    var err, s;
    s = reset + fw(1) + colors['_link']['arrow'] + " ► ";
    s += colors['_link'][(indexOf.call(stats.brokenLinks, file) >= 0) && 'broken' || 'path'];
    try {
        s += slash.path(fs.readlinkSync(file));
    } catch (error1) {
        err = error1;
        s += ' ? ';
    }
    return s;
};

nameString = function(name, ext) {
    var icon, icons, ref1;
    if (args.nerdy) {
        icons = require('./icons');
        icon = (colors[(colors[ext] != null) && ext || '_default'][2] + ((ref1 = icons.get(name, ext)) != null ? ref1 : ' ')) + ' ';
    } else {
        icon = '';
    }
    return " " + icon + colors[(colors[ext] != null) && ext || '_default'][0] + name + reset;
};

dotString = function(ext) {
    return colors[(colors[ext] != null) && ext || '_default'][1] + "." + reset;
};

extString = function(name, ext) {
    var icons;
    if (args.nerdy && name) {
        icons = require('./icons');
        if (icons.get(name, ext)) {
            return '';
        }
    }
    return dotString(ext) + colors[(colors[ext] != null) && ext || '_default'][1] + ext + reset;
};

dirString = function(name, ext) {
    var c, icon;
    c = name && '_dir' || '_.dir';
    icon = args.nerdy && colors[c][2] + ' \uf413' || '';
    return icon + colors[c][0] + (name && (" " + name) || " ") + (ext ? colors[c][1] + '.' + colors[c][2] + ext : "") + " ";
};

sizeString = function(stat) {
    var bar, mb;
    if (args.nerdy && args.pretty) {
        bar = function(n) {
            var b;
            b = '▏▎▍▌▋▊▉';
            return b[Math.floor(n / (1000 / 7))];
        };
        if (stat.size === 0) {
            return rpad('', 8);
        }
        if (stat.size <= 1000) {
            return colors['_size']['b'][1] + rpad(bar(stat.size), 8);
        }
        if (stat.size <= 10000) {
            return colors['_size']['b'][1] + '█' + rpad(bar(stat.size / 10), 7);
        }
        if (stat.size <= 100000) {
            return colors['_size']['b'][1] + '██' + rpad(bar(stat.size / 100), 6);
        }
        if (stat.size <= 1000000) {
            return colors['_size']['b'][1] + '███' + colors['_size']['kB'][1] + rpad(bar(stat.size / 1000), 5);
        }
        mb = parseInt(stat.size / 1000000);
        if (stat.size <= 10000000) {
            return colors['_size']['b'][1] + '███' + BG(0, 0, 3) + fg(0, 0, 2) + mb + reset + colors['_size']['kB'][1] + rpad(bar(stat.size / 10000), 4);
        }
        if (stat.size <= 100000000) {
            return colors['_size']['b'][1] + '███' + BG(0, 0, 3) + fg(0, 0, 2) + mb + reset + colors['_size']['kB'][1] + rpad(bar(stat.size / 100000), 3);
        }
        if (stat.size <= 1000000000) {
            return colors['_size']['b'][1] + '███' + BG(0, 0, 3) + fg(0, 0, 2) + mb + reset + colors['_size']['MB'][1] + rpad(bar(stat.size / 1000000), 2);
        }
        if (stat.size <= 10000000000) {
            return colors['_size']['b'][1] + '███' + colors['_size']['kB'][1] + '███' + colors['_size']['MB'][1] + '█' + rpad(bar(stat.size / 10000000), 1);
        }
        if (stat.size <= 100000000000) {
            return colors['_size']['b'][1] + '███' + colors['_size']['kB'][1] + '███' + colors['_size']['MB'][1] + '██' + bar(stat.size / 100000000);
        }
    }
    if (args.pretty && stat.size === 0) {
        return lpad(' ', 11);
    }
    if (stat.size < 1000) {
        return colors['_size']['b'][0] + lpad(stat.size, 10) + " ";
    } else if (stat.size < 1000000) {
        if (args.pretty) {
            return colors['_size']['kB'][0] + lpad((stat.size / 1000).toFixed(0), 7) + " " + colors['_size']['kB'][1] + "kB ";
        } else {
            return colors['_size']['kB'][0] + lpad(stat.size, 10) + " ";
        }
    } else if (stat.size < 1000000000) {
        if (args.pretty) {
            return colors['_size']['MB'][0] + lpad((stat.size / 1000000).toFixed(1), 7) + " " + colors['_size']['MB'][1] + "MB ";
        } else {
            return colors['_size']['MB'][0] + lpad(stat.size, 10) + " ";
        }
    } else if (stat.size < 1000000000000) {
        if (args.pretty) {
            return colors['_size']['GB'][0] + lpad((stat.size / 1000000000).toFixed(1), 7) + " " + colors['_size']['GB'][1] + "GB ";
        } else {
            return colors['_size']['GB'][0] + lpad(stat.size, 10) + " ";
        }
    } else {
        if (args.pretty) {
            return colors['_size']['TB'][0] + lpad((stat.size / 1000000000000).toFixed(3), 7) + " " + colors['_size']['TB'][1] + "TB ";
        } else {
            return colors['_size']['TB'][0] + lpad(stat.size, 10) + " ";
        }
    }
};

timeString = function(stat) {
    var age, col, dy, hr, mn, moment, mt, num, range, ref1, sec, t, wk, yr;
    if (args.nerdy && args.pretty) {
        sec = parseInt((Date.now() - stat.mtimeMs) / 1000);
        mn = parseInt(sec / 60);
        hr = parseInt(sec / 3600);
        if (hr < 12) {
            if (sec < 60) {
                return BG(0, 0, 1) + '   ' + fg(5, 5, 5) + '○◔◑◕'[parseInt(sec / 15)] + reset + fg(0, 0, 1) + '▉';
            } else if (mn < 60) {
                return BG(0, 0, 1) + '  ' + fg(4, 4, 5) + '○◔◑◕'[parseInt(mn / 15)] + fg(0, 0, 3) + '◌' + reset + fg(0, 0, 1) + '▉';
            } else {
                return BG(0, 0, 1) + ' ' + fg(3, 3, 5) + '○◔◑◕'[parseInt(hr / 3)] + fg(0, 0, 3) + '◌◌' + reset + fg(0, 0, 1) + '▉';
            }
        } else {
            dy = parseInt(Math.round(sec / (24 * 3600)));
            wk = parseInt(Math.round(sec / (7 * 24 * 3600)));
            mt = parseInt(Math.round(sec / (30 * 24 * 3600)));
            yr = parseInt(Math.round(sec / (365 * 24 * 3600)));
            if (dy < 10) {
                return BG(0, 0, 1) + fg(0, 0, 5) + (" " + dy + " \uf185") + reset + fg(0, 0, 1) + '▉';
            } else if (wk < 8) {
                return BG(0, 0, 1) + fg(0, 0, 4) + (" " + wk + " \uf186") + reset + fg(0, 0, 1) + '▉';
            } else if (mt < 10) {
                return BG(0, 0, 1) + fg(0, 0, 3) + (" " + mt + " \uf455") + reset + fg(0, 0, 1) + '▉';
            } else {
                return BG(0, 0, 1) + fg(0, 0, 3) + (" " + yr + " \uf6e6") + reset + fg(0, 0, 1) + '▉';
            }
        }
    }
    moment = require('moment');
    t = moment(stat.mtime);
    if (args.pretty) {
        age = moment().to(t, true);
        ref1 = age.split(' '), num = ref1[0], range = ref1[1];
        if (num[0] === 'a') {
            num = '1';
        }
        if (range === 'few') {
            num = moment().diff(t, 'seconds');
            range = 'seconds';
            return fw(23) + lpad(num, 2) + ' ' + fw(16) + rpad(range, 7) + ' ';
        } else if (range.startsWith('year')) {
            return fw(6) + lpad(num, 2) + ' ' + fw(3) + rpad(range, 7) + ' ';
        } else if (range.startsWith('month')) {
            return fw(8) + lpad(num, 2) + ' ' + fw(4) + rpad(range, 7) + ' ';
        } else if (range.startsWith('day')) {
            return fw(10) + lpad(num, 2) + ' ' + fw(6) + rpad(range, 7) + ' ';
        } else if (range.startsWith('hour')) {
            return fw(15) + lpad(num, 2) + ' ' + fw(8) + rpad(range, 7) + ' ';
        } else {
            return fw(18) + lpad(num, 2) + ' ' + fw(12) + rpad(range, 7) + ' ';
        }
    } else {
        return fw(16) + lpad(t.format("DD"), 2) + fw(7) + '.' + fw(12) + t.format("MM") + fw(7) + "." + fw(8) + t.format("YY") + ' ' + fw(16) + t.format("HH") + (col = fw(7) + ':' + fw(14) + t.format("mm") + (col = fw(1) + ':' + fw(4) + t.format("ss") + ' '));
    }
};

ownerName = function(stat) {
    try {
        return username(stat.uid);
    } catch (error1) {
        return stat.uid;
    }
};

groupName = function(stat) {
    try {
        return groupname(stat.gid);
    } catch (error1) {
        return stat.gid;
    }
};

ownerString = function(stat) {
    var gcl, grp, ocl, own;
    own = ownerName(stat);
    grp = groupName(stat);
    ocl = colors['_users'][own];
    if (!ocl) {
        ocl = colors['_users']['default'];
    }
    gcl = colors['_groups'][grp];
    if (!gcl) {
        gcl = colors['_groups']['default'];
    }
    return ocl + rpad(own, stats.maxOwnerLength) + " " + gcl + rpad(grp, stats.maxGroupLength);
};

rwxString = function(stat, i) {
    var mode, r, w, x;
    mode = stat.mode;
    if (args.nerdy) {
        r = ' \uf441';
        w = '\uf040';
        x = stat.isDirectory() && '\uf085' || '\uf013';
        return (((mode >> (i * 3)) & 0x4) && colors['_rights']['r+'] + r || colors['_rights']['r-'] + r) + (((mode >> (i * 3)) & 0x2) && colors['_rights']['w+'] + w || colors['_rights']['w-'] + w) + (((mode >> (i * 3)) & 0x1) && colors['_rights']['x+'] + x || colors['_rights']['x-'] + x);
    } else {
        return (((mode >> (i * 3)) & 0x4) && colors['_rights']['r+'] + ' r' || colors['_rights']['r-'] + '  ') + (((mode >> (i * 3)) & 0x2) && colors['_rights']['w+'] + ' w' || colors['_rights']['w-'] + '  ') + (((mode >> (i * 3)) & 0x1) && colors['_rights']['x+'] + ' x' || colors['_rights']['x-'] + '  ');
    }
};

rightsString = function(stat) {
    var gr, ro, ur;
    ur = rwxString(stat, 2);
    gr = rwxString(stat, 1);
    ro = rwxString(stat, 0) + " ";
    return ur + gr + ro + reset;
};

getPrefix = function(stat, depth) {
    var s;
    s = '';
    if (args.rights) {
        s += rightsString(stat);
        s += " ";
    }
    if (args.owner) {
        s += ownerString(stat);
        s += " ";
    }
    if (args.mdate) {
        s += timeString(stat);
    }
    if (args.bytes) {
        s += sizeString(stat);
    }
    if (depth && args.tree) {
        s += rpad('', depth * 4);
    }
    if (s.length === 0 && args.offset) {
        s += '       ';
    }
    return s;
};

sort = function(list, stats, exts) {
    var _, j, k, l, moment, ref1, ref2, results, results1;
    if (exts == null) {
        exts = [];
    }
    _ = require('lodash');
    moment = require('moment');
    l = _.zip(list, stats, (function() {
        results = [];
        for (var j = 0, ref1 = list.length; 0 <= ref1 ? j < ref1 : j > ref1; 0 <= ref1 ? j++ : j--){ results.push(j); }
        return results;
    }).apply(this), exts.length > 0 && exts || (function() {
        results1 = [];
        for (var k = 0, ref2 = list.length; 0 <= ref2 ? k < ref2 : k > ref2; 0 <= ref2 ? k++ : k--){ results1.push(k); }
        return results1;
    }).apply(this));
    if (args.kind) {
        if (exts === []) {
            return list;
        }
        l.sort(function(a, b) {
            var m;
            if (a[3] > b[3]) {
                return 1;
            }
            if (a[3] < b[3]) {
                return -1;
            }
            if (args.time) {
                m = moment(a[1].mtime);
                if (m.isAfter(b[1].mtime)) {
                    return 1;
                }
                if (m.isBefore(b[1].mtime)) {
                    return -1;
                }
            }
            if (args.size) {
                if (a[1].size > b[1].size) {
                    return 1;
                }
                if (a[1].size < b[1].size) {
                    return -1;
                }
            }
            if (a[2] > b[2]) {
                return 1;
            }
            return -1;
        });
    } else if (args.time) {
        l.sort(function(a, b) {
            var m;
            m = moment(a[1].mtime);
            if (m.isAfter(b[1].mtime)) {
                return 1;
            }
            if (m.isBefore(b[1].mtime)) {
                return -1;
            }
            if (args.size) {
                if (a[1].size > b[1].size) {
                    return 1;
                }
                if (a[1].size < b[1].size) {
                    return -1;
                }
            }
            if (a[2] > b[2]) {
                return 1;
            }
            return -1;
        });
    } else if (args.size) {
        l.sort(function(a, b) {
            if (a[1].size > b[1].size) {
                return 1;
            }
            if (a[1].size < b[1].size) {
                return -1;
            }
            if (a[2] > b[2]) {
                return 1;
            }
            return -1;
        });
    }
    return _.unzip(l)[0];
};

ignore = function(p) {
    var base;
    base = slash.basename(p);
    if (base[0] === '$') {
        return true;
    }
    if (base === 'desktop.ini') {
        return true;
    }
    if (base.toLowerCase().startsWith('ntuser')) {
        return true;
    }
    return false;
};

listFiles = function(p, files, depth) {
    var alph, d, dirs, dsts, exts, f, fils, fsts, j, k, len, len1, len2, o, results, results1;
    if (args.alphabetical) {
        alph = [];
    }
    dirs = [];
    fils = [];
    dsts = [];
    fsts = [];
    exts = [];
    if (args.owner) {
        files.forEach(function(rp) {
            var file, gl, ol, stat;
            if (slash.isAbsolute(rp)) {
                file = slash.resolve(rp);
            } else {
                file = slash.join(p, rp);
            }
            try {
                stat = fs.lstatSync(file);
                ol = ownerName(stat).length;
                gl = groupName(stat).length;
                if (ol > stats.maxOwnerLength) {
                    stats.maxOwnerLength = ol;
                }
                if (gl > stats.maxGroupLength) {
                    return stats.maxGroupLength = gl;
                }
            } catch (error1) {

            }
        });
    }
    files.forEach(function(rp) {
        var err, ext, file, link, lstat, name, s, stat;
        if (slash.isAbsolute(rp)) {
            file = slash.resolve(rp);
        } else {
            file = slash.resolve(slash.join(p, rp));
        }
        if (ignore(rp)) {
            return;
        }
        try {
            lstat = fs.lstatSync(file);
            link = lstat.isSymbolicLink();
            stat = link && fs.statSync(file) || lstat;
        } catch (error1) {
            err = error1;
            if (link) {
                stat = lstat;
                stats.brokenLinks.push(file);
            } else {
                return;
            }
        }
        ext = slash.ext(file);
        name = slash.base(file);
        if (name[0] === '.') {
            ext = name.substr(1) + slash.extname(file);
            name = '';
        }
        if (name.length && name[name.length - 1] !== '\r' || args.all) {
            s = getPrefix(stat, depth);
            if (stat.isDirectory()) {
                if (!args.files) {
                    if (!args.tree) {
                        if (name.startsWith('./')) {
                            name = name.slice(2);
                        }
                        s += dirString(name, ext);
                        if (link) {
                            s += linkString(file);
                        }
                        dirs.push(s + reset);
                        if (args.alphabetical) {
                            alph.push(s + reset);
                        }
                    }
                    dsts.push(stat);
                    return stats.num_dirs += 1;
                } else {
                    return stats.hidden_dirs += 1;
                }
            } else {
                if (!args.dirs) {
                    s += nameString(name, ext);
                    if (ext) {
                        s += extString(name, ext);
                    }
                    if (link) {
                        s += linkString(file);
                    }
                    fils.push(s + reset);
                    if (args.alphabetical) {
                        alph.push(s + reset);
                    }
                    fsts.push(stat);
                    exts.push(ext);
                    return stats.num_files += 1;
                } else {
                    return stats.hidden_files += 1;
                }
            }
        } else {
            if (stat.isFile()) {
                return stats.hidden_files += 1;
            } else if (stat.isDirectory()) {
                return stats.hidden_dirs += 1;
            }
        }
    });
    if (args.size || args.kind || args.time) {
        if (dirs.length && !args.files) {
            dirs = sort(dirs, dsts);
        }
        if (fils.length) {
            fils = sort(fils, fsts, exts);
        }
    }
    if (args.alphabetical) {
        results = [];
        for (j = 0, len = alph.length; j < len; j++) {
            p = alph[j];
            results.push(console.log(p));
        }
        return results;
    } else {
        for (k = 0, len1 = dirs.length; k < len1; k++) {
            d = dirs[k];
            console.log(d);
        }
        results1 = [];
        for (o = 0, len2 = fils.length; o < len2; o++) {
            f = fils[o];
            results1.push(console.log(f));
        }
        return results1;
    }
};

listDir = function(p, opt) {
    var depth, doRecurse, err, files, j, len, msg, pn, pr, ps, ref1, results, s, sp;
    if (opt == null) {
        opt = {};
    }
    if (args.recurse) {
        depth = pathDepth(p, opt);
        if (depth > args.depth) {
            return;
        }
    }
    ps = p;
    try {
        files = fs.readdirSync(p);
    } catch (error1) {
        err = error1;
        true;
    }
    if (args.find) {
        files = files.filter(function(f) {
            if (RegExp(args.find).test(f)) {
                return f;
            }
        });
    }
    if (args.find && !(files != null ? files.length : void 0)) {
        true;
    } else if (args.paths.length === 1 && args.paths[0] === '.' && !args.recurse) {
        console.log(reset);
    } else if (args.tree) {
        console.log(getPrefix(slash.isDir(p), depth - 1) + dirString(slash.base(ps), slash.ext(ps)) + reset);
    } else {
        s = colors['_arrow'] + " ▶ " + colors['_header'][0];
        if (ps[0] !== '~') {
            ps = slash.resolve(ps);
        }
        ps = slash.relative(ps, process.cwd());
        if (ps === '/') {
            s += '/';
        } else {
            sp = ps.split('/');
            s += colors['_header'][0] + sp.shift();
            while (sp.length) {
                pn = sp.shift();
                if (pn) {
                    s += colors['_header'][1] + '/';
                    s += colors['_header'][sp.length === 0 && 2 || 0] + pn;
                }
            }
        }
        console.log(reset);
        console.log(s + " " + reset);
        console.log(reset);
    }
    if (files != null ? files.length : void 0) {
        listFiles(p, files, depth);
    }
    if (args.recurse) {
        doRecurse = function(f) {
            var ref1;
            if (ref1 = slash.basename(f), indexOf.call(args.ignore, ref1) >= 0) {
                return false;
            }
            if (slash.ext(f) === 'app') {
                return false;
            }
            if (!args.all && f[0] === '.') {
                return false;
            }
            return slash.isDir(slash.join(p, f));
        };
        try {
            ref1 = fs.readdirSync(p).filter(doRecurse);
            results = [];
            for (j = 0, len = ref1.length; j < len; j++) {
                pr = ref1[j];
                results.push(listDir(slash.resolve(slash.join(p, pr)), opt));
            }
            return results;
        } catch (error1) {
            err = error1;
            msg = err.message;
            if (msg.startsWith("EACCES")) {
                msg = "permission denied";
            }
            if (msg.startsWith("EPERM")) {
                msg = "permission denied";
            }
            return log_error(msg);
        }
    }
};

pathDepth = function(p, opt) {
    var ref1, rel;
    rel = slash.relative(p, (ref1 = opt != null ? opt.relativeTo : void 0) != null ? ref1 : process.cwd());
    if (p === '.') {
        return 0;
    }
    return rel.split('/').length;
};

main = function() {
    var base2, filestats, j, len, p, pathstats, ref1;
    pathstats = args.paths.map(function(f) {
        var error;
        try {
            return [f, fs.statSync(f)];
        } catch (error1) {
            error = error1;
            log_error('no such file: ', f);
            return [];
        }
    });
    filestats = pathstats.filter(function(f) {
        return f.length && !f[1].isDirectory();
    });
    if (filestats.length > 0) {
        console.log(reset);
        listFiles(process.cwd(), filestats.map(function(s) {
            return s[0];
        }));
    }
    ref1 = pathstats.filter(function(f) {
        return f.length && f[1].isDirectory();
    });
    for (j = 0, len = ref1.length; j < len; j++) {
        p = ref1[j];
        if (args.tree) {
            console.log('');
        }
        listDir(p[0], {
            relativeTo: args.tree && slash.dirname(p[0]) || process.cwd()
        });
    }
    console.log("");
    if (args.info) {
        return console.log(BW(1) + " " + fw(8) + stats.num_dirs + (stats.hidden_dirs && fw(4) + "+" + fw(5) + stats.hidden_dirs || "") + fw(4) + " dirs " + fw(8) + stats.num_files + (stats.hidden_files && fw(4) + "+" + fw(5) + stats.hidden_files || "") + fw(4) + " files " + fw(8) + time((typeof (base2 = process.hrtime).bigint === "function" ? base2.bigint() : void 0) - startTime) + " " + reset);
    }
};

if (args) {
    initArgs();
    main();
} else {
    moduleMain = function(arg, opt) {
        var oldlog, out;
        if (opt == null) {
            opt = {};
        }
        switch (typeof arg) {
            case 'string':
                args = Object.assign({}, opt);
                if (args.paths != null) {
                    args.paths;
                } else {
                    args.paths = [];
                }
                args.paths.push(arg);
                break;
            case 'object':
                args = Object.assign({}, arg);
                break;
            default:
                args = {
                    paths: ['.']
                };
        }
        initArgs();
        out = '';
        oldlog = console.log;
        console.log = function() {
            var j, len;
            for (j = 0, len = arguments.length; j < len; j++) {
                arg = arguments[j];
                out += String(arg);
            }
            return out += '\n';
        };
        main();
        console.log = oldlog;
        return out;
    };
    module.exports = moduleMain;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGlaQUFBO0lBQUE7O0FBUUEsU0FBQSxnRUFBMEIsQ0FBQzs7QUFFM0IsTUFBdUIsT0FBQSxDQUFRLE1BQVIsQ0FBdkIsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjOztBQUNkLEVBQUEsR0FBUyxPQUFBLENBQVEsSUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBRVQsSUFBQSxHQUFROztBQUNSLEtBQUEsR0FBUTs7QUFFUixJQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTLElBQUksQ0FBQzs7QUFDZCxFQUFBLEdBQVMsSUFBSSxDQUFDLEVBQUUsQ0FBQzs7QUFDakIsRUFBQSxHQUFTLElBQUksQ0FBQyxFQUFFLENBQUM7O0FBQ2pCLEVBQUEsR0FBUyxTQUFDLENBQUQ7V0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVUsQ0FBQSxDQUFBO0FBQXpCOztBQUNULEVBQUEsR0FBUyxTQUFDLENBQUQ7V0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVUsQ0FBQSxDQUFBO0FBQXpCOztBQUVULEtBQUEsR0FDSTtJQUFBLFFBQUEsRUFBZ0IsQ0FBaEI7SUFDQSxTQUFBLEVBQWdCLENBRGhCO0lBRUEsV0FBQSxFQUFnQixDQUZoQjtJQUdBLFlBQUEsRUFBZ0IsQ0FIaEI7SUFJQSxjQUFBLEVBQWdCLENBSmhCO0lBS0EsY0FBQSxFQUFnQixDQUxoQjtJQU1BLFdBQUEsRUFBZ0IsRUFOaEI7OztBQWNKLElBQUcsQ0FBSSxNQUFNLENBQUMsTUFBWCxJQUFxQixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQWQsS0FBb0IsR0FBNUM7SUFFSSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7SUFD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QUFPLE1BQU0sQ0FBQyxNQUFQLENBQWMsRUFBZCxFQUFrQixHQUFsQjs7b0JBQ1AsSUFBSSxDQUFDOztvQkFBTCxJQUFJLENBQUMsUUFBUzs7Z0JBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFYLENBQWdCLEdBQWhCO0FBSEM7QUFEVCxpQkFLUyxRQUxUO2dCQU1RLElBQUEsR0FBTyxNQUFNLENBQUMsTUFBUCxDQUFjLEVBQWQsRUFBa0IsR0FBbEI7QUFETjtBQUxUO2dCQVFRLElBQUEsR0FBTztvQkFBQSxLQUFBLEVBQU0sQ0FBQyxHQUFELENBQU47O0FBUmY7UUFTQSxRQUFBLENBQUE7UUFJQSxHQUFBLEdBQU07UUFDTixNQUFBLEdBQVMsT0FBTyxDQUFDO1FBQ2pCLE9BQU8sQ0FBQyxHQUFSLEdBQWMsU0FBQTtBQUNWLGdCQUFBO0FBQUEsaUJBQUEsMkNBQUE7O2dCQUEwQixHQUFBLElBQU8sTUFBQSxDQUFPLEdBQVA7QUFBakM7bUJBQ0EsR0FBQSxJQUFPO1FBRkc7UUFJZCxJQUFBLENBQUE7UUFFQSxPQUFPLENBQUMsR0FBUixHQUFjO2VBQ2Q7SUF4QlM7SUEwQmIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0E5QnJCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAgICAgICAwMDAgICAgICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwICAwMDAgICAgICAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgIDAwMFxuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgICAgICAgMDAwMDAwMCAgMDAwMDAwMFxuIyMjXG5cbnN0YXJ0VGltZSA9IHByb2Nlc3MuaHJ0aW1lLmJpZ2ludD8oKVxuXG57IGxwYWQsIHJwYWQsIHRpbWUgfSA9IHJlcXVpcmUgJ2tzdHInXG5mcyAgICAgPSByZXF1aXJlICdmcydcbnNsYXNoICA9IHJlcXVpcmUgJ2tzbGFzaCdcbmFuc2kgICA9IHJlcXVpcmUgJ2Fuc2ktMjU2LWNvbG9ycydcbnV0aWwgICA9IHJlcXVpcmUgJ3V0aWwnXG5cbmFyZ3MgID0gbnVsbFxudG9rZW4gPSB7fVxuXG5ib2xkICAgPSAnXFx4MWJbMW0nXG5yZXNldCAgPSBhbnNpLnJlc2V0XG5mZyAgICAgPSBhbnNpLmZnLmdldFJnYlxuQkcgICAgID0gYW5zaS5iZy5nZXRSZ2JcbmZ3ICAgICA9IChpKSAtPiBhbnNpLmZnLmdyYXlzY2FsZVtpXVxuQlcgICAgID0gKGkpIC0+IGFuc2kuYmcuZ3JheXNjYWxlW2ldXG5cbnN0YXRzID0gIyBjb3VudGVycyBmb3IgKGhpZGRlbikgZGlycy9maWxlc1xuICAgIG51bV9kaXJzOiAgICAgICAwXG4gICAgbnVtX2ZpbGVzOiAgICAgIDBcbiAgICBoaWRkZW5fZGlyczogICAgMFxuICAgIGhpZGRlbl9maWxlczogICAwXG4gICAgbWF4T3duZXJMZW5ndGg6IDBcbiAgICBtYXhHcm91cExlbmd0aDogMFxuICAgIGJyb2tlbkxpbmtzOiAgICBbXVxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcblxuaWYgbm90IG1vZHVsZS5wYXJlbnQgb3IgbW9kdWxlLnBhcmVudC5pZCA9PSAnLidcblxuICAgIGthcmcgPSByZXF1aXJlICdrYXJnJ1xuICAgIGFyZ3MgPSBrYXJnIFwiXCJcIlxuICAgIGNvbG9yLWxzXG4gICAgICAgIHBhdGhzICAgICAgICAgLiA/IHRoZSBmaWxlKHMpIGFuZC9vciBmb2xkZXIocykgdG8gZGlzcGxheSAuICoqXG4gICAgICAgIGFsbCAgICAgICAgICAgLiA/IHNob3cgZG90IGZpbGVzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGRpcnMgICAgICAgICAgLiA/IHNob3cgb25seSBkaXJzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGZpbGVzICAgICAgICAgLiA/IHNob3cgb25seSBmaWxlcyAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGJ5dGVzICAgICAgICAgLiA/IGluY2x1ZGUgc2l6ZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIG1kYXRlICAgICAgICAgLiA/IGluY2x1ZGUgbW9kaWZpY2F0aW9uIGRhdGUgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGxvbmcgICAgICAgICAgLiA/IGluY2x1ZGUgc2l6ZSBhbmQgZGF0ZSAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIG93bmVyICAgICAgICAgLiA/IGluY2x1ZGUgb3duZXIgYW5kIGdyb3VwICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHJpZ2h0cyAgICAgICAgLiA/IGluY2x1ZGUgcmlnaHRzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHNpemUgICAgICAgICAgLiA/IHNvcnQgYnkgc2l6ZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHRpbWUgICAgICAgICAgLiA/IHNvcnQgYnkgdGltZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGtpbmQgICAgICAgICAgLiA/IHNvcnQgYnkga2luZCAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIG5lcmR5ICAgICAgICAgLiA/IHVzZSBuZXJkIGZvbnQgaWNvbnMgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHByZXR0eSAgICAgICAgLiA/IHByZXR0eSBzaXplIGFuZCBhZ2UgICAgICAgICAgICAgLiA9IHRydWVcbiAgICAgICAgaWdub3JlICAgICAgICAuID8gZG9uJ3QgcmVjdXJzZSBpbnRvICAgICAgICAgICAgICAuID0gbm9kZV9tb2R1bGVzXG4gICAgICAgIGluZm8gICAgICAgICAgLiA/IHNob3cgc3RhdGlzdGljcyAgICAgICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBJXG4gICAgICAgIGFscGhhYmV0aWNhbCAgLiA/IGRvbid0IGdyb3VwIGRpcnMgYmVmb3JlIGZpbGVzICAgLiA9IGZhbHNlIC4gLSBBXG4gICAgICAgIG9mZnNldCAgICAgICAgLiA/IGluZGVudCBzaG9ydCBsaXN0aW5ncyAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBPXG4gICAgICAgIHJlY3Vyc2UgICAgICAgLiA/IHJlY3Vyc2UgaW50byBzdWJkaXJzICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBSXG4gICAgICAgIHRyZWUgICAgICAgICAgLiA/IHJlY3Vyc2UgYW5kIGluZGVudCAgICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBUXG4gICAgICAgIGRlcHRoICAgICAgICAgLiA/IHJlY3Vyc2lvbiBkZXB0aCAgICAgICAgICAgICAgICAgLiA9IOKIniAgICAgLiAtIERcbiAgICAgICAgZmluZCAgICAgICAgICAuID8gZmlsdGVyIHdpdGggYSByZWdleHAgICAgICAgICAgICAgICAgICAgICAgLiAtIEZcbiAgICAgICAgZGVidWcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgLiAtIFhcbiAgICBcbiAgICB2ZXJzaW9uICAgICAgI3tyZXF1aXJlKFwiI3tfX2Rpcm5hbWV9Ly4uL3BhY2thZ2UuanNvblwiKS52ZXJzaW9ufVxuICAgIFwiXCJcIlxuICAgIFxuaW5pdEFyZ3MgPSAtPlxuICAgIFxuICAgIGlmIGFyZ3Muc2l6ZVxuICAgICAgICBhcmdzLmZpbGVzID0gdHJ1ZVxuICAgIFxuICAgIGlmIGFyZ3MubG9uZ1xuICAgICAgICBhcmdzLmJ5dGVzID0gdHJ1ZVxuICAgICAgICBhcmdzLm1kYXRlID0gdHJ1ZVxuICAgICAgICBcbiAgICBpZiBhcmdzLnRyZWVcbiAgICAgICAgYXJncy5yZWN1cnNlID0gdHJ1ZVxuICAgICAgICBhcmdzLm9mZnNldCAgPSBmYWxzZVxuICAgIFxuICAgIGlmIGFyZ3MuZGlycyBhbmQgYXJncy5maWxlc1xuICAgICAgICBhcmdzLmRpcnMgPSBhcmdzLmZpbGVzID0gZmFsc2VcbiAgICAgICAgXG4gICAgaWYgYXJncy5pZ25vcmU/Lmxlbmd0aFxuICAgICAgICBhcmdzLmlnbm9yZSA9IGFyZ3MuaWdub3JlLnNwbGl0ICcgJyBcbiAgICBlbHNlXG4gICAgICAgIGFyZ3MuaWdub3JlID0gW11cbiAgICAgICAgXG4gICAgaWYgYXJncy5kZXB0aCA9PSAn4oieJyB0aGVuIGFyZ3MuZGVwdGggPSBJbmZpbml0eVxuICAgIGVsc2UgYXJncy5kZXB0aCA9IE1hdGgubWF4IDAsIHBhcnNlSW50IGFyZ3MuZGVwdGhcbiAgICBpZiBOdW1iZXIuaXNOYU4gYXJncy5kZXB0aCB0aGVuIGFyZ3MuZGVwdGggPSAwXG4gICAgICAgIFxuICAgIGlmIGFyZ3MuZGVidWdcbiAgICAgICAgbm9vbiA9IHJlcXVpcmUgJ25vb24nXG4gICAgICAgIGxvZyBub29uLnN0cmluZ2lmeSBhcmdzLCBjb2xvcnM6dHJ1ZVxuICAgIFxuICAgIGFyZ3MucGF0aHMgPSBbJy4nXSB1bmxlc3MgYXJncy5wYXRocz8ubGVuZ3RoID4gMFxuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG5jb2xvcnMgPVxuICAgICdjb2ZmZWUnOiAgIFsgYm9sZCtmZyg0LDQsMCksICBmZygxLDEsMCksIGZnKDIsMiwwKSBdXG4gICAgJ2tvZmZlZSc6ICAgWyBib2xkK2ZnKDUsNSwwKSwgIGZnKDEsMCwwKSwgZmcoMywxLDApIF1cbiAgICAncHknOiAgICAgICBbIGJvbGQrZmcoMCwzLDApLCAgZmcoMCwxLDApLCBmZygwLDIsMCkgXVxuICAgICdyYic6ICAgICAgIFsgYm9sZCtmZyg0LDAsMCksICBmZygxLDAsMCksIGZnKDIsMCwwKSBdXG4gICAgJ2pzb24nOiAgICAgWyBib2xkK2ZnKDQsMCw0KSwgIGZnKDEsMCwxKSwgZmcoMiwwLDEpIF1cbiAgICAnY3Nvbic6ICAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygyLDAsMikgXVxuICAgICdub29uJzogICAgIFsgYm9sZCtmZyg0LDQsMCksICBmZygxLDEsMCksIGZnKDIsMiwwKSBdXG4gICAgJ3BsaXN0JzogICAgWyBib2xkK2ZnKDQsMCw0KSwgIGZnKDEsMCwxKSwgZmcoMiwwLDIpIF1cbiAgICAnanMnOiAgICAgICBbIGJvbGQrZmcoNSwwLDUpLCAgZmcoMiwwLDIpLCBmZygzLDAsMykgXVxuICAgICdjcHAnOiAgICAgIFsgYm9sZCtmZyg1LDQsMCksICBmdygzKSwgICAgIGZnKDMsMiwwKSBdXG4gICAgJ2gnOiAgICAgICAgWyAgICAgIGZnKDMsMSwwKSwgIGZ3KDMpLCAgICAgZmcoMiwxLDApIF1cbiAgICAncHljJzogICAgICBbICAgICAgZncoNSksICAgICAgZncoMyksICAgICBmdyg0KSBdXG4gICAgJ2xvZyc6ICAgICAgWyAgICAgIGZ3KDUpLCAgICAgIGZ3KDIpLCAgICAgZncoMykgXVxuICAgICdsb2cnOiAgICAgIFsgICAgICBmdyg1KSwgICAgICBmdygyKSwgICAgIGZ3KDMpIF1cbiAgICAndHh0JzogICAgICBbICAgICAgZncoMjApLCAgICAgZncoMyksICAgICBmdyg0KSBdXG4gICAgJ21kJzogICAgICAgWyBib2xkK2Z3KDIwKSwgICAgIGZ3KDMpLCAgICAgZncoNCkgXVxuICAgICdtYXJrZG93bic6IFsgYm9sZCtmdygyMCksICAgICBmdygzKSwgICAgIGZ3KDQpIF1cbiAgICAnc2gnOiAgICAgICBbIGJvbGQrZmcoNSwxLDApLCAgZmcoMiwwLDApLCBmZygzLDAsMCkgXVxuICAgICdwbmcnOiAgICAgIFsgYm9sZCtmZyg1LDAsMCksICBmZygyLDAsMCksIGZnKDMsMCwwKSBdXG4gICAgJ2pwZyc6ICAgICAgWyBib2xkK2ZnKDAsMywwKSwgIGZnKDAsMiwwKSwgZmcoMCwyLDApIF1cbiAgICAncHhtJzogICAgICBbIGJvbGQrZmcoMSwxLDUpLCAgZmcoMCwwLDIpLCBmZygwLDAsNCkgXVxuICAgICd0aWZmJzogICAgIFsgYm9sZCtmZygxLDEsNSksICBmZygwLDAsMyksIGZnKDAsMCw0KSBdXG5cbiAgICAnX2RlZmF1bHQnOiBbICAgICAgZncoMTUpLCAgICAgZncoNCksICAgICBmdygxMCkgXVxuICAgICdfZGlyJzogICAgIFsgYm9sZCtCRygwLDAsMikrZncoMjMpLCBmZygxLDEsNSksIGJvbGQrQkcoMCwwLDIpK2ZnKDIsMiw1KSBdXG4gICAgJ18uZGlyJzogICAgWyBib2xkK0JHKDAsMCwxKStmdygyMyksIGJvbGQrQkcoMCwwLDEpK2ZnKDEsMSw1KSwgYm9sZCtCRygwLDAsMSkrZmcoMiwyLDUpIF1cbiAgICAnX2xpbmsnOiAgICB7ICdhcnJvdyc6IGZnKDEsMCwxKSwgJ3BhdGgnOiBmZyg0LDAsNCksICdicm9rZW4nOiBCRyg1LDAsMCkrZmcoNSw1LDApIH1cbiAgICAnX2Fycm93JzogICAgIEJXKDIpK2Z3KDApXG4gICAgJ19oZWFkZXInOiAgWyBib2xkK0JXKDIpK2ZnKDMsMiwwKSwgIGZ3KDQpLCBib2xkK0JXKDIpK2ZnKDUsNSwwKSBdXG4gICAgJ19zaXplJzogICAgeyBiOiBbZmcoMCwwLDMpLCBmZygwLDAsMildLCBrQjogW2ZnKDAsMCw1KSwgZmcoMCwwLDMpXSwgTUI6IFtmZygxLDEsNSksIGZnKDAsMCw0KV0sIEdCOiBbZmcoNCw0LDUpLCBmZygyLDIsNSldLCBUQjogW2ZnKDQsNCw1KSwgZmcoMiwyLDUpXSB9XG4gICAgJ191c2Vycyc6ICAgeyByb290OiAgZmcoMywwLDApLCBkZWZhdWx0OiBmZygxLDAsMSkgfVxuICAgICdfZ3JvdXBzJzogIHsgd2hlZWw6IGZnKDEsMCwwKSwgc3RhZmY6IGZnKDAsMSwwKSwgYWRtaW46IGZnKDEsMSwwKSwgZGVmYXVsdDogZmcoMSwwLDEpIH1cbiAgICAnX2Vycm9yJzogICBbIGJvbGQrQkcoNSwwLDApK2ZnKDUsNSwwKSwgYm9sZCtCRyg1LDAsMCkrZmcoNSw1LDUpIF1cbiAgICAnX3JpZ2h0cyc6XG4gICAgICAgICAgICAgICAgICAncisnOiBib2xkK0JXKDEpK2Z3KDYpXG4gICAgICAgICAgICAgICAgICAnci0nOiByZXNldCtCVygxKStmdygyKVxuICAgICAgICAgICAgICAgICAgJ3crJzogYm9sZCtCVygxKStmZygyLDIsNSlcbiAgICAgICAgICAgICAgICAgICd3LSc6IHJlc2V0K0JXKDEpK2Z3KDIpXG4gICAgICAgICAgICAgICAgICAneCsnOiBib2xkK0JXKDEpK2ZnKDUsMCwwKVxuICAgICAgICAgICAgICAgICAgJ3gtJzogcmVzZXQrQlcoMSkrZncoMilcblxudXNlck1hcCA9IHt9XG51c2VybmFtZSA9ICh1aWQpIC0+XG4gICAgaWYgbm90IHVzZXJNYXBbdWlkXVxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG4gICAgICAgICAgICB1c2VyTWFwW3VpZF0gPSBjaGlsZHAuc3Bhd25TeW5jKFwiaWRcIiwgW1wiLXVuXCIsIFwiI3t1aWR9XCJdKS5zdGRvdXQudG9TdHJpbmcoJ3V0ZjgnKS50cmltKClcbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgbG9nIGVcbiAgICB1c2VyTWFwW3VpZF1cblxuZ3JvdXBNYXAgPSBudWxsXG5ncm91cG5hbWUgPSAoZ2lkKSAtPlxuICAgIGlmIG5vdCBncm91cE1hcFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG4gICAgICAgICAgICBnaWRzID0gY2hpbGRwLnNwYXduU3luYyhcImlkXCIsIFtcIi1HXCJdKS5zdGRvdXQudG9TdHJpbmcoJ3V0ZjgnKS5zcGxpdCgnICcpXG4gICAgICAgICAgICBnbm1zID0gY2hpbGRwLnNwYXduU3luYyhcImlkXCIsIFtcIi1HblwiXSkuc3Rkb3V0LnRvU3RyaW5nKCd1dGY4Jykuc3BsaXQoJyAnKVxuICAgICAgICAgICAgZ3JvdXBNYXAgPSB7fVxuICAgICAgICAgICAgZm9yIGkgaW4gWzAuLi5naWRzLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBncm91cE1hcFtnaWRzW2ldXSA9IGdubXNbaV1cbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgbG9nIGVcbiAgICBncm91cE1hcFtnaWRdXG5cbmlmICdmdW5jdGlvbicgPT0gdHlwZW9mIHByb2Nlc3MuZ2V0dWlkXG4gICAgY29sb3JzWydfdXNlcnMnXVt1c2VybmFtZShwcm9jZXNzLmdldHVpZCgpKV0gPSBmZygwLDQsMClcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG5sb2dfZXJyb3IgPSAoKSAtPlxuICAgIFxuICAgIGxvZyBcIiBcIiArIGNvbG9yc1snX2Vycm9yJ11bMF0gKyBcIiBcIiArIGJvbGQgKyBhcmd1bWVudHNbMF0gKyAoYXJndW1lbnRzLmxlbmd0aCA+IDEgYW5kIChjb2xvcnNbJ19lcnJvciddWzFdICsgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpLnNsaWNlKDEpLmpvaW4oJyAnKSkgb3IgJycpICsgXCIgXCIgKyByZXNldFxuXG5saW5rU3RyaW5nID0gKGZpbGUpIC0+IFxuICAgIFxuICAgIHMgID0gcmVzZXQgKyBmdygxKSArIGNvbG9yc1snX2xpbmsnXVsnYXJyb3cnXSArIFwiIOKWuiBcIiBcbiAgICBzICs9IGNvbG9yc1snX2xpbmsnXVsoZmlsZSBpbiBzdGF0cy5icm9rZW5MaW5rcykgYW5kICdicm9rZW4nIG9yICdwYXRoJ10gXG4gICAgdHJ5XG4gICAgICAgIHMgKz0gc2xhc2gucGF0aCBmcy5yZWFkbGlua1N5bmMoZmlsZSlcbiAgICBjYXRjaCBlcnJcbiAgICAgICAgcyArPSAnID8gJ1xuICAgIHNcblxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgXG4jIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcblxubmFtZVN0cmluZyA9IChuYW1lLCBleHQpIC0+IFxuICAgIFxuICAgIGlmIGFyZ3MubmVyZHlcbiAgICAgICAgaWNvbnMgPSByZXF1aXJlICcuL2ljb25zJ1xuICAgICAgICBpY29uID0gKGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVsyXSArIChpY29ucy5nZXQobmFtZSwgZXh0KSA/ICcgJykpICsgJyAnXG4gICAgZWxzZVxuICAgICAgICBpY29uID0gJydcbiAgICBcIiBcIiArIGljb24gKyBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMF0gKyBuYW1lICsgcmVzZXRcbiAgICBcbmRvdFN0cmluZyAgPSAoZXh0KSAtPiBcbiAgICBcbiAgICBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMV0gKyBcIi5cIiArIHJlc2V0XG4gICAgXG5leHRTdHJpbmcgID0gKG5hbWUsIGV4dCkgLT4gXG4gICAgXG4gICAgaWYgYXJncy5uZXJkeSBhbmQgbmFtZSBcbiAgICAgICAgaWNvbnMgPSByZXF1aXJlICcuL2ljb25zJ1xuICAgICAgICBpZiBpY29ucy5nZXQobmFtZSwgZXh0KSB0aGVuIHJldHVybiAnJ1xuICAgIGRvdFN0cmluZyhleHQpICsgY29sb3JzW2NvbG9yc1tleHRdPyBhbmQgZXh0IG9yICdfZGVmYXVsdCddWzFdICsgZXh0ICsgcmVzZXRcbiAgICBcbmRpclN0cmluZyAgPSAobmFtZSwgZXh0KSAtPlxuICAgIFxuICAgIGMgPSBuYW1lIGFuZCAnX2Rpcicgb3IgJ18uZGlyJ1xuICAgIGljb24gPSBhcmdzLm5lcmR5IGFuZCBjb2xvcnNbY11bMl0gKyAnIFxcdWY0MTMnIG9yICcnXG4gICAgaWNvbiArIGNvbG9yc1tjXVswXSArIChuYW1lIGFuZCAoXCIgXCIgKyBuYW1lKSBvciBcIiBcIikgKyAoaWYgZXh0IHRoZW4gY29sb3JzW2NdWzFdICsgJy4nICsgY29sb3JzW2NdWzJdICsgZXh0IGVsc2UgXCJcIikgKyBcIiBcIlxuXG4jICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5zaXplU3RyaW5nID0gKHN0YXQpIC0+XG5cbiAgICBpZiBhcmdzLm5lcmR5IGFuZCBhcmdzLnByZXR0eVxuXG4gICAgICAgIGJhciA9IChuKSAtPlxuICAgICAgICAgICAgYiA9ICfilo/ilo7ilo3iloziloviloriloknXG4gICAgICAgICAgICBiW01hdGguZmxvb3Igbi8oMTAwMC83KV0gIFxuICAgICAgICBcbiAgICAgICAgaWYgc3RhdC5zaXplID09IDBcbiAgICAgICAgICAgIHJldHVybiBycGFkICcnLCA4XG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwXG4gICAgICAgICAgICByZXR1cm4gY29sb3JzWydfc2l6ZSddWydiJ11bMV0gKyBycGFkIGJhcihzdGF0LnNpemUpLCA4XG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGNvbG9yc1snX3NpemUnXVsnYiddWzFdICsgJ+KWiCcgKyBycGFkIGJhcihzdGF0LnNpemUvMTApLCA3XG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMDBcbiAgICAgICAgICAgIHJldHVybiBjb2xvcnNbJ19zaXplJ11bJ2InXVsxXSArICfilojilognICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMCksIDZcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDAwMDBcbiAgICAgICAgICAgIHJldHVybiBjb2xvcnNbJ19zaXplJ11bJ2InXVsxXSArICfilojilojilognICsgY29sb3JzWydfc2l6ZSddWydrQiddWzFdICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMDApLCA1XG4gICAgICAgICAgICBcbiAgICAgICAgbWIgPSBwYXJzZUludCBzdGF0LnNpemUgLyAxMDAwMDAwXG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGNvbG9yc1snX3NpemUnXVsnYiddWzFdICsgJ+KWiOKWiOKWiCcgKyBCRygwLDAsMykgKyBmZygwLDAsMikgKyBtYiArIHJlc2V0ICsgY29sb3JzWydfc2l6ZSddWydrQiddWzFdICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMDAwKSwgNFxuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMDAwMDAwXG4gICAgICAgICAgICByZXR1cm4gY29sb3JzWydfc2l6ZSddWydiJ11bMV0gKyAn4paI4paI4paIJyArIEJHKDAsMCwzKSArIGZnKDAsMCwyKSArIG1iICsgcmVzZXQgKyBjb2xvcnNbJ19zaXplJ11bJ2tCJ11bMV0gKyBycGFkIGJhcihzdGF0LnNpemUvMTAwMDAwKSwgM1xuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGNvbG9yc1snX3NpemUnXVsnYiddWzFdICsgJ+KWiOKWiOKWiCcgKyBCRygwLDAsMykgKyBmZygwLDAsMikgKyBtYiArIHJlc2V0ICsgY29sb3JzWydfc2l6ZSddWydNQiddWzFdICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMDAwMDApLCAyXG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGNvbG9yc1snX3NpemUnXVsnYiddWzFdICsgJ+KWiOKWiOKWiCcgKyBjb2xvcnNbJ19zaXplJ11bJ2tCJ11bMV0gKyAn4paI4paI4paIJyArIGNvbG9yc1snX3NpemUnXVsnTUInXVsxXSArICfilognICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMDAwMDAwKSwgMVxuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMDAwMDAwMDAwXG4gICAgICAgICAgICByZXR1cm4gY29sb3JzWydfc2l6ZSddWydiJ11bMV0gKyAn4paI4paI4paIJyArIGNvbG9yc1snX3NpemUnXVsna0InXVsxXSArICfilojilojilognICsgY29sb3JzWydfc2l6ZSddWydNQiddWzFdICsgJ+KWiOKWiCcgKyBiYXIoc3RhdC5zaXplLzEwMDAwMDAwMClcbiAgICAgICAgXG4gICAgaWYgYXJncy5wcmV0dHkgYW5kIHN0YXQuc2l6ZSA9PSAwXG4gICAgICAgIHJldHVybiBscGFkKCcgJywgMTEpXG4gICAgaWYgc3RhdC5zaXplIDwgMTAwMFxuICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ2InXVswXSArIGxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2UgaWYgc3RhdC5zaXplIDwgMTAwMDAwMFxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydrQiddWzBdICsgbHBhZCgoc3RhdC5zaXplIC8gMTAwMCkudG9GaXhlZCgwKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsna0InXVsxXSArIFwia0IgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydrQiddWzBdICsgbHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZSBpZiBzdGF0LnNpemUgPCAxMDAwMDAwMDAwXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ01CJ11bMF0gKyBscGFkKChzdGF0LnNpemUgLyAxMDAwMDAwKS50b0ZpeGVkKDEpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydNQiddWzFdICsgXCJNQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ01CJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlIGlmIHN0YXQuc2l6ZSA8IDEwMDAwMDAwMDAwMDBcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnR0InXVswXSArIGxwYWQoKHN0YXQuc2l6ZSAvIDEwMDAwMDAwMDApLnRvRml4ZWQoMSksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMV0gKyBcIkdCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnR0InXVswXSArIGxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2VcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnVEInXVswXSArIGxwYWQoKHN0YXQuc2l6ZSAvIDEwMDAwMDAwMDAwMDApLnRvRml4ZWQoMyksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMV0gKyBcIlRCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnVEInXVswXSArIGxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuXG4jIDAwMDAwMDAwMCAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICBcbiMgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4jICAgIDAwMCAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuXG50aW1lU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgaWYgYXJncy5uZXJkeSBhbmQgYXJncy5wcmV0dHlcbiAgICAgICAgc2VjID0gcGFyc2VJbnQgKERhdGUubm93KCktc3RhdC5tdGltZU1zKS8xMDAwXG4gICAgICAgIG1uICA9IHBhcnNlSW50IHNlYy82MFxuICAgICAgICBociAgPSBwYXJzZUludCBzZWMvMzYwMFxuICAgICAgICBpZiBociA8IDEyXG4gICAgICAgICAgICBpZiBzZWMgPCA2MFxuICAgICAgICAgICAgICAgIHJldHVybiBCRygwLDAsMSkgKyAnICAgJyArIGZnKDUsNSw1KSArICfil4vil5Til5Hil5UnW3BhcnNlSW50IHNlYy8xNV0gKyByZXNldCArIGZnKDAsMCwxKSArICfiloknIFxuICAgICAgICAgICAgZWxzZSBpZiBtbiA8IDYwXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArICcgICcgKyBmZyg0LDQsNSkgKyAn4peL4peU4peR4peVJ1twYXJzZUludCBtbi8xNV0gKyBmZygwLDAsMykgKyAn4peMJyArIHJlc2V0ICsgZmcoMCwwLDEpICsgJ+KWiScgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArICcgJyArIGZnKDMsMyw1KSArICfil4vil5Til5Hil5UnW3BhcnNlSW50IGhyLzNdICsgZmcoMCwwLDMpICsgJ+KXjOKXjCcgKyByZXNldCArIGZnKDAsMCwxKSArICfiloknIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkeSA9IHBhcnNlSW50IE1hdGgucm91bmQgc2VjLygyNCozNjAwKVxuICAgICAgICAgICAgd2sgPSBwYXJzZUludCBNYXRoLnJvdW5kIHNlYy8oNyoyNCozNjAwKVxuICAgICAgICAgICAgbXQgPSBwYXJzZUludCBNYXRoLnJvdW5kIHNlYy8oMzAqMjQqMzYwMClcbiAgICAgICAgICAgIHlyID0gcGFyc2VJbnQgTWF0aC5yb3VuZCBzZWMvKDM2NSoyNCozNjAwKVxuICAgICAgICAgICAgaWYgZHkgPCAxMFxuICAgICAgICAgICAgICAgIHJldHVybiBCRygwLDAsMSkgKyBmZygwLDAsNSkgKyBcIiAje2R5fSBcXHVmMTg1XCIgKyByZXNldCArIGZnKDAsMCwxKSArICfiloknIFxuICAgICAgICAgICAgZWxzZSBpZiB3ayA8IDhcbiAgICAgICAgICAgICAgICByZXR1cm4gQkcoMCwwLDEpICsgZmcoMCwwLDQpICsgXCIgI3t3a30gXFx1ZjE4NlwiICsgcmVzZXQgKyBmZygwLDAsMSkgKyAn4paJJyBcbiAgICAgICAgICAgIGVsc2UgaWYgbXQgPCAxMFxuICAgICAgICAgICAgICAgIHJldHVybiBCRygwLDAsMSkgKyBmZygwLDAsMykgKyBcIiAje210fSBcXHVmNDU1XCIgKyByZXNldCArIGZnKDAsMCwxKSArICfiloknIFxuICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICByZXR1cm4gQkcoMCwwLDEpICsgZmcoMCwwLDMpICsgXCIgI3t5cn0gXFx1ZjZlNlwiICsgcmVzZXQgKyBmZygwLDAsMSkgKyAn4paJJyBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgbW9tZW50ID0gcmVxdWlyZSAnbW9tZW50J1xuICAgIHQgPSBtb21lbnQgc3RhdC5tdGltZVxuICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgIGFnZSA9IG1vbWVudCgpLnRvKHQsIHRydWUpXG4gICAgICAgIFtudW0sIHJhbmdlXSA9IGFnZS5zcGxpdCAnICdcbiAgICAgICAgbnVtID0gJzEnIGlmIG51bVswXSA9PSAnYSdcbiAgICAgICAgaWYgcmFuZ2UgPT0gJ2ZldydcbiAgICAgICAgICAgIG51bSA9IG1vbWVudCgpLmRpZmYgdCwgJ3NlY29uZHMnXG4gICAgICAgICAgICByYW5nZSA9ICdzZWNvbmRzJ1xuICAgICAgICAgICAgZncoMjMpICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoMTYpICsgcnBhZChyYW5nZSwgNykgKyAnICdcbiAgICAgICAgZWxzZSBpZiByYW5nZS5zdGFydHNXaXRoICd5ZWFyJ1xuICAgICAgICAgICAgZncoNikgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdygzKSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2UgaWYgcmFuZ2Uuc3RhcnRzV2l0aCAnbW9udGgnXG4gICAgICAgICAgICBmdyg4KSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDQpICsgcnBhZChyYW5nZSwgNykgKyAnICdcbiAgICAgICAgZWxzZSBpZiByYW5nZS5zdGFydHNXaXRoICdkYXknXG4gICAgICAgICAgICBmdygxMCkgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdyg2KSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2UgaWYgcmFuZ2Uuc3RhcnRzV2l0aCAnaG91cidcbiAgICAgICAgICAgIGZ3KDE1KSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDgpICsgcnBhZChyYW5nZSwgNykgKyAnICdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZncoMTgpICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoMTIpICsgcnBhZChyYW5nZSwgNykgKyAnICdcbiAgICBlbHNlXG4gICAgICAgIGZ3KDE2KSArIGxwYWQodC5mb3JtYXQoXCJERFwiKSwyKSArIGZ3KDcpKycuJyArXG4gICAgICAgIGZ3KDEyKSArIHQuZm9ybWF0KFwiTU1cIikgKyBmdyg3KStcIi5cIiArXG4gICAgICAgIGZ3KCA4KSArIHQuZm9ybWF0KFwiWVlcIikgKyAnICcgK1xuICAgICAgICBmdygxNikgKyB0LmZvcm1hdChcIkhIXCIpICsgY29sID0gZncoNykrJzonICtcbiAgICAgICAgZncoMTQpICsgdC5mb3JtYXQoXCJtbVwiKSArIGNvbCA9IGZ3KDEpKyc6JyArXG4gICAgICAgIGZ3KCA0KSArIHQuZm9ybWF0KFwic3NcIikgKyAnICdcblxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbm93bmVyTmFtZSA9IChzdGF0KSAtPlxuICAgIFxuICAgIHRyeVxuICAgICAgICB1c2VybmFtZSBzdGF0LnVpZFxuICAgIGNhdGNoXG4gICAgICAgIHN0YXQudWlkXG5cbmdyb3VwTmFtZSA9IChzdGF0KSAtPlxuICAgIFxuICAgIHRyeVxuICAgICAgICBncm91cG5hbWUgc3RhdC5naWRcbiAgICBjYXRjaFxuICAgICAgICBzdGF0LmdpZFxuXG5vd25lclN0cmluZyA9IChzdGF0KSAtPlxuICAgIFxuICAgIG93biA9IG93bmVyTmFtZShzdGF0KVxuICAgIGdycCA9IGdyb3VwTmFtZShzdGF0KVxuICAgIG9jbCA9IGNvbG9yc1snX3VzZXJzJ11bb3duXVxuICAgIG9jbCA9IGNvbG9yc1snX3VzZXJzJ11bJ2RlZmF1bHQnXSB1bmxlc3Mgb2NsXG4gICAgZ2NsID0gY29sb3JzWydfZ3JvdXBzJ11bZ3JwXVxuICAgIGdjbCA9IGNvbG9yc1snX2dyb3VwcyddWydkZWZhdWx0J10gdW5sZXNzIGdjbFxuICAgIG9jbCArIHJwYWQob3duLCBzdGF0cy5tYXhPd25lckxlbmd0aCkgKyBcIiBcIiArIGdjbCArIHJwYWQoZ3JwLCBzdGF0cy5tYXhHcm91cExlbmd0aClcblxuIyAwMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuXG5yd3hTdHJpbmcgPSAoc3RhdCwgaSkgLT5cbiAgICBcbiAgICBtb2RlID0gc3RhdC5tb2RlXG4gICAgXG4gICAgaWYgYXJncy5uZXJkeVxuICAgICAgICByID0gJyBcXHVmNDQxJ1xuICAgICAgICB3ID0gJ1xcdWYwNDAnXG4gICAgICAgIHggPSBzdGF0LmlzRGlyZWN0b3J5KCkgYW5kICdcXHVmMDg1JyBvciAnXFx1ZjAxMydcbiAgICAgICAgXG4gICAgICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIxMDApIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsncisnXSArIHIgb3IgY29sb3JzWydfcmlnaHRzJ11bJ3ItJ10gKyByKSArXG4gICAgICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIwMTApIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsndysnXSArIHcgb3IgY29sb3JzWydfcmlnaHRzJ11bJ3ctJ10gKyB3KSArXG4gICAgICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIwMDEpIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsneCsnXSArIHggb3IgY29sb3JzWydfcmlnaHRzJ11bJ3gtJ10gKyB4KVxuICAgIGVsc2VcbiAgICAgICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjEwMCkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWydyKyddICsgJyByJyBvciBjb2xvcnNbJ19yaWdodHMnXVsnci0nXSArICcgICcpICtcbiAgICAgICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjAxMCkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWyd3KyddICsgJyB3JyBvciBjb2xvcnNbJ19yaWdodHMnXVsndy0nXSArICcgICcpICtcbiAgICAgICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjAwMSkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWyd4KyddICsgJyB4JyBvciBjb2xvcnNbJ19yaWdodHMnXVsneC0nXSArICcgICcpXG5cbnJpZ2h0c1N0cmluZyA9IChzdGF0KSAtPlxuICAgIFxuICAgIHVyID0gcnd4U3RyaW5nKHN0YXQsIDIpXG4gICAgZ3IgPSByd3hTdHJpbmcoc3RhdCwgMSlcbiAgICBybyA9IHJ3eFN0cmluZyhzdGF0LCAwKSArIFwiIFwiXG4gICAgdXIgKyBnciArIHJvICsgcmVzZXRcblxuZ2V0UHJlZml4ID0gKHN0YXQsIGRlcHRoKSAtPlxuICAgIFxuICAgIHMgPSAnJ1xuICAgIGlmIGFyZ3MucmlnaHRzXG4gICAgICAgIHMgKz0gcmlnaHRzU3RyaW5nIHN0YXRcbiAgICAgICAgcyArPSBcIiBcIlxuICAgIGlmIGFyZ3Mub3duZXJcbiAgICAgICAgcyArPSBvd25lclN0cmluZyBzdGF0XG4gICAgICAgIHMgKz0gXCIgXCJcbiAgICBpZiBhcmdzLm1kYXRlXG4gICAgICAgIHMgKz0gdGltZVN0cmluZyBzdGF0XG4gICAgaWYgYXJncy5ieXRlc1xuICAgICAgICBzICs9IHNpemVTdHJpbmcgc3RhdFxuICAgICAgICBcbiAgICBpZiBkZXB0aCBhbmQgYXJncy50cmVlXG4gICAgICAgIHMgKz0gcnBhZCAnJywgZGVwdGgqNFxuICAgICAgICBcbiAgICBpZiBzLmxlbmd0aCA9PSAwIGFuZCBhcmdzLm9mZnNldFxuICAgICAgICBzICs9ICcgICAgICAgJ1xuICAgIHNcbiAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDBcblxuc29ydCA9IChsaXN0LCBzdGF0cywgZXh0cz1bXSkgLT5cbiAgICBcbiAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuICAgIG1vbWVudCA9IHJlcXVpcmUgJ21vbWVudCdcbiAgICBcbiAgICBsID0gXy56aXAgbGlzdCwgc3RhdHMsIFswLi4ubGlzdC5sZW5ndGhdLCAoZXh0cy5sZW5ndGggPiAwIGFuZCBleHRzIG9yIFswLi4ubGlzdC5sZW5ndGhdKVxuICAgIFxuICAgIGlmIGFyZ3Mua2luZFxuICAgICAgICBpZiBleHRzID09IFtdIHRoZW4gcmV0dXJuIGxpc3RcbiAgICAgICAgbC5zb3J0KChhLGIpIC0+XG4gICAgICAgICAgICBpZiBhWzNdID4gYlszXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICBpZiBhWzNdIDwgYlszXSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYXJncy50aW1lXG4gICAgICAgICAgICAgICAgbSA9IG1vbWVudChhWzFdLm10aW1lKVxuICAgICAgICAgICAgICAgIGlmIG0uaXNBZnRlcihiWzFdLm10aW1lKSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgaWYgbS5pc0JlZm9yZShiWzFdLm10aW1lKSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYXJncy5zaXplXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplID4gYlsxXS5zaXplIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPCBiWzFdLnNpemUgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFbMl0gPiBiWzJdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIC0xKVxuICAgIGVsc2UgaWYgYXJncy50aW1lXG4gICAgICAgIGwuc29ydCgoYSxiKSAtPlxuICAgICAgICAgICAgbSA9IG1vbWVudChhWzFdLm10aW1lKVxuICAgICAgICAgICAgaWYgbS5pc0FmdGVyKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIGlmIG0uaXNCZWZvcmUoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3Muc2l6ZVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA+IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICBlbHNlIGlmIGFyZ3Muc2l6ZVxuICAgICAgICBsLnNvcnQoKGEsYikgLT5cbiAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA+IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICBpZiBhWzFdLnNpemUgPCBiWzFdLnNpemUgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFbMl0gPiBiWzJdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIC0xKVxuICAgIF8udW56aXAobClbMF1cblxuIyAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuIyAwMDAgIDAwMCAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuXG5pZ25vcmUgPSAocCkgLT5cbiAgICBcbiAgICBiYXNlID0gc2xhc2guYmFzZW5hbWUgcFxuICAgIHJldHVybiB0cnVlIGlmIGJhc2VbMF0gPT0gJyQnXG4gICAgcmV0dXJuIHRydWUgaWYgYmFzZSA9PSAnZGVza3RvcC5pbmknICAgIFxuICAgIHJldHVybiB0cnVlIGlmIGJhc2UudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoICdudHVzZXInXG4gICAgZmFsc2VcbiAgICBcbiMgMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDBcbiMgMDAwMDAwICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgICAgICAgMDAwXG4jIDAwMCAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwXG5cbmxpc3RGaWxlcyA9IChwLCBmaWxlcywgZGVwdGgpIC0+XG4gICAgXG4gICAgYWxwaCA9IFtdIGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgZGlycyA9IFtdICMgdmlzaWJsZSBkaXJzXG4gICAgZmlscyA9IFtdICMgdmlzaWJsZSBmaWxlc1xuICAgIGRzdHMgPSBbXSAjIGRpciBzdGF0c1xuICAgIGZzdHMgPSBbXSAjIGZpbGUgc3RhdHNcbiAgICBleHRzID0gW10gIyBmaWxlIGV4dGVuc2lvbnNcblxuICAgIGlmIGFyZ3Mub3duZXJcbiAgICAgICAgXG4gICAgICAgIGZpbGVzLmZvckVhY2ggKHJwKSAtPlxuICAgICAgICAgICAgaWYgc2xhc2guaXNBYnNvbHV0ZSBycFxuICAgICAgICAgICAgICAgIGZpbGUgPSBzbGFzaC5yZXNvbHZlIHJwXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmlsZSAgPSBzbGFzaC5qb2luIHAsIHJwXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBzdGF0ID0gZnMubHN0YXRTeW5jKGZpbGUpXG4gICAgICAgICAgICAgICAgb2wgPSBvd25lck5hbWUoc3RhdCkubGVuZ3RoXG4gICAgICAgICAgICAgICAgZ2wgPSBncm91cE5hbWUoc3RhdCkubGVuZ3RoXG4gICAgICAgICAgICAgICAgaWYgb2wgPiBzdGF0cy5tYXhPd25lckxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5tYXhPd25lckxlbmd0aCA9IG9sXG4gICAgICAgICAgICAgICAgaWYgZ2wgPiBzdGF0cy5tYXhHcm91cExlbmd0aFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5tYXhHcm91cExlbmd0aCA9IGdsXG4gICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgZmlsZXMuZm9yRWFjaCAocnApIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5pc0Fic29sdXRlIHJwXG4gICAgICAgICAgICBmaWxlICA9IHNsYXNoLnJlc29sdmUgcnBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZmlsZSAgPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gcCwgcnBcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgaWdub3JlIHJwXG4gICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGxzdGF0ID0gZnMubHN0YXRTeW5jIGZpbGVcbiAgICAgICAgICAgIGxpbmsgID0gbHN0YXQuaXNTeW1ib2xpY0xpbmsoKVxuICAgICAgICAgICAgc3RhdCAgPSBsaW5rIGFuZCBmcy5zdGF0U3luYyhmaWxlKSBvciBsc3RhdFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICBzdGF0ID0gbHN0YXRcbiAgICAgICAgICAgICAgICBzdGF0cy5icm9rZW5MaW5rcy5wdXNoIGZpbGVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjIGxvZ19lcnJvciBcImNhbid0IHJlYWQgZmlsZTogXCIsIGZpbGUsIGxpbmtcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBleHQgID0gc2xhc2guZXh0IGZpbGVcbiAgICAgICAgbmFtZSA9IHNsYXNoLmJhc2UgZmlsZVxuICAgICAgICBcbiAgICAgICAgaWYgbmFtZVswXSA9PSAnLidcbiAgICAgICAgICAgIGV4dCA9IG5hbWUuc3Vic3RyKDEpICsgc2xhc2guZXh0bmFtZSBmaWxlXG4gICAgICAgICAgICBuYW1lID0gJydcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBuYW1lLmxlbmd0aCBhbmQgbmFtZVtuYW1lLmxlbmd0aC0xXSAhPSAnXFxyJyBvciBhcmdzLmFsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzID0gZ2V0UHJlZml4IHN0YXQsIGRlcHRoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICBpZiBub3QgYXJncy5maWxlc1xuICAgICAgICAgICAgICAgICAgICBpZiBub3QgYXJncy50cmVlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBuYW1lLnN0YXJ0c1dpdGggJy4vJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lWzIuLl1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBkaXJTdHJpbmcgbmFtZSwgZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBsaW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBsaW5rU3RyaW5nIGZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcnMucHVzaCBzK3Jlc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICBhbHBoLnB1c2ggcytyZXNldCBpZiBhcmdzLmFscGhhYmV0aWNhbFxuICAgICAgICAgICAgICAgICAgICBkc3RzLnB1c2ggc3RhdFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5udW1fZGlycyArPSAxXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZGlycyArPSAxXG4gICAgICAgICAgICBlbHNlICMgaWYgcGF0aCBpcyBmaWxlXG4gICAgICAgICAgICAgICAgaWYgbm90IGFyZ3MuZGlyc1xuICAgICAgICAgICAgICAgICAgICBzICs9IG5hbWVTdHJpbmcgbmFtZSwgZXh0XG4gICAgICAgICAgICAgICAgICAgIGlmIGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBleHRTdHJpbmcgbmFtZSwgZXh0XG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gbGlua1N0cmluZyBmaWxlXG4gICAgICAgICAgICAgICAgICAgIGZpbHMucHVzaCBzK3Jlc2V0XG4gICAgICAgICAgICAgICAgICAgIGFscGgucHVzaCBzK3Jlc2V0IGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgICAgICAgICAgICAgIGZzdHMucHVzaCBzdGF0XG4gICAgICAgICAgICAgICAgICAgIGV4dHMucHVzaCBleHRcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubnVtX2ZpbGVzICs9IDFcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9maWxlcyArPSAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHN0YXQuaXNGaWxlKClcbiAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZmlsZXMgKz0gMVxuICAgICAgICAgICAgZWxzZSBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZGlycyArPSAxXG5cbiAgICBpZiBhcmdzLnNpemUgb3IgYXJncy5raW5kIG9yIGFyZ3MudGltZVxuICAgICAgICBpZiBkaXJzLmxlbmd0aCBhbmQgbm90IGFyZ3MuZmlsZXNcbiAgICAgICAgICAgIGRpcnMgPSBzb3J0IGRpcnMsIGRzdHNcbiAgICAgICAgaWYgZmlscy5sZW5ndGhcbiAgICAgICAgICAgIGZpbHMgPSBzb3J0IGZpbHMsIGZzdHMsIGV4dHNcblxuICAgIGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgIGxvZyBwIGZvciBwIGluIGFscGhcbiAgICBlbHNlXG4gICAgICAgIGxvZyBkIGZvciBkIGluIGRpcnNcbiAgICAgICAgbG9nIGYgZm9yIGYgaW4gZmlsc1xuXG4jIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMFxuXG5saXN0RGlyID0gKHAsIG9wdD17fSkgLT5cbiAgICAgICAgICAgIFxuICAgIGlmIGFyZ3MucmVjdXJzZVxuICAgICAgICBkZXB0aCA9IHBhdGhEZXB0aCBwLCBvcHRcbiAgICAgICAgcmV0dXJuIGlmIGRlcHRoID4gYXJncy5kZXB0aFxuICAgIFxuICAgIHBzID0gcFxuXG4gICAgdHJ5XG4gICAgICAgIGZpbGVzID0gZnMucmVhZGRpclN5bmMocClcbiAgICBjYXRjaCBlcnJcbiAgICAgICAgdHJ1ZVxuXG4gICAgaWYgYXJncy5maW5kXG4gICAgICAgIGZpbGVzID0gZmlsZXMuZmlsdGVyIChmKSAtPlxuICAgICAgICAgICAgZiBpZiBSZWdFeHAoYXJncy5maW5kKS50ZXN0IGZcbiAgICAgICAgICAgIFxuICAgIGlmIGFyZ3MuZmluZCBhbmQgbm90IGZpbGVzPy5sZW5ndGhcbiAgICAgICAgdHJ1ZVxuICAgIGVsc2UgaWYgYXJncy5wYXRocy5sZW5ndGggPT0gMSBhbmQgYXJncy5wYXRoc1swXSA9PSAnLicgYW5kIG5vdCBhcmdzLnJlY3Vyc2VcbiAgICAgICAgbG9nIHJlc2V0XG4gICAgZWxzZSBpZiBhcmdzLnRyZWVcbiAgICAgICAgbG9nIGdldFByZWZpeChzbGFzaC5pc0RpcihwKSwgZGVwdGgtMSkgKyBkaXJTdHJpbmcoc2xhc2guYmFzZShwcyksIHNsYXNoLmV4dChwcykpICsgcmVzZXRcbiAgICBlbHNlXG4gICAgICAgIHMgPSBjb2xvcnNbJ19hcnJvdyddICsgXCIg4pa2IFwiICsgY29sb3JzWydfaGVhZGVyJ11bMF1cbiAgICAgICAgcHMgPSBzbGFzaC5yZXNvbHZlIHBzIGlmIHBzWzBdICE9ICd+J1xuICAgICAgICBwcyA9IHNsYXNoLnJlbGF0aXZlIHBzLCBwcm9jZXNzLmN3ZCgpXG5cbiAgICAgICAgaWYgcHMgPT0gJy8nXG4gICAgICAgICAgICBzICs9ICcvJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzcCA9IHBzLnNwbGl0KCcvJylcbiAgICAgICAgICAgIHMgKz0gY29sb3JzWydfaGVhZGVyJ11bMF0gKyBzcC5zaGlmdCgpXG4gICAgICAgICAgICB3aGlsZSBzcC5sZW5ndGhcbiAgICAgICAgICAgICAgICBwbiA9IHNwLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBpZiBwblxuICAgICAgICAgICAgICAgICAgICBzICs9IGNvbG9yc1snX2hlYWRlciddWzFdICsgJy8nXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gY29sb3JzWydfaGVhZGVyJ11bc3AubGVuZ3RoID09IDAgYW5kIDIgb3IgMF0gKyBwblxuICAgICAgICBsb2cgcmVzZXRcbiAgICAgICAgbG9nIHMgKyBcIiBcIiArIHJlc2V0XG4gICAgICAgIGxvZyByZXNldFxuXG4gICAgaWYgZmlsZXM/Lmxlbmd0aFxuICAgICAgICBsaXN0RmlsZXMgcCwgZmlsZXMsIGRlcHRoXG5cbiAgICBpZiBhcmdzLnJlY3Vyc2VcbiAgICAgICAgXG4gICAgICAgIGRvUmVjdXJzZSA9IChmKSAtPiBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIHNsYXNoLmJhc2VuYW1lKGYpIGluIGFyZ3MuaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgc2xhc2guZXh0KGYpID09ICdhcHAnXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgbm90IGFyZ3MuYWxsIGFuZCBmWzBdID09ICcuJ1xuICAgICAgICAgICAgc2xhc2guaXNEaXIgc2xhc2guam9pbiBwLCBmXG4gICAgICAgICAgICBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBmb3IgcHIgaW4gZnMucmVhZGRpclN5bmMocCkuZmlsdGVyIGRvUmVjdXJzZVxuICAgICAgICAgICAgICAgIGxpc3REaXIgc2xhc2gucmVzb2x2ZShzbGFzaC5qb2luIHAsIHByKSwgb3B0XG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgbXNnID0gZXJyLm1lc3NhZ2VcbiAgICAgICAgICAgIG1zZyA9IFwicGVybWlzc2lvbiBkZW5pZWRcIiBpZiBtc2cuc3RhcnRzV2l0aCBcIkVBQ0NFU1wiXG4gICAgICAgICAgICBtc2cgPSBcInBlcm1pc3Npb24gZGVuaWVkXCIgaWYgbXNnLnN0YXJ0c1dpdGggXCJFUEVSTVwiXG4gICAgICAgICAgICBsb2dfZXJyb3IgbXNnXG4gICAgICAgICAgICBcbnBhdGhEZXB0aCA9IChwLCBvcHQpIC0+XG4gICAgXG4gICAgcmVsID0gc2xhc2gucmVsYXRpdmUgcCwgb3B0Py5yZWxhdGl2ZVRvID8gcHJvY2Vzcy5jd2QoKVxuICAgIHJldHVybiAwIGlmIHAgPT0gJy4nXG4gICAgcmVsLnNwbGl0KCcvJykubGVuZ3RoXG5cbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuXG5tYWluID0gLT5cbiAgICBcbiAgICBwYXRoc3RhdHMgPSBhcmdzLnBhdGhzLm1hcCAoZikgLT5cbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBbZiwgZnMuc3RhdFN5bmMoZildXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgICBsb2dfZXJyb3IgJ25vIHN1Y2ggZmlsZTogJywgZlxuICAgICAgICAgICAgW11cbiAgICBcbiAgICBmaWxlc3RhdHMgPSBwYXRoc3RhdHMuZmlsdGVyKCAoZikgLT4gZi5sZW5ndGggYW5kIG5vdCBmWzFdLmlzRGlyZWN0b3J5KCkgKVxuICAgIFxuICAgIGlmIGZpbGVzdGF0cy5sZW5ndGggPiAwXG4gICAgICAgIGxvZyByZXNldFxuICAgICAgICBsaXN0RmlsZXMgcHJvY2Vzcy5jd2QoKSwgZmlsZXN0YXRzLm1hcCggKHMpIC0+IHNbMF0gKVxuICAgIFxuICAgIGZvciBwIGluIHBhdGhzdGF0cy5maWx0ZXIoIChmKSAtPiBmLmxlbmd0aCBhbmQgZlsxXS5pc0RpcmVjdG9yeSgpIClcbiAgICAgICAgbG9nICcnIGlmIGFyZ3MudHJlZVxuICAgICAgICBsaXN0RGlyIHBbMF0sIHJlbGF0aXZlVG86YXJncy50cmVlIGFuZCBzbGFzaC5kaXJuYW1lKHBbMF0pIG9yIHByb2Nlc3MuY3dkKClcbiAgICBcbiAgICBsb2cgXCJcIlxuICAgIGlmIGFyZ3MuaW5mb1xuICAgICAgICBsb2cgQlcoMSkgKyBcIiBcIiArXG4gICAgICAgIGZ3KDgpICsgc3RhdHMubnVtX2RpcnMgKyAoc3RhdHMuaGlkZGVuX2RpcnMgYW5kIGZ3KDQpICsgXCIrXCIgKyBmdyg1KSArIChzdGF0cy5oaWRkZW5fZGlycykgb3IgXCJcIikgKyBmdyg0KSArIFwiIGRpcnMgXCIgK1xuICAgICAgICBmdyg4KSArIHN0YXRzLm51bV9maWxlcyArIChzdGF0cy5oaWRkZW5fZmlsZXMgYW5kIGZ3KDQpICsgXCIrXCIgKyBmdyg1KSArIChzdGF0cy5oaWRkZW5fZmlsZXMpIG9yIFwiXCIpICsgZncoNCkgKyBcIiBmaWxlcyBcIiArXG4gICAgICAgIGZ3KDgpICsgdGltZShwcm9jZXNzLmhydGltZS5iaWdpbnQ/KCktc3RhcnRUaW1lKSArIFwiIFwiICtcbiAgICAgICAgcmVzZXRcbiAgICBcbmlmIGFyZ3NcbiAgICBpbml0QXJncygpXG4gICAgbWFpbigpXG5lbHNlXG4gICAgbW9kdWxlTWFpbiA9IChhcmcsIG9wdD17fSkgLT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCB0eXBlb2YgYXJnXG4gICAgICAgICAgICB3aGVuICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgYXJncyA9IE9iamVjdC5hc3NpZ24ge30sIG9wdFxuICAgICAgICAgICAgICAgIGFyZ3MucGF0aHMgPz0gW11cbiAgICAgICAgICAgICAgICBhcmdzLnBhdGhzLnB1c2ggYXJnXG4gICAgICAgICAgICB3aGVuICdvYmplY3QnXG4gICAgICAgICAgICAgICAgYXJncyA9IE9iamVjdC5hc3NpZ24ge30sIGFyZ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFyZ3MgPSBwYXRoczpbJy4nXVxuICAgICAgICBpbml0QXJncygpXG4gICAgICAgIFxuICAgICAgICAjIGxvZyAnYXJnczonLCBhcmdzXG4gICAgICAgIFxuICAgICAgICBvdXQgPSAnJ1xuICAgICAgICBvbGRsb2cgPSBjb25zb2xlLmxvZ1xuICAgICAgICBjb25zb2xlLmxvZyA9IC0+IFxuICAgICAgICAgICAgZm9yIGFyZyBpbiBhcmd1bWVudHMgdGhlbiBvdXQgKz0gU3RyaW5nKGFyZylcbiAgICAgICAgICAgIG91dCArPSAnXFxuJ1xuICAgICAgICBcbiAgICAgICAgbWFpbigpXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyA9IG9sZGxvZ1xuICAgICAgICBvdXRcbiAgICBcbiAgICBtb2R1bGUuZXhwb3J0cyA9IG1vZHVsZU1haW5cbiAgICAiXX0=
//# sourceURL=../coffee/color-ls.coffee