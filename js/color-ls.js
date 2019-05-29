// koffee 0.50.0

/*
 0000000   0000000   000       0000000   00000000           000       0000000
000       000   000  000      000   000  000   000          000      000
000       000   000  000      000   000  0000000    000000  000      0000000
000       000   000  000      000   000  000   000          000           000
 0000000   0000000   0000000   0000000   000   000          0000000  0000000
 */
var BG, BW, _, _s, ansi, args, bold, childp, colors, dirString, dotString, extString, fg, filestats, filter, fs, fw, getPrefix, groupMap, groupName, groupname, icons, j, karg, klog, kstr, len, linkString, listDir, listFiles, log_error, moment, nameString, noon, ownerName, ownerString, p, pathDepth, pathstats, ref, ref1, ref2, reset, rightsString, rwxString, sizeString, slash, sort, sprintf, startTime, stats, timeString, token, userMap, username, util,
    indexOf = [].indexOf;

startTime = process.hrtime.bigint();

ref = require('kxk'), childp = ref.childp, slash = ref.slash, karg = ref.karg, kstr = ref.kstr, klog = ref.klog, noon = ref.noon, fs = ref.fs, _ = ref._;

ansi = require('ansi-256-colors');

util = require('util');

_s = require('underscore.string');

moment = require('moment');

icons = require('./icons');

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

args = karg("color-ls\n    paths         . ? the file(s) and/or folder(s) to display . **\n    bytes         . ? include size                    . = false\n    mdate         . ? include modification date       . = false\n    long          . ? include size and date           . = false\n    owner         . ? include owner and group         . = false\n    rights        . ? include rights                  . = false\n    all           . ? show dot files                  . = false\n    dirs          . ? show only dirs                  . = false\n    files         . ? show only files                 . = false\n    size          . ? sort by size                    . = false\n    time          . ? sort by time                    . = false\n    kind          . ? sort by kind                    . = false\n    pretty        . ? pretty size and date            . = true\n    nerdy         . ? use nerd font icons             . = false\n    offset        . ? indent short listings           . = false . - O\n    info          . ? show statistics                 . = false . - i\n    recurse       . ? recurse into subdirs            . = false . - R\n    tree          . ? recurse n levels and indent     . = 0     . - T\n    find          . ? filter with a regexp                      . - F\n    alphabetical  . ! don't group dirs before files   . = false . - A\n    debug                                             . = false . - D\n\nversion      " + (require(__dirname + "/../package.json").version));

if (args.size) {
    args.files = true;
}

if (args.long) {
    args.bytes = true;
    args.mdate = true;
}

if (args.tree > 0) {
    args.recurse = true;
    args.offset = false;
}

if (args.debug) {
    klog(noon.stringify(args, {
        colors: true
    }));
}

if (!(((ref1 = args.paths) != null ? ref1.length : void 0) > 0)) {
    args.paths = ['.'];
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
    var e;
    if (!userMap[uid]) {
        try {
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
    var e, gids, gnms, i, j, ref2;
    if (!groupMap) {
        try {
            gids = childp.spawnSync("id", ["-G"]).stdout.toString('utf8').split(' ');
            gnms = childp.spawnSync("id", ["-Gn"]).stdout.toString('utf8').split(' ');
            groupMap = {};
            for (i = j = 0, ref2 = gids.length; 0 <= ref2 ? j < ref2 : j > ref2; i = 0 <= ref2 ? ++j : --j) {
                groupMap[gids[i]] = gnms[i];
            }
        } catch (error1) {
            e = error1;
            console.log(e);
        }
    }
    return groupMap[gid];
};

if (_.isFunction(process.getuid)) {
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
    var icon, ref2;
    icon = args.nerdy && (colors[(colors[ext] != null) && ext || '_default'][2] + ((ref2 = icons.get(name, ext)) != null ? ref2 : ' ')) + ' ' || '';
    return " " + icon + colors[(colors[ext] != null) && ext || '_default'][0] + name + reset;
};

dotString = function(ext) {
    return colors[(colors[ext] != null) && ext || '_default'][1] + "." + reset;
};

extString = function(name, ext) {
    if (args.nerdy && name && icons.get(name, ext)) {
        return '';
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
        return _s.lpad(' ', 11);
    }
    if (stat.size < 1000) {
        return colors['_size']['b'][0] + _s.lpad(stat.size, 10) + " ";
    } else if (stat.size < 1000000) {
        if (args.pretty) {
            return colors['_size']['kB'][0] + _s.lpad((stat.size / 1000).toFixed(0), 7) + " " + colors['_size']['kB'][1] + "kB ";
        } else {
            return colors['_size']['kB'][0] + _s.lpad(stat.size, 10) + " ";
        }
    } else if (stat.size < 1000000000) {
        if (args.pretty) {
            return colors['_size']['MB'][0] + _s.lpad((stat.size / 1000000).toFixed(1), 7) + " " + colors['_size']['MB'][1] + "MB ";
        } else {
            return colors['_size']['MB'][0] + _s.lpad(stat.size, 10) + " ";
        }
    } else if (stat.size < 1000000000000) {
        if (args.pretty) {
            return colors['_size']['GB'][0] + _s.lpad((stat.size / 1000000000).toFixed(1), 7) + " " + colors['_size']['GB'][1] + "GB ";
        } else {
            return colors['_size']['GB'][0] + _s.lpad(stat.size, 10) + " ";
        }
    } else {
        if (args.pretty) {
            return colors['_size']['TB'][0] + _s.lpad((stat.size / 1000000000000).toFixed(3), 7) + " " + colors['_size']['TB'][1] + "TB ";
        } else {
            return colors['_size']['TB'][0] + _s.lpad(stat.size, 10) + " ";
        }
    }
};

timeString = function(stat) {
    var age, col, num, range, ref2, t;
    t = moment(stat.mtime);
    if (args.pretty) {
        age = moment().to(t, true);
        ref2 = age.split(' '), num = ref2[0], range = ref2[1];
        if (num[0] === 'a') {
            num = '1';
        }
        if (range === 'few') {
            num = moment().diff(t, 'seconds');
            range = 'seconds';
            return fw(23) + _s.lpad(num, 2) + ' ' + fw(16) + _s.rpad(range, 7) + ' ';
        } else if (range.startsWith('year')) {
            return fw(6) + _s.lpad(num, 2) + ' ' + fw(3) + _s.rpad(range, 7) + ' ';
        } else if (range.startsWith('month')) {
            return fw(8) + _s.lpad(num, 2) + ' ' + fw(4) + _s.rpad(range, 7) + ' ';
        } else if (range.startsWith('day')) {
            return fw(10) + _s.lpad(num, 2) + ' ' + fw(6) + _s.rpad(range, 7) + ' ';
        } else if (range.startsWith('hour')) {
            return fw(15) + _s.lpad(num, 2) + ' ' + fw(8) + _s.rpad(range, 7) + ' ';
        } else {
            return fw(18) + _s.lpad(num, 2) + ' ' + fw(12) + _s.rpad(range, 7) + ' ';
        }
    } else {
        return fw(16) + _s.lpad(t.format("DD"), 2) + fw(7) + '.' + fw(12) + t.format("MM") + fw(7) + "." + fw(8) + t.format("YY") + ' ' + fw(16) + t.format("HH") + (col = fw(7) + ':' + fw(14) + t.format("mm") + (col = fw(1) + ':' + fw(4) + t.format("ss") + ' '));
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
    return ocl + _s.rpad(own, stats.maxOwnerLength) + " " + gcl + _s.rpad(grp, stats.maxGroupLength);
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
    if (depth) {
        s += _.pad('', depth * 4);
    }
    if (s.length === 1 && args.offset) {
        s += '       ';
    }
    return s;
};

sort = function(list, stats, exts) {
    var j, k, l, ref2, ref3, results, results1;
    if (exts == null) {
        exts = [];
    }
    l = _.zip(list, stats, (function() {
        results = [];
        for (var j = 0, ref2 = list.length; 0 <= ref2 ? j < ref2 : j > ref2; 0 <= ref2 ? j++ : j--){ results.push(j); }
        return results;
    }).apply(this), exts.length > 0 && exts || (function() {
        results1 = [];
        for (var k = 0, ref3 = list.length; 0 <= ref3 ? k < ref3 : k > ref3; 0 <= ref3 ? k++ : k--){ results1.push(k); }
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

filter = function(p) {
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
        if (filter(rp)) {
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
                    if (!args.tree > 0) {
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
    var depth, doRecurse, error, files, j, len, msg, pn, pr, ps, ref2, results, s, sp;
    if (filter(p)) {
        return;
    }
    if (args.tree > 0) {
        depth = pathDepth(p);
    }
    if (depth > args.tree) {
        return;
    }
    ps = p;
    try {
        files = fs.readdirSync(p);
    } catch (error1) {
        error = error1;
        msg = error.message;
        if (_s.startsWith(msg, "EACCES")) {
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
    } else if (args.tree > 0) {
        console.log(getPrefix(slash.isDir(p), depth - 1) + dirString(slash.base(ps), slash.ext(ps)) + reset);
    } else {
        s = colors['_arrow'] + " ▶ " + colors['_header'][0];
        if (ps[0] !== '~') {
            ps = slash.resolve(ps);
        }
        if (_s.startsWith(ps, process.env.PWD)) {
            ps = ps.substr(process.env.PWD.length + 1);
        } else if (_s.startsWith(p, process.env.HOME)) {
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
        ref2 = fs.readdirSync(p).filter(doRecurse);
        results = [];
        for (j = 0, len = ref2.length; j < len; j++) {
            pr = ref2[j];
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

ref2 = pathstats.filter(function(f) {
    return f.length && f[1].isDirectory();
});
for (j = 0, len = ref2.length; j < len; j++) {
    p = ref2[j];
    listDir(p[0]);
}

console.log("");

if (args.info) {
    sprintf = require("sprintf-js").sprintf;
    console.log(BW(1) + " " + fw(8) + stats.num_dirs + (stats.hidden_dirs && fw(4) + "+" + fw(5) + stats.hidden_dirs || "") + fw(4) + " dirs " + fw(8) + stats.num_files + (stats.hidden_files && fw(4) + "+" + fw(5) + stats.hidden_files || "") + fw(4) + " files " + fw(8) + kstr.time(process.hrtime.bigint() - startTime) + " " + reset);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGtjQUFBO0lBQUE7O0FBUUEsU0FBQSxHQUFZLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBZixDQUFBOztBQUVaLE1BQW1ELE9BQUEsQ0FBUSxLQUFSLENBQW5ELEVBQUUsbUJBQUYsRUFBVSxpQkFBVixFQUFpQixlQUFqQixFQUF1QixlQUF2QixFQUE2QixlQUE3QixFQUFtQyxlQUFuQyxFQUF5QyxXQUF6QyxFQUE2Qzs7QUFFN0MsSUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUjs7QUFDVCxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVI7O0FBQ1QsRUFBQSxHQUFTLE9BQUEsQ0FBUSxtQkFBUjs7QUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0FBQ1QsS0FBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztBQVFULEtBQUEsR0FBUTs7QUFFUixJQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTLElBQUksQ0FBQzs7QUFDZCxFQUFBLEdBQVMsSUFBSSxDQUFDLEVBQUUsQ0FBQzs7QUFDakIsRUFBQSxHQUFTLElBQUksQ0FBQyxFQUFFLENBQUM7O0FBQ2pCLEVBQUEsR0FBUyxTQUFDLENBQUQ7V0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVUsQ0FBQSxDQUFBO0FBQXpCOztBQUNULEVBQUEsR0FBUyxTQUFDLENBQUQ7V0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVUsQ0FBQSxDQUFBO0FBQXpCOztBQUVULEtBQUEsR0FDSTtJQUFBLFFBQUEsRUFBZ0IsQ0FBaEI7SUFDQSxTQUFBLEVBQWdCLENBRGhCO0lBRUEsV0FBQSxFQUFnQixDQUZoQjtJQUdBLFlBQUEsRUFBZ0IsQ0FIaEI7SUFJQSxjQUFBLEVBQWdCLENBSmhCO0lBS0EsY0FBQSxFQUFnQixDQUxoQjtJQU1BLFdBQUEsRUFBZ0IsRUFOaEI7OztBQWNK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LEtBQUssQ0FBQyxTQUZWLEdBRXNCLENBQUMsS0FBSyxDQUFDLFlBQU4sSUFBdUIsRUFBQSxDQUFHLENBQUgsQ0FBQSxHQUFRLEdBQVIsR0FBYyxFQUFBLENBQUcsQ0FBSCxDQUFkLEdBQXVCLEtBQUssQ0FBQyxZQUFwRCxJQUFxRSxFQUF0RSxDQUZ0QixHQUVrRyxFQUFBLENBQUcsQ0FBSCxDQUZsRyxHQUUwRyxTQUYxRyxHQUdKLEVBQUEsQ0FBRyxDQUFILENBSEksR0FHSSxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBZixDQUFBLENBQUEsR0FBd0IsU0FBbEMsQ0FISixHQUdtRCxHQUhuRCxHQUlKLEtBTHVDLEVBRDNDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAgICAgICAwMDAgICAgICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwICAwMDAgICAgICAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgIDAwMFxuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgICAgICAgMDAwMDAwMCAgMDAwMDAwMFxuIyMjXG5cbnN0YXJ0VGltZSA9IHByb2Nlc3MuaHJ0aW1lLmJpZ2ludCgpXG5cbnsgY2hpbGRwLCBzbGFzaCwga2FyZywga3N0ciwga2xvZywgbm9vbiwgZnMsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuYW5zaSAgID0gcmVxdWlyZSAnYW5zaS0yNTYtY29sb3JzJ1xudXRpbCAgID0gcmVxdWlyZSAndXRpbCdcbl9zICAgICA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUuc3RyaW5nJ1xubW9tZW50ID0gcmVxdWlyZSAnbW9tZW50J1xuaWNvbnMgID0gcmVxdWlyZSAnLi9pY29ucydcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcblxudG9rZW4gPSB7fVxuXG5ib2xkICAgPSAnXFx4MWJbMW0nXG5yZXNldCAgPSBhbnNpLnJlc2V0XG5mZyAgICAgPSBhbnNpLmZnLmdldFJnYlxuQkcgICAgID0gYW5zaS5iZy5nZXRSZ2JcbmZ3ICAgICA9IChpKSAtPiBhbnNpLmZnLmdyYXlzY2FsZVtpXVxuQlcgICAgID0gKGkpIC0+IGFuc2kuYmcuZ3JheXNjYWxlW2ldXG5cbnN0YXRzID0gIyBjb3VudGVycyBmb3IgKGhpZGRlbikgZGlycy9maWxlc1xuICAgIG51bV9kaXJzOiAgICAgICAwXG4gICAgbnVtX2ZpbGVzOiAgICAgIDBcbiAgICBoaWRkZW5fZGlyczogICAgMFxuICAgIGhpZGRlbl9maWxlczogICAwXG4gICAgbWF4T3duZXJMZW5ndGg6IDBcbiAgICBtYXhHcm91cExlbmd0aDogMFxuICAgIGJyb2tlbkxpbmtzOiAgICBbXVxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcblxuYXJncyA9IGthcmcgXCJcIlwiXG5jb2xvci1sc1xuICAgIHBhdGhzICAgICAgICAgLiA/IHRoZSBmaWxlKHMpIGFuZC9vciBmb2xkZXIocykgdG8gZGlzcGxheSAuICoqXG4gICAgYnl0ZXMgICAgICAgICAuID8gaW5jbHVkZSBzaXplICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICBtZGF0ZSAgICAgICAgIC4gPyBpbmNsdWRlIG1vZGlmaWNhdGlvbiBkYXRlICAgICAgIC4gPSBmYWxzZVxuICAgIGxvbmcgICAgICAgICAgLiA/IGluY2x1ZGUgc2l6ZSBhbmQgZGF0ZSAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgb3duZXIgICAgICAgICAuID8gaW5jbHVkZSBvd25lciBhbmQgZ3JvdXAgICAgICAgICAuID0gZmFsc2VcbiAgICByaWdodHMgICAgICAgIC4gPyBpbmNsdWRlIHJpZ2h0cyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIGFsbCAgICAgICAgICAgLiA/IHNob3cgZG90IGZpbGVzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgZGlycyAgICAgICAgICAuID8gc2hvdyBvbmx5IGRpcnMgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICBmaWxlcyAgICAgICAgIC4gPyBzaG93IG9ubHkgZmlsZXMgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIHNpemUgICAgICAgICAgLiA/IHNvcnQgYnkgc2l6ZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgdGltZSAgICAgICAgICAuID8gc29ydCBieSB0aW1lICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICBraW5kICAgICAgICAgIC4gPyBzb3J0IGJ5IGtpbmQgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIHByZXR0eSAgICAgICAgLiA/IHByZXR0eSBzaXplIGFuZCBkYXRlICAgICAgICAgICAgLiA9IHRydWVcbiAgICBuZXJkeSAgICAgICAgIC4gPyB1c2UgbmVyZCBmb250IGljb25zICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIG9mZnNldCAgICAgICAgLiA/IGluZGVudCBzaG9ydCBsaXN0aW5ncyAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBPXG4gICAgaW5mbyAgICAgICAgICAuID8gc2hvdyBzdGF0aXN0aWNzICAgICAgICAgICAgICAgICAuID0gZmFsc2UgLiAtIGlcbiAgICByZWN1cnNlICAgICAgIC4gPyByZWN1cnNlIGludG8gc3ViZGlycyAgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gUlxuICAgIHRyZWUgICAgICAgICAgLiA/IHJlY3Vyc2UgbiBsZXZlbHMgYW5kIGluZGVudCAgICAgLiA9IDAgICAgIC4gLSBUXG4gICAgZmluZCAgICAgICAgICAuID8gZmlsdGVyIHdpdGggYSByZWdleHAgICAgICAgICAgICAgICAgICAgICAgLiAtIEZcbiAgICBhbHBoYWJldGljYWwgIC4gISBkb24ndCBncm91cCBkaXJzIGJlZm9yZSBmaWxlcyAgIC4gPSBmYWxzZSAuIC0gQVxuICAgIGRlYnVnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBEXG5cbnZlcnNpb24gICAgICAje3JlcXVpcmUoXCIje19fZGlybmFtZX0vLi4vcGFja2FnZS5qc29uXCIpLnZlcnNpb259XG5cIlwiXCJcblxuaWYgYXJncy5zaXplXG4gICAgYXJncy5maWxlcyA9IHRydWVcblxuaWYgYXJncy5sb25nXG4gICAgYXJncy5ieXRlcyA9IHRydWVcbiAgICBhcmdzLm1kYXRlID0gdHJ1ZVxuICAgIFxuaWYgYXJncy50cmVlID4gMFxuICAgIGFyZ3MucmVjdXJzZSA9IHRydWVcbiAgICBhcmdzLm9mZnNldCAgPSBmYWxzZVxuICAgIFxuaWYgYXJncy5kZWJ1Z1xuICAgIGtsb2cgbm9vbi5zdHJpbmdpZnkgYXJncywgY29sb3JzOnRydWVcblxuYXJncy5wYXRocyA9IFsnLiddIHVubGVzcyBhcmdzLnBhdGhzPy5sZW5ndGggPiAwXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbmNvbG9ycyA9XG4gICAgJ2NvZmZlZSc6ICAgWyBib2xkK2ZnKDQsNCwwKSwgIGZnKDEsMSwwKSwgZmcoMSwxLDApIF1cbiAgICAna29mZmVlJzogICBbIGJvbGQrZmcoNSw1LDApLCAgZmcoMSwwLDApLCBmZygxLDAsMCkgXVxuICAgICdweSc6ICAgICAgIFsgYm9sZCtmZygwLDIsMCksICBmZygwLDEsMCksIGZnKDAsMSwwKSBdXG4gICAgJ3JiJzogICAgICAgWyBib2xkK2ZnKDQsMCwwKSwgIGZnKDEsMCwwKSwgZmcoMSwwLDApIF1cbiAgICAnanNvbic6ICAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygxLDAsMSkgXVxuICAgICdjc29uJzogICAgIFsgYm9sZCtmZyg0LDAsNCksICBmZygxLDAsMSksIGZnKDEsMCwxKSBdXG4gICAgJ25vb24nOiAgICAgWyBib2xkK2ZnKDQsNCwwKSwgIGZnKDEsMSwwKSwgZmcoMSwxLDApIF1cbiAgICAncGxpc3QnOiAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygxLDAsMSkgXVxuICAgICdqcyc6ICAgICAgIFsgYm9sZCtmZyg1LDAsNSksICBmZygxLDAsMSksIGZnKDEsMCwxKSBdXG4gICAgJ2NwcCc6ICAgICAgWyBib2xkK2ZnKDUsNCwwKSwgIGZ3KDEpLCAgICAgZmcoMSwxLDApIF1cbiAgICAnaCc6ICAgICAgICBbICAgICAgZmcoMywxLDApLCAgZncoMSksICAgICBmZygxLDEsMCkgXVxuICAgICdweWMnOiAgICAgIFsgICAgICBmdyg1KSwgICAgICBmdygxKSwgICAgIGZ3KDEpIF1cbiAgICAnbG9nJzogICAgICBbICAgICAgZncoNSksICAgICAgZncoMSksICAgICBmdygxKSBdXG4gICAgJ2xvZyc6ICAgICAgWyAgICAgIGZ3KDUpLCAgICAgIGZ3KDEpLCAgICAgZncoMSkgXVxuICAgICd0eHQnOiAgICAgIFsgICAgICBmdygyMCksICAgICBmdygxKSwgICAgIGZ3KDIpIF1cbiAgICAnbWQnOiAgICAgICBbIGJvbGQrZncoMjApLCAgICAgZncoMSksICAgICBmdygyKSBdXG4gICAgJ21hcmtkb3duJzogWyBib2xkK2Z3KDIwKSwgICAgIGZ3KDEpLCAgICAgZncoMikgXVxuICAgICdzaCc6ICAgICAgIFsgYm9sZCtmZyg1LDEsMCksICBmZygxLDAsMCksIGZnKDEsMCwwKSBdXG4gICAgJ3BuZyc6ICAgICAgWyBib2xkK2ZnKDUsMCwwKSwgIGZnKDEsMCwwKSwgZmcoMSwwLDApIF1cbiAgICAnanBnJzogICAgICBbIGJvbGQrZmcoMCwzLDApLCAgZmcoMCwxLDApLCBmZygwLDEsMCkgXVxuICAgICdweG0nOiAgICAgIFsgYm9sZCtmZygxLDEsNSksICBmZygwLDAsMSksIGZnKDAsMCwyKSBdXG4gICAgJ3RpZmYnOiAgICAgWyBib2xkK2ZnKDEsMSw1KSwgIGZnKDAsMCwxKSwgZmcoMCwwLDIpIF1cblxuICAgICdfZGVmYXVsdCc6IFsgICAgICBmdygxNSksICAgICBmdygxKSwgICAgIGZ3KDYpIF1cbiAgICAnX2Rpcic6ICAgICBbIGJvbGQrQkcoMCwwLDIpK2Z3KDIzKSwgZmcoMSwxLDUpLCBib2xkK0JHKDAsMCwyKStmZygyLDIsNSkgXVxuICAgICdfLmRpcic6ICAgIFsgYm9sZCtCRygwLDAsMSkrZncoMjMpLCBib2xkK0JHKDAsMCwxKStmZygxLDEsNSksIGJvbGQrQkcoMCwwLDEpK2ZnKDIsMiw1KSBdXG4gICAgJ19saW5rJzogICAgeyAnYXJyb3cnOiBmZygxLDAsMSksICdwYXRoJzogZmcoNCwwLDQpLCAnYnJva2VuJzogQkcoNSwwLDApK2ZnKDUsNSwwKSB9XG4gICAgJ19hcnJvdyc6ICAgICBCVygyKStmdygwKVxuICAgICdfaGVhZGVyJzogIFsgYm9sZCtCVygyKStmZygzLDIsMCksICBmdyg0KSwgYm9sZCtCVygyKStmZyg1LDUsMCkgXVxuICAgICdfc2l6ZSc6ICAgIHsgYjogW2ZnKDAsMCwzKV0sIGtCOiBbZmcoMCwwLDUpLCBmZygwLDAsMyldLCBNQjogW2ZnKDEsMSw1KSwgZmcoMCwwLDUpXSwgR0I6IFtmZyg0LDQsNSksIGZnKDIsMiw1KV0sIFRCOiBbZmcoNCw0LDUpLCBmZygyLDIsNSldIH1cbiAgICAnX3VzZXJzJzogICB7IHJvb3Q6ICBmZygzLDAsMCksIGRlZmF1bHQ6IGZnKDEsMCwxKSB9XG4gICAgJ19ncm91cHMnOiAgeyB3aGVlbDogZmcoMSwwLDApLCBzdGFmZjogZmcoMCwxLDApLCBhZG1pbjogZmcoMSwxLDApLCBkZWZhdWx0OiBmZygxLDAsMSkgfVxuICAgICdfZXJyb3InOiAgIFsgYm9sZCtCRyg1LDAsMCkrZmcoNSw1LDApLCBib2xkK0JHKDUsMCwwKStmZyg1LDUsNSkgXVxuICAgICdfcmlnaHRzJzpcbiAgICAgICAgICAgICAgICAgICdyKyc6IGJvbGQrQlcoMSkrZmcoMSwxLDEpXG4gICAgICAgICAgICAgICAgICAnci0nOiByZXNldCtCVygxKVxuICAgICAgICAgICAgICAgICAgJ3crJzogYm9sZCtCVygxKStmZygyLDIsNSlcbiAgICAgICAgICAgICAgICAgICd3LSc6IHJlc2V0K0JXKDEpXG4gICAgICAgICAgICAgICAgICAneCsnOiBib2xkK0JXKDEpK2ZnKDUsMCwwKVxuICAgICAgICAgICAgICAgICAgJ3gtJzogcmVzZXQrQlcoMSlcblxudXNlck1hcCA9IHt9XG51c2VybmFtZSA9ICh1aWQpIC0+XG4gICAgaWYgbm90IHVzZXJNYXBbdWlkXVxuICAgICAgICB0cnlcbiAgICAgICAgICAgIHVzZXJNYXBbdWlkXSA9IGNoaWxkcC5zcGF3blN5bmMoXCJpZFwiLCBbXCItdW5cIiwgXCIje3VpZH1cIl0pLnN0ZG91dC50b1N0cmluZygndXRmOCcpLnRyaW0oKVxuICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICBsb2cgZVxuICAgIHVzZXJNYXBbdWlkXVxuXG5ncm91cE1hcCA9IG51bGxcbmdyb3VwbmFtZSA9IChnaWQpIC0+XG4gICAgaWYgbm90IGdyb3VwTWFwXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgZ2lkcyA9IGNoaWxkcC5zcGF3blN5bmMoXCJpZFwiLCBbXCItR1wiXSkuc3Rkb3V0LnRvU3RyaW5nKCd1dGY4Jykuc3BsaXQoJyAnKVxuICAgICAgICAgICAgZ25tcyA9IGNoaWxkcC5zcGF3blN5bmMoXCJpZFwiLCBbXCItR25cIl0pLnN0ZG91dC50b1N0cmluZygndXRmOCcpLnNwbGl0KCcgJylcbiAgICAgICAgICAgIGdyb3VwTWFwID0ge31cbiAgICAgICAgICAgIGZvciBpIGluIFswLi4uZ2lkcy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgZ3JvdXBNYXBbZ2lkc1tpXV0gPSBnbm1zW2ldXG4gICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgIGxvZyBlXG4gICAgZ3JvdXBNYXBbZ2lkXVxuXG5pZiBfLmlzRnVuY3Rpb24gcHJvY2Vzcy5nZXR1aWRcbiAgICBjb2xvcnNbJ191c2VycyddW3VzZXJuYW1lKHByb2Nlc3MuZ2V0dWlkKCkpXSA9IGZnKDAsNCwwKVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbmxvZ19lcnJvciA9ICgpIC0+XG4gICAgXG4gICAgbG9nIFwiIFwiICsgY29sb3JzWydfZXJyb3InXVswXSArIFwiIFwiICsgYm9sZCArIGFyZ3VtZW50c1swXSArIChhcmd1bWVudHMubGVuZ3RoID4gMSBhbmQgKGNvbG9yc1snX2Vycm9yJ11bMV0gKyBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykuc2xpY2UoMSkuam9pbignICcpKSBvciAnJykgKyBcIiBcIiArIHJlc2V0XG5cbmxpbmtTdHJpbmcgPSAoZmlsZSkgLT4gXG4gICAgXG4gICAgcyAgPSByZXNldCArIGZ3KDEpICsgY29sb3JzWydfbGluayddWydhcnJvdyddICsgXCIg4pa6IFwiIFxuICAgIHMgKz0gY29sb3JzWydfbGluayddWyhmaWxlIGluIHN0YXRzLmJyb2tlbkxpbmtzKSBhbmQgJ2Jyb2tlbicgb3IgJ3BhdGgnXSBcbiAgICB0cnlcbiAgICAgICAgcyArPSBzbGFzaC5wYXRoIGZzLnJlYWRsaW5rU3luYyhmaWxlKVxuICAgIGNhdGNoIGVyclxuICAgICAgICBzICs9ICcgPyAnXG4gICAgc1xuXG5uYW1lU3RyaW5nID0gKG5hbWUsIGV4dCkgLT4gXG4gICAgXG4gICAgaWNvbiA9IGFyZ3MubmVyZHkgYW5kIChjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMl0gKyAoaWNvbnMuZ2V0KG5hbWUsIGV4dCkgPyAnICcpKSArICcgJyBvciAnJ1xuICAgIFwiIFwiICsgaWNvbiArIGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVswXSArIG5hbWUgKyByZXNldFxuICAgIFxuZG90U3RyaW5nICA9IChleHQpIC0+IFxuICAgIFxuICAgIGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVsxXSArIFwiLlwiICsgcmVzZXRcbiAgICBcbmV4dFN0cmluZyAgPSAobmFtZSwgZXh0KSAtPiBcbiAgICBcbiAgICBpZiBhcmdzLm5lcmR5IGFuZCBuYW1lIGFuZCBpY29ucy5nZXQobmFtZSwgZXh0KSB0aGVuIHJldHVybiAnJ1xuICAgIGRvdFN0cmluZyhleHQpICsgY29sb3JzW2NvbG9yc1tleHRdPyBhbmQgZXh0IG9yICdfZGVmYXVsdCddWzJdICsgZXh0ICsgcmVzZXRcbiAgICBcbmRpclN0cmluZyAgPSAobmFtZSwgZXh0KSAtPlxuICAgIFxuICAgIGMgPSBuYW1lIGFuZCAnX2Rpcicgb3IgJ18uZGlyJ1xuICAgIGljb24gPSBhcmdzLm5lcmR5IGFuZCBjb2xvcnNbY11bMl0gKyAnIFxcdWY0MTMnIG9yICcnXG4gICAgaWNvbiArIGNvbG9yc1tjXVswXSArIChuYW1lIGFuZCAoXCIgXCIgKyBuYW1lKSBvciBcIiBcIikgKyAoaWYgZXh0IHRoZW4gY29sb3JzW2NdWzFdICsgJy4nICsgY29sb3JzW2NdWzJdICsgZXh0IGVsc2UgXCJcIikgKyBcIiBcIlxuXG5zaXplU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgaWYgYXJncy5wcmV0dHkgYW5kIHN0YXQuc2l6ZSA9PSAwXG4gICAgICAgIHJldHVybiBfcy5scGFkKCcgJywgMTEpXG4gICAgaWYgc3RhdC5zaXplIDwgMTAwMFxuICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ2InXVswXSArIF9zLmxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2UgaWYgc3RhdC5zaXplIDwgMTAwMDAwMFxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydrQiddWzBdICsgX3MubHBhZCgoc3RhdC5zaXplIC8gMTAwMCkudG9GaXhlZCgwKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsna0InXVsxXSArIFwia0IgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydrQiddWzBdICsgX3MubHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZSBpZiBzdGF0LnNpemUgPCAxMDAwMDAwMDAwXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ01CJ11bMF0gKyBfcy5scGFkKChzdGF0LnNpemUgLyAxMDAwMDAwKS50b0ZpeGVkKDEpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydNQiddWzFdICsgXCJNQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ01CJ11bMF0gKyBfcy5scGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlIGlmIHN0YXQuc2l6ZSA8IDEwMDAwMDAwMDAwMDBcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnR0InXVswXSArIF9zLmxwYWQoKHN0YXQuc2l6ZSAvIDEwMDAwMDAwMDApLnRvRml4ZWQoMSksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMV0gKyBcIkdCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnR0InXVswXSArIF9zLmxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2VcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnVEInXVswXSArIF9zLmxwYWQoKHN0YXQuc2l6ZSAvIDEwMDAwMDAwMDAwMDApLnRvRml4ZWQoMyksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMV0gKyBcIlRCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnVEInXVswXSArIF9zLmxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuXG50aW1lU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgdCA9IG1vbWVudChzdGF0Lm10aW1lKVxuICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgIGFnZSA9IG1vbWVudCgpLnRvKHQsIHRydWUpXG4gICAgICAgIFtudW0sIHJhbmdlXSA9IGFnZS5zcGxpdCAnICdcbiAgICAgICAgbnVtID0gJzEnIGlmIG51bVswXSA9PSAnYSdcbiAgICAgICAgaWYgcmFuZ2UgPT0gJ2ZldydcbiAgICAgICAgICAgIG51bSA9IG1vbWVudCgpLmRpZmYgdCwgJ3NlY29uZHMnXG4gICAgICAgICAgICByYW5nZSA9ICdzZWNvbmRzJ1xuICAgICAgICAgICAgZncoMjMpICsgX3MubHBhZChudW0sIDIpICsgJyAnICsgZncoMTYpICsgX3MucnBhZChyYW5nZSwgNykgKyAnICdcbiAgICAgICAgZWxzZSBpZiByYW5nZS5zdGFydHNXaXRoICd5ZWFyJ1xuICAgICAgICAgICAgZncoNikgKyBfcy5scGFkKG51bSwgMikgKyAnICcgKyBmdygzKSArIF9zLnJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2UgaWYgcmFuZ2Uuc3RhcnRzV2l0aCAnbW9udGgnXG4gICAgICAgICAgICBmdyg4KSArIF9zLmxwYWQobnVtLCAyKSArICcgJyArIGZ3KDQpICsgX3MucnBhZChyYW5nZSwgNykgKyAnICdcbiAgICAgICAgZWxzZSBpZiByYW5nZS5zdGFydHNXaXRoICdkYXknXG4gICAgICAgICAgICBmdygxMCkgKyBfcy5scGFkKG51bSwgMikgKyAnICcgKyBmdyg2KSArIF9zLnJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2UgaWYgcmFuZ2Uuc3RhcnRzV2l0aCAnaG91cidcbiAgICAgICAgICAgIGZ3KDE1KSArIF9zLmxwYWQobnVtLCAyKSArICcgJyArIGZ3KDgpICsgX3MucnBhZChyYW5nZSwgNykgKyAnICdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZncoMTgpICsgX3MubHBhZChudW0sIDIpICsgJyAnICsgZncoMTIpICsgX3MucnBhZChyYW5nZSwgNykgKyAnICdcbiAgICBlbHNlXG4gICAgICAgIGZ3KDE2KSArIF9zLmxwYWQodC5mb3JtYXQoXCJERFwiKSwyKSArIGZ3KDcpKycuJyArXG4gICAgICAgIGZ3KDEyKSArIHQuZm9ybWF0KFwiTU1cIikgKyBmdyg3KStcIi5cIiArXG4gICAgICAgIGZ3KCA4KSArIHQuZm9ybWF0KFwiWVlcIikgKyAnICcgK1xuICAgICAgICBmdygxNikgKyB0LmZvcm1hdChcIkhIXCIpICsgY29sID0gZncoNykrJzonICtcbiAgICAgICAgZncoMTQpICsgdC5mb3JtYXQoXCJtbVwiKSArIGNvbCA9IGZ3KDEpKyc6JyArXG4gICAgICAgIGZ3KCA0KSArIHQuZm9ybWF0KFwic3NcIikgKyAnICdcblxub3duZXJOYW1lID0gKHN0YXQpIC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIHVzZXJuYW1lIHN0YXQudWlkXG4gICAgY2F0Y2hcbiAgICAgICAgc3RhdC51aWRcblxuZ3JvdXBOYW1lID0gKHN0YXQpIC0+XG4gICAgXG4gICAgdHJ5XG4gICAgICAgIGdyb3VwbmFtZSBzdGF0LmdpZFxuICAgIGNhdGNoXG4gICAgICAgIHN0YXQuZ2lkXG5cbm93bmVyU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgXG4gICAgb3duID0gb3duZXJOYW1lKHN0YXQpXG4gICAgZ3JwID0gZ3JvdXBOYW1lKHN0YXQpXG4gICAgb2NsID0gY29sb3JzWydfdXNlcnMnXVtvd25dXG4gICAgb2NsID0gY29sb3JzWydfdXNlcnMnXVsnZGVmYXVsdCddIHVubGVzcyBvY2xcbiAgICBnY2wgPSBjb2xvcnNbJ19ncm91cHMnXVtncnBdXG4gICAgZ2NsID0gY29sb3JzWydfZ3JvdXBzJ11bJ2RlZmF1bHQnXSB1bmxlc3MgZ2NsXG4gICAgb2NsICsgX3MucnBhZChvd24sIHN0YXRzLm1heE93bmVyTGVuZ3RoKSArIFwiIFwiICsgZ2NsICsgX3MucnBhZChncnAsIHN0YXRzLm1heEdyb3VwTGVuZ3RoKVxuXG5yd3hTdHJpbmcgPSAobW9kZSwgaSkgLT5cbiAgICBcbiAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMTAwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3IrJ10gKyAnIHInIG9yIGNvbG9yc1snX3JpZ2h0cyddWydyLSddICsgJyAgJykgK1xuICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIwMTApIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsndysnXSArICcgdycgb3IgY29sb3JzWydfcmlnaHRzJ11bJ3ctJ10gKyAnICAnKSArXG4gICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjAwMSkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWyd4KyddICsgJyB4JyBvciBjb2xvcnNbJ19yaWdodHMnXVsneC0nXSArICcgICcpXG5cbnJpZ2h0c1N0cmluZyA9IChzdGF0KSAtPlxuICAgIFxuICAgIHVyID0gcnd4U3RyaW5nKHN0YXQubW9kZSwgMikgKyBcIiBcIlxuICAgIGdyID0gcnd4U3RyaW5nKHN0YXQubW9kZSwgMSkgKyBcIiBcIlxuICAgIHJvID0gcnd4U3RyaW5nKHN0YXQubW9kZSwgMCkgKyBcIiBcIlxuICAgIHVyICsgZ3IgKyBybyArIHJlc2V0XG5cbmdldFByZWZpeCA9IChzdGF0LCBkZXB0aCkgLT5cbiAgICBcbiAgICBzID0gJydcbiAgICBpZiBhcmdzLnJpZ2h0c1xuICAgICAgICBzICs9IHJpZ2h0c1N0cmluZyBzdGF0XG4gICAgICAgIHMgKz0gXCIgXCJcbiAgICBpZiBhcmdzLm93bmVyXG4gICAgICAgIHMgKz0gb3duZXJTdHJpbmcgc3RhdFxuICAgICAgICBzICs9IFwiIFwiXG4gICAgaWYgYXJncy5ieXRlc1xuICAgICAgICBzICs9IHNpemVTdHJpbmcgc3RhdFxuICAgIGlmIGFyZ3MubWRhdGVcbiAgICAgICAgcyArPSB0aW1lU3RyaW5nIHN0YXRcbiAgICAgICAgXG4gICAgaWYgZGVwdGhcbiAgICAgICAgcyArPSBfLnBhZCAnJywgZGVwdGgqNFxuICAgICAgICBcbiAgICBpZiBzLmxlbmd0aCA9PSAxIGFuZCBhcmdzLm9mZnNldFxuICAgICAgICBzICs9ICcgICAgICAgJ1xuICAgIHNcbiAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDBcblxuc29ydCA9IChsaXN0LCBzdGF0cywgZXh0cz1bXSkgLT5cbiAgICBcbiAgICBsID0gXy56aXAgbGlzdCwgc3RhdHMsIFswLi4ubGlzdC5sZW5ndGhdLCAoZXh0cy5sZW5ndGggPiAwIGFuZCBleHRzIG9yIFswLi4ubGlzdC5sZW5ndGhdKVxuICAgIFxuICAgIGlmIGFyZ3Mua2luZFxuICAgICAgICBpZiBleHRzID09IFtdIHRoZW4gcmV0dXJuIGxpc3RcbiAgICAgICAgbC5zb3J0KChhLGIpIC0+XG4gICAgICAgICAgICBpZiBhWzNdID4gYlszXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICBpZiBhWzNdIDwgYlszXSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYXJncy50aW1lXG4gICAgICAgICAgICAgICAgbSA9IG1vbWVudChhWzFdLm10aW1lKVxuICAgICAgICAgICAgICAgIGlmIG0uaXNBZnRlcihiWzFdLm10aW1lKSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgaWYgbS5pc0JlZm9yZShiWzFdLm10aW1lKSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYXJncy5zaXplXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplID4gYlsxXS5zaXplIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPCBiWzFdLnNpemUgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFbMl0gPiBiWzJdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIC0xKVxuICAgIGVsc2UgaWYgYXJncy50aW1lXG4gICAgICAgIGwuc29ydCgoYSxiKSAtPlxuICAgICAgICAgICAgbSA9IG1vbWVudChhWzFdLm10aW1lKVxuICAgICAgICAgICAgaWYgbS5pc0FmdGVyKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIGlmIG0uaXNCZWZvcmUoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3Muc2l6ZVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA+IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICBlbHNlIGlmIGFyZ3Muc2l6ZVxuICAgICAgICBsLnNvcnQoKGEsYikgLT5cbiAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA+IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICBpZiBhWzFdLnNpemUgPCBiWzFdLnNpemUgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFbMl0gPiBiWzJdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIC0xKVxuICAgIF8udW56aXAobClbMF1cblxuZmlsdGVyID0gKHApIC0+XG4gICAgXG4gICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgcmV0dXJuIHRydWUgaWYgcFswXSA9PSAnJCdcbiAgICAgICAgcmV0dXJuIHRydWUgaWYgcCA9PSAnZGVza3RvcC5pbmknXG4gICAgICAgIHJldHVybiB0cnVlIGlmIHAudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoICdudHVzZXInXG4gICAgICAgIFxuICAgIGZhbHNlXG4gICAgXG4jIDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwXG4jIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAgICAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMFxuXG5saXN0RmlsZXMgPSAocCwgZmlsZXMsIGRlcHRoKSAtPlxuICAgIFxuICAgIGFscGggPSBbXSBpZiBhcmdzLmFscGhhYmV0aWNhbFxuICAgIGRpcnMgPSBbXSAjIHZpc2libGUgZGlyc1xuICAgIGZpbHMgPSBbXSAjIHZpc2libGUgZmlsZXNcbiAgICBkc3RzID0gW10gIyBkaXIgc3RhdHNcbiAgICBmc3RzID0gW10gIyBmaWxlIHN0YXRzXG4gICAgZXh0cyA9IFtdICMgZmlsZSBleHRlbnNpb25zXG5cbiAgICBpZiBhcmdzLm93bmVyXG4gICAgICAgIFxuICAgICAgICBmaWxlcy5mb3JFYWNoIChycCkgLT5cbiAgICAgICAgICAgIGlmIHNsYXNoLmlzQWJzb2x1dGUgcnBcbiAgICAgICAgICAgICAgICBmaWxlID0gc2xhc2gucmVzb2x2ZSBycFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZpbGUgID0gc2xhc2guam9pbiBwLCBycFxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgc3RhdCA9IGZzLmxzdGF0U3luYyhmaWxlKVxuICAgICAgICAgICAgICAgIG9sID0gb3duZXJOYW1lKHN0YXQpLmxlbmd0aFxuICAgICAgICAgICAgICAgIGdsID0gZ3JvdXBOYW1lKHN0YXQpLmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIG9sID4gc3RhdHMubWF4T3duZXJMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubWF4T3duZXJMZW5ndGggPSBvbFxuICAgICAgICAgICAgICAgIGlmIGdsID4gc3RhdHMubWF4R3JvdXBMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubWF4R3JvdXBMZW5ndGggPSBnbFxuICAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuICAgIGZpbGVzLmZvckVhY2ggKHJwKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgc2xhc2guaXNBYnNvbHV0ZSBycFxuICAgICAgICAgICAgZmlsZSAgPSBzbGFzaC5yZXNvbHZlIHJwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZpbGUgID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIHAsIHJwXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGZpbHRlciBycFxuICAgICAgICBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBsc3RhdCA9IGZzLmxzdGF0U3luYyBmaWxlXG4gICAgICAgICAgICBsaW5rICA9IGxzdGF0LmlzU3ltYm9saWNMaW5rKClcbiAgICAgICAgICAgIHN0YXQgID0gbGluayBhbmQgZnMuc3RhdFN5bmMoZmlsZSkgb3IgbHN0YXRcbiAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICBzdGF0ID0gbHN0YXRcbiAgICAgICAgICAgICAgICBzdGF0cy5icm9rZW5MaW5rcy5wdXNoIGZpbGVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsb2dfZXJyb3IgXCJjYW4ndCByZWFkIGZpbGU6IFwiLCBmaWxlLCBsaW5rXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgZXh0ICA9IHNsYXNoLmV4dCBmaWxlXG4gICAgICAgIG5hbWUgPSBzbGFzaC5iYXNlIGZpbGVcbiAgICAgICAgXG4gICAgICAgIGlmIG5hbWVbMF0gPT0gJy4nXG4gICAgICAgICAgICBleHQgPSBuYW1lLnN1YnN0cigxKSArIHNsYXNoLmV4dG5hbWUgZmlsZVxuICAgICAgICAgICAgbmFtZSA9ICcnXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgbmFtZS5sZW5ndGggYW5kIG5hbWVbbmFtZS5sZW5ndGgtMV0gIT0gJ1xccicgb3IgYXJncy5hbGxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcyA9IGdldFByZWZpeCBzdGF0LCBkZXB0aFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc3RhdC5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICAgICAgaWYgbm90IGFyZ3MuZmlsZXNcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IGFyZ3MudHJlZSA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5hbWUuc3RhcnRzV2l0aCAnLi8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVbMi4uXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGRpclN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzICs9IGxpbmtTdHJpbmcgZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlycy5wdXNoIHMrcmVzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGFscGgucHVzaCBzK3Jlc2V0IGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgICAgICAgICAgICAgIGRzdHMucHVzaCBzdGF0XG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm51bV9kaXJzICs9IDFcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9kaXJzICs9IDFcbiAgICAgICAgICAgIGVsc2UgIyBpZiBwYXRoIGlzIGZpbGVcbiAgICAgICAgICAgICAgICBpZiBub3QgYXJncy5kaXJzXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gbmFtZVN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGV4dFN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgbGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBsaW5rU3RyaW5nIGZpbGVcbiAgICAgICAgICAgICAgICAgICAgZmlscy5wdXNoIHMrcmVzZXRcbiAgICAgICAgICAgICAgICAgICAgYWxwaC5wdXNoIHMrcmVzZXQgaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICAgICAgICAgICAgICAgICAgZnN0cy5wdXNoIHN0YXRcbiAgICAgICAgICAgICAgICAgICAgZXh0cy5wdXNoIGV4dFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5udW1fZmlsZXMgKz0gMVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMuaGlkZGVuX2ZpbGVzICs9IDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgc3RhdC5pc0ZpbGUoKVxuICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9maWxlcyArPSAxXG4gICAgICAgICAgICBlbHNlIGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9kaXJzICs9IDFcblxuICAgIGlmIGFyZ3Muc2l6ZSBvciBhcmdzLmtpbmQgb3IgYXJncy50aW1lXG4gICAgICAgIGlmIGRpcnMubGVuZ3RoIGFuZCBub3QgYXJncy5maWxlc1xuICAgICAgICAgICAgZGlycyA9IHNvcnQgZGlycywgZHN0c1xuICAgICAgICBpZiBmaWxzLmxlbmd0aFxuICAgICAgICAgICAgZmlscyA9IHNvcnQgZmlscywgZnN0cywgZXh0c1xuXG4gICAgaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICAgICAgbG9nIHAgZm9yIHAgaW4gYWxwaFxuICAgIGVsc2VcbiAgICAgICAgbG9nIGQgZm9yIGQgaW4gZGlyc1xuICAgICAgICBsb2cgZiBmb3IgZiBpbiBmaWxzXG5cbiMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwXG5cbmxpc3REaXIgPSAocCkgLT5cbiAgICBcbiAgICByZXR1cm4gaWYgZmlsdGVyIHBcbiAgICAgICAgXG4gICAgaWYgYXJncy50cmVlID4gMFxuICAgICAgICBkZXB0aCA9IHBhdGhEZXB0aCBwXG4gICAgXG4gICAgcmV0dXJuIGlmIGRlcHRoID4gYXJncy50cmVlXG4gICAgXG4gICAgcHMgPSBwXG5cbiAgICB0cnlcbiAgICAgICAgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhwKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICAgIG1zZyA9IGVycm9yLm1lc3NhZ2VcbiAgICAgICAgbXNnID0gXCJwZXJtaXNzaW9uIGRlbmllZFwiIGlmIF9zLnN0YXJ0c1dpdGgobXNnLCBcIkVBQ0NFU1wiKVxuICAgICAgICBsb2dfZXJyb3IgbXNnXG5cbiAgICBpZiBhcmdzLmZpbmRcbiAgICAgICAgZmlsZXMgPSBmaWxlcy5maWx0ZXIgKGYpIC0+XG4gICAgICAgICAgICBmIGlmIFJlZ0V4cChhcmdzLmZpbmQpLnRlc3QgZlxuICAgICAgICAgICAgXG4gICAgaWYgYXJncy5maW5kIGFuZCBub3QgZmlsZXMubGVuZ3RoXG4gICAgICAgIHRydWVcbiAgICBlbHNlIGlmIGFyZ3MucGF0aHMubGVuZ3RoID09IDEgYW5kIGFyZ3MucGF0aHNbMF0gPT0gJy4nIGFuZCBub3QgYXJncy5yZWN1cnNlXG4gICAgICAgIGxvZyByZXNldFxuICAgIGVsc2UgaWYgYXJncy50cmVlID4gMFxuICAgICAgICBsb2cgZ2V0UHJlZml4KHNsYXNoLmlzRGlyKHApLCBkZXB0aC0xKSArIGRpclN0cmluZyhzbGFzaC5iYXNlKHBzKSwgc2xhc2guZXh0KHBzKSkgKyByZXNldFxuICAgIGVsc2VcbiAgICAgICAgcyA9IGNvbG9yc1snX2Fycm93J10gKyBcIiDilrYgXCIgKyBjb2xvcnNbJ19oZWFkZXInXVswXVxuICAgICAgICBwcyA9IHNsYXNoLnJlc29sdmUgcHMgaWYgcHNbMF0gIT0gJ34nXG4gICAgICAgIGlmIF9zLnN0YXJ0c1dpdGggcHMsIHByb2Nlc3MuZW52LlBXRFxuICAgICAgICAgICAgcHMgPSBwcy5zdWJzdHIgcHJvY2Vzcy5lbnYuUFdELmxlbmd0aCsxXG4gICAgICAgIGVsc2UgaWYgX3Muc3RhcnRzV2l0aCBwLCBwcm9jZXNzLmVudi5IT01FXG4gICAgICAgICAgICBwcyA9IFwiflwiICsgcC5zdWJzdHIgcHJvY2Vzcy5lbnYuSE9NRS5sZW5ndGhcblxuICAgICAgICBpZiBwcyA9PSAnLydcbiAgICAgICAgICAgIHMgKz0gJy8nXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNwID0gcHMuc3BsaXQoJy8nKVxuICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVswXSArIHNwLnNoaWZ0KClcbiAgICAgICAgICAgIHdoaWxlIHNwLmxlbmd0aFxuICAgICAgICAgICAgICAgIHBuID0gc3Auc2hpZnQoKVxuICAgICAgICAgICAgICAgIGlmIHBuXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gY29sb3JzWydfaGVhZGVyJ11bMV0gKyAnLydcbiAgICAgICAgICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVtzcC5sZW5ndGggPT0gMCBhbmQgMiBvciAwXSArIHBuXG4gICAgICAgIGxvZyByZXNldFxuICAgICAgICBsb2cgcyArIFwiIFwiICsgcmVzZXRcbiAgICAgICAgbG9nIHJlc2V0XG5cbiAgICBpZiBmaWxlcy5sZW5ndGhcbiAgICAgICAgbGlzdEZpbGVzIHAsIGZpbGVzLCBkZXB0aFxuXG4gICAgaWYgYXJncy5yZWN1cnNlXG4gICAgICAgIFxuICAgICAgICBkb1JlY3Vyc2UgPSAoZikgLT4gXG4gICAgICAgICAgICByZXR1cm4gZmFsc2UgaWYgbm90IGFyZ3MuYWxsIGFuZCBmWzBdID09ICcuJ1xuICAgICAgICAgICAgc2xhc2guaXNEaXIgc2xhc2guam9pbiBwLCBmXG4gICAgICAgICAgICBcbiAgICAgICAgZm9yIHByIGluIGZzLnJlYWRkaXJTeW5jKHApLmZpbHRlciBkb1JlY3Vyc2VcbiAgICAgICAgICAgIGxpc3REaXIgc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIHAsIHByXG4gICAgICAgICAgICBcbnBhdGhEZXB0aCA9IChwKSAtPlxuICAgIFxuICAgIHJlbCA9IHNsYXNoLnJlbGF0aXZlIHAsIHByb2Nlc3MuY3dkKClcbiAgICByZXR1cm4gMCBpZiBwID09ICcuJ1xuICAgIHJlbC5zcGxpdCgnLycpLmxlbmd0aFxuXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcblxucGF0aHN0YXRzID0gYXJncy5wYXRocy5tYXAgKGYpIC0+XG4gICAgdHJ5XG4gICAgICAgIFtmLCBmcy5zdGF0U3luYyhmKV1cbiAgICBjYXRjaCBlcnJvclxuICAgICAgICBsb2dfZXJyb3IgJ25vIHN1Y2ggZmlsZTogJywgZlxuICAgICAgICBbXVxuXG5maWxlc3RhdHMgPSBwYXRoc3RhdHMuZmlsdGVyKCAoZikgLT4gZi5sZW5ndGggYW5kIG5vdCBmWzFdLmlzRGlyZWN0b3J5KCkgKVxuXG5pZiBmaWxlc3RhdHMubGVuZ3RoID4gMFxuICAgIGxvZyByZXNldFxuICAgIGxpc3RGaWxlcyBwcm9jZXNzLmN3ZCgpLCBmaWxlc3RhdHMubWFwKCAocykgLT4gc1swXSApXG5cbmZvciBwIGluIHBhdGhzdGF0cy5maWx0ZXIoIChmKSAtPiBmLmxlbmd0aCBhbmQgZlsxXS5pc0RpcmVjdG9yeSgpIClcbiAgICBsaXN0RGlyIHBbMF1cblxubG9nIFwiXCJcbmlmIGFyZ3MuaW5mb1xuICAgIHNwcmludGYgPSByZXF1aXJlKFwic3ByaW50Zi1qc1wiKS5zcHJpbnRmXG4gICAgbG9nIEJXKDEpICsgXCIgXCIgK1xuICAgIGZ3KDgpICsgc3RhdHMubnVtX2RpcnMgKyAoc3RhdHMuaGlkZGVuX2RpcnMgYW5kIGZ3KDQpICsgXCIrXCIgKyBmdyg1KSArIChzdGF0cy5oaWRkZW5fZGlycykgb3IgXCJcIikgKyBmdyg0KSArIFwiIGRpcnMgXCIgK1xuICAgIGZ3KDgpICsgc3RhdHMubnVtX2ZpbGVzICsgKHN0YXRzLmhpZGRlbl9maWxlcyBhbmQgZncoNCkgKyBcIitcIiArIGZ3KDUpICsgKHN0YXRzLmhpZGRlbl9maWxlcykgb3IgXCJcIikgKyBmdyg0KSArIFwiIGZpbGVzIFwiICtcbiAgICBmdyg4KSArIGtzdHIudGltZShwcm9jZXNzLmhydGltZS5iaWdpbnQoKS1zdGFydFRpbWUpICsgXCIgXCIgK1xuICAgIHJlc2V0XG4iXX0=
//# sourceURL=../coffee/color-ls.coffee