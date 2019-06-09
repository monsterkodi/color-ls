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
        b: [fg(0, 0, 3)],
        kB: [fg(0, 0, 5), fg(0, 0, 3)],
        MB: [fg(1, 1, 5), fg(0, 0, 5)],
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
    var age, col, moment, num, range, ref1, t;
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
    if (args.bytes) {
        s += sizeString(stat);
    }
    if (args.mdate) {
        s += timeString(stat);
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
    var alph, d, dirs, dsts, exts, f, fils, fsts, j, k, len, len1, len2, n, results, results1;
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
        for (n = 0, len2 = fils.length; n < len2; n++) {
            f = fils[n];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGlaQUFBO0lBQUE7O0FBUUEsU0FBQSxnRUFBMEIsQ0FBQzs7QUFFM0IsTUFBdUIsT0FBQSxDQUFRLE1BQVIsQ0FBdkIsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjOztBQUNkLEVBQUEsR0FBUyxPQUFBLENBQVEsSUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBRVQsSUFBQSxHQUFROztBQUNSLEtBQUEsR0FBUTs7QUFFUixJQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTLElBQUksQ0FBQzs7QUFDZCxFQUFBLEdBQVMsSUFBSSxDQUFDLEVBQUUsQ0FBQzs7QUFDakIsRUFBQSxHQUFTLElBQUksQ0FBQyxFQUFFLENBQUM7O0FBQ2pCLEVBQUEsR0FBUyxTQUFDLENBQUQ7V0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVUsQ0FBQSxDQUFBO0FBQXpCOztBQUNULEVBQUEsR0FBUyxTQUFDLENBQUQ7V0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVUsQ0FBQSxDQUFBO0FBQXpCOztBQUVULEtBQUEsR0FDSTtJQUFBLFFBQUEsRUFBZ0IsQ0FBaEI7SUFDQSxTQUFBLEVBQWdCLENBRGhCO0lBRUEsV0FBQSxFQUFnQixDQUZoQjtJQUdBLFlBQUEsRUFBZ0IsQ0FIaEI7SUFJQSxjQUFBLEVBQWdCLENBSmhCO0lBS0EsY0FBQSxFQUFnQixDQUxoQjtJQU1BLFdBQUEsRUFBZ0IsRUFOaEI7OztBQWNKLElBQUcsQ0FBSSxNQUFNLENBQUMsTUFBWCxJQUFxQixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQWQsS0FBb0IsR0FBNUM7SUFFSSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7SUFD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SUksVUFBQSxHQUFhLFNBQUMsR0FBRCxFQUFNLEdBQU47QUFFVCxZQUFBOztZQUZlLE1BQUk7O0FBRW5CLGdCQUFPLE9BQU8sR0FBZDtBQUFBLGlCQUNTLFFBRFQ7Z0JBRVEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxNQUFQLENBQWMsRUFBZCxFQUFrQixHQUFsQjs7b0JBQ1AsSUFBSSxDQUFDOztvQkFBTCxJQUFJLENBQUMsUUFBUzs7Z0JBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFYLENBQWdCLEdBQWhCO0FBSEM7QUFEVCxpQkFLUyxRQUxUO2dCQU1RLElBQUEsR0FBTyxNQUFNLENBQUMsTUFBUCxDQUFjLEVBQWQsRUFBa0IsR0FBbEI7QUFETjtBQUxUO2dCQVFRLElBQUEsR0FBTztvQkFBQSxLQUFBLEVBQU0sQ0FBQyxHQUFELENBQU47O0FBUmY7UUFTQSxRQUFBLENBQUE7UUFJQSxHQUFBLEdBQU07UUFDTixNQUFBLEdBQVMsT0FBTyxDQUFDO1FBQ2pCLE9BQU8sQ0FBQyxHQUFSLEdBQWMsU0FBQTtBQUNWLGdCQUFBO0FBQUEsaUJBQUEsMkNBQUE7O2dCQUEwQixHQUFBLElBQU8sTUFBQSxDQUFPLEdBQVA7QUFBakM7bUJBQ0EsR0FBQSxJQUFPO1FBRkc7UUFJZCxJQUFBLENBQUE7UUFFQSxPQUFPLENBQUMsR0FBUixHQUFjO2VBQ2Q7SUF4QlM7SUEwQmIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0E5QnJCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAgICAgICAwMDAgICAgICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwICAwMDAgICAgICAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgIDAwMFxuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgICAgICAgMDAwMDAwMCAgMDAwMDAwMFxuIyMjXG5cbnN0YXJ0VGltZSA9IHByb2Nlc3MuaHJ0aW1lLmJpZ2ludD8oKVxuXG57IGxwYWQsIHJwYWQsIHRpbWUgfSA9IHJlcXVpcmUgJ2tzdHInXG5mcyAgICAgPSByZXF1aXJlICdmcydcbnNsYXNoICA9IHJlcXVpcmUgJ2tzbGFzaCdcbmFuc2kgICA9IHJlcXVpcmUgJ2Fuc2ktMjU2LWNvbG9ycydcbnV0aWwgICA9IHJlcXVpcmUgJ3V0aWwnXG5cbmFyZ3MgID0gbnVsbFxudG9rZW4gPSB7fVxuXG5ib2xkICAgPSAnXFx4MWJbMW0nXG5yZXNldCAgPSBhbnNpLnJlc2V0XG5mZyAgICAgPSBhbnNpLmZnLmdldFJnYlxuQkcgICAgID0gYW5zaS5iZy5nZXRSZ2JcbmZ3ICAgICA9IChpKSAtPiBhbnNpLmZnLmdyYXlzY2FsZVtpXVxuQlcgICAgID0gKGkpIC0+IGFuc2kuYmcuZ3JheXNjYWxlW2ldXG5cbnN0YXRzID0gIyBjb3VudGVycyBmb3IgKGhpZGRlbikgZGlycy9maWxlc1xuICAgIG51bV9kaXJzOiAgICAgICAwXG4gICAgbnVtX2ZpbGVzOiAgICAgIDBcbiAgICBoaWRkZW5fZGlyczogICAgMFxuICAgIGhpZGRlbl9maWxlczogICAwXG4gICAgbWF4T3duZXJMZW5ndGg6IDBcbiAgICBtYXhHcm91cExlbmd0aDogMFxuICAgIGJyb2tlbkxpbmtzOiAgICBbXVxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcblxuaWYgbm90IG1vZHVsZS5wYXJlbnQgb3IgbW9kdWxlLnBhcmVudC5pZCA9PSAnLidcblxuICAgIGthcmcgPSByZXF1aXJlICdrYXJnJ1xuICAgIGFyZ3MgPSBrYXJnIFwiXCJcIlxuICAgIGNvbG9yLWxzXG4gICAgICAgIHBhdGhzICAgICAgICAgLiA/IHRoZSBmaWxlKHMpIGFuZC9vciBmb2xkZXIocykgdG8gZGlzcGxheSAuICoqXG4gICAgICAgIGFsbCAgICAgICAgICAgLiA/IHNob3cgZG90IGZpbGVzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGRpcnMgICAgICAgICAgLiA/IHNob3cgb25seSBkaXJzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGZpbGVzICAgICAgICAgLiA/IHNob3cgb25seSBmaWxlcyAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGJ5dGVzICAgICAgICAgLiA/IGluY2x1ZGUgc2l6ZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIG1kYXRlICAgICAgICAgLiA/IGluY2x1ZGUgbW9kaWZpY2F0aW9uIGRhdGUgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGxvbmcgICAgICAgICAgLiA/IGluY2x1ZGUgc2l6ZSBhbmQgZGF0ZSAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIG93bmVyICAgICAgICAgLiA/IGluY2x1ZGUgb3duZXIgYW5kIGdyb3VwICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHJpZ2h0cyAgICAgICAgLiA/IGluY2x1ZGUgcmlnaHRzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHNpemUgICAgICAgICAgLiA/IHNvcnQgYnkgc2l6ZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHRpbWUgICAgICAgICAgLiA/IHNvcnQgYnkgdGltZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGtpbmQgICAgICAgICAgLiA/IHNvcnQgYnkga2luZCAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIG5lcmR5ICAgICAgICAgLiA/IHVzZSBuZXJkIGZvbnQgaWNvbnMgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHByZXR0eSAgICAgICAgLiA/IHByZXR0eSBzaXplIGFuZCBhZ2UgICAgICAgICAgICAgLiA9IHRydWVcbiAgICAgICAgaWdub3JlICAgICAgICAuID8gZG9uJ3QgcmVjdXJzZSBpbnRvICAgICAgICAgICAgICAuID0gbm9kZV9tb2R1bGVzXG4gICAgICAgIGluZm8gICAgICAgICAgLiA/IHNob3cgc3RhdGlzdGljcyAgICAgICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBJXG4gICAgICAgIGFscGhhYmV0aWNhbCAgLiA/IGRvbid0IGdyb3VwIGRpcnMgYmVmb3JlIGZpbGVzICAgLiA9IGZhbHNlIC4gLSBBXG4gICAgICAgIG9mZnNldCAgICAgICAgLiA/IGluZGVudCBzaG9ydCBsaXN0aW5ncyAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBPXG4gICAgICAgIHJlY3Vyc2UgICAgICAgLiA/IHJlY3Vyc2UgaW50byBzdWJkaXJzICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBSXG4gICAgICAgIHRyZWUgICAgICAgICAgLiA/IHJlY3Vyc2UgYW5kIGluZGVudCAgICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBUXG4gICAgICAgIGRlcHRoICAgICAgICAgLiA/IHJlY3Vyc2lvbiBkZXB0aCAgICAgICAgICAgICAgICAgLiA9IOKIniAgICAgLiAtIERcbiAgICAgICAgZmluZCAgICAgICAgICAuID8gZmlsdGVyIHdpdGggYSByZWdleHAgICAgICAgICAgICAgICAgICAgICAgLiAtIEZcbiAgICAgICAgZGVidWcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgLiAtIFhcbiAgICBcbiAgICB2ZXJzaW9uICAgICAgI3tyZXF1aXJlKFwiI3tfX2Rpcm5hbWV9Ly4uL3BhY2thZ2UuanNvblwiKS52ZXJzaW9ufVxuICAgIFwiXCJcIlxuICAgIFxuaW5pdEFyZ3MgPSAtPlxuICAgIFxuICAgIGlmIGFyZ3Muc2l6ZVxuICAgICAgICBhcmdzLmZpbGVzID0gdHJ1ZVxuICAgIFxuICAgIGlmIGFyZ3MubG9uZ1xuICAgICAgICBhcmdzLmJ5dGVzID0gdHJ1ZVxuICAgICAgICBhcmdzLm1kYXRlID0gdHJ1ZVxuICAgICAgICBcbiAgICBpZiBhcmdzLnRyZWVcbiAgICAgICAgYXJncy5yZWN1cnNlID0gdHJ1ZVxuICAgICAgICBhcmdzLm9mZnNldCAgPSBmYWxzZVxuICAgIFxuICAgIGlmIGFyZ3MuZGlycyBhbmQgYXJncy5maWxlc1xuICAgICAgICBhcmdzLmRpcnMgPSBhcmdzLmZpbGVzID0gZmFsc2VcbiAgICAgICAgXG4gICAgaWYgYXJncy5pZ25vcmU/Lmxlbmd0aFxuICAgICAgICBhcmdzLmlnbm9yZSA9IGFyZ3MuaWdub3JlLnNwbGl0ICcgJyBcbiAgICBlbHNlXG4gICAgICAgIGFyZ3MuaWdub3JlID0gW11cbiAgICAgICAgXG4gICAgaWYgYXJncy5kZXB0aCA9PSAn4oieJyB0aGVuIGFyZ3MuZGVwdGggPSBJbmZpbml0eVxuICAgIGVsc2UgYXJncy5kZXB0aCA9IE1hdGgubWF4IDAsIHBhcnNlSW50IGFyZ3MuZGVwdGhcbiAgICBpZiBOdW1iZXIuaXNOYU4gYXJncy5kZXB0aCB0aGVuIGFyZ3MuZGVwdGggPSAwXG4gICAgICAgIFxuICAgIGlmIGFyZ3MuZGVidWdcbiAgICAgICAgbm9vbiA9IHJlcXVpcmUgJ25vb24nXG4gICAgICAgIGxvZyBub29uLnN0cmluZ2lmeSBhcmdzLCBjb2xvcnM6dHJ1ZVxuICAgIFxuICAgIGFyZ3MucGF0aHMgPSBbJy4nXSB1bmxlc3MgYXJncy5wYXRocz8ubGVuZ3RoID4gMFxuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG5jb2xvcnMgPVxuICAgICdjb2ZmZWUnOiAgIFsgYm9sZCtmZyg0LDQsMCksICBmZygxLDEsMCksIGZnKDIsMiwwKSBdXG4gICAgJ2tvZmZlZSc6ICAgWyBib2xkK2ZnKDUsNSwwKSwgIGZnKDEsMCwwKSwgZmcoMywxLDApIF1cbiAgICAncHknOiAgICAgICBbIGJvbGQrZmcoMCwzLDApLCAgZmcoMCwxLDApLCBmZygwLDIsMCkgXVxuICAgICdyYic6ICAgICAgIFsgYm9sZCtmZyg0LDAsMCksICBmZygxLDAsMCksIGZnKDIsMCwwKSBdXG4gICAgJ2pzb24nOiAgICAgWyBib2xkK2ZnKDQsMCw0KSwgIGZnKDEsMCwxKSwgZmcoMiwwLDEpIF1cbiAgICAnY3Nvbic6ICAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygyLDAsMikgXVxuICAgICdub29uJzogICAgIFsgYm9sZCtmZyg0LDQsMCksICBmZygxLDEsMCksIGZnKDIsMiwwKSBdXG4gICAgJ3BsaXN0JzogICAgWyBib2xkK2ZnKDQsMCw0KSwgIGZnKDEsMCwxKSwgZmcoMiwwLDIpIF1cbiAgICAnanMnOiAgICAgICBbIGJvbGQrZmcoNSwwLDUpLCAgZmcoMiwwLDIpLCBmZygzLDAsMykgXVxuICAgICdjcHAnOiAgICAgIFsgYm9sZCtmZyg1LDQsMCksICBmdygzKSwgICAgIGZnKDMsMiwwKSBdXG4gICAgJ2gnOiAgICAgICAgWyAgICAgIGZnKDMsMSwwKSwgIGZ3KDMpLCAgICAgZmcoMiwxLDApIF1cbiAgICAncHljJzogICAgICBbICAgICAgZncoNSksICAgICAgZncoMyksICAgICBmdyg0KSBdXG4gICAgJ2xvZyc6ICAgICAgWyAgICAgIGZ3KDUpLCAgICAgIGZ3KDIpLCAgICAgZncoMykgXVxuICAgICdsb2cnOiAgICAgIFsgICAgICBmdyg1KSwgICAgICBmdygyKSwgICAgIGZ3KDMpIF1cbiAgICAndHh0JzogICAgICBbICAgICAgZncoMjApLCAgICAgZncoMyksICAgICBmdyg0KSBdXG4gICAgJ21kJzogICAgICAgWyBib2xkK2Z3KDIwKSwgICAgIGZ3KDMpLCAgICAgZncoNCkgXVxuICAgICdtYXJrZG93bic6IFsgYm9sZCtmdygyMCksICAgICBmdygzKSwgICAgIGZ3KDQpIF1cbiAgICAnc2gnOiAgICAgICBbIGJvbGQrZmcoNSwxLDApLCAgZmcoMiwwLDApLCBmZygzLDAsMCkgXVxuICAgICdwbmcnOiAgICAgIFsgYm9sZCtmZyg1LDAsMCksICBmZygyLDAsMCksIGZnKDMsMCwwKSBdXG4gICAgJ2pwZyc6ICAgICAgWyBib2xkK2ZnKDAsMywwKSwgIGZnKDAsMiwwKSwgZmcoMCwyLDApIF1cbiAgICAncHhtJzogICAgICBbIGJvbGQrZmcoMSwxLDUpLCAgZmcoMCwwLDIpLCBmZygwLDAsNCkgXVxuICAgICd0aWZmJzogICAgIFsgYm9sZCtmZygxLDEsNSksICBmZygwLDAsMyksIGZnKDAsMCw0KSBdXG5cbiAgICAnX2RlZmF1bHQnOiBbICAgICAgZncoMTUpLCAgICAgZncoNCksICAgICBmdygxMCkgXVxuICAgICdfZGlyJzogICAgIFsgYm9sZCtCRygwLDAsMikrZncoMjMpLCBmZygxLDEsNSksIGJvbGQrQkcoMCwwLDIpK2ZnKDIsMiw1KSBdXG4gICAgJ18uZGlyJzogICAgWyBib2xkK0JHKDAsMCwxKStmdygyMyksIGJvbGQrQkcoMCwwLDEpK2ZnKDEsMSw1KSwgYm9sZCtCRygwLDAsMSkrZmcoMiwyLDUpIF1cbiAgICAnX2xpbmsnOiAgICB7ICdhcnJvdyc6IGZnKDEsMCwxKSwgJ3BhdGgnOiBmZyg0LDAsNCksICdicm9rZW4nOiBCRyg1LDAsMCkrZmcoNSw1LDApIH1cbiAgICAnX2Fycm93JzogICAgIEJXKDIpK2Z3KDApXG4gICAgJ19oZWFkZXInOiAgWyBib2xkK0JXKDIpK2ZnKDMsMiwwKSwgIGZ3KDQpLCBib2xkK0JXKDIpK2ZnKDUsNSwwKSBdXG4gICAgJ19zaXplJzogICAgeyBiOiBbZmcoMCwwLDMpXSwga0I6IFtmZygwLDAsNSksIGZnKDAsMCwzKV0sIE1COiBbZmcoMSwxLDUpLCBmZygwLDAsNSldLCBHQjogW2ZnKDQsNCw1KSwgZmcoMiwyLDUpXSwgVEI6IFtmZyg0LDQsNSksIGZnKDIsMiw1KV0gfVxuICAgICdfdXNlcnMnOiAgIHsgcm9vdDogIGZnKDMsMCwwKSwgZGVmYXVsdDogZmcoMSwwLDEpIH1cbiAgICAnX2dyb3Vwcyc6ICB7IHdoZWVsOiBmZygxLDAsMCksIHN0YWZmOiBmZygwLDEsMCksIGFkbWluOiBmZygxLDEsMCksIGRlZmF1bHQ6IGZnKDEsMCwxKSB9XG4gICAgJ19lcnJvcic6ICAgWyBib2xkK0JHKDUsMCwwKStmZyg1LDUsMCksIGJvbGQrQkcoNSwwLDApK2ZnKDUsNSw1KSBdXG4gICAgJ19yaWdodHMnOlxuICAgICAgICAgICAgICAgICAgJ3IrJzogYm9sZCtCVygxKStmdyg2KVxuICAgICAgICAgICAgICAgICAgJ3ItJzogcmVzZXQrQlcoMSkrZncoMilcbiAgICAgICAgICAgICAgICAgICd3Kyc6IGJvbGQrQlcoMSkrZmcoMiwyLDUpXG4gICAgICAgICAgICAgICAgICAndy0nOiByZXNldCtCVygxKStmdygyKVxuICAgICAgICAgICAgICAgICAgJ3grJzogYm9sZCtCVygxKStmZyg1LDAsMClcbiAgICAgICAgICAgICAgICAgICd4LSc6IHJlc2V0K0JXKDEpK2Z3KDIpXG5cbnVzZXJNYXAgPSB7fVxudXNlcm5hbWUgPSAodWlkKSAtPlxuICAgIGlmIG5vdCB1c2VyTWFwW3VpZF1cbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBjaGlsZHAgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuICAgICAgICAgICAgdXNlck1hcFt1aWRdID0gY2hpbGRwLnNwYXduU3luYyhcImlkXCIsIFtcIi11blwiLCBcIiN7dWlkfVwiXSkuc3Rkb3V0LnRvU3RyaW5nKCd1dGY4JykudHJpbSgpXG4gICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgIGxvZyBlXG4gICAgdXNlck1hcFt1aWRdXG5cbmdyb3VwTWFwID0gbnVsbFxuZ3JvdXBuYW1lID0gKGdpZCkgLT5cbiAgICBpZiBub3QgZ3JvdXBNYXBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBjaGlsZHAgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuICAgICAgICAgICAgZ2lkcyA9IGNoaWxkcC5zcGF3blN5bmMoXCJpZFwiLCBbXCItR1wiXSkuc3Rkb3V0LnRvU3RyaW5nKCd1dGY4Jykuc3BsaXQoJyAnKVxuICAgICAgICAgICAgZ25tcyA9IGNoaWxkcC5zcGF3blN5bmMoXCJpZFwiLCBbXCItR25cIl0pLnN0ZG91dC50b1N0cmluZygndXRmOCcpLnNwbGl0KCcgJylcbiAgICAgICAgICAgIGdyb3VwTWFwID0ge31cbiAgICAgICAgICAgIGZvciBpIGluIFswLi4uZ2lkcy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgZ3JvdXBNYXBbZ2lkc1tpXV0gPSBnbm1zW2ldXG4gICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgIGxvZyBlXG4gICAgZ3JvdXBNYXBbZ2lkXVxuXG5pZiAnZnVuY3Rpb24nID09IHR5cGVvZiBwcm9jZXNzLmdldHVpZFxuICAgIGNvbG9yc1snX3VzZXJzJ11bdXNlcm5hbWUocHJvY2Vzcy5nZXR1aWQoKSldID0gZmcoMCw0LDApXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAwMDBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxubG9nX2Vycm9yID0gKCkgLT5cbiAgICBcbiAgICBsb2cgXCIgXCIgKyBjb2xvcnNbJ19lcnJvciddWzBdICsgXCIgXCIgKyBib2xkICsgYXJndW1lbnRzWzBdICsgKGFyZ3VtZW50cy5sZW5ndGggPiAxIGFuZCAoY29sb3JzWydfZXJyb3InXVsxXSArIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5zbGljZSgxKS5qb2luKCcgJykpIG9yICcnKSArIFwiIFwiICsgcmVzZXRcblxubGlua1N0cmluZyA9IChmaWxlKSAtPiBcbiAgICBcbiAgICBzICA9IHJlc2V0ICsgZncoMSkgKyBjb2xvcnNbJ19saW5rJ11bJ2Fycm93J10gKyBcIiDilrogXCIgXG4gICAgcyArPSBjb2xvcnNbJ19saW5rJ11bKGZpbGUgaW4gc3RhdHMuYnJva2VuTGlua3MpIGFuZCAnYnJva2VuJyBvciAncGF0aCddIFxuICAgIHRyeVxuICAgICAgICBzICs9IHNsYXNoLnBhdGggZnMucmVhZGxpbmtTeW5jKGZpbGUpXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIHMgKz0gJyA/ICdcbiAgICBzXG5cbm5hbWVTdHJpbmcgPSAobmFtZSwgZXh0KSAtPiBcbiAgICBcbiAgICBpZiBhcmdzLm5lcmR5XG4gICAgICAgIGljb25zID0gcmVxdWlyZSAnLi9pY29ucydcbiAgICAgICAgaWNvbiA9IChjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMl0gKyAoaWNvbnMuZ2V0KG5hbWUsIGV4dCkgPyAnICcpKSArICcgJ1xuICAgIGVsc2VcbiAgICAgICAgaWNvbiA9ICcnXG4gICAgXCIgXCIgKyBpY29uICsgY29sb3JzW2NvbG9yc1tleHRdPyBhbmQgZXh0IG9yICdfZGVmYXVsdCddWzBdICsgbmFtZSArIHJlc2V0XG4gICAgXG5kb3RTdHJpbmcgID0gKGV4dCkgLT4gXG4gICAgXG4gICAgY29sb3JzW2NvbG9yc1tleHRdPyBhbmQgZXh0IG9yICdfZGVmYXVsdCddWzFdICsgXCIuXCIgKyByZXNldFxuICAgIFxuZXh0U3RyaW5nICA9IChuYW1lLCBleHQpIC0+IFxuICAgIFxuICAgIGlmIGFyZ3MubmVyZHkgYW5kIG5hbWUgXG4gICAgICAgIGljb25zID0gcmVxdWlyZSAnLi9pY29ucydcbiAgICAgICAgaWYgaWNvbnMuZ2V0KG5hbWUsIGV4dCkgdGhlbiByZXR1cm4gJydcbiAgICBkb3RTdHJpbmcoZXh0KSArIGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVsxXSArIGV4dCArIHJlc2V0XG4gICAgXG5kaXJTdHJpbmcgID0gKG5hbWUsIGV4dCkgLT5cbiAgICBcbiAgICBjID0gbmFtZSBhbmQgJ19kaXInIG9yICdfLmRpcidcbiAgICBpY29uID0gYXJncy5uZXJkeSBhbmQgY29sb3JzW2NdWzJdICsgJyBcXHVmNDEzJyBvciAnJ1xuICAgIGljb24gKyBjb2xvcnNbY11bMF0gKyAobmFtZSBhbmQgKFwiIFwiICsgbmFtZSkgb3IgXCIgXCIpICsgKGlmIGV4dCB0aGVuIGNvbG9yc1tjXVsxXSArICcuJyArIGNvbG9yc1tjXVsyXSArIGV4dCBlbHNlIFwiXCIpICsgXCIgXCJcblxuc2l6ZVN0cmluZyA9IChzdGF0KSAtPlxuICAgIFxuICAgIGlmIGFyZ3MucHJldHR5IGFuZCBzdGF0LnNpemUgPT0gMFxuICAgICAgICByZXR1cm4gbHBhZCgnICcsIDExKVxuICAgIGlmIHN0YXQuc2l6ZSA8IDEwMDBcbiAgICAgICAgY29sb3JzWydfc2l6ZSddWydiJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlIGlmIHN0YXQuc2l6ZSA8IDEwMDAwMDBcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsna0InXVswXSArIGxwYWQoKHN0YXQuc2l6ZSAvIDEwMDApLnRvRml4ZWQoMCksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ2tCJ11bMV0gKyBcImtCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsna0InXVswXSArIGxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2UgaWYgc3RhdC5zaXplIDwgMTAwMDAwMDAwMFxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydNQiddWzBdICsgbHBhZCgoc3RhdC5zaXplIC8gMTAwMDAwMCkudG9GaXhlZCgxKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsnTUInXVsxXSArIFwiTUIgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydNQiddWzBdICsgbHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZSBpZiBzdGF0LnNpemUgPCAxMDAwMDAwMDAwMDAwXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMF0gKyBscGFkKChzdGF0LnNpemUgLyAxMDAwMDAwMDAwKS50b0ZpeGVkKDEpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydHQiddWzFdICsgXCJHQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMF0gKyBscGFkKChzdGF0LnNpemUgLyAxMDAwMDAwMDAwMDAwKS50b0ZpeGVkKDMpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydUQiddWzFdICsgXCJUQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcblxudGltZVN0cmluZyA9IChzdGF0KSAtPlxuICAgIFxuICAgIG1vbWVudCA9IHJlcXVpcmUgJ21vbWVudCdcbiAgICB0ID0gbW9tZW50KHN0YXQubXRpbWUpXG4gICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgYWdlID0gbW9tZW50KCkudG8odCwgdHJ1ZSlcbiAgICAgICAgW251bSwgcmFuZ2VdID0gYWdlLnNwbGl0ICcgJ1xuICAgICAgICBudW0gPSAnMScgaWYgbnVtWzBdID09ICdhJ1xuICAgICAgICBpZiByYW5nZSA9PSAnZmV3J1xuICAgICAgICAgICAgbnVtID0gbW9tZW50KCkuZGlmZiB0LCAnc2Vjb25kcydcbiAgICAgICAgICAgIHJhbmdlID0gJ3NlY29uZHMnXG4gICAgICAgICAgICBmdygyMykgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdygxNikgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ3llYXInXG4gICAgICAgICAgICBmdyg2KSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDMpICsgcnBhZChyYW5nZSwgNykgKyAnICdcbiAgICAgICAgZWxzZSBpZiByYW5nZS5zdGFydHNXaXRoICdtb250aCdcbiAgICAgICAgICAgIGZ3KDgpICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoNCkgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ2RheSdcbiAgICAgICAgICAgIGZ3KDEwKSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDYpICsgcnBhZChyYW5nZSwgNykgKyAnICdcbiAgICAgICAgZWxzZSBpZiByYW5nZS5zdGFydHNXaXRoICdob3VyJ1xuICAgICAgICAgICAgZncoMTUpICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoOCkgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmdygxOCkgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdygxMikgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgIGVsc2VcbiAgICAgICAgZncoMTYpICsgbHBhZCh0LmZvcm1hdChcIkREXCIpLDIpICsgZncoNykrJy4nICtcbiAgICAgICAgZncoMTIpICsgdC5mb3JtYXQoXCJNTVwiKSArIGZ3KDcpK1wiLlwiICtcbiAgICAgICAgZncoIDgpICsgdC5mb3JtYXQoXCJZWVwiKSArICcgJyArXG4gICAgICAgIGZ3KDE2KSArIHQuZm9ybWF0KFwiSEhcIikgKyBjb2wgPSBmdyg3KSsnOicgK1xuICAgICAgICBmdygxNCkgKyB0LmZvcm1hdChcIm1tXCIpICsgY29sID0gZncoMSkrJzonICtcbiAgICAgICAgZncoIDQpICsgdC5mb3JtYXQoXCJzc1wiKSArICcgJ1xuXG5vd25lck5hbWUgPSAoc3RhdCkgLT5cbiAgICBcbiAgICB0cnlcbiAgICAgICAgdXNlcm5hbWUgc3RhdC51aWRcbiAgICBjYXRjaFxuICAgICAgICBzdGF0LnVpZFxuXG5ncm91cE5hbWUgPSAoc3RhdCkgLT5cbiAgICBcbiAgICB0cnlcbiAgICAgICAgZ3JvdXBuYW1lIHN0YXQuZ2lkXG4gICAgY2F0Y2hcbiAgICAgICAgc3RhdC5naWRcblxub3duZXJTdHJpbmcgPSAoc3RhdCkgLT5cbiAgICBcbiAgICBvd24gPSBvd25lck5hbWUoc3RhdClcbiAgICBncnAgPSBncm91cE5hbWUoc3RhdClcbiAgICBvY2wgPSBjb2xvcnNbJ191c2VycyddW293bl1cbiAgICBvY2wgPSBjb2xvcnNbJ191c2VycyddWydkZWZhdWx0J10gdW5sZXNzIG9jbFxuICAgIGdjbCA9IGNvbG9yc1snX2dyb3VwcyddW2dycF1cbiAgICBnY2wgPSBjb2xvcnNbJ19ncm91cHMnXVsnZGVmYXVsdCddIHVubGVzcyBnY2xcbiAgICBvY2wgKyBycGFkKG93biwgc3RhdHMubWF4T3duZXJMZW5ndGgpICsgXCIgXCIgKyBnY2wgKyBycGFkKGdycCwgc3RhdHMubWF4R3JvdXBMZW5ndGgpXG5cbnJ3eFN0cmluZyA9IChzdGF0LCBpKSAtPlxuICAgIFxuICAgIG1vZGUgPSBzdGF0Lm1vZGVcbiAgICBcbiAgICBpZiBhcmdzLm5lcmR5XG4gICAgICAgIHIgPSAnIFxcdWY0NDEnXG4gICAgICAgIHcgPSAnXFx1ZjA0MCdcbiAgICAgICAgeCA9IHN0YXQuaXNEaXJlY3RvcnkoKSBhbmQgJ1xcdWYwODUnIG9yICdcXHVmMDEzJ1xuICAgICAgICBcbiAgICAgICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjEwMCkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWydyKyddICsgciBvciBjb2xvcnNbJ19yaWdodHMnXVsnci0nXSArIHIpICtcbiAgICAgICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjAxMCkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWyd3KyddICsgdyBvciBjb2xvcnNbJ19yaWdodHMnXVsndy0nXSArIHcpICtcbiAgICAgICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjAwMSkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWyd4KyddICsgeCBvciBjb2xvcnNbJ19yaWdodHMnXVsneC0nXSArIHgpXG4gICAgZWxzZVxuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMTAwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3IrJ10gKyAnIHInIG9yIGNvbG9yc1snX3JpZ2h0cyddWydyLSddICsgJyAgJykgK1xuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDEwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3crJ10gKyAnIHcnIG9yIGNvbG9yc1snX3JpZ2h0cyddWyd3LSddICsgJyAgJykgK1xuICAgICAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDAxKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3grJ10gKyAnIHgnIG9yIGNvbG9yc1snX3JpZ2h0cyddWyd4LSddICsgJyAgJylcblxucmlnaHRzU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgdXIgPSByd3hTdHJpbmcoc3RhdCwgMilcbiAgICBnciA9IHJ3eFN0cmluZyhzdGF0LCAxKVxuICAgIHJvID0gcnd4U3RyaW5nKHN0YXQsIDApICsgXCIgXCJcbiAgICB1ciArIGdyICsgcm8gKyByZXNldFxuXG5nZXRQcmVmaXggPSAoc3RhdCwgZGVwdGgpIC0+XG4gICAgXG4gICAgcyA9ICcnXG4gICAgaWYgYXJncy5yaWdodHNcbiAgICAgICAgcyArPSByaWdodHNTdHJpbmcgc3RhdFxuICAgICAgICBzICs9IFwiIFwiXG4gICAgaWYgYXJncy5vd25lclxuICAgICAgICBzICs9IG93bmVyU3RyaW5nIHN0YXRcbiAgICAgICAgcyArPSBcIiBcIlxuICAgIGlmIGFyZ3MuYnl0ZXNcbiAgICAgICAgcyArPSBzaXplU3RyaW5nIHN0YXRcbiAgICBpZiBhcmdzLm1kYXRlXG4gICAgICAgIHMgKz0gdGltZVN0cmluZyBzdGF0XG4gICAgICAgIFxuICAgIGlmIGRlcHRoIGFuZCBhcmdzLnRyZWVcbiAgICAgICAgcyArPSBycGFkICcnLCBkZXB0aCo0XG4gICAgICAgIFxuICAgIGlmIHMubGVuZ3RoID09IDAgYW5kIGFyZ3Mub2Zmc2V0XG4gICAgICAgIHMgKz0gJyAgICAgICAnXG4gICAgc1xuICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMFxuXG5zb3J0ID0gKGxpc3QsIHN0YXRzLCBleHRzPVtdKSAtPlxuICAgIFxuICAgIF8gPSByZXF1aXJlICdsb2Rhc2gnXG4gICAgbW9tZW50ID0gcmVxdWlyZSAnbW9tZW50J1xuICAgIFxuICAgIGwgPSBfLnppcCBsaXN0LCBzdGF0cywgWzAuLi5saXN0Lmxlbmd0aF0sIChleHRzLmxlbmd0aCA+IDAgYW5kIGV4dHMgb3IgWzAuLi5saXN0Lmxlbmd0aF0pXG4gICAgXG4gICAgaWYgYXJncy5raW5kXG4gICAgICAgIGlmIGV4dHMgPT0gW10gdGhlbiByZXR1cm4gbGlzdFxuICAgICAgICBsLnNvcnQoKGEsYikgLT5cbiAgICAgICAgICAgIGlmIGFbM10gPiBiWzNdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIGlmIGFbM10gPCBiWzNdIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhcmdzLnRpbWVcbiAgICAgICAgICAgICAgICBtID0gbW9tZW50KGFbMV0ubXRpbWUpXG4gICAgICAgICAgICAgICAgaWYgbS5pc0FmdGVyKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBpZiBtLmlzQmVmb3JlKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhcmdzLnNpemVcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPiBiWzFdLnNpemUgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA8IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYVsyXSA+IGJbMl0gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgLTEpXG4gICAgZWxzZSBpZiBhcmdzLnRpbWVcbiAgICAgICAgbC5zb3J0KChhLGIpIC0+XG4gICAgICAgICAgICBtID0gbW9tZW50KGFbMV0ubXRpbWUpXG4gICAgICAgICAgICBpZiBtLmlzQWZ0ZXIoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgaWYgbS5pc0JlZm9yZShiWzFdLm10aW1lKSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYXJncy5zaXplXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplID4gYlsxXS5zaXplIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPCBiWzFdLnNpemUgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFbMl0gPiBiWzJdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIC0xKVxuICAgIGVsc2UgaWYgYXJncy5zaXplXG4gICAgICAgIGwuc29ydCgoYSxiKSAtPlxuICAgICAgICAgICAgaWYgYVsxXS5zaXplID4gYlsxXS5zaXplIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA8IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYVsyXSA+IGJbMl0gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgLTEpXG4gICAgXy51bnppcChsKVswXVxuXG4jIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgXG4jIDAwMCAgMDAwICAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgMDAwICAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG5cbmlnbm9yZSA9IChwKSAtPlxuICAgIFxuICAgIGJhc2UgPSBzbGFzaC5iYXNlbmFtZSBwXG4gICAgcmV0dXJuIHRydWUgaWYgYmFzZVswXSA9PSAnJCdcbiAgICByZXR1cm4gdHJ1ZSBpZiBiYXNlID09ICdkZXNrdG9wLmluaScgICAgXG4gICAgcmV0dXJuIHRydWUgaWYgYmFzZS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGggJ250dXNlcidcbiAgICBmYWxzZVxuICAgIFxuIyAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMFxuIyAwMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDBcblxubGlzdEZpbGVzID0gKHAsIGZpbGVzLCBkZXB0aCkgLT5cbiAgICBcbiAgICBhbHBoID0gW10gaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICBkaXJzID0gW10gIyB2aXNpYmxlIGRpcnNcbiAgICBmaWxzID0gW10gIyB2aXNpYmxlIGZpbGVzXG4gICAgZHN0cyA9IFtdICMgZGlyIHN0YXRzXG4gICAgZnN0cyA9IFtdICMgZmlsZSBzdGF0c1xuICAgIGV4dHMgPSBbXSAjIGZpbGUgZXh0ZW5zaW9uc1xuXG4gICAgaWYgYXJncy5vd25lclxuICAgICAgICBcbiAgICAgICAgZmlsZXMuZm9yRWFjaCAocnApIC0+XG4gICAgICAgICAgICBpZiBzbGFzaC5pc0Fic29sdXRlIHJwXG4gICAgICAgICAgICAgICAgZmlsZSA9IHNsYXNoLnJlc29sdmUgcnBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmaWxlICA9IHNsYXNoLmpvaW4gcCwgcnBcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIHN0YXQgPSBmcy5sc3RhdFN5bmMoZmlsZSlcbiAgICAgICAgICAgICAgICBvbCA9IG93bmVyTmFtZShzdGF0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICBnbCA9IGdyb3VwTmFtZShzdGF0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICBpZiBvbCA+IHN0YXRzLm1heE93bmVyTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm1heE93bmVyTGVuZ3RoID0gb2xcbiAgICAgICAgICAgICAgICBpZiBnbCA+IHN0YXRzLm1heEdyb3VwTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm1heEdyb3VwTGVuZ3RoID0gZ2xcbiAgICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICBmaWxlcy5mb3JFYWNoIChycCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLmlzQWJzb2x1dGUgcnBcbiAgICAgICAgICAgIGZpbGUgID0gc2xhc2gucmVzb2x2ZSBycFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmaWxlICA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBwLCBycFxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBpZ25vcmUgcnBcbiAgICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgbHN0YXQgPSBmcy5sc3RhdFN5bmMgZmlsZVxuICAgICAgICAgICAgbGluayAgPSBsc3RhdC5pc1N5bWJvbGljTGluaygpXG4gICAgICAgICAgICBzdGF0ICA9IGxpbmsgYW5kIGZzLnN0YXRTeW5jKGZpbGUpIG9yIGxzdGF0XG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgaWYgbGlua1xuICAgICAgICAgICAgICAgIHN0YXQgPSBsc3RhdFxuICAgICAgICAgICAgICAgIHN0YXRzLmJyb2tlbkxpbmtzLnB1c2ggZmlsZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICMgbG9nX2Vycm9yIFwiY2FuJ3QgcmVhZCBmaWxlOiBcIiwgZmlsZSwgbGlua1xuICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGV4dCAgPSBzbGFzaC5leHQgZmlsZVxuICAgICAgICBuYW1lID0gc2xhc2guYmFzZSBmaWxlXG4gICAgICAgIFxuICAgICAgICBpZiBuYW1lWzBdID09ICcuJ1xuICAgICAgICAgICAgZXh0ID0gbmFtZS5zdWJzdHIoMSkgKyBzbGFzaC5leHRuYW1lIGZpbGVcbiAgICAgICAgICAgIG5hbWUgPSAnJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIG5hbWUubGVuZ3RoIGFuZCBuYW1lW25hbWUubGVuZ3RoLTFdICE9ICdcXHInIG9yIGFyZ3MuYWxsXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHMgPSBnZXRQcmVmaXggc3RhdCwgZGVwdGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICAgIGlmIG5vdCBhcmdzLmZpbGVzXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBhcmdzLnRyZWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5hbWUuc3RhcnRzV2l0aCAnLi8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVbMi4uXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGRpclN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzICs9IGxpbmtTdHJpbmcgZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlycy5wdXNoIHMrcmVzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGFscGgucHVzaCBzK3Jlc2V0IGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgICAgICAgICAgICAgIGRzdHMucHVzaCBzdGF0XG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm51bV9kaXJzICs9IDFcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9kaXJzICs9IDFcbiAgICAgICAgICAgIGVsc2UgIyBpZiBwYXRoIGlzIGZpbGVcbiAgICAgICAgICAgICAgICBpZiBub3QgYXJncy5kaXJzXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gbmFtZVN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGV4dFN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgbGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBsaW5rU3RyaW5nIGZpbGVcbiAgICAgICAgICAgICAgICAgICAgZmlscy5wdXNoIHMrcmVzZXRcbiAgICAgICAgICAgICAgICAgICAgYWxwaC5wdXNoIHMrcmVzZXQgaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICAgICAgICAgICAgICAgICAgZnN0cy5wdXNoIHN0YXRcbiAgICAgICAgICAgICAgICAgICAgZXh0cy5wdXNoIGV4dFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5udW1fZmlsZXMgKz0gMVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMuaGlkZGVuX2ZpbGVzICs9IDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgc3RhdC5pc0ZpbGUoKVxuICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9maWxlcyArPSAxXG4gICAgICAgICAgICBlbHNlIGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9kaXJzICs9IDFcblxuICAgIGlmIGFyZ3Muc2l6ZSBvciBhcmdzLmtpbmQgb3IgYXJncy50aW1lXG4gICAgICAgIGlmIGRpcnMubGVuZ3RoIGFuZCBub3QgYXJncy5maWxlc1xuICAgICAgICAgICAgZGlycyA9IHNvcnQgZGlycywgZHN0c1xuICAgICAgICBpZiBmaWxzLmxlbmd0aFxuICAgICAgICAgICAgZmlscyA9IHNvcnQgZmlscywgZnN0cywgZXh0c1xuXG4gICAgaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICAgICAgbG9nIHAgZm9yIHAgaW4gYWxwaFxuICAgIGVsc2VcbiAgICAgICAgbG9nIGQgZm9yIGQgaW4gZGlyc1xuICAgICAgICBsb2cgZiBmb3IgZiBpbiBmaWxzXG5cbiMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwXG5cbmxpc3REaXIgPSAocCwgb3B0PXt9KSAtPlxuICAgICAgICAgICAgXG4gICAgaWYgYXJncy5yZWN1cnNlXG4gICAgICAgIGRlcHRoID0gcGF0aERlcHRoIHAsIG9wdFxuICAgICAgICByZXR1cm4gaWYgZGVwdGggPiBhcmdzLmRlcHRoXG4gICAgXG4gICAgcHMgPSBwXG5cbiAgICB0cnlcbiAgICAgICAgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhwKVxuICAgIGNhdGNoIGVyclxuICAgICAgICB0cnVlXG5cbiAgICBpZiBhcmdzLmZpbmRcbiAgICAgICAgZmlsZXMgPSBmaWxlcy5maWx0ZXIgKGYpIC0+XG4gICAgICAgICAgICBmIGlmIFJlZ0V4cChhcmdzLmZpbmQpLnRlc3QgZlxuICAgICAgICAgICAgXG4gICAgaWYgYXJncy5maW5kIGFuZCBub3QgZmlsZXM/Lmxlbmd0aFxuICAgICAgICB0cnVlXG4gICAgZWxzZSBpZiBhcmdzLnBhdGhzLmxlbmd0aCA9PSAxIGFuZCBhcmdzLnBhdGhzWzBdID09ICcuJyBhbmQgbm90IGFyZ3MucmVjdXJzZVxuICAgICAgICBsb2cgcmVzZXRcbiAgICBlbHNlIGlmIGFyZ3MudHJlZVxuICAgICAgICBsb2cgZ2V0UHJlZml4KHNsYXNoLmlzRGlyKHApLCBkZXB0aC0xKSArIGRpclN0cmluZyhzbGFzaC5iYXNlKHBzKSwgc2xhc2guZXh0KHBzKSkgKyByZXNldFxuICAgIGVsc2VcbiAgICAgICAgcyA9IGNvbG9yc1snX2Fycm93J10gKyBcIiDilrYgXCIgKyBjb2xvcnNbJ19oZWFkZXInXVswXVxuICAgICAgICBwcyA9IHNsYXNoLnJlc29sdmUgcHMgaWYgcHNbMF0gIT0gJ34nXG4gICAgICAgIHBzID0gc2xhc2gucmVsYXRpdmUgcHMsIHByb2Nlc3MuY3dkKClcblxuICAgICAgICBpZiBwcyA9PSAnLydcbiAgICAgICAgICAgIHMgKz0gJy8nXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNwID0gcHMuc3BsaXQoJy8nKVxuICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVswXSArIHNwLnNoaWZ0KClcbiAgICAgICAgICAgIHdoaWxlIHNwLmxlbmd0aFxuICAgICAgICAgICAgICAgIHBuID0gc3Auc2hpZnQoKVxuICAgICAgICAgICAgICAgIGlmIHBuXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gY29sb3JzWydfaGVhZGVyJ11bMV0gKyAnLydcbiAgICAgICAgICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVtzcC5sZW5ndGggPT0gMCBhbmQgMiBvciAwXSArIHBuXG4gICAgICAgIGxvZyByZXNldFxuICAgICAgICBsb2cgcyArIFwiIFwiICsgcmVzZXRcbiAgICAgICAgbG9nIHJlc2V0XG5cbiAgICBpZiBmaWxlcz8ubGVuZ3RoXG4gICAgICAgIGxpc3RGaWxlcyBwLCBmaWxlcywgZGVwdGhcblxuICAgIGlmIGFyZ3MucmVjdXJzZVxuICAgICAgICBcbiAgICAgICAgZG9SZWN1cnNlID0gKGYpIC0+IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgc2xhc2guYmFzZW5hbWUoZikgaW4gYXJncy5pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBzbGFzaC5leHQoZikgPT0gJ2FwcCdcbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBub3QgYXJncy5hbGwgYW5kIGZbMF0gPT0gJy4nXG4gICAgICAgICAgICBzbGFzaC5pc0RpciBzbGFzaC5qb2luIHAsIGZcbiAgICAgICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGZvciBwciBpbiBmcy5yZWFkZGlyU3luYyhwKS5maWx0ZXIgZG9SZWN1cnNlXG4gICAgICAgICAgICAgICAgbGlzdERpciBzbGFzaC5yZXNvbHZlKHNsYXNoLmpvaW4gcCwgcHIpLCBvcHRcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBtc2cgPSBlcnIubWVzc2FnZVxuICAgICAgICAgICAgbXNnID0gXCJwZXJtaXNzaW9uIGRlbmllZFwiIGlmIG1zZy5zdGFydHNXaXRoIFwiRUFDQ0VTXCJcbiAgICAgICAgICAgIG1zZyA9IFwicGVybWlzc2lvbiBkZW5pZWRcIiBpZiBtc2cuc3RhcnRzV2l0aCBcIkVQRVJNXCJcbiAgICAgICAgICAgIGxvZ19lcnJvciBtc2dcbiAgICAgICAgICAgIFxucGF0aERlcHRoID0gKHAsIG9wdCkgLT5cbiAgICBcbiAgICByZWwgPSBzbGFzaC5yZWxhdGl2ZSBwLCBvcHQ/LnJlbGF0aXZlVG8gPyBwcm9jZXNzLmN3ZCgpXG4gICAgcmV0dXJuIDAgaWYgcCA9PSAnLidcbiAgICByZWwuc3BsaXQoJy8nKS5sZW5ndGhcblxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG5cbm1haW4gPSAtPlxuICAgIFxuICAgIHBhdGhzdGF0cyA9IGFyZ3MucGF0aHMubWFwIChmKSAtPlxuICAgICAgICB0cnlcbiAgICAgICAgICAgIFtmLCBmcy5zdGF0U3luYyhmKV1cbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICAgIGxvZ19lcnJvciAnbm8gc3VjaCBmaWxlOiAnLCBmXG4gICAgICAgICAgICBbXVxuICAgIFxuICAgIGZpbGVzdGF0cyA9IHBhdGhzdGF0cy5maWx0ZXIoIChmKSAtPiBmLmxlbmd0aCBhbmQgbm90IGZbMV0uaXNEaXJlY3RvcnkoKSApXG4gICAgXG4gICAgaWYgZmlsZXN0YXRzLmxlbmd0aCA+IDBcbiAgICAgICAgbG9nIHJlc2V0XG4gICAgICAgIGxpc3RGaWxlcyBwcm9jZXNzLmN3ZCgpLCBmaWxlc3RhdHMubWFwKCAocykgLT4gc1swXSApXG4gICAgXG4gICAgZm9yIHAgaW4gcGF0aHN0YXRzLmZpbHRlciggKGYpIC0+IGYubGVuZ3RoIGFuZCBmWzFdLmlzRGlyZWN0b3J5KCkgKVxuICAgICAgICBsb2cgJycgaWYgYXJncy50cmVlXG4gICAgICAgIGxpc3REaXIgcFswXSwgcmVsYXRpdmVUbzphcmdzLnRyZWUgYW5kIHNsYXNoLmRpcm5hbWUocFswXSkgb3IgcHJvY2Vzcy5jd2QoKVxuICAgIFxuICAgIGxvZyBcIlwiXG4gICAgaWYgYXJncy5pbmZvXG4gICAgICAgIGxvZyBCVygxKSArIFwiIFwiICtcbiAgICAgICAgZncoOCkgKyBzdGF0cy5udW1fZGlycyArIChzdGF0cy5oaWRkZW5fZGlycyBhbmQgZncoNCkgKyBcIitcIiArIGZ3KDUpICsgKHN0YXRzLmhpZGRlbl9kaXJzKSBvciBcIlwiKSArIGZ3KDQpICsgXCIgZGlycyBcIiArXG4gICAgICAgIGZ3KDgpICsgc3RhdHMubnVtX2ZpbGVzICsgKHN0YXRzLmhpZGRlbl9maWxlcyBhbmQgZncoNCkgKyBcIitcIiArIGZ3KDUpICsgKHN0YXRzLmhpZGRlbl9maWxlcykgb3IgXCJcIikgKyBmdyg0KSArIFwiIGZpbGVzIFwiICtcbiAgICAgICAgZncoOCkgKyB0aW1lKHByb2Nlc3MuaHJ0aW1lLmJpZ2ludD8oKS1zdGFydFRpbWUpICsgXCIgXCIgK1xuICAgICAgICByZXNldFxuICAgIFxuaWYgYXJnc1xuICAgIGluaXRBcmdzKClcbiAgICBtYWluKClcbmVsc2VcbiAgICBtb2R1bGVNYWluID0gKGFyZywgb3B0PXt9KSAtPlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIHR5cGVvZiBhcmdcbiAgICAgICAgICAgIHdoZW4gJ3N0cmluZydcbiAgICAgICAgICAgICAgICBhcmdzID0gT2JqZWN0LmFzc2lnbiB7fSwgb3B0XG4gICAgICAgICAgICAgICAgYXJncy5wYXRocyA/PSBbXVxuICAgICAgICAgICAgICAgIGFyZ3MucGF0aHMucHVzaCBhcmdcbiAgICAgICAgICAgIHdoZW4gJ29iamVjdCdcbiAgICAgICAgICAgICAgICBhcmdzID0gT2JqZWN0LmFzc2lnbiB7fSwgYXJnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXJncyA9IHBhdGhzOlsnLiddXG4gICAgICAgIGluaXRBcmdzKClcbiAgICAgICAgXG4gICAgICAgICMgbG9nICdhcmdzOicsIGFyZ3NcbiAgICAgICAgXG4gICAgICAgIG91dCA9ICcnXG4gICAgICAgIG9sZGxvZyA9IGNvbnNvbGUubG9nXG4gICAgICAgIGNvbnNvbGUubG9nID0gLT4gXG4gICAgICAgICAgICBmb3IgYXJnIGluIGFyZ3VtZW50cyB0aGVuIG91dCArPSBTdHJpbmcoYXJnKVxuICAgICAgICAgICAgb3V0ICs9ICdcXG4nXG4gICAgICAgIFxuICAgICAgICBtYWluKClcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nID0gb2xkbG9nXG4gICAgICAgIG91dFxuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzID0gbW9kdWxlTWFpblxuICAgICJdfQ==
//# sourceURL=../coffee/color-ls.coffee