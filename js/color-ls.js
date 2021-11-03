// koffee 1.14.0

/*
 0000000   0000000   000       0000000   00000000           000       0000000
000       000   000  000      000   000  000   000          000      000
000       000   000  000      000   000  0000000    000000  000      0000000
000       000   000  000      000   000  000   000          000           000
 0000000   0000000   0000000   0000000   000   000          0000000  0000000
 */
var BG, BW, ansi, args, base1, bold, colors, dirString, dotString, exec, extString, fg, filter, fs, fw, getPrefix, groupMap, groupName, groupname, ignore, initArgs, inodeString, karg, linkString, listDir, listFiles, log_error, lpad, main, makeCommand, moduleMain, nameString, os, ownerName, ownerString, pathDepth, ref, reset, rightsString, rpad, rwxString, sizeString, slash, sort, startTime, stats, time, timeString, token, userMap, username, util,
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
    args = karg("color-ls\n    paths           . ? the file(s) and/or folder(s) to display . **\n    all             . ? show dot files                  . = false\n    dirs            . ? show only dirs                  . = false\n    files           . ? show only files                 . = false\n    bytes           . ? include size                    . = false\n    mdate           . ? include modification date       . = false\n    long            . ? include size and date           . = false\n    owner           . ? include owner and group         . = false\n    rights          . ? include rights                  . = false\n    size            . ? sort by size                    . = false\n    time            . ? sort by time                    . = false\n    kind            . ? sort by kind                    . = false\n    nerdy           . ? use nerd font icons             . = false\n    execute         . ? execute command for each find result            . - X\n    dryrun          . ? print instead of execute commands     . = false . - x\n    pretty          . ? pretty size and age             . = true\n    ignore          . ? don't recurse into              . = node_modules .git\n    info            . ? show statistics                 . = false . - I\n    alphabetical    . ? don't group dirs before files   . = false . - A\n    offset          . ? indent short listings           . = false . - O\n    recurse         . ? recurse into subdirs            . = false . - R\n    tree            . ? recurse and indent              . = false . - T\n    followSymLinks  . ? recurse follows symlinks        . = false . - S \n    depth           . ? recursion depth                 . = ∞     . - D\n    find            . ? filter with a regexp            .           - F\n    debug                                               . = false . - Z\n    inodeInfos                                          . = false . - N \n\nversion      " + (require(__dirname + "/../package.json").version));
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

exec = [];

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
                        if (args.execute) {
                            exec.push(file);
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
                    if (args.execute) {
                        exec.push(file);
                    }
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
        console.log(getPrefix(fs.lstatSync(ps), depth - 1) + dirString(slash.base(ps), slash.ext(ps)) + reset);
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

makeCommand = function(p) {
    return args.execute.replace(/\#\w+/g, function(s) {
        return "" + (slash[s.slice(1)](p));
    });
};

main = function() {
    var base2, base3, childp, cmd, commands, dirstats, err, ex, file, filestats, j, k, len, len1, noon, p, parent, pathstats, ref1, result;
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
    if (args.execute && exec) {
        noon = require('noon');
        commands = (function() {
            var k, len1, results;
            results = [];
            for (k = 0, len1 = exec.length; k < len1; k++) {
                ex = exec[k];
                results.push(makeCommand(ex));
            }
            return results;
        })();
        console.log('');
        if (args.dryrun) {
            console.log(BG(0, 1, 0) + fg(0, 3, 0) + ' dryrun ' + reset);
            console.log('');
            console.log(noon.stringify(commands));
        } else {
            childp = require('child_process');
            console.log(BG(2, 0, 0) + fg(5, 5, 0) + ' execute ' + reset);
            console.log('');
            for (k = 0, len1 = commands.length; k < len1; k++) {
                cmd = commands[k];
                console.log(BW(1) + fw(4) + cmd + reset);
                try {
                    result = childp.execSync(cmd, {
                        encoding: 'utf8'
                    });
                    if ((result.status != null) || (result.stdout != null)) {
                        console.log('dafuk?');
                        console.log(result.stdout);
                        console.log(BG(4, 0, 0) + fg(5, 5, 0) + result.stderr + reset);
                    } else {
                        console.log(result);
                    }
                } catch (error1) {
                    err = error1;
                    console.error(BG(4, 0, 0) + fg(5, 5, 0) + ((ref1 = err != null ? err.stdout : void 0) != null ? ref1 : err) + reset);
                }
            }
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItbHMuanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJjb2xvci1scy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNmJBQUE7SUFBQTs7QUFRQSxTQUFBLGdFQUEwQixDQUFDOztBQUUzQixNQUF1QixPQUFBLENBQVEsTUFBUixDQUF2QixFQUFFLGVBQUYsRUFBUSxlQUFSLEVBQWM7O0FBQ2QsRUFBQSxHQUFTLE9BQUEsQ0FBUSxJQUFSOztBQUNULEVBQUEsR0FBUyxPQUFBLENBQVEsSUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0FBQ1QsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsaUJBQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztBQUVULElBQUEsR0FBUTs7QUFDUixLQUFBLEdBQVE7O0FBRVIsSUFBQSxHQUFTOztBQUNULEtBQUEsR0FBUyxJQUFJLENBQUM7O0FBQ2QsRUFBQSxHQUFTLElBQUksQ0FBQyxFQUFFLENBQUM7O0FBQ2pCLEVBQUEsR0FBUyxJQUFJLENBQUMsRUFBRSxDQUFDOztBQUNqQixFQUFBLEdBQVMsU0FBQyxDQUFEO1dBQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFVLENBQUEsQ0FBQTtBQUF6Qjs7QUFDVCxFQUFBLEdBQVMsU0FBQyxDQUFEO1dBQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFVLENBQUEsQ0FBQTtBQUF6Qjs7QUFFVCxLQUFBLEdBQ0k7SUFBQSxRQUFBLEVBQWdCLENBQWhCO0lBQ0EsU0FBQSxFQUFnQixDQURoQjtJQUVBLFdBQUEsRUFBZ0IsQ0FGaEI7SUFHQSxZQUFBLEVBQWdCLENBSGhCO0lBSUEsY0FBQSxFQUFnQixDQUpoQjtJQUtBLGNBQUEsRUFBZ0IsQ0FMaEI7SUFNQSxXQUFBLEVBQWdCLEVBTmhCOzs7QUFjSixJQUFHLENBQUksTUFBTSxD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QTlCLENBaEJaO0lBaUJBLElBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBakJaO0lBa0JBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBbEJaO0lBbUJBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBbkJaO0lBb0JBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBcEJaO0lBcUJBLE1BQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBckJaO0lBc0JBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBdEJaO0lBdUJBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBdkJaO0lBd0JBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBeEJaO0lBeUJBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBekJaO0lBMEJBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBMUJaO0lBNEJBLFVBQUEsRUFBWSxDQUFPLEVBQUEsQ0FBRyxFQUFILENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsQ0FBbkIsRUFBOEIsRUFBQSxD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LEdBRytDLEdBSC9DLEdBSUosS0FKRCxFQURIOztBQXZERzs7QUE4RFAsSUFBRyxJQUFIO0lBQ0ksUUFBQSxDQUFBO0lBQ0EsSUFBQSxDQUFBLEVBRko7Q0FBQSxNQUFBO0lBSUksVUFBQSxHQUFhLFNBQUMsR0FBRCxFQUFNLEdBQU47QUFFVCxZQUFBOztZQUZlLE1BQUk7O0FBRW5CLGdCQUFPLE9BQU8sR0FBZDtBQUFBLGlCQUNTLFFBRFQ7Z0JBRVEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxNQUFQLENBQWMsRUFBZCxFQUFrQixHQUFsQjs7b0JBQ1AsSUFBSSxDQUFDOztvQkFBTCxJQUFJLENBQUMsUUFBUzs7Z0JBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFYLENBQWdCLEdBQWhCO0FBSEM7QUFEVCxpQkFLUyxRQUxUO2dCQU1RLElBQUEsR0FBTyxNQUFNLENBQUMsTUFBUCxDQUFjLEVBQWQsRUFBa0IsR0FBbEI7QUFETjtBQUxUO2dCQVFRLElBQUEsR0FBTztvQkFBQSxLQUFBLEVBQU0sQ0FBQyxHQUFELENBQU47O0FBUmY7UUFTQSxRQUFBLENBQUE7UUFFQSxHQUFBLEdBQU07UUFDTixNQUFBLEdBQVMsT0FBTyxDQUFDO1FBQ2pCLE9BQU8sQ0FBQyxHQUFSLEdBQWMsU0FBQTtBQUNWLGdCQUFBO0FBQUEsaUJBQUEsMkNBQUE7O2dCQUEwQixHQUFBLElBQU8sTUFBQSxDQUFPLEdBQVA7QUFBakM7bUJBQ0EsR0FBQSxJQUFPO1FBRkc7UUFJZCxJQUFBLENBQUE7UUFFQSxPQUFPLENBQUMsR0FBUixHQUFjO2VBQ2Q7SUF0QlM7SUF3QmIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0E1QnJCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAgICAgICAwMDAgICAgICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwICAwMDAgICAgICAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgIDAwMFxuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgICAgICAgMDAwMDAwMCAgMDAwMDAwMFxuIyMjXG5cbnN0YXJ0VGltZSA9IHByb2Nlc3MuaHJ0aW1lLmJpZ2ludD8oKVxuXG57IGxwYWQsIHJwYWQsIHRpbWUgfSA9IHJlcXVpcmUgJ2tzdHInXG5vcyAgICAgPSByZXF1aXJlICdvcydcbmZzICAgICA9IHJlcXVpcmUgJ2ZzJ1xuc2xhc2ggID0gcmVxdWlyZSAna3NsYXNoJ1xuZmlsdGVyID0gcmVxdWlyZSAnbG9kYXNoLmZpbHRlcidcbmFuc2kgICA9IHJlcXVpcmUgJ2Fuc2ktMjU2LWNvbG9ycydcbnV0aWwgICA9IHJlcXVpcmUgJ3V0aWwnXG5cbmFyZ3MgID0gbnVsbFxudG9rZW4gPSB7fVxuXG5ib2xkICAgPSAnXFx4MWJbMW0nXG5yZXNldCAgPSBhbnNpLnJlc2V0XG5mZyAgICAgPSBhbnNpLmZnLmdldFJnYlxuQkcgICAgID0gYW5zaS5iZy5nZXRSZ2JcbmZ3ICAgICA9IChpKSAtPiBhbnNpLmZnLmdyYXlzY2FsZVtpXVxuQlcgICAgID0gKGkpIC0+IGFuc2kuYmcuZ3JheXNjYWxlW2ldXG5cbnN0YXRzID0gIyBjb3VudGVycyBmb3IgKGhpZGRlbikgZGlycy9maWxlc1xuICAgIG51bV9kaXJzOiAgICAgICAwXG4gICAgbnVtX2ZpbGVzOiAgICAgIDBcbiAgICBoaWRkZW5fZGlyczogICAgMFxuICAgIGhpZGRlbl9maWxlczogICAwXG4gICAgbWF4T3duZXJMZW5ndGg6IDBcbiAgICBtYXhHcm91cExlbmd0aDogMFxuICAgIGJyb2tlbkxpbmtzOiAgICBbXVxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcblxuaWYgbm90IG1vZHVsZS5wYXJlbnQgb3IgbW9kdWxlLnBhcmVudC5pZCA9PSAnLidcblxuICAgIGthcmcgPSByZXF1aXJlICdrYXJnJ1xuICAgIGFyZ3MgPSBrYXJnIFwiXCJcIlxuICAgIGNvbG9yLWxzXG4gICAgICAgIHBhdGhzICAgICAgICAgICAuID8gdGhlIGZpbGUocykgYW5kL29yIGZvbGRlcihzKSB0byBkaXNwbGF5IC4gKipcbiAgICAgICAgYWxsICAgICAgICAgICAgIC4gPyBzaG93IGRvdCBmaWxlcyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBkaXJzICAgICAgICAgICAgLiA/IHNob3cgb25seSBkaXJzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGZpbGVzICAgICAgICAgICAuID8gc2hvdyBvbmx5IGZpbGVzICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgYnl0ZXMgICAgICAgICAgIC4gPyBpbmNsdWRlIHNpemUgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBtZGF0ZSAgICAgICAgICAgLiA/IGluY2x1ZGUgbW9kaWZpY2F0aW9uIGRhdGUgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGxvbmcgICAgICAgICAgICAuID8gaW5jbHVkZSBzaXplIGFuZCBkYXRlICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgb3duZXIgICAgICAgICAgIC4gPyBpbmNsdWRlIG93bmVyIGFuZCBncm91cCAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICByaWdodHMgICAgICAgICAgLiA/IGluY2x1ZGUgcmlnaHRzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHNpemUgICAgICAgICAgICAuID8gc29ydCBieSBzaXplICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgdGltZSAgICAgICAgICAgIC4gPyBzb3J0IGJ5IHRpbWUgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBraW5kICAgICAgICAgICAgLiA/IHNvcnQgYnkga2luZCAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIG5lcmR5ICAgICAgICAgICAuID8gdXNlIG5lcmQgZm9udCBpY29ucyAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICAgICAgZXhlY3V0ZSAgICAgICAgIC4gPyBleGVjdXRlIGNvbW1hbmQgZm9yIGVhY2ggZmluZCByZXN1bHQgICAgICAgICAgICAuIC0gWFxuICAgICAgICBkcnlydW4gICAgICAgICAgLiA/IHByaW50IGluc3RlYWQgb2YgZXhlY3V0ZSBjb21tYW5kcyAgICAgLiA9IGZhbHNlIC4gLSB4XG4gICAgICAgIHByZXR0eSAgICAgICAgICAuID8gcHJldHR5IHNpemUgYW5kIGFnZSAgICAgICAgICAgICAuID0gdHJ1ZVxuICAgICAgICBpZ25vcmUgICAgICAgICAgLiA/IGRvbid0IHJlY3Vyc2UgaW50byAgICAgICAgICAgICAgLiA9IG5vZGVfbW9kdWxlcyAuZ2l0XG4gICAgICAgIGluZm8gICAgICAgICAgICAuID8gc2hvdyBzdGF0aXN0aWNzICAgICAgICAgICAgICAgICAuID0gZmFsc2UgLiAtIElcbiAgICAgICAgYWxwaGFiZXRpY2FsICAgIC4gPyBkb24ndCBncm91cCBkaXJzIGJlZm9yZSBmaWxlcyAgIC4gPSBmYWxzZSAuIC0gQVxuICAgICAgICBvZmZzZXQgICAgICAgICAgLiA/IGluZGVudCBzaG9ydCBsaXN0aW5ncyAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBPXG4gICAgICAgIHJlY3Vyc2UgICAgICAgICAuID8gcmVjdXJzZSBpbnRvIHN1YmRpcnMgICAgICAgICAgICAuID0gZmFsc2UgLiAtIFJcbiAgICAgICAgdHJlZSAgICAgICAgICAgIC4gPyByZWN1cnNlIGFuZCBpbmRlbnQgICAgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gVFxuICAgICAgICBmb2xsb3dTeW1MaW5rcyAgLiA/IHJlY3Vyc2UgZm9sbG93cyBzeW1saW5rcyAgICAgICAgLiA9IGZhbHNlIC4gLSBTIFxuICAgICAgICBkZXB0aCAgICAgICAgICAgLiA/IHJlY3Vyc2lvbiBkZXB0aCAgICAgICAgICAgICAgICAgLiA9IOKIniAgICAgLiAtIERcbiAgICAgICAgZmluZCAgICAgICAgICAgIC4gPyBmaWx0ZXIgd2l0aCBhIHJlZ2V4cCAgICAgICAgICAgIC4gICAgICAgICAgIC0gRlxuICAgICAgICBkZWJ1ZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBaXG4gICAgICAgIGlub2RlSW5mb3MgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgLiAtIE4gXG4gICAgXG4gICAgdmVyc2lvbiAgICAgICN7cmVxdWlyZShcIiN7X19kaXJuYW1lfS8uLi9wYWNrYWdlLmpzb25cIikudmVyc2lvbn1cbiAgICBcIlwiXCJcbiAgICBcbmluaXRBcmdzID0gLT5cbiAgICAgICAgXG4gICAgaWYgYXJncy5zaXplXG4gICAgICAgIGFyZ3MuZmlsZXMgPSB0cnVlXG4gICAgXG4gICAgaWYgYXJncy5sb25nXG4gICAgICAgIGFyZ3MuYnl0ZXMgPSB0cnVlXG4gICAgICAgIGFyZ3MubWRhdGUgPSB0cnVlXG4gICAgICAgIFxuICAgIGlmIGFyZ3MudHJlZVxuICAgICAgICBhcmdzLnJlY3Vyc2UgPSB0cnVlXG4gICAgICAgIGFyZ3Mub2Zmc2V0ICA9IGZhbHNlXG4gICAgXG4gICAgaWYgYXJncy5kaXJzIGFuZCBhcmdzLmZpbGVzXG4gICAgICAgIGFyZ3MuZGlycyA9IGFyZ3MuZmlsZXMgPSBmYWxzZVxuICAgICAgICBcbiAgICBpZiBhcmdzLmlnbm9yZT8ubGVuZ3RoXG4gICAgICAgIGFyZ3MuaWdub3JlID0gYXJncy5pZ25vcmUuc3BsaXQgJyAnIFxuICAgIGVsc2VcbiAgICAgICAgYXJncy5pZ25vcmUgPSBbXVxuICAgICAgICBcbiAgICBpZiBhcmdzLmRlcHRoID09ICfiiJ4nIHRoZW4gYXJncy5kZXB0aCA9IEluZmluaXR5XG4gICAgZWxzZSBhcmdzLmRlcHRoID0gTWF0aC5tYXggMCwgcGFyc2VJbnQgYXJncy5kZXB0aFxuICAgIGlmIE51bWJlci5pc05hTiBhcmdzLmRlcHRoIHRoZW4gYXJncy5kZXB0aCA9IDBcbiAgICAgICAgXG4gICAgaWYgYXJncy5kZWJ1Z1xuICAgICAgICBub29uID0gcmVxdWlyZSAnbm9vbidcbiAgICAgICAgbG9nIG5vb24uc3RyaW5naWZ5IGFyZ3MsIGNvbG9yczp0cnVlXG4gICAgXG4gICAgYXJncy5wYXRocyA9IFsnLiddIHVubGVzcyBhcmdzLnBhdGhzPy5sZW5ndGggPiAwXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbmNvbG9ycyA9XG4gICAgJ2NvZmZlZSc6ICAgWyBib2xkK2ZnKDQsNCwwKSwgIGZnKDEsMSwwKSwgZmcoMiwyLDApIF1cbiAgICAna29mZmVlJzogICBbIGJvbGQrZmcoNSw1LDApLCAgZmcoMSwwLDApLCBmZygzLDEsMCkgXVxuICAgICdweSc6ICAgICAgIFsgYm9sZCtmZygwLDMsMCksICBmZygwLDEsMCksIGZnKDAsMiwwKSBdXG4gICAgJ3JiJzogICAgICAgWyBib2xkK2ZnKDQsMCwwKSwgIGZnKDEsMCwwKSwgZmcoMiwwLDApIF1cbiAgICAnanNvbic6ICAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygyLDAsMSkgXVxuICAgICdjc29uJzogICAgIFsgYm9sZCtmZyg0LDAsNCksICBmZygxLDAsMSksIGZnKDIsMCwyKSBdXG4gICAgJ25vb24nOiAgICAgWyBib2xkK2ZnKDQsNCwwKSwgIGZnKDEsMSwwKSwgZmcoMiwyLDApIF1cbiAgICAncGxpc3QnOiAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygyLDAsMikgXVxuICAgICdqcyc6ICAgICAgIFsgYm9sZCtmZyg1LDAsNSksICBmZygyLDAsMiksIGZnKDMsMCwzKSBdXG4gICAgJ2NwcCc6ICAgICAgWyBib2xkK2ZnKDUsNCwwKSwgIGZ3KDMpLCAgICAgZmcoMywyLDApIF1cbiAgICAnaCc6ICAgICAgICBbICAgICAgZmcoMywxLDApLCAgZncoMyksICAgICBmZygyLDEsMCkgXVxuICAgICdweWMnOiAgICAgIFsgICAgICBmdyg1KSwgICAgICBmdygzKSwgICAgIGZ3KDQpIF1cbiAgICAnbG9nJzogICAgICBbICAgICAgZncoNSksICAgICAgZncoMiksICAgICBmdygzKSBdXG4gICAgJ2xvZyc6ICAgICAgWyAgICAgIGZ3KDUpLCAgICAgIGZ3KDIpLCAgICAgZncoMykgXVxuICAgICd0eHQnOiAgICAgIFsgICAgICBmdygyMCksICAgICBmdygzKSwgICAgIGZ3KDQpIF1cbiAgICAnbWQnOiAgICAgICBbIGJvbGQrZncoMjApLCAgICAgZncoMyksICAgICBmdyg0KSBdXG4gICAgJ21hcmtkb3duJzogWyBib2xkK2Z3KDIwKSwgICAgIGZ3KDMpLCAgICAgZncoNCkgXVxuICAgICdzaCc6ICAgICAgIFsgYm9sZCtmZyg1LDEsMCksICBmZygyLDAsMCksIGZnKDMsMCwwKSBdXG4gICAgJ3BuZyc6ICAgICAgWyBib2xkK2ZnKDUsMCwwKSwgIGZnKDIsMCwwKSwgZmcoMywwLDApIF1cbiAgICAnanBnJzogICAgICBbIGJvbGQrZmcoMCwzLDApLCAgZmcoMCwyLDApLCBmZygwLDIsMCkgXVxuICAgICdweG0nOiAgICAgIFsgYm9sZCtmZygxLDEsNSksICBmZygwLDAsMiksIGZnKDAsMCw0KSBdXG4gICAgJ3RpZmYnOiAgICAgWyBib2xkK2ZnKDEsMSw1KSwgIGZnKDAsMCwzKSwgZmcoMCwwLDQpIF1cbiAgICAndGd6JzogICAgICBbIGJvbGQrZmcoMCwzLDQpLCAgZmcoMCwxLDIpLCBmZygwLDIsMykgXVxuICAgICdwa2cnOiAgICAgIFsgYm9sZCtmZygwLDMsNCksICBmZygwLDEsMiksIGZnKDAsMiwzKSBdXG4gICAgJ3ppcCc6ICAgICAgWyBib2xkK2ZnKDAsMyw0KSwgIGZnKDAsMSwyKSwgZmcoMCwyLDMpIF1cbiAgICAnZG1nJzogICAgICBbIGJvbGQrZmcoMSw0LDQpLCAgZmcoMCwyLDIpLCBmZygwLDMsMykgXVxuICAgICd0dGYnOiAgICAgIFsgYm9sZCtmZygyLDEsMyksICBmZygxLDAsMiksIGZnKDEsMCwyKSBdXG5cbiAgICAnX2RlZmF1bHQnOiBbICAgICAgZncoMTUpLCAgICAgZncoNCksICAgICBmdygxMCkgXVxuICAgICdfZGlyJzogICAgIFsgYm9sZCtCRygwLDAsMikrZncoMjMpLCBmZygxLDEsNSksIGJvbGQrQkcoMCwwLDIpK2ZnKDIsMiw1KSBdXG4gICAgJ18uZGlyJzogICAgWyBib2xkK0JHKDAsMCwxKStmdygyMyksIGJvbGQrQkcoMCwwLDEpK2ZnKDEsMSw1KSwgYm9sZCtCRygwLDAsMSkrZmcoMiwyLDUpIF1cbiAgICAnX2xpbmsnOiAgICB7ICdhcnJvdyc6IGZnKDEsMCwxKSwgJ3BhdGgnOiBmZyg0LDAsNCksICdicm9rZW4nOiBCRyg1LDAsMCkrZmcoNSw1LDApIH1cbiAgICAnX2Fycm93JzogICAgIEJXKDIpK2Z3KDApXG4gICAgJ19oZWFkZXInOiAgWyBib2xkK0JXKDIpK2ZnKDMsMiwwKSwgIGZ3KDQpLCBib2xkK0JXKDIpK2ZnKDUsNSwwKSBdXG4gICAgJ19zaXplJzogICAgeyBiOiBbZmcoMCwwLDMpLCBmZygwLDAsMildLCBrQjogW2ZnKDAsMCw1KSwgZmcoMCwwLDMpXSwgTUI6IFtmZygxLDEsNSksIGZnKDAsMCw0KV0sIEdCOiBbZmcoNCw0LDUpLCBmZygyLDIsNSldLCBUQjogW2ZnKDQsNCw1KSwgZmcoMiwyLDUpXSB9XG4gICAgJ191c2Vycyc6ICAgeyByb290OiAgZmcoMywwLDApLCBkZWZhdWx0OiBmZygxLDAsMSkgfVxuICAgICdfZ3JvdXBzJzogIHsgd2hlZWw6IGZnKDEsMCwwKSwgc3RhZmY6IGZnKDAsMSwwKSwgYWRtaW46IGZnKDEsMSwwKSwgZGVmYXVsdDogZmcoMSwwLDEpIH1cbiAgICAnX2Vycm9yJzogICBbIGJvbGQrQkcoNSwwLDApK2ZnKDUsNSwwKSwgYm9sZCtCRyg1LDAsMCkrZmcoNSw1LDUpIF1cbiAgICAnX2lub2Rlcyc6ICBcbiAgICAgICAgICAgICAgICAnaWQnOiAgYm9sZCtCRygxLDAsMSkrZmcoNCwwLDQpIFxuICAgICAgICAgICAgICAgICdsbmsnOiBib2xkK0JHKDQsMCw0KStmZygxLDAsMSlcbiAgICAnX3JpZ2h0cyc6XG4gICAgICAgICAgICAgICAgJ3IrJzogYm9sZCtCVygxKStmdyg2KVxuICAgICAgICAgICAgICAgICdyLSc6IHJlc2V0K0JXKDEpK2Z3KDIpXG4gICAgICAgICAgICAgICAgJ3crJzogYm9sZCtCVygxKStmZygyLDIsNSlcbiAgICAgICAgICAgICAgICAndy0nOiByZXNldCtCVygxKStmdygyKVxuICAgICAgICAgICAgICAgICd4Kyc6IGJvbGQrQlcoMSkrZmcoNSwwLDApXG4gICAgICAgICAgICAgICAgJ3gtJzogcmVzZXQrQlcoMSkrZncoMilcblxudXNlck1hcCA9IHt9XG51c2VybmFtZSA9ICh1aWQpIC0+XG4gICAgaWYgbm90IHVzZXJNYXBbdWlkXVxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG4gICAgICAgICAgICB1c2VyTWFwW3VpZF0gPSBjaGlsZHAuc3Bhd25TeW5jKFwiaWRcIiwgW1wiLXVuXCIsIFwiI3t1aWR9XCJdKS5zdGRvdXQudG9TdHJpbmcoJ3V0ZjgnKS50cmltKClcbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgbG9nIGVcbiAgICB1c2VyTWFwW3VpZF1cblxuZ3JvdXBNYXAgPSBudWxsXG5ncm91cG5hbWUgPSAoZ2lkKSAtPlxuICAgIGlmIG5vdCBncm91cE1hcFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG4gICAgICAgICAgICBnaWRzID0gY2hpbGRwLnNwYXduU3luYyhcImlkXCIsIFtcIi1HXCJdKS5zdGRvdXQudG9TdHJpbmcoJ3V0ZjgnKS5zcGxpdCgnICcpXG4gICAgICAgICAgICBnbm1zID0gY2hpbGRwLnNwYXduU3luYyhcImlkXCIsIFtcIi1HblwiXSkuc3Rkb3V0LnRvU3RyaW5nKCd1dGY4Jykuc3BsaXQoJyAnKVxuICAgICAgICAgICAgZ3JvdXBNYXAgPSB7fVxuICAgICAgICAgICAgZm9yIGkgaW4gWzAuLi5naWRzLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBncm91cE1hcFtnaWRzW2ldXSA9IGdubXNbaV1cbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgbG9nIGVcbiAgICBncm91cE1hcFtnaWRdXG5cbmlmICdmdW5jdGlvbicgPT0gdHlwZW9mIHByb2Nlc3MuZ2V0dWlkXG4gICAgY29sb3JzWydfdXNlcnMnXVt1c2VybmFtZShwcm9jZXNzLmdldHVpZCgpKV0gPSBmZygwLDQsMClcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG5sb2dfZXJyb3IgPSAoKSAtPlxuICAgIFxuICAgIGxvZyBcIiBcIiArIGNvbG9yc1snX2Vycm9yJ11bMF0gKyBcIiBcIiArIGJvbGQgKyBhcmd1bWVudHNbMF0gKyAoYXJndW1lbnRzLmxlbmd0aCA+IDEgYW5kIChjb2xvcnNbJ19lcnJvciddWzFdICsgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpLnNsaWNlKDEpLmpvaW4oJyAnKSkgb3IgJycpICsgXCIgXCIgKyByZXNldFxuXG5saW5rU3RyaW5nID0gKGZpbGUpIC0+IFxuICAgIFxuICAgIHMgID0gcmVzZXQgKyBmdygxKSArIGNvbG9yc1snX2xpbmsnXVsnYXJyb3cnXSArIFwiIOKWuiBcIiBcbiAgICBzICs9IGNvbG9yc1snX2xpbmsnXVsoZmlsZSBpbiBzdGF0cy5icm9rZW5MaW5rcykgYW5kICdicm9rZW4nIG9yICdwYXRoJ10gXG4gICAgdHJ5XG4gICAgICAgIHMgKz0gc2xhc2gudGlsZGUgZnMucmVhZGxpbmtTeW5jKGZpbGUpXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIHMgKz0gJyA/ICdcbiAgICBzXG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIFxuIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG5cbm5hbWVTdHJpbmcgPSAobmFtZSwgZXh0KSAtPiBcbiAgICBcbiAgICBpZiBhcmdzLm5lcmR5ICAgICAgICBcbiAgICAgICAgaWNvbnMgPSByZXF1aXJlICcuL2ljb25zJ1xuICAgICAgICBpY29uID0gKGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVsyXSArIChpY29ucy5nZXQobmFtZSwgZXh0KSA/ICcgJykpICsgJyAnXG4gICAgZWxzZVxuICAgICAgICBpY29uID0gJydcbiAgICBcIiBcIiArIGljb24gKyBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMF0gKyBuYW1lICsgcmVzZXRcbiAgICBcbmRvdFN0cmluZyAgPSAoZXh0KSAtPiBcbiAgICBcbiAgICBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMV0gKyBcIi5cIiArIHJlc2V0XG4gICAgXG5leHRTdHJpbmcgID0gKG5hbWUsIGV4dCkgLT4gXG4gICAgXG4gICAgaWYgYXJncy5uZXJkeSBhbmQgbmFtZSBcbiAgICAgICAgaWNvbnMgPSByZXF1aXJlICcuL2ljb25zJ1xuICAgICAgICBpZiBpY29ucy5nZXQobmFtZSwgZXh0KSB0aGVuIHJldHVybiAnJ1xuICAgIGRvdFN0cmluZyhleHQpICsgY29sb3JzW2NvbG9yc1tleHRdPyBhbmQgZXh0IG9yICdfZGVmYXVsdCddWzFdICsgZXh0ICsgcmVzZXRcbiAgICBcbmRpclN0cmluZyAgPSAobmFtZSwgZXh0KSAtPlxuICAgIFxuICAgIGMgPSBuYW1lIGFuZCAnX2Rpcicgb3IgJ18uZGlyJ1xuICAgIGljb24gPSBhcmdzLm5lcmR5IGFuZCBjb2xvcnNbY11bMl0gKyAnIFxcdWY0MTMnIG9yICcnXG4gICAgaWNvbiArIGNvbG9yc1tjXVswXSArIChuYW1lIGFuZCAoXCIgXCIgKyBuYW1lKSBvciBcIiBcIikgKyAoaWYgZXh0IHRoZW4gY29sb3JzW2NdWzFdICsgJy4nICsgY29sb3JzW2NdWzJdICsgZXh0IGVsc2UgXCJcIikgKyBcIiBcIlxuXG4jICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5zaXplU3RyaW5nID0gKHN0YXQpIC0+XG5cbiAgICBpZiBhcmdzLm5lcmR5IGFuZCBhcmdzLnByZXR0eVxuXG4gICAgICAgIGJhciA9IChuKSAtPlxuICAgICAgICAgICAgYiA9ICfilo/ilo7ilo3iloziloviloriloknXG4gICAgICAgICAgICBiW01hdGguZmxvb3Igbi8oMTAwMC83KV0gIFxuICAgICAgICBcbiAgICAgICAgaWYgc3RhdC5zaXplID09IDBcbiAgICAgICAgICAgIHJldHVybiBycGFkICcnLCA4XG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwXG4gICAgICAgICAgICByZXR1cm4gY29sb3JzWydfc2l6ZSddWydiJ11bMV0gKyBycGFkIGJhcihzdGF0LnNpemUpLCA4XG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGZnKDAsMCwyKSArICfilognICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwKSwgN1xuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMDAwXG4gICAgICAgICAgICByZXR1cm4gZmcoMCwwLDIpICsgJ+KWiOKWiCcgKyBycGFkIGJhcihzdGF0LnNpemUvMTAwKSwgNlxuICAgICAgICBpZiBzdGF0LnNpemUgPD0gMTAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGZnKDAsMCwzKSArICfilojilojilognICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMDApLCA1XG4gICAgICAgICAgICBcbiAgICAgICAgbWIgPSBwYXJzZUludCBzdGF0LnNpemUgLyAxMDAwMDAwXG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGZnKDAsMCwyKSArICfilojilojilognICsgZmcoMCwwLDMpICsgJ+KWiCcgICArIGZnKDAsMCwzKSArIHJwYWQgYmFyKHN0YXQuc2l6ZS8xMDAwMCksIDRcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGZnKDAsMCwyKSArICfilojilojilognICsgZmcoMCwwLDMpICsgJ+KWiOKWiCcgICsgZmcoMCwwLDMpICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMDAwMCksIDNcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDAwMDAwMDBcbiAgICAgICAgICAgIHJldHVybiBmZygwLDAsMikgKyAn4paI4paI4paIJyArIGZnKDAsMCwzKSArICfilojilojilognICsgZmcoMCwwLDQpICsgcnBhZCBiYXIoc3RhdC5zaXplLzEwMDAwMDApLCAyXG4gICAgICAgIGdiID0gcGFyc2VJbnQgbWIgLyAxMDAwXG4gICAgICAgIGlmIHN0YXQuc2l6ZSA8PSAxMDAwMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGZnKDAsMCwyKSArICfilojilojilognICsgZmcoMCwwLDMpICsgJ+KWiOKWiOKWiCcgKyBmZygwLDAsNCkgKyAn4paIJyArIGZnKDAsMCw0KSArIHJwYWQgYmFyKHN0YXQuc2l6ZS8xMDAwMDAwMCksIDFcbiAgICAgICAgaWYgc3RhdC5zaXplIDw9IDEwMDAwMDAwMDAwMFxuICAgICAgICAgICAgcmV0dXJuIGZnKDAsMCwyKSArICfilojilojilognICsgZmcoMCwwLDMpICsgJ+KWiOKWiOKWiCcgKyBmZygwLDAsNCkgKyAn4paI4paIJyArIGZnKDAsMCw0KSArIGJhcihzdGF0LnNpemUvMTAwMDAwMDAwKVxuICAgICAgICBcbiAgICBpZiBhcmdzLnByZXR0eSBhbmQgc3RhdC5zaXplID09IDBcbiAgICAgICAgcmV0dXJuIGxwYWQoJyAnLCAxMSlcbiAgICBpZiBzdGF0LnNpemUgPCAxMDAwXG4gICAgICAgIGNvbG9yc1snX3NpemUnXVsnYiddWzBdICsgbHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZSBpZiBzdGF0LnNpemUgPCAxMDAwMDAwXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ2tCJ11bMF0gKyBscGFkKChzdGF0LnNpemUgLyAxMDAwKS50b0ZpeGVkKDApLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydrQiddWzFdICsgXCJrQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ2tCJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlIGlmIHN0YXQuc2l6ZSA8IDEwMDAwMDAwMDBcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnTUInXVswXSArIGxwYWQoKHN0YXQuc2l6ZSAvIDEwMDAwMDApLnRvRml4ZWQoMSksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ01CJ11bMV0gKyBcIk1CIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnTUInXVswXSArIGxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2UgaWYgc3RhdC5zaXplIDwgMTAwMDAwMDAwMDAwMFxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydHQiddWzBdICsgbHBhZCgoc3RhdC5zaXplIC8gMTAwMDAwMDAwMCkudG9GaXhlZCgxKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsnR0InXVsxXSArIFwiR0IgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydHQiddWzBdICsgbHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZVxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydUQiddWzBdICsgbHBhZCgoc3RhdC5zaXplIC8gMTAwMDAwMDAwMDAwMCkudG9GaXhlZCgzKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsnVEInXVsxXSArIFwiVEIgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydUQiddWzBdICsgbHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG5cbiMgMDAwMDAwMDAwICAwMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICBcbiMgICAgMDAwICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG5cbnRpbWVTdHJpbmcgPSAoc3RhdCkgLT5cbiAgICBcbiAgICBpZiBhcmdzLm5lcmR5IGFuZCBhcmdzLnByZXR0eVxuICAgICAgICBzZWMgPSBwYXJzZUludCAoRGF0ZS5ub3coKS1zdGF0Lm10aW1lTXMpLzEwMDBcbiAgICAgICAgbW4gID0gcGFyc2VJbnQgc2VjLzYwXG4gICAgICAgIGhyICA9IHBhcnNlSW50IHNlYy8zNjAwXG4gICAgICAgIGlmIGhyIDwgMTJcbiAgICAgICAgICAgIGlmIHNlYyA8IDYwXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArICcgICAnICsgZmcoNSw1LDUpICsgJ+KXi+KXlOKXkeKXlSdbcGFyc2VJbnQgc2VjLzE1XSArICcgJyBcbiAgICAgICAgICAgIGVsc2UgaWYgbW4gPCA2MFxuICAgICAgICAgICAgICAgIHJldHVybiBCRygwLDAsMSkgKyAnICAnICsgZmcoMywzLDUpICsgJ+KXi+KXlOKXkeKXlSdbcGFyc2VJbnQgbW4vMTVdICsgZmcoMCwwLDMpICsgJ+KXjCAnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArICcgJyArIGZnKDIsMiw1KSArICfil4vil5Til5Hil5UnW3BhcnNlSW50IGhyLzNdICsgZmcoMCwwLDMpICsgJ+KXjOKXjCAnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGR5ID0gcGFyc2VJbnQgTWF0aC5yb3VuZCBzZWMvKDI0KjM2MDApXG4gICAgICAgICAgICB3ayA9IHBhcnNlSW50IE1hdGgucm91bmQgc2VjLyg3KjI0KjM2MDApXG4gICAgICAgICAgICBtdCA9IHBhcnNlSW50IE1hdGgucm91bmQgc2VjLygzMCoyNCozNjAwKVxuICAgICAgICAgICAgeXIgPSBwYXJzZUludCBNYXRoLnJvdW5kIHNlYy8oMzY1KjI0KjM2MDApXG4gICAgICAgICAgICBpZiBkeSA8IDEwXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArIGZnKDAsMCw1KSArIFwiICN7ZHl9IFxcdWYxODUgXCJcbiAgICAgICAgICAgIGVsc2UgaWYgd2sgPCA1XG4gICAgICAgICAgICAgICAgcmV0dXJuIEJHKDAsMCwxKSArIGZnKDAsMCw0KSArIFwiICN7d2t9IFxcdWYxODYgXCJcbiAgICAgICAgICAgIGVsc2UgaWYgbXQgPCAxMFxuICAgICAgICAgICAgICAgIHJldHVybiBCRygwLDAsMSkgKyBmZygwLDAsMykgKyBcIiAje210fSBcXHVmNDU1IFwiXG4gICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgIHJldHVybiBCRygwLDAsMSkgKyBmZygwLDAsMykgKyBcIiAje3JwYWQgeXIsIDJ9XFx1ZjZlNiBcIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICBtb21lbnQgPSByZXF1aXJlICdtb21lbnQnXG4gICAgdCA9IG1vbWVudCBzdGF0Lm10aW1lXG4gICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgYWdlID0gbW9tZW50KCkudG8odCwgdHJ1ZSlcbiAgICAgICAgW251bSwgcmFuZ2VdID0gYWdlLnNwbGl0ICcgJ1xuICAgICAgICBudW0gPSAnMScgaWYgbnVtWzBdID09ICdhJ1xuICAgICAgICBpZiByYW5nZSA9PSAnZmV3J1xuICAgICAgICAgICAgbnVtID0gbW9tZW50KCkuZGlmZiB0LCAnc2Vjb25kcydcbiAgICAgICAgICAgIHJhbmdlID0gJ3NlY29uZHMnXG4gICAgICAgICAgICBmdygyMykgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdygxNikgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ3llYXInXG4gICAgICAgICAgICBmdyg2KSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDMpICsgcnBhZChyYW5nZSwgNykgKyAnICdcbiAgICAgICAgZWxzZSBpZiByYW5nZS5zdGFydHNXaXRoICdtb250aCdcbiAgICAgICAgICAgIGZ3KDgpICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoNCkgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ2RheSdcbiAgICAgICAgICAgIGZ3KDEwKSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDYpICsgcnBhZChyYW5nZSwgNykgKyAnICdcbiAgICAgICAgZWxzZSBpZiByYW5nZS5zdGFydHNXaXRoICdob3VyJ1xuICAgICAgICAgICAgZncoMTUpICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoOCkgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmdygxOCkgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdygxMikgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgIGVsc2VcbiAgICAgICAgZncoMTYpICsgbHBhZCh0LmZvcm1hdChcIkREXCIpLDIpICsgZncoNykrJy4nICtcbiAgICAgICAgZncoMTIpICsgdC5mb3JtYXQoXCJNTVwiKSArIGZ3KDcpK1wiLlwiICtcbiAgICAgICAgZncoIDgpICsgdC5mb3JtYXQoXCJZWVwiKSArICcgJyArXG4gICAgICAgIGZ3KDE2KSArIHQuZm9ybWF0KFwiSEhcIikgKyBjb2wgPSBmdyg3KSsnOicgK1xuICAgICAgICBmdygxNCkgKyB0LmZvcm1hdChcIm1tXCIpICsgY29sID0gZncoMSkrJzonICtcbiAgICAgICAgZncoIDQpICsgdC5mb3JtYXQoXCJzc1wiKSArICcgJ1xuXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcblxub3duZXJOYW1lID0gKHN0YXQpIC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIHVzZXJuYW1lIHN0YXQudWlkXG4gICAgY2F0Y2hcbiAgICAgICAgc3RhdC51aWRcblxuZ3JvdXBOYW1lID0gKHN0YXQpIC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIGdyb3VwbmFtZSBzdGF0LmdpZFxuICAgIGNhdGNoXG4gICAgICAgIHN0YXQuZ2lkXG5cbm93bmVyU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgb3duID0gb3duZXJOYW1lKHN0YXQpXG4gICAgZ3JwID0gZ3JvdXBOYW1lKHN0YXQpXG4gICAgb2NsID0gY29sb3JzWydfdXNlcnMnXVtvd25dXG4gICAgb2NsID0gY29sb3JzWydfdXNlcnMnXVsnZGVmYXVsdCddIHVubGVzcyBvY2xcbiAgICBnY2wgPSBjb2xvcnNbJ19ncm91cHMnXVtncnBdXG4gICAgZ2NsID0gY29sb3JzWydfZ3JvdXBzJ11bJ2RlZmF1bHQnXSB1bmxlc3MgZ2NsXG4gICAgb2NsICsgcnBhZChvd24sIHN0YXRzLm1heE93bmVyTGVuZ3RoKSArIFwiIFwiICsgZ2NsICsgcnBhZChncnAsIHN0YXRzLm1heEdyb3VwTGVuZ3RoKVxuXG4jIDAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG5cbnJ3eFN0cmluZyA9IChzdGF0LCBpKSAtPlxuICAgIFxuICAgIG1vZGUgPSBzdGF0Lm1vZGVcbiAgICBcbiAgICBpZiBhcmdzLm5lcmR5XG4gICAgICAgIHIgPSAnIFxcdWY0NDEnXG4gICAgICAgIHcgPSAnXFx1ZjA0MCdcbiAgICAgICAgeCA9IHN0YXQuaXNEaXJlY3RvcnkoKSBhbmQgJ1xcdWYwODUnIG9yICdcXHVmMDEzJ1xuICAgICAgICBcbiAgICAgICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjEwMCkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWydyKyddICsgciBvciBjb2xvcnNbJ19yaWdodHMnXVsnci0nXSArIHIpICtcbiAgICAgICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjAxMCkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWyd3KyddICsgdyBvciBjb2xvcnNbJ19yaWdodHMnXVsndy0nXSArIHcpICtcbiAgICAgICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjAwMSkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWyd4KyddICsgeCBvciBjb2xvcnNbJ19yaWdodHMnXVsneC0nXSArIHgpXG4gICAgZWxzZVxuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMTAwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3IrJ10gKyAnIHInIG9yIGNvbG9yc1snX3JpZ2h0cyddWydyLSddICsgJyAgJykgK1xuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDEwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3crJ10gKyAnIHcnIG9yIGNvbG9yc1snX3JpZ2h0cyddWyd3LSddICsgJyAgJykgK1xuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDAxKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3grJ10gKyAnIHgnIG9yIGNvbG9yc1snX3JpZ2h0cyddWyd4LSddICsgJyAgJylcblxucmlnaHRzU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgdXIgPSByd3hTdHJpbmcoc3RhdCwgMilcbiAgICBnciA9IHJ3eFN0cmluZyhzdGF0LCAxKVxuICAgIHJvID0gcnd4U3RyaW5nKHN0YXQsIDApICsgXCIgXCJcbiAgICB1ciArIGdyICsgcm8gKyByZXNldFxuXG5pbm9kZVN0cmluZyA9IChzdGF0KSAtPlxuICAgIFxuICAgIGlmIHN0YXQubmxpbmsgPiAxXG4gICAgICAgIGxuayA9IGNvbG9yc1snX2lub2RlcyddWydsbmsnXSArIGxwYWQoc3RhdC5ubGluaywgMykgKyAnICcgKyByZXNldFxuICAgIGVsc2UgXG4gICAgICAgIGxuayA9IHJlc2V0ICsgJyAgICAnXG4gICAgY29sb3JzWydfaW5vZGVzJ11bJ2lkJ10gKyBscGFkKHN0YXQuaW5vLCA4KSArICcgJyArIGxua1xuICAgIFxuZ2V0UHJlZml4ID0gKHN0YXQsIGRlcHRoKSAtPlxuICAgIFxuICAgIHMgPSAnJ1xuICAgIFxuICAgIGlmIGFyZ3MuaW5vZGVJbmZvc1xuICAgICAgICBzICs9IGlub2RlU3RyaW5nIHN0YXRcbiAgICAgICAgcyArPSBcIiBcIlxuICAgIGlmIGFyZ3MucmlnaHRzXG4gICAgICAgIHMgKz0gcmlnaHRzU3RyaW5nIHN0YXRcbiAgICAgICAgcyArPSBcIiBcIlxuICAgIGlmIGFyZ3Mub3duZXJcbiAgICAgICAgcyArPSBvd25lclN0cmluZyBzdGF0XG4gICAgICAgIHMgKz0gXCIgXCJcbiAgICBpZiBhcmdzLm1kYXRlXG4gICAgICAgIHMgKz0gdGltZVN0cmluZyBzdGF0XG4gICAgICAgIHMgKz0gcmVzZXRcbiAgICBpZiBhcmdzLmJ5dGVzXG4gICAgICAgIHMgKz0gc2l6ZVN0cmluZyBzdGF0XG4gICAgICAgIFxuICAgIGlmIGRlcHRoIGFuZCBhcmdzLnRyZWVcbiAgICAgICAgcyArPSBycGFkICcnLCBkZXB0aCo0XG4gICAgICAgIFxuICAgIGlmIHMubGVuZ3RoID09IDAgYW5kIGFyZ3Mub2Zmc2V0XG4gICAgICAgIHMgKz0gJyAgICAgICAnXG4gICAgc1xuICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMFxuXG5zb3J0ID0gKGxpc3QsIHN0YXRzLCBleHRzPVtdKSAtPlxuICAgIFxuICAgIHppcCAgICA9IHJlcXVpcmUgJ2xvZGFzaC56aXAnXG4gICAgdW56aXAgID0gcmVxdWlyZSAnbG9kYXNoLnVuemlwJ1xuICAgIG1vbWVudCA9IHJlcXVpcmUgJ21vbWVudCdcbiAgICBcbiAgICBsID0gemlwIGxpc3QsIHN0YXRzLCBbMC4uLmxpc3QubGVuZ3RoXSwgKGV4dHMubGVuZ3RoID4gMCBhbmQgZXh0cyBvciBbMC4uLmxpc3QubGVuZ3RoXSlcbiAgICBcbiAgICBpZiBhcmdzLmtpbmRcbiAgICAgICAgaWYgZXh0cyA9PSBbXSB0aGVuIHJldHVybiBsaXN0XG4gICAgICAgIGwuc29ydCgoYSxiKSAtPlxuICAgICAgICAgICAgaWYgYVszXSA+IGJbM10gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgaWYgYVszXSA8IGJbM10gdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3MudGltZVxuICAgICAgICAgICAgICAgIG0gPSBtb21lbnQoYVsxXS5tdGltZSlcbiAgICAgICAgICAgICAgICBpZiBtLmlzQWZ0ZXIoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgICAgIGlmIG0uaXNCZWZvcmUoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3Muc2l6ZVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA+IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICBlbHNlIGlmIGFyZ3MudGltZVxuICAgICAgICBsLnNvcnQoKGEsYikgLT5cbiAgICAgICAgICAgIG0gPSBtb21lbnQoYVsxXS5tdGltZSlcbiAgICAgICAgICAgIGlmIG0uaXNBZnRlcihiWzFdLm10aW1lKSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICBpZiBtLmlzQmVmb3JlKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhcmdzLnNpemVcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPiBiWzFdLnNpemUgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA8IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYVsyXSA+IGJbMl0gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgLTEpXG4gICAgZWxzZSBpZiBhcmdzLnNpemVcbiAgICAgICAgbC5zb3J0KChhLGIpIC0+XG4gICAgICAgICAgICBpZiBhWzFdLnNpemUgPiBiWzFdLnNpemUgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICB1bnppcChsKVswXVxuXG4jIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgXG4jIDAwMCAgMDAwICAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgMDAwICAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG5cbmlnbm9yZSA9IChwKSAtPlxuICAgIFxuICAgIGJhc2UgPSBzbGFzaC5iYXNlbmFtZSBwXG4gICAgcmV0dXJuIHRydWUgaWYgYmFzZVswXSA9PSAnJCdcbiAgICByZXR1cm4gdHJ1ZSBpZiBiYXNlID09ICdkZXNrdG9wLmluaScgICAgXG4gICAgcmV0dXJuIHRydWUgaWYgYmFzZS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGggJ250dXNlcidcbiAgICBmYWxzZVxuICAgIFxuIyAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMFxuIyAwMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDBcblxuZXhlYyA9IFtdICMgcGF0aHMgdG8gZXhlY3V0ZSBvblxuXG5saXN0RmlsZXMgPSAocCwgZGlyZW50cywgZGVwdGgpIC0+XG4gICAgXG4gICAgYWxwaCA9IFtdIGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgZGlycyA9IFtdICMgdmlzaWJsZSBkaXJzXG4gICAgZmlscyA9IFtdICMgdmlzaWJsZSBmaWxlc1xuICAgIGRzdHMgPSBbXSAjIGRpciBzdGF0c1xuICAgIGZzdHMgPSBbXSAjIGZpbGUgc3RhdHNcbiAgICBleHRzID0gW10gIyBmaWxlIGV4dGVuc2lvbnNcblxuICAgIGlmIGFyZ3Mub3duZXJcbiAgICAgICAgXG4gICAgICAgIGRpcmVudHMuZm9yRWFjaCAoZGUpIC0+XG4gICAgICAgICAgICBycCA9IGRlLm5hbWVcbiAgICAgICAgICAgIGlmIHNsYXNoLmlzQWJzb2x1dGUgcnBcbiAgICAgICAgICAgICAgICBmaWxlID0gc2xhc2gucmVzb2x2ZSBycFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZpbGUgID0gc2xhc2guam9pbiBwLCBycFxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgc3RhdCA9IGZzLmxzdGF0U3luYyhmaWxlKVxuICAgICAgICAgICAgICAgIG9sID0gb3duZXJOYW1lKHN0YXQpLmxlbmd0aFxuICAgICAgICAgICAgICAgIGdsID0gZ3JvdXBOYW1lKHN0YXQpLmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIG9sID4gc3RhdHMubWF4T3duZXJMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubWF4T3duZXJMZW5ndGggPSBvbFxuICAgICAgICAgICAgICAgIGlmIGdsID4gc3RhdHMubWF4R3JvdXBMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubWF4R3JvdXBMZW5ndGggPSBnbFxuICAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuICAgIGRpcmVudHMuZm9yRWFjaCAoZGUpIC0+XG4gICAgICAgIFxuICAgICAgICBycCA9IGRlLm5hbWVcbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLmlzQWJzb2x1dGUgcnBcbiAgICAgICAgICAgIGZpbGUgID0gc2xhc2gucmVzb2x2ZSBycFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmaWxlICA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBwLCBycFxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBpZ25vcmUgcnBcbiAgICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgbHN0YXQgPSBmcy5sc3RhdFN5bmMgZmlsZVxuICAgICAgICAgICAgbGluayAgPSBsc3RhdC5pc1N5bWJvbGljTGluaygpXG4gICAgICAgICAgICBpZiBsaW5rIGFuZCBvcy5wbGF0Zm9ybSgpID09ICd3aW4zMidcbiAgICAgICAgICAgICAgICBpZiBzbGFzaC50aWxkZShmaWxlKVswXSA9PSAnfidcbiAgICAgICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSBzbGFzaC50aWxkZSBmcy5yZWFkbGlua1N5bmMgZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlmIHRhcmdldC5zdGFydHNXaXRoICd+L0FwcERhdGEnXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWYgdGFyZ2V0IGluIFsnfi9Eb2N1bWVudHMnXVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHN0YXQgPSBsaW5rIGFuZCBmcy5zdGF0U3luYyhmaWxlKSBvciBsc3RhdFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICBzdGF0ID0gbHN0YXRcbiAgICAgICAgICAgICAgICBzdGF0cy5icm9rZW5MaW5rcy5wdXNoIGZpbGVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjIGxvZ19lcnJvciBcImNhbid0IHJlYWQgZmlsZTogXCIsIGZpbGUsIGxpbmtcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBleHQgID0gc2xhc2guZXh0IGZpbGVcbiAgICAgICAgbmFtZSA9IHNsYXNoLmJhc2UgZmlsZVxuICAgICAgICBcbiAgICAgICAgaWYgbmFtZVswXSA9PSAnLidcbiAgICAgICAgICAgIGV4dCA9IG5hbWUuc3Vic3RyKDEpICsgc2xhc2guZXh0bmFtZSBmaWxlXG4gICAgICAgICAgICBuYW1lID0gJydcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBuYW1lLmxlbmd0aCBhbmQgbmFtZVtuYW1lLmxlbmd0aC0xXSAhPSAnXFxyJyBvciBhcmdzLmFsbFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzID0gZ2V0UHJlZml4IHN0YXQsIGRlcHRoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICBpZiBub3QgYXJncy5maWxlc1xuICAgICAgICAgICAgICAgICAgICBpZiBub3QgYXJncy50cmVlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBuYW1lLnN0YXJ0c1dpdGggJy4vJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lWzIuLl1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBkaXJTdHJpbmcgbmFtZSwgZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBsaW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBsaW5rU3RyaW5nIGZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcnMucHVzaCBzK3Jlc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICBhbHBoLnB1c2ggcytyZXNldCBpZiBhcmdzLmFscGhhYmV0aWNhbFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhlYy5wdXNoIGZpbGUgaWYgYXJncy5leGVjdXRlXG4gICAgICAgICAgICAgICAgICAgIGRzdHMucHVzaCBzdGF0XG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm51bV9kaXJzICs9IDFcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9kaXJzICs9IDFcbiAgICAgICAgICAgIGVsc2UgIyBpZiBwYXRoIGlzIGZpbGVcbiAgICAgICAgICAgICAgICBpZiBub3QgYXJncy5kaXJzXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gbmFtZVN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGV4dFN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgbGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBsaW5rU3RyaW5nIGZpbGVcbiAgICAgICAgICAgICAgICAgICAgZmlscy5wdXNoIHMrcmVzZXRcbiAgICAgICAgICAgICAgICAgICAgYWxwaC5wdXNoIHMrcmVzZXQgaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICAgICAgICAgICAgICAgICAgZnN0cy5wdXNoIHN0YXRcbiAgICAgICAgICAgICAgICAgICAgZXh0cy5wdXNoIGV4dFxuICAgICAgICAgICAgICAgICAgICBleGVjLnB1c2ggZmlsZSBpZiBhcmdzLmV4ZWN1dGVcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubnVtX2ZpbGVzICs9IDFcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9maWxlcyArPSAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHN0YXQuaXNGaWxlKClcbiAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZmlsZXMgKz0gMVxuICAgICAgICAgICAgZWxzZSBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZGlycyArPSAxXG5cbiAgICBpZiBhcmdzLnNpemUgb3IgYXJncy5raW5kIG9yIGFyZ3MudGltZVxuICAgICAgICBpZiBkaXJzLmxlbmd0aCBhbmQgbm90IGFyZ3MuZmlsZXNcbiAgICAgICAgICAgIGRpcnMgPSBzb3J0IGRpcnMsIGRzdHNcbiAgICAgICAgaWYgZmlscy5sZW5ndGhcbiAgICAgICAgICAgIGZpbHMgPSBzb3J0IGZpbHMsIGZzdHMsIGV4dHNcblxuICAgIGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgIGxvZyBwIGZvciBwIGluIGFscGhcbiAgICBlbHNlXG4gICAgICAgIGxvZyBkIGZvciBkIGluIGRpcnNcbiAgICAgICAgbG9nIGYgZm9yIGYgaW4gZmlsc1xuICAgICAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMFxuXG5saXN0RGlyID0gKGRlLCBvcHQ9e30pIC0+XG4gICAgICAgICAgICBcbiAgICBwID0gZGUubmFtZVxuXG4gICAgaWYgc2xhc2guaXNSZWxhdGl2ZShwKSBhbmQgb3B0LnBhcmVudFxuICAgICAgICBwID0gc2xhc2guam9pbiBvcHQucGFyZW50LCBwXG5cbiAgICBpZiBhcmdzLnJlY3Vyc2VcbiAgICAgICAgZGVwdGggPSBwYXRoRGVwdGggcCwgb3B0XG4gICAgICAgIHJldHVybiBpZiBkZXB0aCA+IGFyZ3MuZGVwdGhcbiAgICBcbiAgICBwcyA9IHBcblxuICAgIHRyeVxuICAgICAgICBhbGxkaXJlbnRzID0gZnMucmVhZGRpclN5bmMgcCwgd2l0aEZpbGVUeXBlczp0cnVlXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIHRydWVcblxuICAgIGlmIGFyZ3MuZmluZFxuICAgICAgICBkaXJlbnRzID0gZmlsdGVyIGFsbGRpcmVudHMsIChkZSkgLT4gUmVnRXhwKGFyZ3MuZmluZCkudGVzdCBkZS5uYW1lXG4gICAgZWxzZVxuICAgICAgICBkaXJlbnRzID0gYWxsZGlyZW50c1xuICAgICAgICAgICAgXG4gICAgaWYgYXJncy5maW5kIGFuZCBub3QgZGlyZW50cz8ubGVuZ3RoXG4gICAgICAgIHRydWVcbiAgICBlbHNlIGlmIGFyZ3MucGF0aHMubGVuZ3RoID09IDEgYW5kIGFyZ3MucGF0aHNbMF0gPT0gJy4nIGFuZCBub3QgYXJncy5yZWN1cnNlXG4gICAgICAgIGxvZyByZXNldFxuICAgIGVsc2UgaWYgYXJncy50cmVlXG4gICAgICAgIGxvZyBnZXRQcmVmaXgoZnMubHN0YXRTeW5jKHBzKSwgZGVwdGgtMSkgKyBkaXJTdHJpbmcoc2xhc2guYmFzZShwcyksIHNsYXNoLmV4dChwcykpICsgcmVzZXRcbiAgICBlbHNlXG4gICAgICAgIHMgPSBjb2xvcnNbJ19hcnJvdyddICsgXCIg4pa2IFwiICsgY29sb3JzWydfaGVhZGVyJ11bMF1cbiAgICAgICAgcHMgPSBzbGFzaC50aWxkZSBzbGFzaC5yZXNvbHZlIHBcbiAgICAgICAgcnMgPSBzbGFzaC5yZWxhdGl2ZSBwcywgcHJvY2Vzcy5jd2QoKVxuICAgICAgICBpZiBycy5sZW5ndGggPCBwcy5sZW5ndGhcbiAgICAgICAgICAgIHBzID0gcnNcblxuICAgICAgICBpZiBwcyA9PSAnLydcbiAgICAgICAgICAgIHMgKz0gJy8nXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNwID0gcHMuc3BsaXQoJy8nKVxuICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVswXSArIHNwLnNoaWZ0KClcbiAgICAgICAgICAgIHdoaWxlIHNwLmxlbmd0aFxuICAgICAgICAgICAgICAgIHBuID0gc3Auc2hpZnQoKVxuICAgICAgICAgICAgICAgIGlmIHBuXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gY29sb3JzWydfaGVhZGVyJ11bMV0gKyAnLydcbiAgICAgICAgICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVtzcC5sZW5ndGggPT0gMCBhbmQgMiBvciAwXSArIHBuXG4gICAgICAgIGxvZyByZXNldFxuICAgICAgICBsb2cgcyArIFwiIFwiICsgcmVzZXRcbiAgICAgICAgbG9nIHJlc2V0XG5cbiAgICBpZiBkaXJlbnRzPy5sZW5ndGhcbiAgICAgICAgbGlzdEZpbGVzIHAsIGRpcmVudHMsIGRlcHRoXG5cbiAgICBpZiBhcmdzLnJlY3Vyc2VcbiAgICAgICAgXG4gICAgICAgIGRvUmVjdXJzZSA9IChkZSkgLT5cbiAgICAgICAgICAgIGYgPSBkZS5uYW1lXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgc2xhc2guYmFzZW5hbWUoZikgaW4gYXJncy5pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBub3QgYXJncy5hbGwgYW5kIHNsYXNoLmV4dChmKSA9PSAnYXBwJ1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIG5vdCBhcmdzLmFsbCBhbmQgZlswXSA9PSAnLidcbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBub3QgYXJncy5mb2xsb3dTeW1MaW5rcyBhbmQgZGUuaXNTeW1ib2xpY0xpbmsoKVxuICAgICAgICAgICAgZGUuaXNEaXJlY3RvcnkoKSBvciBkZS5pc1N5bWJvbGljTGluaygpIGFuZCBmcy5zdGF0U3luYyhzbGFzaC5qb2luIHAsIGYpLmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGZvciBkZSBpbiBmaWx0ZXIgYWxsZGlyZW50cywgZG9SZWN1cnNlXG4gICAgICAgICAgICAgICAgbGlzdERpciBkZSwgcGFyZW50OnAsIHJlbGF0aXZlVG86b3B0LnJlbGF0aXZlVG9cbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBtc2cgPSBlcnIubWVzc2FnZVxuICAgICAgICAgICAgbXNnID0gXCJwZXJtaXNzaW9uIGRlbmllZFwiIGlmIG1zZy5zdGFydHNXaXRoIFwiRUFDQ0VTXCJcbiAgICAgICAgICAgIG1zZyA9IFwicGVybWlzc2lvbiBkZW5pZWRcIiBpZiBtc2cuc3RhcnRzV2l0aCBcIkVQRVJNXCJcbiAgICAgICAgICAgIGxvZ19lcnJvciBtc2dcbiAgICAgICAgICAgIFxucGF0aERlcHRoID0gKHAsIG9wdCkgLT5cbiAgICBcbiAgICByZWwgPSBzbGFzaC5yZWxhdGl2ZSBwLCBvcHQ/LnJlbGF0aXZlVG8gPyBwcm9jZXNzLmN3ZCgpXG4gICAgcmV0dXJuIDAgaWYgcCA9PSAnLidcbiAgICByZWwuc3BsaXQoJy8nKS5sZW5ndGhcblxubWFrZUNvbW1hbmQgPSAocCkgLT5cbiAgICBcbiAgICAjIGxvZyBhcmdzLmV4ZWN1dGUucmVwbGFjZSAvXFwjXFx3Ky9nLCAocykgLT4gXCIoI3tzfToje3NsYXNoW3NbMS4uLTFdXSBwfSlcIlxuICAgIGFyZ3MuZXhlY3V0ZS5yZXBsYWNlIC9cXCNcXHcrL2csIChzKSAtPiBcIiN7c2xhc2hbc1sxLi4tMV1dIHB9XCJcbiAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuXG5tYWluID0gLT5cbiAgICAgICAgICAgIFxuICAgIHBhdGhzdGF0cyA9IGFyZ3MucGF0aHMubWFwIChmKSAtPlxuICAgICAgICBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBbZiwgZnMuc3RhdFN5bmMoZildXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgICBsb2dfZXJyb3IgJ25vIHN1Y2ggZmlsZTogJyBmXG4gICAgICAgICAgICBbXVxuICAgIFxuICAgIHBhdGhzdGF0cyA9IHBhdGhzdGF0cy5maWx0ZXIgKGYpIC0+IGYubGVuZ3RoXG4gICAgXG4gICAgaWYgbm90IHBhdGhzdGF0cy5sZW5ndGggdGhlbiBwcm9jZXNzLmV4aXQoMSlcbiAgICBcbiAgICBmaWxlc3RhdHMgPSBwYXRoc3RhdHMuZmlsdGVyIChmKSAtPiBub3QgZlsxXS5pc0RpcmVjdG9yeSgpXG4gICAgXG4gICAgaWYgZmlsZXN0YXRzLmxlbmd0aCA+IDBcbiAgICAgICAgbG9nIHJlc2V0XG4gICAgICAgIGxpc3RGaWxlcyBwcm9jZXNzLmN3ZCgpLCBmaWxlc3RhdHMubWFwKCAocykgLT4gc1sxXS5uYW1lID89IHNbMF07IHNbMV0gKVxuICAgIFxuICAgIGRpcnN0YXRzID0gcGF0aHN0YXRzLmZpbHRlciAoZikgLT4gZlsxXT8uaXNEaXJlY3RvcnkoKVxuICAgICAgICBcbiAgICBmb3IgcCBpbiBkaXJzdGF0c1xuICAgICAgICBsb2cgJycgaWYgYXJncy50cmVlXG4gICAgICAgIGZpbGUgPSBzbGFzaC5maWxlIHBbMF1cbiAgICAgICAgcGFyZW50ID0gaWYgc2xhc2guaXNSZWxhdGl2ZShwWzBdKSB0aGVuIHByb2Nlc3MuY3dkKCkgZWxzZSBzbGFzaC5kaXIgcFswXVxuICAgICAgICBwWzFdLm5hbWUgPz0gZmlsZVxuICAgICAgICBsaXN0RGlyIHBbMV0sIHBhcmVudDpwYXJlbnQsIHJlbGF0aXZlVG86cGFyZW50XG4gICAgXG4gICAgaWYgYXJncy5leGVjdXRlIGFuZCBleGVjXG4gICAgICAgIG5vb24gPSByZXF1aXJlICdub29uJ1xuICAgICAgICBjb21tYW5kcyA9ICggbWFrZUNvbW1hbmQgZXggZm9yIGV4IGluIGV4ZWMgKVxuICAgICAgICBsb2cgJydcbiAgICAgICAgaWYgYXJncy5kcnlydW5cbiAgICAgICAgICAgIGxvZyBCRygwIDEgMCkgKyBmZygwIDMgMCkgKyAnIGRyeXJ1biAnICsgcmVzZXQgXG4gICAgICAgICAgICBsb2cgJydcbiAgICAgICAgICAgIGxvZyBub29uLnN0cmluZ2lmeSBjb21tYW5kc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjaGlsZHAgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuICAgICAgICAgICAgbG9nIEJHKDIgMCAwKSArIGZnKDUgNSAwKSArICcgZXhlY3V0ZSAnICsgcmVzZXQgXG4gICAgICAgICAgICBsb2cgJydcbiAgICAgICAgICAgIGZvciBjbWQgaW4gY29tbWFuZHNcbiAgICAgICAgICAgICAgICBsb2cgQlcoMSkgKyBmdyg0KSArIGNtZCArIHJlc2V0XG4gICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGNoaWxkcC5leGVjU3luYyBjbWQsIGVuY29kaW5nOiAndXRmOCdcbiAgICAgICAgICAgICAgICAgICAgaWYgcmVzdWx0LnN0YXR1cz8gb3IgcmVzdWx0LnN0ZG91dD9cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZyAnZGFmdWs/J1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nIHJlc3VsdC5zdGRvdXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZyBCRyg0IDAgMCkgKyBmZyg1IDUgMCkgKyByZXN1bHQuc3RkZXJyICsgcmVzZXRcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nIHJlc3VsdFxuICAgICAgICAgICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgICAgICAgICBlcnJvciBCRyg0IDAgMCkgKyBmZyg1IDUgMCkgKyAoZXJyPy5zdGRvdXQgPyBlcnIpICsgcmVzZXRcbiAgICAgICAgXG4gICAgbG9nIFwiXCJcbiAgICBpZiBhcmdzLmluZm9cbiAgICAgICAgbG9nIEJXKDEpICsgXCIgXCIgK1xuICAgICAgICBmdyg4KSArIHN0YXRzLm51bV9kaXJzICsgKHN0YXRzLmhpZGRlbl9kaXJzIGFuZCBmdyg0KSArIFwiK1wiICsgZncoNSkgKyAoc3RhdHMuaGlkZGVuX2RpcnMpIG9yIFwiXCIpICsgZncoNCkgKyBcIiBkaXJzIFwiICtcbiAgICAgICAgZncoOCkgKyBzdGF0cy5udW1fZmlsZXMgKyAoc3RhdHMuaGlkZGVuX2ZpbGVzIGFuZCBmdyg0KSArIFwiK1wiICsgZncoNSkgKyAoc3RhdHMuaGlkZGVuX2ZpbGVzKSBvciBcIlwiKSArIGZ3KDQpICsgXCIgZmlsZXMgXCIgK1xuICAgICAgICBmdyg4KSArIHRpbWUocHJvY2Vzcy5ocnRpbWUuYmlnaW50PygpLXN0YXJ0VGltZSkgKyBcIiBcIiArXG4gICAgICAgIHJlc2V0XG4gICAgXG5pZiBhcmdzXG4gICAgaW5pdEFyZ3MoKVxuICAgIG1haW4oKVxuZWxzZVxuICAgIG1vZHVsZU1haW4gPSAoYXJnLCBvcHQ9e30pIC0+XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggdHlwZW9mIGFyZ1xuICAgICAgICAgICAgd2hlbiAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBPYmplY3QuYXNzaWduIHt9LCBvcHRcbiAgICAgICAgICAgICAgICBhcmdzLnBhdGhzID89IFtdXG4gICAgICAgICAgICAgICAgYXJncy5wYXRocy5wdXNoIGFyZ1xuICAgICAgICAgICAgd2hlbiAnb2JqZWN0J1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBPYmplY3QuYXNzaWduIHt9LCBhcmdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhcmdzID0gcGF0aHM6WycuJ11cbiAgICAgICAgaW5pdEFyZ3MoKVxuICAgICAgICBcbiAgICAgICAgb3V0ID0gJydcbiAgICAgICAgb2xkbG9nID0gY29uc29sZS5sb2dcbiAgICAgICAgY29uc29sZS5sb2cgPSAtPiBcbiAgICAgICAgICAgIGZvciBhcmcgaW4gYXJndW1lbnRzIHRoZW4gb3V0ICs9IFN0cmluZyhhcmcpXG4gICAgICAgICAgICBvdXQgKz0gJ1xcbidcbiAgICAgICAgXG4gICAgICAgIG1haW4oKVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2cgPSBvbGRsb2dcbiAgICAgICAgb3V0XG4gICAgXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBtb2R1bGVNYWluXG4gICAgIl19
//# sourceURL=../coffee/color-ls.coffee