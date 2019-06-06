// koffee 0.56.0

/*
 0000000   0000000   000       0000000   00000000           000       0000000
000       000   000  000      000   000  000   000          000      000
000       000   000  000      000   000  0000000    000000  000      0000000
000       000   000  000      000   000  000   000          000           000
 0000000   0000000   0000000   0000000   000   000          0000000  0000000
 */
var BG, BW, ansi, args, base1, bold, colors, dirString, dotString, extString, fg, fs, fw, getPrefix, groupMap, groupName, groupname, ignore, initArgs, karg, linkString, listDir, listFiles, log_error, lpad, main, moduleMain, nameString, ownerName, ownerString, pathDepth, ref, reset, rightsString, rpad, rwxString, sizeString, slash, sort, startTime, stats, timeString, token, userMap, username, util,
    indexOf = [].indexOf;

startTime = typeof (base1 = process.hrtime).bigint === "function" ? base1.bigint() : void 0;

ref = require('kxk/js/str'), lpad = ref.lpad, rpad = ref.rpad;

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
    var klog, noon, ref1, ref2, ref3;
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
        ref2 = require('kxk'), klog = ref2.klog, noon = ref2.noon;
        klog(noon.stringify(args, {
            colors: true
        }));
    }
    if (!(((ref3 = args.paths) != null ? ref3.length : void 0) > 0)) {
        return args.paths = ['.'];
    }
};

colors = {
    'coffee': [bold + fg(4, 4, 0), fg(1, 1, 0), fg(1, 1, 0)],
    'koffee': [bold + fg(5, 5, 0), fg(1, 0, 0), fg(1, 0, 0)],
    'py': [bold + fg(0, 2, 0), fg(0, 1, 0), fg(0, 1, 0)],
    'rb': [bold + fg(4, 0, 0), fg(1, 0, 0), fg(1, 0, 0)],
    'json': [bold + fg(4, 0, 4), fg(1, 0, 1), fg(1, 0, 1)],
    'cson': [bold + fg(4, 0, 4), fg(1, 0, 1), fg(1, 0, 1)],
    'noon': [bold + fg(4, 4, 0), fg(1, 1, 0), fg(1, 1, 0)],
    'plist': [bold + fg(4, 0, 4), fg(1, 0, 1), fg(1, 0, 1)],
    'js': [bold + fg(5, 0, 5), fg(1, 0, 1), fg(1, 0, 1)],
    'cpp': [bold + fg(5, 4, 0), fw(1), fg(1, 1, 0)],
    'h': [fg(3, 1, 0), fw(1), fg(1, 1, 0)],
    'pyc': [fw(5), fw(1), fw(1)],
    'log': [fw(5), fw(1), fw(1)],
    'log': [fw(5), fw(1), fw(1)],
    'txt': [fw(20), fw(1), fw(2)],
    'md': [bold + fw(20), fw(1), fw(2)],
    'markdown': [bold + fw(20), fw(1), fw(2)],
    'sh': [bold + fg(5, 1, 0), fg(1, 0, 0), fg(1, 0, 0)],
    'png': [bold + fg(5, 0, 0), fg(1, 0, 0), fg(1, 0, 0)],
    'jpg': [bold + fg(0, 3, 0), fg(0, 1, 0), fg(0, 1, 0)],
    'pxm': [bold + fg(1, 1, 5), fg(0, 0, 1), fg(0, 0, 2)],
    'tiff': [bold + fg(1, 1, 5), fg(0, 0, 1), fg(0, 0, 2)],
    '_default': [fw(15), fw(1), fw(6)],
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
        'r+': bold + BW(1) + fg(1, 1, 1),
        'r-': reset + BW(1),
        'w+': bold + BW(1) + fg(2, 2, 5),
        'w-': reset + BW(1),
        'x+': bold + BW(1) + fg(5, 0, 0),
        'x-': reset + BW(1)
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
    return dotString(ext) + colors[(colors[ext] != null) && ext || '_default'][2] + ext + reset;
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

rwxString = function(mode, i) {
    return (((mode >> (i * 3)) & 0x4) && colors['_rights']['r+'] + ' r' || colors['_rights']['r-'] + '  ') + (((mode >> (i * 3)) & 0x2) && colors['_rights']['w+'] + ' w' || colors['_rights']['w-'] + '  ') + (((mode >> (i * 3)) & 0x1) && colors['_rights']['x+'] + ' x' || colors['_rights']['x-'] + '  ');
};

rightsString = function(stat) {
    var gr, ro, ur;
    ur = rwxString(stat.mode, 2) + " ";
    gr = rwxString(stat.mode, 1) + " ";
    ro = rwxString(stat.mode, 0) + " ";
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
    var base2, filestats, j, kstr, len, p, pathstats, ref1;
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
        kstr = require('kxk/js/str');
        return console.log(BW(1) + " " + fw(8) + stats.num_dirs + (stats.hidden_dirs && fw(4) + "+" + fw(5) + stats.hidden_dirs || "") + fw(4) + " dirs " + fw(8) + stats.num_files + (stats.hidden_files && fw(4) + "+" + fw(5) + stats.hidden_files || "") + fw(4) + " files " + fw(8) + kstr.time((typeof (base2 = process.hrtime).bigint === "function" ? base2.bigint() : void 0) - startTime) + " " + reset);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDJZQUFBO0lBQUE7O0FBUUEsU0FBQSxnRUFBMEIsQ0FBQzs7QUFFM0IsTUFBaUIsT0FBQSxDQUFRLFlBQVIsQ0FBakIsRUFBRSxlQUFGLEVBQVE7O0FBQ1IsRUFBQSxHQUFTLE9BQUEsQ0FBUSxJQUFSOztBQUNULEtBQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLGlCQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFFVCxJQUFBLEdBQVE7O0FBQ1IsS0FBQSxHQUFROztBQUVSLElBQUEsR0FBUzs7QUFDVCxLQUFBLEdBQVMsSUFBSSxDQUFDOztBQUNkLEVBQUEsR0FBUyxJQUFJLENBQUMsRUFBRSxDQUFDOztBQUNqQixFQUFBLEdBQVMsSUFBSSxDQUFDLEVBQUUsQ0FBQzs7QUFDakIsRUFBQSxHQUFTLFNBQUMsQ0FBRDtXQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBVSxDQUFBLENBQUE7QUFBekI7O0FBQ1QsRUFBQSxHQUFTLFNBQUMsQ0FBRDtXQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBVSxDQUFBLENBQUE7QUFBekI7O0FBRVQsS0FBQSxHQUNJO0lBQUEsUUFBQSxFQUFnQixDQUFoQjtJQUNBLFNBQUEsRUFBZ0IsQ0FEaEI7SUFFQSxXQUFBLEVBQWdCLENBRmhCO0lBR0EsWUFBQSxFQUFnQixDQUhoQjtJQUlBLGNBQUEsRUFBZ0IsQ0FKaEI7SUFLQSxjQUFBLEVBQWdCLENBTGhCO0lBTUEsV0FBQSxFQUFnQixFQU5oQjs7O0FBY0osSUFBRyxDQUFJLE1BQU0sQ0FBQyxNQUFYLElBQXFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBZCxLQUFvQixHQUE1QztJQUVJLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjtJQUNQLElBQUEsR0FB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LENBRmxHLEdBRTBHLFNBRjFHLEdBR0osRUFBQSxDQUFHLENBQUgsQ0FISSxHQUdJLElBQUksQ0FBQyxJQUFMLCtEQUF3QixDQUFDLGtCQUFmLEdBQXlCLFNBQW5DLENBSEosR0FHb0QsR0FIcEQsR0FJSixLQUwyQixFQUQvQjs7QUFwQkc7O0FBNEJQLElBQUcsSUFBSDtJQUNJLFFBQUEsQ0FBQTtJQUNBLElBQUEsQ0FBQSxFQUZKO0NBQUEsTUFBQTtJQUlJLFVBQUEsR0FBYSxTQUFDLEdBQUQsRUFBTSxHQUFOO0FBRVQsWUFBQTs7WUFGZSxNQUFJOztBQUVuQixnQkFBTyxPQUFPLEdBQWQ7QUFBQSxpQkFDUyxRQURUO2dCQUVRLElBQUEsR0FBTyxNQUFNLENBQUMsTUFBUCxDQUFjLEVBQWQsRUFBa0IsR0FBbEI7O29CQUNQLElBQUksQ0FBQzs7b0JBQUwsSUFBSSxDQUFDLFFBQVM7O2dCQUNkLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBWCxDQUFnQixHQUFoQjtBQUhDO0FBRFQsaUJBS1MsUUFMVDtnQkFNUSxJQUFBLEdBQU8sTUFBTSxDQUFDLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEdBQWxCO0FBRE47QUFMVDtnQkFRUSxJQUFBLEdBQU87b0JBQUEsS0FBQSxFQUFNLENBQUMsR0FBRCxDQUFOOztBQVJmO1FBU0EsUUFBQSxDQUFBO1FBSUEsR0FBQSxHQUFNO1FBQ04sTUFBQSxHQUFTLE9BQU8sQ0FBQztRQUNqQixPQUFPLENBQUMsR0FBUixHQUFjLFNBQUE7QUFDVixnQkFBQTtBQUFBLGlCQUFBLDJDQUFBOztnQkFBMEIsR0FBQSxJQUFPLE1BQUEsQ0FBTyxHQUFQO0FBQWpDO21CQUNBLEdBQUEsSUFBTztRQUZHO1FBSWQsSUFBQSxDQUFBO1FBRUEsT0FBTyxDQUFDLEdBQVIsR0FBYztlQUNkO0lBeEJTO0lBMEJiLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFdBOUJyQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgICAgMDAwICAgICAgIDAwMDAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgIDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAgICAwMDBcbiAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAgICAgIDAwMDAwMDAgIDAwMDAwMDBcbiMjI1xuXG5zdGFydFRpbWUgPSBwcm9jZXNzLmhydGltZS5iaWdpbnQ/KClcblxueyBscGFkLCBycGFkIH0gPSByZXF1aXJlICdreGsvanMvc3RyJ1xuZnMgICAgID0gcmVxdWlyZSAnZnMnXG5zbGFzaCAgPSByZXF1aXJlICdrc2xhc2gnXG5hbnNpICAgPSByZXF1aXJlICdhbnNpLTI1Ni1jb2xvcnMnXG51dGlsICAgPSByZXF1aXJlICd1dGlsJ1xuXG5hcmdzICA9IG51bGxcbnRva2VuID0ge31cblxuYm9sZCAgID0gJ1xceDFiWzFtJ1xucmVzZXQgID0gYW5zaS5yZXNldFxuZmcgICAgID0gYW5zaS5mZy5nZXRSZ2JcbkJHICAgICA9IGFuc2kuYmcuZ2V0UmdiXG5mdyAgICAgPSAoaSkgLT4gYW5zaS5mZy5ncmF5c2NhbGVbaV1cbkJXICAgICA9IChpKSAtPiBhbnNpLmJnLmdyYXlzY2FsZVtpXVxuXG5zdGF0cyA9ICMgY291bnRlcnMgZm9yIChoaWRkZW4pIGRpcnMvZmlsZXNcbiAgICBudW1fZGlyczogICAgICAgMFxuICAgIG51bV9maWxlczogICAgICAwXG4gICAgaGlkZGVuX2RpcnM6ICAgIDBcbiAgICBoaWRkZW5fZmlsZXM6ICAgMFxuICAgIG1heE93bmVyTGVuZ3RoOiAwXG4gICAgbWF4R3JvdXBMZW5ndGg6IDBcbiAgICBicm9rZW5MaW5rczogICAgW11cblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDBcbiMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgMDAwMCAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbmlmIG5vdCBtb2R1bGUucGFyZW50IG9yIG1vZHVsZS5wYXJlbnQuaWQgPT0gJy4nXG5cbiAgICBrYXJnID0gcmVxdWlyZSAna2FyZydcbiAgICBhcmdzID0ga2FyZyBcIlwiXCJcbiAgICBjb2xvci1sc1xuICAgICAgICBwYXRocyAgICAgICAgIC4gPyB0aGUgZmlsZShzKSBhbmQvb3IgZm9sZGVyKHMpIHRvIGRpc3BsYXkgLiAqKlxuICAgICAgICBhbGwgICAgICAgICAgIC4gPyBzaG93IGRvdCBmaWxlcyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBkaXJzICAgICAgICAgIC4gPyBzaG93IG9ubHkgZGlycyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBmaWxlcyAgICAgICAgIC4gPyBzaG93IG9ubHkgZmlsZXMgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBieXRlcyAgICAgICAgIC4gPyBpbmNsdWRlIHNpemUgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBtZGF0ZSAgICAgICAgIC4gPyBpbmNsdWRlIG1vZGlmaWNhdGlvbiBkYXRlICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBsb25nICAgICAgICAgIC4gPyBpbmNsdWRlIHNpemUgYW5kIGRhdGUgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBvd25lciAgICAgICAgIC4gPyBpbmNsdWRlIG93bmVyIGFuZCBncm91cCAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICByaWdodHMgICAgICAgIC4gPyBpbmNsdWRlIHJpZ2h0cyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBzaXplICAgICAgICAgIC4gPyBzb3J0IGJ5IHNpemUgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICB0aW1lICAgICAgICAgIC4gPyBzb3J0IGJ5IHRpbWUgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBraW5kICAgICAgICAgIC4gPyBzb3J0IGJ5IGtpbmQgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBuZXJkeSAgICAgICAgIC4gPyB1c2UgbmVyZCBmb250IGljb25zICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBwcmV0dHkgICAgICAgIC4gPyBwcmV0dHkgc2l6ZSBhbmQgYWdlICAgICAgICAgICAgIC4gPSB0cnVlXG4gICAgICAgIGlnbm9yZSAgICAgICAgLiA/IGRvbid0IHJlY3Vyc2UgaW50byAgICAgICAgICAgICAgLiA9IG5vZGVfbW9kdWxlc1xuICAgICAgICBpbmZvICAgICAgICAgIC4gPyBzaG93IHN0YXRpc3RpY3MgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gSVxuICAgICAgICBhbHBoYWJldGljYWwgIC4gPyBkb24ndCBncm91cCBkaXJzIGJlZm9yZSBmaWxlcyAgIC4gPSBmYWxzZSAuIC0gQVxuICAgICAgICBvZmZzZXQgICAgICAgIC4gPyBpbmRlbnQgc2hvcnQgbGlzdGluZ3MgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gT1xuICAgICAgICByZWN1cnNlICAgICAgIC4gPyByZWN1cnNlIGludG8gc3ViZGlycyAgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gUlxuICAgICAgICB0cmVlICAgICAgICAgIC4gPyByZWN1cnNlIGFuZCBpbmRlbnQgICAgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gVFxuICAgICAgICBkZXB0aCAgICAgICAgIC4gPyByZWN1cnNpb24gZGVwdGggICAgICAgICAgICAgICAgIC4gPSDiiJ4gICAgIC4gLSBEXG4gICAgICAgIGZpbmQgICAgICAgICAgLiA/IGZpbHRlciB3aXRoIGEgcmVnZXhwICAgICAgICAgICAgICAgICAgICAgIC4gLSBGXG4gICAgICAgIGRlYnVnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBYXG4gICAgXG4gICAgdmVyc2lvbiAgICAgICN7cmVxdWlyZShcIiN7X19kaXJuYW1lfS8uLi9wYWNrYWdlLmpzb25cIikudmVyc2lvbn1cbiAgICBcIlwiXCJcbiAgICBcbmluaXRBcmdzID0gLT5cbiAgICBcbiAgICBpZiBhcmdzLnNpemVcbiAgICAgICAgYXJncy5maWxlcyA9IHRydWVcbiAgICBcbiAgICBpZiBhcmdzLmxvbmdcbiAgICAgICAgYXJncy5ieXRlcyA9IHRydWVcbiAgICAgICAgYXJncy5tZGF0ZSA9IHRydWVcbiAgICAgICAgXG4gICAgaWYgYXJncy50cmVlXG4gICAgICAgIGFyZ3MucmVjdXJzZSA9IHRydWVcbiAgICAgICAgYXJncy5vZmZzZXQgID0gZmFsc2VcbiAgICBcbiAgICBpZiBhcmdzLmRpcnMgYW5kIGFyZ3MuZmlsZXNcbiAgICAgICAgYXJncy5kaXJzID0gYXJncy5maWxlcyA9IGZhbHNlXG4gICAgICAgIFxuICAgIGlmIGFyZ3MuaWdub3JlPy5sZW5ndGhcbiAgICAgICAgYXJncy5pZ25vcmUgPSBhcmdzLmlnbm9yZS5zcGxpdCAnICcgXG4gICAgZWxzZVxuICAgICAgICBhcmdzLmlnbm9yZSA9IFtdXG4gICAgICAgIFxuICAgIGlmIGFyZ3MuZGVwdGggPT0gJ+KInicgdGhlbiBhcmdzLmRlcHRoID0gSW5maW5pdHlcbiAgICBlbHNlIGFyZ3MuZGVwdGggPSBNYXRoLm1heCAwLCBwYXJzZUludCBhcmdzLmRlcHRoXG4gICAgaWYgTnVtYmVyLmlzTmFOIGFyZ3MuZGVwdGggdGhlbiBhcmdzLmRlcHRoID0gMFxuICAgICAgICBcbiAgICBpZiBhcmdzLmRlYnVnXG4gICAgICAgIHsga2xvZywgbm9vbiB9ID0gcmVxdWlyZSAna3hrJ1xuICAgICAgICBrbG9nIG5vb24uc3RyaW5naWZ5IGFyZ3MsIGNvbG9yczp0cnVlXG4gICAgXG4gICAgYXJncy5wYXRocyA9IFsnLiddIHVubGVzcyBhcmdzLnBhdGhzPy5sZW5ndGggPiAwXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbmNvbG9ycyA9XG4gICAgJ2NvZmZlZSc6ICAgWyBib2xkK2ZnKDQsNCwwKSwgIGZnKDEsMSwwKSwgZmcoMSwxLDApIF1cbiAgICAna29mZmVlJzogICBbIGJvbGQrZmcoNSw1LDApLCAgZmcoMSwwLDApLCBmZygxLDAsMCkgXVxuICAgICdweSc6ICAgICAgIFsgYm9sZCtmZygwLDIsMCksICBmZygwLDEsMCksIGZnKDAsMSwwKSBdXG4gICAgJ3JiJzogICAgICAgWyBib2xkK2ZnKDQsMCwwKSwgIGZnKDEsMCwwKSwgZmcoMSwwLDApIF1cbiAgICAnanNvbic6ICAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygxLDAsMSkgXVxuICAgICdjc29uJzogICAgIFsgYm9sZCtmZyg0LDAsNCksICBmZygxLDAsMSksIGZnKDEsMCwxKSBdXG4gICAgJ25vb24nOiAgICAgWyBib2xkK2ZnKDQsNCwwKSwgIGZnKDEsMSwwKSwgZmcoMSwxLDApIF1cbiAgICAncGxpc3QnOiAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygxLDAsMSkgXVxuICAgICdqcyc6ICAgICAgIFsgYm9sZCtmZyg1LDAsNSksICBmZygxLDAsMSksIGZnKDEsMCwxKSBdXG4gICAgJ2NwcCc6ICAgICAgWyBib2xkK2ZnKDUsNCwwKSwgIGZ3KDEpLCAgICAgZmcoMSwxLDApIF1cbiAgICAnaCc6ICAgICAgICBbICAgICAgZmcoMywxLDApLCAgZncoMSksICAgICBmZygxLDEsMCkgXVxuICAgICdweWMnOiAgICAgIFsgICAgICBmdyg1KSwgICAgICBmdygxKSwgICAgIGZ3KDEpIF1cbiAgICAnbG9nJzogICAgICBbICAgICAgZncoNSksICAgICAgZncoMSksICAgICBmdygxKSBdXG4gICAgJ2xvZyc6ICAgICAgWyAgICAgIGZ3KDUpLCAgICAgIGZ3KDEpLCAgICAgZncoMSkgXVxuICAgICd0eHQnOiAgICAgIFsgICAgICBmdygyMCksICAgICBmdygxKSwgICAgIGZ3KDIpIF1cbiAgICAnbWQnOiAgICAgICBbIGJvbGQrZncoMjApLCAgICAgZncoMSksICAgICBmdygyKSBdXG4gICAgJ21hcmtkb3duJzogWyBib2xkK2Z3KDIwKSwgICAgIGZ3KDEpLCAgICAgZncoMikgXVxuICAgICdzaCc6ICAgICAgIFsgYm9sZCtmZyg1LDEsMCksICBmZygxLDAsMCksIGZnKDEsMCwwKSBdXG4gICAgJ3BuZyc6ICAgICAgWyBib2xkK2ZnKDUsMCwwKSwgIGZnKDEsMCwwKSwgZmcoMSwwLDApIF1cbiAgICAnanBnJzogICAgICBbIGJvbGQrZmcoMCwzLDApLCAgZmcoMCwxLDApLCBmZygwLDEsMCkgXVxuICAgICdweG0nOiAgICAgIFsgYm9sZCtmZygxLDEsNSksICBmZygwLDAsMSksIGZnKDAsMCwyKSBdXG4gICAgJ3RpZmYnOiAgICAgWyBib2xkK2ZnKDEsMSw1KSwgIGZnKDAsMCwxKSwgZmcoMCwwLDIpIF1cblxuICAgICdfZGVmYXVsdCc6IFsgICAgICBmdygxNSksICAgICBmdygxKSwgICAgIGZ3KDYpIF1cbiAgICAnX2Rpcic6ICAgICBbIGJvbGQrQkcoMCwwLDIpK2Z3KDIzKSwgZmcoMSwxLDUpLCBib2xkK0JHKDAsMCwyKStmZygyLDIsNSkgXVxuICAgICdfLmRpcic6ICAgIFsgYm9sZCtCRygwLDAsMSkrZncoMjMpLCBib2xkK0JHKDAsMCwxKStmZygxLDEsNSksIGJvbGQrQkcoMCwwLDEpK2ZnKDIsMiw1KSBdXG4gICAgJ19saW5rJzogICAgeyAnYXJyb3cnOiBmZygxLDAsMSksICdwYXRoJzogZmcoNCwwLDQpLCAnYnJva2VuJzogQkcoNSwwLDApK2ZnKDUsNSwwKSB9XG4gICAgJ19hcnJvdyc6ICAgICBCVygyKStmdygwKVxuICAgICdfaGVhZGVyJzogIFsgYm9sZCtCVygyKStmZygzLDIsMCksICBmdyg0KSwgYm9sZCtCVygyKStmZyg1LDUsMCkgXVxuICAgICdfc2l6ZSc6ICAgIHsgYjogW2ZnKDAsMCwzKV0sIGtCOiBbZmcoMCwwLDUpLCBmZygwLDAsMyldLCBNQjogW2ZnKDEsMSw1KSwgZmcoMCwwLDUpXSwgR0I6IFtmZyg0LDQsNSksIGZnKDIsMiw1KV0sIFRCOiBbZmcoNCw0LDUpLCBmZygyLDIsNSldIH1cbiAgICAnX3VzZXJzJzogICB7IHJvb3Q6ICBmZygzLDAsMCksIGRlZmF1bHQ6IGZnKDEsMCwxKSB9XG4gICAgJ19ncm91cHMnOiAgeyB3aGVlbDogZmcoMSwwLDApLCBzdGFmZjogZmcoMCwxLDApLCBhZG1pbjogZmcoMSwxLDApLCBkZWZhdWx0OiBmZygxLDAsMSkgfVxuICAgICdfZXJyb3InOiAgIFsgYm9sZCtCRyg1LDAsMCkrZmcoNSw1LDApLCBib2xkK0JHKDUsMCwwKStmZyg1LDUsNSkgXVxuICAgICdfcmlnaHRzJzpcbiAgICAgICAgICAgICAgICAgICdyKyc6IGJvbGQrQlcoMSkrZmcoMSwxLDEpXG4gICAgICAgICAgICAgICAgICAnci0nOiByZXNldCtCVygxKVxuICAgICAgICAgICAgICAgICAgJ3crJzogYm9sZCtCVygxKStmZygyLDIsNSlcbiAgICAgICAgICAgICAgICAgICd3LSc6IHJlc2V0K0JXKDEpXG4gICAgICAgICAgICAgICAgICAneCsnOiBib2xkK0JXKDEpK2ZnKDUsMCwwKVxuICAgICAgICAgICAgICAgICAgJ3gtJzogcmVzZXQrQlcoMSlcblxudXNlck1hcCA9IHt9XG51c2VybmFtZSA9ICh1aWQpIC0+XG4gICAgaWYgbm90IHVzZXJNYXBbdWlkXVxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG4gICAgICAgICAgICB1c2VyTWFwW3VpZF0gPSBjaGlsZHAuc3Bhd25TeW5jKFwiaWRcIiwgW1wiLXVuXCIsIFwiI3t1aWR9XCJdKS5zdGRvdXQudG9TdHJpbmcoJ3V0ZjgnKS50cmltKClcbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgbG9nIGVcbiAgICB1c2VyTWFwW3VpZF1cblxuZ3JvdXBNYXAgPSBudWxsXG5ncm91cG5hbWUgPSAoZ2lkKSAtPlxuICAgIGlmIG5vdCBncm91cE1hcFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG4gICAgICAgICAgICBnaWRzID0gY2hpbGRwLnNwYXduU3luYyhcImlkXCIsIFtcIi1HXCJdKS5zdGRvdXQudG9TdHJpbmcoJ3V0ZjgnKS5zcGxpdCgnICcpXG4gICAgICAgICAgICBnbm1zID0gY2hpbGRwLnNwYXduU3luYyhcImlkXCIsIFtcIi1HblwiXSkuc3Rkb3V0LnRvU3RyaW5nKCd1dGY4Jykuc3BsaXQoJyAnKVxuICAgICAgICAgICAgZ3JvdXBNYXAgPSB7fVxuICAgICAgICAgICAgZm9yIGkgaW4gWzAuLi5naWRzLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBncm91cE1hcFtnaWRzW2ldXSA9IGdubXNbaV1cbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgbG9nIGVcbiAgICBncm91cE1hcFtnaWRdXG5cbmlmICdmdW5jdGlvbicgPT0gdHlwZW9mIHByb2Nlc3MuZ2V0dWlkXG4gICAgY29sb3JzWydfdXNlcnMnXVt1c2VybmFtZShwcm9jZXNzLmdldHVpZCgpKV0gPSBmZygwLDQsMClcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG5sb2dfZXJyb3IgPSAoKSAtPlxuICAgIFxuICAgIGxvZyBcIiBcIiArIGNvbG9yc1snX2Vycm9yJ11bMF0gKyBcIiBcIiArIGJvbGQgKyBhcmd1bWVudHNbMF0gKyAoYXJndW1lbnRzLmxlbmd0aCA+IDEgYW5kIChjb2xvcnNbJ19lcnJvciddWzFdICsgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpLnNsaWNlKDEpLmpvaW4oJyAnKSkgb3IgJycpICsgXCIgXCIgKyByZXNldFxuXG5saW5rU3RyaW5nID0gKGZpbGUpIC0+IFxuICAgIFxuICAgIHMgID0gcmVzZXQgKyBmdygxKSArIGNvbG9yc1snX2xpbmsnXVsnYXJyb3cnXSArIFwiIOKWuiBcIiBcbiAgICBzICs9IGNvbG9yc1snX2xpbmsnXVsoZmlsZSBpbiBzdGF0cy5icm9rZW5MaW5rcykgYW5kICdicm9rZW4nIG9yICdwYXRoJ10gXG4gICAgdHJ5XG4gICAgICAgIHMgKz0gc2xhc2gucGF0aCBmcy5yZWFkbGlua1N5bmMoZmlsZSlcbiAgICBjYXRjaCBlcnJcbiAgICAgICAgcyArPSAnID8gJ1xuICAgIHNcblxubmFtZVN0cmluZyA9IChuYW1lLCBleHQpIC0+IFxuICAgIFxuICAgIGlmIGFyZ3MubmVyZHlcbiAgICAgICAgaWNvbnMgPSByZXF1aXJlICcuL2ljb25zJ1xuICAgICAgICBpY29uID0gKGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVsyXSArIChpY29ucy5nZXQobmFtZSwgZXh0KSA/ICcgJykpICsgJyAnXG4gICAgZWxzZVxuICAgICAgICBpY29uID0gJydcbiAgICBcIiBcIiArIGljb24gKyBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMF0gKyBuYW1lICsgcmVzZXRcbiAgICBcbmRvdFN0cmluZyAgPSAoZXh0KSAtPiBcbiAgICBcbiAgICBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMV0gKyBcIi5cIiArIHJlc2V0XG4gICAgXG5leHRTdHJpbmcgID0gKG5hbWUsIGV4dCkgLT4gXG4gICAgXG4gICAgaWYgYXJncy5uZXJkeSBhbmQgbmFtZSBcbiAgICAgICAgaWNvbnMgPSByZXF1aXJlICcuL2ljb25zJ1xuICAgICAgICBpZiBpY29ucy5nZXQobmFtZSwgZXh0KSB0aGVuIHJldHVybiAnJ1xuICAgIGRvdFN0cmluZyhleHQpICsgY29sb3JzW2NvbG9yc1tleHRdPyBhbmQgZXh0IG9yICdfZGVmYXVsdCddWzJdICsgZXh0ICsgcmVzZXRcbiAgICBcbmRpclN0cmluZyAgPSAobmFtZSwgZXh0KSAtPlxuICAgIFxuICAgIGMgPSBuYW1lIGFuZCAnX2Rpcicgb3IgJ18uZGlyJ1xuICAgIGljb24gPSBhcmdzLm5lcmR5IGFuZCBjb2xvcnNbY11bMl0gKyAnIFxcdWY0MTMnIG9yICcnXG4gICAgaWNvbiArIGNvbG9yc1tjXVswXSArIChuYW1lIGFuZCAoXCIgXCIgKyBuYW1lKSBvciBcIiBcIikgKyAoaWYgZXh0IHRoZW4gY29sb3JzW2NdWzFdICsgJy4nICsgY29sb3JzW2NdWzJdICsgZXh0IGVsc2UgXCJcIikgKyBcIiBcIlxuXG5zaXplU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgaWYgYXJncy5wcmV0dHkgYW5kIHN0YXQuc2l6ZSA9PSAwXG4gICAgICAgIHJldHVybiBscGFkKCcgJywgMTEpXG4gICAgaWYgc3RhdC5zaXplIDwgMTAwMFxuICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ2InXVswXSArIGxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2UgaWYgc3RhdC5zaXplIDwgMTAwMDAwMFxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydrQiddWzBdICsgbHBhZCgoc3RhdC5zaXplIC8gMTAwMCkudG9GaXhlZCgwKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsna0InXVsxXSArIFwia0IgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydrQiddWzBdICsgbHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZSBpZiBzdGF0LnNpemUgPCAxMDAwMDAwMDAwXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ01CJ11bMF0gKyBscGFkKChzdGF0LnNpemUgLyAxMDAwMDAwKS50b0ZpeGVkKDEpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydNQiddWzFdICsgXCJNQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ01CJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlIGlmIHN0YXQuc2l6ZSA8IDEwMDAwMDAwMDAwMDBcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnR0InXVswXSArIGxwYWQoKHN0YXQuc2l6ZSAvIDEwMDAwMDAwMDApLnRvRml4ZWQoMSksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMV0gKyBcIkdCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnR0InXVswXSArIGxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2VcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnVEInXVswXSArIGxwYWQoKHN0YXQuc2l6ZSAvIDEwMDAwMDAwMDAwMDApLnRvRml4ZWQoMyksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMV0gKyBcIlRCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnVEInXVswXSArIGxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuXG50aW1lU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgbW9tZW50ID0gcmVxdWlyZSAnbW9tZW50J1xuICAgIHQgPSBtb21lbnQoc3RhdC5tdGltZSlcbiAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICBhZ2UgPSBtb21lbnQoKS50byh0LCB0cnVlKVxuICAgICAgICBbbnVtLCByYW5nZV0gPSBhZ2Uuc3BsaXQgJyAnXG4gICAgICAgIG51bSA9ICcxJyBpZiBudW1bMF0gPT0gJ2EnXG4gICAgICAgIGlmIHJhbmdlID09ICdmZXcnXG4gICAgICAgICAgICBudW0gPSBtb21lbnQoKS5kaWZmIHQsICdzZWNvbmRzJ1xuICAgICAgICAgICAgcmFuZ2UgPSAnc2Vjb25kcydcbiAgICAgICAgICAgIGZ3KDIzKSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDE2KSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2UgaWYgcmFuZ2Uuc3RhcnRzV2l0aCAneWVhcidcbiAgICAgICAgICAgIGZ3KDYpICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoMykgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ21vbnRoJ1xuICAgICAgICAgICAgZncoOCkgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdyg0KSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2UgaWYgcmFuZ2Uuc3RhcnRzV2l0aCAnZGF5J1xuICAgICAgICAgICAgZncoMTApICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoNikgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ2hvdXInXG4gICAgICAgICAgICBmdygxNSkgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdyg4KSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZ3KDE4KSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDEyKSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgZWxzZVxuICAgICAgICBmdygxNikgKyBscGFkKHQuZm9ybWF0KFwiRERcIiksMikgKyBmdyg3KSsnLicgK1xuICAgICAgICBmdygxMikgKyB0LmZvcm1hdChcIk1NXCIpICsgZncoNykrXCIuXCIgK1xuICAgICAgICBmdyggOCkgKyB0LmZvcm1hdChcIllZXCIpICsgJyAnICtcbiAgICAgICAgZncoMTYpICsgdC5mb3JtYXQoXCJISFwiKSArIGNvbCA9IGZ3KDcpKyc6JyArXG4gICAgICAgIGZ3KDE0KSArIHQuZm9ybWF0KFwibW1cIikgKyBjb2wgPSBmdygxKSsnOicgK1xuICAgICAgICBmdyggNCkgKyB0LmZvcm1hdChcInNzXCIpICsgJyAnXG5cbm93bmVyTmFtZSA9IChzdGF0KSAtPlxuICAgIFxuICAgIHRyeVxuICAgICAgICB1c2VybmFtZSBzdGF0LnVpZFxuICAgIGNhdGNoXG4gICAgICAgIHN0YXQudWlkXG5cbmdyb3VwTmFtZSA9IChzdGF0KSAtPlxuICAgIFxuICAgIHRyeVxuICAgICAgICBncm91cG5hbWUgc3RhdC5naWRcbiAgICBjYXRjaFxuICAgICAgICBzdGF0LmdpZFxuXG5vd25lclN0cmluZyA9IChzdGF0KSAtPlxuICAgIFxuICAgIG93biA9IG93bmVyTmFtZShzdGF0KVxuICAgIGdycCA9IGdyb3VwTmFtZShzdGF0KVxuICAgIG9jbCA9IGNvbG9yc1snX3VzZXJzJ11bb3duXVxuICAgIG9jbCA9IGNvbG9yc1snX3VzZXJzJ11bJ2RlZmF1bHQnXSB1bmxlc3Mgb2NsXG4gICAgZ2NsID0gY29sb3JzWydfZ3JvdXBzJ11bZ3JwXVxuICAgIGdjbCA9IGNvbG9yc1snX2dyb3VwcyddWydkZWZhdWx0J10gdW5sZXNzIGdjbFxuICAgIG9jbCArIHJwYWQob3duLCBzdGF0cy5tYXhPd25lckxlbmd0aCkgKyBcIiBcIiArIGdjbCArIHJwYWQoZ3JwLCBzdGF0cy5tYXhHcm91cExlbmd0aClcblxucnd4U3RyaW5nID0gKG1vZGUsIGkpIC0+XG4gICAgXG4gICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjEwMCkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWydyKyddICsgJyByJyBvciBjb2xvcnNbJ19yaWdodHMnXVsnci0nXSArICcgICcpICtcbiAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDEwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3crJ10gKyAnIHcnIG9yIGNvbG9yc1snX3JpZ2h0cyddWyd3LSddICsgJyAgJykgK1xuICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIwMDEpIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsneCsnXSArICcgeCcgb3IgY29sb3JzWydfcmlnaHRzJ11bJ3gtJ10gKyAnICAnKVxuXG5yaWdodHNTdHJpbmcgPSAoc3RhdCkgLT5cbiAgICBcbiAgICB1ciA9IHJ3eFN0cmluZyhzdGF0Lm1vZGUsIDIpICsgXCIgXCJcbiAgICBnciA9IHJ3eFN0cmluZyhzdGF0Lm1vZGUsIDEpICsgXCIgXCJcbiAgICBybyA9IHJ3eFN0cmluZyhzdGF0Lm1vZGUsIDApICsgXCIgXCJcbiAgICB1ciArIGdyICsgcm8gKyByZXNldFxuXG5nZXRQcmVmaXggPSAoc3RhdCwgZGVwdGgpIC0+XG4gICAgXG4gICAgcyA9ICcnXG4gICAgaWYgYXJncy5yaWdodHNcbiAgICAgICAgcyArPSByaWdodHNTdHJpbmcgc3RhdFxuICAgICAgICBzICs9IFwiIFwiXG4gICAgaWYgYXJncy5vd25lclxuICAgICAgICBzICs9IG93bmVyU3RyaW5nIHN0YXRcbiAgICAgICAgcyArPSBcIiBcIlxuICAgIGlmIGFyZ3MuYnl0ZXNcbiAgICAgICAgcyArPSBzaXplU3RyaW5nIHN0YXRcbiAgICBpZiBhcmdzLm1kYXRlXG4gICAgICAgIHMgKz0gdGltZVN0cmluZyBzdGF0XG4gICAgICAgIFxuICAgIGlmIGRlcHRoIGFuZCBhcmdzLnRyZWVcbiAgICAgICAgcyArPSBycGFkICcnLCBkZXB0aCo0XG4gICAgICAgIFxuICAgIGlmIHMubGVuZ3RoID09IDAgYW5kIGFyZ3Mub2Zmc2V0XG4gICAgICAgIHMgKz0gJyAgICAgICAnXG4gICAgc1xuICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMFxuXG5zb3J0ID0gKGxpc3QsIHN0YXRzLCBleHRzPVtdKSAtPlxuICAgIFxuICAgIF8gPSByZXF1aXJlICdsb2Rhc2gnXG4gICAgbW9tZW50ID0gcmVxdWlyZSAnbW9tZW50J1xuICAgIFxuICAgIGwgPSBfLnppcCBsaXN0LCBzdGF0cywgWzAuLi5saXN0Lmxlbmd0aF0sIChleHRzLmxlbmd0aCA+IDAgYW5kIGV4dHMgb3IgWzAuLi5saXN0Lmxlbmd0aF0pXG4gICAgXG4gICAgaWYgYXJncy5raW5kXG4gICAgICAgIGlmIGV4dHMgPT0gW10gdGhlbiByZXR1cm4gbGlzdFxuICAgICAgICBsLnNvcnQoKGEsYikgLT5cbiAgICAgICAgICAgIGlmIGFbM10gPiBiWzNdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIGlmIGFbM10gPCBiWzNdIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhcmdzLnRpbWVcbiAgICAgICAgICAgICAgICBtID0gbW9tZW50KGFbMV0ubXRpbWUpXG4gICAgICAgICAgICAgICAgaWYgbS5pc0FmdGVyKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBpZiBtLmlzQmVmb3JlKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhcmdzLnNpemVcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPiBiWzFdLnNpemUgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA8IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYVsyXSA+IGJbMl0gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgLTEpXG4gICAgZWxzZSBpZiBhcmdzLnRpbWVcbiAgICAgICAgbC5zb3J0KChhLGIpIC0+XG4gICAgICAgICAgICBtID0gbW9tZW50KGFbMV0ubXRpbWUpXG4gICAgICAgICAgICBpZiBtLmlzQWZ0ZXIoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgaWYgbS5pc0JlZm9yZShiWzFdLm10aW1lKSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYXJncy5zaXplXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplID4gYlsxXS5zaXplIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPCBiWzFdLnNpemUgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFbMl0gPiBiWzJdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIC0xKVxuICAgIGVsc2UgaWYgYXJncy5zaXplXG4gICAgICAgIGwuc29ydCgoYSxiKSAtPlxuICAgICAgICAgICAgaWYgYVsxXS5zaXplID4gYlsxXS5zaXplIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA8IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYVsyXSA+IGJbMl0gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgLTEpXG4gICAgXy51bnppcChsKVswXVxuXG4jIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgXG4jIDAwMCAgMDAwICAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgMDAwICAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG5cbmlnbm9yZSA9IChwKSAtPlxuICAgIFxuICAgIGJhc2UgPSBzbGFzaC5iYXNlbmFtZSBwXG4gICAgcmV0dXJuIHRydWUgaWYgYmFzZVswXSA9PSAnJCdcbiAgICByZXR1cm4gdHJ1ZSBpZiBiYXNlID09ICdkZXNrdG9wLmluaScgICAgXG4gICAgcmV0dXJuIHRydWUgaWYgYmFzZS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGggJ250dXNlcidcbiAgICBmYWxzZVxuICAgIFxuIyAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMFxuIyAwMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDBcblxubGlzdEZpbGVzID0gKHAsIGZpbGVzLCBkZXB0aCkgLT5cbiAgICBcbiAgICBhbHBoID0gW10gaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICBkaXJzID0gW10gIyB2aXNpYmxlIGRpcnNcbiAgICBmaWxzID0gW10gIyB2aXNpYmxlIGZpbGVzXG4gICAgZHN0cyA9IFtdICMgZGlyIHN0YXRzXG4gICAgZnN0cyA9IFtdICMgZmlsZSBzdGF0c1xuICAgIGV4dHMgPSBbXSAjIGZpbGUgZXh0ZW5zaW9uc1xuXG4gICAgaWYgYXJncy5vd25lclxuICAgICAgICBcbiAgICAgICAgZmlsZXMuZm9yRWFjaCAocnApIC0+XG4gICAgICAgICAgICBpZiBzbGFzaC5pc0Fic29sdXRlIHJwXG4gICAgICAgICAgICAgICAgZmlsZSA9IHNsYXNoLnJlc29sdmUgcnBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmaWxlICA9IHNsYXNoLmpvaW4gcCwgcnBcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIHN0YXQgPSBmcy5sc3RhdFN5bmMoZmlsZSlcbiAgICAgICAgICAgICAgICBvbCA9IG93bmVyTmFtZShzdGF0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICBnbCA9IGdyb3VwTmFtZShzdGF0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICBpZiBvbCA+IHN0YXRzLm1heE93bmVyTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm1heE93bmVyTGVuZ3RoID0gb2xcbiAgICAgICAgICAgICAgICBpZiBnbCA+IHN0YXRzLm1heEdyb3VwTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm1heEdyb3VwTGVuZ3RoID0gZ2xcbiAgICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICBmaWxlcy5mb3JFYWNoIChycCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLmlzQWJzb2x1dGUgcnBcbiAgICAgICAgICAgIGZpbGUgID0gc2xhc2gucmVzb2x2ZSBycFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmaWxlICA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBwLCBycFxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBpZ25vcmUgcnBcbiAgICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgbHN0YXQgPSBmcy5sc3RhdFN5bmMgZmlsZVxuICAgICAgICAgICAgbGluayAgPSBsc3RhdC5pc1N5bWJvbGljTGluaygpXG4gICAgICAgICAgICBzdGF0ICA9IGxpbmsgYW5kIGZzLnN0YXRTeW5jKGZpbGUpIG9yIGxzdGF0XG4gICAgICAgIGNhdGNoIGVyclxuICAgICAgICAgICAgaWYgbGlua1xuICAgICAgICAgICAgICAgIHN0YXQgPSBsc3RhdFxuICAgICAgICAgICAgICAgIHN0YXRzLmJyb2tlbkxpbmtzLnB1c2ggZmlsZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICMgbG9nX2Vycm9yIFwiY2FuJ3QgcmVhZCBmaWxlOiBcIiwgZmlsZSwgbGlua1xuICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGV4dCAgPSBzbGFzaC5leHQgZmlsZVxuICAgICAgICBuYW1lID0gc2xhc2guYmFzZSBmaWxlXG4gICAgICAgIFxuICAgICAgICBpZiBuYW1lWzBdID09ICcuJ1xuICAgICAgICAgICAgZXh0ID0gbmFtZS5zdWJzdHIoMSkgKyBzbGFzaC5leHRuYW1lIGZpbGVcbiAgICAgICAgICAgIG5hbWUgPSAnJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIG5hbWUubGVuZ3RoIGFuZCBuYW1lW25hbWUubGVuZ3RoLTFdICE9ICdcXHInIG9yIGFyZ3MuYWxsXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHMgPSBnZXRQcmVmaXggc3RhdCwgZGVwdGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICAgIGlmIG5vdCBhcmdzLmZpbGVzXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBhcmdzLnRyZWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5hbWUuc3RhcnRzV2l0aCAnLi8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVbMi4uXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGRpclN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzICs9IGxpbmtTdHJpbmcgZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlycy5wdXNoIHMrcmVzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGFscGgucHVzaCBzK3Jlc2V0IGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgICAgICAgICAgICAgIGRzdHMucHVzaCBzdGF0XG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm51bV9kaXJzICs9IDFcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9kaXJzICs9IDFcbiAgICAgICAgICAgIGVsc2UgIyBpZiBwYXRoIGlzIGZpbGVcbiAgICAgICAgICAgICAgICBpZiBub3QgYXJncy5kaXJzXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gbmFtZVN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGV4dFN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgbGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBsaW5rU3RyaW5nIGZpbGVcbiAgICAgICAgICAgICAgICAgICAgZmlscy5wdXNoIHMrcmVzZXRcbiAgICAgICAgICAgICAgICAgICAgYWxwaC5wdXNoIHMrcmVzZXQgaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICAgICAgICAgICAgICAgICAgZnN0cy5wdXNoIHN0YXRcbiAgICAgICAgICAgICAgICAgICAgZXh0cy5wdXNoIGV4dFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5udW1fZmlsZXMgKz0gMVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMuaGlkZGVuX2ZpbGVzICs9IDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgc3RhdC5pc0ZpbGUoKVxuICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9maWxlcyArPSAxXG4gICAgICAgICAgICBlbHNlIGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9kaXJzICs9IDFcblxuICAgIGlmIGFyZ3Muc2l6ZSBvciBhcmdzLmtpbmQgb3IgYXJncy50aW1lXG4gICAgICAgIGlmIGRpcnMubGVuZ3RoIGFuZCBub3QgYXJncy5maWxlc1xuICAgICAgICAgICAgZGlycyA9IHNvcnQgZGlycywgZHN0c1xuICAgICAgICBpZiBmaWxzLmxlbmd0aFxuICAgICAgICAgICAgZmlscyA9IHNvcnQgZmlscywgZnN0cywgZXh0c1xuXG4gICAgaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICAgICAgbG9nIHAgZm9yIHAgaW4gYWxwaFxuICAgIGVsc2VcbiAgICAgICAgbG9nIGQgZm9yIGQgaW4gZGlyc1xuICAgICAgICBsb2cgZiBmb3IgZiBpbiBmaWxzXG5cbiMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwXG5cbmxpc3REaXIgPSAocCwgb3B0PXt9KSAtPlxuICAgICAgICAgICAgXG4gICAgaWYgYXJncy5yZWN1cnNlXG4gICAgICAgIGRlcHRoID0gcGF0aERlcHRoIHAsIG9wdFxuICAgICAgICByZXR1cm4gaWYgZGVwdGggPiBhcmdzLmRlcHRoXG4gICAgXG4gICAgcHMgPSBwXG5cbiAgICB0cnlcbiAgICAgICAgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhwKVxuICAgIGNhdGNoIGVyclxuICAgICAgICB0cnVlXG5cbiAgICBpZiBhcmdzLmZpbmRcbiAgICAgICAgZmlsZXMgPSBmaWxlcy5maWx0ZXIgKGYpIC0+XG4gICAgICAgICAgICBmIGlmIFJlZ0V4cChhcmdzLmZpbmQpLnRlc3QgZlxuICAgICAgICAgICAgXG4gICAgaWYgYXJncy5maW5kIGFuZCBub3QgZmlsZXM/Lmxlbmd0aFxuICAgICAgICB0cnVlXG4gICAgZWxzZSBpZiBhcmdzLnBhdGhzLmxlbmd0aCA9PSAxIGFuZCBhcmdzLnBhdGhzWzBdID09ICcuJyBhbmQgbm90IGFyZ3MucmVjdXJzZVxuICAgICAgICBsb2cgcmVzZXRcbiAgICBlbHNlIGlmIGFyZ3MudHJlZVxuICAgICAgICBsb2cgZ2V0UHJlZml4KHNsYXNoLmlzRGlyKHApLCBkZXB0aC0xKSArIGRpclN0cmluZyhzbGFzaC5iYXNlKHBzKSwgc2xhc2guZXh0KHBzKSkgKyByZXNldFxuICAgIGVsc2VcbiAgICAgICAgcyA9IGNvbG9yc1snX2Fycm93J10gKyBcIiDilrYgXCIgKyBjb2xvcnNbJ19oZWFkZXInXVswXVxuICAgICAgICBwcyA9IHNsYXNoLnJlc29sdmUgcHMgaWYgcHNbMF0gIT0gJ34nXG4gICAgICAgIHBzID0gc2xhc2gucmVsYXRpdmUgcHMsIHByb2Nlc3MuY3dkKClcblxuICAgICAgICBpZiBwcyA9PSAnLydcbiAgICAgICAgICAgIHMgKz0gJy8nXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNwID0gcHMuc3BsaXQoJy8nKVxuICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVswXSArIHNwLnNoaWZ0KClcbiAgICAgICAgICAgIHdoaWxlIHNwLmxlbmd0aFxuICAgICAgICAgICAgICAgIHBuID0gc3Auc2hpZnQoKVxuICAgICAgICAgICAgICAgIGlmIHBuXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gY29sb3JzWydfaGVhZGVyJ11bMV0gKyAnLydcbiAgICAgICAgICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVtzcC5sZW5ndGggPT0gMCBhbmQgMiBvciAwXSArIHBuXG4gICAgICAgIGxvZyByZXNldFxuICAgICAgICBsb2cgcyArIFwiIFwiICsgcmVzZXRcbiAgICAgICAgbG9nIHJlc2V0XG5cbiAgICBpZiBmaWxlcz8ubGVuZ3RoXG4gICAgICAgIGxpc3RGaWxlcyBwLCBmaWxlcywgZGVwdGhcblxuICAgIGlmIGFyZ3MucmVjdXJzZVxuICAgICAgICBcbiAgICAgICAgZG9SZWN1cnNlID0gKGYpIC0+IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgc2xhc2guYmFzZW5hbWUoZikgaW4gYXJncy5pZ25vcmVcbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBzbGFzaC5leHQoZikgPT0gJ2FwcCdcbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBub3QgYXJncy5hbGwgYW5kIGZbMF0gPT0gJy4nXG4gICAgICAgICAgICBzbGFzaC5pc0RpciBzbGFzaC5qb2luIHAsIGZcbiAgICAgICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGZvciBwciBpbiBmcy5yZWFkZGlyU3luYyhwKS5maWx0ZXIgZG9SZWN1cnNlXG4gICAgICAgICAgICAgICAgbGlzdERpciBzbGFzaC5yZXNvbHZlKHNsYXNoLmpvaW4gcCwgcHIpLCBvcHRcbiAgICAgICAgY2F0Y2ggZXJyXG4gICAgICAgICAgICBtc2cgPSBlcnIubWVzc2FnZVxuICAgICAgICAgICAgbXNnID0gXCJwZXJtaXNzaW9uIGRlbmllZFwiIGlmIG1zZy5zdGFydHNXaXRoIFwiRUFDQ0VTXCJcbiAgICAgICAgICAgIG1zZyA9IFwicGVybWlzc2lvbiBkZW5pZWRcIiBpZiBtc2cuc3RhcnRzV2l0aCBcIkVQRVJNXCJcbiAgICAgICAgICAgIGxvZ19lcnJvciBtc2dcbiAgICAgICAgICAgIFxucGF0aERlcHRoID0gKHAsIG9wdCkgLT5cbiAgICBcbiAgICByZWwgPSBzbGFzaC5yZWxhdGl2ZSBwLCBvcHQ/LnJlbGF0aXZlVG8gPyBwcm9jZXNzLmN3ZCgpXG4gICAgcmV0dXJuIDAgaWYgcCA9PSAnLidcbiAgICByZWwuc3BsaXQoJy8nKS5sZW5ndGhcblxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG5cbm1haW4gPSAtPlxuICAgIFxuICAgIHBhdGhzdGF0cyA9IGFyZ3MucGF0aHMubWFwIChmKSAtPlxuICAgICAgICB0cnlcbiAgICAgICAgICAgIFtmLCBmcy5zdGF0U3luYyhmKV1cbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICAgIGxvZ19lcnJvciAnbm8gc3VjaCBmaWxlOiAnLCBmXG4gICAgICAgICAgICBbXVxuICAgIFxuICAgIGZpbGVzdGF0cyA9IHBhdGhzdGF0cy5maWx0ZXIoIChmKSAtPiBmLmxlbmd0aCBhbmQgbm90IGZbMV0uaXNEaXJlY3RvcnkoKSApXG4gICAgXG4gICAgaWYgZmlsZXN0YXRzLmxlbmd0aCA+IDBcbiAgICAgICAgbG9nIHJlc2V0XG4gICAgICAgIGxpc3RGaWxlcyBwcm9jZXNzLmN3ZCgpLCBmaWxlc3RhdHMubWFwKCAocykgLT4gc1swXSApXG4gICAgXG4gICAgZm9yIHAgaW4gcGF0aHN0YXRzLmZpbHRlciggKGYpIC0+IGYubGVuZ3RoIGFuZCBmWzFdLmlzRGlyZWN0b3J5KCkgKVxuICAgICAgICBsb2cgJycgaWYgYXJncy50cmVlXG4gICAgICAgIGxpc3REaXIgcFswXSwgcmVsYXRpdmVUbzphcmdzLnRyZWUgYW5kIHNsYXNoLmRpcm5hbWUocFswXSkgb3IgcHJvY2Vzcy5jd2QoKVxuICAgIFxuICAgIGxvZyBcIlwiXG4gICAgaWYgYXJncy5pbmZvXG4gICAgICAgIGtzdHIgPSByZXF1aXJlICdreGsvanMvc3RyJ1xuICAgICAgICBsb2cgQlcoMSkgKyBcIiBcIiArXG4gICAgICAgIGZ3KDgpICsgc3RhdHMubnVtX2RpcnMgKyAoc3RhdHMuaGlkZGVuX2RpcnMgYW5kIGZ3KDQpICsgXCIrXCIgKyBmdyg1KSArIChzdGF0cy5oaWRkZW5fZGlycykgb3IgXCJcIikgKyBmdyg0KSArIFwiIGRpcnMgXCIgK1xuICAgICAgICBmdyg4KSArIHN0YXRzLm51bV9maWxlcyArIChzdGF0cy5oaWRkZW5fZmlsZXMgYW5kIGZ3KDQpICsgXCIrXCIgKyBmdyg1KSArIChzdGF0cy5oaWRkZW5fZmlsZXMpIG9yIFwiXCIpICsgZncoNCkgKyBcIiBmaWxlcyBcIiArXG4gICAgICAgIGZ3KDgpICsga3N0ci50aW1lKHByb2Nlc3MuaHJ0aW1lLmJpZ2ludD8oKS1zdGFydFRpbWUpICsgXCIgXCIgK1xuICAgICAgICByZXNldFxuICAgIFxuaWYgYXJnc1xuICAgIGluaXRBcmdzKClcbiAgICBtYWluKClcbmVsc2VcbiAgICBtb2R1bGVNYWluID0gKGFyZywgb3B0PXt9KSAtPlxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIHR5cGVvZiBhcmdcbiAgICAgICAgICAgIHdoZW4gJ3N0cmluZydcbiAgICAgICAgICAgICAgICBhcmdzID0gT2JqZWN0LmFzc2lnbiB7fSwgb3B0XG4gICAgICAgICAgICAgICAgYXJncy5wYXRocyA/PSBbXVxuICAgICAgICAgICAgICAgIGFyZ3MucGF0aHMucHVzaCBhcmdcbiAgICAgICAgICAgIHdoZW4gJ29iamVjdCdcbiAgICAgICAgICAgICAgICBhcmdzID0gT2JqZWN0LmFzc2lnbiB7fSwgYXJnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYXJncyA9IHBhdGhzOlsnLiddXG4gICAgICAgIGluaXRBcmdzKClcbiAgICAgICAgXG4gICAgICAgICMgbG9nICdhcmdzOicsIGFyZ3NcbiAgICAgICAgXG4gICAgICAgIG91dCA9ICcnXG4gICAgICAgIG9sZGxvZyA9IGNvbnNvbGUubG9nXG4gICAgICAgIGNvbnNvbGUubG9nID0gLT4gXG4gICAgICAgICAgICBmb3IgYXJnIGluIGFyZ3VtZW50cyB0aGVuIG91dCArPSBTdHJpbmcoYXJnKVxuICAgICAgICAgICAgb3V0ICs9ICdcXG4nXG4gICAgICAgIFxuICAgICAgICBtYWluKClcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nID0gb2xkbG9nXG4gICAgICAgIG91dFxuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzID0gbW9kdWxlTWFpblxuICAgICJdfQ==
//# sourceURL=../coffee/color-ls.coffee