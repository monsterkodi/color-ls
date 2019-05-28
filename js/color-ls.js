// koffee 0.50.0

/*
 0000000   0000000   000       0000000   00000000           000       0000000
000       000   000  000      000   000  000   000          000      000
000       000   000  000      000   000  0000000    000000  000      0000000
000       000   000  000      000   000  000   000          000           000
 0000000   0000000   0000000   0000000   000   000          0000000  0000000
 */
var BG, BW, _, _s, ansi, args, bold, childp, colors, dirString, dotString, extString, fg, filestats, filter, fs, fw, groupMap, groupName, groupname, j, karg, kstr, len, linkString, listDir, listFiles, log_error, moment, nameString, ownerName, ownerString, p, pathstats, ref, ref1, ref2, reset, rightsString, rwxString, sizeString, slash, sort, sprintf, startTime, stats, timeString, token, userMap, username, util,
    indexOf = [].indexOf;

ref = require('kxk'), childp = ref.childp, slash = ref.slash, karg = ref.karg, kstr = ref.kstr, fs = ref.fs, _ = ref._;

ansi = require('ansi-256-colors');

util = require('util');

_s = require('underscore.string');

moment = require('moment');

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

args = karg("color-ls\n    paths         . ? the file(s) and/or folder(s) to display . **\n    bytes         . ? include size                    . = false\n    mdate         . ? include modification date       . = false\n    long          . ? include size and date           . = false\n    owner         . ? include owner and group         . = false\n    rights        . ? include rights                  . = false\n    all           . ? show dot files                  . = false\n    dirs          . ? show only dirs                  . = false\n    files         . ? show only files                 . = false\n    size          . ? sort by size                    . = false\n    time          . ? sort by time                    . = false\n    kind          . ? sort by kind                    . = false\n    pretty        . ? pretty size and date            . = true\n    stats         . ? show statistics                 . = false . - i\n    recurse       . ? recurse into subdirs            . = false . - R\n    find          . ? filter with a regexp                      . - F\n    alphabetical  . ! don't group dirs before files   . = false . - A\n\nversion      " + (require(__dirname + "/../package.json").version));

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
    '_dir': [bold + BG(0, 0, 2) + fw(23), fg(1, 1, 5), fg(2, 2, 5)],
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
    return " " + colors[(colors[ext] != null) && ext || '_default'][0] + name + reset;
};

dotString = function(ext) {
    return colors[(colors[ext] != null) && ext || '_default'][1] + "." + reset;
};

extString = function(ext) {
    return dotString(ext) + colors[(colors[ext] != null) && ext || '_default'][2] + ext + reset;
};

dirString = function(name, ext) {
    var c;
    c = name && '_dir' || '_.dir';
    return colors[c][0] + (name && (" " + name) || "") + (ext ? colors[c][1] + '.' + colors[c][2] + ext : "") + " ";
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
                        s += extString(ext);
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

if (args.stats) {
    sprintf = require("sprintf-js").sprintf;
    console.log(BW(1) + " " + fw(8) + stats.num_dirs + (stats.hidden_dirs && fw(4) + "+" + fw(5) + stats.hidden_dirs || "") + fw(4) + " dirs " + fw(8) + stats.num_files + (stats.hidden_files && fw(4) + "+" + fw(5) + stats.hidden_files || "") + fw(4) + " files " + fw(8) + kstr.time(process.hrtime.bigint() - startTime) + " " + reset);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHlaQUFBO0lBQUE7O0FBUUEsTUFBdUMsT0FBQSxDQUFRLEtBQVIsQ0FBdkMsRUFBRSxtQkFBRixFQUFVLGlCQUFWLEVBQWlCLGVBQWpCLEVBQXVCLGVBQXZCLEVBQTZCLFdBQTdCLEVBQWlDOztBQUVqQyxJQUFBLEdBQVMsT0FBQSxDQUFRLGlCQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxFQUFBLEdBQVMsT0FBQSxDQUFRLG1CQUFSOztBQUNULE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFRVCxTQUFBLEdBQVksT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFmLENBQUE7O0FBQ1osS0FBQSxHQUFROztBQUdSLElBQUEsR0FBUzs7QUFDVCxLQUFBLEdBQVMsSUFBSSxDQUFDOztBQUNkLEVBQUEsR0FBUyxJQUFJLENBQUMsRUFBRSxDQUFDOztBQUNqQixFQUFBLEdBQVMsSUFBSSxDQUFDLEVBQUUsQ0FBQzs7QUFDakIsRUFBQSxHQUFTLFNBQUMsQ0FBRDtXQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBVSxDQUFBLENBQUE7QUFBekI7O0FBQ1QsRUFBQSxHQUFTLFNBQUMsQ0FBRDtXQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBVSxDQUFBLENBQUE7QUFBekI7O0FBRVQsS0FBQSxHQUNJO0lBQUEsUUFBQSxFQUFnQixDQUFoQjtJQUNBLFNBQUEsRUFBZ0IsQ0FEaEI7SUFFQSxXQUFBLEVBQWdCLENBRmhCO0lBR0EsWUFBQSxFQUFnQixDQUhoQjtJQUlBLGNBQUEsRUFBZ0IsQ0FKaEI7SUFLQSxjQUFBLEVBQWdCLENBTGhCO0lBTUEsV0FBQSxFQUFnQixFQU5oQjs7O0FBY0osSUFBQSxHQUFPLElBQUEsQ0FBSyxzb0NBQUEsR0FvQkUsQ0FBQyxPQUFBLENBQVcsU0FBRCxH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S0FBSyxDQUFDLFNBRlYsR0FFc0IsQ0FBQyxLQUFLLENBQUMsWUFBTixJQUF1QixFQUFBLENBQUcsQ0FBSCxDQUFBLEdBQVEsR0FBUixHQUFjLEVBQUEsQ0FBRyxDQUFILENBQWQsR0FBdUIsS0FBSyxDQUFDLFlBQXBELElBQXFFLEVBQXRFLENBRnRCLEdBRWtHLEVBQUEsQ0FBRyxDQUFILENBRmxHLEdBRTBHLFNBRjFHLEdBR0osRUFBQSxDQUFHLENBQUgsQ0FISSxHQUdJLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFmLENBQUEsQ0FBQSxHQUF3QixTQUFsQyxDQUhKLEdBR21ELEdBSG5ELEdBSUosS0FMdUMsRUFEM0MiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgICAgICAgIDAwMCAgICAgICAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgICAgICAgMDAwXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAwMDAwICAwMDAwMDAwXG4jIyNcblxueyBjaGlsZHAsIHNsYXNoLCBrYXJnLCBrc3RyLCBmcywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5hbnNpICAgPSByZXF1aXJlICdhbnNpLTI1Ni1jb2xvcnMnXG51dGlsICAgPSByZXF1aXJlICd1dGlsJ1xuX3MgICAgID0gcmVxdWlyZSAndW5kZXJzY29yZS5zdHJpbmcnXG5tb21lbnQgPSByZXF1aXJlICdtb21lbnQnXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG5cbnN0YXJ0VGltZSA9IHByb2Nlc3MuaHJ0aW1lLmJpZ2ludCgpXG50b2tlbiA9IHt9XG5cbiMgY29sb3JzXG5ib2xkICAgPSAnXFx4MWJbMW0nXG5yZXNldCAgPSBhbnNpLnJlc2V0XG5mZyAgICAgPSBhbnNpLmZnLmdldFJnYlxuQkcgICAgID0gYW5zaS5iZy5nZXRSZ2JcbmZ3ICAgICA9IChpKSAtPiBhbnNpLmZnLmdyYXlzY2FsZVtpXVxuQlcgICAgID0gKGkpIC0+IGFuc2kuYmcuZ3JheXNjYWxlW2ldXG5cbnN0YXRzID0gIyBjb3VudGVycyBmb3IgKGhpZGRlbikgZGlycy9maWxlc1xuICAgIG51bV9kaXJzOiAgICAgICAwXG4gICAgbnVtX2ZpbGVzOiAgICAgIDBcbiAgICBoaWRkZW5fZGlyczogICAgMFxuICAgIGhpZGRlbl9maWxlczogICAwXG4gICAgbWF4T3duZXJMZW5ndGg6IDBcbiAgICBtYXhHcm91cExlbmd0aDogMFxuICAgIGJyb2tlbkxpbmtzOiAgICBbXVxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAwMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcblxuYXJncyA9IGthcmcgXCJcIlwiXG5jb2xvci1sc1xuICAgIHBhdGhzICAgICAgICAgLiA/IHRoZSBmaWxlKHMpIGFuZC9vciBmb2xkZXIocykgdG8gZGlzcGxheSAuICoqXG4gICAgYnl0ZXMgICAgICAgICAuID8gaW5jbHVkZSBzaXplICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICBtZGF0ZSAgICAgICAgIC4gPyBpbmNsdWRlIG1vZGlmaWNhdGlvbiBkYXRlICAgICAgIC4gPSBmYWxzZVxuICAgIGxvbmcgICAgICAgICAgLiA/IGluY2x1ZGUgc2l6ZSBhbmQgZGF0ZSAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgb3duZXIgICAgICAgICAuID8gaW5jbHVkZSBvd25lciBhbmQgZ3JvdXAgICAgICAgICAuID0gZmFsc2VcbiAgICByaWdodHMgICAgICAgIC4gPyBpbmNsdWRlIHJpZ2h0cyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIGFsbCAgICAgICAgICAgLiA/IHNob3cgZG90IGZpbGVzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgZGlycyAgICAgICAgICAuID8gc2hvdyBvbmx5IGRpcnMgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICBmaWxlcyAgICAgICAgIC4gPyBzaG93IG9ubHkgZmlsZXMgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIHNpemUgICAgICAgICAgLiA/IHNvcnQgYnkgc2l6ZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgdGltZSAgICAgICAgICAuID8gc29ydCBieSB0aW1lICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICBraW5kICAgICAgICAgIC4gPyBzb3J0IGJ5IGtpbmQgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIHByZXR0eSAgICAgICAgLiA/IHByZXR0eSBzaXplIGFuZCBkYXRlICAgICAgICAgICAgLiA9IHRydWVcbiAgICBzdGF0cyAgICAgICAgIC4gPyBzaG93IHN0YXRpc3RpY3MgICAgICAgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gaVxuICAgIHJlY3Vyc2UgICAgICAgLiA/IHJlY3Vyc2UgaW50byBzdWJkaXJzICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBSXG4gICAgZmluZCAgICAgICAgICAuID8gZmlsdGVyIHdpdGggYSByZWdleHAgICAgICAgICAgICAgICAgICAgICAgLiAtIEZcbiAgICBhbHBoYWJldGljYWwgIC4gISBkb24ndCBncm91cCBkaXJzIGJlZm9yZSBmaWxlcyAgIC4gPSBmYWxzZSAuIC0gQVxuXG52ZXJzaW9uICAgICAgI3tyZXF1aXJlKFwiI3tfX2Rpcm5hbWV9Ly4uL3BhY2thZ2UuanNvblwiKS52ZXJzaW9ufVxuXCJcIlwiXG5cbmlmIGFyZ3Muc2l6ZVxuICAgIGFyZ3MuZmlsZXMgPSB0cnVlXG5cbmlmIGFyZ3MubG9uZ1xuICAgIGFyZ3MuYnl0ZXMgPSB0cnVlXG4gICAgYXJncy5tZGF0ZSA9IHRydWVcblxuYXJncy5wYXRocyA9IFsnLiddIHVubGVzcyBhcmdzLnBhdGhzPy5sZW5ndGggPiAwXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbmNvbG9ycyA9XG4gICAgJ2NvZmZlZSc6ICAgWyBib2xkK2ZnKDQsNCwwKSwgIGZnKDEsMSwwKSwgZmcoMSwxLDApIF1cbiAgICAna29mZmVlJzogICBbIGJvbGQrZmcoNSw1LDApLCAgZmcoMSwwLDApLCBmZygxLDAsMCkgXVxuICAgICdweSc6ICAgICAgIFsgYm9sZCtmZygwLDIsMCksICBmZygwLDEsMCksIGZnKDAsMSwwKSBdXG4gICAgJ3JiJzogICAgICAgWyBib2xkK2ZnKDQsMCwwKSwgIGZnKDEsMCwwKSwgZmcoMSwwLDApIF1cbiAgICAnanNvbic6ICAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygxLDAsMSkgXVxuICAgICdjc29uJzogICAgIFsgYm9sZCtmZyg0LDAsNCksICBmZygxLDAsMSksIGZnKDEsMCwxKSBdXG4gICAgJ25vb24nOiAgICAgWyBib2xkK2ZnKDQsNCwwKSwgIGZnKDEsMSwwKSwgZmcoMSwxLDApIF1cbiAgICAncGxpc3QnOiAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygxLDAsMSkgXVxuICAgICdqcyc6ICAgICAgIFsgYm9sZCtmZyg1LDAsNSksICBmZygxLDAsMSksIGZnKDEsMCwxKSBdXG4gICAgJ2NwcCc6ICAgICAgWyBib2xkK2ZnKDUsNCwwKSwgIGZ3KDEpLCAgICAgZmcoMSwxLDApIF1cbiAgICAnaCc6ICAgICAgICBbICAgICAgZmcoMywxLDApLCAgZncoMSksICAgICBmZygxLDEsMCkgXVxuICAgICdweWMnOiAgICAgIFsgICAgICBmdyg1KSwgICAgICBmdygxKSwgICAgIGZ3KDEpIF1cbiAgICAnbG9nJzogICAgICBbICAgICAgZncoNSksICAgICAgZncoMSksICAgICBmdygxKSBdXG4gICAgJ2xvZyc6ICAgICAgWyAgICAgIGZ3KDUpLCAgICAgIGZ3KDEpLCAgICAgZncoMSkgXVxuICAgICd0eHQnOiAgICAgIFsgICAgICBmdygyMCksICAgICBmdygxKSwgICAgIGZ3KDIpIF1cbiAgICAnbWQnOiAgICAgICBbIGJvbGQrZncoMjApLCAgICAgZncoMSksICAgICBmdygyKSBdXG4gICAgJ21hcmtkb3duJzogWyBib2xkK2Z3KDIwKSwgICAgIGZ3KDEpLCAgICAgZncoMikgXVxuICAgICdzaCc6ICAgICAgIFsgYm9sZCtmZyg1LDEsMCksICBmZygxLDAsMCksIGZnKDEsMCwwKSBdXG4gICAgJ3BuZyc6ICAgICAgWyBib2xkK2ZnKDUsMCwwKSwgIGZnKDEsMCwwKSwgZmcoMSwwLDApIF1cbiAgICAnanBnJzogICAgICBbIGJvbGQrZmcoMCwzLDApLCAgZmcoMCwxLDApLCBmZygwLDEsMCkgXVxuICAgICdweG0nOiAgICAgIFsgYm9sZCtmZygxLDEsNSksICBmZygwLDAsMSksIGZnKDAsMCwyKSBdXG4gICAgJ3RpZmYnOiAgICAgWyBib2xkK2ZnKDEsMSw1KSwgIGZnKDAsMCwxKSwgZmcoMCwwLDIpIF1cblxuICAgICdfZGVmYXVsdCc6IFsgICAgICBmdygxNSksICAgICBmdygxKSwgICAgIGZ3KDYpIF1cbiAgICAnX2Rpcic6ICAgICBbIGJvbGQrQkcoMCwwLDIpK2Z3KDIzKSwgZmcoMSwxLDUpLCBmZygyLDIsNSkgXVxuICAgICdfLmRpcic6ICAgIFsgYm9sZCtCRygwLDAsMSkrZncoMjMpLCBib2xkK0JHKDAsMCwxKStmZygxLDEsNSksIGJvbGQrQkcoMCwwLDEpK2ZnKDIsMiw1KSBdXG4gICAgJ19saW5rJzogICAgeyAnYXJyb3cnOiBmZygxLDAsMSksICdwYXRoJzogZmcoNCwwLDQpLCAnYnJva2VuJzogQkcoNSwwLDApK2ZnKDUsNSwwKSB9XG4gICAgJ19hcnJvdyc6ICAgICBmdygxKVxuICAgICdfaGVhZGVyJzogIFsgYm9sZCtCVygyKStmZygzLDIsMCksICBmdyg0KSwgYm9sZCtCVygyKStmZyg1LDUsMCkgXVxuICAgICdfc2l6ZSc6ICAgIHsgYjogW2ZnKDAsMCwzKV0sIGtCOiBbZmcoMCwwLDUpLCBmZygwLDAsMyldLCBNQjogW2ZnKDEsMSw1KSwgZmcoMCwwLDUpXSwgR0I6IFtmZyg0LDQsNSksIGZnKDIsMiw1KV0sIFRCOiBbZmcoNCw0LDUpLCBmZygyLDIsNSldIH1cbiAgICAnX3VzZXJzJzogICB7IHJvb3Q6ICBmZygzLDAsMCksIGRlZmF1bHQ6IGZnKDEsMCwxKSB9XG4gICAgJ19ncm91cHMnOiAgeyB3aGVlbDogZmcoMSwwLDApLCBzdGFmZjogZmcoMCwxLDApLCBhZG1pbjogZmcoMSwxLDApLCBkZWZhdWx0OiBmZygxLDAsMSkgfVxuICAgICdfZXJyb3InOiAgIFsgYm9sZCtCRyg1LDAsMCkrZmcoNSw1LDApLCBib2xkK0JHKDUsMCwwKStmZyg1LDUsNSkgXVxuICAgICdfcmlnaHRzJzpcbiAgICAgICAgICAgICAgICAgICdyKyc6IGJvbGQrQlcoMSkrZmcoMSwxLDEpXG4gICAgICAgICAgICAgICAgICAnci0nOiByZXNldCtCVygxKVxuICAgICAgICAgICAgICAgICAgJ3crJzogYm9sZCtCVygxKStmZygyLDIsNSlcbiAgICAgICAgICAgICAgICAgICd3LSc6IHJlc2V0K0JXKDEpXG4gICAgICAgICAgICAgICAgICAneCsnOiBib2xkK0JXKDEpK2ZnKDUsMCwwKVxuICAgICAgICAgICAgICAgICAgJ3gtJzogcmVzZXQrQlcoMSlcblxudXNlck1hcCA9IHt9XG51c2VybmFtZSA9ICh1aWQpIC0+XG4gICAgaWYgbm90IHVzZXJNYXBbdWlkXVxuICAgICAgICB0cnlcbiAgICAgICAgICAgIHVzZXJNYXBbdWlkXSA9IGNoaWxkcC5zcGF3blN5bmMoXCJpZFwiLCBbXCItdW5cIiwgXCIje3VpZH1cIl0pLnN0ZG91dC50b1N0cmluZygndXRmOCcpLnRyaW0oKVxuICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICBsb2cgZVxuICAgIHVzZXJNYXBbdWlkXVxuXG5ncm91cE1hcCA9IG51bGxcbmdyb3VwbmFtZSA9IChnaWQpIC0+XG4gICAgaWYgbm90IGdyb3VwTWFwXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgZ2lkcyA9IGNoaWxkcC5zcGF3blN5bmMoXCJpZFwiLCBbXCItR1wiXSkuc3Rkb3V0LnRvU3RyaW5nKCd1dGY4Jykuc3BsaXQoJyAnKVxuICAgICAgICAgICAgZ25tcyA9IGNoaWxkcC5zcGF3blN5bmMoXCJpZFwiLCBbXCItR25cIl0pLnN0ZG91dC50b1N0cmluZygndXRmOCcpLnNwbGl0KCcgJylcbiAgICAgICAgICAgIGdyb3VwTWFwID0ge31cbiAgICAgICAgICAgIGZvciBpIGluIFswLi4uZ2lkcy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgZ3JvdXBNYXBbZ2lkc1tpXV0gPSBnbm1zW2ldXG4gICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgIGxvZyBlXG4gICAgZ3JvdXBNYXBbZ2lkXVxuXG5pZiBfLmlzRnVuY3Rpb24gcHJvY2Vzcy5nZXR1aWRcbiAgICBjb2xvcnNbJ191c2VycyddW3VzZXJuYW1lKHByb2Nlc3MuZ2V0dWlkKCkpXSA9IGZnKDAsNCwwKVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbmxvZ19lcnJvciA9ICgpIC0+XG4gICAgbG9nIFwiIFwiICsgY29sb3JzWydfZXJyb3InXVswXSArIFwiIFwiICsgYm9sZCArIGFyZ3VtZW50c1swXSArIChhcmd1bWVudHMubGVuZ3RoID4gMSBhbmQgKGNvbG9yc1snX2Vycm9yJ11bMV0gKyBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykuc2xpY2UoMSkuam9pbignICcpKSBvciAnJykgKyBcIiBcIiArIHJlc2V0XG5cbmxpbmtTdHJpbmcgPSAoZmlsZSkgLT4gXG4gICAgcyAgPSByZXNldCArIGZ3KDEpICsgY29sb3JzWydfbGluayddWydhcnJvdyddICsgXCIg4pa6IFwiIFxuICAgIHMgKz0gY29sb3JzWydfbGluayddWyhmaWxlIGluIHN0YXRzLmJyb2tlbkxpbmtzKSBhbmQgJ2Jyb2tlbicgb3IgJ3BhdGgnXSBcbiAgICB0cnlcbiAgICAgICAgcyArPSBzbGFzaC5wYXRoIGZzLnJlYWRsaW5rU3luYyhmaWxlKVxuICAgIGNhdGNoIGVyclxuICAgICAgICBzICs9ICcgPyAnXG4gICAgc1xuXG5uYW1lU3RyaW5nID0gKG5hbWUsIGV4dCkgLT4gXCIgXCIgKyBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMF0gKyBuYW1lICsgcmVzZXRcbmRvdFN0cmluZyAgPSAoICAgICAgZXh0KSAtPiBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMV0gKyBcIi5cIiArIHJlc2V0XG5leHRTdHJpbmcgID0gKCAgICAgIGV4dCkgLT4gZG90U3RyaW5nKGV4dCkgKyBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMl0gKyBleHQgKyByZXNldFxuZGlyU3RyaW5nICA9IChuYW1lLCBleHQpIC0+XG4gICAgYyA9IG5hbWUgYW5kICdfZGlyJyBvciAnXy5kaXInXG4gICAgY29sb3JzW2NdWzBdICsgKG5hbWUgYW5kIChcIiBcIiArIG5hbWUpIG9yIFwiXCIpICsgKGlmIGV4dCB0aGVuIGNvbG9yc1tjXVsxXSArICcuJyArIGNvbG9yc1tjXVsyXSArIGV4dCBlbHNlIFwiXCIpICsgXCIgXCJcblxuc2l6ZVN0cmluZyA9IChzdGF0KSAtPlxuICAgIGlmIGFyZ3MucHJldHR5IGFuZCBzdGF0LnNpemUgPT0gMFxuICAgICAgICByZXR1cm4gX3MubHBhZCgnICcsIDExKVxuICAgIGlmIHN0YXQuc2l6ZSA8IDEwMDBcbiAgICAgICAgY29sb3JzWydfc2l6ZSddWydiJ11bMF0gKyBfcy5scGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlIGlmIHN0YXQuc2l6ZSA8IDEwMDAwMDBcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsna0InXVswXSArIF9zLmxwYWQoKHN0YXQuc2l6ZSAvIDEwMDApLnRvRml4ZWQoMCksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ2tCJ11bMV0gKyBcImtCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsna0InXVswXSArIF9zLmxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2UgaWYgc3RhdC5zaXplIDwgMTAwMDAwMDAwMFxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydNQiddWzBdICsgX3MubHBhZCgoc3RhdC5zaXplIC8gMTAwMDAwMCkudG9GaXhlZCgxKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsnTUInXVsxXSArIFwiTUIgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydNQiddWzBdICsgX3MubHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZSBpZiBzdGF0LnNpemUgPCAxMDAwMDAwMDAwMDAwXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMF0gKyBfcy5scGFkKChzdGF0LnNpemUgLyAxMDAwMDAwMDAwKS50b0ZpeGVkKDEpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydHQiddWzFdICsgXCJHQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMF0gKyBfcy5scGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMF0gKyBfcy5scGFkKChzdGF0LnNpemUgLyAxMDAwMDAwMDAwMDAwKS50b0ZpeGVkKDMpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydUQiddWzFdICsgXCJUQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMF0gKyBfcy5scGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcblxudGltZVN0cmluZyA9IChzdGF0KSAtPlxuICAgIHQgPSBtb21lbnQoc3RhdC5tdGltZSlcbiAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICBhZ2UgPSBtb21lbnQoKS50byh0LCB0cnVlKVxuICAgICAgICBbbnVtLCByYW5nZV0gPSBhZ2Uuc3BsaXQgJyAnXG4gICAgICAgIG51bSA9ICcxJyBpZiBudW0gPT0gJ2EnXG4gICAgICAgIGlmIHJhbmdlID09ICdmZXcnXG4gICAgICAgICAgICBudW0gPSBtb21lbnQoKS5kaWZmIHQsICdzZWNvbmRzJ1xuICAgICAgICAgICAgcmFuZ2UgPSAnc2Vjb25kcydcbiAgICAgICAgICAgIGZ3KDIzKSArIF9zLmxwYWQobnVtLCAyKSArICcgJyArIGZ3KDE2KSArIF9zLnJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2UgaWYgcmFuZ2Uuc3RhcnRzV2l0aCAneWVhcidcbiAgICAgICAgICAgIGZ3KDYpICsgX3MubHBhZChudW0sIDIpICsgJyAnICsgZncoMykgKyBfcy5ycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ21vbnRoJ1xuICAgICAgICAgICAgZncoOCkgKyBfcy5scGFkKG51bSwgMikgKyAnICcgKyBmdyg0KSArIF9zLnJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2UgaWYgcmFuZ2Uuc3RhcnRzV2l0aCAnZGF5J1xuICAgICAgICAgICAgZncoMTApICsgX3MubHBhZChudW0sIDIpICsgJyAnICsgZncoNikgKyBfcy5ycGFkKHJhbmdlLCA3KSArICcgJ1xuICAgICAgICBlbHNlIGlmIHJhbmdlLnN0YXJ0c1dpdGggJ2hvdXInXG4gICAgICAgICAgICBmdygxNSkgKyBfcy5scGFkKG51bSwgMikgKyAnICcgKyBmdyg4KSArIF9zLnJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZ3KDE4KSArIF9zLmxwYWQobnVtLCAyKSArICcgJyArIGZ3KDEyKSArIF9zLnJwYWQocmFuZ2UsIDcpICsgJyAnXG4gICAgZWxzZVxuICAgICAgICBmdygxNikgKyBfcy5scGFkKHQuZm9ybWF0KFwiRERcIiksMikgKyBmdyg3KSsnLicgK1xuICAgICAgICBmdygxMikgKyB0LmZvcm1hdChcIk1NXCIpICsgZncoNykrXCIuXCIgK1xuICAgICAgICBmdyggOCkgKyB0LmZvcm1hdChcIllZXCIpICsgJyAnICtcbiAgICAgICAgZncoMTYpICsgdC5mb3JtYXQoXCJISFwiKSArIGNvbCA9IGZ3KDcpKyc6JyArXG4gICAgICAgIGZ3KDE0KSArIHQuZm9ybWF0KFwibW1cIikgKyBjb2wgPSBmdygxKSsnOicgK1xuICAgICAgICBmdyggNCkgKyB0LmZvcm1hdChcInNzXCIpICsgJyAnXG5cbm93bmVyTmFtZSA9IChzdGF0KSAtPlxuICAgIHRyeVxuICAgICAgICB1c2VybmFtZSBzdGF0LnVpZFxuICAgIGNhdGNoXG4gICAgICAgIHN0YXQudWlkXG5cbmdyb3VwTmFtZSA9IChzdGF0KSAtPlxuICAgIHRyeVxuICAgICAgICBncm91cG5hbWUgc3RhdC5naWRcbiAgICBjYXRjaFxuICAgICAgICBzdGF0LmdpZFxuXG5vd25lclN0cmluZyA9IChzdGF0KSAtPlxuICAgIG93biA9IG93bmVyTmFtZShzdGF0KVxuICAgIGdycCA9IGdyb3VwTmFtZShzdGF0KVxuICAgIG9jbCA9IGNvbG9yc1snX3VzZXJzJ11bb3duXVxuICAgIG9jbCA9IGNvbG9yc1snX3VzZXJzJ11bJ2RlZmF1bHQnXSB1bmxlc3Mgb2NsXG4gICAgZ2NsID0gY29sb3JzWydfZ3JvdXBzJ11bZ3JwXVxuICAgIGdjbCA9IGNvbG9yc1snX2dyb3VwcyddWydkZWZhdWx0J10gdW5sZXNzIGdjbFxuICAgIG9jbCArIF9zLnJwYWQob3duLCBzdGF0cy5tYXhPd25lckxlbmd0aCkgKyBcIiBcIiArIGdjbCArIF9zLnJwYWQoZ3JwLCBzdGF0cy5tYXhHcm91cExlbmd0aClcblxucnd4U3RyaW5nID0gKG1vZGUsIGkpIC0+XG4gICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjEwMCkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWydyKyddICsgJyByJyBvciBjb2xvcnNbJ19yaWdodHMnXVsnci0nXSArICcgICcpICtcbiAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDEwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3crJ10gKyAnIHcnIG9yIGNvbG9yc1snX3JpZ2h0cyddWyd3LSddICsgJyAgJykgK1xuICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIwMDEpIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsneCsnXSArICcgeCcgb3IgY29sb3JzWydfcmlnaHRzJ11bJ3gtJ10gKyAnICAnKVxuXG5yaWdodHNTdHJpbmcgPSAoc3RhdCkgLT5cbiAgICB1ciA9IHJ3eFN0cmluZyhzdGF0Lm1vZGUsIDIpICsgXCIgXCJcbiAgICBnciA9IHJ3eFN0cmluZyhzdGF0Lm1vZGUsIDEpICsgXCIgXCJcbiAgICBybyA9IHJ3eFN0cmluZyhzdGF0Lm1vZGUsIDApICsgXCIgXCJcbiAgICB1ciArIGdyICsgcm8gKyByZXNldFxuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwXG4jICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbnNvcnQgPSAobGlzdCwgc3RhdHMsIGV4dHM9W10pIC0+XG4gICAgbCA9IF8uemlwIGxpc3QsIHN0YXRzLCBbMC4uLmxpc3QubGVuZ3RoXSwgKGV4dHMubGVuZ3RoID4gMCBhbmQgZXh0cyBvciBbMC4uLmxpc3QubGVuZ3RoXSlcbiAgICBpZiBhcmdzLmtpbmRcbiAgICAgICAgaWYgZXh0cyA9PSBbXSB0aGVuIHJldHVybiBsaXN0XG4gICAgICAgIGwuc29ydCgoYSxiKSAtPlxuICAgICAgICAgICAgaWYgYVszXSA+IGJbM10gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgaWYgYVszXSA8IGJbM10gdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3MudGltZVxuICAgICAgICAgICAgICAgIG0gPSBtb21lbnQoYVsxXS5tdGltZSlcbiAgICAgICAgICAgICAgICBpZiBtLmlzQWZ0ZXIoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgICAgIGlmIG0uaXNCZWZvcmUoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3Muc2l6ZVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA+IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICBlbHNlIGlmIGFyZ3MudGltZVxuICAgICAgICBsLnNvcnQoKGEsYikgLT5cbiAgICAgICAgICAgIG0gPSBtb21lbnQoYVsxXS5tdGltZSlcbiAgICAgICAgICAgIGlmIG0uaXNBZnRlcihiWzFdLm10aW1lKSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICBpZiBtLmlzQmVmb3JlKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhcmdzLnNpemVcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPiBiWzFdLnNpemUgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA8IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYVsyXSA+IGJbMl0gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgLTEpXG4gICAgZWxzZSBpZiBhcmdzLnNpemVcbiAgICAgICAgbC5zb3J0KChhLGIpIC0+XG4gICAgICAgICAgICBpZiBhWzFdLnNpemUgPiBiWzFdLnNpemUgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICBfLnVuemlwKGwpWzBdXG5cbmZpbHRlciA9IChwKSAtPlxuICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgIHJldHVybiB0cnVlIGlmIHBbMF0gPT0gJyQnXG4gICAgICAgIHJldHVybiB0cnVlIGlmIHAgPT0gJ2Rlc2t0b3AuaW5pJ1xuICAgICAgICByZXR1cm4gdHJ1ZSBpZiBwLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCAnbnR1c2VyJ1xuICAgIGZhbHNlXG4gICAgXG4jIDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwXG4jIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAgICAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMFxuXG5saXN0RmlsZXMgPSAocCwgZmlsZXMpIC0+XG4gICAgYWxwaCA9IFtdIGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgZGlycyA9IFtdICMgdmlzaWJsZSBkaXJzXG4gICAgZmlscyA9IFtdICMgdmlzaWJsZSBmaWxlc1xuICAgIGRzdHMgPSBbXSAjIGRpciBzdGF0c1xuICAgIGZzdHMgPSBbXSAjIGZpbGUgc3RhdHNcbiAgICBleHRzID0gW10gIyBmaWxlIGV4dGVuc2lvbnNcblxuICAgIGlmIGFyZ3Mub3duZXJcbiAgICAgICAgZmlsZXMuZm9yRWFjaCAocnApIC0+XG4gICAgICAgICAgICBpZiBzbGFzaC5pc0Fic29sdXRlIHJwXG4gICAgICAgICAgICAgICAgZmlsZSA9IHNsYXNoLnJlc29sdmUgcnBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmaWxlICA9IHNsYXNoLmpvaW4gcCwgcnBcbiAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIHN0YXQgPSBmcy5sc3RhdFN5bmMoZmlsZSlcbiAgICAgICAgICAgICAgICBvbCA9IG93bmVyTmFtZShzdGF0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICBnbCA9IGdyb3VwTmFtZShzdGF0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICBpZiBvbCA+IHN0YXRzLm1heE93bmVyTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm1heE93bmVyTGVuZ3RoID0gb2xcbiAgICAgICAgICAgICAgICBpZiBnbCA+IHN0YXRzLm1heEdyb3VwTGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm1heEdyb3VwTGVuZ3RoID0gZ2xcbiAgICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICBmaWxlcy5mb3JFYWNoIChycCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLmlzQWJzb2x1dGUgcnBcbiAgICAgICAgICAgIGZpbGUgID0gc2xhc2gucmVzb2x2ZSBycFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmaWxlICA9IHNsYXNoLnJlc29sdmUgc2xhc2guam9pbiBwLCBycFxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBmaWx0ZXIgcnBcbiAgICAgICAgXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgbHN0YXQgPSBmcy5sc3RhdFN5bmMgZmlsZVxuICAgICAgICAgICAgbGluayAgPSBsc3RhdC5pc1N5bWJvbGljTGluaygpXG4gICAgICAgICAgICBzdGF0ICA9IGxpbmsgYW5kIGZzLnN0YXRTeW5jKGZpbGUpIG9yIGxzdGF0XG4gICAgICAgIGNhdGNoXG4gICAgICAgICAgICBpZiBsaW5rXG4gICAgICAgICAgICAgICAgc3RhdCA9IGxzdGF0XG4gICAgICAgICAgICAgICAgc3RhdHMuYnJva2VuTGlua3MucHVzaCBmaWxlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbG9nX2Vycm9yIFwiY2FuJ3QgcmVhZCBmaWxlOiBcIiwgZmlsZSwgbGlua1xuICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGV4dCAgPSBzbGFzaC5leHRuYW1lKGZpbGUpLnN1YnN0cigxKVxuICAgICAgICBuYW1lID0gc2xhc2guYmFzZW5hbWUoZmlsZSwgc2xhc2guZXh0bmFtZSBmaWxlKVxuICAgICAgICBpZiBuYW1lWzBdID09ICcuJ1xuICAgICAgICAgICAgZXh0ID0gbmFtZS5zdWJzdHIoMSkgKyBzbGFzaC5leHRuYW1lIGZpbGVcbiAgICAgICAgICAgIG5hbWUgPSAnJ1xuICAgICAgICBpZiBuYW1lLmxlbmd0aCBhbmQgbmFtZVtuYW1lLmxlbmd0aC0xXSAhPSAnXFxyJyBvciBhcmdzLmFsbFxuICAgICAgICAgICAgcyA9IFwiIFwiXG4gICAgICAgICAgICBpZiBhcmdzLnJpZ2h0c1xuICAgICAgICAgICAgICAgIHMgKz0gcmlnaHRzU3RyaW5nIHN0YXRcbiAgICAgICAgICAgICAgICBzICs9IFwiIFwiXG4gICAgICAgICAgICBpZiBhcmdzLm93bmVyXG4gICAgICAgICAgICAgICAgcyArPSBvd25lclN0cmluZyBzdGF0XG4gICAgICAgICAgICAgICAgcyArPSBcIiBcIlxuICAgICAgICAgICAgaWYgYXJncy5ieXRlc1xuICAgICAgICAgICAgICAgIHMgKz0gc2l6ZVN0cmluZyBzdGF0XG4gICAgICAgICAgICBpZiBhcmdzLm1kYXRlXG4gICAgICAgICAgICAgICAgcyArPSB0aW1lU3RyaW5nIHN0YXRcbiAgICAgICAgICAgIGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICAgIGlmIG5vdCBhcmdzLmZpbGVzXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gZGlyU3RyaW5nIG5hbWUsIGV4dFxuICAgICAgICAgICAgICAgICAgICBpZiBsaW5rXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGxpbmtTdHJpbmcgZmlsZVxuICAgICAgICAgICAgICAgICAgICBkaXJzLnB1c2ggcytyZXNldFxuICAgICAgICAgICAgICAgICAgICBhbHBoLnB1c2ggcytyZXNldCBpZiBhcmdzLmFscGhhYmV0aWNhbFxuICAgICAgICAgICAgICAgICAgICBkc3RzLnB1c2ggc3RhdFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5udW1fZGlycyArPSAxXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZGlycyArPSAxXG4gICAgICAgICAgICBlbHNlICMgaWYgcGF0aCBpcyBmaWxlXG4gICAgICAgICAgICAgICAgaWYgbm90IGFyZ3MuZGlyc1xuICAgICAgICAgICAgICAgICAgICBzICs9IG5hbWVTdHJpbmcgbmFtZSwgZXh0XG4gICAgICAgICAgICAgICAgICAgIGlmIGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBleHRTdHJpbmcgZXh0XG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gbGlua1N0cmluZyBmaWxlXG4gICAgICAgICAgICAgICAgICAgIGZpbHMucHVzaCBzK3Jlc2V0XG4gICAgICAgICAgICAgICAgICAgIGFscGgucHVzaCBzK3Jlc2V0IGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgICAgICAgICAgICAgIGZzdHMucHVzaCBzdGF0XG4gICAgICAgICAgICAgICAgICAgIGV4dHMucHVzaCBleHRcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubnVtX2ZpbGVzICs9IDFcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9maWxlcyArPSAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHN0YXQuaXNGaWxlKClcbiAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZmlsZXMgKz0gMVxuICAgICAgICAgICAgZWxzZSBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZGlycyArPSAxXG5cbiAgICBpZiBhcmdzLnNpemUgb3IgYXJncy5raW5kIG9yIGFyZ3MudGltZVxuICAgICAgICBpZiBkaXJzLmxlbmd0aCBhbmQgbm90IGFyZ3MuZmlsZXNcbiAgICAgICAgICAgIGRpcnMgPSBzb3J0IGRpcnMsIGRzdHNcbiAgICAgICAgaWYgZmlscy5sZW5ndGhcbiAgICAgICAgICAgIGZpbHMgPSBzb3J0IGZpbHMsIGZzdHMsIGV4dHNcblxuICAgIGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgIGxvZyBwIGZvciBwIGluIGFscGhcbiAgICBlbHNlXG4gICAgICAgIGxvZyBkIGZvciBkIGluIGRpcnNcbiAgICAgICAgbG9nIGYgZm9yIGYgaW4gZmlsc1xuXG4jIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMCAgIDAwMFxuXG5saXN0RGlyID0gKHApIC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIGZpbHRlciBwXG4gICAgXG4gICAgcHMgPSBwXG5cbiAgICB0cnlcbiAgICAgICAgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhwKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICAgIG1zZyA9IGVycm9yLm1lc3NhZ2VcbiAgICAgICAgbXNnID0gXCJwZXJtaXNzaW9uIGRlbmllZFwiIGlmIF9zLnN0YXJ0c1dpdGgobXNnLCBcIkVBQ0NFU1wiKVxuICAgICAgICBsb2dfZXJyb3IgbXNnXG5cbiAgICBpZiBhcmdzLmZpbmRcbiAgICAgICAgZmlsZXMgPSBmaWxlcy5maWx0ZXIgKGYpIC0+XG4gICAgICAgICAgICBmIGlmIFJlZ0V4cChhcmdzLmZpbmQpLnRlc3QgZlxuICAgICAgICAgICAgXG4gICAgaWYgYXJncy5maW5kIGFuZCBub3QgZmlsZXMubGVuZ3RoXG4gICAgICAgIHRydWVcbiAgICBlbHNlIGlmIGFyZ3MucGF0aHMubGVuZ3RoID09IDEgYW5kIGFyZ3MucGF0aHNbMF0gPT0gJy4nIGFuZCBub3QgYXJncy5yZWN1cnNlXG4gICAgICAgIGxvZyByZXNldFxuICAgIGVsc2VcbiAgICAgICAgcyA9IGNvbG9yc1snX2Fycm93J10gKyBcIuKWulwiICsgY29sb3JzWydfaGVhZGVyJ11bMF0gKyBcIiBcIlxuICAgICAgICBwcyA9IHNsYXNoLnJlc29sdmUocHMpIGlmIHBzWzBdICE9ICd+J1xuICAgICAgICBpZiBfcy5zdGFydHNXaXRoKHBzLCBwcm9jZXNzLmVudi5QV0QpXG4gICAgICAgICAgICBwcyA9IFwiLi9cIiArIHBzLnN1YnN0cihwcm9jZXNzLmVudi5QV0QubGVuZ3RoKVxuICAgICAgICBlbHNlIGlmIF9zLnN0YXJ0c1dpdGgocCwgcHJvY2Vzcy5lbnYuSE9NRSlcbiAgICAgICAgICAgIHBzID0gXCJ+XCIgKyBwLnN1YnN0cihwcm9jZXNzLmVudi5IT01FLmxlbmd0aClcblxuICAgICAgICBpZiBwcyA9PSAnLydcbiAgICAgICAgICAgIHMgKz0gJy8nXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNwID0gcHMuc3BsaXQoJy8nKVxuICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVswXSArIHNwLnNoaWZ0KClcbiAgICAgICAgICAgIHdoaWxlIHNwLmxlbmd0aFxuICAgICAgICAgICAgICAgIHBuID0gc3Auc2hpZnQoKVxuICAgICAgICAgICAgICAgIGlmIHBuXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gY29sb3JzWydfaGVhZGVyJ11bMV0gKyAnLydcbiAgICAgICAgICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVtzcC5sZW5ndGggPT0gMCBhbmQgMiBvciAwXSArIHBuXG4gICAgICAgIGxvZyByZXNldFxuICAgICAgICBsb2cgcyArIFwiIFwiICsgcmVzZXRcbiAgICAgICAgbG9nIHJlc2V0XG5cbiAgICBpZiBmaWxlcy5sZW5ndGhcbiAgICAgICAgbGlzdEZpbGVzKHAsIGZpbGVzKVxuXG4gICAgaWYgYXJncy5yZWN1cnNlXG4gICAgICAgIGZvciBwciBpbiBmcy5yZWFkZGlyU3luYyhwKS5maWx0ZXIoIChmKSAtPiBmcy5sc3RhdFN5bmMoc2xhc2guam9pbihwLGYpKS5pc0RpcmVjdG9yeSgpIClcbiAgICAgICAgICAgIGxpc3REaXIoc2xhc2gucmVzb2x2ZShzbGFzaC5qb2luKHAsIHByKSkpXG5cbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuXG5wYXRoc3RhdHMgPSBhcmdzLnBhdGhzLm1hcCAoZikgLT5cbiAgICB0cnlcbiAgICAgICAgW2YsIGZzLnN0YXRTeW5jKGYpXVxuICAgIGNhdGNoIGVycm9yXG4gICAgICAgIGxvZ19lcnJvciAnbm8gc3VjaCBmaWxlOiAnLCBmXG4gICAgICAgIFtdXG5cbmZpbGVzdGF0cyA9IHBhdGhzdGF0cy5maWx0ZXIoIChmKSAtPiBmLmxlbmd0aCBhbmQgbm90IGZbMV0uaXNEaXJlY3RvcnkoKSApXG5pZiBmaWxlc3RhdHMubGVuZ3RoID4gMFxuICAgIGxvZyByZXNldFxuICAgIGxpc3RGaWxlcyBwcm9jZXNzLmN3ZCgpLCBmaWxlc3RhdHMubWFwKCAocykgLT4gc1swXSApXG5cbmZvciBwIGluIHBhdGhzdGF0cy5maWx0ZXIoIChmKSAtPiBmLmxlbmd0aCBhbmQgZlsxXS5pc0RpcmVjdG9yeSgpIClcbiAgICBsaXN0RGlyIHBbMF1cblxubG9nIFwiXCJcbmlmIGFyZ3Muc3RhdHNcbiAgICBzcHJpbnRmID0gcmVxdWlyZShcInNwcmludGYtanNcIikuc3ByaW50ZlxuICAgIGxvZyBCVygxKSArIFwiIFwiICtcbiAgICBmdyg4KSArIHN0YXRzLm51bV9kaXJzICsgKHN0YXRzLmhpZGRlbl9kaXJzIGFuZCBmdyg0KSArIFwiK1wiICsgZncoNSkgKyAoc3RhdHMuaGlkZGVuX2RpcnMpIG9yIFwiXCIpICsgZncoNCkgKyBcIiBkaXJzIFwiICtcbiAgICBmdyg4KSArIHN0YXRzLm51bV9maWxlcyArIChzdGF0cy5oaWRkZW5fZmlsZXMgYW5kIGZ3KDQpICsgXCIrXCIgKyBmdyg1KSArIChzdGF0cy5oaWRkZW5fZmlsZXMpIG9yIFwiXCIpICsgZncoNCkgKyBcIiBmaWxlcyBcIiArXG4gICAgZncoOCkgKyBrc3RyLnRpbWUocHJvY2Vzcy5ocnRpbWUuYmlnaW50KCktc3RhcnRUaW1lKSArIFwiIFwiICtcbiAgICByZXNldFxuIl19
//# sourceURL=../coffee/color-ls.coffee