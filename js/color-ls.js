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
    '_inodes': {
        'id': bold + BG(1, 0, 1) + fg(4, 0, 4),
        'lnk': bold + BG(4, 0, 4) + fg(1, 0, 1)
    },
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
    var lnk;
    if (stat.nlink > 1) {
        lnk = colors['_inodes']['lnk'] + lpad(stat.nlink, 3) + ' ' + reset;
    } else {
        lnk = reset + '    ';
    }
    return colors['_inodes']['id'] + lpad(stat.ino, 8) + ' ' + lnk;
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
    var j, k, l, moment, ref1, ref2, results, results1, unzip, zip;
    if (exts == null) {
        exts = [];
    }
    zip = require('lodash.zip');
    unzip = require('lodash.unzip');
    moment = require('moment');
    l = zip(list, stats, (function() {
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
    return unzip(l)[0];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItbHMuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJjb2xvci1scy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMGFBQUE7SUFBQTs7QUFRQSxTQUFBLGdFQUEwQixDQUFDOztBQUUzQixNQUF1QixPQUFBLENBQVEsTUFBUixDQUF2QixFQUFFLGVBQUYsRUFBUSxlQUFSLEVBQWM7O0FBQ2QsRUFBQSxHQUFTLE9BQUEsQ0FBUSxJQUFSOztBQUNULEVBQUEsR0FBUyxPQUFBLENBQVEsSUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0FBQ1QsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsaUJBQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUVULElBQUEsR0FBUTs7QUFDUixLQUFBLEdBQVE7O0FBRVIsSUFBQSxHQUFTOztBQUNULEtBQUEsR0FBUyxJQUFJLENBQUM7O0FBQ2QsRUFBQSxHQUFTLElBQUksQ0FBQyxFQUFFLENBQUM7O0FBQ2pCLEVBQUEsR0FBUyxJQUFJLENBQUMsRUFBRSxDQUFDOztBQUNqQixFQUFBLEdBQVMsU0FBQyxDQUFEO1dBQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFVLENBQUEsQ0FBQTtBQUF6Qjs7QUFDVCxFQUFBLEdBQVMsU0FBQyxDQUFEO1dBQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFVLENBQUEsQ0FBQTtBQUF6Qjs7QUFFVCxLQUFBLEdBQ0k7SUFBQSxRQUFBLEVBQWdCLENBQWhCO0lBQ0EsU0FBQSxFQUFnQixDQURoQjtJQUVBLFdBQUEsRUFBZ0IsQ0FGaEI7SUFHQSxZQUFBLEVBQWdCLENBSGhCO0lBSUEsY0FBQSxFQUFnQixDQUpoQjtJQUtBLGNBQUEsRUFBZ0IsQ0FMaEI7SUFNQSxXQUFBLEVBQWdCLEVBTmhCOzs7QUFjSixJQUFHLENBQUksTUFBTSxDQUFDLE1BQVgsSUFBcUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFkLEtBQW9CLEdBQTVDO0lBRUksSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSO0lBQ1AsSUFBQSxHQUFPLElBQUEsQ0FBSyx3dURBQUEsR0E0QkUsQ0FBQyxPQUFBLENBQVcsU0FBRCxHQUFXLGtCQUFyQixDQUF1QyxDQUFDLE9BQXpDLENBNUJQLEVBSFg7OztBQWtDQSxRQUFBLEdBQVcsU0FBQTtBQUVQLFFBQUE7SUFBQSxJQUFHLElBQUksQ0FBQyxJQUFSO1FBQ0ksSUFBSSxDQUFDLEtBQUwsR0FBYSxLQURqQjs7SUFHQSxJQUFHLElBQUksQ0FBQyxJQUFSO1FBQ0ksSUFBSSxDQUFDLEtBQUwsR0FBYTtRQUNiLElBQUksQ0FBQyxLQUFMLEdBQWEsS0FGakI7O0lBSUEsSUFBRyxJQUFJLENBQUMsSUFBUjtRQUNJLElBQUksQ0FBQyxPQUFMLEdBQWU7UUFDZixJQUFJLENBQUMsTUFBTCxHQUFlLE1BRm5COztJQUlBLElBQUcsSUFBSSxDQUFDLElBQUwsSUFBYyxJQUFJLENBQUMsS0FBdEI7UUFDSSxJQUFJLENBQUMsSUFBTCxHQUFZLElBQUksQ0FBQyxLQUFMLEdBQWEsTUFEN0I7O0lBR0EsdUNBQWMsQ0FBRSxlQUFoQjtRQUNJLElBQUksQ0FBQyxNQUFMLEdBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFaLENBQWtCLEdBQWxCLEVBRGxCO0tBQUEsTUFBQTtRQUdJLElBQUksQ0FBQyxNQUFMLEdBQWMsR0FIbEI7O0lBS0EsSUFBRyxJQUFJLENBQUMsS0FBTCxLQUFjLEdBQWpCO1FBQTBCLElBQUksQ0FBQyxLQUFMLEdBQWEsTUFBdkM7S0FBQSxNQUFBO1FBQ0ssSUFBSSxDQUFDLEtBQUwsR0FBYSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsRUFBWSxRQUFBLENBQVMsSUFBSSxDQUFDLEtBQWQsQ0FBWixFQURsQjs7SUFFQSxJQUFHLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBSSxDQUFDLEtBQWxCLENBQUg7UUFBZ0MsSUFBSSxDQUFDLEtBQUwsR0FBYSxFQUE3Qzs7SUFFQSxJQUFHLElBQUksQ0FBQyxLQUFSO1FBQ0ksSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSO1FBQWMsT0FBQSxDQUNyQixHQURxQixDQUNqQixJQUFJLENBQUMsU0FBTCxDQUFlLElBQWYsRUFBcUI7WUFBQSxNQUFBLEVBQU8sSUFBUDtTQUFyQixDQURpQixFQUR6Qjs7SUFJQSxJQUFBLENBQUEsb0NBQW9DLENBQUUsZ0JBQVosR0FBcUIsQ0FBL0MsQ0FBQTtlQUFBLElBQUksQ0FBQyxLQUFMLEdBQWEsQ0FBQyxHQUFELEVBQWI7O0FBN0JPOztBQXFDWCxNQUFBLEdBQ0k7SUFBQSxRQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE5QixDQUFaO0lBQ0EsUUFBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FEWjtJQUVBLElBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBRlo7SUFHQSxJQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE5QixDQUhaO0lBSUEsTUFBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FKWjtJQUtBLE1BQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBTFo7SUFNQSxNQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE5QixDQU5aO0lBT0EsT0FBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FQWjtJQVFBLElBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBUlo7SUFTQSxLQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FUWjtJQVVBLEdBQUEsRUFBWSxDQUFPLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBVlo7SUFXQSxLQUFBLEVBQVksQ0FBTyxFQUFBLENBQUcsQ0FBSCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILENBQTlCLENBWFo7SUFZQSxLQUFBLEVBQVksQ0FBTyxFQUFBLENBQUcsQ0FBSCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILENBQTlCLENBWlo7SUFhQSxLQUFBLEVBQVksQ0FBTyxFQUFBLENBQUcsQ0FBSCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILENBQTlCLENBYlo7SUFjQSxLQUFBLEVBQVksQ0FBTyxFQUFBLENBQUcsRUFBSCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILENBQTlCLENBZFo7SUFlQSxJQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLEVBQUgsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxDQUE5QixDQWZaO0lBZ0JBLFVBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsRUFBSCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILENBQTlCLENBaEJaO0lBaUJBLElBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBakJaO0lBa0JBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBbEJaO0lBbUJBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBbkJaO0lBb0JBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBcEJaO0lBcUJBLE1BQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBckJaO0lBc0JBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBdEJaO0lBdUJBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBdkJaO0lBd0JBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBeEJaO0lBeUJBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBekJaO0lBMEJBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBMUJaO0lBNEJBLFVBQUEsRUFBWSxDQUFPLEVBQUEsQ0FBRyxFQUFILENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsQ0FBbkIsRUFBOEIsRUFBQSxD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Y2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgICAgICAgIDAwMCAgICAgICAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgICAgMDAwXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAwMDAwICAwMDAwMDAwXG4jIyNcblxuc3RhcnRUaW1lID0gcHJvY2Vzcy5ocnRpbWUuYmlnaW50PygpXG5cbnsgbHBhZCwgcnBhZCwgdGltZSB9ID0gcmVxdWlyZSAna3N0cidcbm9zICAgICA9IHJlcXVpcmUgJ29zJ1xuZnMgICAgID0gcmVxdWlyZSAnZnMnXG5zbGFzaCAgPSByZXF1aXJlICdrc2xhc2gnXG5maWx0ZXIgPSByZXF1aXJlICdsb2Rhc2guZmlsdGVyJ1xuYW5zaSAgID0gcmVxdWlyZSAnYW5zaS0yNTYtY29sb3JzJ1xudXRpbCAgID0gcmVxdWlyZSAndXRpbCdcblxuYXJncyAgPSBudWxsXG50b2tlbiA9IHt9XG5cbmJvbGQgICA9ICdcXHgxYlsxbSdcbnJlc2V0ICA9IGFuc2kucmVzZXRcbmZnICAgICA9IGFuc2kuZmcuZ2V0UmdiXG5CRyAgICAgPSBhbnNpLmJnLmdldFJnYlxuZncgICAgID0gKGkpIC0+IGFuc2kuZmcuZ3JheXNjYWxlW2ldXG5CVyAgICAgPSAoaSkgLT4gYW5zaS5iZy5ncmF5c2NhbGVbaV1cblxuc3RhdHMgPSAjIGNvdW50ZXJzIGZvciAoaGlkZGVuKSBkaXJzL2ZpbGVzXG4gICAgbnVtX2RpcnM6ICAgICAgIDBcbiAgICBudW1fZmlsZXM6ICAgICAgMFxuICAgIGhpZGRlbl9kaXJzOiAgICAwXG4gICAgaGlkZGVuX2ZpbGVzOiAgIDBcbiAgICBtYXhPd25lckxlbmd0aDogMFxuICAgIG1heEdyb3VwTGVuZ3RoOiAwXG4gICAgYnJva2VuTGlua3M6ICAgIFtdXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgIDAwMDAgIDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuXG5pZiBub3QgbW9kdWxlLnBhcmVudCBvciBtb2R1bGUucGFyZW50LmlkID09ICcuJ1xuXG4gICAga2FyZyA9IHJlcXVpcmUgJ2thcmcnXG4gICAgYXJncyA9IGthcmcgXCJcIlwiXG4gICAgY29sb3ItbHNcbiAgICAgICAgcGF0aHMgICAgICAgICAgIC4gPyB0aGUgZmlsZShzKSBhbmQvb3IgZm9sZGVyKHMpIHRvIGRpc3BsYXkgLiAqKlxuICAgICAgICBhbGwgICAgICAgICAgICAgLiA/IHNob3cgZG90IGZpbGVzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGRpcnMgICAgICAgICAgICAuID8gc2hvdyBvbmx5IGRpcnMgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgZmlsZXMgICAgICAgICAgIC4gPyBzaG93IG9ubHkgZmlsZXMgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBieXRlcyAgICAgICAgICAgLiA/IGluY2x1ZGUgc2l6ZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIG1kYXRlICAgICAgICAgICAuID8gaW5jbHVkZSBtb2RpZmljYXRpb24gZGF0ZSAgICAgICAuID0gZmFsc2VcbiAgICAgICAgbG9uZyAgICAgICAgICAgIC4gPyBpbmNsdWRlIHNpemUgYW5kIGRhdGUgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBvd25lciAgICAgICAgICAgLiA/IGluY2x1ZGUgb3duZXIgYW5kIGdyb3VwICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHJpZ2h0cyAgICAgICAgICAuID8gaW5jbHVkZSByaWdodHMgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgc2l6ZSAgICAgICAgICAgIC4gPyBzb3J0IGJ5IHNpemUgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICB0aW1lICAgICAgICAgICAgLiA/IHNvcnQgYnkgdGltZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGtpbmQgICAgICAgICAgICAuID8gc29ydCBieSBraW5kICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgbmVyZHkgICAgICAgICAgIC4gPyB1c2UgbmVyZCBmb250IGljb25zICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBwcmV0dHkgICAgICAgICAgLiA/IHByZXR0eSBzaXplIGFuZCBhZ2UgICAgICAgICAgICAgLiA9IHRydWVcbiAgICAgICAgaWdub3JlICAgICAgICAgIC4gPyBkb24ndCByZWN1cnNlIGludG8gICAgICAgICAgICAgIC4gPSBub2RlX21vZHVsZXMgLmdpdFxuICAgICAgICBpbmZvICAgICAgICAgICAgLiA/IHNob3cgc3RhdGlzdGljcyAgICAgICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBJXG4gICAgICAgIGFscGhhYmV0aWNhbCAgICAuID8gZG9uJ3QgZ3JvdXAgZGlycyBiZWZvcmUgZmlsZXMgICAuID0gZmFsc2UgLiAtIEFcbiAgICAgICAgb2Zmc2V0ICAgICAgICAgIC4gPyBpbmRlbnQgc2hvcnQgbGlzdGluZ3MgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gT1xuICAgICAgICByZWN1cnNlICAgICAgICAgLiA/IHJlY3Vyc2UgaW50byBzdWJkaXJzICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBSXG4gICAgICAgIHRyZWUgICAgICAgICAgICAuID8gcmVjdXJzZSBhbmQgaW5kZW50ICAgICAgICAgICAgICAuID0gZmFsc2UgLiAtIFRcbiAgICAgICAgZm9sbG93U3ltTGlua3MgIC4gPyByZWN1cnNlIGZvbGxvd3Mgc3ltbGlua3MgICAgICAgIC4gPSBmYWxzZSAuIC0gUyBcbiAgICAgICAgZGVwdGggICAgICAgICAgIC4gPyByZWN1cnNpb24gZGVwdGggICAgICAgICAgICAgICAgIC4gPSDiiJ4gICAgIC4gLSBEXG4gICAgICAgIGZpbmQgICAgICAgICAgICAuID8gZmlsdGVyIHdpdGggYSByZWdleHAgICAgICAgICAgICAuIC0gRlxuICAgICAgICBkZWJ1ZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBYXG4gICAgICAgIGlub2RlSW5mb3MgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgLiAtIE4gXG4gICAgXG4gICAgdmVyc2lvbiAgICAgICN7cmVxdWlyZShcIiN7X19kaXJuYW1lfS8uLi9wYWNrYWdlLmpzb25cIikudmVyc2lvbn1cbiAgICBcIlwiXCJcbiAgICBcbmluaXRBcmdzID0gLT5cbiAgICAgICAgXG4gICAgaWYgYXJncy5zaXplXG4gICAgICAgIGFyZ3MuZmlsZXMgPSB0cnVlXG4gICAgXG4gICAgaWYgYXJncy5sb25nXG4gICAgICAgIGFyZ3MuYnl0ZXMgPSB0cnVlXG4gICAgICAgIGFyZ3MubWRhdGUgPSB0cnVlXG4gICAgICAgIFxuICAgIGlmIGFyZ3MudHJlZVxuICAgICAgICBhcmdzLnJlY3Vyc2UgPSB0cnVlXG4gICAgICAgIGFyZ3Mub2Zmc2V0ICA9IGZhbHNlXG4gICAgXG4gICAgaWYgYXJncy5kaXJzIGFuZCBhcmdzLmZpbGVzXG4gICAgICAgIGFyZ3MuZGlycyA9IGFyZ3MuZmlsZXMgPSBmYWxzZVxuICAgICAgICBcbiAgICBpZiBhcmdzLmlnbm9yZT8ubGVuZ3RoXG4gICAgICAgIGFyZ3MuaWdub3JlID0gYXJncy5pZ25vcmUuc3BsaXQgJyAnIFxuICAgIGVsc2VcbiAgICAgICAgYXJncy5pZ25vcmUgPSBbXVxuICAgICAgICBcbiAgICBpZiBhcmdzLmRlcHRoID09ICfiiJ4nIHRoZW4gYXJncy5kZXB0aCA9IEluZmluaXR5XG4gICAgZWxzZSBhcmdzLmRlcHRoID0gTWF0aC5tYXggMCwgcGFyc2VJbnQgYXJncy5kZXB0aFxuICAgIGlmIE51bWJlci5pc05hTiBhcmdzLmRlcHRoIHRoZW4gYXJncy5kZXB0aCA9IDBcbiAgICAgICAgXG4gICAgaWYgYXJncy5kZWJ1Z1xuICAgICAgICBub29uID0gcmVxdWlyZSAnbm9vbidcbiAgICAgICAgbG9nIG5vb24uc3RyaW5naWZ5IGFyZ3MsIGNvbG9yczp0cnVlXG4gICAgXG4gICAgYXJncy5wYXRocyA9IFsnLiddIHVubGVzcyBhcmdzLnBhdGhzPy5sZW5ndGggPiAwXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbmNvbG9ycyA9XG4gICAgJ2NvZmZlZSc6ICAgWyBib2xkK2ZnKDQsNCwwKSwgIGZnKDEsMSwwKSwgZmcoMiwyLDApIF1cbiAgICAna29mZmVlJzogICBbIGJvbGQrZmcoNSw1LDApLCAgZmcoMSwwLDApLCBmZygzLDEsMCkgXVxuICAgICdweSc6ICAgICAgIFsgYm9sZCtmZygwLDMsMCksICBmZygwLDEsMCksIGZnKDAsMiwwKSBdXG4gICAgJ3JiJzogICAgICAgWyBib2xkK2ZnKDQsMCwwKSwgIGZnKDEsMCwwKSwgZmcoMiwwLDApIF1cbiAgICAnanNvbic6ICAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygyLDAsMSkgXVxuICAgICdjc29uJzogICAgIFsgYm9sZCtmZyg0LDAsNCksICBmZygxLDAsMSksIGZnKDIsMCwyKSBdXG4gICAgJ25vb24nOiAgICAgWyBib2xkK2ZnKDQsNCwwKSwgIGZnKDEsMSwwKSwgZmcoMiwyLDApIF1cbiAgICAncGxpc3QnOiAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygyLDAsMikgXVxuICAgICdqcyc6ICAgICAgIFsgYm9sZCtmZyg1LDAsNSksICBmZygyLDAsMiksIGZnKDMsMCwzKSBdXG4gICAgJ2NwcCc6ICAgICAgWyBib2xkK2ZnKDUsNCwwKSwgIGZ3KDMpLCAgICAgZmcoMywyLDApIF1cbiAgICAnaCc6ICAgICAgICBbICAgICAgZmcoMywxLDApLCAgZncoMyksICAgICBmZygyLDEsMCkgXVxuICAgICdweWMnOiAgICAgIFsgICAgICBmdyg1KSwgICAgICBmdygzKSwgICAgIGZ3KDQpIF1cbiAgICAnbG9nJzogICAgICBbICAgICAgZncoNSksICAgICAgZncoMiksICAgICBmdygzKSBdXG4gICAgJ2xvZyc6ICAgICAgWyAgICAgIGZ3KDUpLCAgICAgIGZ3KDIpLCAgICAgZncoMykgXVxuICAgICd0eHQnOiAgICAgIFsgICAgICBmdygyMCksICAgICBmdygzKSwgICAgIGZ3KDQpIF1cbiAgICAnbWQnOiAgICAgICBbIGJvbGQrZncoMjApLCAgICAgZncoMyksICAgICBmdyg0KSBdXG4gICAgJ21hcmtkb3duJzogWyBib2xkK2Z3KDIwKSwgICAgIGZ3KDMpLCAgICAgZncoNCkgXVxuICAgICdzaCc6ICAgICAgIFsgYm9sZCtmZyg1LDEsMCksICBmZygyLDAsMCksIGZnKDMsMCwwKSBdXG4gICAgJ3BuZyc6ICAgICAgWyBib2xkK2ZnKDUsMCwwKSwgIGZnKDIsMCwwKSwgZmcoMywwLDApIF1cbiAgICAnanBnJzogICAgICBbIGJvbGQrZmcoMCwzLDApLCAgZmcoMCwyLDApLCBmZygwLDIsMCkgXVxuICAgICdweG0nOiAgICAgIFsgYm9sZCtmZygxLDEsNSksICBmZygwLDAsMiksIGZnKDAsMCw0KSBdXG4gICAgJ3RpZmYnOiAgICAgWyBib2xkK2ZnKDEsMSw1KSwgIGZnKDAsMCwzKSwgZmcoMCwwLDQpIF1cbiAgICAndGd6JzogICAgICBbIGJvbGQrZmcoMCwzLDQpLCAgZmcoMCwxLDIpLCBmZygwLDIsMykgXVxuICAgICdwa2cnOiAgICAgIFsgYm9sZCtmZygwLDMsNCksICBmZygwLDEsMiksIGZnKDAsMiwzKSBdXG4gICAgJ3ppcCc6ICAgICAgWyBib2xkK2ZnKDAsMyw0KSwgIGZnKDAsMSwyKSwgZmcoMCwyLDMpIF1cbiAgICAnZG1nJzogICAgICBbIGJvbGQrZmcoMSw0LDQpLCAgZmcoMCwyLDIpLCBmZygwLDMsMykgXVxuICAgICd0dGYnOiAgICAgIFsgYm9sZCtmZygyLDEsMyksICBmZygxLDAsMiksIGZnKDEsMCwyKSBdXG5cbiAgICAnX2RlZmF1bHQnOiBbICAgICAgZncoMTUpLCAgICAgZncoNCksICAgICBmdygxMCkgXVxuICAgICdfZGlyJzogICAgIFsgYm9sZCtCRygwLDAsMikrZncoMjMpLCBmZygxLDEsNSksIGJvbGQrQkcoMCwwLDIpK2ZnKDIsMiw1KSBdXG4gICAgJ18uZGlyJzogICAgWyBib2xkK0JHKDAsMCwxKStmdygyMyksIGJvbGQrQkcoMCwwLDEpK2ZnKDEsMSw1KSwgYm9sZCtCRygwLDAsMSkrZmcoMiwyLDUpIF1cbiAgICAnX2xpbmsnOiAgICB7ICdhcnJvdyc6IGZnKDEsMCwxKSwgJ3BhdGgnOiBmZyg0LDAsNCksICdicm9rZW4nOiBCRyg1LDAsMCkrZmcoNSw1LDApIH1cbiAgICAnX2Fycm93JzogICAgIEJXKDIpK2Z3KDApXG4gICAgJ19oZWFkZXInOiAgWyBib2xkK0JXKDIpK2ZnKDMsMiwwKSwgIGZ3KDQpLCBib2xkK0JXKDIpK2ZnKDUsNSwwKSBdXG4gICAgJ19zaXplJzogICAgeyBiOiBbZmcoMCwwLDMpLCBmZygwLDAsMildLCBrQjogW2ZnKDAsMCw1KSwgZmcoMCwwLDMpXSwgTUI6IFtmZygxLDEsNSksIGZnKDAsMCw0KV0sIEdCOiBbZmcoNCw0LDUpLCBmZygyLDIsNSldLCBUQjogW2ZnKDQsNCw1KSwgZmcoMiwyLDUpXSB9XG4gICAgJ191c2Vycyc6ICAgeyByb290OiAgZmcoMywwLDApLCBkZWZhdWx0OiBmZygxLDAsMSkgfVxuICAgICdfZ3JvdXBzJzogIHsgd2hlZWw6IGZnKDEsMCwwKSwgc3RhZmY6IGZnKDAsMSwwKSwgYWRtaW46IGZnKDEsMSwwKSwgZGVmYXVsdDogZmcoMSwwLDEpIH1cbiAgICAnX2Vycm9yJzogICBbIGJvbGQrQkcoNSwwLDApK2ZnKDUsNSwwKSwgYm9sZCtCRyg1LDAsMCkrZmcoNSw1LDUpIF1cbiAgICAnX2lub2Rlcyc6ICBcbiAgICAgICAgICAgICAgICAnaWQnOiAgYm9sZCtCRygxLDAsMSkrZmcoNCwwLDQpIFxuICAgICAgICAgICAgICAgICdsbmsnOiBib2xkK0JHKDQsMCw0KStmZygxLDAsMSlcbiAgICAnX3JpZ2h0cyc6XG4gICAgICAgICAgICAgICAgJ3IrJzogYm9sZCtCVygxKStmdyg2KVxuICAgICAgICAgICAgICAgICdyLSc6IHJlc2V0K0JXKDEpK2Z3KDIpXG4gICAgICAgICAgICAgICAgJ3crJzogYm9sZCtCVygxKStmZygyLDIsNSlcbiAgICAgICAgICAgICAgICAndy0nOiByZXNldCtCVygxKStmdygyKVxuICAgICAgICAgICAgICAgICd4Kyc6IGJvbGQrQlcoMSkrZmcoNSwwLDApXG4gICAgICAgICAgICAgICAgJ3gtJzogcmVzZXQrQlcoMSkrZncoMilcblxudXNlck1hcCA9IHt9XG51c2VybmFtZSA9ICh1aWQpIC0+XG4gICAgaWYgbm90IHVzZXJNYXBbdWlkXVxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG4gICAgICAgICAgICB1c2VyTWFwW3VpZF0gPSBjaGlsZHAuc3Bhd25TeW5jKFwiaWRcIiwgW1wiLXVuXCIsIFwiI3t1aWR9XCJdKS5zdGRvdXQudG9TdHJpbmcoJ3V0ZjgnKS50cmltKClcbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgbG9nIGVcbiAgICB1c2VyTWFwW3VpZF1cblxuZ3JvdXBNYXAgPSBudWxsXG5ncm91cG5hbWUgPSAoZ2lkKSAtPlxuICAgIGlmIG5vdCBncm91cE1hcFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG4gICAgICAgICAgICBnaWRzID0gY2hpbGRwLnNwYXduU3luYyhcImlkXCIsIFtcIi1HXCJdKS5zdGRvdXQudG9TdHJpbmcoJ3V0ZjgnKS5zcGxpdCgnICcpXG4gICAgICAgICAgICBnbm1zID0gY2hpbGRwLnNwYXduU3luYyhcImlkXCIsIFtcIi1HblwiXSkuc3Rkb3V0LnRvU3RyaW5nKCd1dGY4Jykuc3BsaXQoJyAnKVxuICAgICAgICAgICAgZ3JvdXBNYXAgPSB7fVxuICAgICAgICAgICAgZm9yIGkgaW4gWzAuLi5naWRzLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBncm91cE1hcFtnaWRzW2ldXSA9IGdubXNbaV1cbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgbG9nIGVcbiAgICBncm91cE1hcFtnaWRdXG5cbmlmICdmdW5jdGlvbicgPT0gdHlwZW9mIHByb2Nlc3MuZ2V0dWlkXG4gICAgY29sb3JzWydfdXNlcnMnXVt1c2VybmFtZShwcm9jZXNzLmdldHVpZCgpKV0gPSBmZygwLDQsMClcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG5sb2dfZXJyb3IgPSAoKSAtPlxuICAgIFxuICAgIGxvZyBcIiBcIiArIGNvbG9yc1snX2Vycm9yJ11bMF0gKyBcIiBcIiArIGJvbGQgKyBhcmd1bWVudHNbMF0gKyAoYXJndW1lbnRzLmxlbmd0aCA+IDEgYW5kIChjb2xvcnNbJ19lcnJvciddWzFdICsgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpLnNsaWNlKDEpLmpvaW4oJyAnKSkgb3IgJycpICsgXCIgXCIgKyByZXNldFxuXG5saW5rU3RyaW5nID0gKGZpbGUpIC0+IFxuICAgIFxuICAgIHMgID0gcmVzZXQgKyBmdygxKSArIGNvbG9yc1snX2xpbmsnXVsnYXJyb3cnXSArIFwiIOKWuiBcIiBcbiAgICBzICs9IGNvbG9yc1snX2xpbmsnXVsoZmlsZSBpbiBzdGF0cy5icm9rZW5MaW5rcykgYW5kICdicm9rZW4nIG9yICdwYXRoJ10gXG4gICAgdHJ5XG4gICAgICAgIHMgKz0gc2xhc2gudGlsZGUgZnMucmVhZGxpbmtTeW5jKGZpbGUpXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIHMgKz0gJyA/ICdcbiAgICBzXG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIFxuIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG5cbm5hbWVTdHJpbmcgPSAobmFtZSwgZXh0KSAtPiBcbiAgICBcbiAgICBpZiBhcmdzLm5lcmR5ICAgICAgICBcbiAgICAgICAgaWNvbnMgPSByZXF1aXJlICcuL2ljb25zJ1xuICAgICAgICBpY29uID0gKGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVsyXSArIChpY29ucy5nZXQobmFtZSwgZXh0KSA/ICcgJykpICsgJyAnXG4gICAgZWxzZVxuICAgICAgICBpY29uID0gJydcbiAgICBcIiBcIiArIGljb24gKyBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMF0gKyBuYW1lICsgcmVzZXRcbiAgICBcbmRvdFN0cmluZyAgPSAoZXh0KSAtPiBcbiAgICBcbiAgICBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMV0gKyBcIi5cIiArIHJlc2V0XG4gICAgXG5leHRTdHJpbmcgID0gKG5hbWUsIGV4dCkgLT4gXG4gICAgXG4gICAgaWYgYXJncy5uZXJkeSBhbmQgbmFtZSBcbiAgICAgICAgaWNvbnMgPSByZXF1aXJlICcuL2ljb25zJ1xuICAgICAgICBpZiBpY29ucy5nZXQobmFtZSwgZXh0KSB0aGVuIHJldHVybiAnJ1xuICAgIGRvdFN0cmluZyhleHQpICsgY29sb3JzW2NvbG9yc1tleHRdPyBhbmQgZXh0IG9yICdfZGVmYXVsdCddWzFdICsgZXh0ICsgcmVzZXRcbiAgICBcbmRpclN0cmluZyAgPSAobmFtZSwgZXh0KSAtPlxuICAgIFxuICAgIGMgPSBuYW1lIGFuZCAnX2Rpcicgb3IgJ18uZGlyJ1xuICAgIGljb24gPSBhcmdzLm5lcmR5IGFuZCBjb2xvcnNbY11bMl0gKyAnIFxcdWY0MTMnIG9yICcnXG4gICAgaWNvbiArIGNvbG9yc1tjXVswXSArIChuYW1lIGFuZCAoXCIgXCIgKyBuYW1lKSBvciBcIiBcIikgKyAoaWYgZXh0IHRoZW4gY29sb3JzW2NdWzFdICsgJy4nICsgY29sb3JzW2NdWzJdICsgZXh0IGVsc2UgXCJcIikgKyBcIiBcIlxuXG4jICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5zaXplU3RyaW5nID0gKHN0YXQpIC0+XG5cbiAgICBpZiBhcmdzLm5lcmR5IGFuZCBhcmdzLnByZXR0eVxuXG4gICAgICAgIGJhciA9IChuKSAtPlxuICAgICAgICAgICAgYiA9ICfilo/ilo7ilo3iloziloviloriloknXG4gICAgICAgICAgICBiW01hdGguZmxvb3Igbi8oMTAwMC83KV0gIFxuICAgICAgICBcbiAgICAgICAgaWYgc3RhdC5zaXplID09IDBcbiAgICAgICAgICAgIHJldHVybiBycGFkICcnLCA4XG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwXG4gICAgICAgICAgICByZXR1cm4gY29sb3JzWydfc2l6ZSddWydiJ11bMV0gKyBycGFkIGJhcihzdGF0LnNpemUpLCA4XG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGZnKDAsMCwyKSArICfilognICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwKSwgN1xuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMDAwXG4gICAgICAgICAgICByZXR1cm4gZmcoMCwwLDIpICsgJ+KWiOKWiCcgKyBycGFkIGJhcihzdGF0LnNpemUvMTAwKSwgNlxuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGZnKDAsMCwzKSArICfilojilojilognICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMDApLCA1XG4gICAgICAgICAgICBcbiAgICAgICAgbWIgPSBwYXJzZUludCBzdGF0LnNpemUgLyAxMDAwMDAwXG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGZnKDAsMCwyKSArICfilojilojilognICsgZmcoMCwwLDMpICsgJ+KWiCcgICArIGZnKDAsMCwzKSArIHJwYWQgYmFyKHN0YXQuc2l6ZS8xMDAwMCksIDRcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGZnKDAsMCwyKSArICfilojilojilognICsgZmcoMCwwLDMpICsgJ+KWiOKWiCcgICsgZmcoMCwwLDMpICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMDAwMCksIDNcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDAwMDAwMDBcbiAgICAgICAgICAgIHJldHVybiBmZygwLDAsMikgKyAn4paI4paI4paIJyArIGZnKDAsMCwzKSArICfilojilojilognICsgZmcoMCwwLDQpICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMDAwMDApLCAyXG4gICAgICAgIGdiID0gcGFyc2VJbnQgbWIgLyAxMDAwXG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGZnKDAsMCwyKSArICfilojilojilognICsgZmcoMCwwLDMpICsgJ+KWiOKWiOKWiCcgKyBmZygwLDAsNCkgKyAn4paIJyArIGZnKDAsMCw0KSArIHJwYWQgYmFyKHN0YXQuc2l6ZS8xMDAwMDAwMCksIDFcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDAwMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGZnKDAsMCwyKSArICfilojilojilognICsgZmcoMCwwLDMpICsgJ+KWiOKWiOKWiCcgKyBmZygwLDAsNCkgKyAn4paI4paIJyArIGZnKDAsMCw0KSArIGJhcihzdGF0LnNpemUvMTAwMDAwMDAwKVxuICAgICAgICBcbiAgICBpZiBhcmdzLnByZXR0eSBhbmQgc3RhdC5zaXplID09IDBcbiAgICAgICAgcmV0dXJuIGxwYWQoJyAnLCAxMSlcbiAgICBpZiBzdGF0LnNpemUgPCAxMDAwXG4gICAgICAgIGNvbG9yc1snX3NpemUnXVsnYiddWzBdICsgbHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZSBpZiBzdGF0LnNpemUgPCAxMDAwMDAwXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ2tCJ11bMF0gKyBscGFkKChzdGF0LnNpemUgLyAxMDAwKS50b0ZpeGVkKDApLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydrQiddWzFdICsgXCJrQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ2tCJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlIGlmIHN0YXQuc2l6ZSA8IDEwMDAwMDAwMDBcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnTUInXVswXSArIGxwYWQoKHN0YXQuc2l6ZSAvIDEwMDAwMDApLnRvRml4ZWQoMSksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ01CJ11bMV0gKyBcIk1CIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnTUInXVswXSArIGxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2UgaWYgc3RhdC5zaXplIDwgMTAwMDAwMDAwMDAwMFxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydHQiddWzBdICsgbHBhZCgoc3RhdC5zaXplIC8gMTAwMDAwMDAwMCkudG9GaXhlZCgxKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsnR0InXVsxXSArIFwiR0IgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydHQiddWzBdICsgbHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZVxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydUQiddWzBdICsgbHBhZCgoc3RhdC5zaXplIC8gMTAwMDAwMDAwMDAwMCkudG9GaXhlZCgzKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsnVEInXVsxXSArIFwiVEIgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydUQiddWzBdICsgbHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG5cbiMgMDAwMDAwMDAwICAwMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiMgICAgMDAwICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG5cbnRpbWVTdHJpbmcgPSAoc3RhdCkgLT5cbiAgICBcbiAgICBpZiBhcmdzLm5lcmR5IGFuZCBhcmdzLnByZXR0eVxuICAgICAgICBzZWMgPSBwYXJzZUludCAoRGF0ZS5ub3coKS1zdGF0Lm10aW1lTXMpLzEwMDBcbiAgICAgICAgbW4gID0gcGFyc2VJbnQgc2VjLzYwXG4gICAgICAgIGhyICA9IHBhcnNlSW50IHNlYy8zNjAwXG4gICAgICAgIGlmIGhyIDwgMTJcbiAgICAgICAgICAgIGlmIHNlYyA8IDYwXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArICcgICAnICsgZmcoNSw1LDUpICsgJ+KXi+KXlOKXkeKXlSdbcGFyc2VJbnQgc2VjLzE1XSArICcgJyBcbiAgICAgICAgICAgIGVsc2UgaWYgbW4gPCA2MFxuICAgICAgICAgICAgICAgIHJldHVybiBCRygwLDAsMSkgKyAnICAnICsgZmcoMywzLDUpICsgJ+KXi+KXlOKXkeKXlSdbcGFyc2VJbnQgbW4vMTVdICsgZmcoMCwwLDMpICsgJ+KXjCAnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArICcgJyArIGZnKDIsMiw1KSArICfil4vil5Til5Hil5UnW3BhcnNlSW50IGhyLzNdICsgZmcoMCwwLDMpICsgJ+KXjOKXjCAnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGR5ID0gcGFyc2VJbnQgTWF0aC5yb3VuZCBzZWMvKDI0KjM2MDApXG4gICAgICAgICAgICB3ayA9IHBhcnNlSW50IE1hdGgucm91bmQgc2VjLyg3KjI0KjM2MDApXG4gICAgICAgICAgICBtdCA9IHBhcnNlSW50IE1hdGgucm91bmQgc2VjLygzMCoyNCozNjAwKVxuICAgICAgICAgICAgeXIgPSBwYXJzZUludCBNYXRoLnJvdW5kIHNlYy8oMzY1KjI0KjM2MDApXG4gICAgICAgICAgICBpZiBkeSA8IDEwXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArIGZnKDAsMCw1KSArIFwiICN7ZHl9IFxcdWYxODUgXCJcbiAgICAgICAgICAgIGVsc2UgaWYgd2sgPCA1XG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArIGZnKDAsMCw0KSArIFwiICN7d2t9IFxcdWYxODYgXCJcbiAgICAgICAgICAgIGVsc2UgaWYgbXQgPCAxMFxuICAgICAgICAgICAgICAgIHJldHVybiBCRygwLDAsMSkgKyBmZygwLDAsMykgKyBcIiAje210fSBcXHVmNDU1IFwiXG4gICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgIHJldHVybiBCRygwLDAsMSkgKyBmZygwLDAsMykgKyBcIiAje3JwYWQgeXIsIDJ9XFx1ZjZlNiBcIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICBtb21lbnQgPSByZXF1aXJlICdtb21lbnQnXG4gICAgdCA9IG1vbWVudCBzdGF0Lm10aW1lXG4gICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgYWdlID0gbW9tZW50KCkudG8odCwgdHJ1ZSlcbiAgICAgICAgW251bSwgcmFuZ2VdID0gYWdlLnNwbGl0ICcgJ1xuICAgICAgICBudW0gPSAnMScgaWYgbnVtWzBdID09ICdhJ1xuICAgICAgICBpZiByYW5nZSA9PSAnZmV3J1xuICAgICAgICAgICAgbnVtID0gbW9tZW50KCkuZGlmZiB0LCAnc2Vjb25kcydcbiAgICAgICAgICAgIHJhbmdlID0gJ3NlY29uZHMnXG4gICAgICAgICAgICBmdygyMykgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdygxNikgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ3llYXInXG4gICAgICAgICAgICBmdyg2KSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDMpICsgcnBhZChyYW5nZSwgNykgKyAnICdcbiAgICAgICAgZWxzZSBpZiByYW5nZS5zdGFydHNXaXRoICdtb250aCdcbiAgICAgICAgICAgIGZ3KDgpICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoNCkgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ2RheSdcbiAgICAgICAgICAgIGZ3KDEwKSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDYpICsgcnBhZChyYW5nZSwgNykgKyAnICdcbiAgICAgICAgZWxzZSBpZiByYW5nZS5zdGFydHNXaXRoICdob3VyJ1xuICAgICAgICAgICAgZncoMTUpICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoOCkgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmdygxOCkgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdygxMikgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgIGVsc2VcbiAgICAgICAgZncoMTYpICsgbHBhZCh0LmZvcm1hdChcIkREXCIpLDIpICsgZncoNykrJy4nICtcbiAgICAgICAgZncoMTIpICsgdC5mb3JtYXQoXCJNTVwiKSArIGZ3KDcpK1wiLlwiICtcbiAgICAgICAgZncoIDgpICsgdC5mb3JtYXQoXCJZWVwiKSArICcgJyArXG4gICAgICAgIGZ3KDE2KSArIHQuZm9ybWF0KFwiSEhcIikgKyBjb2wgPSBmdyg3KSsnOicgK1xuICAgICAgICBmdygxNCkgKyB0LmZvcm1hdChcIm1tXCIpICsgY29sID0gZncoMSkrJzonICtcbiAgICAgICAgZncoIDQpICsgdC5mb3JtYXQoXCJzc1wiKSArICcgJ1xuXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcblxub3duZXJOYW1lID0gKHN0YXQpIC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIHVzZXJuYW1lIHN0YXQudWlkXG4gICAgY2F0Y2hcbiAgICAgICAgc3RhdC51aWRcblxuZ3JvdXBOYW1lID0gKHN0YXQpIC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIGdyb3VwbmFtZSBzdGF0LmdpZFxuICAgIGNhdGNoXG4gICAgICAgIHN0YXQuZ2lkXG5cbm93bmVyU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgb3duID0gb3duZXJOYW1lKHN0YXQpXG4gICAgZ3JwID0gZ3JvdXBOYW1lKHN0YXQpXG4gICAgb2NsID0gY29sb3JzWydfdXNlcnMnXVtvd25dXG4gICAgb2NsID0gY29sb3JzWydfdXNlcnMnXVsnZGVmYXVsdCddIHVubGVzcyBvY2xcbiAgICBnY2wgPSBjb2xvcnNbJ19ncm91cHMnXVtncnBdXG4gICAgZ2NsID0gY29sb3JzWydfZ3JvdXBzJ11bJ2RlZmF1bHQnXSB1bmxlc3MgZ2NsXG4gICAgb2NsICsgcnBhZChvd24sIHN0YXRzLm1heE93bmVyTGVuZ3RoKSArIFwiIFwiICsgZ2NsICsgcnBhZChncnAsIHN0YXRzLm1heEdyb3VwTGVuZ3RoKVxuXG4jIDAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG5cbnJ3eFN0cmluZyA9IChzdGF0LCBpKSAtPlxuICAgIFxuICAgIG1vZGUgPSBzdGF0Lm1vZGVcbiAgICBcbiAgICBpZiBhcmdzLm5lcmR5XG4gICAgICAgIHIgPSAnIFxcdWY0NDEnXG4gICAgICAgIHcgPSAnXFx1ZjA0MCdcbiAgICAgICAgeCA9IHN0YXQuaXNEaXJlY3RvcnkoKSBhbmQgJ1xcdWYwODUnIG9yICdcXHVmMDEzJ1xuICAgICAgICBcbiAgICAgICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjEwMCkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWydyKyddICsgciBvciBjb2xvcnNbJ19yaWdodHMnXVsnci0nXSArIHIpICtcbiAgICAgICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjAxMCkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWyd3KyddICsgdyBvciBjb2xvcnNbJ19yaWdodHMnXVsndy0nXSArIHcpICtcbiAgICAgICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjAwMSkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWyd4KyddICsgeCBvciBjb2xvcnNbJ19yaWdodHMnXVsneC0nXSArIHgpXG4gICAgZWxzZVxuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMTAwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3IrJ10gKyAnIHInIG9yIGNvbG9yc1snX3JpZ2h0cyddWydyLSddICsgJyAgJykgK1xuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDEwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3crJ10gKyAnIHcnIG9yIGNvbG9yc1snX3JpZ2h0cyddWyd3LSddICsgJyAgJykgK1xuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDAxKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3grJ10gKyAnIHgnIG9yIGNvbG9yc1snX3JpZ2h0cyddWyd4LSddICsgJyAgJylcblxucmlnaHRzU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgdXIgPSByd3hTdHJpbmcoc3RhdCwgMilcbiAgICBnciA9IHJ3eFN0cmluZyhzdGF0LCAxKVxuICAgIHJvID0gcnd4U3RyaW5nKHN0YXQsIDApICsgXCIgXCJcbiAgICB1ciArIGdyICsgcm8gKyByZXNldFxuXG5pbm9kZVN0cmluZyA9IChzdGF0KSAtPlxuICAgIFxuICAgIGlmIHN0YXQubmxpbmsgPiAxXG4gICAgICAgIGxuayA9IGNvbG9yc1snX2lub2RlcyddWydsbmsnXSArIGxwYWQoc3RhdC5ubGluaywgMykgKyAnICcgKyByZXNldFxuICAgIGVsc2UgXG4gICAgICAgIGxuayA9IHJlc2V0ICsgJyAgICAnXG4gICAgY29sb3JzWydfaW5vZGVzJ11bJ2lkJ10gKyBscGFkKHN0YXQuaW5vLCA4KSArICcgJyArIGxua1xuICAgIFxuZ2V0UHJlZml4ID0gKHN0YXQsIGRlcHRoKSAtPlxuICAgIFxuICAgIHMgPSAnJ1xuICAgIFxuICAgIGlmIGFyZ3MuaW5vZGVJbmZvc1xuICAgICAgICBzICs9IGlub2RlU3RyaW5nIHN0YXRcbiAgICAgICAgcyArPSBcIiBcIlxuICAgIGlmIGFyZ3MucmlnaHRzXG4gICAgICAgIHMgKz0gcmlnaHRzU3RyaW5nIHN0YXRcbiAgICAgICAgcyArPSBcIiBcIlxuICAgIGlmIGFyZ3Mub3duZXJcbiAgICAgICAgcyArPSBvd25lclN0cmluZyBzdGF0XG4gICAgICAgIHMgKz0gXCIgXCJcbiAgICBpZiBhcmdzLm1kYXRlXG4gICAgICAgIHMgKz0gdGltZVN0cmluZyBzdGF0XG4gICAgICAgIHMgKz0gcmVzZXRcbiAgICBpZiBhcmdzLmJ5dGVzXG4gICAgICAgIHMgKz0gc2l6ZVN0cmluZyBzdGF0XG4gICAgICAgIFxuICAgIGlmIGRlcHRoIGFuZCBhcmdzLnRyZWVcbiAgICAgICAgcyArPSBycGFkICcnLCBkZXB0aCo0XG4gICAgICAgIFxuICAgIGlmIHMubGVuZ3RoID09IDAgYW5kIGFyZ3Mub2Zmc2V0XG4gICAgICAgIHMgKz0gJyAgICAgICAnXG4gICAgc1xuICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMFxuXG5zb3J0ID0gKGxpc3QsIHN0YXRzLCBleHRzPVtdKSAtPlxuICAgIFxuICAgIHppcCAgICA9IHJlcXVpcmUgJ2xvZGFzaC56aXAnXG4gICAgdW56aXAgID0gcmVxdWlyZSAnbG9kYXNoLnVuemlwJ1xuICAgIG1vbWVudCA9IHJlcXVpcmUgJ21vbWVudCdcbiAgICBcbiAgICBsID0gemlwIGxpc3QsIHN0YXRzLCBbMC4uLmxpc3QubGVuZ3RoXSwgKGV4dHMubGVuZ3RoID4gMCBhbmQgZXh0cyBvciBbMC4uLmxpc3QubGVuZ3RoXSlcbiAgICBcbiAgICBpZiBhcmdzLmtpbmRcbiAgICAgICAgaWYgZXh0cyA9PSBbXSB0aGVuIHJldHVybiBsaXN0XG4gICAgICAgIGwuc29ydCgoYSxiKSAtPlxuICAgICAgICAgICAgaWYgYVszXSA+IGJbM10gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgaWYgYVszXSA8IGJbM10gdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3MudGltZVxuICAgICAgICAgICAgICAgIG0gPSBtb21lbnQoYVsxXS5tdGltZSlcbiAgICAgICAgICAgICAgICBpZiBtLmlzQWZ0ZXIoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgICAgIGlmIG0uaXNCZWZvcmUoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3Muc2l6ZVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA+IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICBlbHNlIGlmIGFyZ3MudGltZVxuICAgICAgICBsLnNvcnQoKGEsYikgLT5cbiAgICAgICAgICAgIG0gPSBtb21lbnQoYVsxXS5tdGltZSlcbiAgICAgICAgICAgIGlmIG0uaXNBZnRlcihiWzFdLm10aW1lKSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICBpZiBtLmlzQmVmb3JlKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhcmdzLnNpemVcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPiBiWzFdLnNpemUgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA8IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYVsyXSA+IGJbMl0gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgLTEpXG4gICAgZWxzZSBpZiBhcmdzLnNpemVcbiAgICAgICAgbC5zb3J0KChhLGIpIC0+XG4gICAgICAgICAgICBpZiBhWzFdLnNpemUgPiBiWzFdLnNpemUgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICB1bnppcChsKVswXVxuXG4jIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgXG4jIDAwMCAgMDAwICAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgMDAwICAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG5cbmlnbm9yZSA9IChwKSAtPlxuICAgIFxuICAgIGJhc2UgPSBzbGFzaC5iYXNlbmFtZSBwXG4gICAgcmV0dXJuIHRydWUgaWYgYmFzZVswXSA9PSAnJCdcbiAgICByZXR1cm4gdHJ1ZSBpZiBiYXNlID09ICdkZXNrdG9wLmluaScgICAgXG4gICAgcmV0dXJuIHRydWUgaWYgYmFzZS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGggJ250dXNlcidcbiAgICBmYWxzZVxuICAgIFxuIyAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMFxuIyAwMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDBcblxubGlzdEZpbGVzID0gKHAsIGRpcmVudHMsIGRlcHRoKSAtPlxuICAgIFxuICAgIGFscGggPSBbXSBpZiBhcmdzLmFscGhhYmV0aWNhbFxuICAgIGRpcnMgPSBbXSAjIHZpc2libGUgZGlyc1xuICAgIGZpbHMgPSBbXSAjIHZpc2libGUgZmlsZXNcbiAgICBkc3RzID0gW10gIyBkaXIgc3RhdHNcbiAgICBmc3RzID0gW10gIyBmaWxlIHN0YXRzXG4gICAgZXh0cyA9IFtdICMgZmlsZSBleHRlbnNpb25zXG5cbiAgICBpZiBhcmdzLm93bmVyXG4gICAgICAgIFxuICAgICAgICBkaXJlbnRzLmZvckVhY2ggKGRlKSAtPlxuICAgICAgICAgICAgcnAgPSBkZS5uYW1lXG4gICAgICAgICAgICBpZiBzbGFzaC5pc0Fic29sdXRlIHJwXG4gICAgICAgICAgICAgICAgZmlsZSA9IHNsYXNoLnJlc29sdmUgcnBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmaWxlICA9IHNsYXNoLmpvaW4gcCwgcnBcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIHN0YXQgPSBmcy5sc3RhdFN5bmMoZmlsZSlcbiAgICAgICAgICAgICAgICBvbCA9IG93bmVyTmFtZShzdGF0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICBnbCA9IGdyb3VwTmFtZShzdGF0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICBpZiBvbCA+IHN0YXRzLm1heE93bmVyTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm1heE93bmVyTGVuZ3RoID0gb2xcbiAgICAgICAgICAgICAgICBpZiBnbCA+IHN0YXRzLm1heEdyb3VwTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm1heEdyb3VwTGVuZ3RoID0gZ2xcbiAgICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICBkaXJlbnRzLmZvckVhY2ggKGRlKSAtPlxuICAgICAgICBcbiAgICAgICAgcnAgPSBkZS5uYW1lXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5pc0Fic29sdXRlIHJwXG4gICAgICAgICAgICBmaWxlICA9IHNsYXNoLnJlc29sdmUgcnBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZmlsZSAgPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gcCwgcnBcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgaWdub3JlIHJwXG4gICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGxzdGF0ID0gZnMubHN0YXRTeW5jIGZpbGVcbiAgICAgICAgICAgIGxpbmsgID0gbHN0YXQuaXNTeW1ib2xpY0xpbmsoKVxuICAgICAgICAgICAgaWYgbGluayBhbmQgb3MucGxhdGZvcm0oKSA9PSAnd2luMzInXG4gICAgICAgICAgICAgICAgaWYgc2xhc2gudGlsZGUoZmlsZSlbMF0gPT0gJ34nXG4gICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gc2xhc2gudGlsZGUgZnMucmVhZGxpbmtTeW5jIGZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpZiB0YXJnZXQuc3RhcnRzV2l0aCAnfi9BcHBEYXRhJ1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlmIHRhcmdldCBpbiBbJ34vRG9jdW1lbnRzJ11cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBzdGF0ID0gbGluayBhbmQgZnMuc3RhdFN5bmMoZmlsZSkgb3IgbHN0YXRcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBpZiBsaW5rXG4gICAgICAgICAgICAgICAgc3RhdCA9IGxzdGF0XG4gICAgICAgICAgICAgICAgc3RhdHMuYnJva2VuTGlua3MucHVzaCBmaWxlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgIyBsb2dfZXJyb3IgXCJjYW4ndCByZWFkIGZpbGU6IFwiLCBmaWxlLCBsaW5rXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgZXh0ICA9IHNsYXNoLmV4dCBmaWxlXG4gICAgICAgIG5hbWUgPSBzbGFzaC5iYXNlIGZpbGVcbiAgICAgICAgXG4gICAgICAgIGlmIG5hbWVbMF0gPT0gJy4nXG4gICAgICAgICAgICBleHQgPSBuYW1lLnN1YnN0cigxKSArIHNsYXNoLmV4dG5hbWUgZmlsZVxuICAgICAgICAgICAgbmFtZSA9ICcnXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgbmFtZS5sZW5ndGggYW5kIG5hbWVbbmFtZS5sZW5ndGgtMV0gIT0gJ1xccicgb3IgYXJncy5hbGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcyA9IGdldFByZWZpeCBzdGF0LCBkZXB0aFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc3RhdC5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICAgICAgaWYgbm90IGFyZ3MuZmlsZXNcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IGFyZ3MudHJlZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbmFtZS5zdGFydHNXaXRoICcuLydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gbmFtZVsyLi5dXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gZGlyU3RyaW5nIG5hbWUsIGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gbGlua1N0cmluZyBmaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJzLnB1c2ggcytyZXNldFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxwaC5wdXNoIHMrcmVzZXQgaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICAgICAgICAgICAgICAgICAgZHN0cy5wdXNoIHN0YXRcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubnVtX2RpcnMgKz0gMVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMuaGlkZGVuX2RpcnMgKz0gMVxuICAgICAgICAgICAgZWxzZSAjIGlmIHBhdGggaXMgZmlsZVxuICAgICAgICAgICAgICAgIGlmIG5vdCBhcmdzLmRpcnNcbiAgICAgICAgICAgICAgICAgICAgcyArPSBuYW1lU3RyaW5nIG5hbWUsIGV4dFxuICAgICAgICAgICAgICAgICAgICBpZiBleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gZXh0U3RyaW5nIG5hbWUsIGV4dFxuICAgICAgICAgICAgICAgICAgICBpZiBsaW5rXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGxpbmtTdHJpbmcgZmlsZVxuICAgICAgICAgICAgICAgICAgICBmaWxzLnB1c2ggcytyZXNldFxuICAgICAgICAgICAgICAgICAgICBhbHBoLnB1c2ggcytyZXNldCBpZiBhcmdzLmFscGhhYmV0aWNhbFxuICAgICAgICAgICAgICAgICAgICBmc3RzLnB1c2ggc3RhdFxuICAgICAgICAgICAgICAgICAgICBleHRzLnB1c2ggZXh0XG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm51bV9maWxlcyArPSAxXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZmlsZXMgKz0gMVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBzdGF0LmlzRmlsZSgpXG4gICAgICAgICAgICAgICAgc3RhdHMuaGlkZGVuX2ZpbGVzICs9IDFcbiAgICAgICAgICAgIGVsc2UgaWYgc3RhdC5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICAgICAgc3RhdHMuaGlkZGVuX2RpcnMgKz0gMVxuXG4gICAgaWYgYXJncy5zaXplIG9yIGFyZ3Mua2luZCBvciBhcmdzLnRpbWVcbiAgICAgICAgaWYgZGlycy5sZW5ndGggYW5kIG5vdCBhcmdzLmZpbGVzXG4gICAgICAgICAgICBkaXJzID0gc29ydCBkaXJzLCBkc3RzXG4gICAgICAgIGlmIGZpbHMubGVuZ3RoXG4gICAgICAgICAgICBmaWxzID0gc29ydCBmaWxzLCBmc3RzLCBleHRzXG5cbiAgICBpZiBhcmdzLmFscGhhYmV0aWNhbFxuICAgICAgICBsb2cgcCBmb3IgcCBpbiBhbHBoXG4gICAgZWxzZVxuICAgICAgICBsb2cgZCBmb3IgZCBpbiBkaXJzXG4gICAgICAgIGxvZyBmIGZvciBmIGluIGZpbHNcblxuIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAgMDAwICAwMDAgICAwMDBcblxubGlzdERpciA9IChkZSwgb3B0PXt9KSAtPlxuICAgICAgICAgICAgXG4gICAgcCA9IGRlLm5hbWVcblxuICAgIGlmIHNsYXNoLmlzUmVsYXRpdmUocCkgYW5kIG9wdC5wYXJlbnRcbiAgICAgICAgcCA9IHNsYXNoLmpvaW4gb3B0LnBhcmVudCwgcFxuXG4gICAgaWYgYXJncy5yZWN1cnNlXG4gICAgICAgIGRlcHRoID0gcGF0aERlcHRoIHAsIG9wdFxuICAgICAgICByZXR1cm4gaWYgZGVwdGggPiBhcmdzLmRlcHRoXG4gICAgXG4gICAgcHMgPSBwXG5cbiAgICB0cnlcbiAgICAgICAgYWxsZGlyZW50cyA9IGZzLnJlYWRkaXJTeW5jIHAsIHdpdGhGaWxlVHlwZXM6dHJ1ZVxuICAgIGNhdGNoIGVyclxuICAgICAgICB0cnVlXG5cbiAgICBpZiBhcmdzLmZpbmRcbiAgICAgICAgZGlyZW50cyA9IGZpbHRlciBhbGxkaXJlbnRzLCAoZGUpIC0+IFJlZ0V4cChhcmdzLmZpbmQpLnRlc3QgZGUubmFtZVxuICAgIGVsc2VcbiAgICAgICAgZGlyZW50cyA9IGFsbGRpcmVudHNcbiAgICAgICAgICAgIFxuICAgIGlmIGFyZ3MuZmluZCBhbmQgbm90IGRpcmVudHM/Lmxlbmd0aFxuICAgICAgICB0cnVlXG4gICAgZWxzZSBpZiBhcmdzLnBhdGhzLmxlbmd0aCA9PSAxIGFuZCBhcmdzLnBhdGhzWzBdID09ICcuJyBhbmQgbm90IGFyZ3MucmVjdXJzZVxuICAgICAgICBsb2cgcmVzZXRcbiAgICBlbHNlIGlmIGFyZ3MudHJlZVxuICAgICAgICBsb2cgZ2V0UHJlZml4KGRlLmlzRGlyZWN0b3J5KCksIGRlcHRoLTEpICsgZGlyU3RyaW5nKHNsYXNoLmJhc2UocHMpLCBzbGFzaC5leHQocHMpKSArIHJlc2V0XG4gICAgZWxzZVxuICAgICAgICBzID0gY29sb3JzWydfYXJyb3cnXSArIFwiIOKWtiBcIiArIGNvbG9yc1snX2hlYWRlciddWzBdXG4gICAgICAgIHBzID0gc2xhc2gudGlsZGUgc2xhc2gucmVzb2x2ZSBwXG4gICAgICAgIHJzID0gc2xhc2gucmVsYXRpdmUgcHMsIHByb2Nlc3MuY3dkKClcbiAgICAgICAgaWYgcnMubGVuZ3RoIDwgcHMubGVuZ3RoXG4gICAgICAgICAgICBwcyA9IHJzXG5cbiAgICAgICAgaWYgcHMgPT0gJy8nXG4gICAgICAgICAgICBzICs9ICcvJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzcCA9IHBzLnNwbGl0KCcvJylcbiAgICAgICAgICAgIHMgKz0gY29sb3JzWydfaGVhZGVyJ11bMF0gKyBzcC5zaGlmdCgpXG4gICAgICAgICAgICB3aGlsZSBzcC5sZW5ndGhcbiAgICAgICAgICAgICAgICBwbiA9IHNwLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBpZiBwblxuICAgICAgICAgICAgICAgICAgICBzICs9IGNvbG9yc1snX2hlYWRlciddWzFdICsgJy8nXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gY29sb3JzWydfaGVhZGVyJ11bc3AubGVuZ3RoID09IDAgYW5kIDIgb3IgMF0gKyBwblxuICAgICAgICBsb2cgcmVzZXRcbiAgICAgICAgbG9nIHMgKyBcIiBcIiArIHJlc2V0XG4gICAgICAgIGxvZyByZXNldFxuXG4gICAgaWYgZGlyZW50cz8ubGVuZ3RoXG4gICAgICAgIGxpc3RGaWxlcyBwLCBkaXJlbnRzLCBkZXB0aFxuXG4gICAgaWYgYXJncy5yZWN1cnNlXG4gICAgICAgIFxuICAgICAgICBkb1JlY3Vyc2UgPSAoZGUpIC0+XG4gICAgICAgICAgICBmID0gZGUubmFtZVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIHNsYXNoLmJhc2VuYW1lKGYpIGluIGFyZ3MuaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgbm90IGFyZ3MuYWxsIGFuZCBzbGFzaC5leHQoZikgPT0gJ2FwcCdcbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBub3QgYXJncy5hbGwgYW5kIGZbMF0gPT0gJy4nXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgbm90IGFyZ3MuZm9sbG93U3ltTGlua3MgYW5kIGRlLmlzU3ltYm9saWNMaW5rKClcbiAgICAgICAgICAgIGRlLmlzRGlyZWN0b3J5KCkgb3IgZGUuaXNTeW1ib2xpY0xpbmsoKSBhbmQgZnMuc3RhdFN5bmMoc2xhc2guam9pbiBwLCBmKS5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBmb3IgZGUgaW4gZmlsdGVyIGFsbGRpcmVudHMsIGRvUmVjdXJzZVxuICAgICAgICAgICAgICAgIGxpc3REaXIgZGUsIHBhcmVudDpwLCByZWxhdGl2ZVRvOm9wdC5yZWxhdGl2ZVRvXG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgbXNnID0gZXJyLm1lc3NhZ2VcbiAgICAgICAgICAgIG1zZyA9IFwicGVybWlzc2lvbiBkZW5pZWRcIiBpZiBtc2cuc3RhcnRzV2l0aCBcIkVBQ0NFU1wiXG4gICAgICAgICAgICBtc2cgPSBcInBlcm1pc3Npb24gZGVuaWVkXCIgaWYgbXNnLnN0YXJ0c1dpdGggXCJFUEVSTVwiXG4gICAgICAgICAgICBsb2dfZXJyb3IgbXNnXG4gICAgICAgICAgICBcbnBhdGhEZXB0aCA9IChwLCBvcHQpIC0+XG4gICAgXG4gICAgcmVsID0gc2xhc2gucmVsYXRpdmUgcCwgb3B0Py5yZWxhdGl2ZVRvID8gcHJvY2Vzcy5jd2QoKVxuICAgIHJldHVybiAwIGlmIHAgPT0gJy4nXG4gICAgcmVsLnNwbGl0KCcvJykubGVuZ3RoXG5cbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuXG5tYWluID0gLT5cbiAgICAgICAgICAgIFxuICAgIHBhdGhzdGF0cyA9IGFyZ3MucGF0aHMubWFwIChmKSAtPlxuICAgICAgICBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBbZiwgZnMuc3RhdFN5bmMoZildXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgICBsb2dfZXJyb3IgJ25vIHN1Y2ggZmlsZTogJyBmXG4gICAgICAgICAgICBbXVxuICAgIFxuICAgIHBhdGhzdGF0cyA9IHBhdGhzdGF0cy5maWx0ZXIgKGYpIC0+IGYubGVuZ3RoXG4gICAgXG4gICAgaWYgbm90IHBhdGhzdGF0cy5sZW5ndGggdGhlbiBwcm9jZXNzLmV4aXQoMSlcbiAgICBcbiAgICBmaWxlc3RhdHMgPSBwYXRoc3RhdHMuZmlsdGVyIChmKSAtPiBub3QgZlsxXS5pc0RpcmVjdG9yeSgpXG4gICAgXG4gICAgaWYgZmlsZXN0YXRzLmxlbmd0aCA+IDBcbiAgICAgICAgbG9nIHJlc2V0XG4gICAgICAgIGxpc3RGaWxlcyBwcm9jZXNzLmN3ZCgpLCBmaWxlc3RhdHMubWFwKCAocykgLT4gc1sxXS5uYW1lID89IHNbMF07IHNbMV0gKVxuICAgIFxuICAgIGRpcnN0YXRzID0gcGF0aHN0YXRzLmZpbHRlciAoZikgLT4gZlsxXT8uaXNEaXJlY3RvcnkoKVxuICAgICAgICBcbiAgICBmb3IgcCBpbiBkaXJzdGF0c1xuICAgICAgICBsb2cgJycgaWYgYXJncy50cmVlXG4gICAgICAgIGZpbGUgPSBzbGFzaC5maWxlIHBbMF1cbiAgICAgICAgcGFyZW50ID0gaWYgc2xhc2guaXNSZWxhdGl2ZShwWzBdKSB0aGVuIHByb2Nlc3MuY3dkKCkgZWxzZSBzbGFzaC5kaXIgcFswXVxuICAgICAgICBwWzFdLm5hbWUgPz0gZmlsZVxuICAgICAgICBsaXN0RGlyIHBbMV0sIHBhcmVudDpwYXJlbnQsIHJlbGF0aXZlVG86cGFyZW50XG4gICAgXG4gICAgbG9nIFwiXCJcbiAgICBpZiBhcmdzLmluZm9cbiAgICAgICAgbG9nIEJXKDEpICsgXCIgXCIgK1xuICAgICAgICBmdyg4KSArIHN0YXRzLm51bV9kaXJzICsgKHN0YXRzLmhpZGRlbl9kaXJzIGFuZCBmdyg0KSArIFwiK1wiICsgZncoNSkgKyAoc3RhdHMuaGlkZGVuX2RpcnMpIG9yIFwiXCIpICsgZncoNCkgKyBcIiBkaXJzIFwiICtcbiAgICAgICAgZncoOCkgKyBzdGF0cy5udW1fZmlsZXMgKyAoc3RhdHMuaGlkZGVuX2ZpbGVzIGFuZCBmdyg0KSArIFwiK1wiICsgZncoNSkgKyAoc3RhdHMuaGlkZGVuX2ZpbGVzKSBvciBcIlwiKSArIGZ3KDQpICsgXCIgZmlsZXMgXCIgK1xuICAgICAgICBmdyg4KSArIHRpbWUocHJvY2Vzcy5ocnRpbWUuYmlnaW50PygpLXN0YXJ0VGltZSkgKyBcIiBcIiArXG4gICAgICAgIHJlc2V0XG4gICAgXG5pZiBhcmdzXG4gICAgaW5pdEFyZ3MoKVxuICAgIG1haW4oKVxuZWxzZVxuICAgIG1vZHVsZU1haW4gPSAoYXJnLCBvcHQ9e30pIC0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggdHlwZW9mIGFyZ1xuICAgICAgICAgICAgd2hlbiAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBPYmplY3QuYXNzaWduIHt9LCBvcHRcbiAgICAgICAgICAgICAgICBhcmdzLnBhdGhzID89IFtdXG4gICAgICAgICAgICAgICAgYXJncy5wYXRocy5wdXNoIGFyZ1xuICAgICAgICAgICAgd2hlbiAnb2JqZWN0J1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBPYmplY3QuYXNzaWduIHt9LCBhcmdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhcmdzID0gcGF0aHM6WycuJ11cbiAgICAgICAgaW5pdEFyZ3MoKVxuICAgICAgICBcbiAgICAgICAgb3V0ID0gJydcbiAgICAgICAgb2xkbG9nID0gY29uc29sZS5sb2dcbiAgICAgICAgY29uc29sZS5sb2cgPSAtPiBcbiAgICAgICAgICAgIGZvciBhcmcgaW4gYXJndW1lbnRzIHRoZW4gb3V0ICs9IFN0cmluZyhhcmcpXG4gICAgICAgICAgICBvdXQgKz0gJ1xcbidcbiAgICAgICAgXG4gICAgICAgIG1haW4oKVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2cgPSBvbGRsb2dcbiAgICAgICAgb3V0XG4gICAgXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBtb2R1bGVNYWluXG4gICAgIl19
//# sourceURL=../coffee/color-ls.coffee