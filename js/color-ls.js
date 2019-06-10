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
    args = karg("color-ls\n    paths         . ? the file(s) and/or folder(s) to display . **\n    all           . ? show dot files                  . = false\n    dirs          . ? show only dirs                  . = false\n    files         . ? show only files                 . = false\n    bytes         . ? include size                    . = false\n    mdate         . ? include modification date       . = false\n    long          . ? include size and date           . = false\n    owner         . ? include owner and group         . = false\n    rights        . ? include rights                  . = false\n    size          . ? sort by size                    . = false\n    time          . ? sort by time                    . = false\n    kind          . ? sort by kind                    . = false\n    nerdy         . ? use nerd font icons             . = false\n    pretty        . ? pretty size and age             . = true\n    ignore        . ? don't recurse into              . = node_modules .git\n    info          . ? show statistics                 . = false . - I\n    alphabetical  . ? don't group dirs before files   . = false . - A\n    offset        . ? indent short listings           . = false . - O\n    recurse       . ? recurse into subdirs            . = false . - R\n    tree          . ? recurse and indent              . = false . - T\n    depth         . ? recursion depth                 . = ∞     . - D\n    find          . ? filter with a regexp                      . - F\n    debug                                             . = false . - X\n\nversion      " + (require(__dirname + "/../package.json").version));
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
            return BG(0, 0, 2) + ' ' + reset + colors['_size']['b'][1] + rpad(bar(stat.size / 10), 7);
        }
        if (stat.size <= 100000) {
            return BG(0, 0, 2) + '  ' + reset + colors['_size']['b'][1] + rpad(bar(stat.size / 100), 6);
        }
        if (stat.size <= 1000000) {
            return BG(0, 0, 2) + '   ' + reset + colors['_size']['kB'][1] + rpad(bar(stat.size / 1000), 5);
        }
        mb = parseInt(stat.size / 1000000);
        if (stat.size <= 10000000) {
            return BG(0, 0, 2) + '   ' + BG(0, 0, 3) + fg(0, 0, 2) + mb + reset + colors['_size']['kB'][1] + rpad(bar(stat.size / 10000), 4);
        }
        if (stat.size <= 100000000) {
            return BG(0, 0, 2) + '   ' + BG(0, 0, 3) + fg(0, 0, 2) + mb + reset + colors['_size']['kB'][1] + rpad(bar(stat.size / 100000), 3);
        }
        if (stat.size <= 1000000000) {
            return BG(0, 0, 2) + '   ' + BG(0, 0, 3) + fg(0, 0, 2) + mb + reset + colors['_size']['MB'][1] + rpad(bar(stat.size / 1000000), 2);
        }
        if (stat.size <= 10000000000) {
            return BG(0, 0, 2) + '   ' + colors['_size']['kB'][1] + '███' + colors['_size']['MB'][1] + '█' + rpad(bar(stat.size / 10000000), 1);
        }
        if (stat.size <= 100000000000) {
            return BG(0, 0, 2) + '   ' + colors['_size']['kB'][1] + '███' + colors['_size']['MB'][1] + '██' + bar(stat.size / 100000000);
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
    var depth, doRecurse, err, files, j, len, msg, pn, pr, ps, ref1, results, rs, s, sp;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGlaQUFBO0lBQUE7O0FBUUEsU0FBQSxnRUFBMEIsQ0FBQzs7QUFFM0IsTUFBdUIsT0FBQSxDQUFRLE1BQVIsQ0FBdkIsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjOztBQUNkLEVBQUEsR0FBUyxPQUFBLENBQVEsSUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBRVQsSUFBQSxHQUFROztBQUNSLEtBQUEsR0FBUTs7QUFFUixJQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTLElBQUksQ0FBQzs7QUFDZCxFQUFBLEdBQVMsSUFBSSxDQUFDLEVBQUUsQ0FBQzs7QUFDakIsRUFBQSxHQUFTLElBQUksQ0FBQyxFQUFFLENBQUM7O0FBQ2pCLEVBQUEsR0FBUyxTQUFDLENBQUQ7V0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVUsQ0FBQSxDQUFBO0FBQXpCOztBQUNULEVBQUEsR0FBUyxTQUFDLENBQUQ7V0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVUsQ0FBQSxDQUFBO0FBQXpCOztBQUVULEtBQUEsR0FDSTtJQUFBLFFBQUEsRUFBZ0IsQ0FBaEI7SUFDQSxTQUFBLEVBQWdCLENBRGhCO0lBRUEsV0FBQSxFQUFnQixDQUZoQjtJQUdBLFlBQUEsRUFBZ0IsQ0FIaEI7SUFJQSxjQUFBLEVBQWdCLENBSmhCO0lBS0EsY0FBQSxFQUFnQixDQUxoQjtJQU1BLFdBQUEsRUFBZ0IsRUFOaEI7OztBQWNKLElBQUcsQ0FBSSxNQUFNLENBQUMsTUFBWCxJQUFxQixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQWQsS0FBb0IsR0FBNUM7SUFFSSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7SUFD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QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FqQlo7SUFrQkEsS0FBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FsQlo7SUFtQkEsS0FBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FuQlo7SUFvQkEsS0FBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FwQlo7SUFxQkEsTUFBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FyQlo7SUFzQkEsS0FBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVB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QU8sTUFBQSxDQUFPLEdBQVA7QUFBakM7bUJBQ0EsR0FBQSxJQUFPO1FBRkc7UUFJZCxJQUFBLENBQUE7UUFFQSxPQUFPLENBQUMsR0FBUixHQUFjO2VBQ2Q7SUF0QlM7SUF3QmIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0E1QnJCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAgICAgICAwMDAgICAgICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwICAwMDAgICAgICAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgIDAwMFxuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgICAgICAgMDAwMDAwMCAgMDAwMDAwMFxuIyMjXG5cbnN0YXJ0VGltZSA9IHByb2Nlc3MuaHJ0aW1lLmJpZ2ludD8oKVxuXG57IGxwYWQsIHJwYWQsIHRpbWUgfSA9IHJlcXVpcmUgJ2tzdHInXG5mcyAgICAgPSByZXF1aXJlICdmcydcbnNsYXNoICA9IHJlcXVpcmUgJ2tzbGFzaCdcbmFuc2kgICA9IHJlcXVpcmUgJ2Fuc2ktMjU2LWNvbG9ycydcbnV0aWwgICA9IHJlcXVpcmUgJ3V0aWwnXG5cbmFyZ3MgID0gbnVsbFxudG9rZW4gPSB7fVxuXG5ib2xkICAgPSAnXFx4MWJbMW0nXG5yZXNldCAgPSBhbnNpLnJlc2V0XG5mZyAgICAgPSBhbnNpLmZnLmdldFJnYlxuQkcgICAgID0gYW5zaS5iZy5nZXRSZ2JcbmZ3ICAgICA9IChpKSAtPiBhbnNpLmZnLmdyYXlzY2FsZVtpXVxuQlcgICAgID0gKGkpIC0+IGFuc2kuYmcuZ3JheXNjYWxlW2ldXG5cbnN0YXRzID0gIyBjb3VudGVycyBmb3IgKGhpZGRlbikgZGlycy9maWxlc1xuICAgIG51bV9kaXJzOiAgICAgICAwXG4gICAgbnVtX2ZpbGVzOiAgICAgIDBcbiAgICBoaWRkZW5fZGlyczogICAgMFxuICAgIGhpZGRlbl9maWxlczogICAwXG4gICAgbWF4T3duZXJMZW5ndGg6IDBcbiAgICBtYXhHcm91cExlbmd0aDogMFxuICAgIGJyb2tlbkxpbmtzOiAgICBbXVxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcblxuaWYgbm90IG1vZHVsZS5wYXJlbnQgb3IgbW9kdWxlLnBhcmVudC5pZCA9PSAnLidcblxuICAgIGthcmcgPSByZXF1aXJlICdrYXJnJ1xuICAgIGFyZ3MgPSBrYXJnIFwiXCJcIlxuICAgIGNvbG9yLWxzXG4gICAgICAgIHBhdGhzICAgICAgICAgLiA/IHRoZSBmaWxlKHMpIGFuZC9vciBmb2xkZXIocykgdG8gZGlzcGxheSAuICoqXG4gICAgICAgIGFsbCAgICAgICAgICAgLiA/IHNob3cgZG90IGZpbGVzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGRpcnMgICAgICAgICAgLiA/IHNob3cgb25seSBkaXJzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGZpbGVzICAgICAgICAgLiA/IHNob3cgb25seSBmaWxlcyAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGJ5dGVzICAgICAgICAgLiA/IGluY2x1ZGUgc2l6ZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIG1kYXRlICAgICAgICAgLiA/IGluY2x1ZGUgbW9kaWZpY2F0aW9uIGRhdGUgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGxvbmcgICAgICAgICAgLiA/IGluY2x1ZGUgc2l6ZSBhbmQgZGF0ZSAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIG93bmVyICAgICAgICAgLiA/IGluY2x1ZGUgb3duZXIgYW5kIGdyb3VwICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHJpZ2h0cyAgICAgICAgLiA/IGluY2x1ZGUgcmlnaHRzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHNpemUgICAgICAgICAgLiA/IHNvcnQgYnkgc2l6ZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHRpbWUgICAgICAgICAgLiA/IHNvcnQgYnkgdGltZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGtpbmQgICAgICAgICAgLiA/IHNvcnQgYnkga2luZCAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIG5lcmR5ICAgICAgICAgLiA/IHVzZSBuZXJkIGZvbnQgaWNvbnMgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHByZXR0eSAgICAgICAgLiA/IHByZXR0eSBzaXplIGFuZCBhZ2UgICAgICAgICAgICAgLiA9IHRydWVcbiAgICAgICAgaWdub3JlICAgICAgICAuID8gZG9uJ3QgcmVjdXJzZSBpbnRvICAgICAgICAgICAgICAuID0gbm9kZV9tb2R1bGVzIC5naXRcbiAgICAgICAgaW5mbyAgICAgICAgICAuID8gc2hvdyBzdGF0aXN0aWNzICAgICAgICAgICAgICAgICAuID0gZmFsc2UgLiAtIElcbiAgICAgICAgYWxwaGFiZXRpY2FsICAuID8gZG9uJ3QgZ3JvdXAgZGlycyBiZWZvcmUgZmlsZXMgICAuID0gZmFsc2UgLiAtIEFcbiAgICAgICAgb2Zmc2V0ICAgICAgICAuID8gaW5kZW50IHNob3J0IGxpc3RpbmdzICAgICAgICAgICAuID0gZmFsc2UgLiAtIE9cbiAgICAgICAgcmVjdXJzZSAgICAgICAuID8gcmVjdXJzZSBpbnRvIHN1YmRpcnMgICAgICAgICAgICAuID0gZmFsc2UgLiAtIFJcbiAgICAgICAgdHJlZSAgICAgICAgICAuID8gcmVjdXJzZSBhbmQgaW5kZW50ICAgICAgICAgICAgICAuID0gZmFsc2UgLiAtIFRcbiAgICAgICAgZGVwdGggICAgICAgICAuID8gcmVjdXJzaW9uIGRlcHRoICAgICAgICAgICAgICAgICAuID0g4oieICAgICAuIC0gRFxuICAgICAgICBmaW5kICAgICAgICAgIC4gPyBmaWx0ZXIgd2l0aCBhIHJlZ2V4cCAgICAgICAgICAgICAgICAgICAgICAuIC0gRlxuICAgICAgICBkZWJ1ZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gWFxuICAgIFxuICAgIHZlcnNpb24gICAgICAje3JlcXVpcmUoXCIje19fZGlybmFtZX0vLi4vcGFja2FnZS5qc29uXCIpLnZlcnNpb259XG4gICAgXCJcIlwiXG4gICAgXG5pbml0QXJncyA9IC0+XG4gICAgICAgIFxuICAgIGlmIGFyZ3Muc2l6ZVxuICAgICAgICBhcmdzLmZpbGVzID0gdHJ1ZVxuICAgIFxuICAgIGlmIGFyZ3MubG9uZ1xuICAgICAgICBhcmdzLmJ5dGVzID0gdHJ1ZVxuICAgICAgICBhcmdzLm1kYXRlID0gdHJ1ZVxuICAgICAgICBcbiAgICBpZiBhcmdzLnRyZWVcbiAgICAgICAgYXJncy5yZWN1cnNlID0gdHJ1ZVxuICAgICAgICBhcmdzLm9mZnNldCAgPSBmYWxzZVxuICAgIFxuICAgIGlmIGFyZ3MuZGlycyBhbmQgYXJncy5maWxlc1xuICAgICAgICBhcmdzLmRpcnMgPSBhcmdzLmZpbGVzID0gZmFsc2VcbiAgICAgICAgXG4gICAgaWYgYXJncy5pZ25vcmU/Lmxlbmd0aFxuICAgICAgICBhcmdzLmlnbm9yZSA9IGFyZ3MuaWdub3JlLnNwbGl0ICcgJyBcbiAgICBlbHNlXG4gICAgICAgIGFyZ3MuaWdub3JlID0gW11cbiAgICAgICAgXG4gICAgaWYgYXJncy5kZXB0aCA9PSAn4oieJyB0aGVuIGFyZ3MuZGVwdGggPSBJbmZpbml0eVxuICAgIGVsc2UgYXJncy5kZXB0aCA9IE1hdGgubWF4IDAsIHBhcnNlSW50IGFyZ3MuZGVwdGhcbiAgICBpZiBOdW1iZXIuaXNOYU4gYXJncy5kZXB0aCB0aGVuIGFyZ3MuZGVwdGggPSAwXG4gICAgICAgIFxuICAgIGlmIGFyZ3MuZGVidWdcbiAgICAgICAgbm9vbiA9IHJlcXVpcmUgJ25vb24nXG4gICAgICAgIGxvZyBub29uLnN0cmluZ2lmeSBhcmdzLCBjb2xvcnM6dHJ1ZVxuICAgIFxuICAgIGFyZ3MucGF0aHMgPSBbJy4nXSB1bmxlc3MgYXJncy5wYXRocz8ubGVuZ3RoID4gMFxuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG5jb2xvcnMgPVxuICAgICdjb2ZmZWUnOiAgIFsgYm9sZCtmZyg0LDQsMCksICBmZygxLDEsMCksIGZnKDIsMiwwKSBdXG4gICAgJ2tvZmZlZSc6ICAgWyBib2xkK2ZnKDUsNSwwKSwgIGZnKDEsMCwwKSwgZmcoMywxLDApIF1cbiAgICAncHknOiAgICAgICBbIGJvbGQrZmcoMCwzLDApLCAgZmcoMCwxLDApLCBmZygwLDIsMCkgXVxuICAgICdyYic6ICAgICAgIFsgYm9sZCtmZyg0LDAsMCksICBmZygxLDAsMCksIGZnKDIsMCwwKSBdXG4gICAgJ2pzb24nOiAgICAgWyBib2xkK2ZnKDQsMCw0KSwgIGZnKDEsMCwxKSwgZmcoMiwwLDEpIF1cbiAgICAnY3Nvbic6ICAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygyLDAsMikgXVxuICAgICdub29uJzogICAgIFsgYm9sZCtmZyg0LDQsMCksICBmZygxLDEsMCksIGZnKDIsMiwwKSBdXG4gICAgJ3BsaXN0JzogICAgWyBib2xkK2ZnKDQsMCw0KSwgIGZnKDEsMCwxKSwgZmcoMiwwLDIpIF1cbiAgICAnanMnOiAgICAgICBbIGJvbGQrZmcoNSwwLDUpLCAgZmcoMiwwLDIpLCBmZygzLDAsMykgXVxuICAgICdjcHAnOiAgICAgIFsgYm9sZCtmZyg1LDQsMCksICBmdygzKSwgICAgIGZnKDMsMiwwKSBdXG4gICAgJ2gnOiAgICAgICAgWyAgICAgIGZnKDMsMSwwKSwgIGZ3KDMpLCAgICAgZmcoMiwxLDApIF1cbiAgICAncHljJzogICAgICBbICAgICAgZncoNSksICAgICAgZncoMyksICAgICBmdyg0KSBdXG4gICAgJ2xvZyc6ICAgICAgWyAgICAgIGZ3KDUpLCAgICAgIGZ3KDIpLCAgICAgZncoMykgXVxuICAgICdsb2cnOiAgICAgIFsgICAgICBmdyg1KSwgICAgICBmdygyKSwgICAgIGZ3KDMpIF1cbiAgICAndHh0JzogICAgICBbICAgICAgZncoMjApLCAgICAgZncoMyksICAgICBmdyg0KSBdXG4gICAgJ21kJzogICAgICAgWyBib2xkK2Z3KDIwKSwgICAgIGZ3KDMpLCAgICAgZncoNCkgXVxuICAgICdtYXJrZG93bic6IFsgYm9sZCtmdygyMCksICAgICBmdygzKSwgICAgIGZ3KDQpIF1cbiAgICAnc2gnOiAgICAgICBbIGJvbGQrZmcoNSwxLDApLCAgZmcoMiwwLDApLCBmZygzLDAsMCkgXVxuICAgICdwbmcnOiAgICAgIFsgYm9sZCtmZyg1LDAsMCksICBmZygyLDAsMCksIGZnKDMsMCwwKSBdXG4gICAgJ2pwZyc6ICAgICAgWyBib2xkK2ZnKDAsMywwKSwgIGZnKDAsMiwwKSwgZmcoMCwyLDApIF1cbiAgICAncHhtJzogICAgICBbIGJvbGQrZmcoMSwxLDUpLCAgZmcoMCwwLDIpLCBmZygwLDAsNCkgXVxuICAgICd0aWZmJzogICAgIFsgYm9sZCtmZygxLDEsNSksICBmZygwLDAsMyksIGZnKDAsMCw0KSBdXG4gICAgJ3Rneic6ICAgICAgWyBib2xkK2ZnKDAsMyw0KSwgIGZnKDAsMSwyKSwgZmcoMCwyLDMpIF1cbiAgICAncGtnJzogICAgICBbIGJvbGQrZmcoMCwzLDQpLCAgZmcoMCwxLDIpLCBmZygwLDIsMykgXVxuICAgICd6aXAnOiAgICAgIFsgYm9sZCtmZygwLDMsNCksICBmZygwLDEsMiksIGZnKDAsMiwzKSBdXG4gICAgJ2RtZyc6ICAgICAgWyBib2xkK2ZnKDEsNCw0KSwgIGZnKDAsMiwyKSwgZmcoMCwzLDMpIF1cbiAgICAndHRmJzogICAgICBbIGJvbGQrZmcoMiwxLDMpLCAgZmcoMSwwLDIpLCBmZygxLDAsMikgXVxuXG4gICAgJ19kZWZhdWx0JzogWyAgICAgIGZ3KDE1KSwgICAgIGZ3KDQpLCAgICAgZncoMTApIF1cbiAgICAnX2Rpcic6ICAgICBbIGJvbGQrQkcoMCwwLDIpK2Z3KDIzKSwgZmcoMSwxLDUpLCBib2xkK0JHKDAsMCwyKStmZygyLDIsNSkgXVxuICAgICdfLmRpcic6ICAgIFsgYm9sZCtCRygwLDAsMSkrZncoMjMpLCBib2xkK0JHKDAsMCwxKStmZygxLDEsNSksIGJvbGQrQkcoMCwwLDEpK2ZnKDIsMiw1KSBdXG4gICAgJ19saW5rJzogICAgeyAnYXJyb3cnOiBmZygxLDAsMSksICdwYXRoJzogZmcoNCwwLDQpLCAnYnJva2VuJzogQkcoNSwwLDApK2ZnKDUsNSwwKSB9XG4gICAgJ19hcnJvdyc6ICAgICBCVygyKStmdygwKVxuICAgICdfaGVhZGVyJzogIFsgYm9sZCtCVygyKStmZygzLDIsMCksICBmdyg0KSwgYm9sZCtCVygyKStmZyg1LDUsMCkgXVxuICAgICdfc2l6ZSc6ICAgIHsgYjogW2ZnKDAsMCwzKSwgZmcoMCwwLDIpXSwga0I6IFtmZygwLDAsNSksIGZnKDAsMCwzKV0sIE1COiBbZmcoMSwxLDUpLCBmZygwLDAsNCldLCBHQjogW2ZnKDQsNCw1KSwgZmcoMiwyLDUpXSwgVEI6IFtmZyg0LDQsNSksIGZnKDIsMiw1KV0gfVxuICAgICdfdXNlcnMnOiAgIHsgcm9vdDogIGZnKDMsMCwwKSwgZGVmYXVsdDogZmcoMSwwLDEpIH1cbiAgICAnX2dyb3Vwcyc6ICB7IHdoZWVsOiBmZygxLDAsMCksIHN0YWZmOiBmZygwLDEsMCksIGFkbWluOiBmZygxLDEsMCksIGRlZmF1bHQ6IGZnKDEsMCwxKSB9XG4gICAgJ19lcnJvcic6ICAgWyBib2xkK0JHKDUsMCwwKStmZyg1LDUsMCksIGJvbGQrQkcoNSwwLDApK2ZnKDUsNSw1KSBdXG4gICAgJ19yaWdodHMnOlxuICAgICAgICAgICAgICAgICAgJ3IrJzogYm9sZCtCVygxKStmdyg2KVxuICAgICAgICAgICAgICAgICAgJ3ItJzogcmVzZXQrQlcoMSkrZncoMilcbiAgICAgICAgICAgICAgICAgICd3Kyc6IGJvbGQrQlcoMSkrZmcoMiwyLDUpXG4gICAgICAgICAgICAgICAgICAndy0nOiByZXNldCtCVygxKStmdygyKVxuICAgICAgICAgICAgICAgICAgJ3grJzogYm9sZCtCVygxKStmZyg1LDAsMClcbiAgICAgICAgICAgICAgICAgICd4LSc6IHJlc2V0K0JXKDEpK2Z3KDIpXG5cbnVzZXJNYXAgPSB7fVxudXNlcm5hbWUgPSAodWlkKSAtPlxuICAgIGlmIG5vdCB1c2VyTWFwW3VpZF1cbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBjaGlsZHAgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuICAgICAgICAgICAgdXNlck1hcFt1aWRdID0gY2hpbGRwLnNwYXduU3luYyhcImlkXCIsIFtcIi11blwiLCBcIiN7dWlkfVwiXSkuc3Rkb3V0LnRvU3RyaW5nKCd1dGY4JykudHJpbSgpXG4gICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgIGxvZyBlXG4gICAgdXNlck1hcFt1aWRdXG5cbmdyb3VwTWFwID0gbnVsbFxuZ3JvdXBuYW1lID0gKGdpZCkgLT5cbiAgICBpZiBub3QgZ3JvdXBNYXBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBjaGlsZHAgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuICAgICAgICAgICAgZ2lkcyA9IGNoaWxkcC5zcGF3blN5bmMoXCJpZFwiLCBbXCItR1wiXSkuc3Rkb3V0LnRvU3RyaW5nKCd1dGY4Jykuc3BsaXQoJyAnKVxuICAgICAgICAgICAgZ25tcyA9IGNoaWxkcC5zcGF3blN5bmMoXCJpZFwiLCBbXCItR25cIl0pLnN0ZG91dC50b1N0cmluZygndXRmOCcpLnNwbGl0KCcgJylcbiAgICAgICAgICAgIGdyb3VwTWFwID0ge31cbiAgICAgICAgICAgIGZvciBpIGluIFswLi4uZ2lkcy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgZ3JvdXBNYXBbZ2lkc1tpXV0gPSBnbm1zW2ldXG4gICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgIGxvZyBlXG4gICAgZ3JvdXBNYXBbZ2lkXVxuXG5pZiAnZnVuY3Rpb24nID09IHR5cGVvZiBwcm9jZXNzLmdldHVpZFxuICAgIGNvbG9yc1snX3VzZXJzJ11bdXNlcm5hbWUocHJvY2Vzcy5nZXR1aWQoKSldID0gZmcoMCw0LDApXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAwMDBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxubG9nX2Vycm9yID0gKCkgLT5cbiAgICBcbiAgICBsb2cgXCIgXCIgKyBjb2xvcnNbJ19lcnJvciddWzBdICsgXCIgXCIgKyBib2xkICsgYXJndW1lbnRzWzBdICsgKGFyZ3VtZW50cy5sZW5ndGggPiAxIGFuZCAoY29sb3JzWydfZXJyb3InXVsxXSArIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5zbGljZSgxKS5qb2luKCcgJykpIG9yICcnKSArIFwiIFwiICsgcmVzZXRcblxubGlua1N0cmluZyA9IChmaWxlKSAtPiBcbiAgICBcbiAgICBzICA9IHJlc2V0ICsgZncoMSkgKyBjb2xvcnNbJ19saW5rJ11bJ2Fycm93J10gKyBcIiDilrogXCIgXG4gICAgcyArPSBjb2xvcnNbJ19saW5rJ11bKGZpbGUgaW4gc3RhdHMuYnJva2VuTGlua3MpIGFuZCAnYnJva2VuJyBvciAncGF0aCddIFxuICAgIHRyeVxuICAgICAgICBzICs9IHNsYXNoLnBhdGggZnMucmVhZGxpbmtTeW5jKGZpbGUpXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIHMgKz0gJyA/ICdcbiAgICBzXG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIFxuIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG5cbm5hbWVTdHJpbmcgPSAobmFtZSwgZXh0KSAtPiBcbiAgICBcbiAgICBpZiBhcmdzLm5lcmR5XG4gICAgICAgIGljb25zID0gcmVxdWlyZSAnLi9pY29ucydcbiAgICAgICAgaWNvbiA9IChjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMl0gKyAoaWNvbnMuZ2V0KG5hbWUsIGV4dCkgPyAnICcpKSArICcgJ1xuICAgIGVsc2VcbiAgICAgICAgaWNvbiA9ICcnXG4gICAgXCIgXCIgKyBpY29uICsgY29sb3JzW2NvbG9yc1tleHRdPyBhbmQgZXh0IG9yICdfZGVmYXVsdCddWzBdICsgbmFtZSArIHJlc2V0XG4gICAgXG5kb3RTdHJpbmcgID0gKGV4dCkgLT4gXG4gICAgXG4gICAgY29sb3JzW2NvbG9yc1tleHRdPyBhbmQgZXh0IG9yICdfZGVmYXVsdCddWzFdICsgXCIuXCIgKyByZXNldFxuICAgIFxuZXh0U3RyaW5nICA9IChuYW1lLCBleHQpIC0+IFxuICAgIFxuICAgIGlmIGFyZ3MubmVyZHkgYW5kIG5hbWUgXG4gICAgICAgIGljb25zID0gcmVxdWlyZSAnLi9pY29ucydcbiAgICAgICAgaWYgaWNvbnMuZ2V0KG5hbWUsIGV4dCkgdGhlbiByZXR1cm4gJydcbiAgICBkb3RTdHJpbmcoZXh0KSArIGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVsxXSArIGV4dCArIHJlc2V0XG4gICAgXG5kaXJTdHJpbmcgID0gKG5hbWUsIGV4dCkgLT5cbiAgICBcbiAgICBjID0gbmFtZSBhbmQgJ19kaXInIG9yICdfLmRpcidcbiAgICBpY29uID0gYXJncy5uZXJkeSBhbmQgY29sb3JzW2NdWzJdICsgJyBcXHVmNDEzJyBvciAnJ1xuICAgIGljb24gKyBjb2xvcnNbY11bMF0gKyAobmFtZSBhbmQgKFwiIFwiICsgbmFtZSkgb3IgXCIgXCIpICsgKGlmIGV4dCB0aGVuIGNvbG9yc1tjXVsxXSArICcuJyArIGNvbG9yc1tjXVsyXSArIGV4dCBlbHNlIFwiXCIpICsgXCIgXCJcblxuIyAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxuc2l6ZVN0cmluZyA9IChzdGF0KSAtPlxuXG4gICAgaWYgYXJncy5uZXJkeSBhbmQgYXJncy5wcmV0dHlcblxuICAgICAgICBiYXIgPSAobikgLT5cbiAgICAgICAgICAgIGIgPSAn4paP4paO4paN4paM4paL4paK4paJJ1xuICAgICAgICAgICAgYltNYXRoLmZsb29yIG4vKDEwMDAvNyldICBcbiAgICAgICAgXG4gICAgICAgIGlmIHN0YXQuc2l6ZSA9PSAwXG4gICAgICAgICAgICByZXR1cm4gcnBhZCAnJywgOFxuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMFxuICAgICAgICAgICAgcmV0dXJuIGNvbG9yc1snX3NpemUnXVsnYiddWzFdICsgcnBhZCBiYXIoc3RhdC5zaXplKSwgOFxuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMDBcbiAgICAgICAgICAgIHJldHVybiBCRygwLDAsMikgKyAnICcgKyByZXNldCArIGNvbG9yc1snX3NpemUnXVsnYiddWzFdICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwKSwgN1xuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMDAwXG4gICAgICAgICAgICByZXR1cm4gQkcoMCwwLDIpICsgJyAgJyArIHJlc2V0ICsgY29sb3JzWydfc2l6ZSddWydiJ11bMV0gKyBycGFkIGJhcihzdGF0LnNpemUvMTAwKSwgNlxuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwyKSArICAnICAgJyArIHJlc2V0ICsgY29sb3JzWydfc2l6ZSddWydrQiddWzFdICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMDApLCA1XG4gICAgICAgICAgICBcbiAgICAgICAgbWIgPSBwYXJzZUludCBzdGF0LnNpemUgLyAxMDAwMDAwXG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwyKSArICcgICAnICsgQkcoMCwwLDMpICsgZmcoMCwwLDIpICsgbWIgKyByZXNldCArIGNvbG9yc1snX3NpemUnXVsna0InXVsxXSArIHJwYWQgYmFyKHN0YXQuc2l6ZS8xMDAwMCksIDRcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwyKSArICcgICAnICsgQkcoMCwwLDMpICsgZmcoMCwwLDIpICsgbWIgKyByZXNldCArIGNvbG9yc1snX3NpemUnXVsna0InXVsxXSArIHJwYWQgYmFyKHN0YXQuc2l6ZS8xMDAwMDApLCAzXG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMDAwMDAwXG4gICAgICAgICAgICByZXR1cm4gQkcoMCwwLDIpICsgJyAgICcgKyBCRygwLDAsMykgKyBmZygwLDAsMikgKyBtYiArIHJlc2V0ICsgY29sb3JzWydfc2l6ZSddWydNQiddWzFdICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMDAwMDApLCAyXG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwyKSArICcgICAnICsgY29sb3JzWydfc2l6ZSddWydrQiddWzFdICsgJ+KWiOKWiOKWiCcgKyBjb2xvcnNbJ19zaXplJ11bJ01CJ11bMV0gKyAn4paIJyArIHJwYWQgYmFyKHN0YXQuc2l6ZS8xMDAwMDAwMCksIDFcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDAwMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwyKSArICcgICAnICsgY29sb3JzWydfc2l6ZSddWydrQiddWzFdICsgJ+KWiOKWiOKWiCcgKyBjb2xvcnNbJ19zaXplJ11bJ01CJ11bMV0gKyAn4paI4paIJyArIGJhcihzdGF0LnNpemUvMTAwMDAwMDAwKVxuICAgICAgICBcbiAgICBpZiBhcmdzLnByZXR0eSBhbmQgc3RhdC5zaXplID09IDBcbiAgICAgICAgcmV0dXJuIGxwYWQoJyAnLCAxMSlcbiAgICBpZiBzdGF0LnNpemUgPCAxMDAwXG4gICAgICAgIGNvbG9yc1snX3NpemUnXVsnYiddWzBdICsgbHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZSBpZiBzdGF0LnNpemUgPCAxMDAwMDAwXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ2tCJ11bMF0gKyBscGFkKChzdGF0LnNpemUgLyAxMDAwKS50b0ZpeGVkKDApLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydrQiddWzFdICsgXCJrQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ2tCJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlIGlmIHN0YXQuc2l6ZSA8IDEwMDAwMDAwMDBcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnTUInXVswXSArIGxwYWQoKHN0YXQuc2l6ZSAvIDEwMDAwMDApLnRvRml4ZWQoMSksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ01CJ11bMV0gKyBcIk1CIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnTUInXVswXSArIGxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2UgaWYgc3RhdC5zaXplIDwgMTAwMDAwMDAwMDAwMFxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydHQiddWzBdICsgbHBhZCgoc3RhdC5zaXplIC8gMTAwMDAwMDAwMCkudG9GaXhlZCgxKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsnR0InXVsxXSArIFwiR0IgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydHQiddWzBdICsgbHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZVxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydUQiddWzBdICsgbHBhZCgoc3RhdC5zaXplIC8gMTAwMDAwMDAwMDAwMCkudG9GaXhlZCgzKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsnVEInXVsxXSArIFwiVEIgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydUQiddWzBdICsgbHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG5cbiMgMDAwMDAwMDAwICAwMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiMgICAgMDAwICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG5cbnRpbWVTdHJpbmcgPSAoc3RhdCkgLT5cbiAgICBcbiAgICBpZiBhcmdzLm5lcmR5IGFuZCBhcmdzLnByZXR0eVxuICAgICAgICBzZWMgPSBwYXJzZUludCAoRGF0ZS5ub3coKS1zdGF0Lm10aW1lTXMpLzEwMDBcbiAgICAgICAgbW4gID0gcGFyc2VJbnQgc2VjLzYwXG4gICAgICAgIGhyICA9IHBhcnNlSW50IHNlYy8zNjAwXG4gICAgICAgIGlmIGhyIDwgMTJcbiAgICAgICAgICAgIGlmIHNlYyA8IDYwXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArICcgICAnICsgZmcoNSw1LDUpICsgJ+KXi+KXlOKXkeKXlSdbcGFyc2VJbnQgc2VjLzE1XSArICcgJyBcbiAgICAgICAgICAgIGVsc2UgaWYgbW4gPCA2MFxuICAgICAgICAgICAgICAgIHJldHVybiBCRygwLDAsMSkgKyAnICAnICsgZmcoMywzLDUpICsgJ+KXi+KXlOKXkeKXlSdbcGFyc2VJbnQgbW4vMTVdICsgZmcoMCwwLDMpICsgJ+KXjCAnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArICcgJyArIGZnKDIsMiw1KSArICfil4vil5Til5Hil5UnW3BhcnNlSW50IGhyLzNdICsgZmcoMCwwLDMpICsgJ+KXjOKXjCAnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGR5ID0gcGFyc2VJbnQgTWF0aC5yb3VuZCBzZWMvKDI0KjM2MDApXG4gICAgICAgICAgICB3ayA9IHBhcnNlSW50IE1hdGgucm91bmQgc2VjLyg3KjI0KjM2MDApXG4gICAgICAgICAgICBtdCA9IHBhcnNlSW50IE1hdGgucm91bmQgc2VjLygzMCoyNCozNjAwKVxuICAgICAgICAgICAgeXIgPSBwYXJzZUludCBNYXRoLnJvdW5kIHNlYy8oMzY1KjI0KjM2MDApXG4gICAgICAgICAgICBpZiBkeSA8IDEwXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArIGZnKDAsMCw1KSArIFwiICN7ZHl9IFxcdWYxODUgXCJcbiAgICAgICAgICAgIGVsc2UgaWYgd2sgPCA1XG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArIGZnKDAsMCw0KSArIFwiICN7d2t9IFxcdWYxODYgXCJcbiAgICAgICAgICAgIGVsc2UgaWYgbXQgPCAxMFxuICAgICAgICAgICAgICAgIHJldHVybiBCRygwLDAsMSkgKyBmZygwLDAsMykgKyBcIiAje210fSBcXHVmNDU1IFwiXG4gICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgIHJldHVybiBCRygwLDAsMSkgKyBmZygwLDAsMykgKyBcIiAje3JwYWQgeXIsIDJ9XFx1ZjZlNiBcIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICBtb21lbnQgPSByZXF1aXJlICdtb21lbnQnXG4gICAgdCA9IG1vbWVudCBzdGF0Lm10aW1lXG4gICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgYWdlID0gbW9tZW50KCkudG8odCwgdHJ1ZSlcbiAgICAgICAgW251bSwgcmFuZ2VdID0gYWdlLnNwbGl0ICcgJ1xuICAgICAgICBudW0gPSAnMScgaWYgbnVtWzBdID09ICdhJ1xuICAgICAgICBpZiByYW5nZSA9PSAnZmV3J1xuICAgICAgICAgICAgbnVtID0gbW9tZW50KCkuZGlmZiB0LCAnc2Vjb25kcydcbiAgICAgICAgICAgIHJhbmdlID0gJ3NlY29uZHMnXG4gICAgICAgICAgICBmdygyMykgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdygxNikgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ3llYXInXG4gICAgICAgICAgICBmdyg2KSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDMpICsgcnBhZChyYW5nZSwgNykgKyAnICdcbiAgICAgICAgZWxzZSBpZiByYW5nZS5zdGFydHNXaXRoICdtb250aCdcbiAgICAgICAgICAgIGZ3KDgpICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoNCkgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ2RheSdcbiAgICAgICAgICAgIGZ3KDEwKSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDYpICsgcnBhZChyYW5nZSwgNykgKyAnICdcbiAgICAgICAgZWxzZSBpZiByYW5nZS5zdGFydHNXaXRoICdob3VyJ1xuICAgICAgICAgICAgZncoMTUpICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoOCkgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmdygxOCkgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdygxMikgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgIGVsc2VcbiAgICAgICAgZncoMTYpICsgbHBhZCh0LmZvcm1hdChcIkREXCIpLDIpICsgZncoNykrJy4nICtcbiAgICAgICAgZncoMTIpICsgdC5mb3JtYXQoXCJNTVwiKSArIGZ3KDcpK1wiLlwiICtcbiAgICAgICAgZncoIDgpICsgdC5mb3JtYXQoXCJZWVwiKSArICcgJyArXG4gICAgICAgIGZ3KDE2KSArIHQuZm9ybWF0KFwiSEhcIikgKyBjb2wgPSBmdyg3KSsnOicgK1xuICAgICAgICBmdygxNCkgKyB0LmZvcm1hdChcIm1tXCIpICsgY29sID0gZncoMSkrJzonICtcbiAgICAgICAgZncoIDQpICsgdC5mb3JtYXQoXCJzc1wiKSArICcgJ1xuXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcblxub3duZXJOYW1lID0gKHN0YXQpIC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIHVzZXJuYW1lIHN0YXQudWlkXG4gICAgY2F0Y2hcbiAgICAgICAgc3RhdC51aWRcblxuZ3JvdXBOYW1lID0gKHN0YXQpIC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIGdyb3VwbmFtZSBzdGF0LmdpZFxuICAgIGNhdGNoXG4gICAgICAgIHN0YXQuZ2lkXG5cbm93bmVyU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgb3duID0gb3duZXJOYW1lKHN0YXQpXG4gICAgZ3JwID0gZ3JvdXBOYW1lKHN0YXQpXG4gICAgb2NsID0gY29sb3JzWydfdXNlcnMnXVtvd25dXG4gICAgb2NsID0gY29sb3JzWydfdXNlcnMnXVsnZGVmYXVsdCddIHVubGVzcyBvY2xcbiAgICBnY2wgPSBjb2xvcnNbJ19ncm91cHMnXVtncnBdXG4gICAgZ2NsID0gY29sb3JzWydfZ3JvdXBzJ11bJ2RlZmF1bHQnXSB1bmxlc3MgZ2NsXG4gICAgb2NsICsgcnBhZChvd24sIHN0YXRzLm1heE93bmVyTGVuZ3RoKSArIFwiIFwiICsgZ2NsICsgcnBhZChncnAsIHN0YXRzLm1heEdyb3VwTGVuZ3RoKVxuXG4jIDAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG5cbnJ3eFN0cmluZyA9IChzdGF0LCBpKSAtPlxuICAgIFxuICAgIG1vZGUgPSBzdGF0Lm1vZGVcbiAgICBcbiAgICBpZiBhcmdzLm5lcmR5XG4gICAgICAgIHIgPSAnIFxcdWY0NDEnXG4gICAgICAgIHcgPSAnXFx1ZjA0MCdcbiAgICAgICAgeCA9IHN0YXQuaXNEaXJlY3RvcnkoKSBhbmQgJ1xcdWYwODUnIG9yICdcXHVmMDEzJ1xuICAgICAgICBcbiAgICAgICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjEwMCkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWydyKyddICsgciBvciBjb2xvcnNbJ19yaWdodHMnXVsnci0nXSArIHIpICtcbiAgICAgICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjAxMCkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWyd3KyddICsgdyBvciBjb2xvcnNbJ19yaWdodHMnXVsndy0nXSArIHcpICtcbiAgICAgICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjAwMSkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWyd4KyddICsgeCBvciBjb2xvcnNbJ19yaWdodHMnXVsneC0nXSArIHgpXG4gICAgZWxzZVxuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMTAwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3IrJ10gKyAnIHInIG9yIGNvbG9yc1snX3JpZ2h0cyddWydyLSddICsgJyAgJykgK1xuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDEwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3crJ10gKyAnIHcnIG9yIGNvbG9yc1snX3JpZ2h0cyddWyd3LSddICsgJyAgJykgK1xuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDAxKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3grJ10gKyAnIHgnIG9yIGNvbG9yc1snX3JpZ2h0cyddWyd4LSddICsgJyAgJylcblxucmlnaHRzU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgdXIgPSByd3hTdHJpbmcoc3RhdCwgMilcbiAgICBnciA9IHJ3eFN0cmluZyhzdGF0LCAxKVxuICAgIHJvID0gcnd4U3RyaW5nKHN0YXQsIDApICsgXCIgXCJcbiAgICB1ciArIGdyICsgcm8gKyByZXNldFxuXG5nZXRQcmVmaXggPSAoc3RhdCwgZGVwdGgpIC0+XG4gICAgXG4gICAgcyA9ICcnXG4gICAgaWYgYXJncy5yaWdodHNcbiAgICAgICAgcyArPSByaWdodHNTdHJpbmcgc3RhdFxuICAgICAgICBzICs9IFwiIFwiXG4gICAgaWYgYXJncy5vd25lclxuICAgICAgICBzICs9IG93bmVyU3RyaW5nIHN0YXRcbiAgICAgICAgcyArPSBcIiBcIlxuICAgIGlmIGFyZ3MubWRhdGVcbiAgICAgICAgcyArPSB0aW1lU3RyaW5nIHN0YXRcbiAgICAgICAgcyArPSByZXNldFxuICAgIGlmIGFyZ3MuYnl0ZXNcbiAgICAgICAgcyArPSBzaXplU3RyaW5nIHN0YXRcbiAgICAgICAgXG4gICAgaWYgZGVwdGggYW5kIGFyZ3MudHJlZVxuICAgICAgICBzICs9IHJwYWQgJycsIGRlcHRoKjRcbiAgICAgICAgXG4gICAgaWYgcy5sZW5ndGggPT0gMCBhbmQgYXJncy5vZmZzZXRcbiAgICAgICAgcyArPSAnICAgICAgICdcbiAgICBzXG4gICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwXG4jICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbnNvcnQgPSAobGlzdCwgc3RhdHMsIGV4dHM9W10pIC0+XG4gICAgXG4gICAgXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbiAgICBtb21lbnQgPSByZXF1aXJlICdtb21lbnQnXG4gICAgXG4gICAgbCA9IF8uemlwIGxpc3QsIHN0YXRzLCBbMC4uLmxpc3QubGVuZ3RoXSwgKGV4dHMubGVuZ3RoID4gMCBhbmQgZXh0cyBvciBbMC4uLmxpc3QubGVuZ3RoXSlcbiAgICBcbiAgICBpZiBhcmdzLmtpbmRcbiAgICAgICAgaWYgZXh0cyA9PSBbXSB0aGVuIHJldHVybiBsaXN0XG4gICAgICAgIGwuc29ydCgoYSxiKSAtPlxuICAgICAgICAgICAgaWYgYVszXSA+IGJbM10gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgaWYgYVszXSA8IGJbM10gdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3MudGltZVxuICAgICAgICAgICAgICAgIG0gPSBtb21lbnQoYVsxXS5tdGltZSlcbiAgICAgICAgICAgICAgICBpZiBtLmlzQWZ0ZXIoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgICAgIGlmIG0uaXNCZWZvcmUoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3Muc2l6ZVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA+IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICBlbHNlIGlmIGFyZ3MudGltZVxuICAgICAgICBsLnNvcnQoKGEsYikgLT5cbiAgICAgICAgICAgIG0gPSBtb21lbnQoYVsxXS5tdGltZSlcbiAgICAgICAgICAgIGlmIG0uaXNBZnRlcihiWzFdLm10aW1lKSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICBpZiBtLmlzQmVmb3JlKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhcmdzLnNpemVcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPiBiWzFdLnNpemUgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA8IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYVsyXSA+IGJbMl0gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgLTEpXG4gICAgZWxzZSBpZiBhcmdzLnNpemVcbiAgICAgICAgbC5zb3J0KChhLGIpIC0+XG4gICAgICAgICAgICBpZiBhWzFdLnNpemUgPiBiWzFdLnNpemUgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICBfLnVuemlwKGwpWzBdXG5cbiMgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICBcbiMgMDAwICAwMDAgICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAwMDAgIDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcblxuaWdub3JlID0gKHApIC0+XG4gICAgXG4gICAgYmFzZSA9IHNsYXNoLmJhc2VuYW1lIHBcbiAgICByZXR1cm4gdHJ1ZSBpZiBiYXNlWzBdID09ICckJ1xuICAgIHJldHVybiB0cnVlIGlmIGJhc2UgPT0gJ2Rlc2t0b3AuaW5pJyAgICBcbiAgICByZXR1cm4gdHJ1ZSBpZiBiYXNlLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCAnbnR1c2VyJ1xuICAgIGZhbHNlXG4gICAgXG4jIDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwXG4jIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAgICAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMFxuXG5saXN0RmlsZXMgPSAocCwgZmlsZXMsIGRlcHRoKSAtPlxuICAgIFxuICAgIGFscGggPSBbXSBpZiBhcmdzLmFscGhhYmV0aWNhbFxuICAgIGRpcnMgPSBbXSAjIHZpc2libGUgZGlyc1xuICAgIGZpbHMgPSBbXSAjIHZpc2libGUgZmlsZXNcbiAgICBkc3RzID0gW10gIyBkaXIgc3RhdHNcbiAgICBmc3RzID0gW10gIyBmaWxlIHN0YXRzXG4gICAgZXh0cyA9IFtdICMgZmlsZSBleHRlbnNpb25zXG5cbiAgICBpZiBhcmdzLm93bmVyXG4gICAgICAgIFxuICAgICAgICBmaWxlcy5mb3JFYWNoIChycCkgLT5cbiAgICAgICAgICAgIGlmIHNsYXNoLmlzQWJzb2x1dGUgcnBcbiAgICAgICAgICAgICAgICBmaWxlID0gc2xhc2gucmVzb2x2ZSBycFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZpbGUgID0gc2xhc2guam9pbiBwLCBycFxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgc3RhdCA9IGZzLmxzdGF0U3luYyhmaWxlKVxuICAgICAgICAgICAgICAgIG9sID0gb3duZXJOYW1lKHN0YXQpLmxlbmd0aFxuICAgICAgICAgICAgICAgIGdsID0gZ3JvdXBOYW1lKHN0YXQpLmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIG9sID4gc3RhdHMubWF4T3duZXJMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubWF4T3duZXJMZW5ndGggPSBvbFxuICAgICAgICAgICAgICAgIGlmIGdsID4gc3RhdHMubWF4R3JvdXBMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubWF4R3JvdXBMZW5ndGggPSBnbFxuICAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuICAgIGZpbGVzLmZvckVhY2ggKHJwKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgc2xhc2guaXNBYnNvbHV0ZSBycFxuICAgICAgICAgICAgZmlsZSAgPSBzbGFzaC5yZXNvbHZlIHJwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZpbGUgID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIHAsIHJwXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGlnbm9yZSBycFxuICAgICAgICBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBsc3RhdCA9IGZzLmxzdGF0U3luYyBmaWxlXG4gICAgICAgICAgICBsaW5rICA9IGxzdGF0LmlzU3ltYm9saWNMaW5rKClcbiAgICAgICAgICAgIHN0YXQgID0gbGluayBhbmQgZnMuc3RhdFN5bmMoZmlsZSkgb3IgbHN0YXRcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBpZiBsaW5rXG4gICAgICAgICAgICAgICAgc3RhdCA9IGxzdGF0XG4gICAgICAgICAgICAgICAgc3RhdHMuYnJva2VuTGlua3MucHVzaCBmaWxlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgIyBsb2dfZXJyb3IgXCJjYW4ndCByZWFkIGZpbGU6IFwiLCBmaWxlLCBsaW5rXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgZXh0ICA9IHNsYXNoLmV4dCBmaWxlXG4gICAgICAgIG5hbWUgPSBzbGFzaC5iYXNlIGZpbGVcbiAgICAgICAgXG4gICAgICAgIGlmIG5hbWVbMF0gPT0gJy4nXG4gICAgICAgICAgICBleHQgPSBuYW1lLnN1YnN0cigxKSArIHNsYXNoLmV4dG5hbWUgZmlsZVxuICAgICAgICAgICAgbmFtZSA9ICcnXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgbmFtZS5sZW5ndGggYW5kIG5hbWVbbmFtZS5sZW5ndGgtMV0gIT0gJ1xccicgb3IgYXJncy5hbGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcyA9IGdldFByZWZpeCBzdGF0LCBkZXB0aFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc3RhdC5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICAgICAgaWYgbm90IGFyZ3MuZmlsZXNcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IGFyZ3MudHJlZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbmFtZS5zdGFydHNXaXRoICcuLydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gbmFtZVsyLi5dXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gZGlyU3RyaW5nIG5hbWUsIGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gbGlua1N0cmluZyBmaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJzLnB1c2ggcytyZXNldFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxwaC5wdXNoIHMrcmVzZXQgaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICAgICAgICAgICAgICAgICAgZHN0cy5wdXNoIHN0YXRcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubnVtX2RpcnMgKz0gMVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMuaGlkZGVuX2RpcnMgKz0gMVxuICAgICAgICAgICAgZWxzZSAjIGlmIHBhdGggaXMgZmlsZVxuICAgICAgICAgICAgICAgIGlmIG5vdCBhcmdzLmRpcnNcbiAgICAgICAgICAgICAgICAgICAgcyArPSBuYW1lU3RyaW5nIG5hbWUsIGV4dFxuICAgICAgICAgICAgICAgICAgICBpZiBleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gZXh0U3RyaW5nIG5hbWUsIGV4dFxuICAgICAgICAgICAgICAgICAgICBpZiBsaW5rXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGxpbmtTdHJpbmcgZmlsZVxuICAgICAgICAgICAgICAgICAgICBmaWxzLnB1c2ggcytyZXNldFxuICAgICAgICAgICAgICAgICAgICBhbHBoLnB1c2ggcytyZXNldCBpZiBhcmdzLmFscGhhYmV0aWNhbFxuICAgICAgICAgICAgICAgICAgICBmc3RzLnB1c2ggc3RhdFxuICAgICAgICAgICAgICAgICAgICBleHRzLnB1c2ggZXh0XG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm51bV9maWxlcyArPSAxXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZmlsZXMgKz0gMVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBzdGF0LmlzRmlsZSgpXG4gICAgICAgICAgICAgICAgc3RhdHMuaGlkZGVuX2ZpbGVzICs9IDFcbiAgICAgICAgICAgIGVsc2UgaWYgc3RhdC5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICAgICAgc3RhdHMuaGlkZGVuX2RpcnMgKz0gMVxuXG4gICAgaWYgYXJncy5zaXplIG9yIGFyZ3Mua2luZCBvciBhcmdzLnRpbWVcbiAgICAgICAgaWYgZGlycy5sZW5ndGggYW5kIG5vdCBhcmdzLmZpbGVzXG4gICAgICAgICAgICBkaXJzID0gc29ydCBkaXJzLCBkc3RzXG4gICAgICAgIGlmIGZpbHMubGVuZ3RoXG4gICAgICAgICAgICBmaWxzID0gc29ydCBmaWxzLCBmc3RzLCBleHRzXG5cbiAgICBpZiBhcmdzLmFscGhhYmV0aWNhbFxuICAgICAgICBsb2cgcCBmb3IgcCBpbiBhbHBoXG4gICAgZWxzZVxuICAgICAgICBsb2cgZCBmb3IgZCBpbiBkaXJzXG4gICAgICAgIGxvZyBmIGZvciBmIGluIGZpbHNcblxuIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAgMDAwICAwMDAgICAwMDBcblxubGlzdERpciA9IChwLCBvcHQ9e30pIC0+XG4gICAgICAgICAgICBcbiAgICBpZiBhcmdzLnJlY3Vyc2VcbiAgICAgICAgZGVwdGggPSBwYXRoRGVwdGggcCwgb3B0XG4gICAgICAgIHJldHVybiBpZiBkZXB0aCA+IGFyZ3MuZGVwdGhcbiAgICBcbiAgICBwcyA9IHBcblxuICAgIHRyeVxuICAgICAgICBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKHApXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIHRydWVcblxuICAgIGlmIGFyZ3MuZmluZFxuICAgICAgICBmaWxlcyA9IGZpbGVzLmZpbHRlciAoZikgLT5cbiAgICAgICAgICAgIGYgaWYgUmVnRXhwKGFyZ3MuZmluZCkudGVzdCBmXG4gICAgICAgICAgICBcbiAgICBpZiBhcmdzLmZpbmQgYW5kIG5vdCBmaWxlcz8ubGVuZ3RoXG4gICAgICAgIHRydWVcbiAgICBlbHNlIGlmIGFyZ3MucGF0aHMubGVuZ3RoID09IDEgYW5kIGFyZ3MucGF0aHNbMF0gPT0gJy4nIGFuZCBub3QgYXJncy5yZWN1cnNlXG4gICAgICAgIGxvZyByZXNldFxuICAgIGVsc2UgaWYgYXJncy50cmVlXG4gICAgICAgIGxvZyBnZXRQcmVmaXgoc2xhc2guaXNEaXIocCksIGRlcHRoLTEpICsgZGlyU3RyaW5nKHNsYXNoLmJhc2UocHMpLCBzbGFzaC5leHQocHMpKSArIHJlc2V0XG4gICAgZWxzZVxuICAgICAgICBzID0gY29sb3JzWydfYXJyb3cnXSArIFwiIOKWtiBcIiArIGNvbG9yc1snX2hlYWRlciddWzBdXG4gICAgICAgIHBzID0gc2xhc2gudGlsZGUgc2xhc2gucmVzb2x2ZSBwXG4gICAgICAgIHJzID0gc2xhc2gucmVsYXRpdmUgcHMsIHByb2Nlc3MuY3dkKClcbiAgICAgICAgaWYgcnMubGVuZ3RoIDwgcHMubGVuZ3RoXG4gICAgICAgICAgICBwcyA9IHJzXG5cbiAgICAgICAgaWYgcHMgPT0gJy8nXG4gICAgICAgICAgICBzICs9ICcvJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzcCA9IHBzLnNwbGl0KCcvJylcbiAgICAgICAgICAgIHMgKz0gY29sb3JzWydfaGVhZGVyJ11bMF0gKyBzcC5zaGlmdCgpXG4gICAgICAgICAgICB3aGlsZSBzcC5sZW5ndGhcbiAgICAgICAgICAgICAgICBwbiA9IHNwLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBpZiBwblxuICAgICAgICAgICAgICAgICAgICBzICs9IGNvbG9yc1snX2hlYWRlciddWzFdICsgJy8nXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gY29sb3JzWydfaGVhZGVyJ11bc3AubGVuZ3RoID09IDAgYW5kIDIgb3IgMF0gKyBwblxuICAgICAgICBsb2cgcmVzZXRcbiAgICAgICAgbG9nIHMgKyBcIiBcIiArIHJlc2V0XG4gICAgICAgIGxvZyByZXNldFxuXG4gICAgaWYgZmlsZXM/Lmxlbmd0aFxuICAgICAgICBsaXN0RmlsZXMgcCwgZmlsZXMsIGRlcHRoXG5cbiAgICBpZiBhcmdzLnJlY3Vyc2VcbiAgICAgICAgXG4gICAgICAgIGRvUmVjdXJzZSA9IChmKSAtPiBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIHNsYXNoLmJhc2VuYW1lKGYpIGluIGFyZ3MuaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgc2xhc2guZXh0KGYpID09ICdhcHAnXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgbm90IGFyZ3MuYWxsIGFuZCBmWzBdID09ICcuJ1xuICAgICAgICAgICAgc2xhc2guaXNEaXIgc2xhc2guam9pbiBwLCBmXG4gICAgICAgICAgICBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBmb3IgcHIgaW4gZnMucmVhZGRpclN5bmMocCkuZmlsdGVyIGRvUmVjdXJzZVxuICAgICAgICAgICAgICAgIGxpc3REaXIgc2xhc2gucmVzb2x2ZShzbGFzaC5qb2luIHAsIHByKSwgb3B0XG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgbXNnID0gZXJyLm1lc3NhZ2VcbiAgICAgICAgICAgIG1zZyA9IFwicGVybWlzc2lvbiBkZW5pZWRcIiBpZiBtc2cuc3RhcnRzV2l0aCBcIkVBQ0NFU1wiXG4gICAgICAgICAgICBtc2cgPSBcInBlcm1pc3Npb24gZGVuaWVkXCIgaWYgbXNnLnN0YXJ0c1dpdGggXCJFUEVSTVwiXG4gICAgICAgICAgICBsb2dfZXJyb3IgbXNnXG4gICAgICAgICAgICBcbnBhdGhEZXB0aCA9IChwLCBvcHQpIC0+XG4gICAgXG4gICAgcmVsID0gc2xhc2gucmVsYXRpdmUgcCwgb3B0Py5yZWxhdGl2ZVRvID8gcHJvY2Vzcy5jd2QoKVxuICAgIHJldHVybiAwIGlmIHAgPT0gJy4nXG4gICAgcmVsLnNwbGl0KCcvJykubGVuZ3RoXG5cbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuXG5tYWluID0gLT5cbiAgICAgICAgICAgIFxuICAgIHBhdGhzdGF0cyA9IGFyZ3MucGF0aHMubWFwIChmKSAtPlxuICAgICAgICBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBbZiwgZnMuc3RhdFN5bmMoZildXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgICBsb2dfZXJyb3IgJ25vIHN1Y2ggZmlsZTogJywgZlxuICAgICAgICAgICAgW11cbiAgICBcbiAgICBmaWxlc3RhdHMgPSBwYXRoc3RhdHMuZmlsdGVyKCAoZikgLT4gZi5sZW5ndGggYW5kIG5vdCBmWzFdLmlzRGlyZWN0b3J5KCkgKVxuICAgIFxuICAgIGlmIGZpbGVzdGF0cy5sZW5ndGggPiAwXG4gICAgICAgIGxvZyByZXNldFxuICAgICAgICBsaXN0RmlsZXMgcHJvY2Vzcy5jd2QoKSwgZmlsZXN0YXRzLm1hcCggKHMpIC0+IHNbMF0gKVxuICAgIFxuICAgIGZvciBwIGluIHBhdGhzdGF0cy5maWx0ZXIoIChmKSAtPiBmLmxlbmd0aCBhbmQgZlsxXS5pc0RpcmVjdG9yeSgpIClcbiAgICAgICAgbG9nICcnIGlmIGFyZ3MudHJlZVxuICAgICAgICBsaXN0RGlyIHBbMF0sIHJlbGF0aXZlVG86YXJncy50cmVlIGFuZCBzbGFzaC5kaXJuYW1lKHBbMF0pIG9yIHByb2Nlc3MuY3dkKClcbiAgICBcbiAgICBsb2cgXCJcIlxuICAgIGlmIGFyZ3MuaW5mb1xuICAgICAgICBsb2cgQlcoMSkgKyBcIiBcIiArXG4gICAgICAgIGZ3KDgpICsgc3RhdHMubnVtX2RpcnMgKyAoc3RhdHMuaGlkZGVuX2RpcnMgYW5kIGZ3KDQpICsgXCIrXCIgKyBmdyg1KSArIChzdGF0cy5oaWRkZW5fZGlycykgb3IgXCJcIikgKyBmdyg0KSArIFwiIGRpcnMgXCIgK1xuICAgICAgICBmdyg4KSArIHN0YXRzLm51bV9maWxlcyArIChzdGF0cy5oaWRkZW5fZmlsZXMgYW5kIGZ3KDQpICsgXCIrXCIgKyBmdyg1KSArIChzdGF0cy5oaWRkZW5fZmlsZXMpIG9yIFwiXCIpICsgZncoNCkgKyBcIiBmaWxlcyBcIiArXG4gICAgICAgIGZ3KDgpICsgdGltZShwcm9jZXNzLmhydGltZS5iaWdpbnQ/KCktc3RhcnRUaW1lKSArIFwiIFwiICtcbiAgICAgICAgcmVzZXRcbiAgICBcbmlmIGFyZ3NcbiAgICBpbml0QXJncygpXG4gICAgbWFpbigpXG5lbHNlXG4gICAgbW9kdWxlTWFpbiA9IChhcmcsIG9wdD17fSkgLT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCB0eXBlb2YgYXJnXG4gICAgICAgICAgICB3aGVuICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgYXJncyA9IE9iamVjdC5hc3NpZ24ge30sIG9wdFxuICAgICAgICAgICAgICAgIGFyZ3MucGF0aHMgPz0gW11cbiAgICAgICAgICAgICAgICBhcmdzLnBhdGhzLnB1c2ggYXJnXG4gICAgICAgICAgICB3aGVuICdvYmplY3QnXG4gICAgICAgICAgICAgICAgYXJncyA9IE9iamVjdC5hc3NpZ24ge30sIGFyZ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFyZ3MgPSBwYXRoczpbJy4nXVxuICAgICAgICBpbml0QXJncygpXG4gICAgICAgIFxuICAgICAgICBvdXQgPSAnJ1xuICAgICAgICBvbGRsb2cgPSBjb25zb2xlLmxvZ1xuICAgICAgICBjb25zb2xlLmxvZyA9IC0+IFxuICAgICAgICAgICAgZm9yIGFyZyBpbiBhcmd1bWVudHMgdGhlbiBvdXQgKz0gU3RyaW5nKGFyZylcbiAgICAgICAgICAgIG91dCArPSAnXFxuJ1xuICAgICAgICBcbiAgICAgICAgbWFpbigpXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyA9IG9sZGxvZ1xuICAgICAgICBvdXRcbiAgICBcbiAgICBtb2R1bGUuZXhwb3J0cyA9IG1vZHVsZU1haW5cbiAgICAiXX0=
//# sourceURL=../coffee/color-ls.coffee