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

slash = require('kxk/js/slash');

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

if (module.parent.id === '.') {
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
        slash = require('kxk/js/slash');
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
        var ext, file, link, lstat, name, s, stat;
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
            if (link) {
                stat = lstat;
                stats.brokenLinks.push(file);
            } else {
                log_error("can't read file: ", file, link);
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
    var depth, doRecurse, error, files, j, len, msg, pn, pr, ps, ref1, results, s, sp;
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
        error = error1;
        msg = error.message;
        if (msg.startsWith("EACCES")) {
            msg = "permission denied";
        }
        log_error(msg);
    }
    if (args.find) {
        files = files.filter(function(f) {
            if (RegExp(args.find).test(f)) {
                return f;
            }
        });
    }
    if (args.find && !files.length) {
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
    if (files.length) {
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
        ref1 = fs.readdirSync(p).filter(doRecurse);
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
            pr = ref1[j];
            results.push(listDir(slash.resolve(slash.join(p, pr)), opt));
        }
        return results;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDJZQUFBO0lBQUE7O0FBUUEsU0FBQSxnRUFBMEIsQ0FBQzs7QUFFM0IsTUFBaUIsT0FBQSxDQUFRLFlBQVIsQ0FBakIsRUFBRSxlQUFGLEVBQVE7O0FBQ1IsRUFBQSxHQUFTLE9BQUEsQ0FBUSxJQUFSOztBQUNULEtBQUEsR0FBUyxPQUFBLENBQVEsY0FBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLGlCQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFFVCxJQUFBLEdBQVE7O0FBQ1IsS0FBQSxHQUFROztBQUVSLElBQUEsR0FBUzs7QUFDVCxLQUFBLEdBQVMsSUFBSSxDQUFDOztBQUNkLEVBQUEsR0FBUyxJQUFJLENBQUMsRUFBRSxDQUFDOztBQUNqQixFQUFBLEdBQVMsSUFBSSxDQUFDLEVBQUUsQ0FBQzs7QUFDakIsRUFBQSxHQUFTLFNBQUMsQ0FBRDtXQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBVSxDQUFBLENBQUE7QUFBekI7O0FBQ1QsRUFBQSxHQUFTLFNBQUMsQ0FBRDtXQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBVSxDQUFBLENBQUE7QUFBekI7O0FBRVQsS0FBQSxHQUNJO0lBQUEsUUFBQSxFQUFnQixDQUFoQjtJQUNBLFNBQUEsRUFBZ0IsQ0FEaEI7SUFFQSxXQUFBLEVBQWdCLENBRmhCO0lBR0EsWUFBQSxFQUFnQixDQUhoQjtJQUlBLGNBQUEsRUFBZ0IsQ0FKaEI7SUFLQSxjQUFBLEVBQWdCLENBTGhCO0lBTUEsV0FBQSxFQUFnQixFQU5oQjs7O0FBY0osSUFBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQWQsS0FBb0IsR0FBdkI7SUFFSSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7SUFDUCxJQUFBLEdBQU8sSUFBQSxDQUFLLDJpREFBQSxHQTBCRSxD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QUwsK0RBQXdCLENBQUMsa0JBQWYsR0FBeUIsU0FBbkMsQ0FISixHQUdvRCxHQUhwRCxHQUlKLEtBTDJCLEVBRC9COztBQXBCRzs7QUE0QlAsSUFBRyxJQUFIO0lBQ0ksUUFBQSxDQUFBO0lBQ0EsSUFBQSxDQUFBLEVBRko7Q0FBQSxNQUFBO0lBSUksVUFBQSxHQUFhLFNBQUMsR0FBRCxFQUFNLEdBQU47QUFFVCxZQUFBOztZQUZlLE1BQUk7O0FBRW5CLGdCQUFPLE9BQU8sR0FBZDtBQUFBLGlCQUNTLFFBRFQ7Z0JBRVEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxNQUFQLENBQWMsRUFBZCxFQUFrQixHQUFsQjs7b0JBQ1AsSUFBSSxDQUFDOztvQkFBTCxJQUFJLENBQUMsUUFBUzs7Z0JBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFYLENBQWdCLEdBQWhCO0FBSEM7QUFEVCxpQkFLUyxRQUxUO2dCQU1RLElBQUEsR0FBTyxNQUFNLENBQUMsTUFBUCxDQUFjLEVBQWQsRUFBa0IsR0FBbEI7QUFETjtBQUxUO2dCQVFRLElBQUEsR0FBTztvQkFBQSxLQUFBLEVBQU0sQ0FBQyxHQUFELENBQU47O0FBUmY7UUFTQSxRQUFBLENBQUE7UUFJQSxHQUFBLEdBQU07UUFDTixNQUFBLEdBQVMsT0FBTyxDQUFDO1FBQ2pCLE9BQU8sQ0FBQyxHQUFSLEdBQWMsU0FBQTtBQUNWLGdCQUFBO0FBQUEsaUJBQUEsMkNBQUE7O2dCQUEwQixHQUFBLElBQU8sTUFBQSxDQUFPLEdBQVA7QUFBakM7bUJBQ0EsR0FBQSxJQUFPO1FBRkc7UUFJZCxJQUFBLENBQUE7UUFFQSxPQUFPLENBQUMsR0FBUixHQUFjO2VBQ2Q7SUF4QlM7SUEwQmIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0E5QnJCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAgICAgICAwMDAgICAgICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwICAwMDAgICAgICAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgIDAwMFxuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgICAgICAgMDAwMDAwMCAgMDAwMDAwMFxuIyMjXG5cbnN0YXJ0VGltZSA9IHByb2Nlc3MuaHJ0aW1lLmJpZ2ludD8oKVxuXG57IGxwYWQsIHJwYWQgfSA9IHJlcXVpcmUgJ2t4ay9qcy9zdHInXG5mcyAgICAgPSByZXF1aXJlICdmcydcbnNsYXNoICA9IHJlcXVpcmUgJ2t4ay9qcy9zbGFzaCdcbmFuc2kgICA9IHJlcXVpcmUgJ2Fuc2ktMjU2LWNvbG9ycydcbnV0aWwgICA9IHJlcXVpcmUgJ3V0aWwnXG5cbmFyZ3MgID0gbnVsbFxudG9rZW4gPSB7fVxuXG5ib2xkICAgPSAnXFx4MWJbMW0nXG5yZXNldCAgPSBhbnNpLnJlc2V0XG5mZyAgICAgPSBhbnNpLmZnLmdldFJnYlxuQkcgICAgID0gYW5zaS5iZy5nZXRSZ2JcbmZ3ICAgICA9IChpKSAtPiBhbnNpLmZnLmdyYXlzY2FsZVtpXVxuQlcgICAgID0gKGkpIC0+IGFuc2kuYmcuZ3JheXNjYWxlW2ldXG5cbnN0YXRzID0gIyBjb3VudGVycyBmb3IgKGhpZGRlbikgZGlycy9maWxlc1xuICAgIG51bV9kaXJzOiAgICAgICAwXG4gICAgbnVtX2ZpbGVzOiAgICAgIDBcbiAgICBoaWRkZW5fZGlyczogICAgMFxuICAgIGhpZGRlbl9maWxlczogICAwXG4gICAgbWF4T3duZXJMZW5ndGg6IDBcbiAgICBtYXhHcm91cExlbmd0aDogMFxuICAgIGJyb2tlbkxpbmtzOiAgICBbXVxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcblxuaWYgbW9kdWxlLnBhcmVudC5pZCA9PSAnLidcblxuICAgIGthcmcgPSByZXF1aXJlICdrYXJnJ1xuICAgIGFyZ3MgPSBrYXJnIFwiXCJcIlxuICAgIGNvbG9yLWxzXG4gICAgICAgIHBhdGhzICAgICAgICAgLiA/IHRoZSBmaWxlKHMpIGFuZC9vciBmb2xkZXIocykgdG8gZGlzcGxheSAuICoqXG4gICAgICAgIGFsbCAgICAgICAgICAgLiA/IHNob3cgZG90IGZpbGVzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGRpcnMgICAgICAgICAgLiA/IHNob3cgb25seSBkaXJzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGZpbGVzICAgICAgICAgLiA/IHNob3cgb25seSBmaWxlcyAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGJ5dGVzICAgICAgICAgLiA/IGluY2x1ZGUgc2l6ZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIG1kYXRlICAgICAgICAgLiA/IGluY2x1ZGUgbW9kaWZpY2F0aW9uIGRhdGUgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGxvbmcgICAgICAgICAgLiA/IGluY2x1ZGUgc2l6ZSBhbmQgZGF0ZSAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIG93bmVyICAgICAgICAgLiA/IGluY2x1ZGUgb3duZXIgYW5kIGdyb3VwICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHJpZ2h0cyAgICAgICAgLiA/IGluY2x1ZGUgcmlnaHRzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHNpemUgICAgICAgICAgLiA/IHNvcnQgYnkgc2l6ZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHRpbWUgICAgICAgICAgLiA/IHNvcnQgYnkgdGltZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIGtpbmQgICAgICAgICAgLiA/IHNvcnQgYnkga2luZCAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIG5lcmR5ICAgICAgICAgLiA/IHVzZSBuZXJkIGZvbnQgaWNvbnMgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgICAgIHByZXR0eSAgICAgICAgLiA/IHByZXR0eSBzaXplIGFuZCBhZ2UgICAgICAgICAgICAgLiA9IHRydWVcbiAgICAgICAgaWdub3JlICAgICAgICAuID8gZG9uJ3QgcmVjdXJzZSBpbnRvICAgICAgICAgICAgICAuID0gbm9kZV9tb2R1bGVzXG4gICAgICAgIGluZm8gICAgICAgICAgLiA/IHNob3cgc3RhdGlzdGljcyAgICAgICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBJXG4gICAgICAgIGFscGhhYmV0aWNhbCAgLiA/IGRvbid0IGdyb3VwIGRpcnMgYmVmb3JlIGZpbGVzICAgLiA9IGZhbHNlIC4gLSBBXG4gICAgICAgIG9mZnNldCAgICAgICAgLiA/IGluZGVudCBzaG9ydCBsaXN0aW5ncyAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBPXG4gICAgICAgIHJlY3Vyc2UgICAgICAgLiA/IHJlY3Vyc2UgaW50byBzdWJkaXJzICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBSXG4gICAgICAgIHRyZWUgICAgICAgICAgLiA/IHJlY3Vyc2UgYW5kIGluZGVudCAgICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBUXG4gICAgICAgIGRlcHRoICAgICAgICAgLiA/IHJlY3Vyc2lvbiBkZXB0aCAgICAgICAgICAgICAgICAgLiA9IOKIniAgICAgLiAtIERcbiAgICAgICAgZmluZCAgICAgICAgICAuID8gZmlsdGVyIHdpdGggYSByZWdleHAgICAgICAgICAgICAgICAgICAgICAgLiAtIEZcbiAgICAgICAgZGVidWcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2UgLiAtIFhcbiAgICBcbiAgICB2ZXJzaW9uICAgICAgI3tyZXF1aXJlKFwiI3tfX2Rpcm5hbWV9Ly4uL3BhY2thZ2UuanNvblwiKS52ZXJzaW9ufVxuICAgIFwiXCJcIlxuICAgIFxuaW5pdEFyZ3MgPSAtPlxuICAgIFxuICAgIGlmIGFyZ3Muc2l6ZVxuICAgICAgICBhcmdzLmZpbGVzID0gdHJ1ZVxuICAgIFxuICAgIGlmIGFyZ3MubG9uZ1xuICAgICAgICBhcmdzLmJ5dGVzID0gdHJ1ZVxuICAgICAgICBhcmdzLm1kYXRlID0gdHJ1ZVxuICAgICAgICBcbiAgICBpZiBhcmdzLnRyZWVcbiAgICAgICAgYXJncy5yZWN1cnNlID0gdHJ1ZVxuICAgICAgICBhcmdzLm9mZnNldCAgPSBmYWxzZVxuICAgIFxuICAgIGlmIGFyZ3MuZGlycyBhbmQgYXJncy5maWxlc1xuICAgICAgICBhcmdzLmRpcnMgPSBhcmdzLmZpbGVzID0gZmFsc2VcbiAgICAgICAgXG4gICAgaWYgYXJncy5pZ25vcmU/Lmxlbmd0aFxuICAgICAgICBhcmdzLmlnbm9yZSA9IGFyZ3MuaWdub3JlLnNwbGl0ICcgJyBcbiAgICBlbHNlXG4gICAgICAgIGFyZ3MuaWdub3JlID0gW11cbiAgICAgICAgXG4gICAgaWYgYXJncy5kZXB0aCA9PSAn4oieJyB0aGVuIGFyZ3MuZGVwdGggPSBJbmZpbml0eVxuICAgIGVsc2UgYXJncy5kZXB0aCA9IE1hdGgubWF4IDAsIHBhcnNlSW50IGFyZ3MuZGVwdGhcbiAgICBpZiBOdW1iZXIuaXNOYU4gYXJncy5kZXB0aCB0aGVuIGFyZ3MuZGVwdGggPSAwXG4gICAgICAgIFxuICAgIGlmIGFyZ3MuZGVidWdcbiAgICAgICAgeyBrbG9nLCBub29uIH0gPSByZXF1aXJlICdreGsnXG4gICAgICAgIGtsb2cgbm9vbi5zdHJpbmdpZnkgYXJncywgY29sb3JzOnRydWVcbiAgICBcbiAgICBhcmdzLnBhdGhzID0gWycuJ10gdW5sZXNzIGFyZ3MucGF0aHM/Lmxlbmd0aCA+IDBcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuY29sb3JzID1cbiAgICAnY29mZmVlJzogICBbIGJvbGQrZmcoNCw0LDApLCAgZmcoMSwxLDApLCBmZygxLDEsMCkgXVxuICAgICdrb2ZmZWUnOiAgIFsgYm9sZCtmZyg1LDUsMCksICBmZygxLDAsMCksIGZnKDEsMCwwKSBdXG4gICAgJ3B5JzogICAgICAgWyBib2xkK2ZnKDAsMiwwKSwgIGZnKDAsMSwwKSwgZmcoMCwxLDApIF1cbiAgICAncmInOiAgICAgICBbIGJvbGQrZmcoNCwwLDApLCAgZmcoMSwwLDApLCBmZygxLDAsMCkgXVxuICAgICdqc29uJzogICAgIFsgYm9sZCtmZyg0LDAsNCksICBmZygxLDAsMSksIGZnKDEsMCwxKSBdXG4gICAgJ2Nzb24nOiAgICAgWyBib2xkK2ZnKDQsMCw0KSwgIGZnKDEsMCwxKSwgZmcoMSwwLDEpIF1cbiAgICAnbm9vbic6ICAgICBbIGJvbGQrZmcoNCw0LDApLCAgZmcoMSwxLDApLCBmZygxLDEsMCkgXVxuICAgICdwbGlzdCc6ICAgIFsgYm9sZCtmZyg0LDAsNCksICBmZygxLDAsMSksIGZnKDEsMCwxKSBdXG4gICAgJ2pzJzogICAgICAgWyBib2xkK2ZnKDUsMCw1KSwgIGZnKDEsMCwxKSwgZmcoMSwwLDEpIF1cbiAgICAnY3BwJzogICAgICBbIGJvbGQrZmcoNSw0LDApLCAgZncoMSksICAgICBmZygxLDEsMCkgXVxuICAgICdoJzogICAgICAgIFsgICAgICBmZygzLDEsMCksICBmdygxKSwgICAgIGZnKDEsMSwwKSBdXG4gICAgJ3B5Yyc6ICAgICAgWyAgICAgIGZ3KDUpLCAgICAgIGZ3KDEpLCAgICAgZncoMSkgXVxuICAgICdsb2cnOiAgICAgIFsgICAgICBmdyg1KSwgICAgICBmdygxKSwgICAgIGZ3KDEpIF1cbiAgICAnbG9nJzogICAgICBbICAgICAgZncoNSksICAgICAgZncoMSksICAgICBmdygxKSBdXG4gICAgJ3R4dCc6ICAgICAgWyAgICAgIGZ3KDIwKSwgICAgIGZ3KDEpLCAgICAgZncoMikgXVxuICAgICdtZCc6ICAgICAgIFsgYm9sZCtmdygyMCksICAgICBmdygxKSwgICAgIGZ3KDIpIF1cbiAgICAnbWFya2Rvd24nOiBbIGJvbGQrZncoMjApLCAgICAgZncoMSksICAgICBmdygyKSBdXG4gICAgJ3NoJzogICAgICAgWyBib2xkK2ZnKDUsMSwwKSwgIGZnKDEsMCwwKSwgZmcoMSwwLDApIF1cbiAgICAncG5nJzogICAgICBbIGJvbGQrZmcoNSwwLDApLCAgZmcoMSwwLDApLCBmZygxLDAsMCkgXVxuICAgICdqcGcnOiAgICAgIFsgYm9sZCtmZygwLDMsMCksICBmZygwLDEsMCksIGZnKDAsMSwwKSBdXG4gICAgJ3B4bSc6ICAgICAgWyBib2xkK2ZnKDEsMSw1KSwgIGZnKDAsMCwxKSwgZmcoMCwwLDIpIF1cbiAgICAndGlmZic6ICAgICBbIGJvbGQrZmcoMSwxLDUpLCAgZmcoMCwwLDEpLCBmZygwLDAsMikgXVxuXG4gICAgJ19kZWZhdWx0JzogWyAgICAgIGZ3KDE1KSwgICAgIGZ3KDEpLCAgICAgZncoNikgXVxuICAgICdfZGlyJzogICAgIFsgYm9sZCtCRygwLDAsMikrZncoMjMpLCBmZygxLDEsNSksIGJvbGQrQkcoMCwwLDIpK2ZnKDIsMiw1KSBdXG4gICAgJ18uZGlyJzogICAgWyBib2xkK0JHKDAsMCwxKStmdygyMyksIGJvbGQrQkcoMCwwLDEpK2ZnKDEsMSw1KSwgYm9sZCtCRygwLDAsMSkrZmcoMiwyLDUpIF1cbiAgICAnX2xpbmsnOiAgICB7ICdhcnJvdyc6IGZnKDEsMCwxKSwgJ3BhdGgnOiBmZyg0LDAsNCksICdicm9rZW4nOiBCRyg1LDAsMCkrZmcoNSw1LDApIH1cbiAgICAnX2Fycm93JzogICAgIEJXKDIpK2Z3KDApXG4gICAgJ19oZWFkZXInOiAgWyBib2xkK0JXKDIpK2ZnKDMsMiwwKSwgIGZ3KDQpLCBib2xkK0JXKDIpK2ZnKDUsNSwwKSBdXG4gICAgJ19zaXplJzogICAgeyBiOiBbZmcoMCwwLDMpXSwga0I6IFtmZygwLDAsNSksIGZnKDAsMCwzKV0sIE1COiBbZmcoMSwxLDUpLCBmZygwLDAsNSldLCBHQjogW2ZnKDQsNCw1KSwgZmcoMiwyLDUpXSwgVEI6IFtmZyg0LDQsNSksIGZnKDIsMiw1KV0gfVxuICAgICdfdXNlcnMnOiAgIHsgcm9vdDogIGZnKDMsMCwwKSwgZGVmYXVsdDogZmcoMSwwLDEpIH1cbiAgICAnX2dyb3Vwcyc6ICB7IHdoZWVsOiBmZygxLDAsMCksIHN0YWZmOiBmZygwLDEsMCksIGFkbWluOiBmZygxLDEsMCksIGRlZmF1bHQ6IGZnKDEsMCwxKSB9XG4gICAgJ19lcnJvcic6ICAgWyBib2xkK0JHKDUsMCwwKStmZyg1LDUsMCksIGJvbGQrQkcoNSwwLDApK2ZnKDUsNSw1KSBdXG4gICAgJ19yaWdodHMnOlxuICAgICAgICAgICAgICAgICAgJ3IrJzogYm9sZCtCVygxKStmZygxLDEsMSlcbiAgICAgICAgICAgICAgICAgICdyLSc6IHJlc2V0K0JXKDEpXG4gICAgICAgICAgICAgICAgICAndysnOiBib2xkK0JXKDEpK2ZnKDIsMiw1KVxuICAgICAgICAgICAgICAgICAgJ3ctJzogcmVzZXQrQlcoMSlcbiAgICAgICAgICAgICAgICAgICd4Kyc6IGJvbGQrQlcoMSkrZmcoNSwwLDApXG4gICAgICAgICAgICAgICAgICAneC0nOiByZXNldCtCVygxKVxuXG51c2VyTWFwID0ge31cbnVzZXJuYW1lID0gKHVpZCkgLT5cbiAgICBpZiBub3QgdXNlck1hcFt1aWRdXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgY2hpbGRwID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbiAgICAgICAgICAgIHVzZXJNYXBbdWlkXSA9IGNoaWxkcC5zcGF3blN5bmMoXCJpZFwiLCBbXCItdW5cIiwgXCIje3VpZH1cIl0pLnN0ZG91dC50b1N0cmluZygndXRmOCcpLnRyaW0oKVxuICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICBsb2cgZVxuICAgIHVzZXJNYXBbdWlkXVxuXG5ncm91cE1hcCA9IG51bGxcbmdyb3VwbmFtZSA9IChnaWQpIC0+XG4gICAgaWYgbm90IGdyb3VwTWFwXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgY2hpbGRwID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbiAgICAgICAgICAgIGdpZHMgPSBjaGlsZHAuc3Bhd25TeW5jKFwiaWRcIiwgW1wiLUdcIl0pLnN0ZG91dC50b1N0cmluZygndXRmOCcpLnNwbGl0KCcgJylcbiAgICAgICAgICAgIGdubXMgPSBjaGlsZHAuc3Bhd25TeW5jKFwiaWRcIiwgW1wiLUduXCJdKS5zdGRvdXQudG9TdHJpbmcoJ3V0ZjgnKS5zcGxpdCgnICcpXG4gICAgICAgICAgICBncm91cE1hcCA9IHt9XG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uLmdpZHMubGVuZ3RoXVxuICAgICAgICAgICAgICAgIGdyb3VwTWFwW2dpZHNbaV1dID0gZ25tc1tpXVxuICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICBsb2cgZVxuICAgIGdyb3VwTWFwW2dpZF1cblxuaWYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgcHJvY2Vzcy5nZXR1aWRcbiAgICBjb2xvcnNbJ191c2VycyddW3VzZXJuYW1lKHByb2Nlc3MuZ2V0dWlkKCkpXSA9IGZnKDAsNCwwKVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbmxvZ19lcnJvciA9ICgpIC0+XG4gICAgXG4gICAgbG9nIFwiIFwiICsgY29sb3JzWydfZXJyb3InXVswXSArIFwiIFwiICsgYm9sZCArIGFyZ3VtZW50c1swXSArIChhcmd1bWVudHMubGVuZ3RoID4gMSBhbmQgKGNvbG9yc1snX2Vycm9yJ11bMV0gKyBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykuc2xpY2UoMSkuam9pbignICcpKSBvciAnJykgKyBcIiBcIiArIHJlc2V0XG5cbmxpbmtTdHJpbmcgPSAoZmlsZSkgLT4gXG4gICAgXG4gICAgcyAgPSByZXNldCArIGZ3KDEpICsgY29sb3JzWydfbGluayddWydhcnJvdyddICsgXCIg4pa6IFwiIFxuICAgIHMgKz0gY29sb3JzWydfbGluayddWyhmaWxlIGluIHN0YXRzLmJyb2tlbkxpbmtzKSBhbmQgJ2Jyb2tlbicgb3IgJ3BhdGgnXSBcbiAgICB0cnlcbiAgICAgICAgc2xhc2ggPSByZXF1aXJlICdreGsvanMvc2xhc2gnXG4gICAgICAgIHMgKz0gc2xhc2gucGF0aCBmcy5yZWFkbGlua1N5bmMoZmlsZSlcbiAgICBjYXRjaCBlcnJcbiAgICAgICAgcyArPSAnID8gJ1xuICAgIHNcblxubmFtZVN0cmluZyA9IChuYW1lLCBleHQpIC0+IFxuICAgIFxuICAgIGlmIGFyZ3MubmVyZHlcbiAgICAgICAgaWNvbnMgPSByZXF1aXJlICcuL2ljb25zJ1xuICAgICAgICBpY29uID0gKGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVsyXSArIChpY29ucy5nZXQobmFtZSwgZXh0KSA/ICcgJykpICsgJyAnXG4gICAgZWxzZVxuICAgICAgICBpY29uID0gJydcbiAgICBcIiBcIiArIGljb24gKyBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMF0gKyBuYW1lICsgcmVzZXRcbiAgICBcbmRvdFN0cmluZyAgPSAoZXh0KSAtPiBcbiAgICBcbiAgICBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMV0gKyBcIi5cIiArIHJlc2V0XG4gICAgXG5leHRTdHJpbmcgID0gKG5hbWUsIGV4dCkgLT4gXG4gICAgXG4gICAgaWYgYXJncy5uZXJkeSBhbmQgbmFtZSBcbiAgICAgICAgaWNvbnMgPSByZXF1aXJlICcuL2ljb25zJ1xuICAgICAgICBpZiBpY29ucy5nZXQobmFtZSwgZXh0KSB0aGVuIHJldHVybiAnJ1xuICAgIGRvdFN0cmluZyhleHQpICsgY29sb3JzW2NvbG9yc1tleHRdPyBhbmQgZXh0IG9yICdfZGVmYXVsdCddWzJdICsgZXh0ICsgcmVzZXRcbiAgICBcbmRpclN0cmluZyAgPSAobmFtZSwgZXh0KSAtPlxuICAgIFxuICAgIGMgPSBuYW1lIGFuZCAnX2Rpcicgb3IgJ18uZGlyJ1xuICAgIGljb24gPSBhcmdzLm5lcmR5IGFuZCBjb2xvcnNbY11bMl0gKyAnIFxcdWY0MTMnIG9yICcnXG4gICAgaWNvbiArIGNvbG9yc1tjXVswXSArIChuYW1lIGFuZCAoXCIgXCIgKyBuYW1lKSBvciBcIiBcIikgKyAoaWYgZXh0IHRoZW4gY29sb3JzW2NdWzFdICsgJy4nICsgY29sb3JzW2NdWzJdICsgZXh0IGVsc2UgXCJcIikgKyBcIiBcIlxuXG5zaXplU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgaWYgYXJncy5wcmV0dHkgYW5kIHN0YXQuc2l6ZSA9PSAwXG4gICAgICAgIHJldHVybiBscGFkKCcgJywgMTEpXG4gICAgaWYgc3RhdC5zaXplIDwgMTAwMFxuICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ2InXVswXSArIGxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2UgaWYgc3RhdC5zaXplIDwgMTAwMDAwMFxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydrQiddWzBdICsgbHBhZCgoc3RhdC5zaXplIC8gMTAwMCkudG9GaXhlZCgwKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsna0InXVsxXSArIFwia0IgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydrQiddWzBdICsgbHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZSBpZiBzdGF0LnNpemUgPCAxMDAwMDAwMDAwXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ01CJ11bMF0gKyBscGFkKChzdGF0LnNpemUgLyAxMDAwMDAwKS50b0ZpeGVkKDEpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydNQiddWzFdICsgXCJNQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ01CJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlIGlmIHN0YXQuc2l6ZSA8IDEwMDAwMDAwMDAwMDBcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnR0InXVswXSArIGxwYWQoKHN0YXQuc2l6ZSAvIDEwMDAwMDAwMDApLnRvRml4ZWQoMSksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMV0gKyBcIkdCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnR0InXVswXSArIGxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2VcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnVEInXVswXSArIGxwYWQoKHN0YXQuc2l6ZSAvIDEwMDAwMDAwMDAwMDApLnRvRml4ZWQoMyksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMV0gKyBcIlRCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnVEInXVswXSArIGxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuXG50aW1lU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgbW9tZW50ID0gcmVxdWlyZSAnbW9tZW50J1xuICAgIHQgPSBtb21lbnQoc3RhdC5tdGltZSlcbiAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICBhZ2UgPSBtb21lbnQoKS50byh0LCB0cnVlKVxuICAgICAgICBbbnVtLCByYW5nZV0gPSBhZ2Uuc3BsaXQgJyAnXG4gICAgICAgIG51bSA9ICcxJyBpZiBudW1bMF0gPT0gJ2EnXG4gICAgICAgIGlmIHJhbmdlID09ICdmZXcnXG4gICAgICAgICAgICBudW0gPSBtb21lbnQoKS5kaWZmIHQsICdzZWNvbmRzJ1xuICAgICAgICAgICAgcmFuZ2UgPSAnc2Vjb25kcydcbiAgICAgICAgICAgIGZ3KDIzKSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDE2KSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2UgaWYgcmFuZ2Uuc3RhcnRzV2l0aCAneWVhcidcbiAgICAgICAgICAgIGZ3KDYpICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoMykgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ21vbnRoJ1xuICAgICAgICAgICAgZncoOCkgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdyg0KSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2UgaWYgcmFuZ2Uuc3RhcnRzV2l0aCAnZGF5J1xuICAgICAgICAgICAgZncoMTApICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoNikgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ2hvdXInXG4gICAgICAgICAgICBmdygxNSkgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdyg4KSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZ3KDE4KSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDEyKSArIHJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgZWxzZVxuICAgICAgICBmdygxNikgKyBscGFkKHQuZm9ybWF0KFwiRERcIiksMikgKyBmdyg3KSsnLicgK1xuICAgICAgICBmdygxMikgKyB0LmZvcm1hdChcIk1NXCIpICsgZncoNykrXCIuXCIgK1xuICAgICAgICBmdyggOCkgKyB0LmZvcm1hdChcIllZXCIpICsgJyAnICtcbiAgICAgICAgZncoMTYpICsgdC5mb3JtYXQoXCJISFwiKSArIGNvbCA9IGZ3KDcpKyc6JyArXG4gICAgICAgIGZ3KDE0KSArIHQuZm9ybWF0KFwibW1cIikgKyBjb2wgPSBmdygxKSsnOicgK1xuICAgICAgICBmdyggNCkgKyB0LmZvcm1hdChcInNzXCIpICsgJyAnXG5cbm93bmVyTmFtZSA9IChzdGF0KSAtPlxuICAgIFxuICAgIHRyeVxuICAgICAgICB1c2VybmFtZSBzdGF0LnVpZFxuICAgIGNhdGNoXG4gICAgICAgIHN0YXQudWlkXG5cbmdyb3VwTmFtZSA9IChzdGF0KSAtPlxuICAgIFxuICAgIHRyeVxuICAgICAgICBncm91cG5hbWUgc3RhdC5naWRcbiAgICBjYXRjaFxuICAgICAgICBzdGF0LmdpZFxuXG5vd25lclN0cmluZyA9IChzdGF0KSAtPlxuICAgIFxuICAgIG93biA9IG93bmVyTmFtZShzdGF0KVxuICAgIGdycCA9IGdyb3VwTmFtZShzdGF0KVxuICAgIG9jbCA9IGNvbG9yc1snX3VzZXJzJ11bb3duXVxuICAgIG9jbCA9IGNvbG9yc1snX3VzZXJzJ11bJ2RlZmF1bHQnXSB1bmxlc3Mgb2NsXG4gICAgZ2NsID0gY29sb3JzWydfZ3JvdXBzJ11bZ3JwXVxuICAgIGdjbCA9IGNvbG9yc1snX2dyb3VwcyddWydkZWZhdWx0J10gdW5sZXNzIGdjbFxuICAgIG9jbCArIHJwYWQob3duLCBzdGF0cy5tYXhPd25lckxlbmd0aCkgKyBcIiBcIiArIGdjbCArIHJwYWQoZ3JwLCBzdGF0cy5tYXhHcm91cExlbmd0aClcblxucnd4U3RyaW5nID0gKG1vZGUsIGkpIC0+XG4gICAgXG4gICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjEwMCkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWydyKyddICsgJyByJyBvciBjb2xvcnNbJ19yaWdodHMnXVsnci0nXSArICcgICcpICtcbiAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDEwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3crJ10gKyAnIHcnIG9yIGNvbG9yc1snX3JpZ2h0cyddWyd3LSddICsgJyAgJykgK1xuICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIwMDEpIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsneCsnXSArICcgeCcgb3IgY29sb3JzWydfcmlnaHRzJ11bJ3gtJ10gKyAnICAnKVxuXG5yaWdodHNTdHJpbmcgPSAoc3RhdCkgLT5cbiAgICBcbiAgICB1ciA9IHJ3eFN0cmluZyhzdGF0Lm1vZGUsIDIpICsgXCIgXCJcbiAgICBnciA9IHJ3eFN0cmluZyhzdGF0Lm1vZGUsIDEpICsgXCIgXCJcbiAgICBybyA9IHJ3eFN0cmluZyhzdGF0Lm1vZGUsIDApICsgXCIgXCJcbiAgICB1ciArIGdyICsgcm8gKyByZXNldFxuXG5nZXRQcmVmaXggPSAoc3RhdCwgZGVwdGgpIC0+XG4gICAgXG4gICAgcyA9ICcnXG4gICAgaWYgYXJncy5yaWdodHNcbiAgICAgICAgcyArPSByaWdodHNTdHJpbmcgc3RhdFxuICAgICAgICBzICs9IFwiIFwiXG4gICAgaWYgYXJncy5vd25lclxuICAgICAgICBzICs9IG93bmVyU3RyaW5nIHN0YXRcbiAgICAgICAgcyArPSBcIiBcIlxuICAgIGlmIGFyZ3MuYnl0ZXNcbiAgICAgICAgcyArPSBzaXplU3RyaW5nIHN0YXRcbiAgICBpZiBhcmdzLm1kYXRlXG4gICAgICAgIHMgKz0gdGltZVN0cmluZyBzdGF0XG4gICAgICAgIFxuICAgIGlmIGRlcHRoIGFuZCBhcmdzLnRyZWVcbiAgICAgICAgcyArPSBycGFkICcnLCBkZXB0aCo0XG4gICAgICAgIFxuICAgIGlmIHMubGVuZ3RoID09IDAgYW5kIGFyZ3Mub2Zmc2V0XG4gICAgICAgIHMgKz0gJyAgICAgICAnXG4gICAgc1xuICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMFxuXG5zb3J0ID0gKGxpc3QsIHN0YXRzLCBleHRzPVtdKSAtPlxuICAgIFxuICAgIF8gPSByZXF1aXJlICdsb2Rhc2gnXG4gICAgbW9tZW50ID0gcmVxdWlyZSAnbW9tZW50J1xuICAgIFxuICAgIGwgPSBfLnppcCBsaXN0LCBzdGF0cywgWzAuLi5saXN0Lmxlbmd0aF0sIChleHRzLmxlbmd0aCA+IDAgYW5kIGV4dHMgb3IgWzAuLi5saXN0Lmxlbmd0aF0pXG4gICAgXG4gICAgaWYgYXJncy5raW5kXG4gICAgICAgIGlmIGV4dHMgPT0gW10gdGhlbiByZXR1cm4gbGlzdFxuICAgICAgICBsLnNvcnQoKGEsYikgLT5cbiAgICAgICAgICAgIGlmIGFbM10gPiBiWzNdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIGlmIGFbM10gPCBiWzNdIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhcmdzLnRpbWVcbiAgICAgICAgICAgICAgICBtID0gbW9tZW50KGFbMV0ubXRpbWUpXG4gICAgICAgICAgICAgICAgaWYgbS5pc0FmdGVyKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBpZiBtLmlzQmVmb3JlKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhcmdzLnNpemVcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPiBiWzFdLnNpemUgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA8IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYVsyXSA+IGJbMl0gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgLTEpXG4gICAgZWxzZSBpZiBhcmdzLnRpbWVcbiAgICAgICAgbC5zb3J0KChhLGIpIC0+XG4gICAgICAgICAgICBtID0gbW9tZW50KGFbMV0ubXRpbWUpXG4gICAgICAgICAgICBpZiBtLmlzQWZ0ZXIoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgaWYgbS5pc0JlZm9yZShiWzFdLm10aW1lKSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYXJncy5zaXplXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplID4gYlsxXS5zaXplIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPCBiWzFdLnNpemUgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFbMl0gPiBiWzJdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIC0xKVxuICAgIGVsc2UgaWYgYXJncy5zaXplXG4gICAgICAgIGwuc29ydCgoYSxiKSAtPlxuICAgICAgICAgICAgaWYgYVsxXS5zaXplID4gYlsxXS5zaXplIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA8IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYVsyXSA+IGJbMl0gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgLTEpXG4gICAgXy51bnppcChsKVswXVxuXG4jIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgXG4jIDAwMCAgMDAwICAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgMDAwICAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG5cbmlnbm9yZSA9IChwKSAtPlxuICAgIFxuICAgIGJhc2UgPSBzbGFzaC5iYXNlbmFtZSBwXG4gICAgcmV0dXJuIHRydWUgaWYgYmFzZVswXSA9PSAnJCdcbiAgICByZXR1cm4gdHJ1ZSBpZiBiYXNlID09ICdkZXNrdG9wLmluaScgICAgXG4gICAgcmV0dXJuIHRydWUgaWYgYmFzZS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGggJ250dXNlcidcbiAgICBmYWxzZVxuICAgIFxuIyAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMFxuIyAwMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDBcblxubGlzdEZpbGVzID0gKHAsIGZpbGVzLCBkZXB0aCkgLT5cbiAgICBcbiAgICBhbHBoID0gW10gaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICBkaXJzID0gW10gIyB2aXNpYmxlIGRpcnNcbiAgICBmaWxzID0gW10gIyB2aXNpYmxlIGZpbGVzXG4gICAgZHN0cyA9IFtdICMgZGlyIHN0YXRzXG4gICAgZnN0cyA9IFtdICMgZmlsZSBzdGF0c1xuICAgIGV4dHMgPSBbXSAjIGZpbGUgZXh0ZW5zaW9uc1xuXG4gICAgaWYgYXJncy5vd25lclxuICAgICAgICBcbiAgICAgICAgZmlsZXMuZm9yRWFjaCAocnApIC0+XG4gICAgICAgICAgICBpZiBzbGFzaC5pc0Fic29sdXRlIHJwXG4gICAgICAgICAgICAgICAgZmlsZSA9IHNsYXNoLnJlc29sdmUgcnBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmaWxlICA9IHNsYXNoLmpvaW4gcCwgcnBcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIHN0YXQgPSBmcy5sc3RhdFN5bmMoZmlsZSlcbiAgICAgICAgICAgICAgICBvbCA9IG93bmVyTmFtZShzdGF0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICBnbCA9IGdyb3VwTmFtZShzdGF0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICBpZiBvbCA+IHN0YXRzLm1heE93bmVyTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm1heE93bmVyTGVuZ3RoID0gb2xcbiAgICAgICAgICAgICAgICBpZiBnbCA+IHN0YXRzLm1heEdyb3VwTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm1heEdyb3VwTGVuZ3RoID0gZ2xcbiAgICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICBmaWxlcy5mb3JFYWNoIChycCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLmlzQWJzb2x1dGUgcnBcbiAgICAgICAgICAgIGZpbGUgID0gc2xhc2gucmVzb2x2ZSBycFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmaWxlICA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBwLCBycFxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBpZ25vcmUgcnBcbiAgICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgbHN0YXQgPSBmcy5sc3RhdFN5bmMgZmlsZVxuICAgICAgICAgICAgbGluayAgPSBsc3RhdC5pc1N5bWJvbGljTGluaygpXG4gICAgICAgICAgICBzdGF0ICA9IGxpbmsgYW5kIGZzLnN0YXRTeW5jKGZpbGUpIG9yIGxzdGF0XG4gICAgICAgIGNhdGNoXG4gICAgICAgICAgICBpZiBsaW5rXG4gICAgICAgICAgICAgICAgc3RhdCA9IGxzdGF0XG4gICAgICAgICAgICAgICAgc3RhdHMuYnJva2VuTGlua3MucHVzaCBmaWxlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbG9nX2Vycm9yIFwiY2FuJ3QgcmVhZCBmaWxlOiBcIiwgZmlsZSwgbGlua1xuICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGV4dCAgPSBzbGFzaC5leHQgZmlsZVxuICAgICAgICBuYW1lID0gc2xhc2guYmFzZSBmaWxlXG4gICAgICAgIFxuICAgICAgICBpZiBuYW1lWzBdID09ICcuJ1xuICAgICAgICAgICAgZXh0ID0gbmFtZS5zdWJzdHIoMSkgKyBzbGFzaC5leHRuYW1lIGZpbGVcbiAgICAgICAgICAgIG5hbWUgPSAnJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIG5hbWUubGVuZ3RoIGFuZCBuYW1lW25hbWUubGVuZ3RoLTFdICE9ICdcXHInIG9yIGFyZ3MuYWxsXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHMgPSBnZXRQcmVmaXggc3RhdCwgZGVwdGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICAgIGlmIG5vdCBhcmdzLmZpbGVzXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBhcmdzLnRyZWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5hbWUuc3RhcnRzV2l0aCAnLi8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVbMi4uXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGRpclN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzICs9IGxpbmtTdHJpbmcgZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlycy5wdXNoIHMrcmVzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGFscGgucHVzaCBzK3Jlc2V0IGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgICAgICAgICAgICAgIGRzdHMucHVzaCBzdGF0XG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm51bV9kaXJzICs9IDFcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9kaXJzICs9IDFcbiAgICAgICAgICAgIGVsc2UgIyBpZiBwYXRoIGlzIGZpbGVcbiAgICAgICAgICAgICAgICBpZiBub3QgYXJncy5kaXJzXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gbmFtZVN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGV4dFN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgbGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBsaW5rU3RyaW5nIGZpbGVcbiAgICAgICAgICAgICAgICAgICAgZmlscy5wdXNoIHMrcmVzZXRcbiAgICAgICAgICAgICAgICAgICAgYWxwaC5wdXNoIHMrcmVzZXQgaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICAgICAgICAgICAgICAgICAgZnN0cy5wdXNoIHN0YXRcbiAgICAgICAgICAgICAgICAgICAgZXh0cy5wdXNoIGV4dFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5udW1fZmlsZXMgKz0gMVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMuaGlkZGVuX2ZpbGVzICs9IDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgc3RhdC5pc0ZpbGUoKVxuICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9maWxlcyArPSAxXG4gICAgICAgICAgICBlbHNlIGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9kaXJzICs9IDFcblxuICAgIGlmIGFyZ3Muc2l6ZSBvciBhcmdzLmtpbmQgb3IgYXJncy50aW1lXG4gICAgICAgIGlmIGRpcnMubGVuZ3RoIGFuZCBub3QgYXJncy5maWxlc1xuICAgICAgICAgICAgZGlycyA9IHNvcnQgZGlycywgZHN0c1xuICAgICAgICBpZiBmaWxzLmxlbmd0aFxuICAgICAgICAgICAgZmlscyA9IHNvcnQgZmlscywgZnN0cywgZXh0c1xuXG4gICAgaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICAgICAgbG9nIHAgZm9yIHAgaW4gYWxwaFxuICAgIGVsc2VcbiAgICAgICAgbG9nIGQgZm9yIGQgaW4gZGlyc1xuICAgICAgICBsb2cgZiBmb3IgZiBpbiBmaWxzXG5cbiMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwXG5cbmxpc3REaXIgPSAocCwgb3B0PXt9KSAtPlxuICAgICAgICAgICAgXG4gICAgaWYgYXJncy5yZWN1cnNlXG4gICAgICAgIGRlcHRoID0gcGF0aERlcHRoIHAsIG9wdFxuICAgICAgICByZXR1cm4gaWYgZGVwdGggPiBhcmdzLmRlcHRoXG4gICAgXG4gICAgcHMgPSBwXG5cbiAgICB0cnlcbiAgICAgICAgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhwKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICAgIG1zZyA9IGVycm9yLm1lc3NhZ2VcbiAgICAgICAgbXNnID0gXCJwZXJtaXNzaW9uIGRlbmllZFwiIGlmIG1zZy5zdGFydHNXaXRoIFwiRUFDQ0VTXCJcbiAgICAgICAgbG9nX2Vycm9yIG1zZ1xuXG4gICAgaWYgYXJncy5maW5kXG4gICAgICAgIGZpbGVzID0gZmlsZXMuZmlsdGVyIChmKSAtPlxuICAgICAgICAgICAgZiBpZiBSZWdFeHAoYXJncy5maW5kKS50ZXN0IGZcbiAgICAgICAgICAgIFxuICAgIGlmIGFyZ3MuZmluZCBhbmQgbm90IGZpbGVzLmxlbmd0aFxuICAgICAgICB0cnVlXG4gICAgZWxzZSBpZiBhcmdzLnBhdGhzLmxlbmd0aCA9PSAxIGFuZCBhcmdzLnBhdGhzWzBdID09ICcuJyBhbmQgbm90IGFyZ3MucmVjdXJzZVxuICAgICAgICBsb2cgcmVzZXRcbiAgICBlbHNlIGlmIGFyZ3MudHJlZVxuICAgICAgICBsb2cgZ2V0UHJlZml4KHNsYXNoLmlzRGlyKHApLCBkZXB0aC0xKSArIGRpclN0cmluZyhzbGFzaC5iYXNlKHBzKSwgc2xhc2guZXh0KHBzKSkgKyByZXNldFxuICAgIGVsc2VcbiAgICAgICAgcyA9IGNvbG9yc1snX2Fycm93J10gKyBcIiDilrYgXCIgKyBjb2xvcnNbJ19oZWFkZXInXVswXVxuICAgICAgICBwcyA9IHNsYXNoLnJlc29sdmUgcHMgaWYgcHNbMF0gIT0gJ34nXG4gICAgICAgIHBzID0gc2xhc2gucmVsYXRpdmUgcHMsIHByb2Nlc3MuY3dkKClcbiAgICAgICAgIyBpZiBwcy5zdGFydHNXaXRoIHByb2Nlc3MuZW52LlBXRFxuICAgICAgICAgICAgIyBwcyA9IHBzLnN1YnN0ciBwcm9jZXNzLmVudi5QV0QubGVuZ3RoKzFcbiAgICAgICAgIyBlbHNlIGlmIHAuc3RhcnRzV2l0aCBwcm9jZXNzLmVudi5IT01FXG4gICAgICAgICAgICAjIHBzID0gXCJ+XCIgKyBwLnN1YnN0ciBwcm9jZXNzLmVudi5IT01FLmxlbmd0aFxuXG4gICAgICAgIGlmIHBzID09ICcvJ1xuICAgICAgICAgICAgcyArPSAnLydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc3AgPSBwcy5zcGxpdCgnLycpXG4gICAgICAgICAgICBzICs9IGNvbG9yc1snX2hlYWRlciddWzBdICsgc3Auc2hpZnQoKVxuICAgICAgICAgICAgd2hpbGUgc3AubGVuZ3RoXG4gICAgICAgICAgICAgICAgcG4gPSBzcC5zaGlmdCgpXG4gICAgICAgICAgICAgICAgaWYgcG5cbiAgICAgICAgICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVsxXSArICcvJ1xuICAgICAgICAgICAgICAgICAgICBzICs9IGNvbG9yc1snX2hlYWRlciddW3NwLmxlbmd0aCA9PSAwIGFuZCAyIG9yIDBdICsgcG5cbiAgICAgICAgbG9nIHJlc2V0XG4gICAgICAgIGxvZyBzICsgXCIgXCIgKyByZXNldFxuICAgICAgICBsb2cgcmVzZXRcblxuICAgIGlmIGZpbGVzLmxlbmd0aFxuICAgICAgICBsaXN0RmlsZXMgcCwgZmlsZXMsIGRlcHRoXG5cbiAgICBpZiBhcmdzLnJlY3Vyc2VcbiAgICAgICAgXG4gICAgICAgIGRvUmVjdXJzZSA9IChmKSAtPiBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIHNsYXNoLmJhc2VuYW1lKGYpIGluIGFyZ3MuaWdub3JlXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgc2xhc2guZXh0KGYpID09ICdhcHAnXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgbm90IGFyZ3MuYWxsIGFuZCBmWzBdID09ICcuJ1xuICAgICAgICAgICAgc2xhc2guaXNEaXIgc2xhc2guam9pbiBwLCBmXG4gICAgICAgICAgICBcbiAgICAgICAgZm9yIHByIGluIGZzLnJlYWRkaXJTeW5jKHApLmZpbHRlciBkb1JlY3Vyc2VcbiAgICAgICAgICAgIGxpc3REaXIgc2xhc2gucmVzb2x2ZShzbGFzaC5qb2luIHAsIHByKSwgb3B0XG4gICAgICAgICAgICBcbnBhdGhEZXB0aCA9IChwLCBvcHQpIC0+XG4gICAgXG4gICAgcmVsID0gc2xhc2gucmVsYXRpdmUgcCwgb3B0Py5yZWxhdGl2ZVRvID8gcHJvY2Vzcy5jd2QoKVxuICAgIHJldHVybiAwIGlmIHAgPT0gJy4nXG4gICAgcmVsLnNwbGl0KCcvJykubGVuZ3RoXG5cbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuXG5tYWluID0gLT5cbiAgICBcbiAgICBwYXRoc3RhdHMgPSBhcmdzLnBhdGhzLm1hcCAoZikgLT5cbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBbZiwgZnMuc3RhdFN5bmMoZildXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgICBsb2dfZXJyb3IgJ25vIHN1Y2ggZmlsZTogJywgZlxuICAgICAgICAgICAgW11cbiAgICBcbiAgICBmaWxlc3RhdHMgPSBwYXRoc3RhdHMuZmlsdGVyKCAoZikgLT4gZi5sZW5ndGggYW5kIG5vdCBmWzFdLmlzRGlyZWN0b3J5KCkgKVxuICAgIFxuICAgIGlmIGZpbGVzdGF0cy5sZW5ndGggPiAwXG4gICAgICAgIGxvZyByZXNldFxuICAgICAgICBsaXN0RmlsZXMgcHJvY2Vzcy5jd2QoKSwgZmlsZXN0YXRzLm1hcCggKHMpIC0+IHNbMF0gKVxuICAgIFxuICAgIGZvciBwIGluIHBhdGhzdGF0cy5maWx0ZXIoIChmKSAtPiBmLmxlbmd0aCBhbmQgZlsxXS5pc0RpcmVjdG9yeSgpIClcbiAgICAgICAgbG9nICcnIGlmIGFyZ3MudHJlZVxuICAgICAgICBsaXN0RGlyIHBbMF0sIHJlbGF0aXZlVG86YXJncy50cmVlIGFuZCBzbGFzaC5kaXJuYW1lKHBbMF0pIG9yIHByb2Nlc3MuY3dkKClcbiAgICBcbiAgICBsb2cgXCJcIlxuICAgIGlmIGFyZ3MuaW5mb1xuICAgICAgICBrc3RyID0gcmVxdWlyZSAna3hrL2pzL3N0cidcbiAgICAgICAgbG9nIEJXKDEpICsgXCIgXCIgK1xuICAgICAgICBmdyg4KSArIHN0YXRzLm51bV9kaXJzICsgKHN0YXRzLmhpZGRlbl9kaXJzIGFuZCBmdyg0KSArIFwiK1wiICsgZncoNSkgKyAoc3RhdHMuaGlkZGVuX2RpcnMpIG9yIFwiXCIpICsgZncoNCkgKyBcIiBkaXJzIFwiICtcbiAgICAgICAgZncoOCkgKyBzdGF0cy5udW1fZmlsZXMgKyAoc3RhdHMuaGlkZGVuX2ZpbGVzIGFuZCBmdyg0KSArIFwiK1wiICsgZncoNSkgKyAoc3RhdHMuaGlkZGVuX2ZpbGVzKSBvciBcIlwiKSArIGZ3KDQpICsgXCIgZmlsZXMgXCIgK1xuICAgICAgICBmdyg4KSArIGtzdHIudGltZShwcm9jZXNzLmhydGltZS5iaWdpbnQ/KCktc3RhcnRUaW1lKSArIFwiIFwiICtcbiAgICAgICAgcmVzZXRcbiAgICBcbmlmIGFyZ3NcbiAgICBpbml0QXJncygpXG4gICAgbWFpbigpXG5lbHNlXG4gICAgbW9kdWxlTWFpbiA9IChhcmcsIG9wdD17fSkgLT5cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCB0eXBlb2YgYXJnXG4gICAgICAgICAgICB3aGVuICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgYXJncyA9IE9iamVjdC5hc3NpZ24ge30sIG9wdFxuICAgICAgICAgICAgICAgIGFyZ3MucGF0aHMgPz0gW11cbiAgICAgICAgICAgICAgICBhcmdzLnBhdGhzLnB1c2ggYXJnXG4gICAgICAgICAgICB3aGVuICdvYmplY3QnXG4gICAgICAgICAgICAgICAgYXJncyA9IE9iamVjdC5hc3NpZ24ge30sIGFyZ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGFyZ3MgPSBwYXRoczpbJy4nXVxuICAgICAgICBpbml0QXJncygpXG4gICAgICAgIFxuICAgICAgICAjIGxvZyAnYXJnczonLCBhcmdzXG4gICAgICAgIFxuICAgICAgICBvdXQgPSAnJ1xuICAgICAgICBvbGRsb2cgPSBjb25zb2xlLmxvZ1xuICAgICAgICBjb25zb2xlLmxvZyA9IC0+IFxuICAgICAgICAgICAgZm9yIGFyZyBpbiBhcmd1bWVudHMgdGhlbiBvdXQgKz0gU3RyaW5nKGFyZylcbiAgICAgICAgICAgIG91dCArPSAnXFxuJ1xuICAgICAgICBcbiAgICAgICAgbWFpbigpXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyA9IG9sZGxvZ1xuICAgICAgICBvdXRcbiAgICBcbiAgICBtb2R1bGUuZXhwb3J0cyA9IG1vZHVsZU1haW5cbiAgICAiXX0=
//# sourceURL=../coffee/color-ls.coffee