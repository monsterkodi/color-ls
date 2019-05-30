// koffee 0.56.0

/*
 0000000   0000000   000       0000000   00000000           000       0000000
000       000   000  000      000   000  000   000          000      000
000       000   000  000      000   000  0000000    000000  000      0000000
000       000   000  000      000   000  000   000          000           000
 0000000   0000000   0000000   0000000   000   000          0000000  0000000
 */
var BG, BW, ansi, args, bold, colors, dirString, dotString, extString, fg, fs, fw, getPrefix, groupMap, groupName, groupname, ignore, karg, klog, linkString, listDir, listFiles, log_error, lpad, main, nameString, noon, ownerName, ownerString, pathDepth, ref, ref1, ref2, ref3, reset, rightsString, rpad, rwxString, sizeString, slash, sort, startTime, stats, timeString, token, userMap, username, util,
    indexOf = [].indexOf;

startTime = process.hrtime.bigint();

ref = require('kxk/js/str'), lpad = ref.lpad, rpad = ref.rpad;

fs = require('fs');

slash = require('kxk/js/slash');

ansi = require('ansi-256-colors');

util = require('util');

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
        args.paths = ['.'];
    }
}

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
    var childp, e, gids, gnms, i, j, ref4;
    if (!groupMap) {
        try {
            childp = require('child_process');
            gids = childp.spawnSync("id", ["-G"]).stdout.toString('utf8').split(' ');
            gnms = childp.spawnSync("id", ["-Gn"]).stdout.toString('utf8').split(' ');
            groupMap = {};
            for (i = j = 0, ref4 = gids.length; 0 <= ref4 ? j < ref4 : j > ref4; i = 0 <= ref4 ? ++j : --j) {
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
    var icon, icons, ref4;
    if (args.nerdy) {
        icons = require('./icons');
        icon = (colors[(colors[ext] != null) && ext || '_default'][2] + ((ref4 = icons.get(name, ext)) != null ? ref4 : ' ')) + ' ';
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
    var age, col, moment, num, range, ref4, t;
    moment = require('moment');
    t = moment(stat.mtime);
    if (args.pretty) {
        age = moment().to(t, true);
        ref4 = age.split(' '), num = ref4[0], range = ref4[1];
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
    var _, j, k, l, moment, ref4, ref5, results, results1;
    if (exts == null) {
        exts = [];
    }
    _ = require('lodash');
    moment = require('moment');
    l = _.zip(list, stats, (function() {
        results = [];
        for (var j = 0, ref4 = list.length; 0 <= ref4 ? j < ref4 : j > ref4; 0 <= ref4 ? j++ : j--){ results.push(j); }
        return results;
    }).apply(this), exts.length > 0 && exts || (function() {
        results1 = [];
        for (var k = 0, ref5 = list.length; 0 <= ref5 ? k < ref5 : k > ref5; 0 <= ref5 ? k++ : k--){ results1.push(k); }
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
    if (slash.win()) {
        if (p[0] === '$') {
            return true;
        }
        if (p === 'desktop.ini') {
            return true;
        }
        if (p.toLowerCase().startsWith('ntuser')) {
            return true;
        }
    } else {
        if (slash.ext(p) === 'app') {
            return true;
        }
    }
    if (indexOf.call(args.ignore, p) >= 0) {
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

listDir = function(p) {
    var depth, doRecurse, error, files, j, len, msg, pn, pr, ps, ref4, results, s, sp;
    if (ignore(slash.basename(p))) {
        return;
    }
    if (args.recurse) {
        depth = pathDepth(p);
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
        if (ps.startsWith(process.env.PWD)) {
            ps = ps.substr(process.env.PWD.length + 1);
        } else if (p.startsWith(process.env.HOME)) {
            ps = "~" + p.substr(process.env.HOME.length);
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
    if (files.length) {
        listFiles(p, files, depth);
    }
    if (args.recurse) {
        doRecurse = function(f) {
            if (!args.all && f[0] === '.') {
                return false;
            }
            return slash.isDir(slash.join(p, f));
        };
        ref4 = fs.readdirSync(p).filter(doRecurse);
        results = [];
        for (j = 0, len = ref4.length; j < len; j++) {
            pr = ref4[j];
            results.push(listDir(slash.resolve(slash.join(p, pr))));
        }
        return results;
    }
};

pathDepth = function(p) {
    var rel;
    rel = slash.relative(p, process.cwd());
    if (p === '.') {
        return 0;
    }
    return rel.split('/').length;
};

main = function(args) {
    var filestats, j, kstr, len, p, pathstats, ref4;
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
    ref4 = pathstats.filter(function(f) {
        return f.length && f[1].isDirectory();
    });
    for (j = 0, len = ref4.length; j < len; j++) {
        p = ref4[j];
        if (args.tree) {
            console.log('');
        }
        listDir(p[0]);
    }
    console.log("");
    if (args.info) {
        kstr = require('kxk/js/str');
        return console.log(BW(1) + " " + fw(8) + stats.num_dirs + (stats.hidden_dirs && fw(4) + "+" + fw(5) + stats.hidden_dirs || "") + fw(4) + " dirs " + fw(8) + stats.num_files + (stats.hidden_files && fw(4) + "+" + fw(5) + stats.hidden_files || "") + fw(4) + " files " + fw(8) + kstr.time(process.hrtime.bigint() - startTime) + " " + reset);
    }
};

if (args) {
    main(args);
} else {
    module.exports = main;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDRZQUFBO0lBQUE7O0FBUUEsU0FBQSxHQUFZLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBZixDQUFBOztBQUVaLE1BQWlCLE9BQUEsQ0FBUSxZQUFSLENBQWpCLEVBQUUsZUFBRixFQUFROztBQUNSLEVBQUEsR0FBUyxPQUFBLENBQVEsSUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLGNBQVI7O0FBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBRVQsS0FBQSxHQUFROztBQUVSLElBQUEsR0FBUzs7QUFDVCxLQUFBLEdBQVMsSUFBSSxDQUFDOztBQUNkLEVBQUEsR0FBUyxJQUFJLENBQUMsRUFBRSxDQUFDOztBQUNqQixFQUFBLEdBQVMsSUFBSSxDQUFDLEVBQUUsQ0FBQzs7QUFDakIsRUFBQSxHQUFTLFNBQUMsQ0FBRDtXQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBVSxDQUFBLENBQUE7QUFBekI7O0FBQ1QsRUFBQSxHQUFTLFNBQUMsQ0FBRDtXQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBVSxDQUFBLENBQUE7QUFBekI7O0FBRVQsS0FBQSxHQUNJO0lBQUEsUUFBQSxFQUFnQixDQUFoQjtJQUNBLFNBQUEsRUFBZ0IsQ0FEaEI7SUFFQSxXQUFBLEVBQWdCLENBRmhCO0lBR0EsWUFBQSxFQUFnQixDQUhoQjtJQUlBLGNBQUEsRUFBZ0IsQ0FKaEI7SUFLQSxjQUFBLEVBQWdCLENBTGhCO0lBTUEsV0FBQSxFQUFnQixFQU5oQjs7O0FBY0osSUFBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQWQsS0FBb0IsR0FBdkI7SUFFSSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7SUFDUCxJQUFBLEdBQU8sSUFBQSxDQUFLLDJpREFBQSxHQTBCRSxDQUFDLE9BQUEsQ0FBVyxTQUFELEdBQVcsa0JBQXJCLENBQXVDLENBQUMsT0FBekMsQ0ExQlA7SUE2QlAsSUFBRyxJQUFJLENBQUMsSUFBUjtRQUNJLElBQUksQ0FBQyxLQUFMLEdBQWEsS0FEakI7O0lBR0EsSUFBRyxJQUFJLENBQUMsSUFBUjtRQUNJLElBQUksQ0FBQyxLQUFMLEdBQWE7UUFDYixJQUFJLENBQUMsS0FBTCxHQUFhLEtBRmpCOztJQUlBLElBQUcsSUFBSSxDQUFDLElBQVI7UUFDSSxJQUFJLENBQUMsT0FBTCxHQUFlO1FBQ2YsSUFBSSxDQUFDLE1BQUwsR0FBZSxNQUZuQjs7SUFJQSxJQUFHLElBQUksQ0FBQyxJQUFMLElBQWMsSUFBSSxDQUFDLEtBQXRCO1FBQ0ksSUFBSSxDQUFDLElBQUwsR0FBWSxJQUFJLENBQUMsS0FBTCxHQUFhLE1BRDdCOztJQUdBLHVDQUFjLENBQUUsZUFBaEI7UUFDSSxJQUFJLENBQUMsTUFBTCxHQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBWixDQUFrQixHQUFsQixFQURsQjtLQUFBLE1BQUE7UUFHSSxJQUFJLENBQUMsTUFBTCxHQUFjLEdBSGxCOztJQUtBLElBQUcsSUFBSSxDQUFDLEtBQUwsS0FBYyxHQUFqQjtRQUEwQixJQUFJLENBQUMsS0FBTCxHQUFhLE1BQXZDO0tBQUEsTUFBQTtRQUNLLElBQUksQ0FBQyxLQUFMLEdBQWEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVksUUFBQSxDQUFTLElBQUksQ0FBQyxLQUFkLENBQVosRUFEbEI7O0lBRUEsSUFBRyxNQUFNLENBQUMsS0FBUCxDQUFhLElBQUksQ0FBQyxLQUFsQixDQUFIO1FBQWdDLElBQUksQ0FBQyxLQUFMLEdBQWEsRUFBN0M7O0lBRUEsSUFBRyxJQUFJLENBQUMsS0FBUjtRQUNJLE9BQWlCLE9BQUEsQ0FBUSxLQUFSLENBQWpCLEVBQUUsZ0JBQUYsRUFBUTtRQUNSLElBQUEsQ0FBSyxJQUFJLENBQUMsU0FBTCxDQUFlLElBQWYsRUFBcUI7WUFBQSxNQUFBLEVBQU8sSUFBUDtTQUFyQixDQUFMLEVBRko7O0lBSUEsSUFBQSxDQUFBLG9DQUFvQyxDQUFFLGdCQUFaLEdBQXFCLENBQS9DLENBQUE7UUFBQSxJQUFJLENBQUMsS0FBTCxHQUFhLENBQUMsR0FBRCxFQUFiO0tBM0RKOzs7QUFtRUEsTUFBQSxHQUNJO0lBQUEsUUFBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FBWjtJQUNBLFFBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBRFo7SUFFQSxJQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE5QixDQUZaO0lBR0EsSUFBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FIWjtJQUlBLE1BQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBSlo7SUFLQSxNQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE5QixDQUxaO0lBTUEsTUFBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FOWjtJQU9BLE9BQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBUFo7SUFRQSxJQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE5QixDQVJaO0lBU0EsS0FBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBVFo7SUFVQSxHQUFBLEVBQVksQ0FBTyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE5QixDQVZaO0lBV0EsS0FBQSxFQUFZLENBQU8sRUFBQSxDQUFHLENBQUgsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxDQUE5QixDQVhaO0lBWUEsS0FBQSxFQUFZLENBQU8sRUFBQSxDQUFHLENBQUgsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxDQUE5QixDQVpaO0lBYUEsS0FBQSxFQUFZLENBQU8sRUFBQSxDQUFHLENBQUgsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxDQUE5QixDQWJaO0lBY0EsS0FBQSxFQUFZLENBQU8sRUFBQSxDQUFHLEVBQUgsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxDQUE5QixDQWRaO0lBZUEsSUFBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxFQUFILENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsQ0FBOUIsQ0FmWjtJQWdCQSxVQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLEVBQUgsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxDQUE5QixDQWhCWjtJQWlCQSxJQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE5QixDQWpCWjtJQWtCQSxLQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE5QixDQWxCWjtJQW1CQSxLQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE5QixDQW5CWjtJQW9CQSxLQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE5QixDQXBCWjtJQXFCQSxNQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE5QixDQXJCWjtJQXVCQSxVQUFBLEVBQVksQ0FBTyxFQUFBLENBQUcsRUFBSCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILENBQTlCLENBdkJaO0lBd0JBLE1BQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQUwsR0FBZSxFQUFBLENBQUcsRUFBSCxDQUFqQixFQUF5QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQXpCLEVBQW9DLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQUwsR0FBZSxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5ELENBeEJaO0lBeUJBLE9BQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQUwsR0FBZSxFQUFBLENBQUcsRUFBSCxDQUFqQixFQUF5QixJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFMLEdBQWUsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUF4QyxFQUFtRCxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFMLEdBQWUsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFsRSxDQXpCWjtJQTBCQSxPQUFBLEVBQVk7UUFBRSxPQUFBLEVBQVMsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFYO1FBQXNCLE1BQUEsRUFBUSxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCO1FBQXlDLFFBQUEsRUFBVSxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQUEsR0FBVSxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTdEO0tBMUJaO0lBMkJBLFFBQUEsRUFBYyxFQUFBLENBQUcsQ0FBSCxDQUFBLEdBQU0sRUFBQSxDQUFHLENBQUgsQ0EzQnBCO0lBNEJBLFNBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxDQUFMLEdBQVcsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFiLEVBQXlCLEVBQUEsQ0FBRyxDQUFILENBQXpCLEVBQWdDLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxDQUFMLEdBQVcsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUEzQyxDQTVCWjtJQTZCQSxPQUFBLEVBQVk7UUFBRSxDQUFBLEVBQUcsQ0FBQyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQUQsQ0FBTDtRQUFrQixFQUFBLEVBQUksQ0FBQyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQUQsRUFBWSxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVosQ0FBdEI7UUFBOEMsRUFBQSxFQUFJLENBQUMsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFELEVBQVksRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFaLENBQWxEO1FBQTBFLEVBQUEsRUFBSSxDQUFDLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBRCxFQUFZLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBWixDQUE5RTtRQUFzRyxFQUFBLEVBQUksQ0FBQyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQUQsRUFBWSxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVosQ0FBMUc7S0E3Qlo7SUE4QkEsUUFBQSxFQUFZO1FBQUUsSUFBQSxFQUFPLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBVDtRQUFvQixDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBN0I7S0E5Qlo7SUErQkEsU0FBQSxFQUFZO1FBQUUsS0FBQSxFQUFPLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBVDtRQUFvQixLQUFBLEVBQU8sRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUEzQjtRQUFzQyxLQUFBLEVBQU8sRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE3QztRQUF3RCxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBakU7S0EvQlo7SUFnQ0EsUUFBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBTCxHQUFlLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBakIsRUFBNEIsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBTCxHQUFlLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBM0MsQ0FoQ1o7SUFpQ0EsU0FBQSxFQUNjO1FBQUEsSUFBQSxFQUFNLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxDQUFMLEdBQVcsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFqQjtRQUNBLElBQUEsRUFBTSxLQUFBLEdBQU0sRUFBQSxDQUFHLENBQUgsQ0FEWjtRQUVBLElBQUEsRUFBTSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsQ0FBTCxHQUFXLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FGakI7UUFHQSxJQUFBLEVBQU0sS0FBQSxHQUFNLEVBQUEsQ0FBRyxDQUFILENBSFo7UUFJQSxJQUFBLEVBQU0sSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILENBQUwsR0FBVyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBSmpCO1FBS0EsSUFBQSxFQUFNLEtBQUEsR0FBTSxFQUFBLENBQUcsQ0FBSCxDQUxaO0tBbENkOzs7QUF5Q0osT0FBQSxHQUFVOztBQUNWLFFBQUEsR0FBVyxTQUFDLEdBQUQ7QUFDUCxRQUFBO0lBQUEsSUFBRyxDQUFJLE9BQVEsQ0FBQSxHQUFBLENBQWY7QUFDSTtZQUNJLE1BQUEsR0FBUyxPQUFBLENBQVEsZUFBUjtZQUNULE9BQVEsQ0FBQSxHQUFBLENBQVIsR0FBZSxNQUFNLENBQUMsU0FBUCxDQUFpQixJQUFqQixFQUF1QixDQUFDLEtBQUQsRUFBUSxFQUFBLEdBQUcsR0FBWCxDQUF2QixDQUF5QyxDQUFDLE1BQU0sQ0FBQyxRQUFqRCxDQUEwRCxNQUExRCxDQUFpRSxDQUFDLElBQWxFLENBQUEsRUFGbkI7U0FBQSxjQUFBO1lBR007WUFDSCxPQUFBLENBQUMsR0FBRCxDQUFLLENBQUwsRUFKSDtTQURKOztXQU1BLE9BQVEsQ0FBQSxHQUFBO0FBUEQ7O0FBU1gsUUFBQSxHQUFXOztBQUNYLFNBQUEsR0FBWSxTQUFDLEdBQUQ7QUFDUixRQUFBO0lBQUEsSUFBRyxDQUFJLFFBQVA7QUFDSTtZQUNJLE1BQUEsR0FBUyxPQUFBLENBQVEsZUFBUjtZQUNULElBQUEsR0FBTyxNQUFNLENBQUMsU0FBUCxDQUFpQixJQUFqQixFQUF1QixDQUFDLElBQUQsQ0FBdkIsQ0FBOEIsQ0FBQyxNQUFNLENBQUMsUUFBdEMsQ0FBK0MsTUFBL0MsQ0FBc0QsQ0FBQyxLQUF2RCxDQUE2RCxHQUE3RDtZQUNQLElBQUEsR0FBTyxNQUFNLENBQUMsU0FBUCxDQUFpQixJQUFqQixFQUF1QixDQUFDLEtBQUQsQ0FBdkIsQ0FBK0IsQ0FBQyxNQUFNLENBQUMsUUFBdkMsQ0FBZ0QsTUFBaEQsQ0FBdUQsQ0FBQyxLQUF4RCxDQUE4RCxHQUE5RDtZQUNQLFFBQUEsR0FBVztBQUNYLGlCQUFTLHlGQUFUO2dCQUNJLFFBQVMsQ0FBQSxJQUFLLENBQUEsQ0FBQSxDQUFMLENBQVQsR0FBb0IsSUFBSyxDQUFBLENBQUE7QUFEN0IsYUFMSjtTQUFBLGNBQUE7WUFPTTtZQUNILE9BQUEsQ0FBQyxHQUFELENBQUssQ0FBTCxFQVJIO1NBREo7O1dBVUEsUUFBUyxDQUFBLEdBQUE7QUFYRDs7QUFhWixJQUFHLFVBQUEsS0FBYyxPQUFPLE9BQU8sQ0FBQyxNQUFoQztJQUNJLE1BQU8sQ0FBQSxRQUFBLENBQVUsQ0FBQSxRQUFBLENBQVMsT0FBTyxDQUFDLE1BQVIsQ0FBQSxDQUFULENBQUEsQ0FBakIsR0FBK0MsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxFQURuRDs7O0FBU0EsU0FBQSxHQUFZLFNBQUE7V0FFVCxPQUFBLENBQUMsR0FBRCxDQUFLLEdBQUEsR0FBTSxNQUFPLENBQUEsUUFBQSxDQUFVLENBQUEsQ0FBQSxDQUF2QixHQUE0QixHQUE1QixHQUFrQyxJQUFsQyxHQUF5QyxTQUFVLENBQUEsQ0FBQSxDQUFuRCxHQUF3RCxDQUFDLFNBQVMsQ0FBQyxNQUFWLEdBQW1CLENBQW5CLElBQXlCLENBQUMsTUFBTyxDQUFBLFFBQUEsQ0FBVSxDQUFBLENBQUEsQ0FBakIsR0FBc0IsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFULENBQWMsU0FBZCxDQUF3QixDQUFDLEtBQXpCLENBQStCLENBQS9CLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsR0FBdkMsQ0FBdkIsQ0FBekIsSUFBZ0csRUFBakcsQ0FBeEQsR0FBK0osR0FBL0osR0FBcUssS0FBMUs7QUFGUzs7QUFJWixVQUFBLEdBQWEsU0FBQyxJQUFEO0FBRVQsUUFBQTtJQUFBLENBQUEsR0FBSyxLQUFBLEdBQVEsRUFBQSxDQUFHLENBQUgsQ0FBUixHQUFnQixNQUFPLENBQUEsT0FBQSxDQUFTLENBQUEsT0FBQSxDQUFoQyxHQUEyQztJQUNoRCxDQUFBLElBQUssTUFBTyxDQUFBLE9BQUEsQ0FBUyxDQUFBLENBQUMsYUFBUSxLQUFLLENBQUMsV0FBZCxFQUFBLElBQUEsTUFBRCxDQUFBLElBQWdDLFFBQWhDLElBQTRDLE1BQTVDO0FBQ3JCO1FBQ0ksS0FBQSxHQUFRLE9BQUEsQ0FBUSxjQUFSO1FBQ1IsQ0FBQSxJQUFLLEtBQUssQ0FBQyxJQUFOLENBQVcsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsSUFBaEIsQ0FBWCxFQUZUO0tBQUEsY0FBQTtRQUdNO1FBQ0YsQ0FBQSxJQUFLLE1BSlQ7O1dBS0E7QUFUUzs7QUFXYixVQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUVULFFBQUE7SUFBQSxJQUFHLElBQUksQ0FBQyxLQUFSO1FBQ0ksS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSO1FBQ1IsSUFBQSxHQUFPLENBQUMsTUFBTyxDQUFBLHFCQUFBLElBQWlCLEdBQWpCLElBQXdCLFVBQXhCLENBQW9DLENBQUEsQ0FBQSxDQUEzQyxHQUFnRCxnREFBd0IsR0FBeEIsQ0FBakQsQ0FBQSxHQUFpRixJQUY1RjtLQUFBLE1BQUE7UUFJSSxJQUFBLEdBQU8sR0FKWDs7V0FLQSxHQUFBLEdBQU0sSUFBTixHQUFhLE1BQU8sQ0FBQSxxQkFBQSxJQUFpQixHQUFqQixJQUF3QixVQUF4QixDQUFvQyxDQUFBLENBQUEsQ0FBeEQsR0FBNkQsSUFBN0QsR0FBb0U7QUFQM0Q7O0FBU2IsU0FBQSxHQUFhLFNBQUMsR0FBRDtXQUVULE1BQU8sQ0FBQSxxQkFBQSxJQUFpQixHQUFqQixJQUF3QixVQUF4QixDQUFvQyxDQUFBLENBQUEsQ0FBM0MsR0FBZ0QsR0FBaEQsR0FBc0Q7QUFGN0M7O0FBSWIsU0FBQSxHQUFhLFNBQUMsSUFBRCxFQUFPLEdBQVA7QUFFVCxRQUFBO0lBQUEsSUFBRyxJQUFJLENBQUMsS0FBTCxJQUFlLElBQWxCO1FBQ0ksS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSO1FBQ1IsSUFBRyxLQUFLLENBQUMsR0FBTixDQUFVLElBQVYsRUFBZ0IsR0FBaEIsQ0FBSDtBQUE2QixtQkFBTyxHQUFwQztTQUZKOztXQUdBLFNBQUEsQ0FBVSxHQUFWLENBQUEsR0FBaUIsTUFBTyxDQUFBLHFCQUFBLElBQWlCLEdBQWpCLElBQXdCLFVBQXhCLENBQW9DLENBQUEsQ0FBQSxDQUE1RCxHQUFpRSxHQUFqRSxHQUF1RTtBQUw5RDs7QUFPYixTQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUVULFFBQUE7SUFBQSxDQUFBLEdBQUksSUFBQSxJQUFTLE1BQVQsSUFBbUI7SUFDdkIsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLElBQWUsTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBVixHQUFlLFNBQTlCLElBQTJDO1dBQ2xELElBQUEsR0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFqQixHQUFzQixDQUFDLElBQUEsSUFBUyxDQUFDLEdBQUEsR0FBTSxJQUFQLENBQVQsSUFBeUIsR0FBMUIsQ0FBdEIsR0FBdUQsQ0FBSSxHQUFILEdBQVksTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBVixHQUFlLEdBQWYsR0FBcUIsTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBL0IsR0FBb0MsR0FBaEQsR0FBeUQsRUFBMUQsQ0FBdkQsR0FBdUg7QUFKOUc7O0FBTWIsVUFBQSxHQUFhLFNBQUMsSUFBRDtJQUVULElBQUcsSUFBSSxDQUFDLE1BQUwsSUFBZ0IsSUFBSSxDQUFDLElBQUwsS0FBYSxDQUFoQztBQUNJLGVBQU8sSUFBQSxDQUFLLEdBQUwsRUFBVSxFQUFWLEVBRFg7O0lBRUEsSUFBRyxJQUFJLENBQUMsSUFBTCxHQUFZLElBQWY7ZUFDSSxNQUFPLENBQUEsT0FBQSxDQUFTLENBQUEsR0FBQSxDQUFLLENBQUEsQ0FBQSxDQUFyQixHQUEwQixJQUFBLENBQUssSUFBSSxDQUFDLElBQVYsRUFBZ0IsRUFBaEIsQ0FBMUIsR0FBZ0QsSUFEcEQ7S0FBQSxNQUVLLElBQUcsSUFBSSxDQUFDLElBQUwsR0FBWSxPQUFmO1FBQ0QsSUFBRyxJQUFJLENBQUMsTUFBUjttQkFDSSxNQUFPLENBQUEsT0FBQSxDQUFTLENBQUEsSUFBQSxDQUFNLENBQUEsQ0FBQSxDQUF0QixHQUEyQixJQUFBLENBQUssQ0FBQyxJQUFJLENBQUMsSUFBTCxHQUFZLElBQWIsQ0FBa0IsQ0FBQyxPQUFuQixDQUEyQixDQUEzQixDQUFMLEVBQW9DLENBQXBDLENBQTNCLEdBQW9FLEdBQXBFLEdBQTBFLE1BQU8sQ0FBQSxPQUFBLENBQVMsQ0FBQSxJQUFBLENBQU0sQ0FBQSxDQUFBLENBQWhHLEdBQXFHLE1BRHpHO1NBQUEsTUFBQTttQkFHSSxNQUFPLENBQUEsT0FBQSxDQUFTLENBQUEsSUFBQSxDQUFNLENBQUEsQ0FBQSxDQUF0QixHQUEyQixJQUFBLENBQUssSUFBSSxDQUFDLElBQVYsRUFBZ0IsRUFBaEIsQ0FBM0IsR0FBaUQsSUFIckQ7U0FEQztLQUFBLE1BS0EsSUFBRyxJQUFJLENBQUMsSUFBTCxHQUFZLFVBQWY7UUFDRCxJQUFHLElBQUksQ0FBQyxNQUFSO21CQUNJLE1BQU8sQ0FBQSxPQUFBLENBQVMsQ0FBQSxJQUFBLENBQU0sQ0FBQSxDQUFBLENBQXRCLEdBQTJCLElBQUEsQ0FBSyxDQUFDLElBQUksQ0FBQyxJQUFMLEdBQVksT0FBYixDQUFxQixDQUFDLE9BQXRCLENBQThCLENBQTlCLENBQUwsRUFBdUMsQ0FBdkMsQ0FBM0IsR0FBdUUsR0FBdkUsR0FBNkUsTUFBTyxDQUFBLE9BQUEsQ0FBUyxDQUFBLElBQUEsQ0FBTSxDQUFBLENBQUEsQ0FBbkcsR0FBd0csTUFENUc7U0FBQSxNQUFBO21CQUdJLE1BQU8sQ0FBQSxPQUFBLENBQVMsQ0FBQSxJQUFBLENBQU0sQ0FBQSxDQUFBLENBQXRCLEdBQTJCLElBQUEsQ0FBSyxJQUFJLENBQUMsSUFBVixFQUFnQixFQUFoQixDQUEzQixHQUFpRCxJQUhyRDtTQURDO0tBQUEsTUFLQSxJQUFHLElBQUksQ0FBQyxJQUFMLEdBQVksYUFBZjtRQUNELElBQUcsSUFBSSxDQUFDLE1BQVI7bUJBQ0ksTUFBTyxDQUFBLE9BQUEsQ0FBUyxDQUFBLElBQUEsQ0FBTSxDQUFBLENBQUEsQ0FBdEIsR0FBMkIsSUFBQSxDQUFLLENBQUMsSUFBSSxDQUFDLElBQUwsR0FBWSxVQUFiLENBQXdCLENBQUMsT0FBekIsQ0FBaUMsQ0FBakMsQ0FBTCxFQUEwQyxDQUExQyxDQUEzQixHQUEwRSxHQUExRSxHQUFnRixNQUFPLENBQUEsT0FBQSxDQUFTLENBQUEsSUFBQSxDQUFNLENBQUEsQ0FBQSxDQUF0RyxHQUEyRyxNQUQvRztTQUFBLE1BQUE7bUJBR0ksTUFBTyxDQUFBLE9BQUEsQ0FBUyxDQUFBLElBQUEsQ0FBTSxDQUFBLENBQUEsQ0FBdEIsR0FBMkIsSUFBQSxDQUFLLElBQUksQ0FBQyxJQUFWLEVBQWdCLEVBQWhCLENBQTNCLEdBQWlELElBSHJEO1NBREM7S0FBQSxNQUFBO1FBTUQsSUFBRyxJQUFJLENBQUMsTUFBUjttQkFDSSxNQUFPLENBQUEsT0FBQSxDQUFTLENBQUEsSUFBQSxDQUFNLENBQUEsQ0FBQSxDQUF0QixHQUEyQixJQUFBLENBQUssQ0FBQyxJQUFJLENBQUMsSUFBTCxHQUFZLGFBQWIsQ0FBMkIsQ0FBQyxPQUE1QixDQUFvQyxDQUFwQyxDQUFMLEVBQTZDLENBQTdDLENBQTNCLEdBQTZFLEdBQTdFLEdBQW1GLE1BQU8sQ0FBQSxPQUFBLENBQVMsQ0FBQSxJQUFBLENBQU0sQ0FBQSxDQUFBLENBQXpHLEdBQThHLE1BRGxIO1NBQUEsTUFBQTttQkFHSSxNQUFPLENBQUEsT0FBQSxDQUFTLENBQUEsSUFBQSxDQUFNLENBQUEsQ0FBQSxDQUF0QixHQUEyQixJQUFBLENBQUssSUFBSSxDQUFDLElBQVYsRUFBZ0IsRUFBaEIsQ0FBM0IsR0FBaUQsSUFIckQ7U0FOQzs7QUFoQkk7O0FBMkJiLFVBQUEsR0FBYSxTQUFDLElBQUQ7QUFFVCxRQUFBO0lBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSO0lBQ1QsQ0FBQSxHQUFJLE1BQUEsQ0FBTyxJQUFJLENBQUMsS0FBWjtJQUNKLElBQUcsSUFBSSxDQUFDLE1BQVI7UUFDSSxHQUFBLEdBQU0sTUFBQSxDQUFBLENBQVEsQ0FBQyxFQUFULENBQVksQ0FBWixFQUFlLElBQWY7UUFDTixPQUFlLEdBQUcsQ0FBQyxLQUFKLENBQVUsR0FBVixDQUFmLEVBQUMsYUFBRCxFQUFNO1FBQ04sSUFBYSxHQUFJLENBQUEsQ0FBQSxDQUFKLEtBQVUsR0FBdkI7WUFBQSxHQUFBLEdBQU0sSUFBTjs7UUFDQSxJQUFHLEtBQUEsS0FBUyxLQUFaO1lBQ0ksR0FBQSxHQUFNLE1BQUEsQ0FBQSxDQUFRLENBQUMsSUFBVCxDQUFjLENBQWQsRUFBaUIsU0FBakI7WUFDTixLQUFBLEdBQVE7bUJBQ1IsRUFBQSxDQUFHLEVBQUgsQ0FBQSxHQUFTLElBQUEsQ0FBSyxHQUFMLEVBQVUsQ0FBVixDQUFULEdBQXdCLEdBQXhCLEdBQThCLEVBQUEsQ0FBRyxFQUFILENBQTlCLEdBQXVDLElBQUEsQ0FBSyxLQUFMLEVBQVksQ0FBWixDQUF2QyxHQUF3RCxJQUg1RDtTQUFBLE1BSUssSUFBRyxLQUFLLENBQUMsVUFBTixDQUFpQixNQUFqQixDQUFIO21CQUNELEVBQUEsQ0FBRyxDQUFILENBQUEsR0FBUSxJQUFBLENBQUssR0FBTCxFQUFVLENBQVYsQ0FBUixHQUF1QixHQUF2QixHQUE2QixFQUFBLENBQUcsQ0FBSCxDQUE3QixHQUFxQyxJQUFBLENBQUssS0FBTCxFQUFZLENBQVosQ0FBckMsR0FBc0QsSUFEckQ7U0FBQSxNQUVBLElBQUcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsT0FBakIsQ0FBSDttQkFDRCxFQUFBLENBQUcsQ0FBSCxDQUFBLEdBQVEsSUFBQSxDQUFLLEdBQUwsRUFBVSxDQUFWLENBQVIsR0FBdUIsR0FBdkIsR0FBNkIsRUFBQSxDQUFHLENBQUgsQ0FBN0IsR0FBcUMsSUFBQSxDQUFLLEtBQUwsRUFBWSxDQUFaLENBQXJDLEdBQXNELElBRHJEO1NBQUEsTUFFQSxJQUFHLEtBQUssQ0FBQyxVQUFOLENBQWlCLEtBQWpCLENBQUg7bUJBQ0QsRUFBQSxDQUFHLEVBQUgsQ0FBQSxHQUFTLElBQUEsQ0FBSyxHQUFMLEVBQVUsQ0FBVixDQUFULEdBQXdCLEdBQXhCLEdBQThCLEVBQUEsQ0FBRyxDQUFILENBQTlCLEdBQXNDLElBQUEsQ0FBSyxLQUFMLEVBQVksQ0FBWixDQUF0QyxHQUF1RCxJQUR0RDtTQUFBLE1BRUEsSUFBRyxLQUFLLENBQUMsVUFBTixDQUFpQixNQUFqQixDQUFIO21CQUNELEVBQUEsQ0FBRyxFQUFILENBQUEsR0FBUyxJQUFBLENBQUssR0FBTCxFQUFVLENBQVYsQ0FBVCxHQUF3QixHQUF4QixHQUE4QixFQUFBLENBQUcsQ0FBSCxDQUE5QixHQUFzQyxJQUFBLENBQUssS0FBTCxFQUFZLENBQVosQ0FBdEMsR0FBdUQsSUFEdEQ7U0FBQSxNQUFBO21CQUdELEVBQUEsQ0FBRyxFQUFILENBQUEsR0FBUyxJQUFBLENBQUssR0FBTCxFQUFVLENBQVYsQ0FBVCxHQUF3QixHQUF4QixHQUE4QixFQUFBLENBQUcsRUFBSCxDQUE5QixHQUF1QyxJQUFBLENBQUssS0FBTCxFQUFZLENBQVosQ0FBdkMsR0FBd0QsSUFIdkQ7U0FkVDtLQUFBLE1BQUE7ZUFtQkksRUFBQSxDQUFHLEVBQUgsQ0FBQSxHQUFTLElBQUEsQ0FBSyxDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsQ0FBTCxFQUFvQixDQUFwQixDQUFULEdBQWtDLEVBQUEsQ0FBRyxDQUFILENBQWxDLEdBQXdDLEdBQXhDLEdBQ0EsRUFBQSxDQUFHLEVBQUgsQ0FEQSxHQUNTLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxDQURULEdBQzBCLEVBQUEsQ0FBRyxDQUFILENBRDFCLEdBQ2dDLEdBRGhDLEdBRUEsRUFBQSxDQUFJLENBQUosQ0FGQSxHQUVTLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxDQUZULEdBRTBCLEdBRjFCLEdBR0EsRUFBQSxDQUFHLEVBQUgsQ0FIQSxHQUdTLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxDQUhULEdBRzBCLENBQUEsR0FBQSxHQUFNLEVBQUEsQ0FBRyxDQUFILENBQUEsR0FBTSxHQUFOLEdBQ2hDLEVBQUEsQ0FBRyxFQUFILENBRGdDLEdBQ3ZCLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxDQUR1QixHQUNOLENBQUEsR0FBQSxHQUFNLEVBQUEsQ0FBRyxDQUFILENBQUEsR0FBTSxHQUFOLEdBQ2hDLEVBQUEsQ0FBSSxDQUFKLENBRGdDLEdBQ3ZCLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxDQUR1QixHQUNOLEdBREEsQ0FEQSxFQXRCOUI7O0FBSlM7O0FBOEJiLFNBQUEsR0FBWSxTQUFDLElBQUQ7QUFFUjtlQUNJLFFBQUEsQ0FBUyxJQUFJLENBQUMsR0FBZCxFQURKO0tBQUEsY0FBQTtlQUdJLElBQUksQ0FBQyxJQUhUOztBQUZROztBQU9aLFNBQUEsR0FBWSxTQUFDLElBQUQ7QUFFUjtlQUNJLFNBQUEsQ0FBVSxJQUFJLENBQUMsR0FBZixFQURKO0tBQUEsY0FBQTtlQUdJLElBQUksQ0FBQyxJQUhUOztBQUZROztBQU9aLFdBQUEsR0FBYyxTQUFDLElBQUQ7QUFFVixRQUFBO0lBQUEsR0FBQSxHQUFNLFNBQUEsQ0FBVSxJQUFWO0lBQ04sR0FBQSxHQUFNLFNBQUEsQ0FBVSxJQUFWO0lBQ04sR0FBQSxHQUFNLE1BQU8sQ0FBQSxRQUFBLENBQVUsQ0FBQSxHQUFBO0lBQ3ZCLElBQUEsQ0FBeUMsR0FBekM7UUFBQSxHQUFBLEdBQU0sTUFBTyxDQUFBLFFBQUEsQ0FBVSxDQUFBLFNBQUEsRUFBdkI7O0lBQ0EsR0FBQSxHQUFNLE1BQU8sQ0FBQSxTQUFBLENBQVcsQ0FBQSxHQUFBO0lBQ3hCLElBQUEsQ0FBMEMsR0FBMUM7UUFBQSxHQUFBLEdBQU0sTUFBTyxDQUFBLFNBQUEsQ0FBVyxDQUFBLFNBQUEsRUFBeEI7O1dBQ0EsR0FBQSxHQUFNLElBQUEsQ0FBSyxHQUFMLEVBQVUsS0FBSyxDQUFDLGNBQWhCLENBQU4sR0FBd0MsR0FBeEMsR0FBOEMsR0FBOUMsR0FBb0QsSUFBQSxDQUFLLEdBQUwsRUFBVSxLQUFLLENBQUMsY0FBaEI7QUFSMUM7O0FBVWQsU0FBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLENBQVA7V0FFUixDQUFDLENBQUMsQ0FBQyxJQUFBLElBQVEsQ0FBQyxDQUFBLEdBQUUsQ0FBSCxDQUFULENBQUEsR0FBa0IsR0FBbkIsQ0FBQSxJQUE4QixNQUFPLENBQUEsU0FBQSxDQUFXLENBQUEsSUFBQSxDQUFsQixHQUEwQixJQUF4RCxJQUFnRSxNQUFPLENBQUEsU0FBQSxDQUFXLENBQUEsSUFBQSxDQUFsQixHQUEwQixJQUEzRixDQUFBLEdBQ0EsQ0FBQyxDQUFDLENBQUMsSUFBQSxJQUFRLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBVCxDQUFBLEdBQWtCLEdBQW5CLENBQUEsSUFBOEIsTUFBTyxDQUFBLFNBQUEsQ0FBVyxDQUFBLElBQUEsQ0FBbEIsR0FBMEIsSUFBeEQsSUFBZ0UsTUFBTyxDQUFBLFNBQUEsQ0FBVyxDQUFBLElBQUEsQ0FBbEIsR0FBMEIsSUFBM0YsQ0FEQSxHQUVBLENBQUMsQ0FBQyxDQUFDLElBQUEsSUFBUSxDQUFDLENBQUEsR0FBRSxDQUFILENBQVQsQ0FBQSxHQUFrQixHQUFuQixDQUFBLElBQThCLE1BQU8sQ0FBQSxTQUFBLENBQVcsQ0FBQSxJQUFBLENBQWxCLEdBQTBCLElBQXhELElBQWdFLE1BQU8sQ0FBQSxTQUFBLENBQVcsQ0FBQSxJQUFBLENBQWxCLEdBQTBCLElBQTNGO0FBSlE7O0FBTVosWUFBQSxHQUFlLFNBQUMsSUFBRDtBQUVYLFFBQUE7SUFBQSxFQUFBLEdBQUssU0FBQSxDQUFVLElBQUksQ0FBQyxJQUFmLEVBQXFCLENBQXJCLENBQUEsR0FBMEI7SUFDL0IsRUFBQSxHQUFLLFNBQUEsQ0FBVSxJQUFJLENBQUMsSUFBZixFQUFxQixDQUFyQixDQUFBLEdBQTBCO0lBQy9CLEVBQUEsR0FBSyxTQUFBLENBQVUsSUFBSSxDQUFDLElBQWYsRUFBcUIsQ0FBckIsQ0FBQSxHQUEwQjtXQUMvQixFQUFBLEdBQUssRUFBTCxHQUFVLEVBQVYsR0FBZTtBQUxKOztBQU9mLFNBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxLQUFQO0FBRVIsUUFBQTtJQUFBLENBQUEsR0FBSTtJQUNKLElBQUcsSUFBSSxDQUFDLE1BQVI7UUFDSSxDQUFBLElBQUssWUFBQSxDQUFhLElBQWI7UUFDTCxDQUFBLElBQUssSUFGVDs7SUFHQSxJQUFHLElBQUksQ0FBQyxLQUFSO1FBQ0ksQ0FBQSxJQUFLLFdBQUEsQ0FBWSxJQUFaO1FBQ0wsQ0FBQSxJQUFLLElBRlQ7O0lBR0EsSUFBRyxJQUFJLENBQUMsS0FBUjtRQUNJLENBQUEsSUFBSyxVQUFBLENBQVcsSUFBWCxFQURUOztJQUVBLElBQUcsSUFBSSxDQUFDLEtBQVI7UUFDSSxDQUFBLElBQUssVUFBQSxDQUFXLElBQVgsRUFEVDs7SUFHQSxJQUFHLEtBQUEsSUFBVSxJQUFJLENBQUMsSUFBbEI7UUFDSSxDQUFBLElBQUssSUFBQSxDQUFLLEVBQUwsRUFBUyxLQUFBLEdBQU0sQ0FBZixFQURUOztJQUdBLElBQUcsQ0FBQyxDQUFDLE1BQUYsS0FBWSxDQUFaLElBQWtCLElBQUksQ0FBQyxNQUExQjtRQUNJLENBQUEsSUFBSyxVQURUOztXQUVBO0FBbkJROztBQTJCWixJQUFBLEdBQU8sU0FBQyxJQUFELEVBQU8sS0FBUCxFQUFjLElBQWQ7QUFFSCxRQUFBOztRQUZpQixPQUFLOztJQUV0QixDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7SUFDSixNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7SUFFVCxDQUFBLEdBQUksQ0FBQyxDQUFDLEdBQUYsQ0FBTSxJQUFOLEVBQVksS0FBWixFQUFtQjs7OztrQkFBbkIsRUFBdUMsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUFkLElBQW9CLElBQXBCLElBQTRCOzs7O2tCQUFuRTtJQUVKLElBQUcsSUFBSSxDQUFDLElBQVI7UUFDSSxJQUFHLElBQUEsS0FBUSxFQUFYO0FBQW1CLG1CQUFPLEtBQTFCOztRQUNBLENBQUMsQ0FBQyxJQUFGLENBQU8sU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNILGdCQUFBO1lBQUEsSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU8sQ0FBRSxDQUFBLENBQUEsQ0FBWjtBQUFvQix1QkFBTyxFQUEzQjs7WUFDQSxJQUFHLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBTyxDQUFFLENBQUEsQ0FBQSxDQUFaO0FBQW9CLHVCQUFPLENBQUMsRUFBNUI7O1lBQ0EsSUFBRyxJQUFJLENBQUMsSUFBUjtnQkFDSSxDQUFBLEdBQUksTUFBQSxDQUFPLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFaO2dCQUNKLElBQUcsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixDQUFIO0FBQThCLDJCQUFPLEVBQXJDOztnQkFDQSxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWhCLENBQUg7QUFBK0IsMkJBQU8sQ0FBQyxFQUF2QztpQkFISjs7WUFJQSxJQUFHLElBQUksQ0FBQyxJQUFSO2dCQUNJLElBQUcsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQUwsR0FBWSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBcEI7QUFBOEIsMkJBQU8sRUFBckM7O2dCQUNBLElBQUcsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQUwsR0FBWSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBcEI7QUFBOEIsMkJBQU8sQ0FBQyxFQUF0QztpQkFGSjs7WUFHQSxJQUFHLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBTyxDQUFFLENBQUEsQ0FBQSxDQUFaO0FBQW9CLHVCQUFPLEVBQTNCOzttQkFDQSxDQUFDO1FBWEUsQ0FBUCxFQUZKO0tBQUEsTUFjSyxJQUFHLElBQUksQ0FBQyxJQUFSO1FBQ0QsQ0FBQyxDQUFDLElBQUYsQ0FBTyxTQUFDLENBQUQsRUFBRyxDQUFIO0FBQ0gsZ0JBQUE7WUFBQSxDQUFBLEdBQUksTUFBQSxDQUFPLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFaO1lBQ0osSUFBRyxDQUFDLENBQUMsT0FBRixDQUFVLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLENBQUg7QUFBOEIsdUJBQU8sRUFBckM7O1lBQ0EsSUFBRyxDQUFDLENBQUMsUUFBRixDQUFXLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFoQixDQUFIO0FBQStCLHVCQUFPLENBQUMsRUFBdkM7O1lBQ0EsSUFBRyxJQUFJLENBQUMsSUFBUjtnQkFDSSxJQUFHLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFMLEdBQVksQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQXBCO0FBQThCLDJCQUFPLEVBQXJDOztnQkFDQSxJQUFHLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFMLEdBQVksQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQXBCO0FBQThCLDJCQUFPLENBQUMsRUFBdEM7aUJBRko7O1lBR0EsSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU8sQ0FBRSxDQUFBLENBQUEsQ0FBWjtBQUFvQix1QkFBTyxFQUEzQjs7bUJBQ0EsQ0FBQztRQVJFLENBQVAsRUFEQztLQUFBLE1BVUEsSUFBRyxJQUFJLENBQUMsSUFBUjtRQUNELENBQUMsQ0FBQyxJQUFGLENBQU8sU0FBQyxDQUFELEVBQUcsQ0FBSDtZQUNILElBQUcsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQUwsR0FBWSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBcEI7QUFBOEIsdUJBQU8sRUFBckM7O1lBQ0EsSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBTCxHQUFZLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFwQjtBQUE4Qix1QkFBTyxDQUFDLEVBQXRDOztZQUNBLElBQUcsQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLENBQUUsQ0FBQSxDQUFBLENBQVo7QUFBb0IsdUJBQU8sRUFBM0I7O21CQUNBLENBQUM7UUFKRSxDQUFQLEVBREM7O1dBTUwsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFSLENBQVcsQ0FBQSxDQUFBO0FBckNSOztBQTZDUCxNQUFBLEdBQVMsU0FBQyxDQUFEO0lBRUwsSUFBRyxLQUFLLENBQUMsR0FBTixDQUFBLENBQUg7UUFDSSxJQUFlLENBQUUsQ0FBQSxDQUFBLENBQUYsS0FBUSxHQUF2QjtBQUFBLG1CQUFPLEtBQVA7O1FBQ0EsSUFBZSxDQUFBLEtBQUssYUFBcEI7QUFBQSxtQkFBTyxLQUFQOztRQUNBLElBQWUsQ0FBQyxDQUFDLFdBQUYsQ0FBQSxDQUFlLENBQUMsVUFBaEIsQ0FBMkIsUUFBM0IsQ0FBZjtBQUFBLG1CQUFPLEtBQVA7U0FISjtLQUFBLE1BQUE7UUFLSSxJQUFlLEtBQUssQ0FBQyxHQUFOLENBQVUsQ0FBVixDQUFBLEtBQWdCLEtBQS9CO0FBQUEsbUJBQU8sS0FBUDtTQUxKOztJQU9BLElBQWUsYUFBSyxJQUFJLENBQUMsTUFBVixFQUFBLENBQUEsTUFBZjtBQUFBLGVBQU8sS0FBUDs7V0FDQTtBQVZLOztBQWtCVCxTQUFBLEdBQVksU0FBQyxDQUFELEVBQUksS0FBSixFQUFXLEtBQVg7QUFFUixRQUFBO0lBQUEsSUFBYSxJQUFJLENBQUMsWUFBbEI7UUFBQSxJQUFBLEdBQU8sR0FBUDs7SUFDQSxJQUFBLEdBQU87SUFDUCxJQUFBLEdBQU87SUFDUCxJQUFBLEdBQU87SUFDUCxJQUFBLEdBQU87SUFDUCxJQUFBLEdBQU87SUFFUCxJQUFHLElBQUksQ0FBQyxLQUFSO1FBRUksS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFDLEVBQUQ7QUFDVixnQkFBQTtZQUFBLElBQUcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsRUFBakIsQ0FBSDtnQkFDSSxJQUFBLEdBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxFQUFkLEVBRFg7YUFBQSxNQUFBO2dCQUdJLElBQUEsR0FBUSxLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsRUFBYyxFQUFkLEVBSFo7O0FBSUE7Z0JBQ0ksSUFBQSxHQUFPLEVBQUUsQ0FBQyxTQUFILENBQWEsSUFBYjtnQkFDUCxFQUFBLEdBQUssU0FBQSxDQUFVLElBQVYsQ0FBZSxDQUFDO2dCQUNyQixFQUFBLEdBQUssU0FBQSxDQUFVLElBQVYsQ0FBZSxDQUFDO2dCQUNyQixJQUFHLEVBQUEsR0FBSyxLQUFLLENBQUMsY0FBZDtvQkFDSSxLQUFLLENBQUMsY0FBTixHQUF1QixHQUQzQjs7Z0JBRUEsSUFBRyxFQUFBLEdBQUssS0FBSyxDQUFDLGNBQWQ7MkJBQ0ksS0FBSyxDQUFDLGNBQU4sR0FBdUIsR0FEM0I7aUJBTko7YUFBQSxjQUFBO0FBQUE7O1FBTFUsQ0FBZCxFQUZKOztJQWtCQSxLQUFLLENBQUMsT0FBTixDQUFjLFNBQUMsRUFBRDtBQUVWLFlBQUE7UUFBQSxJQUFHLEtBQUssQ0FBQyxVQUFOLENBQWlCLEVBQWpCLENBQUg7WUFDSSxJQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxFQUFkLEVBRFo7U0FBQSxNQUFBO1lBR0ksSUFBQSxHQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLEVBQWMsRUFBZCxDQUFkLEVBSFo7O1FBS0EsSUFBVSxNQUFBLENBQU8sRUFBUCxDQUFWO0FBQUEsbUJBQUE7O0FBRUE7WUFDSSxLQUFBLEdBQVEsRUFBRSxDQUFDLFNBQUgsQ0FBYSxJQUFiO1lBQ1IsSUFBQSxHQUFRLEtBQUssQ0FBQyxjQUFOLENBQUE7WUFDUixJQUFBLEdBQVEsSUFBQSxJQUFTLEVBQUUsQ0FBQyxRQUFILENBQVksSUFBWixDQUFULElBQThCLE1BSDFDO1NBQUEsY0FBQTtZQUtJLElBQUcsSUFBSDtnQkFDSSxJQUFBLEdBQU87Z0JBQ1AsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFsQixDQUF1QixJQUF2QixFQUZKO2FBQUEsTUFBQTtnQkFJSSxTQUFBLENBQVUsbUJBQVYsRUFBK0IsSUFBL0IsRUFBcUMsSUFBckM7QUFDQSx1QkFMSjthQUxKOztRQVlBLEdBQUEsR0FBTyxLQUFLLENBQUMsR0FBTixDQUFVLElBQVY7UUFDUCxJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYO1FBRVAsSUFBRyxJQUFLLENBQUEsQ0FBQSxDQUFMLEtBQVcsR0FBZDtZQUNJLEdBQUEsR0FBTSxJQUFJLENBQUMsTUFBTCxDQUFZLENBQVosQ0FBQSxHQUFpQixLQUFLLENBQUMsT0FBTixDQUFjLElBQWQ7WUFDdkIsSUFBQSxHQUFPLEdBRlg7O1FBSUEsSUFBRyxJQUFJLENBQUMsTUFBTCxJQUFnQixJQUFLLENBQUEsSUFBSSxDQUFDLE1BQUwsR0FBWSxDQUFaLENBQUwsS0FBdUIsSUFBdkMsSUFBK0MsSUFBSSxDQUFDLEdBQXZEO1lBRUksQ0FBQSxHQUFJLFNBQUEsQ0FBVSxJQUFWLEVBQWdCLEtBQWhCO1lBRUosSUFBRyxJQUFJLENBQUMsV0FBTCxDQUFBLENBQUg7Z0JBQ0ksSUFBRyxDQUFJLElBQUksQ0FBQyxLQUFaO29CQUNJLElBQUcsQ0FBSSxJQUFJLENBQUMsSUFBWjt3QkFDSSxJQUFHLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQUg7NEJBQ0ksSUFBQSxHQUFPLElBQUssVUFEaEI7O3dCQUdBLENBQUEsSUFBSyxTQUFBLENBQVUsSUFBVixFQUFnQixHQUFoQjt3QkFDTCxJQUFHLElBQUg7NEJBQ0ksQ0FBQSxJQUFLLFVBQUEsQ0FBVyxJQUFYLEVBRFQ7O3dCQUVBLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQSxHQUFFLEtBQVo7d0JBQ0EsSUFBcUIsSUFBSSxDQUFDLFlBQTFCOzRCQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQSxHQUFFLEtBQVosRUFBQTt5QkFSSjs7b0JBU0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWOzJCQUNBLEtBQUssQ0FBQyxRQUFOLElBQWtCLEVBWHRCO2lCQUFBLE1BQUE7MkJBYUksS0FBSyxDQUFDLFdBQU4sSUFBcUIsRUFiekI7aUJBREo7YUFBQSxNQUFBO2dCQWdCSSxJQUFHLENBQUksSUFBSSxDQUFDLElBQVo7b0JBQ0ksQ0FBQSxJQUFLLFVBQUEsQ0FBVyxJQUFYLEVBQWlCLEdBQWpCO29CQUNMLElBQUcsR0FBSDt3QkFDSSxDQUFBLElBQUssU0FBQSxDQUFVLElBQVYsRUFBZ0IsR0FBaEIsRUFEVDs7b0JBRUEsSUFBRyxJQUFIO3dCQUNJLENBQUEsSUFBSyxVQUFBLENBQVcsSUFBWCxFQURUOztvQkFFQSxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUEsR0FBRSxLQUFaO29CQUNBLElBQXFCLElBQUksQ0FBQyxZQUExQjt3QkFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUEsR0FBRSxLQUFaLEVBQUE7O29CQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVjtvQkFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVY7MkJBQ0EsS0FBSyxDQUFDLFNBQU4sSUFBbUIsRUFWdkI7aUJBQUEsTUFBQTsyQkFZSSxLQUFLLENBQUMsWUFBTixJQUFzQixFQVoxQjtpQkFoQko7YUFKSjtTQUFBLE1BQUE7WUFrQ0ksSUFBRyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUg7dUJBQ0ksS0FBSyxDQUFDLFlBQU4sSUFBc0IsRUFEMUI7YUFBQSxNQUVLLElBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBQSxDQUFIO3VCQUNELEtBQUssQ0FBQyxXQUFOLElBQXFCLEVBRHBCO2FBcENUOztJQTVCVSxDQUFkO0lBbUVBLElBQUcsSUFBSSxDQUFDLElBQUwsSUFBYSxJQUFJLENBQUMsSUFBbEIsSUFBMEIsSUFBSSxDQUFDLElBQWxDO1FBQ0ksSUFBRyxJQUFJLENBQUMsTUFBTCxJQUFnQixDQUFJLElBQUksQ0FBQyxLQUE1QjtZQUNJLElBQUEsR0FBTyxJQUFBLENBQUssSUFBTCxFQUFXLElBQVgsRUFEWDs7UUFFQSxJQUFHLElBQUksQ0FBQyxNQUFSO1lBQ0ksSUFBQSxHQUFPLElBQUEsQ0FBSyxJQUFMLEVBQVcsSUFBWCxFQUFpQixJQUFqQixFQURYO1NBSEo7O0lBTUEsSUFBRyxJQUFJLENBQUMsWUFBUjtBQUNHO2FBQUEsc0NBQUE7O3lCQUFBLE9BQUEsQ0FBQyxHQUFELENBQUssQ0FBTDtBQUFBO3VCQURIO0tBQUEsTUFBQTtBQUdHLGFBQUEsd0NBQUE7O1lBQUEsT0FBQSxDQUFDLEdBQUQsQ0FBSyxDQUFMO0FBQUE7QUFBb0I7YUFBQSx3Q0FBQTs7MEJBQUEsT0FBQSxDQUNuQixHQURtQixDQUNmLENBRGU7QUFBQTt3QkFIdkI7O0FBcEdROztBQWdIWixPQUFBLEdBQVUsU0FBQyxDQUFEO0FBRU4sUUFBQTtJQUFBLElBQVUsTUFBQSxDQUFPLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FBZixDQUFQLENBQVY7QUFBQSxlQUFBOztJQUVBLElBQUcsSUFBSSxDQUFDLE9BQVI7UUFDSSxLQUFBLEdBQVEsU0FBQSxDQUFVLENBQVY7UUFDUixJQUFVLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBdkI7QUFBQSxtQkFBQTtTQUZKOztJQUlBLEVBQUEsR0FBSztBQUVMO1FBQ0ksS0FBQSxHQUFRLEVBQUUsQ0FBQyxXQUFILENBQWUsQ0FBZixFQURaO0tBQUEsY0FBQTtRQUVNO1FBQ0YsR0FBQSxHQUFNLEtBQUssQ0FBQztRQUNaLElBQTZCLEdBQUcsQ0FBQyxVQUFKLENBQWUsUUFBZixDQUE3QjtZQUFBLEdBQUEsR0FBTSxvQkFBTjs7UUFDQSxTQUFBLENBQVUsR0FBVixFQUxKOztJQU9BLElBQUcsSUFBSSxDQUFDLElBQVI7UUFDSSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxTQUFDLENBQUQ7WUFDakIsSUFBSyxNQUFBLENBQU8sSUFBSSxDQUFDLElBQVosQ0FBaUIsQ0FBQyxJQUFsQixDQUF1QixDQUF2QixDQUFMO3VCQUFBLEVBQUE7O1FBRGlCLENBQWIsRUFEWjs7SUFJQSxJQUFHLElBQUksQ0FBQyxJQUFMLElBQWMsQ0FBSSxLQUFLLENBQUMsTUFBM0I7UUFDSSxLQURKO0tBQUEsTUFFSyxJQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBWCxLQUFxQixDQUFyQixJQUEyQixJQUFJLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBWCxLQUFpQixHQUE1QyxJQUFvRCxDQUFJLElBQUksQ0FBQyxPQUFoRTtRQUNGLE9BQUEsQ0FBQyxHQUFELENBQUssS0FBTCxFQURFO0tBQUEsTUFFQSxJQUFHLElBQUksQ0FBQyxJQUFSO1FBQ0YsT0FBQSxDQUFDLEdBQUQsQ0FBSyxTQUFBLENBQVUsS0FBSyxDQUFDLEtBQU4sQ0FBWSxDQUFaLENBQVYsRUFBMEIsS0FBQSxHQUFNLENBQWhDLENBQUEsR0FBcUMsU0FBQSxDQUFVLEtBQUssQ0FBQyxJQUFOLENBQVcsRUFBWCxDQUFWLEVBQTBCLEtBQUssQ0FBQyxHQUFOLENBQVUsRUFBVixDQUExQixDQUFyQyxHQUFnRixLQUFyRixFQURFO0tBQUEsTUFBQTtRQUdELENBQUEsR0FBSSxNQUFPLENBQUEsUUFBQSxDQUFQLEdBQW1CLEtBQW5CLEdBQTJCLE1BQU8sQ0FBQSxTQUFBLENBQVcsQ0FBQSxDQUFBO1FBQ2pELElBQXlCLEVBQUcsQ0FBQSxDQUFBLENBQUgsS0FBUyxHQUFsQztZQUFBLEVBQUEsR0FBSyxLQUFLLENBQUMsT0FBTixDQUFjLEVBQWQsRUFBTDs7UUFDQSxJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUExQixDQUFIO1lBQ0ksRUFBQSxHQUFLLEVBQUUsQ0FBQyxNQUFILENBQVUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBaEIsR0FBdUIsQ0FBakMsRUFEVDtTQUFBLE1BRUssSUFBRyxDQUFDLENBQUMsVUFBRixDQUFhLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBekIsQ0FBSDtZQUNELEVBQUEsR0FBSyxHQUFBLEdBQU0sQ0FBQyxDQUFDLE1BQUYsQ0FBUyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUExQixFQURWOztRQUdMLElBQUcsRUFBQSxLQUFNLEdBQVQ7WUFDSSxDQUFBLElBQUssSUFEVDtTQUFBLE1BQUE7WUFHSSxFQUFBLEdBQUssRUFBRSxDQUFDLEtBQUgsQ0FBUyxHQUFUO1lBQ0wsQ0FBQSxJQUFLLE1BQU8sQ0FBQSxTQUFBLENBQVcsQ0FBQSxDQUFBLENBQWxCLEdBQXVCLEVBQUUsQ0FBQyxLQUFILENBQUE7QUFDNUIsbUJBQU0sRUFBRSxDQUFDLE1BQVQ7Z0JBQ0ksRUFBQSxHQUFLLEVBQUUsQ0FBQyxLQUFILENBQUE7Z0JBQ0wsSUFBRyxFQUFIO29CQUNJLENBQUEsSUFBSyxNQUFPLENBQUEsU0FBQSxDQUFXLENBQUEsQ0FBQSxDQUFsQixHQUF1QjtvQkFDNUIsQ0FBQSxJQUFLLE1BQU8sQ0FBQSxTQUFBLENBQVcsQ0FBQSxFQUFFLENBQUMsTUFBSCxLQUFhLENBQWIsSUFBbUIsQ0FBbkIsSUFBd0IsQ0FBeEIsQ0FBbEIsR0FBK0MsR0FGeEQ7O1lBRkosQ0FMSjs7UUFVQSxPQUFBLENBQUEsR0FBQSxDQUFJLEtBQUo7UUFBUyxPQUFBLENBQ1QsR0FEUyxDQUNMLENBQUEsR0FBSSxHQUFKLEdBQVUsS0FETDtRQUNVLE9BQUEsQ0FDbkIsR0FEbUIsQ0FDZixLQURlLEVBckJsQjs7SUF3QkwsSUFBRyxLQUFLLENBQUMsTUFBVDtRQUNJLFNBQUEsQ0FBVSxDQUFWLEVBQWEsS0FBYixFQUFvQixLQUFwQixFQURKOztJQUdBLElBQUcsSUFBSSxDQUFDLE9BQVI7UUFFSSxTQUFBLEdBQVksU0FBQyxDQUFEO1lBQ1IsSUFBZ0IsQ0FBSSxJQUFJLENBQUMsR0FBVCxJQUFpQixDQUFFLENBQUEsQ0FBQSxDQUFGLEtBQVEsR0FBekM7QUFBQSx1QkFBTyxNQUFQOzttQkFDQSxLQUFLLENBQUMsS0FBTixDQUFZLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxFQUFjLENBQWQsQ0FBWjtRQUZRO0FBSVo7QUFBQTthQUFBLHNDQUFBOzt5QkFDSSxPQUFBLENBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsRUFBYyxFQUFkLENBQWQsQ0FBUjtBQURKO3VCQU5KOztBQXBETTs7QUE2RFYsU0FBQSxHQUFZLFNBQUMsQ0FBRDtBQUVSLFFBQUE7SUFBQSxHQUFBLEdBQU0sS0FBSyxDQUFDLFFBQU4sQ0FBZSxDQUFmLEVBQWtCLE9BQU8sQ0FBQyxHQUFSLENBQUEsQ0FBbEI7SUFDTixJQUFZLENBQUEsS0FBSyxHQUFqQjtBQUFBLGVBQU8sRUFBUDs7V0FDQSxHQUFHLENBQUMsS0FBSixDQUFVLEdBQVYsQ0FBYyxDQUFDO0FBSlA7O0FBWVosSUFBQSxHQUFPLFNBQUMsSUFBRDtBQUVILFFBQUE7SUFBQSxTQUFBLEdBQVksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFYLENBQWUsU0FBQyxDQUFEO0FBQ3ZCLFlBQUE7QUFBQTttQkFDSSxDQUFDLENBQUQsRUFBSSxFQUFFLENBQUMsUUFBSCxDQUFZLENBQVosQ0FBSixFQURKO1NBQUEsY0FBQTtZQUVNO1lBQ0YsU0FBQSxDQUFVLGdCQUFWLEVBQTRCLENBQTVCO21CQUNBLEdBSko7O0lBRHVCLENBQWY7SUFPWixTQUFBLEdBQVksU0FBUyxDQUFDLE1BQVYsQ0FBa0IsU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDLE1BQUYsSUFBYSxDQUFJLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFMLENBQUE7SUFBeEIsQ0FBbEI7SUFFWixJQUFHLFNBQVMsQ0FBQyxNQUFWLEdBQW1CLENBQXRCO1FBQ0csT0FBQSxDQUFDLEdBQUQsQ0FBSyxLQUFMO1FBQ0MsU0FBQSxDQUFVLE9BQU8sQ0FBQyxHQUFSLENBQUEsQ0FBVixFQUF5QixTQUFTLENBQUMsR0FBVixDQUFlLFNBQUMsQ0FBRDttQkFBTyxDQUFFLENBQUEsQ0FBQTtRQUFULENBQWYsQ0FBekIsRUFGSjs7QUFJQTs7O0FBQUEsU0FBQSxzQ0FBQTs7UUFDRyxJQUFXLElBQUksQ0FBQyxJQUFoQjtZQUFBLE9BQUEsQ0FBQyxHQUFELENBQUssRUFBTCxFQUFBOztRQUNDLE9BQUEsQ0FBUSxDQUFFLENBQUEsQ0FBQSxDQUFWO0FBRko7SUFJQSxPQUFBLENBQUEsR0FBQSxDQUFJLEVBQUo7SUFDQSxJQUFHLElBQUksQ0FBQyxJQUFSO1FBQ0ksSUFBQSxHQUFPLE9BQUEsQ0FBUSxZQUFSO2VBQW9CLE9BQUEsQ0FDM0IsR0FEMkIsQ0FDdkIsRUFBQSxDQUFHLENBQUgsQ0FBQSxHQUFRLEdBQVIsR0FDSixFQUFBLENBQUcsQ0FBSCxDQURJLEdBQ0ksS0FBSyxDQUFDLFFBRFYsR0FDcUIsQ0FBQyxLQUFLLENBQUMsV0FBTixJQUFzQixFQUFBLENBQUcsQ0FBSCxDQUFBLEdBQVEsR0FBUixHQUFjLEVBQUEsQ0FBRyxDQUFILENBQWQsR0FBdUIsS0FBSyxDQUFDLFdBQW5ELElBQW1FLEVBQXBFLENBRHJCLEdBQytGLEVBQUEsQ0FBRyxDQUFILENBRC9GLEdBQ3VHLFFBRHZHLEdBRUosRUFBQSxDQUFHLENBQUgsQ0FGSSxHQUVJLEtBQUssQ0FBQyxTQUZWLEdBRXNCLENBQUMsS0FBSyxDQUFDLFlBQU4sSUFBdUIsRUFBQSxDQUFHLENBQUgsQ0FBQSxHQUFRLEdBQVIsR0FBYyxFQUFBLENBQUcsQ0FBSCxDQUFkLEdBQXVCLEtBQUssQ0FBQyxZQUFwRCxJQUFxRSxFQUF0RSxDQUZ0QixHQUVrRyxFQUFBLENBQUcsQ0FBSCxDQUZsRyxHQUUwRyxTQUYxRyxHQUdKLEVBQUEsQ0FBRyxDQUFILENBSEksR0FHSSxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBZixDQUFBLENBQUEsR0FBd0IsU0FBbEMsQ0FISixHQUdtRCxHQUhuRCxHQUlKLEtBTDJCLEVBRC9COztBQXBCRzs7QUE0QlAsSUFBRyxJQUFIO0lBQ0ksSUFBQSxDQUFLLElBQUwsRUFESjtDQUFBLE1BQUE7SUFHSSxNQUFNLENBQUMsT0FBUCxHQUFpQixLQUhyQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgICAgMDAwICAgICAgIDAwMDAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgIDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAgICAwMDBcbiAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAgICAgIDAwMDAwMDAgIDAwMDAwMDBcbiMjI1xuXG5zdGFydFRpbWUgPSBwcm9jZXNzLmhydGltZS5iaWdpbnQoKVxuXG57IGxwYWQsIHJwYWQgfSA9IHJlcXVpcmUgJ2t4ay9qcy9zdHInXG5mcyAgICAgPSByZXF1aXJlICdmcydcbnNsYXNoICA9IHJlcXVpcmUgJ2t4ay9qcy9zbGFzaCdcbmFuc2kgICA9IHJlcXVpcmUgJ2Fuc2ktMjU2LWNvbG9ycydcbnV0aWwgICA9IHJlcXVpcmUgJ3V0aWwnXG5cbnRva2VuID0ge31cblxuYm9sZCAgID0gJ1xceDFiWzFtJ1xucmVzZXQgID0gYW5zaS5yZXNldFxuZmcgICAgID0gYW5zaS5mZy5nZXRSZ2JcbkJHICAgICA9IGFuc2kuYmcuZ2V0UmdiXG5mdyAgICAgPSAoaSkgLT4gYW5zaS5mZy5ncmF5c2NhbGVbaV1cbkJXICAgICA9IChpKSAtPiBhbnNpLmJnLmdyYXlzY2FsZVtpXVxuXG5zdGF0cyA9ICMgY291bnRlcnMgZm9yIChoaWRkZW4pIGRpcnMvZmlsZXNcbiAgICBudW1fZGlyczogICAgICAgMFxuICAgIG51bV9maWxlczogICAgICAwXG4gICAgaGlkZGVuX2RpcnM6ICAgIDBcbiAgICBoaWRkZW5fZmlsZXM6ICAgMFxuICAgIG1heE93bmVyTGVuZ3RoOiAwXG4gICAgbWF4R3JvdXBMZW5ndGg6IDBcbiAgICBicm9rZW5MaW5rczogICAgW11cblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDBcbiMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgMDAwMCAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbmlmIG1vZHVsZS5wYXJlbnQuaWQgPT0gJy4nXG5cbiAgICBrYXJnID0gcmVxdWlyZSAna2FyZydcbiAgICBhcmdzID0ga2FyZyBcIlwiXCJcbiAgICBjb2xvci1sc1xuICAgICAgICBwYXRocyAgICAgICAgIC4gPyB0aGUgZmlsZShzKSBhbmQvb3IgZm9sZGVyKHMpIHRvIGRpc3BsYXkgLiAqKlxuICAgICAgICBhbGwgICAgICAgICAgIC4gPyBzaG93IGRvdCBmaWxlcyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBkaXJzICAgICAgICAgIC4gPyBzaG93IG9ubHkgZGlycyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBmaWxlcyAgICAgICAgIC4gPyBzaG93IG9ubHkgZmlsZXMgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBieXRlcyAgICAgICAgIC4gPyBpbmNsdWRlIHNpemUgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBtZGF0ZSAgICAgICAgIC4gPyBpbmNsdWRlIG1vZGlmaWNhdGlvbiBkYXRlICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBsb25nICAgICAgICAgIC4gPyBpbmNsdWRlIHNpemUgYW5kIGRhdGUgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBvd25lciAgICAgICAgIC4gPyBpbmNsdWRlIG93bmVyIGFuZCBncm91cCAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICByaWdodHMgICAgICAgIC4gPyBpbmNsdWRlIHJpZ2h0cyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBzaXplICAgICAgICAgIC4gPyBzb3J0IGJ5IHNpemUgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICB0aW1lICAgICAgICAgIC4gPyBzb3J0IGJ5IHRpbWUgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBraW5kICAgICAgICAgIC4gPyBzb3J0IGJ5IGtpbmQgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBuZXJkeSAgICAgICAgIC4gPyB1c2UgbmVyZCBmb250IGljb25zICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgICAgICBwcmV0dHkgICAgICAgIC4gPyBwcmV0dHkgc2l6ZSBhbmQgYWdlICAgICAgICAgICAgIC4gPSB0cnVlXG4gICAgICAgIGlnbm9yZSAgICAgICAgLiA/IGRvbid0IHJlY3Vyc2UgaW50byAgICAgICAgICAgICAgLiA9IG5vZGVfbW9kdWxlc1xuICAgICAgICBpbmZvICAgICAgICAgIC4gPyBzaG93IHN0YXRpc3RpY3MgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gSVxuICAgICAgICBhbHBoYWJldGljYWwgIC4gPyBkb24ndCBncm91cCBkaXJzIGJlZm9yZSBmaWxlcyAgIC4gPSBmYWxzZSAuIC0gQVxuICAgICAgICBvZmZzZXQgICAgICAgIC4gPyBpbmRlbnQgc2hvcnQgbGlzdGluZ3MgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gT1xuICAgICAgICByZWN1cnNlICAgICAgIC4gPyByZWN1cnNlIGludG8gc3ViZGlycyAgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gUlxuICAgICAgICB0cmVlICAgICAgICAgIC4gPyByZWN1cnNlIGFuZCBpbmRlbnQgICAgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gVFxuICAgICAgICBkZXB0aCAgICAgICAgIC4gPyByZWN1cnNpb24gZGVwdGggICAgICAgICAgICAgICAgIC4gPSDiiJ4gICAgIC4gLSBEXG4gICAgICAgIGZpbmQgICAgICAgICAgLiA/IGZpbHRlciB3aXRoIGEgcmVnZXhwICAgICAgICAgICAgICAgICAgICAgIC4gLSBGXG4gICAgICAgIGRlYnVnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBYXG4gICAgXG4gICAgdmVyc2lvbiAgICAgICN7cmVxdWlyZShcIiN7X19kaXJuYW1lfS8uLi9wYWNrYWdlLmpzb25cIikudmVyc2lvbn1cbiAgICBcIlwiXCJcbiAgICBcbiAgICBpZiBhcmdzLnNpemVcbiAgICAgICAgYXJncy5maWxlcyA9IHRydWVcbiAgICBcbiAgICBpZiBhcmdzLmxvbmdcbiAgICAgICAgYXJncy5ieXRlcyA9IHRydWVcbiAgICAgICAgYXJncy5tZGF0ZSA9IHRydWVcbiAgICAgICAgXG4gICAgaWYgYXJncy50cmVlXG4gICAgICAgIGFyZ3MucmVjdXJzZSA9IHRydWVcbiAgICAgICAgYXJncy5vZmZzZXQgID0gZmFsc2VcbiAgICBcbiAgICBpZiBhcmdzLmRpcnMgYW5kIGFyZ3MuZmlsZXNcbiAgICAgICAgYXJncy5kaXJzID0gYXJncy5maWxlcyA9IGZhbHNlXG4gICAgICAgIFxuICAgIGlmIGFyZ3MuaWdub3JlPy5sZW5ndGhcbiAgICAgICAgYXJncy5pZ25vcmUgPSBhcmdzLmlnbm9yZS5zcGxpdCAnICcgXG4gICAgZWxzZVxuICAgICAgICBhcmdzLmlnbm9yZSA9IFtdXG4gICAgICAgIFxuICAgIGlmIGFyZ3MuZGVwdGggPT0gJ+KInicgdGhlbiBhcmdzLmRlcHRoID0gSW5maW5pdHlcbiAgICBlbHNlIGFyZ3MuZGVwdGggPSBNYXRoLm1heCAwLCBwYXJzZUludCBhcmdzLmRlcHRoXG4gICAgaWYgTnVtYmVyLmlzTmFOIGFyZ3MuZGVwdGggdGhlbiBhcmdzLmRlcHRoID0gMFxuICAgICAgICBcbiAgICBpZiBhcmdzLmRlYnVnXG4gICAgICAgIHsga2xvZywgbm9vbiB9ID0gcmVxdWlyZSAna3hrJ1xuICAgICAgICBrbG9nIG5vb24uc3RyaW5naWZ5IGFyZ3MsIGNvbG9yczp0cnVlXG4gICAgXG4gICAgYXJncy5wYXRocyA9IFsnLiddIHVubGVzcyBhcmdzLnBhdGhzPy5sZW5ndGggPiAwXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbmNvbG9ycyA9XG4gICAgJ2NvZmZlZSc6ICAgWyBib2xkK2ZnKDQsNCwwKSwgIGZnKDEsMSwwKSwgZmcoMSwxLDApIF1cbiAgICAna29mZmVlJzogICBbIGJvbGQrZmcoNSw1LDApLCAgZmcoMSwwLDApLCBmZygxLDAsMCkgXVxuICAgICdweSc6ICAgICAgIFsgYm9sZCtmZygwLDIsMCksICBmZygwLDEsMCksIGZnKDAsMSwwKSBdXG4gICAgJ3JiJzogICAgICAgWyBib2xkK2ZnKDQsMCwwKSwgIGZnKDEsMCwwKSwgZmcoMSwwLDApIF1cbiAgICAnanNvbic6ICAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygxLDAsMSkgXVxuICAgICdjc29uJzogICAgIFsgYm9sZCtmZyg0LDAsNCksICBmZygxLDAsMSksIGZnKDEsMCwxKSBdXG4gICAgJ25vb24nOiAgICAgWyBib2xkK2ZnKDQsNCwwKSwgIGZnKDEsMSwwKSwgZmcoMSwxLDApIF1cbiAgICAncGxpc3QnOiAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygxLDAsMSkgXVxuICAgICdqcyc6ICAgICAgIFsgYm9sZCtmZyg1LDAsNSksICBmZygxLDAsMSksIGZnKDEsMCwxKSBdXG4gICAgJ2NwcCc6ICAgICAgWyBib2xkK2ZnKDUsNCwwKSwgIGZ3KDEpLCAgICAgZmcoMSwxLDApIF1cbiAgICAnaCc6ICAgICAgICBbICAgICAgZmcoMywxLDApLCAgZncoMSksICAgICBmZygxLDEsMCkgXVxuICAgICdweWMnOiAgICAgIFsgICAgICBmdyg1KSwgICAgICBmdygxKSwgICAgIGZ3KDEpIF1cbiAgICAnbG9nJzogICAgICBbICAgICAgZncoNSksICAgICAgZncoMSksICAgICBmdygxKSBdXG4gICAgJ2xvZyc6ICAgICAgWyAgICAgIGZ3KDUpLCAgICAgIGZ3KDEpLCAgICAgZncoMSkgXVxuICAgICd0eHQnOiAgICAgIFsgICAgICBmdygyMCksICAgICBmdygxKSwgICAgIGZ3KDIpIF1cbiAgICAnbWQnOiAgICAgICBbIGJvbGQrZncoMjApLCAgICAgZncoMSksICAgICBmdygyKSBdXG4gICAgJ21hcmtkb3duJzogWyBib2xkK2Z3KDIwKSwgICAgIGZ3KDEpLCAgICAgZncoMikgXVxuICAgICdzaCc6ICAgICAgIFsgYm9sZCtmZyg1LDEsMCksICBmZygxLDAsMCksIGZnKDEsMCwwKSBdXG4gICAgJ3BuZyc6ICAgICAgWyBib2xkK2ZnKDUsMCwwKSwgIGZnKDEsMCwwKSwgZmcoMSwwLDApIF1cbiAgICAnanBnJzogICAgICBbIGJvbGQrZmcoMCwzLDApLCAgZmcoMCwxLDApLCBmZygwLDEsMCkgXVxuICAgICdweG0nOiAgICAgIFsgYm9sZCtmZygxLDEsNSksICBmZygwLDAsMSksIGZnKDAsMCwyKSBdXG4gICAgJ3RpZmYnOiAgICAgWyBib2xkK2ZnKDEsMSw1KSwgIGZnKDAsMCwxKSwgZmcoMCwwLDIpIF1cblxuICAgICdfZGVmYXVsdCc6IFsgICAgICBmdygxNSksICAgICBmdygxKSwgICAgIGZ3KDYpIF1cbiAgICAnX2Rpcic6ICAgICBbIGJvbGQrQkcoMCwwLDIpK2Z3KDIzKSwgZmcoMSwxLDUpLCBib2xkK0JHKDAsMCwyKStmZygyLDIsNSkgXVxuICAgICdfLmRpcic6ICAgIFsgYm9sZCtCRygwLDAsMSkrZncoMjMpLCBib2xkK0JHKDAsMCwxKStmZygxLDEsNSksIGJvbGQrQkcoMCwwLDEpK2ZnKDIsMiw1KSBdXG4gICAgJ19saW5rJzogICAgeyAnYXJyb3cnOiBmZygxLDAsMSksICdwYXRoJzogZmcoNCwwLDQpLCAnYnJva2VuJzogQkcoNSwwLDApK2ZnKDUsNSwwKSB9XG4gICAgJ19hcnJvdyc6ICAgICBCVygyKStmdygwKVxuICAgICdfaGVhZGVyJzogIFsgYm9sZCtCVygyKStmZygzLDIsMCksICBmdyg0KSwgYm9sZCtCVygyKStmZyg1LDUsMCkgXVxuICAgICdfc2l6ZSc6ICAgIHsgYjogW2ZnKDAsMCwzKV0sIGtCOiBbZmcoMCwwLDUpLCBmZygwLDAsMyldLCBNQjogW2ZnKDEsMSw1KSwgZmcoMCwwLDUpXSwgR0I6IFtmZyg0LDQsNSksIGZnKDIsMiw1KV0sIFRCOiBbZmcoNCw0LDUpLCBmZygyLDIsNSldIH1cbiAgICAnX3VzZXJzJzogICB7IHJvb3Q6ICBmZygzLDAsMCksIGRlZmF1bHQ6IGZnKDEsMCwxKSB9XG4gICAgJ19ncm91cHMnOiAgeyB3aGVlbDogZmcoMSwwLDApLCBzdGFmZjogZmcoMCwxLDApLCBhZG1pbjogZmcoMSwxLDApLCBkZWZhdWx0OiBmZygxLDAsMSkgfVxuICAgICdfZXJyb3InOiAgIFsgYm9sZCtCRyg1LDAsMCkrZmcoNSw1LDApLCBib2xkK0JHKDUsMCwwKStmZyg1LDUsNSkgXVxuICAgICdfcmlnaHRzJzpcbiAgICAgICAgICAgICAgICAgICdyKyc6IGJvbGQrQlcoMSkrZmcoMSwxLDEpXG4gICAgICAgICAgICAgICAgICAnci0nOiByZXNldCtCVygxKVxuICAgICAgICAgICAgICAgICAgJ3crJzogYm9sZCtCVygxKStmZygyLDIsNSlcbiAgICAgICAgICAgICAgICAgICd3LSc6IHJlc2V0K0JXKDEpXG4gICAgICAgICAgICAgICAgICAneCsnOiBib2xkK0JXKDEpK2ZnKDUsMCwwKVxuICAgICAgICAgICAgICAgICAgJ3gtJzogcmVzZXQrQlcoMSlcblxudXNlck1hcCA9IHt9XG51c2VybmFtZSA9ICh1aWQpIC0+XG4gICAgaWYgbm90IHVzZXJNYXBbdWlkXVxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG4gICAgICAgICAgICB1c2VyTWFwW3VpZF0gPSBjaGlsZHAuc3Bhd25TeW5jKFwiaWRcIiwgW1wiLXVuXCIsIFwiI3t1aWR9XCJdKS5zdGRvdXQudG9TdHJpbmcoJ3V0ZjgnKS50cmltKClcbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgbG9nIGVcbiAgICB1c2VyTWFwW3VpZF1cblxuZ3JvdXBNYXAgPSBudWxsXG5ncm91cG5hbWUgPSAoZ2lkKSAtPlxuICAgIGlmIG5vdCBncm91cE1hcFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGNoaWxkcCA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG4gICAgICAgICAgICBnaWRzID0gY2hpbGRwLnNwYXduU3luYyhcImlkXCIsIFtcIi1HXCJdKS5zdGRvdXQudG9TdHJpbmcoJ3V0ZjgnKS5zcGxpdCgnICcpXG4gICAgICAgICAgICBnbm1zID0gY2hpbGRwLnNwYXduU3luYyhcImlkXCIsIFtcIi1HblwiXSkuc3Rkb3V0LnRvU3RyaW5nKCd1dGY4Jykuc3BsaXQoJyAnKVxuICAgICAgICAgICAgZ3JvdXBNYXAgPSB7fVxuICAgICAgICAgICAgZm9yIGkgaW4gWzAuLi5naWRzLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBncm91cE1hcFtnaWRzW2ldXSA9IGdubXNbaV1cbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgbG9nIGVcbiAgICBncm91cE1hcFtnaWRdXG5cbmlmICdmdW5jdGlvbicgPT0gdHlwZW9mIHByb2Nlc3MuZ2V0dWlkXG4gICAgY29sb3JzWydfdXNlcnMnXVt1c2VybmFtZShwcm9jZXNzLmdldHVpZCgpKV0gPSBmZygwLDQsMClcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG5sb2dfZXJyb3IgPSAoKSAtPlxuICAgIFxuICAgIGxvZyBcIiBcIiArIGNvbG9yc1snX2Vycm9yJ11bMF0gKyBcIiBcIiArIGJvbGQgKyBhcmd1bWVudHNbMF0gKyAoYXJndW1lbnRzLmxlbmd0aCA+IDEgYW5kIChjb2xvcnNbJ19lcnJvciddWzFdICsgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpLnNsaWNlKDEpLmpvaW4oJyAnKSkgb3IgJycpICsgXCIgXCIgKyByZXNldFxuXG5saW5rU3RyaW5nID0gKGZpbGUpIC0+IFxuICAgIFxuICAgIHMgID0gcmVzZXQgKyBmdygxKSArIGNvbG9yc1snX2xpbmsnXVsnYXJyb3cnXSArIFwiIOKWuiBcIiBcbiAgICBzICs9IGNvbG9yc1snX2xpbmsnXVsoZmlsZSBpbiBzdGF0cy5icm9rZW5MaW5rcykgYW5kICdicm9rZW4nIG9yICdwYXRoJ10gXG4gICAgdHJ5XG4gICAgICAgIHNsYXNoID0gcmVxdWlyZSAna3hrL2pzL3NsYXNoJ1xuICAgICAgICBzICs9IHNsYXNoLnBhdGggZnMucmVhZGxpbmtTeW5jKGZpbGUpXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIHMgKz0gJyA/ICdcbiAgICBzXG5cbm5hbWVTdHJpbmcgPSAobmFtZSwgZXh0KSAtPiBcbiAgICBcbiAgICBpZiBhcmdzLm5lcmR5XG4gICAgICAgIGljb25zID0gcmVxdWlyZSAnLi9pY29ucydcbiAgICAgICAgaWNvbiA9IChjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMl0gKyAoaWNvbnMuZ2V0KG5hbWUsIGV4dCkgPyAnICcpKSArICcgJ1xuICAgIGVsc2VcbiAgICAgICAgaWNvbiA9ICcnXG4gICAgXCIgXCIgKyBpY29uICsgY29sb3JzW2NvbG9yc1tleHRdPyBhbmQgZXh0IG9yICdfZGVmYXVsdCddWzBdICsgbmFtZSArIHJlc2V0XG4gICAgXG5kb3RTdHJpbmcgID0gKGV4dCkgLT4gXG4gICAgXG4gICAgY29sb3JzW2NvbG9yc1tleHRdPyBhbmQgZXh0IG9yICdfZGVmYXVsdCddWzFdICsgXCIuXCIgKyByZXNldFxuICAgIFxuZXh0U3RyaW5nICA9IChuYW1lLCBleHQpIC0+IFxuICAgIFxuICAgIGlmIGFyZ3MubmVyZHkgYW5kIG5hbWUgXG4gICAgICAgIGljb25zID0gcmVxdWlyZSAnLi9pY29ucydcbiAgICAgICAgaWYgaWNvbnMuZ2V0KG5hbWUsIGV4dCkgdGhlbiByZXR1cm4gJydcbiAgICBkb3RTdHJpbmcoZXh0KSArIGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVsyXSArIGV4dCArIHJlc2V0XG4gICAgXG5kaXJTdHJpbmcgID0gKG5hbWUsIGV4dCkgLT5cbiAgICBcbiAgICBjID0gbmFtZSBhbmQgJ19kaXInIG9yICdfLmRpcidcbiAgICBpY29uID0gYXJncy5uZXJkeSBhbmQgY29sb3JzW2NdWzJdICsgJyBcXHVmNDEzJyBvciAnJ1xuICAgIGljb24gKyBjb2xvcnNbY11bMF0gKyAobmFtZSBhbmQgKFwiIFwiICsgbmFtZSkgb3IgXCIgXCIpICsgKGlmIGV4dCB0aGVuIGNvbG9yc1tjXVsxXSArICcuJyArIGNvbG9yc1tjXVsyXSArIGV4dCBlbHNlIFwiXCIpICsgXCIgXCJcblxuc2l6ZVN0cmluZyA9IChzdGF0KSAtPlxuICAgIFxuICAgIGlmIGFyZ3MucHJldHR5IGFuZCBzdGF0LnNpemUgPT0gMFxuICAgICAgICByZXR1cm4gbHBhZCgnICcsIDExKVxuICAgIGlmIHN0YXQuc2l6ZSA8IDEwMDBcbiAgICAgICAgY29sb3JzWydfc2l6ZSddWydiJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlIGlmIHN0YXQuc2l6ZSA8IDEwMDAwMDBcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsna0InXVswXSArIGxwYWQoKHN0YXQuc2l6ZSAvIDEwMDApLnRvRml4ZWQoMCksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ2tCJ11bMV0gKyBcImtCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsna0InXVswXSArIGxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2UgaWYgc3RhdC5zaXplIDwgMTAwMDAwMDAwMFxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydNQiddWzBdICsgbHBhZCgoc3RhdC5zaXplIC8gMTAwMDAwMCkudG9GaXhlZCgxKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsnTUInXVsxXSArIFwiTUIgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydNQiddWzBdICsgbHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZSBpZiBzdGF0LnNpemUgPCAxMDAwMDAwMDAwMDAwXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMF0gKyBscGFkKChzdGF0LnNpemUgLyAxMDAwMDAwMDAwKS50b0ZpeGVkKDEpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydHQiddWzFdICsgXCJHQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMF0gKyBscGFkKChzdGF0LnNpemUgLyAxMDAwMDAwMDAwMDAwKS50b0ZpeGVkKDMpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydUQiddWzFdICsgXCJUQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMF0gKyBscGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcblxudGltZVN0cmluZyA9IChzdGF0KSAtPlxuICAgIFxuICAgIG1vbWVudCA9IHJlcXVpcmUgJ21vbWVudCdcbiAgICB0ID0gbW9tZW50KHN0YXQubXRpbWUpXG4gICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgYWdlID0gbW9tZW50KCkudG8odCwgdHJ1ZSlcbiAgICAgICAgW251bSwgcmFuZ2VdID0gYWdlLnNwbGl0ICcgJ1xuICAgICAgICBudW0gPSAnMScgaWYgbnVtWzBdID09ICdhJ1xuICAgICAgICBpZiByYW5nZSA9PSAnZmV3J1xuICAgICAgICAgICAgbnVtID0gbW9tZW50KCkuZGlmZiB0LCAnc2Vjb25kcydcbiAgICAgICAgICAgIHJhbmdlID0gJ3NlY29uZHMnXG4gICAgICAgICAgICBmdygyMykgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdygxNikgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ3llYXInXG4gICAgICAgICAgICBmdyg2KSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDMpICsgcnBhZChyYW5nZSwgNykgKyAnICdcbiAgICAgICAgZWxzZSBpZiByYW5nZS5zdGFydHNXaXRoICdtb250aCdcbiAgICAgICAgICAgIGZ3KDgpICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoNCkgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ2RheSdcbiAgICAgICAgICAgIGZ3KDEwKSArIGxwYWQobnVtLCAyKSArICcgJyArIGZ3KDYpICsgcnBhZChyYW5nZSwgNykgKyAnICdcbiAgICAgICAgZWxzZSBpZiByYW5nZS5zdGFydHNXaXRoICdob3VyJ1xuICAgICAgICAgICAgZncoMTUpICsgbHBhZChudW0sIDIpICsgJyAnICsgZncoOCkgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmdygxOCkgKyBscGFkKG51bSwgMikgKyAnICcgKyBmdygxMikgKyBycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgIGVsc2VcbiAgICAgICAgZncoMTYpICsgbHBhZCh0LmZvcm1hdChcIkREXCIpLDIpICsgZncoNykrJy4nICtcbiAgICAgICAgZncoMTIpICsgdC5mb3JtYXQoXCJNTVwiKSArIGZ3KDcpK1wiLlwiICtcbiAgICAgICAgZncoIDgpICsgdC5mb3JtYXQoXCJZWVwiKSArICcgJyArXG4gICAgICAgIGZ3KDE2KSArIHQuZm9ybWF0KFwiSEhcIikgKyBjb2wgPSBmdyg3KSsnOicgK1xuICAgICAgICBmdygxNCkgKyB0LmZvcm1hdChcIm1tXCIpICsgY29sID0gZncoMSkrJzonICtcbiAgICAgICAgZncoIDQpICsgdC5mb3JtYXQoXCJzc1wiKSArICcgJ1xuXG5vd25lck5hbWUgPSAoc3RhdCkgLT5cbiAgICBcbiAgICB0cnlcbiAgICAgICAgdXNlcm5hbWUgc3RhdC51aWRcbiAgICBjYXRjaFxuICAgICAgICBzdGF0LnVpZFxuXG5ncm91cE5hbWUgPSAoc3RhdCkgLT5cbiAgICBcbiAgICB0cnlcbiAgICAgICAgZ3JvdXBuYW1lIHN0YXQuZ2lkXG4gICAgY2F0Y2hcbiAgICAgICAgc3RhdC5naWRcblxub3duZXJTdHJpbmcgPSAoc3RhdCkgLT5cbiAgICBcbiAgICBvd24gPSBvd25lck5hbWUoc3RhdClcbiAgICBncnAgPSBncm91cE5hbWUoc3RhdClcbiAgICBvY2wgPSBjb2xvcnNbJ191c2VycyddW293bl1cbiAgICBvY2wgPSBjb2xvcnNbJ191c2VycyddWydkZWZhdWx0J10gdW5sZXNzIG9jbFxuICAgIGdjbCA9IGNvbG9yc1snX2dyb3VwcyddW2dycF1cbiAgICBnY2wgPSBjb2xvcnNbJ19ncm91cHMnXVsnZGVmYXVsdCddIHVubGVzcyBnY2xcbiAgICBvY2wgKyBycGFkKG93biwgc3RhdHMubWF4T3duZXJMZW5ndGgpICsgXCIgXCIgKyBnY2wgKyBycGFkKGdycCwgc3RhdHMubWF4R3JvdXBMZW5ndGgpXG5cbnJ3eFN0cmluZyA9IChtb2RlLCBpKSAtPlxuICAgIFxuICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIxMDApIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsncisnXSArICcgcicgb3IgY29sb3JzWydfcmlnaHRzJ11bJ3ItJ10gKyAnICAnKSArXG4gICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjAxMCkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWyd3KyddICsgJyB3JyBvciBjb2xvcnNbJ19yaWdodHMnXVsndy0nXSArICcgICcpICtcbiAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDAxKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3grJ10gKyAnIHgnIG9yIGNvbG9yc1snX3JpZ2h0cyddWyd4LSddICsgJyAgJylcblxucmlnaHRzU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgdXIgPSByd3hTdHJpbmcoc3RhdC5tb2RlLCAyKSArIFwiIFwiXG4gICAgZ3IgPSByd3hTdHJpbmcoc3RhdC5tb2RlLCAxKSArIFwiIFwiXG4gICAgcm8gPSByd3hTdHJpbmcoc3RhdC5tb2RlLCAwKSArIFwiIFwiXG4gICAgdXIgKyBnciArIHJvICsgcmVzZXRcblxuZ2V0UHJlZml4ID0gKHN0YXQsIGRlcHRoKSAtPlxuICAgIFxuICAgIHMgPSAnJ1xuICAgIGlmIGFyZ3MucmlnaHRzXG4gICAgICAgIHMgKz0gcmlnaHRzU3RyaW5nIHN0YXRcbiAgICAgICAgcyArPSBcIiBcIlxuICAgIGlmIGFyZ3Mub3duZXJcbiAgICAgICAgcyArPSBvd25lclN0cmluZyBzdGF0XG4gICAgICAgIHMgKz0gXCIgXCJcbiAgICBpZiBhcmdzLmJ5dGVzXG4gICAgICAgIHMgKz0gc2l6ZVN0cmluZyBzdGF0XG4gICAgaWYgYXJncy5tZGF0ZVxuICAgICAgICBzICs9IHRpbWVTdHJpbmcgc3RhdFxuICAgICAgICBcbiAgICBpZiBkZXB0aCBhbmQgYXJncy50cmVlXG4gICAgICAgIHMgKz0gcnBhZCAnJywgZGVwdGgqNFxuICAgICAgICBcbiAgICBpZiBzLmxlbmd0aCA9PSAwIGFuZCBhcmdzLm9mZnNldFxuICAgICAgICBzICs9ICcgICAgICAgJ1xuICAgIHNcbiAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDBcblxuc29ydCA9IChsaXN0LCBzdGF0cywgZXh0cz1bXSkgLT5cbiAgICBcbiAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuICAgIG1vbWVudCA9IHJlcXVpcmUgJ21vbWVudCdcbiAgICBcbiAgICBsID0gXy56aXAgbGlzdCwgc3RhdHMsIFswLi4ubGlzdC5sZW5ndGhdLCAoZXh0cy5sZW5ndGggPiAwIGFuZCBleHRzIG9yIFswLi4ubGlzdC5sZW5ndGhdKVxuICAgIFxuICAgIGlmIGFyZ3Mua2luZFxuICAgICAgICBpZiBleHRzID09IFtdIHRoZW4gcmV0dXJuIGxpc3RcbiAgICAgICAgbC5zb3J0KChhLGIpIC0+XG4gICAgICAgICAgICBpZiBhWzNdID4gYlszXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICBpZiBhWzNdIDwgYlszXSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYXJncy50aW1lXG4gICAgICAgICAgICAgICAgbSA9IG1vbWVudChhWzFdLm10aW1lKVxuICAgICAgICAgICAgICAgIGlmIG0uaXNBZnRlcihiWzFdLm10aW1lKSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgaWYgbS5pc0JlZm9yZShiWzFdLm10aW1lKSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYXJncy5zaXplXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplID4gYlsxXS5zaXplIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPCBiWzFdLnNpemUgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFbMl0gPiBiWzJdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIC0xKVxuICAgIGVsc2UgaWYgYXJncy50aW1lXG4gICAgICAgIGwuc29ydCgoYSxiKSAtPlxuICAgICAgICAgICAgbSA9IG1vbWVudChhWzFdLm10aW1lKVxuICAgICAgICAgICAgaWYgbS5pc0FmdGVyKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIGlmIG0uaXNCZWZvcmUoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3Muc2l6ZVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA+IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICBlbHNlIGlmIGFyZ3Muc2l6ZVxuICAgICAgICBsLnNvcnQoKGEsYikgLT5cbiAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA+IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICBpZiBhWzFdLnNpemUgPCBiWzFdLnNpemUgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFbMl0gPiBiWzJdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIC0xKVxuICAgIF8udW56aXAobClbMF1cblxuIyAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuIyAwMDAgIDAwMCAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuXG5pZ25vcmUgPSAocCkgLT5cbiAgICBcbiAgICBpZiBzbGFzaC53aW4oKVxuICAgICAgICByZXR1cm4gdHJ1ZSBpZiBwWzBdID09ICckJ1xuICAgICAgICByZXR1cm4gdHJ1ZSBpZiBwID09ICdkZXNrdG9wLmluaSdcbiAgICAgICAgcmV0dXJuIHRydWUgaWYgcC50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGggJ250dXNlcidcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiB0cnVlIGlmIHNsYXNoLmV4dChwKSA9PSAnYXBwJ1xuICAgIFxuICAgIHJldHVybiB0cnVlIGlmIHAgaW4gYXJncy5pZ25vcmVcbiAgICBmYWxzZVxuICAgIFxuIyAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMFxuIyAwMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDBcblxubGlzdEZpbGVzID0gKHAsIGZpbGVzLCBkZXB0aCkgLT5cbiAgICBcbiAgICBhbHBoID0gW10gaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICBkaXJzID0gW10gIyB2aXNpYmxlIGRpcnNcbiAgICBmaWxzID0gW10gIyB2aXNpYmxlIGZpbGVzXG4gICAgZHN0cyA9IFtdICMgZGlyIHN0YXRzXG4gICAgZnN0cyA9IFtdICMgZmlsZSBzdGF0c1xuICAgIGV4dHMgPSBbXSAjIGZpbGUgZXh0ZW5zaW9uc1xuXG4gICAgaWYgYXJncy5vd25lclxuICAgICAgICBcbiAgICAgICAgZmlsZXMuZm9yRWFjaCAocnApIC0+XG4gICAgICAgICAgICBpZiBzbGFzaC5pc0Fic29sdXRlIHJwXG4gICAgICAgICAgICAgICAgZmlsZSA9IHNsYXNoLnJlc29sdmUgcnBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmaWxlICA9IHNsYXNoLmpvaW4gcCwgcnBcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIHN0YXQgPSBmcy5sc3RhdFN5bmMoZmlsZSlcbiAgICAgICAgICAgICAgICBvbCA9IG93bmVyTmFtZShzdGF0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICBnbCA9IGdyb3VwTmFtZShzdGF0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICBpZiBvbCA+IHN0YXRzLm1heE93bmVyTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm1heE93bmVyTGVuZ3RoID0gb2xcbiAgICAgICAgICAgICAgICBpZiBnbCA+IHN0YXRzLm1heEdyb3VwTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm1heEdyb3VwTGVuZ3RoID0gZ2xcbiAgICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICBmaWxlcy5mb3JFYWNoIChycCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLmlzQWJzb2x1dGUgcnBcbiAgICAgICAgICAgIGZpbGUgID0gc2xhc2gucmVzb2x2ZSBycFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmaWxlICA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBwLCBycFxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBpZ25vcmUgcnBcbiAgICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgbHN0YXQgPSBmcy5sc3RhdFN5bmMgZmlsZVxuICAgICAgICAgICAgbGluayAgPSBsc3RhdC5pc1N5bWJvbGljTGluaygpXG4gICAgICAgICAgICBzdGF0ICA9IGxpbmsgYW5kIGZzLnN0YXRTeW5jKGZpbGUpIG9yIGxzdGF0XG4gICAgICAgIGNhdGNoXG4gICAgICAgICAgICBpZiBsaW5rXG4gICAgICAgICAgICAgICAgc3RhdCA9IGxzdGF0XG4gICAgICAgICAgICAgICAgc3RhdHMuYnJva2VuTGlua3MucHVzaCBmaWxlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbG9nX2Vycm9yIFwiY2FuJ3QgcmVhZCBmaWxlOiBcIiwgZmlsZSwgbGlua1xuICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGV4dCAgPSBzbGFzaC5leHQgZmlsZVxuICAgICAgICBuYW1lID0gc2xhc2guYmFzZSBmaWxlXG4gICAgICAgIFxuICAgICAgICBpZiBuYW1lWzBdID09ICcuJ1xuICAgICAgICAgICAgZXh0ID0gbmFtZS5zdWJzdHIoMSkgKyBzbGFzaC5leHRuYW1lIGZpbGVcbiAgICAgICAgICAgIG5hbWUgPSAnJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIG5hbWUubGVuZ3RoIGFuZCBuYW1lW25hbWUubGVuZ3RoLTFdICE9ICdcXHInIG9yIGFyZ3MuYWxsXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHMgPSBnZXRQcmVmaXggc3RhdCwgZGVwdGhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICAgIGlmIG5vdCBhcmdzLmZpbGVzXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBhcmdzLnRyZWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5hbWUuc3RhcnRzV2l0aCAnLi8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVbMi4uXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGRpclN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzICs9IGxpbmtTdHJpbmcgZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlycy5wdXNoIHMrcmVzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGFscGgucHVzaCBzK3Jlc2V0IGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgICAgICAgICAgICAgIGRzdHMucHVzaCBzdGF0XG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm51bV9kaXJzICs9IDFcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9kaXJzICs9IDFcbiAgICAgICAgICAgIGVsc2UgIyBpZiBwYXRoIGlzIGZpbGVcbiAgICAgICAgICAgICAgICBpZiBub3QgYXJncy5kaXJzXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gbmFtZVN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGV4dFN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgbGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBsaW5rU3RyaW5nIGZpbGVcbiAgICAgICAgICAgICAgICAgICAgZmlscy5wdXNoIHMrcmVzZXRcbiAgICAgICAgICAgICAgICAgICAgYWxwaC5wdXNoIHMrcmVzZXQgaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICAgICAgICAgICAgICAgICAgZnN0cy5wdXNoIHN0YXRcbiAgICAgICAgICAgICAgICAgICAgZXh0cy5wdXNoIGV4dFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5udW1fZmlsZXMgKz0gMVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMuaGlkZGVuX2ZpbGVzICs9IDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgc3RhdC5pc0ZpbGUoKVxuICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9maWxlcyArPSAxXG4gICAgICAgICAgICBlbHNlIGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9kaXJzICs9IDFcblxuICAgIGlmIGFyZ3Muc2l6ZSBvciBhcmdzLmtpbmQgb3IgYXJncy50aW1lXG4gICAgICAgIGlmIGRpcnMubGVuZ3RoIGFuZCBub3QgYXJncy5maWxlc1xuICAgICAgICAgICAgZGlycyA9IHNvcnQgZGlycywgZHN0c1xuICAgICAgICBpZiBmaWxzLmxlbmd0aFxuICAgICAgICAgICAgZmlscyA9IHNvcnQgZmlscywgZnN0cywgZXh0c1xuXG4gICAgaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICAgICAgbG9nIHAgZm9yIHAgaW4gYWxwaFxuICAgIGVsc2VcbiAgICAgICAgbG9nIGQgZm9yIGQgaW4gZGlyc1xuICAgICAgICBsb2cgZiBmb3IgZiBpbiBmaWxzXG5cbiMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwXG5cbmxpc3REaXIgPSAocCkgLT5cbiAgICBcbiAgICByZXR1cm4gaWYgaWdub3JlIHNsYXNoLmJhc2VuYW1lIHBcbiAgICAgICAgXG4gICAgaWYgYXJncy5yZWN1cnNlXG4gICAgICAgIGRlcHRoID0gcGF0aERlcHRoIHBcbiAgICAgICAgcmV0dXJuIGlmIGRlcHRoID4gYXJncy5kZXB0aFxuICAgIFxuICAgIHBzID0gcFxuXG4gICAgdHJ5XG4gICAgICAgIGZpbGVzID0gZnMucmVhZGRpclN5bmMocClcbiAgICBjYXRjaCBlcnJvclxuICAgICAgICBtc2cgPSBlcnJvci5tZXNzYWdlXG4gICAgICAgIG1zZyA9IFwicGVybWlzc2lvbiBkZW5pZWRcIiBpZiBtc2cuc3RhcnRzV2l0aCBcIkVBQ0NFU1wiXG4gICAgICAgIGxvZ19lcnJvciBtc2dcblxuICAgIGlmIGFyZ3MuZmluZFxuICAgICAgICBmaWxlcyA9IGZpbGVzLmZpbHRlciAoZikgLT5cbiAgICAgICAgICAgIGYgaWYgUmVnRXhwKGFyZ3MuZmluZCkudGVzdCBmXG4gICAgICAgICAgICBcbiAgICBpZiBhcmdzLmZpbmQgYW5kIG5vdCBmaWxlcy5sZW5ndGhcbiAgICAgICAgdHJ1ZVxuICAgIGVsc2UgaWYgYXJncy5wYXRocy5sZW5ndGggPT0gMSBhbmQgYXJncy5wYXRoc1swXSA9PSAnLicgYW5kIG5vdCBhcmdzLnJlY3Vyc2VcbiAgICAgICAgbG9nIHJlc2V0XG4gICAgZWxzZSBpZiBhcmdzLnRyZWVcbiAgICAgICAgbG9nIGdldFByZWZpeChzbGFzaC5pc0RpcihwKSwgZGVwdGgtMSkgKyBkaXJTdHJpbmcoc2xhc2guYmFzZShwcyksIHNsYXNoLmV4dChwcykpICsgcmVzZXRcbiAgICBlbHNlXG4gICAgICAgIHMgPSBjb2xvcnNbJ19hcnJvdyddICsgXCIg4pa2IFwiICsgY29sb3JzWydfaGVhZGVyJ11bMF1cbiAgICAgICAgcHMgPSBzbGFzaC5yZXNvbHZlIHBzIGlmIHBzWzBdICE9ICd+J1xuICAgICAgICBpZiBwcy5zdGFydHNXaXRoIHByb2Nlc3MuZW52LlBXRFxuICAgICAgICAgICAgcHMgPSBwcy5zdWJzdHIgcHJvY2Vzcy5lbnYuUFdELmxlbmd0aCsxXG4gICAgICAgIGVsc2UgaWYgcC5zdGFydHNXaXRoIHByb2Nlc3MuZW52LkhPTUVcbiAgICAgICAgICAgIHBzID0gXCJ+XCIgKyBwLnN1YnN0ciBwcm9jZXNzLmVudi5IT01FLmxlbmd0aFxuXG4gICAgICAgIGlmIHBzID09ICcvJ1xuICAgICAgICAgICAgcyArPSAnLydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc3AgPSBwcy5zcGxpdCgnLycpXG4gICAgICAgICAgICBzICs9IGNvbG9yc1snX2hlYWRlciddWzBdICsgc3Auc2hpZnQoKVxuICAgICAgICAgICAgd2hpbGUgc3AubGVuZ3RoXG4gICAgICAgICAgICAgICAgcG4gPSBzcC5zaGlmdCgpXG4gICAgICAgICAgICAgICAgaWYgcG5cbiAgICAgICAgICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVsxXSArICcvJ1xuICAgICAgICAgICAgICAgICAgICBzICs9IGNvbG9yc1snX2hlYWRlciddW3NwLmxlbmd0aCA9PSAwIGFuZCAyIG9yIDBdICsgcG5cbiAgICAgICAgbG9nIHJlc2V0XG4gICAgICAgIGxvZyBzICsgXCIgXCIgKyByZXNldFxuICAgICAgICBsb2cgcmVzZXRcblxuICAgIGlmIGZpbGVzLmxlbmd0aFxuICAgICAgICBsaXN0RmlsZXMgcCwgZmlsZXMsIGRlcHRoXG5cbiAgICBpZiBhcmdzLnJlY3Vyc2VcbiAgICAgICAgXG4gICAgICAgIGRvUmVjdXJzZSA9IChmKSAtPiBcbiAgICAgICAgICAgIHJldHVybiBmYWxzZSBpZiBub3QgYXJncy5hbGwgYW5kIGZbMF0gPT0gJy4nXG4gICAgICAgICAgICBzbGFzaC5pc0RpciBzbGFzaC5qb2luIHAsIGZcbiAgICAgICAgICAgIFxuICAgICAgICBmb3IgcHIgaW4gZnMucmVhZGRpclN5bmMocCkuZmlsdGVyIGRvUmVjdXJzZVxuICAgICAgICAgICAgbGlzdERpciBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gcCwgcHJcbiAgICAgICAgICAgIFxucGF0aERlcHRoID0gKHApIC0+XG4gICAgXG4gICAgcmVsID0gc2xhc2gucmVsYXRpdmUgcCwgcHJvY2Vzcy5jd2QoKVxuICAgIHJldHVybiAwIGlmIHAgPT0gJy4nXG4gICAgcmVsLnNwbGl0KCcvJykubGVuZ3RoXG5cbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuXG5tYWluID0gKGFyZ3MpIC0+XG4gICAgXG4gICAgcGF0aHN0YXRzID0gYXJncy5wYXRocy5tYXAgKGYpIC0+XG4gICAgICAgIHRyeVxuICAgICAgICAgICAgW2YsIGZzLnN0YXRTeW5jKGYpXVxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgICAgbG9nX2Vycm9yICdubyBzdWNoIGZpbGU6ICcsIGZcbiAgICAgICAgICAgIFtdXG4gICAgXG4gICAgZmlsZXN0YXRzID0gcGF0aHN0YXRzLmZpbHRlciggKGYpIC0+IGYubGVuZ3RoIGFuZCBub3QgZlsxXS5pc0RpcmVjdG9yeSgpIClcbiAgICBcbiAgICBpZiBmaWxlc3RhdHMubGVuZ3RoID4gMFxuICAgICAgICBsb2cgcmVzZXRcbiAgICAgICAgbGlzdEZpbGVzIHByb2Nlc3MuY3dkKCksIGZpbGVzdGF0cy5tYXAoIChzKSAtPiBzWzBdIClcbiAgICBcbiAgICBmb3IgcCBpbiBwYXRoc3RhdHMuZmlsdGVyKCAoZikgLT4gZi5sZW5ndGggYW5kIGZbMV0uaXNEaXJlY3RvcnkoKSApXG4gICAgICAgIGxvZyAnJyBpZiBhcmdzLnRyZWVcbiAgICAgICAgbGlzdERpciBwWzBdXG4gICAgXG4gICAgbG9nIFwiXCJcbiAgICBpZiBhcmdzLmluZm9cbiAgICAgICAga3N0ciA9IHJlcXVpcmUgJ2t4ay9qcy9zdHInXG4gICAgICAgIGxvZyBCVygxKSArIFwiIFwiICtcbiAgICAgICAgZncoOCkgKyBzdGF0cy5udW1fZGlycyArIChzdGF0cy5oaWRkZW5fZGlycyBhbmQgZncoNCkgKyBcIitcIiArIGZ3KDUpICsgKHN0YXRzLmhpZGRlbl9kaXJzKSBvciBcIlwiKSArIGZ3KDQpICsgXCIgZGlycyBcIiArXG4gICAgICAgIGZ3KDgpICsgc3RhdHMubnVtX2ZpbGVzICsgKHN0YXRzLmhpZGRlbl9maWxlcyBhbmQgZncoNCkgKyBcIitcIiArIGZ3KDUpICsgKHN0YXRzLmhpZGRlbl9maWxlcykgb3IgXCJcIikgKyBmdyg0KSArIFwiIGZpbGVzIFwiICtcbiAgICAgICAgZncoOCkgKyBrc3RyLnRpbWUocHJvY2Vzcy5ocnRpbWUuYmlnaW50KCktc3RhcnRUaW1lKSArIFwiIFwiICtcbiAgICAgICAgcmVzZXRcbiAgICBcbmlmIGFyZ3NcbiAgICBtYWluIGFyZ3NcbmVsc2VcbiAgICBtb2R1bGUuZXhwb3J0cyA9IG1haW5cbiAgICAiXX0=
//# sourceURL=../coffee/color-ls.coffee