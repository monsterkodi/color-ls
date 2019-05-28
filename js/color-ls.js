// koffee 0.50.0

/*
 0000000   0000000   000       0000000   00000000           000       0000000
000       000   000  000      000   000  000   000          000      000
000       000   000  000      000   000  0000000    000000  000      0000000
000       000   000  000      000   000  000   000          000           000
 0000000   0000000   0000000   0000000   000   000          0000000  0000000
 */
var BG, BW, _, _s, ansi, args, bold, childp, colors, dirString, dotString, extString, fg, filestats, filter, fs, fw, groupMap, groupName, groupname, icons, j, karg, kstr, len, linkString, listDir, listFiles, log_error, moment, nameString, ownerName, ownerString, p, pathstats, ref, ref1, ref2, reset, rightsString, rwxString, sizeString, slash, sort, sprintf, startTime, stats, timeString, token, userMap, username, util,
    indexOf = [].indexOf;

ref = require('kxk'), childp = ref.childp, slash = ref.slash, karg = ref.karg, kstr = ref.kstr, fs = ref.fs, _ = ref._;

ansi = require('ansi-256-colors');

util = require('util');

_s = require('underscore.string');

moment = require('moment');

icons = require('./icons');

startTime = process.hrtime.bigint();

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

args = karg("color-ls\n    paths         . ? the file(s) and/or folder(s) to display . **\n    bytes         . ? include size                    . = false\n    mdate         . ? include modification date       . = false\n    long          . ? include size and date           . = false\n    owner         . ? include owner and group         . = false\n    rights        . ? include rights                  . = false\n    all           . ? show dot files                  . = false\n    dirs          . ? show only dirs                  . = false\n    files         . ? show only files                 . = false\n    size          . ? sort by size                    . = false\n    time          . ? sort by time                    . = false\n    kind          . ? sort by kind                    . = false\n    pretty        . ? pretty size and date            . = true\n    nerdy         . ? use nerd font icons             . = false\n    offset        . ? indent short listings           . = false . - O\n    info          . ? show statistics                 . = false . - i\n    recurse       . ? recurse into subdirs            . = false . - R\n    find          . ? filter with a regexp                      . - F\n    alphabetical  . ! don't group dirs before files   . = false . - A\n\nversion      " + (require(__dirname + "/../package.json").version));

if (args.size) {
    args.files = true;
}

if (args.long) {
    args.bytes = true;
    args.mdate = true;
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
    '_arrow': fw(1),
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
        if (num === 'a') {
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

listFiles = function(p, files) {
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
        ext = slash.extname(file).substr(1);
        name = slash.basename(file, slash.extname(file));
        if (name[0] === '.') {
            ext = name.substr(1) + slash.extname(file);
            name = '';
        }
        if (name.length && name[name.length - 1] !== '\r' || args.all) {
            s = " ";
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
            if (s.length === 1 && args.offset) {
                s += '       ';
            }
            if (stat.isDirectory()) {
                if (!args.files) {
                    s += dirString(name, ext);
                    if (link) {
                        s += linkString(file);
                    }
                    dirs.push(s + reset);
                    if (args.alphabetical) {
                        alph.push(s + reset);
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
    var error, files, j, len, msg, pn, pr, ps, ref2, results, s, sp;
    if (filter(p)) {
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
    } else {
        s = colors['_arrow'] + "►" + colors['_header'][0] + " ";
        if (ps[0] !== '~') {
            ps = slash.resolve(ps);
        }
        if (_s.startsWith(ps, process.env.PWD)) {
            ps = "./" + ps.substr(process.env.PWD.length);
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
        listFiles(p, files);
    }
    if (args.recurse) {
        ref2 = fs.readdirSync(p).filter(function(f) {
            return fs.lstatSync(slash.join(p, f)).isDirectory();
        });
        results = [];
        for (j = 0, len = ref2.length; j < len; j++) {
            pr = ref2[j];
            results.push(listDir(slash.resolve(slash.join(p, pr))));
        }
        return results;
    }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGdhQUFBO0lBQUE7O0FBUUEsTUFBdUMsT0FBQSxDQUFRLEtBQVIsQ0FBdkMsRUFBRSxtQkFBRixFQUFVLGlCQUFWLEVBQWlCLGVBQWpCLEVBQXVCLGVBQXZCLEVBQTZCLFdBQTdCLEVBQWlDOztBQUVqQyxJQUFBLEdBQVMsT0FBQSxDQUFRLGlCQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxFQUFBLEdBQVMsT0FBQSxDQUFRLG1CQUFSOztBQUNULE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFDVCxLQUFBLEdBQVMsT0FBQSxDQUFRLFNBQVI7O0FBUVQsU0FBQSxHQUFZLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBZixDQUFBOztBQUNaLEtBQUEsR0FBUTs7QUFHUixJQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTLElBQUksQ0FBQzs7QUFDZCxFQUFBLEdBQVMsSUFBSSxDQUFDLEVBQUUsQ0FBQzs7QUFDakIsRUFBQSxHQUFTLElBQUksQ0FBQyxFQUFFLENBQUM7O0FBQ2pCLEVBQUEsR0FBUyxTQUFDLENBQUQ7V0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVUsQ0FBQSxDQUFBO0FBQXpCOztBQUNULEVBQUEsR0FBUyxTQUFDLENBQUQ7V0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVUsQ0FBQSxDQUFBO0FBQXpCOztBQUVULEtBQUEsR0FDSTtJQUFBLFFBQUEsRUFBZ0IsQ0FBaEI7SUFDQSxTQUFBLEVBQWdCLENBRGhCO0lBRUEsV0FBQSxFQUFnQixDQUZoQjtJQUdBLFlBQUEsRUFBZ0IsQ0FIaEI7SUFJQSxjQUFBLEVBQWdCLENBSmhCO0lBS0EsY0FBQSxFQUFnQixDQUxoQjtJQU1BLFdBQUEsRUFBZ0IsRUFOaEI7OztBQWNKLElBQUEsR0FBTyxJQUFBLENBQUssOHdD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IDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgICAgMDAwICAgICAgIDAwMDAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgIDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAgICAwMDBcbiAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAgICAgIDAwMDAwMDAgIDAwMDAwMDBcbiMjI1xuXG57IGNoaWxkcCwgc2xhc2gsIGthcmcsIGtzdHIsIGZzLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbmFuc2kgICA9IHJlcXVpcmUgJ2Fuc2ktMjU2LWNvbG9ycydcbnV0aWwgICA9IHJlcXVpcmUgJ3V0aWwnXG5fcyAgICAgPSByZXF1aXJlICd1bmRlcnNjb3JlLnN0cmluZydcbm1vbWVudCA9IHJlcXVpcmUgJ21vbWVudCdcbmljb25zICA9IHJlcXVpcmUgJy4vaWNvbnMnXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG5cbnN0YXJ0VGltZSA9IHByb2Nlc3MuaHJ0aW1lLmJpZ2ludCgpXG50b2tlbiA9IHt9XG5cbiMgY29sb3JzXG5ib2xkICAgPSAnXFx4MWJbMW0nXG5yZXNldCAgPSBhbnNpLnJlc2V0XG5mZyAgICAgPSBhbnNpLmZnLmdldFJnYlxuQkcgICAgID0gYW5zaS5iZy5nZXRSZ2JcbmZ3ICAgICA9IChpKSAtPiBhbnNpLmZnLmdyYXlzY2FsZVtpXVxuQlcgICAgID0gKGkpIC0+IGFuc2kuYmcuZ3JheXNjYWxlW2ldXG5cbnN0YXRzID0gIyBjb3VudGVycyBmb3IgKGhpZGRlbikgZGlycy9maWxlc1xuICAgIG51bV9kaXJzOiAgICAgICAwXG4gICAgbnVtX2ZpbGVzOiAgICAgIDBcbiAgICBoaWRkZW5fZGlyczogICAgMFxuICAgIGhpZGRlbl9maWxlczogICAwXG4gICAgbWF4T3duZXJMZW5ndGg6IDBcbiAgICBtYXhHcm91cExlbmd0aDogMFxuICAgIGJyb2tlbkxpbmtzOiAgICBbXVxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcblxuYXJncyA9IGthcmcgXCJcIlwiXG5jb2xvci1sc1xuICAgIHBhdGhzICAgICAgICAgLiA/IHRoZSBmaWxlKHMpIGFuZC9vciBmb2xkZXIocykgdG8gZGlzcGxheSAuICoqXG4gICAgYnl0ZXMgICAgICAgICAuID8gaW5jbHVkZSBzaXplICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICBtZGF0ZSAgICAgICAgIC4gPyBpbmNsdWRlIG1vZGlmaWNhdGlvbiBkYXRlICAgICAgIC4gPSBmYWxzZVxuICAgIGxvbmcgICAgICAgICAgLiA/IGluY2x1ZGUgc2l6ZSBhbmQgZGF0ZSAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgb3duZXIgICAgICAgICAuID8gaW5jbHVkZSBvd25lciBhbmQgZ3JvdXAgICAgICAgICAuID0gZmFsc2VcbiAgICByaWdodHMgICAgICAgIC4gPyBpbmNsdWRlIHJpZ2h0cyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIGFsbCAgICAgICAgICAgLiA/IHNob3cgZG90IGZpbGVzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgZGlycyAgICAgICAgICAuID8gc2hvdyBvbmx5IGRpcnMgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICBmaWxlcyAgICAgICAgIC4gPyBzaG93IG9ubHkgZmlsZXMgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIHNpemUgICAgICAgICAgLiA/IHNvcnQgYnkgc2l6ZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgdGltZSAgICAgICAgICAuID8gc29ydCBieSB0aW1lICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICBraW5kICAgICAgICAgIC4gPyBzb3J0IGJ5IGtpbmQgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIHByZXR0eSAgICAgICAgLiA/IHByZXR0eSBzaXplIGFuZCBkYXRlICAgICAgICAgICAgLiA9IHRydWVcbiAgICBuZXJkeSAgICAgICAgIC4gPyB1c2UgbmVyZCBmb250IGljb25zICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIG9mZnNldCAgICAgICAgLiA/IGluZGVudCBzaG9ydCBsaXN0aW5ncyAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBPXG4gICAgaW5mbyAgICAgICAgICAuID8gc2hvdyBzdGF0aXN0aWNzICAgICAgICAgICAgICAgICAuID0gZmFsc2UgLiAtIGlcbiAgICByZWN1cnNlICAgICAgIC4gPyByZWN1cnNlIGludG8gc3ViZGlycyAgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gUlxuICAgIGZpbmQgICAgICAgICAgLiA/IGZpbHRlciB3aXRoIGEgcmVnZXhwICAgICAgICAgICAgICAgICAgICAgIC4gLSBGXG4gICAgYWxwaGFiZXRpY2FsICAuICEgZG9uJ3QgZ3JvdXAgZGlycyBiZWZvcmUgZmlsZXMgICAuID0gZmFsc2UgLiAtIEFcblxudmVyc2lvbiAgICAgICN7cmVxdWlyZShcIiN7X19kaXJuYW1lfS8uLi9wYWNrYWdlLmpzb25cIikudmVyc2lvbn1cblwiXCJcIlxuXG5pZiBhcmdzLnNpemVcbiAgICBhcmdzLmZpbGVzID0gdHJ1ZVxuXG5pZiBhcmdzLmxvbmdcbiAgICBhcmdzLmJ5dGVzID0gdHJ1ZVxuICAgIGFyZ3MubWRhdGUgPSB0cnVlXG5cbmFyZ3MucGF0aHMgPSBbJy4nXSB1bmxlc3MgYXJncy5wYXRocz8ubGVuZ3RoID4gMFxuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG5jb2xvcnMgPVxuICAgICdjb2ZmZWUnOiAgIFsgYm9sZCtmZyg0LDQsMCksICBmZygxLDEsMCksIGZnKDEsMSwwKSBdXG4gICAgJ2tvZmZlZSc6ICAgWyBib2xkK2ZnKDUsNSwwKSwgIGZnKDEsMCwwKSwgZmcoMSwwLDApIF1cbiAgICAncHknOiAgICAgICBbIGJvbGQrZmcoMCwyLDApLCAgZmcoMCwxLDApLCBmZygwLDEsMCkgXVxuICAgICdyYic6ICAgICAgIFsgYm9sZCtmZyg0LDAsMCksICBmZygxLDAsMCksIGZnKDEsMCwwKSBdXG4gICAgJ2pzb24nOiAgICAgWyBib2xkK2ZnKDQsMCw0KSwgIGZnKDEsMCwxKSwgZmcoMSwwLDEpIF1cbiAgICAnY3Nvbic6ICAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygxLDAsMSkgXVxuICAgICdub29uJzogICAgIFsgYm9sZCtmZyg0LDQsMCksICBmZygxLDEsMCksIGZnKDEsMSwwKSBdXG4gICAgJ3BsaXN0JzogICAgWyBib2xkK2ZnKDQsMCw0KSwgIGZnKDEsMCwxKSwgZmcoMSwwLDEpIF1cbiAgICAnanMnOiAgICAgICBbIGJvbGQrZmcoNSwwLDUpLCAgZmcoMSwwLDEpLCBmZygxLDAsMSkgXVxuICAgICdjcHAnOiAgICAgIFsgYm9sZCtmZyg1LDQsMCksICBmdygxKSwgICAgIGZnKDEsMSwwKSBdXG4gICAgJ2gnOiAgICAgICAgWyAgICAgIGZnKDMsMSwwKSwgIGZ3KDEpLCAgICAgZmcoMSwxLDApIF1cbiAgICAncHljJzogICAgICBbICAgICAgZncoNSksICAgICAgZncoMSksICAgICBmdygxKSBdXG4gICAgJ2xvZyc6ICAgICAgWyAgICAgIGZ3KDUpLCAgICAgIGZ3KDEpLCAgICAgZncoMSkgXVxuICAgICdsb2cnOiAgICAgIFsgICAgICBmdyg1KSwgICAgICBmdygxKSwgICAgIGZ3KDEpIF1cbiAgICAndHh0JzogICAgICBbICAgICAgZncoMjApLCAgICAgZncoMSksICAgICBmdygyKSBdXG4gICAgJ21kJzogICAgICAgWyBib2xkK2Z3KDIwKSwgICAgIGZ3KDEpLCAgICAgZncoMikgXVxuICAgICdtYXJrZG93bic6IFsgYm9sZCtmdygyMCksICAgICBmdygxKSwgICAgIGZ3KDIpIF1cbiAgICAnc2gnOiAgICAgICBbIGJvbGQrZmcoNSwxLDApLCAgZmcoMSwwLDApLCBmZygxLDAsMCkgXVxuICAgICdwbmcnOiAgICAgIFsgYm9sZCtmZyg1LDAsMCksICBmZygxLDAsMCksIGZnKDEsMCwwKSBdXG4gICAgJ2pwZyc6ICAgICAgWyBib2xkK2ZnKDAsMywwKSwgIGZnKDAsMSwwKSwgZmcoMCwxLDApIF1cbiAgICAncHhtJzogICAgICBbIGJvbGQrZmcoMSwxLDUpLCAgZmcoMCwwLDEpLCBmZygwLDAsMikgXVxuICAgICd0aWZmJzogICAgIFsgYm9sZCtmZygxLDEsNSksICBmZygwLDAsMSksIGZnKDAsMCwyKSBdXG5cbiAgICAnX2RlZmF1bHQnOiBbICAgICAgZncoMTUpLCAgICAgZncoMSksICAgICBmdyg2KSBdXG4gICAgJ19kaXInOiAgICAgWyBib2xkK0JHKDAsMCwyKStmdygyMyksIGZnKDEsMSw1KSwgYm9sZCtCRygwLDAsMikrZmcoMiwyLDUpIF1cbiAgICAnXy5kaXInOiAgICBbIGJvbGQrQkcoMCwwLDEpK2Z3KDIzKSwgYm9sZCtCRygwLDAsMSkrZmcoMSwxLDUpLCBib2xkK0JHKDAsMCwxKStmZygyLDIsNSkgXVxuICAgICdfbGluayc6ICAgIHsgJ2Fycm93JzogZmcoMSwwLDEpLCAncGF0aCc6IGZnKDQsMCw0KSwgJ2Jyb2tlbic6IEJHKDUsMCwwKStmZyg1LDUsMCkgfVxuICAgICdfYXJyb3cnOiAgICAgZncoMSlcbiAgICAnX2hlYWRlcic6ICBbIGJvbGQrQlcoMikrZmcoMywyLDApLCAgZncoNCksIGJvbGQrQlcoMikrZmcoNSw1LDApIF1cbiAgICAnX3NpemUnOiAgICB7IGI6IFtmZygwLDAsMyldLCBrQjogW2ZnKDAsMCw1KSwgZmcoMCwwLDMpXSwgTUI6IFtmZygxLDEsNSksIGZnKDAsMCw1KV0sIEdCOiBbZmcoNCw0LDUpLCBmZygyLDIsNSldLCBUQjogW2ZnKDQsNCw1KSwgZmcoMiwyLDUpXSB9XG4gICAgJ191c2Vycyc6ICAgeyByb290OiAgZmcoMywwLDApLCBkZWZhdWx0OiBmZygxLDAsMSkgfVxuICAgICdfZ3JvdXBzJzogIHsgd2hlZWw6IGZnKDEsMCwwKSwgc3RhZmY6IGZnKDAsMSwwKSwgYWRtaW46IGZnKDEsMSwwKSwgZGVmYXVsdDogZmcoMSwwLDEpIH1cbiAgICAnX2Vycm9yJzogICBbIGJvbGQrQkcoNSwwLDApK2ZnKDUsNSwwKSwgYm9sZCtCRyg1LDAsMCkrZmcoNSw1LDUpIF1cbiAgICAnX3JpZ2h0cyc6XG4gICAgICAgICAgICAgICAgICAncisnOiBib2xkK0JXKDEpK2ZnKDEsMSwxKVxuICAgICAgICAgICAgICAgICAgJ3ItJzogcmVzZXQrQlcoMSlcbiAgICAgICAgICAgICAgICAgICd3Kyc6IGJvbGQrQlcoMSkrZmcoMiwyLDUpXG4gICAgICAgICAgICAgICAgICAndy0nOiByZXNldCtCVygxKVxuICAgICAgICAgICAgICAgICAgJ3grJzogYm9sZCtCVygxKStmZyg1LDAsMClcbiAgICAgICAgICAgICAgICAgICd4LSc6IHJlc2V0K0JXKDEpXG5cbnVzZXJNYXAgPSB7fVxudXNlcm5hbWUgPSAodWlkKSAtPlxuICAgIGlmIG5vdCB1c2VyTWFwW3VpZF1cbiAgICAgICAgdHJ5XG4gICAgICAgICAgICB1c2VyTWFwW3VpZF0gPSBjaGlsZHAuc3Bhd25TeW5jKFwiaWRcIiwgW1wiLXVuXCIsIFwiI3t1aWR9XCJdKS5zdGRvdXQudG9TdHJpbmcoJ3V0ZjgnKS50cmltKClcbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgbG9nIGVcbiAgICB1c2VyTWFwW3VpZF1cblxuZ3JvdXBNYXAgPSBudWxsXG5ncm91cG5hbWUgPSAoZ2lkKSAtPlxuICAgIGlmIG5vdCBncm91cE1hcFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGdpZHMgPSBjaGlsZHAuc3Bhd25TeW5jKFwiaWRcIiwgW1wiLUdcIl0pLnN0ZG91dC50b1N0cmluZygndXRmOCcpLnNwbGl0KCcgJylcbiAgICAgICAgICAgIGdubXMgPSBjaGlsZHAuc3Bhd25TeW5jKFwiaWRcIiwgW1wiLUduXCJdKS5zdGRvdXQudG9TdHJpbmcoJ3V0ZjgnKS5zcGxpdCgnICcpXG4gICAgICAgICAgICBncm91cE1hcCA9IHt9XG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uLmdpZHMubGVuZ3RoXVxuICAgICAgICAgICAgICAgIGdyb3VwTWFwW2dpZHNbaV1dID0gZ25tc1tpXVxuICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICBsb2cgZVxuICAgIGdyb3VwTWFwW2dpZF1cblxuaWYgXy5pc0Z1bmN0aW9uIHByb2Nlc3MuZ2V0dWlkXG4gICAgY29sb3JzWydfdXNlcnMnXVt1c2VybmFtZShwcm9jZXNzLmdldHVpZCgpKV0gPSBmZygwLDQsMClcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG5sb2dfZXJyb3IgPSAoKSAtPlxuICAgIGxvZyBcIiBcIiArIGNvbG9yc1snX2Vycm9yJ11bMF0gKyBcIiBcIiArIGJvbGQgKyBhcmd1bWVudHNbMF0gKyAoYXJndW1lbnRzLmxlbmd0aCA+IDEgYW5kIChjb2xvcnNbJ19lcnJvciddWzFdICsgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpLnNsaWNlKDEpLmpvaW4oJyAnKSkgb3IgJycpICsgXCIgXCIgKyByZXNldFxuXG5saW5rU3RyaW5nID0gKGZpbGUpIC0+IFxuICAgIHMgID0gcmVzZXQgKyBmdygxKSArIGNvbG9yc1snX2xpbmsnXVsnYXJyb3cnXSArIFwiIOKWuiBcIiBcbiAgICBzICs9IGNvbG9yc1snX2xpbmsnXVsoZmlsZSBpbiBzdGF0cy5icm9rZW5MaW5rcykgYW5kICdicm9rZW4nIG9yICdwYXRoJ10gXG4gICAgdHJ5XG4gICAgICAgIHMgKz0gc2xhc2gucGF0aCBmcy5yZWFkbGlua1N5bmMoZmlsZSlcbiAgICBjYXRjaCBlcnJcbiAgICAgICAgcyArPSAnID8gJ1xuICAgIHNcblxubmFtZVN0cmluZyA9IChuYW1lLCBleHQpIC0+IFxuICAgIGljb24gPSBhcmdzLm5lcmR5IGFuZCAoY29sb3JzW2NvbG9yc1tleHRdPyBhbmQgZXh0IG9yICdfZGVmYXVsdCddWzJdICsgKGljb25zLmdldChuYW1lLCBleHQpID8gJyAnKSkgKyAnICcgb3IgJydcbiAgICBcIiBcIiArIGljb24gKyBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMF0gKyBuYW1lICsgcmVzZXRcbiAgICBcbmRvdFN0cmluZyAgPSAoICAgICAgZXh0KSAtPiBcbiAgICBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMV0gKyBcIi5cIiArIHJlc2V0XG4gICAgXG5leHRTdHJpbmcgID0gKG5hbWUsIGV4dCkgLT4gXG4gICAgaWYgYXJncy5uZXJkeSBhbmQgbmFtZSBhbmQgaWNvbnMuZ2V0KG5hbWUsIGV4dCkgdGhlbiByZXR1cm4gJydcbiAgICBkb3RTdHJpbmcoZXh0KSArIGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVsyXSArIGV4dCArIHJlc2V0XG4gICAgXG5kaXJTdHJpbmcgID0gKG5hbWUsIGV4dCkgLT5cbiAgICBjID0gbmFtZSBhbmQgJ19kaXInIG9yICdfLmRpcidcbiAgICBpY29uID0gYXJncy5uZXJkeSBhbmQgY29sb3JzW2NdWzJdICsgJyBcXHVmNDEzJyBvciAnJ1xuICAgIGljb24gKyBjb2xvcnNbY11bMF0gKyAobmFtZSBhbmQgKFwiIFwiICsgbmFtZSkgb3IgXCIgXCIpICsgKGlmIGV4dCB0aGVuIGNvbG9yc1tjXVsxXSArICcuJyArIGNvbG9yc1tjXVsyXSArIGV4dCBlbHNlIFwiXCIpICsgXCIgXCJcblxuc2l6ZVN0cmluZyA9IChzdGF0KSAtPlxuICAgIFxuICAgIGlmIGFyZ3MucHJldHR5IGFuZCBzdGF0LnNpemUgPT0gMFxuICAgICAgICByZXR1cm4gX3MubHBhZCgnICcsIDExKVxuICAgIGlmIHN0YXQuc2l6ZSA8IDEwMDBcbiAgICAgICAgY29sb3JzWydfc2l6ZSddWydiJ11bMF0gKyBfcy5scGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlIGlmIHN0YXQuc2l6ZSA8IDEwMDAwMDBcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsna0InXVswXSArIF9zLmxwYWQoKHN0YXQuc2l6ZSAvIDEwMDApLnRvRml4ZWQoMCksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ2tCJ11bMV0gKyBcImtCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsna0InXVswXSArIF9zLmxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2UgaWYgc3RhdC5zaXplIDwgMTAwMDAwMDAwMFxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydNQiddWzBdICsgX3MubHBhZCgoc3RhdC5zaXplIC8gMTAwMDAwMCkudG9GaXhlZCgxKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsnTUInXVsxXSArIFwiTUIgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydNQiddWzBdICsgX3MubHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZSBpZiBzdGF0LnNpemUgPCAxMDAwMDAwMDAwMDAwXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMF0gKyBfcy5scGFkKChzdGF0LnNpemUgLyAxMDAwMDAwMDAwKS50b0ZpeGVkKDEpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydHQiddWzFdICsgXCJHQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMF0gKyBfcy5scGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMF0gKyBfcy5scGFkKChzdGF0LnNpemUgLyAxMDAwMDAwMDAwMDAwKS50b0ZpeGVkKDMpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydUQiddWzFdICsgXCJUQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMF0gKyBfcy5scGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcblxudGltZVN0cmluZyA9IChzdGF0KSAtPlxuICAgIFxuICAgIHQgPSBtb21lbnQoc3RhdC5tdGltZSlcbiAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICBhZ2UgPSBtb21lbnQoKS50byh0LCB0cnVlKVxuICAgICAgICBbbnVtLCByYW5nZV0gPSBhZ2Uuc3BsaXQgJyAnXG4gICAgICAgIG51bSA9ICcxJyBpZiBudW0gPT0gJ2EnXG4gICAgICAgIGlmIHJhbmdlID09ICdmZXcnXG4gICAgICAgICAgICBudW0gPSBtb21lbnQoKS5kaWZmIHQsICdzZWNvbmRzJ1xuICAgICAgICAgICAgcmFuZ2UgPSAnc2Vjb25kcydcbiAgICAgICAgICAgIGZ3KDIzKSArIF9zLmxwYWQobnVtLCAyKSArICcgJyArIGZ3KDE2KSArIF9zLnJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2UgaWYgcmFuZ2Uuc3RhcnRzV2l0aCAneWVhcidcbiAgICAgICAgICAgIGZ3KDYpICsgX3MubHBhZChudW0sIDIpICsgJyAnICsgZncoMykgKyBfcy5ycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ21vbnRoJ1xuICAgICAgICAgICAgZncoOCkgKyBfcy5scGFkKG51bSwgMikgKyAnICcgKyBmdyg0KSArIF9zLnJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2UgaWYgcmFuZ2Uuc3RhcnRzV2l0aCAnZGF5J1xuICAgICAgICAgICAgZncoMTApICsgX3MubHBhZChudW0sIDIpICsgJyAnICsgZncoNikgKyBfcy5ycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ2hvdXInXG4gICAgICAgICAgICBmdygxNSkgKyBfcy5scGFkKG51bSwgMikgKyAnICcgKyBmdyg4KSArIF9zLnJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZ3KDE4KSArIF9zLmxwYWQobnVtLCAyKSArICcgJyArIGZ3KDEyKSArIF9zLnJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgZWxzZVxuICAgICAgICBmdygxNikgKyBfcy5scGFkKHQuZm9ybWF0KFwiRERcIiksMikgKyBmdyg3KSsnLicgK1xuICAgICAgICBmdygxMikgKyB0LmZvcm1hdChcIk1NXCIpICsgZncoNykrXCIuXCIgK1xuICAgICAgICBmdyggOCkgKyB0LmZvcm1hdChcIllZXCIpICsgJyAnICtcbiAgICAgICAgZncoMTYpICsgdC5mb3JtYXQoXCJISFwiKSArIGNvbCA9IGZ3KDcpKyc6JyArXG4gICAgICAgIGZ3KDE0KSArIHQuZm9ybWF0KFwibW1cIikgKyBjb2wgPSBmdygxKSsnOicgK1xuICAgICAgICBmdyggNCkgKyB0LmZvcm1hdChcInNzXCIpICsgJyAnXG5cbm93bmVyTmFtZSA9IChzdGF0KSAtPlxuICAgIFxuICAgIHRyeVxuICAgICAgICB1c2VybmFtZSBzdGF0LnVpZFxuICAgIGNhdGNoXG4gICAgICAgIHN0YXQudWlkXG5cbmdyb3VwTmFtZSA9IChzdGF0KSAtPlxuICAgIFxuICAgIHRyeVxuICAgICAgICBncm91cG5hbWUgc3RhdC5naWRcbiAgICBjYXRjaFxuICAgICAgICBzdGF0LmdpZFxuXG5vd25lclN0cmluZyA9IChzdGF0KSAtPlxuICAgIFxuICAgIG93biA9IG93bmVyTmFtZShzdGF0KVxuICAgIGdycCA9IGdyb3VwTmFtZShzdGF0KVxuICAgIG9jbCA9IGNvbG9yc1snX3VzZXJzJ11bb3duXVxuICAgIG9jbCA9IGNvbG9yc1snX3VzZXJzJ11bJ2RlZmF1bHQnXSB1bmxlc3Mgb2NsXG4gICAgZ2NsID0gY29sb3JzWydfZ3JvdXBzJ11bZ3JwXVxuICAgIGdjbCA9IGNvbG9yc1snX2dyb3VwcyddWydkZWZhdWx0J10gdW5sZXNzIGdjbFxuICAgIG9jbCArIF9zLnJwYWQob3duLCBzdGF0cy5tYXhPd25lckxlbmd0aCkgKyBcIiBcIiArIGdjbCArIF9zLnJwYWQoZ3JwLCBzdGF0cy5tYXhHcm91cExlbmd0aClcblxucnd4U3RyaW5nID0gKG1vZGUsIGkpIC0+XG4gICAgXG4gICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjEwMCkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWydyKyddICsgJyByJyBvciBjb2xvcnNbJ19yaWdodHMnXVsnci0nXSArICcgICcpICtcbiAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDEwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3crJ10gKyAnIHcnIG9yIGNvbG9yc1snX3JpZ2h0cyddWyd3LSddICsgJyAgJykgK1xuICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIwMDEpIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsneCsnXSArICcgeCcgb3IgY29sb3JzWydfcmlnaHRzJ11bJ3gtJ10gKyAnICAnKVxuXG5yaWdodHNTdHJpbmcgPSAoc3RhdCkgLT5cbiAgICBcbiAgICB1ciA9IHJ3eFN0cmluZyhzdGF0Lm1vZGUsIDIpICsgXCIgXCJcbiAgICBnciA9IHJ3eFN0cmluZyhzdGF0Lm1vZGUsIDEpICsgXCIgXCJcbiAgICBybyA9IHJ3eFN0cmluZyhzdGF0Lm1vZGUsIDApICsgXCIgXCJcbiAgICB1ciArIGdyICsgcm8gKyByZXNldFxuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwXG4jICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbnNvcnQgPSAobGlzdCwgc3RhdHMsIGV4dHM9W10pIC0+XG4gICAgbCA9IF8uemlwIGxpc3QsIHN0YXRzLCBbMC4uLmxpc3QubGVuZ3RoXSwgKGV4dHMubGVuZ3RoID4gMCBhbmQgZXh0cyBvciBbMC4uLmxpc3QubGVuZ3RoXSlcbiAgICBpZiBhcmdzLmtpbmRcbiAgICAgICAgaWYgZXh0cyA9PSBbXSB0aGVuIHJldHVybiBsaXN0XG4gICAgICAgIGwuc29ydCgoYSxiKSAtPlxuICAgICAgICAgICAgaWYgYVszXSA+IGJbM10gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgaWYgYVszXSA8IGJbM10gdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3MudGltZVxuICAgICAgICAgICAgICAgIG0gPSBtb21lbnQoYVsxXS5tdGltZSlcbiAgICAgICAgICAgICAgICBpZiBtLmlzQWZ0ZXIoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgICAgIGlmIG0uaXNCZWZvcmUoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3Muc2l6ZVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA+IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICBlbHNlIGlmIGFyZ3MudGltZVxuICAgICAgICBsLnNvcnQoKGEsYikgLT5cbiAgICAgICAgICAgIG0gPSBtb21lbnQoYVsxXS5tdGltZSlcbiAgICAgICAgICAgIGlmIG0uaXNBZnRlcihiWzFdLm10aW1lKSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICBpZiBtLmlzQmVmb3JlKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhcmdzLnNpemVcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPiBiWzFdLnNpemUgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA8IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYVsyXSA+IGJbMl0gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgLTEpXG4gICAgZWxzZSBpZiBhcmdzLnNpemVcbiAgICAgICAgbC5zb3J0KChhLGIpIC0+XG4gICAgICAgICAgICBpZiBhWzFdLnNpemUgPiBiWzFdLnNpemUgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICBfLnVuemlwKGwpWzBdXG5cbmZpbHRlciA9IChwKSAtPlxuICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgIHJldHVybiB0cnVlIGlmIHBbMF0gPT0gJyQnXG4gICAgICAgIHJldHVybiB0cnVlIGlmIHAgPT0gJ2Rlc2t0b3AuaW5pJ1xuICAgICAgICByZXR1cm4gdHJ1ZSBpZiBwLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCAnbnR1c2VyJ1xuICAgIGZhbHNlXG4gICAgXG4jIDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwXG4jIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAgICAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMFxuXG5saXN0RmlsZXMgPSAocCwgZmlsZXMpIC0+XG4gICAgYWxwaCA9IFtdIGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgZGlycyA9IFtdICMgdmlzaWJsZSBkaXJzXG4gICAgZmlscyA9IFtdICMgdmlzaWJsZSBmaWxlc1xuICAgIGRzdHMgPSBbXSAjIGRpciBzdGF0c1xuICAgIGZzdHMgPSBbXSAjIGZpbGUgc3RhdHNcbiAgICBleHRzID0gW10gIyBmaWxlIGV4dGVuc2lvbnNcblxuICAgIGlmIGFyZ3Mub3duZXJcbiAgICAgICAgZmlsZXMuZm9yRWFjaCAocnApIC0+XG4gICAgICAgICAgICBpZiBzbGFzaC5pc0Fic29sdXRlIHJwXG4gICAgICAgICAgICAgICAgZmlsZSA9IHNsYXNoLnJlc29sdmUgcnBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmaWxlICA9IHNsYXNoLmpvaW4gcCwgcnBcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIHN0YXQgPSBmcy5sc3RhdFN5bmMoZmlsZSlcbiAgICAgICAgICAgICAgICBvbCA9IG93bmVyTmFtZShzdGF0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICBnbCA9IGdyb3VwTmFtZShzdGF0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICBpZiBvbCA+IHN0YXRzLm1heE93bmVyTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm1heE93bmVyTGVuZ3RoID0gb2xcbiAgICAgICAgICAgICAgICBpZiBnbCA+IHN0YXRzLm1heEdyb3VwTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm1heEdyb3VwTGVuZ3RoID0gZ2xcbiAgICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICBmaWxlcy5mb3JFYWNoIChycCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLmlzQWJzb2x1dGUgcnBcbiAgICAgICAgICAgIGZpbGUgID0gc2xhc2gucmVzb2x2ZSBycFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmaWxlICA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBwLCBycFxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBmaWx0ZXIgcnBcbiAgICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgbHN0YXQgPSBmcy5sc3RhdFN5bmMgZmlsZVxuICAgICAgICAgICAgbGluayAgPSBsc3RhdC5pc1N5bWJvbGljTGluaygpXG4gICAgICAgICAgICBzdGF0ICA9IGxpbmsgYW5kIGZzLnN0YXRTeW5jKGZpbGUpIG9yIGxzdGF0XG4gICAgICAgIGNhdGNoXG4gICAgICAgICAgICBpZiBsaW5rXG4gICAgICAgICAgICAgICAgc3RhdCA9IGxzdGF0XG4gICAgICAgICAgICAgICAgc3RhdHMuYnJva2VuTGlua3MucHVzaCBmaWxlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbG9nX2Vycm9yIFwiY2FuJ3QgcmVhZCBmaWxlOiBcIiwgZmlsZSwgbGlua1xuICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGV4dCAgPSBzbGFzaC5leHRuYW1lKGZpbGUpLnN1YnN0cigxKVxuICAgICAgICBuYW1lID0gc2xhc2guYmFzZW5hbWUoZmlsZSwgc2xhc2guZXh0bmFtZSBmaWxlKVxuICAgICAgICBpZiBuYW1lWzBdID09ICcuJ1xuICAgICAgICAgICAgZXh0ID0gbmFtZS5zdWJzdHIoMSkgKyBzbGFzaC5leHRuYW1lIGZpbGVcbiAgICAgICAgICAgIG5hbWUgPSAnJ1xuICAgICAgICBpZiBuYW1lLmxlbmd0aCBhbmQgbmFtZVtuYW1lLmxlbmd0aC0xXSAhPSAnXFxyJyBvciBhcmdzLmFsbFxuICAgICAgICAgICAgcyA9IFwiIFwiXG4gICAgICAgICAgICBpZiBhcmdzLnJpZ2h0c1xuICAgICAgICAgICAgICAgIHMgKz0gcmlnaHRzU3RyaW5nIHN0YXRcbiAgICAgICAgICAgICAgICBzICs9IFwiIFwiXG4gICAgICAgICAgICBpZiBhcmdzLm93bmVyXG4gICAgICAgICAgICAgICAgcyArPSBvd25lclN0cmluZyBzdGF0XG4gICAgICAgICAgICAgICAgcyArPSBcIiBcIlxuICAgICAgICAgICAgaWYgYXJncy5ieXRlc1xuICAgICAgICAgICAgICAgIHMgKz0gc2l6ZVN0cmluZyBzdGF0XG4gICAgICAgICAgICBpZiBhcmdzLm1kYXRlXG4gICAgICAgICAgICAgICAgcyArPSB0aW1lU3RyaW5nIHN0YXRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHMubGVuZ3RoID09IDEgYW5kIGFyZ3Mub2Zmc2V0XG4gICAgICAgICAgICAgICAgcyArPSAnICAgICAgICdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICAgIGlmIG5vdCBhcmdzLmZpbGVzXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gZGlyU3RyaW5nIG5hbWUsIGV4dFxuICAgICAgICAgICAgICAgICAgICBpZiBsaW5rXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGxpbmtTdHJpbmcgZmlsZVxuICAgICAgICAgICAgICAgICAgICBkaXJzLnB1c2ggcytyZXNldFxuICAgICAgICAgICAgICAgICAgICBhbHBoLnB1c2ggcytyZXNldCBpZiBhcmdzLmFscGhhYmV0aWNhbFxuICAgICAgICAgICAgICAgICAgICBkc3RzLnB1c2ggc3RhdFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5udW1fZGlycyArPSAxXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZGlycyArPSAxXG4gICAgICAgICAgICBlbHNlICMgaWYgcGF0aCBpcyBmaWxlXG4gICAgICAgICAgICAgICAgaWYgbm90IGFyZ3MuZGlyc1xuICAgICAgICAgICAgICAgICAgICBzICs9IG5hbWVTdHJpbmcgbmFtZSwgZXh0XG4gICAgICAgICAgICAgICAgICAgIGlmIGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBleHRTdHJpbmcgbmFtZSwgZXh0XG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gbGlua1N0cmluZyBmaWxlXG4gICAgICAgICAgICAgICAgICAgIGZpbHMucHVzaCBzK3Jlc2V0XG4gICAgICAgICAgICAgICAgICAgIGFscGgucHVzaCBzK3Jlc2V0IGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgICAgICAgICAgICAgIGZzdHMucHVzaCBzdGF0XG4gICAgICAgICAgICAgICAgICAgIGV4dHMucHVzaCBleHRcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubnVtX2ZpbGVzICs9IDFcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9maWxlcyArPSAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHN0YXQuaXNGaWxlKClcbiAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZmlsZXMgKz0gMVxuICAgICAgICAgICAgZWxzZSBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZGlycyArPSAxXG5cbiAgICBpZiBhcmdzLnNpemUgb3IgYXJncy5raW5kIG9yIGFyZ3MudGltZVxuICAgICAgICBpZiBkaXJzLmxlbmd0aCBhbmQgbm90IGFyZ3MuZmlsZXNcbiAgICAgICAgICAgIGRpcnMgPSBzb3J0IGRpcnMsIGRzdHNcbiAgICAgICAgaWYgZmlscy5sZW5ndGhcbiAgICAgICAgICAgIGZpbHMgPSBzb3J0IGZpbHMsIGZzdHMsIGV4dHNcblxuICAgIGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgIGxvZyBwIGZvciBwIGluIGFscGhcbiAgICBlbHNlXG4gICAgICAgIGxvZyBkIGZvciBkIGluIGRpcnNcbiAgICAgICAgbG9nIGYgZm9yIGYgaW4gZmlsc1xuXG4jIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMFxuXG5saXN0RGlyID0gKHApIC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIGZpbHRlciBwXG4gICAgXG4gICAgcHMgPSBwXG5cbiAgICB0cnlcbiAgICAgICAgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhwKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICAgIG1zZyA9IGVycm9yLm1lc3NhZ2VcbiAgICAgICAgbXNnID0gXCJwZXJtaXNzaW9uIGRlbmllZFwiIGlmIF9zLnN0YXJ0c1dpdGgobXNnLCBcIkVBQ0NFU1wiKVxuICAgICAgICBsb2dfZXJyb3IgbXNnXG5cbiAgICBpZiBhcmdzLmZpbmRcbiAgICAgICAgZmlsZXMgPSBmaWxlcy5maWx0ZXIgKGYpIC0+XG4gICAgICAgICAgICBmIGlmIFJlZ0V4cChhcmdzLmZpbmQpLnRlc3QgZlxuICAgICAgICAgICAgXG4gICAgaWYgYXJncy5maW5kIGFuZCBub3QgZmlsZXMubGVuZ3RoXG4gICAgICAgIHRydWVcbiAgICBlbHNlIGlmIGFyZ3MucGF0aHMubGVuZ3RoID09IDEgYW5kIGFyZ3MucGF0aHNbMF0gPT0gJy4nIGFuZCBub3QgYXJncy5yZWN1cnNlXG4gICAgICAgIGxvZyByZXNldFxuICAgIGVsc2VcbiAgICAgICAgcyA9IGNvbG9yc1snX2Fycm93J10gKyBcIuKWulwiICsgY29sb3JzWydfaGVhZGVyJ11bMF0gKyBcIiBcIlxuICAgICAgICBwcyA9IHNsYXNoLnJlc29sdmUocHMpIGlmIHBzWzBdICE9ICd+J1xuICAgICAgICBpZiBfcy5zdGFydHNXaXRoKHBzLCBwcm9jZXNzLmVudi5QV0QpXG4gICAgICAgICAgICBwcyA9IFwiLi9cIiArIHBzLnN1YnN0cihwcm9jZXNzLmVudi5QV0QubGVuZ3RoKVxuICAgICAgICBlbHNlIGlmIF9zLnN0YXJ0c1dpdGgocCwgcHJvY2Vzcy5lbnYuSE9NRSlcbiAgICAgICAgICAgIHBzID0gXCJ+XCIgKyBwLnN1YnN0cihwcm9jZXNzLmVudi5IT01FLmxlbmd0aClcblxuICAgICAgICBpZiBwcyA9PSAnLydcbiAgICAgICAgICAgIHMgKz0gJy8nXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNwID0gcHMuc3BsaXQoJy8nKVxuICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVswXSArIHNwLnNoaWZ0KClcbiAgICAgICAgICAgIHdoaWxlIHNwLmxlbmd0aFxuICAgICAgICAgICAgICAgIHBuID0gc3Auc2hpZnQoKVxuICAgICAgICAgICAgICAgIGlmIHBuXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gY29sb3JzWydfaGVhZGVyJ11bMV0gKyAnLydcbiAgICAgICAgICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVtzcC5sZW5ndGggPT0gMCBhbmQgMiBvciAwXSArIHBuXG4gICAgICAgIGxvZyByZXNldFxuICAgICAgICBsb2cgcyArIFwiIFwiICsgcmVzZXRcbiAgICAgICAgbG9nIHJlc2V0XG5cbiAgICBpZiBmaWxlcy5sZW5ndGhcbiAgICAgICAgbGlzdEZpbGVzKHAsIGZpbGVzKVxuXG4gICAgaWYgYXJncy5yZWN1cnNlXG4gICAgICAgIGZvciBwciBpbiBmcy5yZWFkZGlyU3luYyhwKS5maWx0ZXIoIChmKSAtPiBmcy5sc3RhdFN5bmMoc2xhc2guam9pbihwLGYpKS5pc0RpcmVjdG9yeSgpIClcbiAgICAgICAgICAgIGxpc3REaXIoc2xhc2gucmVzb2x2ZShzbGFzaC5qb2luKHAsIHByKSkpXG5cbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuXG5wYXRoc3RhdHMgPSBhcmdzLnBhdGhzLm1hcCAoZikgLT5cbiAgICB0cnlcbiAgICAgICAgW2YsIGZzLnN0YXRTeW5jKGYpXVxuICAgIGNhdGNoIGVycm9yXG4gICAgICAgIGxvZ19lcnJvciAnbm8gc3VjaCBmaWxlOiAnLCBmXG4gICAgICAgIFtdXG5cbmZpbGVzdGF0cyA9IHBhdGhzdGF0cy5maWx0ZXIoIChmKSAtPiBmLmxlbmd0aCBhbmQgbm90IGZbMV0uaXNEaXJlY3RvcnkoKSApXG5pZiBmaWxlc3RhdHMubGVuZ3RoID4gMFxuICAgIGxvZyByZXNldFxuICAgIGxpc3RGaWxlcyBwcm9jZXNzLmN3ZCgpLCBmaWxlc3RhdHMubWFwKCAocykgLT4gc1swXSApXG5cbmZvciBwIGluIHBhdGhzdGF0cy5maWx0ZXIoIChmKSAtPiBmLmxlbmd0aCBhbmQgZlsxXS5pc0RpcmVjdG9yeSgpIClcbiAgICBsaXN0RGlyIHBbMF1cblxubG9nIFwiXCJcbmlmIGFyZ3MuaW5mb1xuICAgIHNwcmludGYgPSByZXF1aXJlKFwic3ByaW50Zi1qc1wiKS5zcHJpbnRmXG4gICAgbG9nIEJXKDEpICsgXCIgXCIgK1xuICAgIGZ3KDgpICsgc3RhdHMubnVtX2RpcnMgKyAoc3RhdHMuaGlkZGVuX2RpcnMgYW5kIGZ3KDQpICsgXCIrXCIgKyBmdyg1KSArIChzdGF0cy5oaWRkZW5fZGlycykgb3IgXCJcIikgKyBmdyg0KSArIFwiIGRpcnMgXCIgK1xuICAgIGZ3KDgpICsgc3RhdHMubnVtX2ZpbGVzICsgKHN0YXRzLmhpZGRlbl9maWxlcyBhbmQgZncoNCkgKyBcIitcIiArIGZ3KDUpICsgKHN0YXRzLmhpZGRlbl9maWxlcykgb3IgXCJcIikgKyBmdyg0KSArIFwiIGZpbGVzIFwiICtcbiAgICBmdyg4KSArIGtzdHIudGltZShwcm9jZXNzLmhydGltZS5iaWdpbnQoKS1zdGFydFRpbWUpICsgXCIgXCIgK1xuICAgIHJlc2V0XG4iXX0=
//# sourceURL=../coffee/color-ls.coffee