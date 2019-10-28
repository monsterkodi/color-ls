// koffee 1.4.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGlaQUFBO0lBQUE7O0FBUUEsU0FBQSxnRUFBMEIsQ0FBQzs7QUFFM0IsTUFBdUIsT0FBQSxDQUFRLE1BQVIsQ0FBdkIsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjOztBQUNkLEVBQUEsR0FBUyxPQUFBLENBQVEsSUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBRVQsSUFBQSxHQUFROztBQUNSLEtBQUEsR0FBUTs7QUFFUixJQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTLElBQUksQ0FBQzs7QUFDZCxFQUFBLEdBQVMsSUFBSSxDQUFDLEVBQUUsQ0FBQzs7QUFDakIsRUFBQSxHQUFTLElBQUksQ0FBQyxFQUFFLENBQUM7O0FBQ2pCLEVBQUEsR0FBUyxTQUFDLENBQUQ7V0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVUsQ0FBQSxDQUFBO0FBQXpCOztBQUNULEVBQUEsR0FBUyxTQUFDLENBQUQ7V0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVUsQ0FBQSxDQUFBO0FBQXpCOztBQUVULEtBQUEsR0FDSTtJQUFBLFFBQUEsRUFBZ0IsQ0FBaEI7SUFDQSxTQUFBLEVBQWdCLENBRGhCO0lBRUEsV0FBQSxFQUFnQixDQUZoQjtJQUdBLFlBQUEsRUFBZ0IsQ0FIaEI7SUFJQSxjQUFBLEVBQWdCLENBSmhCO0lBS0EsY0FBQSxFQUFnQixDQUxoQjtJQU1BLFdBQUEsRUFBZ0IsRUFOaEI7OztBQWNKLElBQUcsQ0FBSSxNQUFNLENBQUMsTUFBWCxJQUFxQixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQWQsS0FBb0IsR0FBNUM7SUFFSSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7SUFD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QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FqQlo7SUFrQkEsS0FBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FsQlo7SUFtQkEsS0FBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FuQlo7SUFvQkEsS0FBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FwQlo7SUFxQkEsTUFBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FyQlo7SUFzQkEsS0FBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVB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QUlKLEtBSkQsRUFESDs7QUFyQkc7O0FBNEJQLElBQUcsSUFBSDtJQUNJLFFBQUEsQ0FBQTtJQUNBLElBQUEsQ0FBQSxFQUZKO0NBQUEsTUFBQTtJQUlJLFVBQUEsR0FBYSxTQUFDLEdBQUQsRUFBTSxHQUFOO0FBRVQsWUFBQTs7WUFGZSxNQUFJOztBQUVuQixnQkFBTyxPQUFPLEdBQWQ7QUFBQSxpQkFDUyxRQURUO2dCQUVRLElBQUEsR0FBTyxNQUFNLENBQUMsTUFBUCxDQUFjLEVBQWQsRUFBa0IsR0FBbEI7O29CQUNQLElBQUksQ0FBQzs7b0JBQUwsSUFBSSxDQUFDLFFBQVM7O2dCQUNkLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBWCxDQUFnQixHQUFoQjtBQUhDO0FBRFQsaUJBS1MsUUFMVDtnQkFNUSxJQUFBLEdBQU8sTUFBTSxDQUFDLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEdBQWxCO0FBRE47QUFMVDtnQkFRUSxJQUFBLEdBQU87b0JBQUEsS0FBQSxFQUFNLENBQUMsR0FBRCxDQUFOOztBQVJmO1FBU0EsUUFBQSxDQUFBO1FBRUEsR0FBQSxHQUFNO1FBQ04sTUFBQSxHQUFTLE9BQU8sQ0FBQztRQUNqQixPQUFPLENBQUMsR0FBUixHQUFjLFNBQUE7QUFDVixnQkFBQTtBQUFBLGlCQUFBLDJDQUFBOztnQkFBMEIsR0FBQSxJQUFPLE1BQUEsQ0FBTyxHQUFQO0FBQWpDO21CQUNBLEdBQUEsSUFBTztRQUZHO1FBSWQsSUFBQSxDQUFBO1FBRUEsT0FBTyxDQUFDLEdBQVIsR0FBYztlQUNkO0lBdEJTO0lBd0JiLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFdBNUJyQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgICAgMDAwICAgICAgIDAwMDAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgIDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAgICAwMDBcbiAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAgICAgIDAwMDAwMDAgIDAwMDAwMDBcbiMjI1xuXG5zdGFydFRpbWUgPSBwcm9jZXNzLmhydGltZS5iaWdpbnQ/KClcblxueyBscGFkLCBycGFkLCB0aW1lIH0gPSByZXF1aXJlICdrc3RyJ1xuZnMgICAgID0gcmVxdWlyZSAnZnMnXG5zbGFzaCAgPSByZXF1aXJlICdrc2xhc2gnXG5hbnNpICAgPSByZXF1aXJlICdhbnNpLTI1Ni1jb2xvcnMnXG51dGlsICAgPSByZXF1aXJlICd1dGlsJ1xuXG5hcmdzICA9IG51bGxcbnRva2VuID0ge31cblxuYm9sZCAgID0gJ1xceDFiWzFtJ1xucmVzZXQgID0gYW5zaS5yZXNldFxuZmcgICAgID0gYW5zaS5mZy5nZXRSZ2JcbkJHICAgICA9IGFuc2kuYmcuZ2V0UmdiXG5mdyAgICAgPSAoaSkgLT4gYW5zaS5mZy5ncmF5c2NhbGVbaV1cbkJXICAgICA9IChpKSAtPiBhbnNpLmJnLmdyYXlzY2FsZVtpXVxuXG5zdGF0cyA9ICMgY291bnRlcnMgZm9yIChoaWRkZW4pIGRpcnMvZmlsZXNcbiAgICBudW1fZGlyczogICAgICAgMFxuICAgIG51bV9maWxlczogICAgICAwXG4gICAgaGlkZGVuX2RpcnM6ICAgIDBcbiAgICBoaWRkZW5fZmlsZXM6ICAgMFxuICAgIG1heE93bmVyTGVuZ3RoOiAwXG4gICAgbWF4R3JvdXBMZW5ndGg6IDBcbiAgICBicm9rZW5MaW5rczogICAgW11cblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDBcbiMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgMDAwMCAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbmlmIG5vdCBtb2R1bGUucGFyZW50IG9yIG1vZHVsZS5wYXJlbnQuaWQgPT0gJy4nXG5cbiAgICBrYXJnID0gcmVxdWlyZSAna2FyZydcbiAgICBhcmdzID0ga2FyZyBcIlwiXCJcbiAgICBjb2xvci1sc1xuICAgICAgICBwYXRocyAgICAgICAgIC4gPyB0aGUgZmlsZShzKSBhbmQvb3IgZm9sZGVyKHMpIHRvIGRpc3BsYXkgLiAqKlxuICAgICAgICBhbGwgICAgICAgICAgIC4gPyBzaG93IGRvdCBmaWxlcyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBkaXJzICAgICAgICAgIC4gPyBzaG93IG9ubHkgZGlycyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBmaWxlcyAgICAgICAgIC4gPyBzaG93IG9ubHkgZmlsZXMgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBieXRlcyAgICAgICAgIC4gPyBpbmNsdWRlIHNpemUgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBtZGF0ZSAgICAgICAgIC4gPyBpbmNsdWRlIG1vZGlmaWNhdGlvbiBkYXRlICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBsb25nICAgICAgICAgIC4gPyBpbmNsdWRlIHNpemUgYW5kIGRhdGUgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBvd25lciAgICAgICAgIC4gPyBpbmNsdWRlIG93bmVyIGFuZCBncm91cCAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICByaWdodHMgICAgICAgIC4gPyBpbmNsdWRlIHJpZ2h0cyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBzaXplICAgICAgICAgIC4gPyBzb3J0IGJ5IHNpemUgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICB0aW1lICAgICAgICAgIC4gPyBzb3J0IGJ5IHRpbWUgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBraW5kICAgICAgICAgIC4gPyBzb3J0IGJ5IGtpbmQgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBuZXJkeSAgICAgICAgIC4gPyB1c2UgbmVyZCBmb250IGljb25zICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBwcmV0dHkgICAgICAgIC4gPyBwcmV0dHkgc2l6ZSBhbmQgYWdlICAgICAgICAgICAgIC4gPSB0cnVlXG4gICAgICAgIGlnbm9yZSAgICAgICAgLiA/IGRvbid0IHJlY3Vyc2UgaW50byAgICAgICAgICAgICAgLiA9IG5vZGVfbW9kdWxlcyAuZ2l0XG4gICAgICAgIGluZm8gICAgICAgICAgLiA/IHNob3cgc3RhdGlzdGljcyAgICAgICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBJXG4gICAgICAgIGFscGhhYmV0aWNhbCAgLiA/IGRvbid0IGdyb3VwIGRpcnMgYmVmb3JlIGZpbGVzICAgLiA9IGZhbHNlIC4gLSBBXG4gICAgICAgIG9mZnNldCAgICAgICAgLiA/IGluZGVudCBzaG9ydCBsaXN0aW5ncyAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBPXG4gICAgICAgIHJlY3Vyc2UgICAgICAgLiA/IHJlY3Vyc2UgaW50byBzdWJkaXJzICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBSXG4gICAgICAgIHRyZWUgICAgICAgICAgLiA/IHJlY3Vyc2UgYW5kIGluZGVudCAgICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBUXG4gICAgICAgIGRlcHRoICAgICAgICAgLiA/IHJlY3Vyc2lvbiBkZXB0aCAgICAgICAgICAgICAgICAgLiA9IOKIniAgICAgLiAtIERcbiAgICAgICAgZmluZCAgICAgICAgICAuID8gZmlsdGVyIHdpdGggYSByZWdleHAgICAgICAgICAgICAgICAgICAgICAgLiAtIEZcbiAgICAgICAgZGVidWcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgLiAtIFhcbiAgICBcbiAgICB2ZXJzaW9uICAgICAgI3tyZXF1aXJlKFwiI3tfX2Rpcm5hbWV9Ly4uL3BhY2thZ2UuanNvblwiKS52ZXJzaW9ufVxuICAgIFwiXCJcIlxuICAgIFxuaW5pdEFyZ3MgPSAtPlxuICAgICAgICBcbiAgICBpZiBhcmdzLnNpemVcbiAgICAgICAgYXJncy5maWxlcyA9IHRydWVcbiAgICBcbiAgICBpZiBhcmdzLmxvbmdcbiAgICAgICAgYXJncy5ieXRlcyA9IHRydWVcbiAgICAgICAgYXJncy5tZGF0ZSA9IHRydWVcbiAgICAgICAgXG4gICAgaWYgYXJncy50cmVlXG4gICAgICAgIGFyZ3MucmVjdXJzZSA9IHRydWVcbiAgICAgICAgYXJncy5vZmZzZXQgID0gZmFsc2VcbiAgICBcbiAgICBpZiBhcmdzLmRpcnMgYW5kIGFyZ3MuZmlsZXNcbiAgICAgICAgYXJncy5kaXJzID0gYXJncy5maWxlcyA9IGZhbHNlXG4gICAgICAgIFxuICAgIGlmIGFyZ3MuaWdub3JlPy5sZW5ndGhcbiAgICAgICAgYXJncy5pZ25vcmUgPSBhcmdzLmlnbm9yZS5zcGxpdCAnICcgXG4gICAgZWxzZVxuICAgICAgICBhcmdzLmlnbm9yZSA9IFtdXG4gICAgICAgIFxuICAgIGlmIGFyZ3MuZGVwdGggPT0gJ+KInicgdGhlbiBhcmdzLmRlcHRoID0gSW5maW5pdHlcbiAgICBlbHNlIGFyZ3MuZGVwdGggPSBNYXRoLm1heCAwLCBwYXJzZUludCBhcmdzLmRlcHRoXG4gICAgaWYgTnVtYmVyLmlzTmFOIGFyZ3MuZGVwdGggdGhlbiBhcmdzLmRlcHRoID0gMFxuICAgICAgICBcbiAgICBpZiBhcmdzLmRlYnVnXG4gICAgICAgIG5vb24gPSByZXF1aXJlICdub29uJ1xuICAgICAgICBsb2cgbm9vbi5zdHJpbmdpZnkgYXJncywgY29sb3JzOnRydWVcbiAgICBcbiAgICBhcmdzLnBhdGhzID0gWycuJ10gdW5sZXNzIGFyZ3MucGF0aHM/Lmxlbmd0aCA+IDBcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuY29sb3JzID1cbiAgICAnY29mZmVlJzogICBbIGJvbGQrZmcoNCw0LDApLCAgZmcoMSwxLDApLCBmZygyLDIsMCkgXVxuICAgICdrb2ZmZWUnOiAgIFsgYm9sZCtmZyg1LDUsMCksICBmZygxLDAsMCksIGZnKDMsMSwwKSBdXG4gICAgJ3B5JzogICAgICAgWyBib2xkK2ZnKDAsMywwKSwgIGZnKDAsMSwwKSwgZmcoMCwyLDApIF1cbiAgICAncmInOiAgICAgICBbIGJvbGQrZmcoNCwwLDApLCAgZmcoMSwwLDApLCBmZygyLDAsMCkgXVxuICAgICdqc29uJzogICAgIFsgYm9sZCtmZyg0LDAsNCksICBmZygxLDAsMSksIGZnKDIsMCwxKSBdXG4gICAgJ2Nzb24nOiAgICAgWyBib2xkK2ZnKDQsMCw0KSwgIGZnKDEsMCwxKSwgZmcoMiwwLDIpIF1cbiAgICAnbm9vbic6ICAgICBbIGJvbGQrZmcoNCw0LDApLCAgZmcoMSwxLDApLCBmZygyLDIsMCkgXVxuICAgICdwbGlzdCc6ICAgIFsgYm9sZCtmZyg0LDAsNCksICBmZygxLDAsMSksIGZnKDIsMCwyKSBdXG4gICAgJ2pzJzogICAgICAgWyBib2xkK2ZnKDUsMCw1KSwgIGZnKDIsMCwyKSwgZmcoMywwLDMpIF1cbiAgICAnY3BwJzogICAgICBbIGJvbGQrZmcoNSw0LDApLCAgZncoMyksICAgICBmZygzLDIsMCkgXVxuICAgICdoJzogICAgICAgIFsgICAgICBmZygzLDEsMCksICBmdygzKSwgICAgIGZnKDIsMSwwKSBdXG4gICAgJ3B5Yyc6ICAgICAgWyAgICAgIGZ3KDUpLCAgICAgIGZ3KDMpLCAgICAgZncoNCkgXVxuICAgICdsb2cnOiAgICAgIFsgICAgICBmdyg1KSwgICAgICBmdygyKSwgICAgIGZ3KDMpIF1cbiAgICAnbG9nJzogICAgICBbICAgICAgZncoNSksICAgICAgZncoMiksICAgICBmdygzKSBdXG4gICAgJ3R4dCc6ICAgICAgWyAgICAgIGZ3KDIwKSwgICAgIGZ3KDMpLCAgICAgZncoNCkgXVxuICAgICdtZCc6ICAgICAgIFsgYm9sZCtmdygyMCksICAgICBmdygzKSwgICAgIGZ3KDQpIF1cbiAgICAnbWFya2Rvd24nOiBbIGJvbGQrZncoMjApLCAgICAgZncoMyksICAgICBmdyg0KSBdXG4gICAgJ3NoJzogICAgICAgWyBib2xkK2ZnKDUsMSwwKSwgIGZnKDIsMCwwKSwgZmcoMywwLDApIF1cbiAgICAncG5nJzogICAgICBbIGJvbGQrZmcoNSwwLDApLCAgZmcoMiwwLDApLCBmZygzLDAsMCkgXVxuICAgICdqcGcnOiAgICAgIFsgYm9sZCtmZygwLDMsMCksICBmZygwLDIsMCksIGZnKDAsMiwwKSBdXG4gICAgJ3B4bSc6ICAgICAgWyBib2xkK2ZnKDEsMSw1KSwgIGZnKDAsMCwyKSwgZmcoMCwwLDQpIF1cbiAgICAndGlmZic6ICAgICBbIGJvbGQrZmcoMSwxLDUpLCAgZmcoMCwwLDMpLCBmZygwLDAsNCkgXVxuICAgICd0Z3onOiAgICAgIFsgYm9sZCtmZygwLDMsNCksICBmZygwLDEsMiksIGZnKDAsMiwzKSBdXG4gICAgJ3BrZyc6ICAgICAgWyBib2xkK2ZnKDAsMyw0KSwgIGZnKDAsMSwyKSwgZmcoMCwyLDMpIF1cbiAgICAnemlwJzogICAgICBbIGJvbGQrZmcoMCwzLDQpLCAgZmcoMCwxLDIpLCBmZygwLDIsMykgXVxuICAgICdkbWcnOiAgICAgIFsgYm9sZCtmZygxLDQsNCksICBmZygwLDIsMiksIGZnKDAsMywzKSBdXG4gICAgJ3R0Zic6ICAgICAgWyBib2xkK2ZnKDIsMSwzKSwgIGZnKDEsMCwyKSwgZmcoMSwwLDIpIF1cblxuICAgICdfZGVmYXVsdCc6IFsgICAgICBmdygxNSksICAgICBmdyg0KSwgICAgIGZ3KDEwKSBdXG4gICAgJ19kaXInOiAgICAgWyBib2xkK0JHKDAsMCwyKStmdygyMyksIGZnKDEsMSw1KSwgYm9sZCtCRygwLDAsMikrZmcoMiwyLDUpIF1cbiAgICAnXy5kaXInOiAgICBbIGJvbGQrQkcoMCwwLDEpK2Z3KDIzKSwgYm9sZCtCRygwLDAsMSkrZmcoMSwxLDUpLCBib2xkK0JHKDAsMCwxKStmZygyLDIsNSkgXVxuICAgICdfbGluayc6ICAgIHsgJ2Fycm93JzogZmcoMSwwLDEpLCAncGF0aCc6IGZnKDQsMCw0KSwgJ2Jyb2tlbic6IEJHKDUsMCwwKStmZyg1LDUsMCkgfVxuICAgICdfYXJyb3cnOiAgICAgQlcoMikrZncoMClcbiAgICAnX2hlYWRlcic6ICBbIGJvbGQrQlcoMikrZmcoMywyLDApLCAgZncoNCksIGJvbGQrQlcoMikrZmcoNSw1LDApIF1cbiAgICAnX3NpemUnOiAgICB7IGI6IFtmZygwLDAsMyksIGZnKDAsMCwyKV0sIGtCOiBbZmcoMCwwLDUpLCBmZygwLDAsMyldLCBNQjogW2ZnKDEsMSw1KSwgZmcoMCwwLDQpXSwgR0I6IFtmZyg0LDQsNSksIGZnKDIsMiw1KV0sIFRCOiBbZmcoNCw0LDUpLCBmZygyLDIsNSldIH1cbiAgICAnX3VzZXJzJzogICB7IHJvb3Q6ICBmZygzLDAsMCksIGRlZmF1bHQ6IGZnKDEsMCwxKSB9XG4gICAgJ19ncm91cHMnOiAgeyB3aGVlbDogZmcoMSwwLDApLCBzdGFmZjogZmcoMCwxLDApLCBhZG1pbjogZmcoMSwxLDApLCBkZWZhdWx0OiBmZygxLDAsMSkgfVxuICAgICdfZXJyb3InOiAgIFsgYm9sZCtCRyg1LDAsMCkrZmcoNSw1LDApLCBib2xkK0JHKDUsMCwwKStmZyg1LDUsNSkgXVxuICAgICdfcmlnaHRzJzpcbiAgICAgICAgICAgICAgICAgICdyKyc6IGJvbGQrQlcoMSkrZncoNilcbiAgICAgICAgICAgICAgICAgICdyLSc6IHJlc2V0K0JXKDEpK2Z3KDIpXG4gICAgICAgICAgICAgICAgICAndysnOiBib2xkK0JXKDEpK2ZnKDIsMiw1KVxuICAgICAgICAgICAgICAgICAgJ3ctJzogcmVzZXQrQlcoMSkrZncoMilcbiAgICAgICAgICAgICAgICAgICd4Kyc6IGJvbGQrQlcoMSkrZmcoNSwwLDApXG4gICAgICAgICAgICAgICAgICAneC0nOiByZXNldCtCVygxKStmdygyKVxuXG51c2VyTWFwID0ge31cbnVzZXJuYW1lID0gKHVpZCkgLT5cbiAgICBpZiBub3QgdXNlck1hcFt1aWRdXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgY2hpbGRwID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbiAgICAgICAgICAgIHVzZXJNYXBbdWlkXSA9IGNoaWxkcC5zcGF3blN5bmMoXCJpZFwiLCBbXCItdW5cIiwgXCIje3VpZH1cIl0pLnN0ZG91dC50b1N0cmluZygndXRmOCcpLnRyaW0oKVxuICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICBsb2cgZVxuICAgIHVzZXJNYXBbdWlkXVxuXG5ncm91cE1hcCA9IG51bGxcbmdyb3VwbmFtZSA9IChnaWQpIC0+XG4gICAgaWYgbm90IGdyb3VwTWFwXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgY2hpbGRwID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbiAgICAgICAgICAgIGdpZHMgPSBjaGlsZHAuc3Bhd25TeW5jKFwiaWRcIiwgW1wiLUdcIl0pLnN0ZG91dC50b1N0cmluZygndXRmOCcpLnNwbGl0KCcgJylcbiAgICAgICAgICAgIGdubXMgPSBjaGlsZHAuc3Bhd25TeW5jKFwiaWRcIiwgW1wiLUduXCJdKS5zdGRvdXQudG9TdHJpbmcoJ3V0ZjgnKS5zcGxpdCgnICcpXG4gICAgICAgICAgICBncm91cE1hcCA9IHt9XG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uLmdpZHMubGVuZ3RoXVxuICAgICAgICAgICAgICAgIGdyb3VwTWFwW2dpZHNbaV1dID0gZ25tc1tpXVxuICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICBsb2cgZVxuICAgIGdyb3VwTWFwW2dpZF1cblxuaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgcHJvY2Vzcy5nZXR1aWRcbiAgICBjb2xvcnNbJ191c2VycyddW3VzZXJuYW1lKHByb2Nlc3MuZ2V0dWlkKCkpXSA9IGZnKDAsNCwwKVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbmxvZ19lcnJvciA9ICgpIC0+XG4gICAgXG4gICAgbG9nIFwiIFwiICsgY29sb3JzWydfZXJyb3InXVswXSArIFwiIFwiICsgYm9sZCArIGFyZ3VtZW50c1swXSArIChhcmd1bWVudHMubGVuZ3RoID4gMSBhbmQgKGNvbG9yc1snX2Vycm9yJ11bMV0gKyBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykuc2xpY2UoMSkuam9pbignICcpKSBvciAnJykgKyBcIiBcIiArIHJlc2V0XG5cbmxpbmtTdHJpbmcgPSAoZmlsZSkgLT4gXG4gICAgXG4gICAgcyAgPSByZXNldCArIGZ3KDEpICsgY29sb3JzWydfbGluayddWydhcnJvdyddICsgXCIg4pa6IFwiIFxuICAgIHMgKz0gY29sb3JzWydfbGluayddWyhmaWxlIGluIHN0YXRzLmJyb2tlbkxpbmtzKSBhbmQgJ2Jyb2tlbicgb3IgJ3BhdGgnXSBcbiAgICB0cnlcbiAgICAgICAgcyArPSBzbGFzaC5wYXRoIGZzLnJlYWRsaW5rU3luYyhmaWxlKVxuICAgIGNhdGNoIGVyclxuICAgICAgICBzICs9ICcgPyAnXG4gICAgc1xuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICBcbiMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuXG5uYW1lU3RyaW5nID0gKG5hbWUsIGV4dCkgLT4gXG4gICAgXG4gICAgaWYgYXJncy5uZXJkeVxuICAgICAgICBpY29ucyA9IHJlcXVpcmUgJy4vaWNvbnMnXG4gICAgICAgIGljb24gPSAoY29sb3JzW2NvbG9yc1tleHRdPyBhbmQgZXh0IG9yICdfZGVmYXVsdCddWzJdICsgKGljb25zLmdldChuYW1lLCBleHQpID8gJyAnKSkgKyAnICdcbiAgICBlbHNlXG4gICAgICAgIGljb24gPSAnJ1xuICAgIFwiIFwiICsgaWNvbiArIGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVswXSArIG5hbWUgKyByZXNldFxuICAgIFxuZG90U3RyaW5nICA9IChleHQpIC0+IFxuICAgIFxuICAgIGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVsxXSArIFwiLlwiICsgcmVzZXRcbiAgICBcbmV4dFN0cmluZyAgPSAobmFtZSwgZXh0KSAtPiBcbiAgICBcbiAgICBpZiBhcmdzLm5lcmR5IGFuZCBuYW1lIFxuICAgICAgICBpY29ucyA9IHJlcXVpcmUgJy4vaWNvbnMnXG4gICAgICAgIGlmIGljb25zLmdldChuYW1lLCBleHQpIHRoZW4gcmV0dXJuICcnXG4gICAgZG90U3RyaW5nKGV4dCkgKyBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMV0gKyBleHQgKyByZXNldFxuICAgIFxuZGlyU3RyaW5nICA9IChuYW1lLCBleHQpIC0+XG4gICAgXG4gICAgYyA9IG5hbWUgYW5kICdfZGlyJyBvciAnXy5kaXInXG4gICAgaWNvbiA9IGFyZ3MubmVyZHkgYW5kIGNvbG9yc1tjXVsyXSArICcgXFx1ZjQxMycgb3IgJydcbiAgICBpY29uICsgY29sb3JzW2NdWzBdICsgKG5hbWUgYW5kIChcIiBcIiArIG5hbWUpIG9yIFwiIFwiKSArIChpZiBleHQgdGhlbiBjb2xvcnNbY11bMV0gKyAnLicgKyBjb2xvcnNbY11bMl0gKyBleHQgZWxzZSBcIlwiKSArIFwiIFwiXG5cbiMgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnNpemVTdHJpbmcgPSAoc3RhdCkgLT5cblxuICAgIGlmIGFyZ3MubmVyZHkgYW5kIGFyZ3MucHJldHR5XG5cbiAgICAgICAgYmFyID0gKG4pIC0+XG4gICAgICAgICAgICBiID0gJ+KWj+KWjuKWjeKWjOKWi+KWiuKWiSdcbiAgICAgICAgICAgIGJbTWF0aC5mbG9vciBuLygxMDAwLzcpXSAgXG4gICAgICAgIFxuICAgICAgICBpZiBzdGF0LnNpemUgPT0gMFxuICAgICAgICAgICAgcmV0dXJuIHJwYWQgJycsIDhcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDBcbiAgICAgICAgICAgIHJldHVybiBjb2xvcnNbJ19zaXplJ11bJ2InXVsxXSArIHJwYWQgYmFyKHN0YXQuc2l6ZSksIDhcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDAwXG4gICAgICAgICAgICByZXR1cm4gZmcoMCwwLDIpICsgJ+KWiCcgKyBycGFkIGJhcihzdGF0LnNpemUvMTApLCA3XG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMDBcbiAgICAgICAgICAgIHJldHVybiBmZygwLDAsMikgKyAn4paI4paIJyArIHJwYWQgYmFyKHN0YXQuc2l6ZS8xMDApLCA2XG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMDAwXG4gICAgICAgICAgICByZXR1cm4gZmcoMCwwLDMpICsgJ+KWiOKWiOKWiCcgKyBycGFkIGJhcihzdGF0LnNpemUvMTAwMCksIDVcbiAgICAgICAgICAgIFxuICAgICAgICBtYiA9IHBhcnNlSW50IHN0YXQuc2l6ZSAvIDEwMDAwMDBcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDAwMDAwXG4gICAgICAgICAgICByZXR1cm4gZmcoMCwwLDIpICsgJ+KWiOKWiOKWiCcgKyBmZygwLDAsMykgKyAn4paIJyAgICsgZmcoMCwwLDMpICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMDAwKSwgNFxuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMDAwMDAwXG4gICAgICAgICAgICByZXR1cm4gZmcoMCwwLDIpICsgJ+KWiOKWiOKWiCcgKyBmZygwLDAsMykgKyAn4paI4paIJyAgKyBmZygwLDAsMykgKyBycGFkIGJhcihzdGF0LnNpemUvMTAwMDAwKSwgM1xuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGZnKDAsMCwyKSArICfilojilojilognICsgZmcoMCwwLDMpICsgJ+KWiOKWiOKWiCcgKyBmZygwLDAsNCkgKyBycGFkIGJhcihzdGF0LnNpemUvMTAwMDAwMCksIDJcbiAgICAgICAgZ2IgPSBwYXJzZUludCBtYiAvIDEwMDBcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDAwMDAwMDAwXG4gICAgICAgICAgICByZXR1cm4gZmcoMCwwLDIpICsgJ+KWiOKWiOKWiCcgKyBmZygwLDAsMykgKyAn4paI4paI4paIJyArIGZnKDAsMCw0KSArICfilognICsgZmcoMCwwLDQpICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMDAwMDAwKSwgMVxuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMDAwMDAwMDAwXG4gICAgICAgICAgICByZXR1cm4gZmcoMCwwLDIpICsgJ+KWiOKWiOKWiCcgKyBmZygwLDAsMykgKyAn4paI4paI4paIJyArIGZnKDAsMCw0KSArICfilojilognICsgZmcoMCwwLDQpICsgYmFyKHN0YXQuc2l6ZS8xMDAwMDAwMDApXG4gICAgICAgIFxuICAgIGlmIGFyZ3MucHJldHR5IGFuZCBzdGF0LnNpemUgPT0gMFxuICAgICAgICByZXR1cm4gbHBhZCgnICcsIDExKVxuICAgIGlmIHN0YXQuc2l6ZSA8IDEwMDBcbiAgICAgICAgY29sb3JzWydfc2l6ZSddWydiJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlIGlmIHN0YXQuc2l6ZSA8IDEwMDAwMDBcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsna0InXVswXSArIGxwYWQoKHN0YXQuc2l6ZSAvIDEwMDApLnRvRml4ZWQoMCksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ2tCJ11bMV0gKyBcImtCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsna0InXVswXSArIGxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2UgaWYgc3RhdC5zaXplIDwgMTAwMDAwMDAwMFxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydNQiddWzBdICsgbHBhZCgoc3RhdC5zaXplIC8gMTAwMDAwMCkudG9GaXhlZCgxKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsnTUInXVsxXSArIFwiTUIgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydNQiddWzBdICsgbHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZSBpZiBzdGF0LnNpemUgPCAxMDAwMDAwMDAwMDAwXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMF0gKyBscGFkKChzdGF0LnNpemUgLyAxMDAwMDAwMDAwKS50b0ZpeGVkKDEpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydHQiddWzFdICsgXCJHQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMF0gKyBscGFkKChzdGF0LnNpemUgLyAxMDAwMDAwMDAwMDAwKS50b0ZpeGVkKDMpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydUQiddWzFdICsgXCJUQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcblxuIyAwMDAwMDAwMDAgIDAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuIyAgICAwMDAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcblxudGltZVN0cmluZyA9IChzdGF0KSAtPlxuICAgIFxuICAgIGlmIGFyZ3MubmVyZHkgYW5kIGFyZ3MucHJldHR5XG4gICAgICAgIHNlYyA9IHBhcnNlSW50IChEYXRlLm5vdygpLXN0YXQubXRpbWVNcykvMTAwMFxuICAgICAgICBtbiAgPSBwYXJzZUludCBzZWMvNjBcbiAgICAgICAgaHIgID0gcGFyc2VJbnQgc2VjLzM2MDBcbiAgICAgICAgaWYgaHIgPCAxMlxuICAgICAgICAgICAgaWYgc2VjIDwgNjBcbiAgICAgICAgICAgICAgICByZXR1cm4gQkcoMCwwLDEpICsgJyAgICcgKyBmZyg1LDUsNSkgKyAn4peL4peU4peR4peVJ1twYXJzZUludCBzZWMvMTVdICsgJyAnIFxuICAgICAgICAgICAgZWxzZSBpZiBtbiA8IDYwXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArICcgICcgKyBmZygzLDMsNSkgKyAn4peL4peU4peR4peVJ1twYXJzZUludCBtbi8xNV0gKyBmZygwLDAsMykgKyAn4peMICdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gQkcoMCwwLDEpICsgJyAnICsgZmcoMiwyLDUpICsgJ+KXi+KXlOKXkeKXlSdbcGFyc2VJbnQgaHIvM10gKyBmZygwLDAsMykgKyAn4peM4peMICdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZHkgPSBwYXJzZUludCBNYXRoLnJvdW5kIHNlYy8oMjQqMzYwMClcbiAgICAgICAgICAgIHdrID0gcGFyc2VJbnQgTWF0aC5yb3VuZCBzZWMvKDcqMjQqMzYwMClcbiAgICAgICAgICAgIG10ID0gcGFyc2VJbnQgTWF0aC5yb3VuZCBzZWMvKDMwKjI0KjM2MDApXG4gICAgICAgICAgICB5ciA9IHBhcnNlSW50IE1hdGgucm91bmQgc2VjLygzNjUqMjQqMzYwMClcbiAgICAgICAgICAgIGlmIGR5IDwgMTBcbiAgICAgICAgICAgICAgICByZXR1cm4gQkcoMCwwLDEpICsgZmcoMCwwLDUpICsgXCIgI3tkeX0gXFx1ZjE4NSBcIlxuICAgICAgICAgICAgZWxzZSBpZiB3ayA8IDVcbiAgICAgICAgICAgICAgICByZXR1cm4gQkcoMCwwLDEpICsgZmcoMCwwLDQpICsgXCIgI3t3a30gXFx1ZjE4NiBcIlxuICAgICAgICAgICAgZWxzZSBpZiBtdCA8IDEwXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArIGZnKDAsMCwzKSArIFwiICN7bXR9IFxcdWY0NTUgXCJcbiAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArIGZnKDAsMCwzKSArIFwiICN7cnBhZCB5ciwgMn1cXHVmNmU2IFwiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgIG1vbWVudCA9IHJlcXVpcmUgJ21vbWVudCdcbiAgICB0ID0gbW9tZW50IHN0YXQubXRpbWVcbiAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICBhZ2UgPSBtb21lbnQoKS50byh0LCB0cnVlKVxuICAgICAgICBbbnVtLCByYW5nZV0gPSBhZ2Uuc3BsaXQgJyAnXG4gICAgICAgIG51bSA9ICcxJyBpZiBudW1bMF0gPT0gJ2EnXG4gICAgICAgIGlmIHJhbmdlID09ICdmZXcnXG4gICAgICAgICAgICBudW0gPSBtb21lbnQoKS5kaWZmIHQsICdzZWNvbmRzJ1xuICAgICAgICAgICAgcmFuZ2UgPSAnc2Vjb25kcydcbiAgICAgICAgICAgIGZ3KDIzKSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDE2KSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2UgaWYgcmFuZ2Uuc3RhcnRzV2l0aCAneWVhcidcbiAgICAgICAgICAgIGZ3KDYpICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoMykgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ21vbnRoJ1xuICAgICAgICAgICAgZncoOCkgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdyg0KSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2UgaWYgcmFuZ2Uuc3RhcnRzV2l0aCAnZGF5J1xuICAgICAgICAgICAgZncoMTApICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoNikgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ2hvdXInXG4gICAgICAgICAgICBmdygxNSkgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdyg4KSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZ3KDE4KSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDEyKSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgZWxzZVxuICAgICAgICBmdygxNikgKyBscGFkKHQuZm9ybWF0KFwiRERcIiksMikgKyBmdyg3KSsnLicgK1xuICAgICAgICBmdygxMikgKyB0LmZvcm1hdChcIk1NXCIpICsgZncoNykrXCIuXCIgK1xuICAgICAgICBmdyggOCkgKyB0LmZvcm1hdChcIllZXCIpICsgJyAnICtcbiAgICAgICAgZncoMTYpICsgdC5mb3JtYXQoXCJISFwiKSArIGNvbCA9IGZ3KDcpKyc6JyArXG4gICAgICAgIGZ3KDE0KSArIHQuZm9ybWF0KFwibW1cIikgKyBjb2wgPSBmdygxKSsnOicgK1xuICAgICAgICBmdyggNCkgKyB0LmZvcm1hdChcInNzXCIpICsgJyAnXG5cbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5vd25lck5hbWUgPSAoc3RhdCkgLT5cbiAgICBcbiAgICB0cnlcbiAgICAgICAgdXNlcm5hbWUgc3RhdC51aWRcbiAgICBjYXRjaFxuICAgICAgICBzdGF0LnVpZFxuXG5ncm91cE5hbWUgPSAoc3RhdCkgLT5cbiAgICBcbiAgICB0cnlcbiAgICAgICAgZ3JvdXBuYW1lIHN0YXQuZ2lkXG4gICAgY2F0Y2hcbiAgICAgICAgc3RhdC5naWRcblxub3duZXJTdHJpbmcgPSAoc3RhdCkgLT5cbiAgICBcbiAgICBvd24gPSBvd25lck5hbWUoc3RhdClcbiAgICBncnAgPSBncm91cE5hbWUoc3RhdClcbiAgICBvY2wgPSBjb2xvcnNbJ191c2VycyddW293bl1cbiAgICBvY2wgPSBjb2xvcnNbJ191c2VycyddWydkZWZhdWx0J10gdW5sZXNzIG9jbFxuICAgIGdjbCA9IGNvbG9yc1snX2dyb3VwcyddW2dycF1cbiAgICBnY2wgPSBjb2xvcnNbJ19ncm91cHMnXVsnZGVmYXVsdCddIHVubGVzcyBnY2xcbiAgICBvY2wgKyBycGFkKG93biwgc3RhdHMubWF4T3duZXJMZW5ndGgpICsgXCIgXCIgKyBnY2wgKyBycGFkKGdycCwgc3RhdHMubWF4R3JvdXBMZW5ndGgpXG5cbiMgMDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcblxucnd4U3RyaW5nID0gKHN0YXQsIGkpIC0+XG4gICAgXG4gICAgbW9kZSA9IHN0YXQubW9kZVxuICAgIFxuICAgIGlmIGFyZ3MubmVyZHlcbiAgICAgICAgciA9ICcgXFx1ZjQ0MSdcbiAgICAgICAgdyA9ICdcXHVmMDQwJ1xuICAgICAgICB4ID0gc3RhdC5pc0RpcmVjdG9yeSgpIGFuZCAnXFx1ZjA4NScgb3IgJ1xcdWYwMTMnXG4gICAgICAgIFxuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMTAwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3IrJ10gKyByIG9yIGNvbG9yc1snX3JpZ2h0cyddWydyLSddICsgcikgK1xuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDEwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3crJ10gKyB3IG9yIGNvbG9yc1snX3JpZ2h0cyddWyd3LSddICsgdykgK1xuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDAxKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3grJ10gKyB4IG9yIGNvbG9yc1snX3JpZ2h0cyddWyd4LSddICsgeClcbiAgICBlbHNlXG4gICAgICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIxMDApIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsncisnXSArICcgcicgb3IgY29sb3JzWydfcmlnaHRzJ11bJ3ItJ10gKyAnICAnKSArXG4gICAgICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIwMTApIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsndysnXSArICcgdycgb3IgY29sb3JzWydfcmlnaHRzJ11bJ3ctJ10gKyAnICAnKSArXG4gICAgICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIwMDEpIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsneCsnXSArICcgeCcgb3IgY29sb3JzWydfcmlnaHRzJ11bJ3gtJ10gKyAnICAnKVxuXG5yaWdodHNTdHJpbmcgPSAoc3RhdCkgLT5cbiAgICBcbiAgICB1ciA9IHJ3eFN0cmluZyhzdGF0LCAyKVxuICAgIGdyID0gcnd4U3RyaW5nKHN0YXQsIDEpXG4gICAgcm8gPSByd3hTdHJpbmcoc3RhdCwgMCkgKyBcIiBcIlxuICAgIHVyICsgZ3IgKyBybyArIHJlc2V0XG5cbmdldFByZWZpeCA9IChzdGF0LCBkZXB0aCkgLT5cbiAgICBcbiAgICBzID0gJydcbiAgICBpZiBhcmdzLnJpZ2h0c1xuICAgICAgICBzICs9IHJpZ2h0c1N0cmluZyBzdGF0XG4gICAgICAgIHMgKz0gXCIgXCJcbiAgICBpZiBhcmdzLm93bmVyXG4gICAgICAgIHMgKz0gb3duZXJTdHJpbmcgc3RhdFxuICAgICAgICBzICs9IFwiIFwiXG4gICAgaWYgYXJncy5tZGF0ZVxuICAgICAgICBzICs9IHRpbWVTdHJpbmcgc3RhdFxuICAgICAgICBzICs9IHJlc2V0XG4gICAgaWYgYXJncy5ieXRlc1xuICAgICAgICBzICs9IHNpemVTdHJpbmcgc3RhdFxuICAgICAgICBcbiAgICBpZiBkZXB0aCBhbmQgYXJncy50cmVlXG4gICAgICAgIHMgKz0gcnBhZCAnJywgZGVwdGgqNFxuICAgICAgICBcbiAgICBpZiBzLmxlbmd0aCA9PSAwIGFuZCBhcmdzLm9mZnNldFxuICAgICAgICBzICs9ICcgICAgICAgJ1xuICAgIHNcbiAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDBcblxuc29ydCA9IChsaXN0LCBzdGF0cywgZXh0cz1bXSkgLT5cbiAgICBcbiAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuICAgIG1vbWVudCA9IHJlcXVpcmUgJ21vbWVudCdcbiAgICBcbiAgICBsID0gXy56aXAgbGlzdCwgc3RhdHMsIFswLi4ubGlzdC5sZW5ndGhdLCAoZXh0cy5sZW5ndGggPiAwIGFuZCBleHRzIG9yIFswLi4ubGlzdC5sZW5ndGhdKVxuICAgIFxuICAgIGlmIGFyZ3Mua2luZFxuICAgICAgICBpZiBleHRzID09IFtdIHRoZW4gcmV0dXJuIGxpc3RcbiAgICAgICAgbC5zb3J0KChhLGIpIC0+XG4gICAgICAgICAgICBpZiBhWzNdID4gYlszXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICBpZiBhWzNdIDwgYlszXSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYXJncy50aW1lXG4gICAgICAgICAgICAgICAgbSA9IG1vbWVudChhWzFdLm10aW1lKVxuICAgICAgICAgICAgICAgIGlmIG0uaXNBZnRlcihiWzFdLm10aW1lKSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgaWYgbS5pc0JlZm9yZShiWzFdLm10aW1lKSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYXJncy5zaXplXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplID4gYlsxXS5zaXplIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPCBiWzFdLnNpemUgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFbMl0gPiBiWzJdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIC0xKVxuICAgIGVsc2UgaWYgYXJncy50aW1lXG4gICAgICAgIGwuc29ydCgoYSxiKSAtPlxuICAgICAgICAgICAgbSA9IG1vbWVudChhWzFdLm10aW1lKVxuICAgICAgICAgICAgaWYgbS5pc0FmdGVyKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIGlmIG0uaXNCZWZvcmUoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3Muc2l6ZVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA+IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICBlbHNlIGlmIGFyZ3Muc2l6ZVxuICAgICAgICBsLnNvcnQoKGEsYikgLT5cbiAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA+IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICBpZiBhWzFdLnNpemUgPCBiWzFdLnNpemUgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFbMl0gPiBiWzJdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIC0xKVxuICAgIF8udW56aXAobClbMF1cblxuIyAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuIyAwMDAgIDAwMCAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuXG5pZ25vcmUgPSAocCkgLT5cbiAgICBcbiAgICBiYXNlID0gc2xhc2guYmFzZW5hbWUgcFxuICAgIHJldHVybiB0cnVlIGlmIGJhc2VbMF0gPT0gJyQnXG4gICAgcmV0dXJuIHRydWUgaWYgYmFzZSA9PSAnZGVza3RvcC5pbmknICAgIFxuICAgIHJldHVybiB0cnVlIGlmIGJhc2UudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoICdudHVzZXInXG4gICAgZmFsc2VcbiAgICBcbiMgMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDBcbiMgMDAwMDAwICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgICAgICAgMDAwXG4jIDAwMCAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwXG5cbmxpc3RGaWxlcyA9IChwLCBmaWxlcywgZGVwdGgpIC0+XG4gICAgXG4gICAgYWxwaCA9IFtdIGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgZGlycyA9IFtdICMgdmlzaWJsZSBkaXJzXG4gICAgZmlscyA9IFtdICMgdmlzaWJsZSBmaWxlc1xuICAgIGRzdHMgPSBbXSAjIGRpciBzdGF0c1xuICAgIGZzdHMgPSBbXSAjIGZpbGUgc3RhdHNcbiAgICBleHRzID0gW10gIyBmaWxlIGV4dGVuc2lvbnNcblxuICAgIGlmIGFyZ3Mub3duZXJcbiAgICAgICAgXG4gICAgICAgIGZpbGVzLmZvckVhY2ggKHJwKSAtPlxuICAgICAgICAgICAgaWYgc2xhc2guaXNBYnNvbHV0ZSBycFxuICAgICAgICAgICAgICAgIGZpbGUgPSBzbGFzaC5yZXNvbHZlIHJwXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmlsZSAgPSBzbGFzaC5qb2luIHAsIHJwXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBzdGF0ID0gZnMubHN0YXRTeW5jKGZpbGUpXG4gICAgICAgICAgICAgICAgb2wgPSBvd25lck5hbWUoc3RhdCkubGVuZ3RoXG4gICAgICAgICAgICAgICAgZ2wgPSBncm91cE5hbWUoc3RhdCkubGVuZ3RoXG4gICAgICAgICAgICAgICAgaWYgb2wgPiBzdGF0cy5tYXhPd25lckxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5tYXhPd25lckxlbmd0aCA9IG9sXG4gICAgICAgICAgICAgICAgaWYgZ2wgPiBzdGF0cy5tYXhHcm91cExlbmd0aFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5tYXhHcm91cExlbmd0aCA9IGdsXG4gICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgZmlsZXMuZm9yRWFjaCAocnApIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5pc0Fic29sdXRlIHJwXG4gICAgICAgICAgICBmaWxlICA9IHNsYXNoLnJlc29sdmUgcnBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZmlsZSAgPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gcCwgcnBcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgaWdub3JlIHJwXG4gICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGxzdGF0ID0gZnMubHN0YXRTeW5jIGZpbGVcbiAgICAgICAgICAgIGxpbmsgID0gbHN0YXQuaXNTeW1ib2xpY0xpbmsoKVxuICAgICAgICAgICAgc3RhdCAgPSBsaW5rIGFuZCBmcy5zdGF0U3luYyhmaWxlKSBvciBsc3RhdFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICBzdGF0ID0gbHN0YXRcbiAgICAgICAgICAgICAgICBzdGF0cy5icm9rZW5MaW5rcy5wdXNoIGZpbGVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjIGxvZ19lcnJvciBcImNhbid0IHJlYWQgZmlsZTogXCIsIGZpbGUsIGxpbmtcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBleHQgID0gc2xhc2guZXh0IGZpbGVcbiAgICAgICAgbmFtZSA9IHNsYXNoLmJhc2UgZmlsZVxuICAgICAgICBcbiAgICAgICAgaWYgbmFtZVswXSA9PSAnLidcbiAgICAgICAgICAgIGV4dCA9IG5hbWUuc3Vic3RyKDEpICsgc2xhc2guZXh0bmFtZSBmaWxlXG4gICAgICAgICAgICBuYW1lID0gJydcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBuYW1lLmxlbmd0aCBhbmQgbmFtZVtuYW1lLmxlbmd0aC0xXSAhPSAnXFxyJyBvciBhcmdzLmFsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzID0gZ2V0UHJlZml4IHN0YXQsIGRlcHRoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICBpZiBub3QgYXJncy5maWxlc1xuICAgICAgICAgICAgICAgICAgICBpZiBub3QgYXJncy50cmVlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBuYW1lLnN0YXJ0c1dpdGggJy4vJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lWzIuLl1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBkaXJTdHJpbmcgbmFtZSwgZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBsaW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBsaW5rU3RyaW5nIGZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcnMucHVzaCBzK3Jlc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICBhbHBoLnB1c2ggcytyZXNldCBpZiBhcmdzLmFscGhhYmV0aWNhbFxuICAgICAgICAgICAgICAgICAgICBkc3RzLnB1c2ggc3RhdFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5udW1fZGlycyArPSAxXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZGlycyArPSAxXG4gICAgICAgICAgICBlbHNlICMgaWYgcGF0aCBpcyBmaWxlXG4gICAgICAgICAgICAgICAgaWYgbm90IGFyZ3MuZGlyc1xuICAgICAgICAgICAgICAgICAgICBzICs9IG5hbWVTdHJpbmcgbmFtZSwgZXh0XG4gICAgICAgICAgICAgICAgICAgIGlmIGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBleHRTdHJpbmcgbmFtZSwgZXh0XG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gbGlua1N0cmluZyBmaWxlXG4gICAgICAgICAgICAgICAgICAgIGZpbHMucHVzaCBzK3Jlc2V0XG4gICAgICAgICAgICAgICAgICAgIGFscGgucHVzaCBzK3Jlc2V0IGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgICAgICAgICAgICAgIGZzdHMucHVzaCBzdGF0XG4gICAgICAgICAgICAgICAgICAgIGV4dHMucHVzaCBleHRcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubnVtX2ZpbGVzICs9IDFcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9maWxlcyArPSAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHN0YXQuaXNGaWxlKClcbiAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZmlsZXMgKz0gMVxuICAgICAgICAgICAgZWxzZSBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZGlycyArPSAxXG5cbiAgICBpZiBhcmdzLnNpemUgb3IgYXJncy5raW5kIG9yIGFyZ3MudGltZVxuICAgICAgICBpZiBkaXJzLmxlbmd0aCBhbmQgbm90IGFyZ3MuZmlsZXNcbiAgICAgICAgICAgIGRpcnMgPSBzb3J0IGRpcnMsIGRzdHNcbiAgICAgICAgaWYgZmlscy5sZW5ndGhcbiAgICAgICAgICAgIGZpbHMgPSBzb3J0IGZpbHMsIGZzdHMsIGV4dHNcblxuICAgIGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgIGxvZyBwIGZvciBwIGluIGFscGhcbiAgICBlbHNlXG4gICAgICAgIGxvZyBkIGZvciBkIGluIGRpcnNcbiAgICAgICAgbG9nIGYgZm9yIGYgaW4gZmlsc1xuXG4jIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMFxuXG5saXN0RGlyID0gKHAsIG9wdD17fSkgLT5cbiAgICAgICAgICAgIFxuICAgIGlmIGFyZ3MucmVjdXJzZVxuICAgICAgICBkZXB0aCA9IHBhdGhEZXB0aCBwLCBvcHRcbiAgICAgICAgcmV0dXJuIGlmIGRlcHRoID4gYXJncy5kZXB0aFxuICAgIFxuICAgIHBzID0gcFxuXG4gICAgdHJ5XG4gICAgICAgIGZpbGVzID0gZnMucmVhZGRpclN5bmMocClcbiAgICBjYXRjaCBlcnJcbiAgICAgICAgdHJ1ZVxuXG4gICAgaWYgYXJncy5maW5kXG4gICAgICAgIGZpbGVzID0gZmlsZXMuZmlsdGVyIChmKSAtPlxuICAgICAgICAgICAgZiBpZiBSZWdFeHAoYXJncy5maW5kKS50ZXN0IGZcbiAgICAgICAgICAgIFxuICAgIGlmIGFyZ3MuZmluZCBhbmQgbm90IGZpbGVzPy5sZW5ndGhcbiAgICAgICAgdHJ1ZVxuICAgIGVsc2UgaWYgYXJncy5wYXRocy5sZW5ndGggPT0gMSBhbmQgYXJncy5wYXRoc1swXSA9PSAnLicgYW5kIG5vdCBhcmdzLnJlY3Vyc2VcbiAgICAgICAgbG9nIHJlc2V0XG4gICAgZWxzZSBpZiBhcmdzLnRyZWVcbiAgICAgICAgbG9nIGdldFByZWZpeChzbGFzaC5pc0RpcihwKSwgZGVwdGgtMSkgKyBkaXJTdHJpbmcoc2xhc2guYmFzZShwcyksIHNsYXNoLmV4dChwcykpICsgcmVzZXRcbiAgICBlbHNlXG4gICAgICAgIHMgPSBjb2xvcnNbJ19hcnJvdyddICsgXCIg4pa2IFwiICsgY29sb3JzWydfaGVhZGVyJ11bMF1cbiAgICAgICAgcHMgPSBzbGFzaC50aWxkZSBzbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgcnMgPSBzbGFzaC5yZWxhdGl2ZSBwcywgcHJvY2Vzcy5jd2QoKVxuICAgICAgICBpZiBycy5sZW5ndGggPCBwcy5sZW5ndGhcbiAgICAgICAgICAgIHBzID0gcnNcblxuICAgICAgICBpZiBwcyA9PSAnLydcbiAgICAgICAgICAgIHMgKz0gJy8nXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNwID0gcHMuc3BsaXQoJy8nKVxuICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVswXSArIHNwLnNoaWZ0KClcbiAgICAgICAgICAgIHdoaWxlIHNwLmxlbmd0aFxuICAgICAgICAgICAgICAgIHBuID0gc3Auc2hpZnQoKVxuICAgICAgICAgICAgICAgIGlmIHBuXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gY29sb3JzWydfaGVhZGVyJ11bMV0gKyAnLydcbiAgICAgICAgICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVtzcC5sZW5ndGggPT0gMCBhbmQgMiBvciAwXSArIHBuXG4gICAgICAgIGxvZyByZXNldFxuICAgICAgICBsb2cgcyArIFwiIFwiICsgcmVzZXRcbiAgICAgICAgbG9nIHJlc2V0XG5cbiAgICBpZiBmaWxlcz8ubGVuZ3RoXG4gICAgICAgIGxpc3RGaWxlcyBwLCBmaWxlcywgZGVwdGhcblxuICAgIGlmIGFyZ3MucmVjdXJzZVxuICAgICAgICBcbiAgICAgICAgZG9SZWN1cnNlID0gKGYpIC0+IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgc2xhc2guYmFzZW5hbWUoZikgaW4gYXJncy5pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBzbGFzaC5leHQoZikgPT0gJ2FwcCdcbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBub3QgYXJncy5hbGwgYW5kIGZbMF0gPT0gJy4nXG4gICAgICAgICAgICBzbGFzaC5pc0RpciBzbGFzaC5qb2luIHAsIGZcbiAgICAgICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGZvciBwciBpbiBmcy5yZWFkZGlyU3luYyhwKS5maWx0ZXIgZG9SZWN1cnNlXG4gICAgICAgICAgICAgICAgbGlzdERpciBzbGFzaC5yZXNvbHZlKHNsYXNoLmpvaW4gcCwgcHIpLCBvcHRcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBtc2cgPSBlcnIubWVzc2FnZVxuICAgICAgICAgICAgbXNnID0gXCJwZXJtaXNzaW9uIGRlbmllZFwiIGlmIG1zZy5zdGFydHNXaXRoIFwiRUFDQ0VTXCJcbiAgICAgICAgICAgIG1zZyA9IFwicGVybWlzc2lvbiBkZW5pZWRcIiBpZiBtc2cuc3RhcnRzV2l0aCBcIkVQRVJNXCJcbiAgICAgICAgICAgIGxvZ19lcnJvciBtc2dcbiAgICAgICAgICAgIFxucGF0aERlcHRoID0gKHAsIG9wdCkgLT5cbiAgICBcbiAgICByZWwgPSBzbGFzaC5yZWxhdGl2ZSBwLCBvcHQ/LnJlbGF0aXZlVG8gPyBwcm9jZXNzLmN3ZCgpXG4gICAgcmV0dXJuIDAgaWYgcCA9PSAnLidcbiAgICByZWwuc3BsaXQoJy8nKS5sZW5ndGhcblxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG5cbm1haW4gPSAtPlxuICAgICAgICAgICAgXG4gICAgcGF0aHN0YXRzID0gYXJncy5wYXRocy5tYXAgKGYpIC0+XG4gICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIFtmLCBmcy5zdGF0U3luYyhmKV1cbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICAgIGxvZ19lcnJvciAnbm8gc3VjaCBmaWxlOiAnLCBmXG4gICAgICAgICAgICBbXVxuICAgIFxuICAgIGZpbGVzdGF0cyA9IHBhdGhzdGF0cy5maWx0ZXIoIChmKSAtPiBmLmxlbmd0aCBhbmQgbm90IGZbMV0uaXNEaXJlY3RvcnkoKSApXG4gICAgXG4gICAgaWYgZmlsZXN0YXRzLmxlbmd0aCA+IDBcbiAgICAgICAgbG9nIHJlc2V0XG4gICAgICAgIGxpc3RGaWxlcyBwcm9jZXNzLmN3ZCgpLCBmaWxlc3RhdHMubWFwKCAocykgLT4gc1swXSApXG4gICAgXG4gICAgZm9yIHAgaW4gcGF0aHN0YXRzLmZpbHRlciggKGYpIC0+IGYubGVuZ3RoIGFuZCBmWzFdLmlzRGlyZWN0b3J5KCkgKVxuICAgICAgICBsb2cgJycgaWYgYXJncy50cmVlXG4gICAgICAgIGxpc3REaXIgcFswXSwgcmVsYXRpdmVUbzphcmdzLnRyZWUgYW5kIHNsYXNoLmRpcm5hbWUocFswXSkgb3IgcHJvY2Vzcy5jd2QoKVxuICAgIFxuICAgIGxvZyBcIlwiXG4gICAgaWYgYXJncy5pbmZvXG4gICAgICAgIGxvZyBCVygxKSArIFwiIFwiICtcbiAgICAgICAgZncoOCkgKyBzdGF0cy5udW1fZGlycyArIChzdGF0cy5oaWRkZW5fZGlycyBhbmQgZncoNCkgKyBcIitcIiArIGZ3KDUpICsgKHN0YXRzLmhpZGRlbl9kaXJzKSBvciBcIlwiKSArIGZ3KDQpICsgXCIgZGlycyBcIiArXG4gICAgICAgIGZ3KDgpICsgc3RhdHMubnVtX2ZpbGVzICsgKHN0YXRzLmhpZGRlbl9maWxlcyBhbmQgZncoNCkgKyBcIitcIiArIGZ3KDUpICsgKHN0YXRzLmhpZGRlbl9maWxlcykgb3IgXCJcIikgKyBmdyg0KSArIFwiIGZpbGVzIFwiICtcbiAgICAgICAgZncoOCkgKyB0aW1lKHByb2Nlc3MuaHJ0aW1lLmJpZ2ludD8oKS1zdGFydFRpbWUpICsgXCIgXCIgK1xuICAgICAgICByZXNldFxuICAgIFxuaWYgYXJnc1xuICAgIGluaXRBcmdzKClcbiAgICBtYWluKClcbmVsc2VcbiAgICBtb2R1bGVNYWluID0gKGFyZywgb3B0PXt9KSAtPlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIHR5cGVvZiBhcmdcbiAgICAgICAgICAgIHdoZW4gJ3N0cmluZydcbiAgICAgICAgICAgICAgICBhcmdzID0gT2JqZWN0LmFzc2lnbiB7fSwgb3B0XG4gICAgICAgICAgICAgICAgYXJncy5wYXRocyA/PSBbXVxuICAgICAgICAgICAgICAgIGFyZ3MucGF0aHMucHVzaCBhcmdcbiAgICAgICAgICAgIHdoZW4gJ29iamVjdCdcbiAgICAgICAgICAgICAgICBhcmdzID0gT2JqZWN0LmFzc2lnbiB7fSwgYXJnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXJncyA9IHBhdGhzOlsnLiddXG4gICAgICAgIGluaXRBcmdzKClcbiAgICAgICAgXG4gICAgICAgIG91dCA9ICcnXG4gICAgICAgIG9sZGxvZyA9IGNvbnNvbGUubG9nXG4gICAgICAgIGNvbnNvbGUubG9nID0gLT4gXG4gICAgICAgICAgICBmb3IgYXJnIGluIGFyZ3VtZW50cyB0aGVuIG91dCArPSBTdHJpbmcoYXJnKVxuICAgICAgICAgICAgb3V0ICs9ICdcXG4nXG4gICAgICAgIFxuICAgICAgICBtYWluKClcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nID0gb2xkbG9nXG4gICAgICAgIG91dFxuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzID0gbW9kdWxlTWFpblxuICAgICJdfQ==
//# sourceURL=../coffee/color-ls.coffee