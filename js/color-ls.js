// koffee 1.14.0

/*
 0000000   0000000   000       0000000   00000000           000       0000000
000       000   000  000      000   000  000   000          000      000
000       000   000  000      000   000  0000000    000000  000      0000000
000       000   000  000      000   000  000   000          000           000
 0000000   0000000   0000000   0000000   000   000          0000000  0000000
 */
var BG, BW, ansi, args, base1, bold, colors, dirString, dotString, extString, fg, filter, fs, fw, getPrefix, groupMap, groupName, groupname, ignore, initArgs, inodeString, karg, linkString, listDir, listFiles, log_error, lpad, main, moduleMain, nameString, os, ownerName, ownerString, pathDepth, ref, reset, rightsString, rpad, rwxString, sizeString, slash, sort, startTime, stats, time, timeString, token, userMap, username, util,
    indexOf = [].indexOf;

startTime = typeof (base1 = process.hrtime).bigint === "function" ? base1.bigint() : void 0;

ref = require('kstr'), lpad = ref.lpad, rpad = ref.rpad, time = ref.time;

os = require('os');

fs = require('fs');

slash = require('kslash');

filter = require('lodash.filter');

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
    args = karg("color-ls\n    paths           . ? the file(s) and/or folder(s) to display . **\n    all             . ? show dot files                  . = false\n    dirs            . ? show only dirs                  . = false\n    files           . ? show only files                 . = false\n    bytes           . ? include size                    . = false\n    mdate           . ? include modification date       . = false\n    long            . ? include size and date           . = false\n    owner           . ? include owner and group         . = false\n    rights          . ? include rights                  . = false\n    size            . ? sort by size                    . = false\n    time            . ? sort by time                    . = false\n    kind            . ? sort by kind                    . = false\n    nerdy           . ? use nerd font icons             . = false\n    pretty          . ? pretty size and age             . = true\n    ignore          . ? don't recurse into              . = node_modules .git\n    info            . ? show statistics                 . = false . - I\n    alphabetical    . ? don't group dirs before files   . = false . - A\n    offset          . ? indent short listings           . = false . - O\n    recurse         . ? recurse into subdirs            . = false . - R\n    tree            . ? recurse and indent              . = false . - T\n    followSymLinks  . ? recurse follows symlinks        . = false . - S \n    depth           . ? recursion depth                 . = ∞     . - D\n    find            . ? filter with a regexp            . - F\n    debug                                               . = false . - X\n    inodeInfos                                          . = false . - N \n\nversion      " + (require(__dirname + "/../package.json").version));
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
    'tgz': [bold + fg(0, 3, 4), fg(0, 1, 2), fg(0, 2, 3)],
    'pkg': [bold + fg(0, 3, 4), fg(0, 1, 2), fg(0, 2, 3)],
    'zip': [bold + fg(0, 3, 4), fg(0, 1, 2), fg(0, 2, 3)],
    'dmg': [bold + fg(1, 4, 4), fg(0, 2, 2), fg(0, 3, 3)],
    'ttf': [bold + fg(2, 1, 3), fg(1, 0, 2), fg(1, 0, 2)],
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
        s += slash.tilde(fs.readlinkSync(file));
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
    var bar, gb, mb;
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
            return fg(0, 0, 2) + '█' + rpad(bar(stat.size / 10), 7);
        }
        if (stat.size <= 100000) {
            return fg(0, 0, 2) + '██' + rpad(bar(stat.size / 100), 6);
        }
        if (stat.size <= 1000000) {
            return fg(0, 0, 3) + '███' + rpad(bar(stat.size / 1000), 5);
        }
        mb = parseInt(stat.size / 1000000);
        if (stat.size <= 10000000) {
            return fg(0, 0, 2) + '███' + fg(0, 0, 3) + '█' + fg(0, 0, 3) + rpad(bar(stat.size / 10000), 4);
        }
        if (stat.size <= 100000000) {
            return fg(0, 0, 2) + '███' + fg(0, 0, 3) + '██' + fg(0, 0, 3) + rpad(bar(stat.size / 100000), 3);
        }
        if (stat.size <= 1000000000) {
            return fg(0, 0, 2) + '███' + fg(0, 0, 3) + '███' + fg(0, 0, 4) + rpad(bar(stat.size / 1000000), 2);
        }
        gb = parseInt(mb / 1000);
        if (stat.size <= 10000000000) {
            return fg(0, 0, 2) + '███' + fg(0, 0, 3) + '███' + fg(0, 0, 4) + '█' + fg(0, 0, 4) + rpad(bar(stat.size / 10000000), 1);
        }
        if (stat.size <= 100000000000) {
            return fg(0, 0, 2) + '███' + fg(0, 0, 3) + '███' + fg(0, 0, 4) + '██' + fg(0, 0, 4) + bar(stat.size / 100000000);
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
                return BG(0, 0, 1) + '   ' + fg(5, 5, 5) + '○◔◑◕'[parseInt(sec / 15)] + ' ';
            } else if (mn < 60) {
                return BG(0, 0, 1) + '  ' + fg(3, 3, 5) + '○◔◑◕'[parseInt(mn / 15)] + fg(0, 0, 3) + '◌ ';
            } else {
                return BG(0, 0, 1) + ' ' + fg(2, 2, 5) + '○◔◑◕'[parseInt(hr / 3)] + fg(0, 0, 3) + '◌◌ ';
            }
        } else {
            dy = parseInt(Math.round(sec / (24 * 3600)));
            wk = parseInt(Math.round(sec / (7 * 24 * 3600)));
            mt = parseInt(Math.round(sec / (30 * 24 * 3600)));
            yr = parseInt(Math.round(sec / (365 * 24 * 3600)));
            if (dy < 10) {
                return BG(0, 0, 1) + fg(0, 0, 5) + (" " + dy + " \uf185 ");
            } else if (wk < 5) {
                return BG(0, 0, 1) + fg(0, 0, 4) + (" " + wk + " \uf186 ");
            } else if (mt < 10) {
                return BG(0, 0, 1) + fg(0, 0, 3) + (" " + mt + " \uf455 ");
            } else {
                return BG(0, 0, 1) + fg(0, 0, 3) + (" " + (rpad(yr, 2)) + "\uf6e6 ");
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

inodeString = function(stat) {
    return lpad(stat.ino, 8) + ' ' + lpad(stat.nlink, 3);
};

getPrefix = function(stat, depth) {
    var s;
    s = '';
    if (args.inodeInfos) {
        s += inodeString(stat);
        s += " ";
    }
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
        s += reset;
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

listFiles = function(p, dirents, depth) {
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
        dirents.forEach(function(de) {
            var file, gl, ol, rp, stat;
            rp = de.name;
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
    dirents.forEach(function(de) {
        var err, ext, file, link, lstat, name, rp, s, stat, target;
        rp = de.name;
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
            if (link && os.platform() === 'win32') {
                if (slash.tilde(file)[0] === '~') {
                    try {
                        target = slash.tilde(fs.readlinkSync(file));
                        if (target.startsWith('~/AppData')) {
                            return;
                        }
                        if (target === '~/Documents') {
                            return;
                        }
                    } catch (error1) {
                        err = error1;
                        true;
                    }
                }
            }
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

listDir = function(de, opt) {
    var alldirents, depth, dirents, doRecurse, err, j, len, msg, p, pn, ps, ref1, results, rs, s, sp;
    if (opt == null) {
        opt = {};
    }
    p = de.name;
    if (slash.isRelative(p) && opt.parent) {
        p = slash.join(opt.parent, p);
    }
    if (args.recurse) {
        depth = pathDepth(p, opt);
        if (depth > args.depth) {
            return;
        }
    }
    ps = p;
    try {
        alldirents = fs.readdirSync(p, {
            withFileTypes: true
        });
    } catch (error1) {
        err = error1;
        true;
    }
    if (args.find) {
        dirents = filter(alldirents, function(de) {
            return RegExp(args.find).test(de.name);
        });
    } else {
        dirents = alldirents;
    }
    if (args.find && !(dirents != null ? dirents.length : void 0)) {
        true;
    } else if (args.paths.length === 1 && args.paths[0] === '.' && !args.recurse) {
        console.log(reset);
    } else if (args.tree) {
        console.log(getPrefix(de.isDirectory(), depth - 1) + dirString(slash.base(ps), slash.ext(ps)) + reset);
    } else {
        s = colors['_arrow'] + " ▶ " + colors['_header'][0];
        ps = slash.tilde(slash.resolve(p));
        rs = slash.relative(ps, process.cwd());
        if (rs.length < ps.length) {
            ps = rs;
        }
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
    if (dirents != null ? dirents.length : void 0) {
        listFiles(p, dirents, depth);
    }
    if (args.recurse) {
        doRecurse = function(de) {
            var f, ref1;
            f = de.name;
            if (ref1 = slash.basename(f), indexOf.call(args.ignore, ref1) >= 0) {
                return false;
            }
            if (!args.all && slash.ext(f) === 'app') {
                return false;
            }
            if (!args.all && f[0] === '.') {
                return false;
            }
            if (!args.followSymLinks && de.isSymbolicLink()) {
                return false;
            }
            return de.isDirectory() || de.isSymbolicLink() && fs.statSync(slash.join(p, f)).isDirectory();
        };
        try {
            ref1 = filter(alldirents, doRecurse);
            results = [];
            for (j = 0, len = ref1.length; j < len; j++) {
                de = ref1[j];
                results.push(listDir(de, {
                    parent: p,
                    relativeTo: opt.relativeTo
                }));
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
    var base2, base3, dirstats, file, filestats, j, len, p, parent, pathstats;
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
    pathstats = pathstats.filter(function(f) {
        return f.length;
    });
    if (!pathstats.length) {
        process.exit(1);
    }
    filestats = pathstats.filter(function(f) {
        return !f[1].isDirectory();
    });
    if (filestats.length > 0) {
        console.log(reset);
        listFiles(process.cwd(), filestats.map(function(s) {
            var base2;
            if ((base2 = s[1]).name != null) {
                base2.name;
            } else {
                base2.name = s[0];
            }
            return s[1];
        }));
    }
    dirstats = pathstats.filter(function(f) {
        var ref1;
        return (ref1 = f[1]) != null ? ref1.isDirectory() : void 0;
    });
    for (j = 0, len = dirstats.length; j < len; j++) {
        p = dirstats[j];
        if (args.tree) {
            console.log('');
        }
        file = slash.file(p[0]);
        parent = slash.isRelative(p[0]) ? process.cwd() : slash.dir(p[0]);
        if ((base2 = p[1]).name != null) {
            base2.name;
        } else {
            base2.name = file;
        }
        listDir(p[1], {
            parent: parent,
            relativeTo: parent
        });
    }
    console.log("");
    if (args.info) {
        return console.log(BW(1) + " " + fw(8) + stats.num_dirs + (stats.hidden_dirs && fw(4) + "+" + fw(5) + stats.hidden_dirs || "") + fw(4) + " dirs " + fw(8) + stats.num_files + (stats.hidden_files && fw(4) + "+" + fw(5) + stats.hidden_files || "") + fw(4) + " files " + fw(8) + time((typeof (base3 = process.hrtime).bigint === "function" ? base3.bigint() : void 0) - startTime) + " " + reset);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItbHMuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJjb2xvci1scy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMGFBQUE7SUFBQTs7QUFRQSxTQUFBLGdFQUEwQixDQUFDOztBQUUzQixNQUF1QixPQUFBLENBQVEsTUFBUixDQUF2QixFQUFFLGVBQUYsRUFBUSxlQUFSLEVBQWM7O0FBQ2QsRUFBQSxHQUFTLE9BQUEsQ0FBUSxJQUFSOztBQUNULEVBQUEsR0FBUyxPQUFBLENBQVEsSUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0FBQ1QsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsaUJBQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUVULElBQUEsR0FBUTs7QUFDUixLQUFBLEdBQVE7O0FBRVIsSUFBQSxHQUFTOztBQUNULEtBQUEsR0FBUyxJQUFJLENBQUM7O0FBQ2QsRUFBQSxHQUFTLElBQUksQ0FBQyxFQUFFLENBQUM7O0FBQ2pCLEVBQUEsR0FBUyxJQUFJLENBQUMsRUFBRSxDQUFDOztBQUNqQixFQUFBLEdBQVMsU0FBQyxDQUFEO1dBQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFVLENBQUEsQ0FBQTtBQUF6Qjs7QUFDVCxFQUFBLEdBQVMsU0FBQyxDQUFEO1dBQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFVLENBQUEsQ0FBQTtBQUF6Qjs7QUFFVCxLQUFBLEdBQ0k7SUFBQSxRQUFBLEVBQWdCLENBQWhCO0lBQ0EsU0FBQSxFQUFnQixDQURoQjtJQUVBLFdBQUEsRUFBZ0IsQ0FGaEI7SUFHQSxZQUFBLEVBQWdCLENBSGhCO0lBSUEsY0FBQSxFQUFnQixDQUpoQjtJQUtBLGNBQUEsRUFBZ0IsQ0FMaEI7SUFNQSxXQUFBLEVBQWdCLEVBTmhCOzs7QUFjSixJQUFHLENBQUksTUFBTSxD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QTlCLENBaEJaO0lBaUJBLElBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBakJaO0lBa0JBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBbEJaO0lBbUJBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBbkJaO0lBb0JBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBcEJaO0lBcUJBLE1BQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBckJaO0lBc0JBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBdEJaO0lBdUJBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBdkJaO0lBd0JBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBeEJaO0lBeUJBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBekJaO0lBMEJBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBMUJaO0lBNEJBLFVBQUEsRUFBWSxDQUFPLEVBQUEsQ0FBRyxFQUFILENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsQ0FBbkIsRUFBOEIsRUFBQSxD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QUFLLENBQUMsSUFBWCxDQUFnQixHQUFoQjtBQUhDO0FBRFQsaUJBS1MsUUFMVDtnQkFNUSxJQUFBLEdBQU8sTUFBTSxDQUFDLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEdBQWxCO0FBRE47QUFMVDtnQkFRUSxJQUFBLEdBQU87b0JBQUEsS0FBQSxFQUFNLENBQUMsR0FBRCxDQUFOOztBQVJmO1FBU0EsUUFBQSxDQUFBO1FBRUEsR0FBQSxHQUFNO1FBQ04sTUFBQSxHQUFTLE9BQU8sQ0FBQztRQUNqQixPQUFPLENBQUMsR0FBUixHQUFjLFNBQUE7QUFDVixnQkFBQTtBQUFBLGlCQUFBLDJDQUFBOztnQkFBMEIsR0FBQSxJQUFPLE1BQUEsQ0FBTyxHQUFQO0FBQWpDO21CQUNBLEdBQUEsSUFBTztRQUZHO1FBSWQsSUFBQSxDQUFBO1FBRUEsT0FBTyxDQUFDLEdBQVIsR0FBYztlQUNkO0lBdEJTO0lBd0JiLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFdBNUJyQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgICAgMDAwICAgICAgIDAwMDAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgIDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAgICAwMDBcbiAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAgICAgIDAwMDAwMDAgIDAwMDAwMDBcbiMjI1xuXG5zdGFydFRpbWUgPSBwcm9jZXNzLmhydGltZS5iaWdpbnQ/KClcblxueyBscGFkLCBycGFkLCB0aW1lIH0gPSByZXF1aXJlICdrc3RyJ1xub3MgICAgID0gcmVxdWlyZSAnb3MnXG5mcyAgICAgPSByZXF1aXJlICdmcydcbnNsYXNoICA9IHJlcXVpcmUgJ2tzbGFzaCdcbmZpbHRlciA9IHJlcXVpcmUgJ2xvZGFzaC5maWx0ZXInXG5hbnNpICAgPSByZXF1aXJlICdhbnNpLTI1Ni1jb2xvcnMnXG51dGlsICAgPSByZXF1aXJlICd1dGlsJ1xuXG5hcmdzICA9IG51bGxcbnRva2VuID0ge31cblxuYm9sZCAgID0gJ1xceDFiWzFtJ1xucmVzZXQgID0gYW5zaS5yZXNldFxuZmcgICAgID0gYW5zaS5mZy5nZXRSZ2JcbkJHICAgICA9IGFuc2kuYmcuZ2V0UmdiXG5mdyAgICAgPSAoaSkgLT4gYW5zaS5mZy5ncmF5c2NhbGVbaV1cbkJXICAgICA9IChpKSAtPiBhbnNpLmJnLmdyYXlzY2FsZVtpXVxuXG5zdGF0cyA9ICMgY291bnRlcnMgZm9yIChoaWRkZW4pIGRpcnMvZmlsZXNcbiAgICBudW1fZGlyczogICAgICAgMFxuICAgIG51bV9maWxlczogICAgICAwXG4gICAgaGlkZGVuX2RpcnM6ICAgIDBcbiAgICBoaWRkZW5fZmlsZXM6ICAgMFxuICAgIG1heE93bmVyTGVuZ3RoOiAwXG4gICAgbWF4R3JvdXBMZW5ndGg6IDBcbiAgICBicm9rZW5MaW5rczogICAgW11cblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDBcbiMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgMDAwMCAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbmlmIG5vdCBtb2R1bGUucGFyZW50IG9yIG1vZHVsZS5wYXJlbnQuaWQgPT0gJy4nXG5cbiAgICBrYXJnID0gcmVxdWlyZSAna2FyZydcbiAgICBhcmdzID0ga2FyZyBcIlwiXCJcbiAgICBjb2xvci1sc1xuICAgICAgICBwYXRocyAgICAgICAgICAgLiA/IHRoZSBmaWxlKHMpIGFuZC9vciBmb2xkZXIocykgdG8gZGlzcGxheSAuICoqXG4gICAgICAgIGFsbCAgICAgICAgICAgICAuID8gc2hvdyBkb3QgZmlsZXMgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgZGlycyAgICAgICAgICAgIC4gPyBzaG93IG9ubHkgZGlycyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBmaWxlcyAgICAgICAgICAgLiA/IHNob3cgb25seSBmaWxlcyAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGJ5dGVzICAgICAgICAgICAuID8gaW5jbHVkZSBzaXplICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgbWRhdGUgICAgICAgICAgIC4gPyBpbmNsdWRlIG1vZGlmaWNhdGlvbiBkYXRlICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBsb25nICAgICAgICAgICAgLiA/IGluY2x1ZGUgc2l6ZSBhbmQgZGF0ZSAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIG93bmVyICAgICAgICAgICAuID8gaW5jbHVkZSBvd25lciBhbmQgZ3JvdXAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgcmlnaHRzICAgICAgICAgIC4gPyBpbmNsdWRlIHJpZ2h0cyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBzaXplICAgICAgICAgICAgLiA/IHNvcnQgYnkgc2l6ZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHRpbWUgICAgICAgICAgICAuID8gc29ydCBieSB0aW1lICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAga2luZCAgICAgICAgICAgIC4gPyBzb3J0IGJ5IGtpbmQgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBuZXJkeSAgICAgICAgICAgLiA/IHVzZSBuZXJkIGZvbnQgaWNvbnMgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHByZXR0eSAgICAgICAgICAuID8gcHJldHR5IHNpemUgYW5kIGFnZSAgICAgICAgICAgICAuID0gdHJ1ZVxuICAgICAgICBpZ25vcmUgICAgICAgICAgLiA/IGRvbid0IHJlY3Vyc2UgaW50byAgICAgICAgICAgICAgLiA9IG5vZGVfbW9kdWxlcyAuZ2l0XG4gICAgICAgIGluZm8gICAgICAgICAgICAuID8gc2hvdyBzdGF0aXN0aWNzICAgICAgICAgICAgICAgICAuID0gZmFsc2UgLiAtIElcbiAgICAgICAgYWxwaGFiZXRpY2FsICAgIC4gPyBkb24ndCBncm91cCBkaXJzIGJlZm9yZSBmaWxlcyAgIC4gPSBmYWxzZSAuIC0gQVxuICAgICAgICBvZmZzZXQgICAgICAgICAgLiA/IGluZGVudCBzaG9ydCBsaXN0aW5ncyAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBPXG4gICAgICAgIHJlY3Vyc2UgICAgICAgICAuID8gcmVjdXJzZSBpbnRvIHN1YmRpcnMgICAgICAgICAgICAuID0gZmFsc2UgLiAtIFJcbiAgICAgICAgdHJlZSAgICAgICAgICAgIC4gPyByZWN1cnNlIGFuZCBpbmRlbnQgICAgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gVFxuICAgICAgICBmb2xsb3dTeW1MaW5rcyAgLiA/IHJlY3Vyc2UgZm9sbG93cyBzeW1saW5rcyAgICAgICAgLiA9IGZhbHNlIC4gLSBTIFxuICAgICAgICBkZXB0aCAgICAgICAgICAgLiA/IHJlY3Vyc2lvbiBkZXB0aCAgICAgICAgICAgICAgICAgLiA9IOKIniAgICAgLiAtIERcbiAgICAgICAgZmluZCAgICAgICAgICAgIC4gPyBmaWx0ZXIgd2l0aCBhIHJlZ2V4cCAgICAgICAgICAgIC4gLSBGXG4gICAgICAgIGRlYnVnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgLiAtIFhcbiAgICAgICAgaW5vZGVJbmZvcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gTiBcbiAgICBcbiAgICB2ZXJzaW9uICAgICAgI3tyZXF1aXJlKFwiI3tfX2Rpcm5hbWV9Ly4uL3BhY2thZ2UuanNvblwiKS52ZXJzaW9ufVxuICAgIFwiXCJcIlxuICAgIFxuaW5pdEFyZ3MgPSAtPlxuICAgICAgICBcbiAgICBpZiBhcmdzLnNpemVcbiAgICAgICAgYXJncy5maWxlcyA9IHRydWVcbiAgICBcbiAgICBpZiBhcmdzLmxvbmdcbiAgICAgICAgYXJncy5ieXRlcyA9IHRydWVcbiAgICAgICAgYXJncy5tZGF0ZSA9IHRydWVcbiAgICAgICAgXG4gICAgaWYgYXJncy50cmVlXG4gICAgICAgIGFyZ3MucmVjdXJzZSA9IHRydWVcbiAgICAgICAgYXJncy5vZmZzZXQgID0gZmFsc2VcbiAgICBcbiAgICBpZiBhcmdzLmRpcnMgYW5kIGFyZ3MuZmlsZXNcbiAgICAgICAgYXJncy5kaXJzID0gYXJncy5maWxlcyA9IGZhbHNlXG4gICAgICAgIFxuICAgIGlmIGFyZ3MuaWdub3JlPy5sZW5ndGhcbiAgICAgICAgYXJncy5pZ25vcmUgPSBhcmdzLmlnbm9yZS5zcGxpdCAnICcgXG4gICAgZWxzZVxuICAgICAgICBhcmdzLmlnbm9yZSA9IFtdXG4gICAgICAgIFxuICAgIGlmIGFyZ3MuZGVwdGggPT0gJ+KInicgdGhlbiBhcmdzLmRlcHRoID0gSW5maW5pdHlcbiAgICBlbHNlIGFyZ3MuZGVwdGggPSBNYXRoLm1heCAwLCBwYXJzZUludCBhcmdzLmRlcHRoXG4gICAgaWYgTnVtYmVyLmlzTmFOIGFyZ3MuZGVwdGggdGhlbiBhcmdzLmRlcHRoID0gMFxuICAgICAgICBcbiAgICBpZiBhcmdzLmRlYnVnXG4gICAgICAgIG5vb24gPSByZXF1aXJlICdub29uJ1xuICAgICAgICBsb2cgbm9vbi5zdHJpbmdpZnkgYXJncywgY29sb3JzOnRydWVcbiAgICBcbiAgICBhcmdzLnBhdGhzID0gWycuJ10gdW5sZXNzIGFyZ3MucGF0aHM/Lmxlbmd0aCA+IDBcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuY29sb3JzID1cbiAgICAnY29mZmVlJzogICBbIGJvbGQrZmcoNCw0LDApLCAgZmcoMSwxLDApLCBmZygyLDIsMCkgXVxuICAgICdrb2ZmZWUnOiAgIFsgYm9sZCtmZyg1LDUsMCksICBmZygxLDAsMCksIGZnKDMsMSwwKSBdXG4gICAgJ3B5JzogICAgICAgWyBib2xkK2ZnKDAsMywwKSwgIGZnKDAsMSwwKSwgZmcoMCwyLDApIF1cbiAgICAncmInOiAgICAgICBbIGJvbGQrZmcoNCwwLDApLCAgZmcoMSwwLDApLCBmZygyLDAsMCkgXVxuICAgICdqc29uJzogICAgIFsgYm9sZCtmZyg0LDAsNCksICBmZygxLDAsMSksIGZnKDIsMCwxKSBdXG4gICAgJ2Nzb24nOiAgICAgWyBib2xkK2ZnKDQsMCw0KSwgIGZnKDEsMCwxKSwgZmcoMiwwLDIpIF1cbiAgICAnbm9vbic6ICAgICBbIGJvbGQrZmcoNCw0LDApLCAgZmcoMSwxLDApLCBmZygyLDIsMCkgXVxuICAgICdwbGlzdCc6ICAgIFsgYm9sZCtmZyg0LDAsNCksICBmZygxLDAsMSksIGZnKDIsMCwyKSBdXG4gICAgJ2pzJzogICAgICAgWyBib2xkK2ZnKDUsMCw1KSwgIGZnKDIsMCwyKSwgZmcoMywwLDMpIF1cbiAgICAnY3BwJzogICAgICBbIGJvbGQrZmcoNSw0LDApLCAgZncoMyksICAgICBmZygzLDIsMCkgXVxuICAgICdoJzogICAgICAgIFsgICAgICBmZygzLDEsMCksICBmdygzKSwgICAgIGZnKDIsMSwwKSBdXG4gICAgJ3B5Yyc6ICAgICAgWyAgICAgIGZ3KDUpLCAgICAgIGZ3KDMpLCAgICAgZncoNCkgXVxuICAgICdsb2cnOiAgICAgIFsgICAgICBmdyg1KSwgICAgICBmdygyKSwgICAgIGZ3KDMpIF1cbiAgICAnbG9nJzogICAgICBbICAgICAgZncoNSksICAgICAgZncoMiksICAgICBmdygzKSBdXG4gICAgJ3R4dCc6ICAgICAgWyAgICAgIGZ3KDIwKSwgICAgIGZ3KDMpLCAgICAgZncoNCkgXVxuICAgICdtZCc6ICAgICAgIFsgYm9sZCtmdygyMCksICAgICBmdygzKSwgICAgIGZ3KDQpIF1cbiAgICAnbWFya2Rvd24nOiBbIGJvbGQrZncoMjApLCAgICAgZncoMyksICAgICBmdyg0KSBdXG4gICAgJ3NoJzogICAgICAgWyBib2xkK2ZnKDUsMSwwKSwgIGZnKDIsMCwwKSwgZmcoMywwLDApIF1cbiAgICAncG5nJzogICAgICBbIGJvbGQrZmcoNSwwLDApLCAgZmcoMiwwLDApLCBmZygzLDAsMCkgXVxuICAgICdqcGcnOiAgICAgIFsgYm9sZCtmZygwLDMsMCksICBmZygwLDIsMCksIGZnKDAsMiwwKSBdXG4gICAgJ3B4bSc6ICAgICAgWyBib2xkK2ZnKDEsMSw1KSwgIGZnKDAsMCwyKSwgZmcoMCwwLDQpIF1cbiAgICAndGlmZic6ICAgICBbIGJvbGQrZmcoMSwxLDUpLCAgZmcoMCwwLDMpLCBmZygwLDAsNCkgXVxuICAgICd0Z3onOiAgICAgIFsgYm9sZCtmZygwLDMsNCksICBmZygwLDEsMiksIGZnKDAsMiwzKSBdXG4gICAgJ3BrZyc6ICAgICAgWyBib2xkK2ZnKDAsMyw0KSwgIGZnKDAsMSwyKSwgZmcoMCwyLDMpIF1cbiAgICAnemlwJzogICAgICBbIGJvbGQrZmcoMCwzLDQpLCAgZmcoMCwxLDIpLCBmZygwLDIsMykgXVxuICAgICdkbWcnOiAgICAgIFsgYm9sZCtmZygxLDQsNCksICBmZygwLDIsMiksIGZnKDAsMywzKSBdXG4gICAgJ3R0Zic6ICAgICAgWyBib2xkK2ZnKDIsMSwzKSwgIGZnKDEsMCwyKSwgZmcoMSwwLDIpIF1cblxuICAgICdfZGVmYXVsdCc6IFsgICAgICBmdygxNSksICAgICBmdyg0KSwgICAgIGZ3KDEwKSBdXG4gICAgJ19kaXInOiAgICAgWyBib2xkK0JHKDAsMCwyKStmdygyMyksIGZnKDEsMSw1KSwgYm9sZCtCRygwLDAsMikrZmcoMiwyLDUpIF1cbiAgICAnXy5kaXInOiAgICBbIGJvbGQrQkcoMCwwLDEpK2Z3KDIzKSwgYm9sZCtCRygwLDAsMSkrZmcoMSwxLDUpLCBib2xkK0JHKDAsMCwxKStmZygyLDIsNSkgXVxuICAgICdfbGluayc6ICAgIHsgJ2Fycm93JzogZmcoMSwwLDEpLCAncGF0aCc6IGZnKDQsMCw0KSwgJ2Jyb2tlbic6IEJHKDUsMCwwKStmZyg1LDUsMCkgfVxuICAgICdfYXJyb3cnOiAgICAgQlcoMikrZncoMClcbiAgICAnX2hlYWRlcic6ICBbIGJvbGQrQlcoMikrZmcoMywyLDApLCAgZncoNCksIGJvbGQrQlcoMikrZmcoNSw1LDApIF1cbiAgICAnX3NpemUnOiAgICB7IGI6IFtmZygwLDAsMyksIGZnKDAsMCwyKV0sIGtCOiBbZmcoMCwwLDUpLCBmZygwLDAsMyldLCBNQjogW2ZnKDEsMSw1KSwgZmcoMCwwLDQpXSwgR0I6IFtmZyg0LDQsNSksIGZnKDIsMiw1KV0sIFRCOiBbZmcoNCw0LDUpLCBmZygyLDIsNSldIH1cbiAgICAnX3VzZXJzJzogICB7IHJvb3Q6ICBmZygzLDAsMCksIGRlZmF1bHQ6IGZnKDEsMCwxKSB9XG4gICAgJ19ncm91cHMnOiAgeyB3aGVlbDogZmcoMSwwLDApLCBzdGFmZjogZmcoMCwxLDApLCBhZG1pbjogZmcoMSwxLDApLCBkZWZhdWx0OiBmZygxLDAsMSkgfVxuICAgICdfZXJyb3InOiAgIFsgYm9sZCtCRyg1LDAsMCkrZmcoNSw1LDApLCBib2xkK0JHKDUsMCwwKStmZyg1LDUsNSkgXVxuICAgICdfcmlnaHRzJzpcbiAgICAgICAgICAgICAgICAgICdyKyc6IGJvbGQrQlcoMSkrZncoNilcbiAgICAgICAgICAgICAgICAgICdyLSc6IHJlc2V0K0JXKDEpK2Z3KDIpXG4gICAgICAgICAgICAgICAgICAndysnOiBib2xkK0JXKDEpK2ZnKDIsMiw1KVxuICAgICAgICAgICAgICAgICAgJ3ctJzogcmVzZXQrQlcoMSkrZncoMilcbiAgICAgICAgICAgICAgICAgICd4Kyc6IGJvbGQrQlcoMSkrZmcoNSwwLDApXG4gICAgICAgICAgICAgICAgICAneC0nOiByZXNldCtCVygxKStmdygyKVxuXG51c2VyTWFwID0ge31cbnVzZXJuYW1lID0gKHVpZCkgLT5cbiAgICBpZiBub3QgdXNlck1hcFt1aWRdXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgY2hpbGRwID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbiAgICAgICAgICAgIHVzZXJNYXBbdWlkXSA9IGNoaWxkcC5zcGF3blN5bmMoXCJpZFwiLCBbXCItdW5cIiwgXCIje3VpZH1cIl0pLnN0ZG91dC50b1N0cmluZygndXRmOCcpLnRyaW0oKVxuICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICBsb2cgZVxuICAgIHVzZXJNYXBbdWlkXVxuXG5ncm91cE1hcCA9IG51bGxcbmdyb3VwbmFtZSA9IChnaWQpIC0+XG4gICAgaWYgbm90IGdyb3VwTWFwXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgY2hpbGRwID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbiAgICAgICAgICAgIGdpZHMgPSBjaGlsZHAuc3Bhd25TeW5jKFwiaWRcIiwgW1wiLUdcIl0pLnN0ZG91dC50b1N0cmluZygndXRmOCcpLnNwbGl0KCcgJylcbiAgICAgICAgICAgIGdubXMgPSBjaGlsZHAuc3Bhd25TeW5jKFwiaWRcIiwgW1wiLUduXCJdKS5zdGRvdXQudG9TdHJpbmcoJ3V0ZjgnKS5zcGxpdCgnICcpXG4gICAgICAgICAgICBncm91cE1hcCA9IHt9XG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uLmdpZHMubGVuZ3RoXVxuICAgICAgICAgICAgICAgIGdyb3VwTWFwW2dpZHNbaV1dID0gZ25tc1tpXVxuICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICBsb2cgZVxuICAgIGdyb3VwTWFwW2dpZF1cblxuaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgcHJvY2Vzcy5nZXR1aWRcbiAgICBjb2xvcnNbJ191c2VycyddW3VzZXJuYW1lKHByb2Nlc3MuZ2V0dWlkKCkpXSA9IGZnKDAsNCwwKVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbmxvZ19lcnJvciA9ICgpIC0+XG4gICAgXG4gICAgbG9nIFwiIFwiICsgY29sb3JzWydfZXJyb3InXVswXSArIFwiIFwiICsgYm9sZCArIGFyZ3VtZW50c1swXSArIChhcmd1bWVudHMubGVuZ3RoID4gMSBhbmQgKGNvbG9yc1snX2Vycm9yJ11bMV0gKyBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykuc2xpY2UoMSkuam9pbignICcpKSBvciAnJykgKyBcIiBcIiArIHJlc2V0XG5cbmxpbmtTdHJpbmcgPSAoZmlsZSkgLT4gXG4gICAgXG4gICAgcyAgPSByZXNldCArIGZ3KDEpICsgY29sb3JzWydfbGluayddWydhcnJvdyddICsgXCIg4pa6IFwiIFxuICAgIHMgKz0gY29sb3JzWydfbGluayddWyhmaWxlIGluIHN0YXRzLmJyb2tlbkxpbmtzKSBhbmQgJ2Jyb2tlbicgb3IgJ3BhdGgnXSBcbiAgICB0cnlcbiAgICAgICAgcyArPSBzbGFzaC50aWxkZSBmcy5yZWFkbGlua1N5bmMoZmlsZSlcbiAgICBjYXRjaCBlcnJcbiAgICAgICAgcyArPSAnID8gJ1xuICAgIHNcblxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgXG4jIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwIDAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcblxubmFtZVN0cmluZyA9IChuYW1lLCBleHQpIC0+IFxuICAgIFxuICAgIGlmIGFyZ3MubmVyZHkgICAgICAgIFxuICAgICAgICBpY29ucyA9IHJlcXVpcmUgJy4vaWNvbnMnXG4gICAgICAgIGljb24gPSAoY29sb3JzW2NvbG9yc1tleHRdPyBhbmQgZXh0IG9yICdfZGVmYXVsdCddWzJdICsgKGljb25zLmdldChuYW1lLCBleHQpID8gJyAnKSkgKyAnICdcbiAgICBlbHNlXG4gICAgICAgIGljb24gPSAnJ1xuICAgIFwiIFwiICsgaWNvbiArIGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVswXSArIG5hbWUgKyByZXNldFxuICAgIFxuZG90U3RyaW5nICA9IChleHQpIC0+IFxuICAgIFxuICAgIGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVsxXSArIFwiLlwiICsgcmVzZXRcbiAgICBcbmV4dFN0cmluZyAgPSAobmFtZSwgZXh0KSAtPiBcbiAgICBcbiAgICBpZiBhcmdzLm5lcmR5IGFuZCBuYW1lIFxuICAgICAgICBpY29ucyA9IHJlcXVpcmUgJy4vaWNvbnMnXG4gICAgICAgIGlmIGljb25zLmdldChuYW1lLCBleHQpIHRoZW4gcmV0dXJuICcnXG4gICAgZG90U3RyaW5nKGV4dCkgKyBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMV0gKyBleHQgKyByZXNldFxuICAgIFxuZGlyU3RyaW5nICA9IChuYW1lLCBleHQpIC0+XG4gICAgXG4gICAgYyA9IG5hbWUgYW5kICdfZGlyJyBvciAnXy5kaXInXG4gICAgaWNvbiA9IGFyZ3MubmVyZHkgYW5kIGNvbG9yc1tjXVsyXSArICcgXFx1ZjQxMycgb3IgJydcbiAgICBpY29uICsgY29sb3JzW2NdWzBdICsgKG5hbWUgYW5kIChcIiBcIiArIG5hbWUpIG9yIFwiIFwiKSArIChpZiBleHQgdGhlbiBjb2xvcnNbY11bMV0gKyAnLicgKyBjb2xvcnNbY11bMl0gKyBleHQgZWxzZSBcIlwiKSArIFwiIFwiXG5cbiMgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnNpemVTdHJpbmcgPSAoc3RhdCkgLT5cblxuICAgIGlmIGFyZ3MubmVyZHkgYW5kIGFyZ3MucHJldHR5XG5cbiAgICAgICAgYmFyID0gKG4pIC0+XG4gICAgICAgICAgICBiID0gJ+KWj+KWjuKWjeKWjOKWi+KWiuKWiSdcbiAgICAgICAgICAgIGJbTWF0aC5mbG9vciBuLygxMDAwLzcpXSAgXG4gICAgICAgIFxuICAgICAgICBpZiBzdGF0LnNpemUgPT0gMFxuICAgICAgICAgICAgcmV0dXJuIHJwYWQgJycsIDhcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDBcbiAgICAgICAgICAgIHJldHVybiBjb2xvcnNbJ19zaXplJ11bJ2InXVsxXSArIHJwYWQgYmFyKHN0YXQuc2l6ZSksIDhcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDAwXG4gICAgICAgICAgICByZXR1cm4gZmcoMCwwLDIpICsgJ+KWiCcgKyBycGFkIGJhcihzdGF0LnNpemUvMTApLCA3XG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMDBcbiAgICAgICAgICAgIHJldHVybiBmZygwLDAsMikgKyAn4paI4paIJyArIHJwYWQgYmFyKHN0YXQuc2l6ZS8xMDApLCA2XG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMDAwXG4gICAgICAgICAgICByZXR1cm4gZmcoMCwwLDMpICsgJ+KWiOKWiOKWiCcgKyBycGFkIGJhcihzdGF0LnNpemUvMTAwMCksIDVcbiAgICAgICAgICAgIFxuICAgICAgICBtYiA9IHBhcnNlSW50IHN0YXQuc2l6ZSAvIDEwMDAwMDBcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDAwMDAwXG4gICAgICAgICAgICByZXR1cm4gZmcoMCwwLDIpICsgJ+KWiOKWiOKWiCcgKyBmZygwLDAsMykgKyAn4paIJyAgICsgZmcoMCwwLDMpICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMDAwKSwgNFxuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMDAwMDAwXG4gICAgICAgICAgICByZXR1cm4gZmcoMCwwLDIpICsgJ+KWiOKWiOKWiCcgKyBmZygwLDAsMykgKyAn4paI4paIJyAgKyBmZygwLDAsMykgKyBycGFkIGJhcihzdGF0LnNpemUvMTAwMDAwKSwgM1xuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGZnKDAsMCwyKSArICfilojilojilognICsgZmcoMCwwLDMpICsgJ+KWiOKWiOKWiCcgKyBmZygwLDAsNCkgKyBycGFkIGJhcihzdGF0LnNpemUvMTAwMDAwMCksIDJcbiAgICAgICAgZ2IgPSBwYXJzZUludCBtYiAvIDEwMDBcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDAwMDAwMDAwXG4gICAgICAgICAgICByZXR1cm4gZmcoMCwwLDIpICsgJ+KWiOKWiOKWiCcgKyBmZygwLDAsMykgKyAn4paI4paI4paIJyArIGZnKDAsMCw0KSArICfilognICsgZmcoMCwwLDQpICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMDAwMDAwKSwgMVxuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMDAwMDAwMDAwXG4gICAgICAgICAgICByZXR1cm4gZmcoMCwwLDIpICsgJ+KWiOKWiOKWiCcgKyBmZygwLDAsMykgKyAn4paI4paI4paIJyArIGZnKDAsMCw0KSArICfilojilognICsgZmcoMCwwLDQpICsgYmFyKHN0YXQuc2l6ZS8xMDAwMDAwMDApXG4gICAgICAgIFxuICAgIGlmIGFyZ3MucHJldHR5IGFuZCBzdGF0LnNpemUgPT0gMFxuICAgICAgICByZXR1cm4gbHBhZCgnICcsIDExKVxuICAgIGlmIHN0YXQuc2l6ZSA8IDEwMDBcbiAgICAgICAgY29sb3JzWydfc2l6ZSddWydiJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlIGlmIHN0YXQuc2l6ZSA8IDEwMDAwMDBcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsna0InXVswXSArIGxwYWQoKHN0YXQuc2l6ZSAvIDEwMDApLnRvRml4ZWQoMCksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ2tCJ11bMV0gKyBcImtCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsna0InXVswXSArIGxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2UgaWYgc3RhdC5zaXplIDwgMTAwMDAwMDAwMFxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydNQiddWzBdICsgbHBhZCgoc3RhdC5zaXplIC8gMTAwMDAwMCkudG9GaXhlZCgxKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsnTUInXVsxXSArIFwiTUIgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydNQiddWzBdICsgbHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZSBpZiBzdGF0LnNpemUgPCAxMDAwMDAwMDAwMDAwXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMF0gKyBscGFkKChzdGF0LnNpemUgLyAxMDAwMDAwMDAwKS50b0ZpeGVkKDEpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydHQiddWzFdICsgXCJHQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMF0gKyBscGFkKChzdGF0LnNpemUgLyAxMDAwMDAwMDAwMDAwKS50b0ZpeGVkKDMpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydUQiddWzFdICsgXCJUQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcblxuIyAwMDAwMDAwMDAgIDAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuIyAgICAwMDAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcblxudGltZVN0cmluZyA9IChzdGF0KSAtPlxuICAgIFxuICAgIGlmIGFyZ3MubmVyZHkgYW5kIGFyZ3MucHJldHR5XG4gICAgICAgIHNlYyA9IHBhcnNlSW50IChEYXRlLm5vdygpLXN0YXQubXRpbWVNcykvMTAwMFxuICAgICAgICBtbiAgPSBwYXJzZUludCBzZWMvNjBcbiAgICAgICAgaHIgID0gcGFyc2VJbnQgc2VjLzM2MDBcbiAgICAgICAgaWYgaHIgPCAxMlxuICAgICAgICAgICAgaWYgc2VjIDwgNjBcbiAgICAgICAgICAgICAgICByZXR1cm4gQkcoMCwwLDEpICsgJyAgICcgKyBmZyg1LDUsNSkgKyAn4peL4peU4peR4peVJ1twYXJzZUludCBzZWMvMTVdICsgJyAnIFxuICAgICAgICAgICAgZWxzZSBpZiBtbiA8IDYwXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArICcgICcgKyBmZygzLDMsNSkgKyAn4peL4peU4peR4peVJ1twYXJzZUludCBtbi8xNV0gKyBmZygwLDAsMykgKyAn4peMICdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gQkcoMCwwLDEpICsgJyAnICsgZmcoMiwyLDUpICsgJ+KXi+KXlOKXkeKXlSdbcGFyc2VJbnQgaHIvM10gKyBmZygwLDAsMykgKyAn4peM4peMICdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZHkgPSBwYXJzZUludCBNYXRoLnJvdW5kIHNlYy8oMjQqMzYwMClcbiAgICAgICAgICAgIHdrID0gcGFyc2VJbnQgTWF0aC5yb3VuZCBzZWMvKDcqMjQqMzYwMClcbiAgICAgICAgICAgIG10ID0gcGFyc2VJbnQgTWF0aC5yb3VuZCBzZWMvKDMwKjI0KjM2MDApXG4gICAgICAgICAgICB5ciA9IHBhcnNlSW50IE1hdGgucm91bmQgc2VjLygzNjUqMjQqMzYwMClcbiAgICAgICAgICAgIGlmIGR5IDwgMTBcbiAgICAgICAgICAgICAgICByZXR1cm4gQkcoMCwwLDEpICsgZmcoMCwwLDUpICsgXCIgI3tkeX0gXFx1ZjE4NSBcIlxuICAgICAgICAgICAgZWxzZSBpZiB3ayA8IDVcbiAgICAgICAgICAgICAgICByZXR1cm4gQkcoMCwwLDEpICsgZmcoMCwwLDQpICsgXCIgI3t3a30gXFx1ZjE4NiBcIlxuICAgICAgICAgICAgZWxzZSBpZiBtdCA8IDEwXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArIGZnKDAsMCwzKSArIFwiICN7bXR9IFxcdWY0NTUgXCJcbiAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArIGZnKDAsMCwzKSArIFwiICN7cnBhZCB5ciwgMn1cXHVmNmU2IFwiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgIG1vbWVudCA9IHJlcXVpcmUgJ21vbWVudCdcbiAgICB0ID0gbW9tZW50IHN0YXQubXRpbWVcbiAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICBhZ2UgPSBtb21lbnQoKS50byh0LCB0cnVlKVxuICAgICAgICBbbnVtLCByYW5nZV0gPSBhZ2Uuc3BsaXQgJyAnXG4gICAgICAgIG51bSA9ICcxJyBpZiBudW1bMF0gPT0gJ2EnXG4gICAgICAgIGlmIHJhbmdlID09ICdmZXcnXG4gICAgICAgICAgICBudW0gPSBtb21lbnQoKS5kaWZmIHQsICdzZWNvbmRzJ1xuICAgICAgICAgICAgcmFuZ2UgPSAnc2Vjb25kcydcbiAgICAgICAgICAgIGZ3KDIzKSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDE2KSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2UgaWYgcmFuZ2Uuc3RhcnRzV2l0aCAneWVhcidcbiAgICAgICAgICAgIGZ3KDYpICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoMykgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ21vbnRoJ1xuICAgICAgICAgICAgZncoOCkgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdyg0KSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2UgaWYgcmFuZ2Uuc3RhcnRzV2l0aCAnZGF5J1xuICAgICAgICAgICAgZncoMTApICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoNikgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ2hvdXInXG4gICAgICAgICAgICBmdygxNSkgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdyg4KSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZ3KDE4KSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDEyKSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgZWxzZVxuICAgICAgICBmdygxNikgKyBscGFkKHQuZm9ybWF0KFwiRERcIiksMikgKyBmdyg3KSsnLicgK1xuICAgICAgICBmdygxMikgKyB0LmZvcm1hdChcIk1NXCIpICsgZncoNykrXCIuXCIgK1xuICAgICAgICBmdyggOCkgKyB0LmZvcm1hdChcIllZXCIpICsgJyAnICtcbiAgICAgICAgZncoMTYpICsgdC5mb3JtYXQoXCJISFwiKSArIGNvbCA9IGZ3KDcpKyc6JyArXG4gICAgICAgIGZ3KDE0KSArIHQuZm9ybWF0KFwibW1cIikgKyBjb2wgPSBmdygxKSsnOicgK1xuICAgICAgICBmdyggNCkgKyB0LmZvcm1hdChcInNzXCIpICsgJyAnXG5cbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5vd25lck5hbWUgPSAoc3RhdCkgLT5cbiAgICBcbiAgICB0cnlcbiAgICAgICAgdXNlcm5hbWUgc3RhdC51aWRcbiAgICBjYXRjaFxuICAgICAgICBzdGF0LnVpZFxuXG5ncm91cE5hbWUgPSAoc3RhdCkgLT5cbiAgICBcbiAgICB0cnlcbiAgICAgICAgZ3JvdXBuYW1lIHN0YXQuZ2lkXG4gICAgY2F0Y2hcbiAgICAgICAgc3RhdC5naWRcblxub3duZXJTdHJpbmcgPSAoc3RhdCkgLT5cbiAgICBcbiAgICBvd24gPSBvd25lck5hbWUoc3RhdClcbiAgICBncnAgPSBncm91cE5hbWUoc3RhdClcbiAgICBvY2wgPSBjb2xvcnNbJ191c2VycyddW293bl1cbiAgICBvY2wgPSBjb2xvcnNbJ191c2VycyddWydkZWZhdWx0J10gdW5sZXNzIG9jbFxuICAgIGdjbCA9IGNvbG9yc1snX2dyb3VwcyddW2dycF1cbiAgICBnY2wgPSBjb2xvcnNbJ19ncm91cHMnXVsnZGVmYXVsdCddIHVubGVzcyBnY2xcbiAgICBvY2wgKyBycGFkKG93biwgc3RhdHMubWF4T3duZXJMZW5ndGgpICsgXCIgXCIgKyBnY2wgKyBycGFkKGdycCwgc3RhdHMubWF4R3JvdXBMZW5ndGgpXG5cbiMgMDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcblxucnd4U3RyaW5nID0gKHN0YXQsIGkpIC0+XG4gICAgXG4gICAgbW9kZSA9IHN0YXQubW9kZVxuICAgIFxuICAgIGlmIGFyZ3MubmVyZHlcbiAgICAgICAgciA9ICcgXFx1ZjQ0MSdcbiAgICAgICAgdyA9ICdcXHVmMDQwJ1xuICAgICAgICB4ID0gc3RhdC5pc0RpcmVjdG9yeSgpIGFuZCAnXFx1ZjA4NScgb3IgJ1xcdWYwMTMnXG4gICAgICAgIFxuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMTAwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3IrJ10gKyByIG9yIGNvbG9yc1snX3JpZ2h0cyddWydyLSddICsgcikgK1xuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDEwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3crJ10gKyB3IG9yIGNvbG9yc1snX3JpZ2h0cyddWyd3LSddICsgdykgK1xuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDAxKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3grJ10gKyB4IG9yIGNvbG9yc1snX3JpZ2h0cyddWyd4LSddICsgeClcbiAgICBlbHNlXG4gICAgICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIxMDApIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsncisnXSArICcgcicgb3IgY29sb3JzWydfcmlnaHRzJ11bJ3ItJ10gKyAnICAnKSArXG4gICAgICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIwMTApIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsndysnXSArICcgdycgb3IgY29sb3JzWydfcmlnaHRzJ11bJ3ctJ10gKyAnICAnKSArXG4gICAgICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIwMDEpIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsneCsnXSArICcgeCcgb3IgY29sb3JzWydfcmlnaHRzJ11bJ3gtJ10gKyAnICAnKVxuXG5yaWdodHNTdHJpbmcgPSAoc3RhdCkgLT5cbiAgICBcbiAgICB1ciA9IHJ3eFN0cmluZyhzdGF0LCAyKVxuICAgIGdyID0gcnd4U3RyaW5nKHN0YXQsIDEpXG4gICAgcm8gPSByd3hTdHJpbmcoc3RhdCwgMCkgKyBcIiBcIlxuICAgIHVyICsgZ3IgKyBybyArIHJlc2V0XG5cbmlub2RlU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgbHBhZChzdGF0LmlubywgOCkgKyAnICcgKyBscGFkKHN0YXQubmxpbmssIDMpXG4gICAgXG5nZXRQcmVmaXggPSAoc3RhdCwgZGVwdGgpIC0+XG4gICAgXG4gICAgcyA9ICcnXG4gICAgXG4gICAgaWYgYXJncy5pbm9kZUluZm9zXG4gICAgICAgIHMgKz0gaW5vZGVTdHJpbmcgc3RhdFxuICAgICAgICBzICs9IFwiIFwiXG4gICAgaWYgYXJncy5yaWdodHNcbiAgICAgICAgcyArPSByaWdodHNTdHJpbmcgc3RhdFxuICAgICAgICBzICs9IFwiIFwiXG4gICAgaWYgYXJncy5vd25lclxuICAgICAgICBzICs9IG93bmVyU3RyaW5nIHN0YXRcbiAgICAgICAgcyArPSBcIiBcIlxuICAgIGlmIGFyZ3MubWRhdGVcbiAgICAgICAgcyArPSB0aW1lU3RyaW5nIHN0YXRcbiAgICAgICAgcyArPSByZXNldFxuICAgIGlmIGFyZ3MuYnl0ZXNcbiAgICAgICAgcyArPSBzaXplU3RyaW5nIHN0YXRcbiAgICAgICAgXG4gICAgaWYgZGVwdGggYW5kIGFyZ3MudHJlZVxuICAgICAgICBzICs9IHJwYWQgJycsIGRlcHRoKjRcbiAgICAgICAgXG4gICAgaWYgcy5sZW5ndGggPT0gMCBhbmQgYXJncy5vZmZzZXRcbiAgICAgICAgcyArPSAnICAgICAgICdcbiAgICBzXG4gICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwXG4jICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbnNvcnQgPSAobGlzdCwgc3RhdHMsIGV4dHM9W10pIC0+XG4gICAgXG4gICAgXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbiAgICBtb21lbnQgPSByZXF1aXJlICdtb21lbnQnXG4gICAgXG4gICAgbCA9IF8uemlwIGxpc3QsIHN0YXRzLCBbMC4uLmxpc3QubGVuZ3RoXSwgKGV4dHMubGVuZ3RoID4gMCBhbmQgZXh0cyBvciBbMC4uLmxpc3QubGVuZ3RoXSlcbiAgICBcbiAgICBpZiBhcmdzLmtpbmRcbiAgICAgICAgaWYgZXh0cyA9PSBbXSB0aGVuIHJldHVybiBsaXN0XG4gICAgICAgIGwuc29ydCgoYSxiKSAtPlxuICAgICAgICAgICAgaWYgYVszXSA+IGJbM10gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgaWYgYVszXSA8IGJbM10gdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3MudGltZVxuICAgICAgICAgICAgICAgIG0gPSBtb21lbnQoYVsxXS5tdGltZSlcbiAgICAgICAgICAgICAgICBpZiBtLmlzQWZ0ZXIoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgICAgIGlmIG0uaXNCZWZvcmUoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3Muc2l6ZVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA+IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICBlbHNlIGlmIGFyZ3MudGltZVxuICAgICAgICBsLnNvcnQoKGEsYikgLT5cbiAgICAgICAgICAgIG0gPSBtb21lbnQoYVsxXS5tdGltZSlcbiAgICAgICAgICAgIGlmIG0uaXNBZnRlcihiWzFdLm10aW1lKSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICBpZiBtLmlzQmVmb3JlKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhcmdzLnNpemVcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPiBiWzFdLnNpemUgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA8IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYVsyXSA+IGJbMl0gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgLTEpXG4gICAgZWxzZSBpZiBhcmdzLnNpemVcbiAgICAgICAgbC5zb3J0KChhLGIpIC0+XG4gICAgICAgICAgICBpZiBhWzFdLnNpemUgPiBiWzFdLnNpemUgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICBfLnVuemlwKGwpWzBdXG5cbiMgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICBcbiMgMDAwICAwMDAgICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAwMDAgIDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcblxuaWdub3JlID0gKHApIC0+XG4gICAgXG4gICAgYmFzZSA9IHNsYXNoLmJhc2VuYW1lIHBcbiAgICByZXR1cm4gdHJ1ZSBpZiBiYXNlWzBdID09ICckJ1xuICAgIHJldHVybiB0cnVlIGlmIGJhc2UgPT0gJ2Rlc2t0b3AuaW5pJyAgICBcbiAgICByZXR1cm4gdHJ1ZSBpZiBiYXNlLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCAnbnR1c2VyJ1xuICAgIGZhbHNlXG4gICAgXG4jIDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwXG4jIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAgICAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMFxuXG5saXN0RmlsZXMgPSAocCwgZGlyZW50cywgZGVwdGgpIC0+XG4gICAgXG4gICAgYWxwaCA9IFtdIGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgZGlycyA9IFtdICMgdmlzaWJsZSBkaXJzXG4gICAgZmlscyA9IFtdICMgdmlzaWJsZSBmaWxlc1xuICAgIGRzdHMgPSBbXSAjIGRpciBzdGF0c1xuICAgIGZzdHMgPSBbXSAjIGZpbGUgc3RhdHNcbiAgICBleHRzID0gW10gIyBmaWxlIGV4dGVuc2lvbnNcblxuICAgIGlmIGFyZ3Mub3duZXJcbiAgICAgICAgXG4gICAgICAgIGRpcmVudHMuZm9yRWFjaCAoZGUpIC0+XG4gICAgICAgICAgICBycCA9IGRlLm5hbWVcbiAgICAgICAgICAgIGlmIHNsYXNoLmlzQWJzb2x1dGUgcnBcbiAgICAgICAgICAgICAgICBmaWxlID0gc2xhc2gucmVzb2x2ZSBycFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZpbGUgID0gc2xhc2guam9pbiBwLCBycFxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgc3RhdCA9IGZzLmxzdGF0U3luYyhmaWxlKVxuICAgICAgICAgICAgICAgIG9sID0gb3duZXJOYW1lKHN0YXQpLmxlbmd0aFxuICAgICAgICAgICAgICAgIGdsID0gZ3JvdXBOYW1lKHN0YXQpLmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIG9sID4gc3RhdHMubWF4T3duZXJMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubWF4T3duZXJMZW5ndGggPSBvbFxuICAgICAgICAgICAgICAgIGlmIGdsID4gc3RhdHMubWF4R3JvdXBMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubWF4R3JvdXBMZW5ndGggPSBnbFxuICAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuICAgIGRpcmVudHMuZm9yRWFjaCAoZGUpIC0+XG4gICAgICAgIFxuICAgICAgICBycCA9IGRlLm5hbWVcbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLmlzQWJzb2x1dGUgcnBcbiAgICAgICAgICAgIGZpbGUgID0gc2xhc2gucmVzb2x2ZSBycFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmaWxlICA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBwLCBycFxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBpZ25vcmUgcnBcbiAgICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgbHN0YXQgPSBmcy5sc3RhdFN5bmMgZmlsZVxuICAgICAgICAgICAgbGluayAgPSBsc3RhdC5pc1N5bWJvbGljTGluaygpXG4gICAgICAgICAgICBpZiBsaW5rIGFuZCBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgICAgICBpZiBzbGFzaC50aWxkZShmaWxlKVswXSA9PSAnfidcbiAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSBzbGFzaC50aWxkZSBmcy5yZWFkbGlua1N5bmMgZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlmIHRhcmdldC5zdGFydHNXaXRoICd+L0FwcERhdGEnXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWYgdGFyZ2V0IGluIFsnfi9Eb2N1bWVudHMnXVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHN0YXQgPSBsaW5rIGFuZCBmcy5zdGF0U3luYyhmaWxlKSBvciBsc3RhdFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICBzdGF0ID0gbHN0YXRcbiAgICAgICAgICAgICAgICBzdGF0cy5icm9rZW5MaW5rcy5wdXNoIGZpbGVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjIGxvZ19lcnJvciBcImNhbid0IHJlYWQgZmlsZTogXCIsIGZpbGUsIGxpbmtcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBleHQgID0gc2xhc2guZXh0IGZpbGVcbiAgICAgICAgbmFtZSA9IHNsYXNoLmJhc2UgZmlsZVxuICAgICAgICBcbiAgICAgICAgaWYgbmFtZVswXSA9PSAnLidcbiAgICAgICAgICAgIGV4dCA9IG5hbWUuc3Vic3RyKDEpICsgc2xhc2guZXh0bmFtZSBmaWxlXG4gICAgICAgICAgICBuYW1lID0gJydcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBuYW1lLmxlbmd0aCBhbmQgbmFtZVtuYW1lLmxlbmd0aC0xXSAhPSAnXFxyJyBvciBhcmdzLmFsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzID0gZ2V0UHJlZml4IHN0YXQsIGRlcHRoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICBpZiBub3QgYXJncy5maWxlc1xuICAgICAgICAgICAgICAgICAgICBpZiBub3QgYXJncy50cmVlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBuYW1lLnN0YXJ0c1dpdGggJy4vJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lWzIuLl1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBkaXJTdHJpbmcgbmFtZSwgZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBsaW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBsaW5rU3RyaW5nIGZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcnMucHVzaCBzK3Jlc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICBhbHBoLnB1c2ggcytyZXNldCBpZiBhcmdzLmFscGhhYmV0aWNhbFxuICAgICAgICAgICAgICAgICAgICBkc3RzLnB1c2ggc3RhdFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5udW1fZGlycyArPSAxXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZGlycyArPSAxXG4gICAgICAgICAgICBlbHNlICMgaWYgcGF0aCBpcyBmaWxlXG4gICAgICAgICAgICAgICAgaWYgbm90IGFyZ3MuZGlyc1xuICAgICAgICAgICAgICAgICAgICBzICs9IG5hbWVTdHJpbmcgbmFtZSwgZXh0XG4gICAgICAgICAgICAgICAgICAgIGlmIGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBleHRTdHJpbmcgbmFtZSwgZXh0XG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gbGlua1N0cmluZyBmaWxlXG4gICAgICAgICAgICAgICAgICAgIGZpbHMucHVzaCBzK3Jlc2V0XG4gICAgICAgICAgICAgICAgICAgIGFscGgucHVzaCBzK3Jlc2V0IGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgICAgICAgICAgICAgIGZzdHMucHVzaCBzdGF0XG4gICAgICAgICAgICAgICAgICAgIGV4dHMucHVzaCBleHRcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubnVtX2ZpbGVzICs9IDFcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9maWxlcyArPSAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHN0YXQuaXNGaWxlKClcbiAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZmlsZXMgKz0gMVxuICAgICAgICAgICAgZWxzZSBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZGlycyArPSAxXG5cbiAgICBpZiBhcmdzLnNpemUgb3IgYXJncy5raW5kIG9yIGFyZ3MudGltZVxuICAgICAgICBpZiBkaXJzLmxlbmd0aCBhbmQgbm90IGFyZ3MuZmlsZXNcbiAgICAgICAgICAgIGRpcnMgPSBzb3J0IGRpcnMsIGRzdHNcbiAgICAgICAgaWYgZmlscy5sZW5ndGhcbiAgICAgICAgICAgIGZpbHMgPSBzb3J0IGZpbHMsIGZzdHMsIGV4dHNcblxuICAgIGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgIGxvZyBwIGZvciBwIGluIGFscGhcbiAgICBlbHNlXG4gICAgICAgIGxvZyBkIGZvciBkIGluIGRpcnNcbiAgICAgICAgbG9nIGYgZm9yIGYgaW4gZmlsc1xuXG4jIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMFxuXG5saXN0RGlyID0gKGRlLCBvcHQ9e30pIC0+XG4gICAgICAgICAgICBcbiAgICBwID0gZGUubmFtZVxuXG4gICAgaWYgc2xhc2guaXNSZWxhdGl2ZShwKSBhbmQgb3B0LnBhcmVudFxuICAgICAgICBwID0gc2xhc2guam9pbiBvcHQucGFyZW50LCBwXG5cbiAgICBpZiBhcmdzLnJlY3Vyc2VcbiAgICAgICAgZGVwdGggPSBwYXRoRGVwdGggcCwgb3B0XG4gICAgICAgIHJldHVybiBpZiBkZXB0aCA+IGFyZ3MuZGVwdGhcbiAgICBcbiAgICBwcyA9IHBcblxuICAgIHRyeVxuICAgICAgICBhbGxkaXJlbnRzID0gZnMucmVhZGRpclN5bmMgcCwgd2l0aEZpbGVUeXBlczp0cnVlXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIHRydWVcblxuICAgIGlmIGFyZ3MuZmluZFxuICAgICAgICBkaXJlbnRzID0gZmlsdGVyIGFsbGRpcmVudHMsIChkZSkgLT4gUmVnRXhwKGFyZ3MuZmluZCkudGVzdCBkZS5uYW1lXG4gICAgZWxzZVxuICAgICAgICBkaXJlbnRzID0gYWxsZGlyZW50c1xuICAgICAgICAgICAgXG4gICAgaWYgYXJncy5maW5kIGFuZCBub3QgZGlyZW50cz8ubGVuZ3RoXG4gICAgICAgIHRydWVcbiAgICBlbHNlIGlmIGFyZ3MucGF0aHMubGVuZ3RoID09IDEgYW5kIGFyZ3MucGF0aHNbMF0gPT0gJy4nIGFuZCBub3QgYXJncy5yZWN1cnNlXG4gICAgICAgIGxvZyByZXNldFxuICAgIGVsc2UgaWYgYXJncy50cmVlXG4gICAgICAgIGxvZyBnZXRQcmVmaXgoZGUuaXNEaXJlY3RvcnkoKSwgZGVwdGgtMSkgKyBkaXJTdHJpbmcoc2xhc2guYmFzZShwcyksIHNsYXNoLmV4dChwcykpICsgcmVzZXRcbiAgICBlbHNlXG4gICAgICAgIHMgPSBjb2xvcnNbJ19hcnJvdyddICsgXCIg4pa2IFwiICsgY29sb3JzWydfaGVhZGVyJ11bMF1cbiAgICAgICAgcHMgPSBzbGFzaC50aWxkZSBzbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgcnMgPSBzbGFzaC5yZWxhdGl2ZSBwcywgcHJvY2Vzcy5jd2QoKVxuICAgICAgICBpZiBycy5sZW5ndGggPCBwcy5sZW5ndGhcbiAgICAgICAgICAgIHBzID0gcnNcblxuICAgICAgICBpZiBwcyA9PSAnLydcbiAgICAgICAgICAgIHMgKz0gJy8nXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNwID0gcHMuc3BsaXQoJy8nKVxuICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVswXSArIHNwLnNoaWZ0KClcbiAgICAgICAgICAgIHdoaWxlIHNwLmxlbmd0aFxuICAgICAgICAgICAgICAgIHBuID0gc3Auc2hpZnQoKVxuICAgICAgICAgICAgICAgIGlmIHBuXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gY29sb3JzWydfaGVhZGVyJ11bMV0gKyAnLydcbiAgICAgICAgICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVtzcC5sZW5ndGggPT0gMCBhbmQgMiBvciAwXSArIHBuXG4gICAgICAgIGxvZyByZXNldFxuICAgICAgICBsb2cgcyArIFwiIFwiICsgcmVzZXRcbiAgICAgICAgbG9nIHJlc2V0XG5cbiAgICBpZiBkaXJlbnRzPy5sZW5ndGhcbiAgICAgICAgbGlzdEZpbGVzIHAsIGRpcmVudHMsIGRlcHRoXG5cbiAgICBpZiBhcmdzLnJlY3Vyc2VcbiAgICAgICAgXG4gICAgICAgIGRvUmVjdXJzZSA9IChkZSkgLT5cbiAgICAgICAgICAgIGYgPSBkZS5uYW1lXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgc2xhc2guYmFzZW5hbWUoZikgaW4gYXJncy5pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBub3QgYXJncy5hbGwgYW5kIHNsYXNoLmV4dChmKSA9PSAnYXBwJ1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIG5vdCBhcmdzLmFsbCBhbmQgZlswXSA9PSAnLidcbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBub3QgYXJncy5mb2xsb3dTeW1MaW5rcyBhbmQgZGUuaXNTeW1ib2xpY0xpbmsoKVxuICAgICAgICAgICAgZGUuaXNEaXJlY3RvcnkoKSBvciBkZS5pc1N5bWJvbGljTGluaygpIGFuZCBmcy5zdGF0U3luYyhzbGFzaC5qb2luIHAsIGYpLmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGZvciBkZSBpbiBmaWx0ZXIgYWxsZGlyZW50cywgZG9SZWN1cnNlXG4gICAgICAgICAgICAgICAgbGlzdERpciBkZSwgcGFyZW50OnAsIHJlbGF0aXZlVG86b3B0LnJlbGF0aXZlVG9cbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBtc2cgPSBlcnIubWVzc2FnZVxuICAgICAgICAgICAgbXNnID0gXCJwZXJtaXNzaW9uIGRlbmllZFwiIGlmIG1zZy5zdGFydHNXaXRoIFwiRUFDQ0VTXCJcbiAgICAgICAgICAgIG1zZyA9IFwicGVybWlzc2lvbiBkZW5pZWRcIiBpZiBtc2cuc3RhcnRzV2l0aCBcIkVQRVJNXCJcbiAgICAgICAgICAgIGxvZ19lcnJvciBtc2dcbiAgICAgICAgICAgIFxucGF0aERlcHRoID0gKHAsIG9wdCkgLT5cbiAgICBcbiAgICByZWwgPSBzbGFzaC5yZWxhdGl2ZSBwLCBvcHQ/LnJlbGF0aXZlVG8gPyBwcm9jZXNzLmN3ZCgpXG4gICAgcmV0dXJuIDAgaWYgcCA9PSAnLidcbiAgICByZWwuc3BsaXQoJy8nKS5sZW5ndGhcblxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG5cbm1haW4gPSAtPlxuICAgICAgICAgICAgXG4gICAgcGF0aHN0YXRzID0gYXJncy5wYXRocy5tYXAgKGYpIC0+XG4gICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIFtmLCBmcy5zdGF0U3luYyhmKV1cbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICAgIGxvZ19lcnJvciAnbm8gc3VjaCBmaWxlOiAnIGZcbiAgICAgICAgICAgIFtdXG4gICAgXG4gICAgcGF0aHN0YXRzID0gcGF0aHN0YXRzLmZpbHRlciAoZikgLT4gZi5sZW5ndGhcbiAgICBcbiAgICBpZiBub3QgcGF0aHN0YXRzLmxlbmd0aCB0aGVuIHByb2Nlc3MuZXhpdCgxKVxuICAgIFxuICAgIGZpbGVzdGF0cyA9IHBhdGhzdGF0cy5maWx0ZXIgKGYpIC0+IG5vdCBmWzFdLmlzRGlyZWN0b3J5KClcbiAgICBcbiAgICBpZiBmaWxlc3RhdHMubGVuZ3RoID4gMFxuICAgICAgICBsb2cgcmVzZXRcbiAgICAgICAgbGlzdEZpbGVzIHByb2Nlc3MuY3dkKCksIGZpbGVzdGF0cy5tYXAoIChzKSAtPiBzWzFdLm5hbWUgPz0gc1swXTsgc1sxXSApXG4gICAgXG4gICAgZGlyc3RhdHMgPSBwYXRoc3RhdHMuZmlsdGVyIChmKSAtPiBmWzFdPy5pc0RpcmVjdG9yeSgpXG4gICAgICAgIFxuICAgIGZvciBwIGluIGRpcnN0YXRzXG4gICAgICAgIGxvZyAnJyBpZiBhcmdzLnRyZWVcbiAgICAgICAgZmlsZSA9IHNsYXNoLmZpbGUgcFswXVxuICAgICAgICBwYXJlbnQgPSBpZiBzbGFzaC5pc1JlbGF0aXZlKHBbMF0pIHRoZW4gcHJvY2Vzcy5jd2QoKSBlbHNlIHNsYXNoLmRpciBwWzBdXG4gICAgICAgIHBbMV0ubmFtZSA/PSBmaWxlXG4gICAgICAgIGxpc3REaXIgcFsxXSwgcGFyZW50OnBhcmVudCwgcmVsYXRpdmVUbzpwYXJlbnRcbiAgICBcbiAgICBsb2cgXCJcIlxuICAgIGlmIGFyZ3MuaW5mb1xuICAgICAgICBsb2cgQlcoMSkgKyBcIiBcIiArXG4gICAgICAgIGZ3KDgpICsgc3RhdHMubnVtX2RpcnMgKyAoc3RhdHMuaGlkZGVuX2RpcnMgYW5kIGZ3KDQpICsgXCIrXCIgKyBmdyg1KSArIChzdGF0cy5oaWRkZW5fZGlycykgb3IgXCJcIikgKyBmdyg0KSArIFwiIGRpcnMgXCIgK1xuICAgICAgICBmdyg4KSArIHN0YXRzLm51bV9maWxlcyArIChzdGF0cy5oaWRkZW5fZmlsZXMgYW5kIGZ3KDQpICsgXCIrXCIgKyBmdyg1KSArIChzdGF0cy5oaWRkZW5fZmlsZXMpIG9yIFwiXCIpICsgZncoNCkgKyBcIiBmaWxlcyBcIiArXG4gICAgICAgIGZ3KDgpICsgdGltZShwcm9jZXNzLmhydGltZS5iaWdpbnQ/KCktc3RhcnRUaW1lKSArIFwiIFwiICtcbiAgICAgICAgcmVzZXRcbiAgICBcbmlmIGFyZ3NcbiAgICBpbml0QXJncygpXG4gICAgbWFpbigpXG5lbHNlXG4gICAgbW9kdWxlTWFpbiA9IChhcmcsIG9wdD17fSkgLT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCB0eXBlb2YgYXJnXG4gICAgICAgICAgICB3aGVuICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgYXJncyA9IE9iamVjdC5hc3NpZ24ge30sIG9wdFxuICAgICAgICAgICAgICAgIGFyZ3MucGF0aHMgPz0gW11cbiAgICAgICAgICAgICAgICBhcmdzLnBhdGhzLnB1c2ggYXJnXG4gICAgICAgICAgICB3aGVuICdvYmplY3QnXG4gICAgICAgICAgICAgICAgYXJncyA9IE9iamVjdC5hc3NpZ24ge30sIGFyZ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFyZ3MgPSBwYXRoczpbJy4nXVxuICAgICAgICBpbml0QXJncygpXG4gICAgICAgIFxuICAgICAgICBvdXQgPSAnJ1xuICAgICAgICBvbGRsb2cgPSBjb25zb2xlLmxvZ1xuICAgICAgICBjb25zb2xlLmxvZyA9IC0+IFxuICAgICAgICAgICAgZm9yIGFyZyBpbiBhcmd1bWVudHMgdGhlbiBvdXQgKz0gU3RyaW5nKGFyZylcbiAgICAgICAgICAgIG91dCArPSAnXFxuJ1xuICAgICAgICBcbiAgICAgICAgbWFpbigpXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyA9IG9sZGxvZ1xuICAgICAgICBvdXRcbiAgICBcbiAgICBtb2R1bGUuZXhwb3J0cyA9IG1vZHVsZU1haW5cbiAgICAiXX0=
//# sourceURL=../coffee/color-ls.coffee