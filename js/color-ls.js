// koffee 0.30.0

/*
 0000000   0000000   000       0000000   00000000           000       0000000
000       000   000  000      000   000  000   000          000      000
000       000   000  000      000   000  0000000    000000  000      0000000
000       000   000  000      000   000  000   000          000           000
 0000000   0000000   0000000   0000000   000   000          0000000  0000000
 */
var BG, BW, _, _s, ansi, args, bold, childp, colors, dirString, dotString, extString, fg, filestats, filter, fs, fw, groupMap, groupName, groupname, j, karg, len, linkString, listDir, listFiles, log, log_error, moment, nameString, ownerName, ownerString, p, pathstats, prof, ref, ref1, ref2, reset, rightsString, rwxString, since, sizeString, slash, sort, sprintf, start, stats, timeString, token, userMap, username, util,
    indexOf = [].indexOf;

ref = require('kxk'), childp = ref.childp, slash = ref.slash, karg = ref.karg, fs = ref.fs, _ = ref._;

log = console.log;

ansi = require('ansi-256-colors');

util = require('util');

_s = require('underscore.string');

moment = require('moment');

start = 0;

token = {};

since = function(t) {
    var diff;
    diff = process.hrtime(token[t]);
    return diff[0] * 1000 + diff[1] / 1000000;
};

prof = function() {
    var cmd, t;
    if (arguments.length === 2) {
        cmd = arguments[0];
        t = arguments[1];
    } else if (arguments.length === 1) {
        t = arguments[0];
        cmd = 'start';
    }
    start = process.hrtime();
    if (cmd === 'start') {
        return token[t] = start;
    } else if (cmd === 'end') {
        return since(t);
    }
};

prof('start', 'ls');

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
        b: [fg(0, 0, 2)],
        kB: [fg(0, 0, 4), fg(0, 0, 2)],
        MB: [fg(1, 1, 5), fg(0, 0, 3)],
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
    var col, t;
    t = moment(stat.mtime);
    return fw(16) + (args.pretty ? _s.lpad(t.format("D"), 2) : t.format("DD")) + fw(7) + '.' + (args.pretty ? fw(14) + t.format("MMM") + fw(1) + "'" : fw(14) + t.format("MM") + fw(1) + "'") + fw(4) + t.format("YY") + " " + fw(16) + t.format("HH") + (col = fw(7) + ':' + fw(14) + t.format("mm") + (col = fw(1) + ':' + fw(4) + t.format("ss") + " "));
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
    console.log(BW(1) + " " + fw(8) + stats.num_dirs + (stats.hidden_dirs && fw(4) + "+" + fw(5) + stats.hidden_dirs || "") + fw(4) + " dirs " + fw(8) + stats.num_files + (stats.hidden_files && fw(4) + "+" + fw(5) + stats.hidden_files || "") + fw(4) + " files " + fw(8) + sprintf("%2.1f", prof('end', 'ls')) + fw(4) + " ms" + " " + reset);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItbHMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGlhQUFBO0lBQUE7O0FBUUEsTUFBaUMsT0FBQSxDQUFRLEtBQVIsQ0FBakMsRUFBRSxtQkFBRixFQUFVLGlCQUFWLEVBQWlCLGVBQWpCLEVBQXVCLFdBQXZCLEVBQTJCOztBQUUzQixHQUFBLEdBQVMsT0FBTyxDQUFDOztBQUNqQixJQUFBLEdBQVMsT0FBQSxDQUFRLGlCQUFSOztBQUNULElBQUEsR0FBUyxPQUFBLENBQVEsTUFBUjs7QUFDVCxFQUFBLEdBQVMsT0FBQSxDQUFRLG1CQUFSOztBQUNULE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7QUFRVCxLQUFBLEdBQVE7O0FBQ1IsS0FBQSxHQUFROztBQUVSLEtBQUEsR0FBUSxTQUFDLENBQUQ7QUFDTixRQUFBO0lBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxNQUFSLENBQWUsS0FBTSxDQUFBLENBQUEsQ0FBckI7V0FDUCxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVUsSUFBVixHQUFpQixJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVU7QUFGckI7O0FBSVIsSUFBQSxHQUFPLFNBQUE7QUFDSCxRQUFBO0lBQUEsSUFBRyxTQUFTLENBQUMsTUFBVixLQUFvQixDQUF2QjtRQUNJLEdBQUEsR0FBTSxTQUFVLENBQUEsQ0FBQTtRQUNoQixDQUFBLEdBQUksU0FBVSxDQUFBLENBQUEsRUFGbEI7S0FBQSxNQUdLLElBQUcsU0FBUyxDQUFDLE1BQVYsS0FBb0IsQ0FBdkI7UUFDRCxDQUFBLEdBQUksU0FBVSxDQUFBLENBQUE7UUFDZCxHQUFBLEdBQU0sUUFGTDs7SUFJTCxLQUFBLEdBQVEsT0FBTyxDQUFDLE1BQVIsQ0FBQTtJQUNSLElBQUcsR0FBQSxLQUFPLE9BQVY7ZUFDSSxLQUFNLENBQUEsQ0FBQSxDQUFOLEdBQVcsTUFEZjtLQUFBLE1BRUssSUFBRyxHQUFB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QixHQUVrRyxFQUFBLENBQUcsQ0FBSCxDQUZsRyxHQUUwRyxTQUYxRyxHQUdKLEVBQUEsQ0FBRyxDQUFILENBSEksR0FHSSxPQUFBLENBQVEsT0FBUixFQUFpQixJQUFBLENBQUssS0FBTCxFQUFZLElBQVosQ0FBakIsQ0FISixHQUcwQyxFQUFBLENBQUcsQ0FBSCxDQUgxQyxHQUdrRCxLQUhsRCxHQUcwRCxHQUgxRCxHQUlKLEtBTHVDLEVBRDNDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAgICAgICAwMDAgICAgICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwICAwMDAgICAgICAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgICAgICAgIDAwMFxuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgICAgICAgMDAwMDAwMCAgMDAwMDAwMFxuIyMjXG5cbnsgY2hpbGRwLCBzbGFzaCwga2FyZywgZnMsIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxubG9nICAgID0gY29uc29sZS5sb2dcbmFuc2kgICA9IHJlcXVpcmUgJ2Fuc2ktMjU2LWNvbG9ycydcbnV0aWwgICA9IHJlcXVpcmUgJ3V0aWwnXG5fcyAgICAgPSByZXF1aXJlICd1bmRlcnNjb3JlLnN0cmluZydcbm1vbWVudCA9IHJlcXVpcmUgJ21vbWVudCdcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDBcblxuc3RhcnQgPSAwXG50b2tlbiA9IHt9XG5cbnNpbmNlID0gKHQpIC0+XG4gIGRpZmYgPSBwcm9jZXNzLmhydGltZSB0b2tlblt0XVxuICBkaWZmWzBdICogMTAwMCArIGRpZmZbMV0gLyAxMDAwMDAwXG5cbnByb2YgPSAoKSAtPlxuICAgIGlmIGFyZ3VtZW50cy5sZW5ndGggPT0gMlxuICAgICAgICBjbWQgPSBhcmd1bWVudHNbMF1cbiAgICAgICAgdCA9IGFyZ3VtZW50c1sxXVxuICAgIGVsc2UgaWYgYXJndW1lbnRzLmxlbmd0aCA9PSAxXG4gICAgICAgIHQgPSBhcmd1bWVudHNbMF1cbiAgICAgICAgY21kID0gJ3N0YXJ0J1xuXG4gICAgc3RhcnQgPSBwcm9jZXNzLmhydGltZSgpXG4gICAgaWYgY21kID09ICdzdGFydCdcbiAgICAgICAgdG9rZW5bdF0gPSBzdGFydFxuICAgIGVsc2UgaWYgY21kID09ICdlbmQnXG4gICAgICAgIHNpbmNlKHQpXG5cbnByb2YgJ3N0YXJ0JywgJ2xzJ1xuXG4jIGNvbG9yc1xuYm9sZCAgID0gJ1xceDFiWzFtJ1xucmVzZXQgID0gYW5zaS5yZXNldFxuZmcgICAgID0gYW5zaS5mZy5nZXRSZ2JcbkJHICAgICA9IGFuc2kuYmcuZ2V0UmdiXG5mdyAgICAgPSAoaSkgLT4gYW5zaS5mZy5ncmF5c2NhbGVbaV1cbkJXICAgICA9IChpKSAtPiBhbnNpLmJnLmdyYXlzY2FsZVtpXVxuXG5zdGF0cyA9ICMgY291bnRlcnMgZm9yIChoaWRkZW4pIGRpcnMvZmlsZXNcbiAgICBudW1fZGlyczogICAgICAgMFxuICAgIG51bV9maWxlczogICAgICAwXG4gICAgaGlkZGVuX2RpcnM6ICAgIDBcbiAgICBoaWRkZW5fZmlsZXM6ICAgMFxuICAgIG1heE93bmVyTGVuZ3RoOiAwXG4gICAgbWF4R3JvdXBMZW5ndGg6IDBcbiAgICBicm9rZW5MaW5rczogICAgW11cblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDBcbiMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgMDAwMCAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbmFyZ3MgPSBrYXJnIFwiXCJcIlxuY29sb3ItbHNcbiAgICBwYXRocyAgICAgICAgIC4gPyB0aGUgZmlsZShzKSBhbmQvb3IgZm9sZGVyKHMpIHRvIGRpc3BsYXkgLiAqKlxuICAgIGJ5dGVzICAgICAgICAgLiA/IGluY2x1ZGUgc2l6ZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgbWRhdGUgICAgICAgICAuID8gaW5jbHVkZSBtb2RpZmljYXRpb24gZGF0ZSAgICAgICAuID0gZmFsc2VcbiAgICBsb25nICAgICAgICAgIC4gPyBpbmNsdWRlIHNpemUgYW5kIGRhdGUgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIG93bmVyICAgICAgICAgLiA/IGluY2x1ZGUgb3duZXIgYW5kIGdyb3VwICAgICAgICAgLiA9IGZhbHNlXG4gICAgcmlnaHRzICAgICAgICAuID8gaW5jbHVkZSByaWdodHMgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICBhbGwgICAgICAgICAgIC4gPyBzaG93IGRvdCBmaWxlcyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIGRpcnMgICAgICAgICAgLiA/IHNob3cgb25seSBkaXJzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgZmlsZXMgICAgICAgICAuID8gc2hvdyBvbmx5IGZpbGVzICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICBzaXplICAgICAgICAgIC4gPyBzb3J0IGJ5IHNpemUgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIHRpbWUgICAgICAgICAgLiA/IHNvcnQgYnkgdGltZSAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAga2luZCAgICAgICAgICAuID8gc29ydCBieSBraW5kICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICBwcmV0dHkgICAgICAgIC4gPyBwcmV0dHkgc2l6ZSBhbmQgZGF0ZSAgICAgICAgICAgIC4gPSB0cnVlXG4gICAgc3RhdHMgICAgICAgICAuID8gc2hvdyBzdGF0aXN0aWNzICAgICAgICAgICAgICAgICAuID0gZmFsc2UgLiAtIGlcbiAgICByZWN1cnNlICAgICAgIC4gPyByZWN1cnNlIGludG8gc3ViZGlycyAgICAgICAgICAgIC4gPSBmYWxzZSAuIC0gUlxuICAgIGZpbmQgICAgICAgICAgLiA/IGZpbHRlciB3aXRoIGEgcmVnZXhwICAgICAgICAgICAgICAgICAgICAgIC4gLSBGXG4gICAgYWxwaGFiZXRpY2FsICAuICEgZG9uJ3QgZ3JvdXAgZGlycyBiZWZvcmUgZmlsZXMgICAuID0gZmFsc2UgLiAtIEFcblxudmVyc2lvbiAgICAgICN7cmVxdWlyZShcIiN7X19kaXJuYW1lfS8uLi9wYWNrYWdlLmpzb25cIikudmVyc2lvbn1cblwiXCJcIlxuXG5pZiBhcmdzLnNpemVcbiAgICBhcmdzLmZpbGVzID0gdHJ1ZVxuXG5pZiBhcmdzLmxvbmdcbiAgICBhcmdzLmJ5dGVzID0gdHJ1ZVxuICAgIGFyZ3MubWRhdGUgPSB0cnVlXG5cbmFyZ3MucGF0aHMgPSBbJy4nXSB1bmxlc3MgYXJncy5wYXRocz8ubGVuZ3RoID4gMFxuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG5jb2xvcnMgPVxuICAgICdjb2ZmZWUnOiAgIFsgYm9sZCtmZyg0LDQsMCksICBmZygxLDEsMCksIGZnKDEsMSwwKSBdXG4gICAgJ3B5JzogICAgICAgWyBib2xkK2ZnKDAsMiwwKSwgIGZnKDAsMSwwKSwgZmcoMCwxLDApIF1cbiAgICAncmInOiAgICAgICBbIGJvbGQrZmcoNCwwLDApLCAgZmcoMSwwLDApLCBmZygxLDAsMCkgXVxuICAgICdqc29uJzogICAgIFsgYm9sZCtmZyg0LDAsNCksICBmZygxLDAsMSksIGZnKDEsMCwxKSBdXG4gICAgJ2Nzb24nOiAgICAgWyBib2xkK2ZnKDQsMCw0KSwgIGZnKDEsMCwxKSwgZmcoMSwwLDEpIF1cbiAgICAnbm9vbic6ICAgICBbIGJvbGQrZmcoNCw0LDApLCAgZmcoMSwxLDApLCBmZygxLDEsMCkgXVxuICAgICdwbGlzdCc6ICAgIFsgYm9sZCtmZyg0LDAsNCksICBmZygxLDAsMSksIGZnKDEsMCwxKSBdXG4gICAgJ2pzJzogICAgICAgWyBib2xkK2ZnKDUsMCw1KSwgIGZnKDEsMCwxKSwgZmcoMSwwLDEpIF1cbiAgICAnY3BwJzogICAgICBbIGJvbGQrZmcoNSw0LDApLCAgZncoMSksICAgICBmZygxLDEsMCkgXVxuICAgICdoJzogICAgICAgIFsgICAgICBmZygzLDEsMCksICBmdygxKSwgICAgIGZnKDEsMSwwKSBdXG4gICAgJ3B5Yyc6ICAgICAgWyAgICAgIGZ3KDUpLCAgICAgIGZ3KDEpLCAgICAgZncoMSkgXVxuICAgICdsb2cnOiAgICAgIFsgICAgICBmdyg1KSwgICAgICBmdygxKSwgICAgIGZ3KDEpIF1cbiAgICAnbG9nJzogICAgICBbICAgICAgZncoNSksICAgICAgZncoMSksICAgICBmdygxKSBdXG4gICAgJ3R4dCc6ICAgICAgWyAgICAgIGZ3KDIwKSwgICAgIGZ3KDEpLCAgICAgZncoMikgXVxuICAgICdtZCc6ICAgICAgIFsgYm9sZCtmdygyMCksICAgICBmdygxKSwgICAgIGZ3KDIpIF1cbiAgICAnbWFya2Rvd24nOiBbIGJvbGQrZncoMjApLCAgICAgZncoMSksICAgICBmdygyKSBdXG4gICAgJ3NoJzogICAgICAgWyBib2xkK2ZnKDUsMSwwKSwgIGZnKDEsMCwwKSwgZmcoMSwwLDApIF1cbiAgICAncG5nJzogICAgICBbIGJvbGQrZmcoNSwwLDApLCAgZmcoMSwwLDApLCBmZygxLDAsMCkgXVxuICAgICdqcGcnOiAgICAgIFsgYm9sZCtmZygwLDMsMCksICBmZygwLDEsMCksIGZnKDAsMSwwKSBdXG4gICAgJ3B4bSc6ICAgICAgWyBib2xkK2ZnKDEsMSw1KSwgIGZnKDAsMCwxKSwgZmcoMCwwLDIpIF1cbiAgICAndGlmZic6ICAgICBbIGJvbGQrZmcoMSwxLDUpLCAgZmcoMCwwLDEpLCBmZygwLDAsMikgXVxuICAgICNcbiAgICAnX2RlZmF1bHQnOiBbICAgICAgZncoMTUpLCAgICAgZncoMSksICAgICBmdyg2KSBdXG4gICAgJ19kaXInOiAgICAgWyBib2xkK0JHKDAsMCwyKStmdygyMyksIGZnKDEsMSw1KSwgZmcoMiwyLDUpIF1cbiAgICAnXy5kaXInOiAgICBbIGJvbGQrQkcoMCwwLDEpK2Z3KDIzKSwgYm9sZCtCRygwLDAsMSkrZmcoMSwxLDUpLCBib2xkK0JHKDAsMCwxKStmZygyLDIsNSkgXVxuICAgICdfbGluayc6ICAgIHsgJ2Fycm93JzogZmcoMSwwLDEpLCAncGF0aCc6IGZnKDQsMCw0KSwgJ2Jyb2tlbic6IEJHKDUsMCwwKStmZyg1LDUsMCkgfVxuICAgICdfYXJyb3cnOiAgICAgZncoMSlcbiAgICAnX2hlYWRlcic6ICBbIGJvbGQrQlcoMikrZmcoMywyLDApLCAgZncoNCksIGJvbGQrQlcoMikrZmcoNSw1LDApIF1cbiAgICAjXG4gICAgJ19zaXplJzogICAgeyBiOiBbZmcoMCwwLDIpXSwga0I6IFtmZygwLDAsNCksIGZnKDAsMCwyKV0sIE1COiBbZmcoMSwxLDUpLCBmZygwLDAsMyldLCBHQjogW2ZnKDQsNCw1KSwgZmcoMiwyLDUpXSwgVEI6IFtmZyg0LDQsNSksIGZnKDIsMiw1KV0gfVxuICAgICdfdXNlcnMnOiAgIHsgcm9vdDogIGZnKDMsMCwwKSwgZGVmYXVsdDogZmcoMSwwLDEpIH1cbiAgICAnX2dyb3Vwcyc6ICB7IHdoZWVsOiBmZygxLDAsMCksIHN0YWZmOiBmZygwLDEsMCksIGFkbWluOiBmZygxLDEsMCksIGRlZmF1bHQ6IGZnKDEsMCwxKSB9XG4gICAgJ19lcnJvcic6ICAgWyBib2xkK0JHKDUsMCwwKStmZyg1LDUsMCksIGJvbGQrQkcoNSwwLDApK2ZnKDUsNSw1KSBdXG4gICAgJ19yaWdodHMnOlxuICAgICAgICAgICAgICAgICAgJ3IrJzogYm9sZCtCVygxKStmZygxLDEsMSlcbiAgICAgICAgICAgICAgICAgICdyLSc6IHJlc2V0K0JXKDEpXG4gICAgICAgICAgICAgICAgICAndysnOiBib2xkK0JXKDEpK2ZnKDIsMiw1KVxuICAgICAgICAgICAgICAgICAgJ3ctJzogcmVzZXQrQlcoMSlcbiAgICAgICAgICAgICAgICAgICd4Kyc6IGJvbGQrQlcoMSkrZmcoNSwwLDApXG4gICAgICAgICAgICAgICAgICAneC0nOiByZXNldCtCVygxKVxuXG51c2VyTWFwID0ge31cbnVzZXJuYW1lID0gKHVpZCkgLT5cbiAgICBpZiBub3QgdXNlck1hcFt1aWRdXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgdXNlck1hcFt1aWRdID0gY2hpbGRwLnNwYXduU3luYyhcImlkXCIsIFtcIi11blwiLCBcIiN7dWlkfVwiXSkuc3Rkb3V0LnRvU3RyaW5nKCd1dGY4JykudHJpbSgpXG4gICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgIGxvZyBlXG4gICAgdXNlck1hcFt1aWRdXG5cbmdyb3VwTWFwID0gbnVsbFxuZ3JvdXBuYW1lID0gKGdpZCkgLT5cbiAgICBpZiBub3QgZ3JvdXBNYXBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBnaWRzID0gY2hpbGRwLnNwYXduU3luYyhcImlkXCIsIFtcIi1HXCJdKS5zdGRvdXQudG9TdHJpbmcoJ3V0ZjgnKS5zcGxpdCgnICcpXG4gICAgICAgICAgICBnbm1zID0gY2hpbGRwLnNwYXduU3luYyhcImlkXCIsIFtcIi1HblwiXSkuc3Rkb3V0LnRvU3RyaW5nKCd1dGY4Jykuc3BsaXQoJyAnKVxuICAgICAgICAgICAgZ3JvdXBNYXAgPSB7fVxuICAgICAgICAgICAgZm9yIGkgaW4gWzAuLi5naWRzLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBncm91cE1hcFtnaWRzW2ldXSA9IGdubXNbaV1cbiAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgbG9nIGVcbiAgICBncm91cE1hcFtnaWRdXG5cbmlmIF8uaXNGdW5jdGlvbiBwcm9jZXNzLmdldHVpZFxuICAgIGNvbG9yc1snX3VzZXJzJ11bdXNlcm5hbWUocHJvY2Vzcy5nZXR1aWQoKSldID0gZmcoMCw0LDApXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAwMDBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxubG9nX2Vycm9yID0gKCkgLT5cbiAgICBsb2cgXCIgXCIgKyBjb2xvcnNbJ19lcnJvciddWzBdICsgXCIgXCIgKyBib2xkICsgYXJndW1lbnRzWzBdICsgKGFyZ3VtZW50cy5sZW5ndGggPiAxIGFuZCAoY29sb3JzWydfZXJyb3InXVsxXSArIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5zbGljZSgxKS5qb2luKCcgJykpIG9yICcnKSArIFwiIFwiICsgcmVzZXRcblxubGlua1N0cmluZyA9IChmaWxlKSAtPiBcbiAgICBzICA9IHJlc2V0ICsgZncoMSkgKyBjb2xvcnNbJ19saW5rJ11bJ2Fycm93J10gKyBcIiDilrogXCIgXG4gICAgcyArPSBjb2xvcnNbJ19saW5rJ11bKGZpbGUgaW4gc3RhdHMuYnJva2VuTGlua3MpIGFuZCAnYnJva2VuJyBvciAncGF0aCddIFxuICAgIHRyeVxuICAgICAgICBzICs9IHNsYXNoLnBhdGggZnMucmVhZGxpbmtTeW5jKGZpbGUpXG4gICAgY2F0Y2ggZXJyXG4gICAgICAgIHMgKz0gJyA/ICdcbiAgICBzXG5cbm5hbWVTdHJpbmcgPSAobmFtZSwgZXh0KSAtPiBcIiBcIiArIGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVswXSArIG5hbWUgKyByZXNldFxuZG90U3RyaW5nICA9ICggICAgICBleHQpIC0+IGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVsxXSArIFwiLlwiICsgcmVzZXRcbmV4dFN0cmluZyAgPSAoICAgICAgZXh0KSAtPiBkb3RTdHJpbmcoZXh0KSArIGNvbG9yc1tjb2xvcnNbZXh0XT8gYW5kIGV4dCBvciAnX2RlZmF1bHQnXVsyXSArIGV4dCArIHJlc2V0XG5kaXJTdHJpbmcgID0gKG5hbWUsIGV4dCkgLT5cbiAgICBjID0gbmFtZSBhbmQgJ19kaXInIG9yICdfLmRpcidcbiAgICBjb2xvcnNbY11bMF0gKyAobmFtZSBhbmQgKFwiIFwiICsgbmFtZSkgb3IgXCJcIikgKyAoaWYgZXh0IHRoZW4gY29sb3JzW2NdWzFdICsgJy4nICsgY29sb3JzW2NdWzJdICsgZXh0IGVsc2UgXCJcIikgKyBcIiBcIlxuXG5zaXplU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgaWYgc3RhdC5zaXplIDwgMTAwMFxuICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ2InXVswXSArIF9zLmxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2UgaWYgc3RhdC5zaXplIDwgMTAwMDAwMFxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydrQiddWzBdICsgX3MubHBhZCgoc3RhdC5zaXplIC8gMTAwMCkudG9GaXhlZCgwKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsna0InXVsxXSArIFwia0IgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydrQiddWzBdICsgX3MubHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZSBpZiBzdGF0LnNpemUgPCAxMDAwMDAwMDAwXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ01CJ11bMF0gKyBfcy5scGFkKChzdGF0LnNpemUgLyAxMDAwMDAwKS50b0ZpeGVkKDEpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydNQiddWzFdICsgXCJNQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ01CJ11bMF0gKyBfcy5scGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlIGlmIHN0YXQuc2l6ZSA8IDEwMDAwMDAwMDAwMDBcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnR0InXVswXSArIF9zLmxwYWQoKHN0YXQuc2l6ZSAvIDEwMDAwMDAwMDApLnRvRml4ZWQoMSksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMV0gKyBcIkdCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnR0InXVswXSArIF9zLmxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2VcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnVEInXVswXSArIF9zLmxwYWQoKHN0YXQuc2l6ZSAvIDEwMDAwMDAwMDAwMDApLnRvRml4ZWQoMyksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMV0gKyBcIlRCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsnVEInXVswXSArIF9zLmxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuXG50aW1lU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgdCA9IG1vbWVudChzdGF0Lm10aW1lKVxuICAgIGZ3KDE2KSArIChpZiBhcmdzLnByZXR0eSB0aGVuIF9zLmxwYWQodC5mb3JtYXQoXCJEXCIpLDIpIGVsc2UgdC5mb3JtYXQoXCJERFwiKSkgKyBmdyg3KSsnLicgK1xuICAgIChpZiBhcmdzLnByZXR0eSB0aGVuIGZ3KDE0KSArIHQuZm9ybWF0KFwiTU1NXCIpICsgZncoMSkrXCInXCIgZWxzZSBmdygxNCkgKyB0LmZvcm1hdChcIk1NXCIpICsgZncoMSkrXCInXCIpICtcbiAgICBmdyggNCkgKyB0LmZvcm1hdChcIllZXCIpICsgXCIgXCIgK1xuICAgIGZ3KDE2KSArIHQuZm9ybWF0KFwiSEhcIikgKyBjb2wgPSBmdyg3KSsnOicgK1xuICAgIGZ3KDE0KSArIHQuZm9ybWF0KFwibW1cIikgKyBjb2wgPSBmdygxKSsnOicgK1xuICAgIGZ3KCA0KSArIHQuZm9ybWF0KFwic3NcIikgKyBcIiBcIlxuXG5vd25lck5hbWUgPSAoc3RhdCkgLT5cbiAgICB0cnlcbiAgICAgICAgdXNlcm5hbWUgc3RhdC51aWRcbiAgICBjYXRjaFxuICAgICAgICBzdGF0LnVpZFxuXG5ncm91cE5hbWUgPSAoc3RhdCkgLT5cbiAgICB0cnlcbiAgICAgICAgZ3JvdXBuYW1lIHN0YXQuZ2lkXG4gICAgY2F0Y2hcbiAgICAgICAgc3RhdC5naWRcblxub3duZXJTdHJpbmcgPSAoc3RhdCkgLT5cbiAgICBvd24gPSBvd25lck5hbWUoc3RhdClcbiAgICBncnAgPSBncm91cE5hbWUoc3RhdClcbiAgICBvY2wgPSBjb2xvcnNbJ191c2VycyddW293bl1cbiAgICBvY2wgPSBjb2xvcnNbJ191c2VycyddWydkZWZhdWx0J10gdW5sZXNzIG9jbFxuICAgIGdjbCA9IGNvbG9yc1snX2dyb3VwcyddW2dycF1cbiAgICBnY2wgPSBjb2xvcnNbJ19ncm91cHMnXVsnZGVmYXVsdCddIHVubGVzcyBnY2xcbiAgICBvY2wgKyBfcy5ycGFkKG93biwgc3RhdHMubWF4T3duZXJMZW5ndGgpICsgXCIgXCIgKyBnY2wgKyBfcy5ycGFkKGdycCwgc3RhdHMubWF4R3JvdXBMZW5ndGgpXG5cbnJ3eFN0cmluZyA9IChtb2RlLCBpKSAtPlxuICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIxMDApIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsncisnXSArICcgcicgb3IgY29sb3JzWydfcmlnaHRzJ11bJ3ItJ10gKyAnICAnKSArXG4gICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjAxMCkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWyd3KyddICsgJyB3JyBvciBjb2xvcnNbJ19yaWdodHMnXVsndy0nXSArICcgICcpICtcbiAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMDAxKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3grJ10gKyAnIHgnIG9yIGNvbG9yc1snX3JpZ2h0cyddWyd4LSddICsgJyAgJylcblxucmlnaHRzU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgdXIgPSByd3hTdHJpbmcoc3RhdC5tb2RlLCAyKSArIFwiIFwiXG4gICAgZ3IgPSByd3hTdHJpbmcoc3RhdC5tb2RlLCAxKSArIFwiIFwiXG4gICAgcm8gPSByd3hTdHJpbmcoc3RhdC5tb2RlLCAwKSArIFwiIFwiXG4gICAgdXIgKyBnciArIHJvICsgcmVzZXRcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMFxuXG5zb3J0ID0gKGxpc3QsIHN0YXRzLCBleHRzPVtdKSAtPlxuICAgIGwgPSBfLnppcCBsaXN0LCBzdGF0cywgWzAuLi5saXN0Lmxlbmd0aF0sIChleHRzLmxlbmd0aCA+IDAgYW5kIGV4dHMgb3IgWzAuLi5saXN0Lmxlbmd0aF0pXG4gICAgaWYgYXJncy5raW5kXG4gICAgICAgIGlmIGV4dHMgPT0gW10gdGhlbiByZXR1cm4gbGlzdFxuICAgICAgICBsLnNvcnQoKGEsYikgLT5cbiAgICAgICAgICAgIGlmIGFbM10gPiBiWzNdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIGlmIGFbM10gPCBiWzNdIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhcmdzLnRpbWVcbiAgICAgICAgICAgICAgICBtID0gbW9tZW50KGFbMV0ubXRpbWUpXG4gICAgICAgICAgICAgICAgaWYgbS5pc0FmdGVyKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBpZiBtLmlzQmVmb3JlKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhcmdzLnNpemVcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPiBiWzFdLnNpemUgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA8IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYVsyXSA+IGJbMl0gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgLTEpXG4gICAgZWxzZSBpZiBhcmdzLnRpbWVcbiAgICAgICAgbC5zb3J0KChhLGIpIC0+XG4gICAgICAgICAgICBtID0gbW9tZW50KGFbMV0ubXRpbWUpXG4gICAgICAgICAgICBpZiBtLmlzQWZ0ZXIoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgaWYgbS5pc0JlZm9yZShiWzFdLm10aW1lKSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYXJncy5zaXplXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplID4gYlsxXS5zaXplIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPCBiWzFdLnNpemUgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFbMl0gPiBiWzJdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIC0xKVxuICAgIGVsc2UgaWYgYXJncy5zaXplXG4gICAgICAgIGwuc29ydCgoYSxiKSAtPlxuICAgICAgICAgICAgaWYgYVsxXS5zaXplID4gYlsxXS5zaXplIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA8IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYVsyXSA+IGJbMl0gdGhlbiByZXR1cm4gMVxuICAgICAgICAgICAgLTEpXG4gICAgXy51bnppcChsKVswXVxuXG5maWx0ZXIgPSAocCkgLT5cbiAgICBpZiBzbGFzaC53aW4oKVxuICAgICAgICByZXR1cm4gdHJ1ZSBpZiBwWzBdID09ICckJ1xuICAgICAgICByZXR1cm4gdHJ1ZSBpZiBwID09ICdkZXNrdG9wLmluaSdcbiAgICAgICAgcmV0dXJuIHRydWUgaWYgcC50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGggJ250dXNlcidcbiAgICBmYWxzZVxuICAgIFxuIyAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMFxuIyAwMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDBcblxubGlzdEZpbGVzID0gKHAsIGZpbGVzKSAtPlxuICAgIGFscGggPSBbXSBpZiBhcmdzLmFscGhhYmV0aWNhbFxuICAgIGRpcnMgPSBbXSAjIHZpc2libGUgZGlyc1xuICAgIGZpbHMgPSBbXSAjIHZpc2libGUgZmlsZXNcbiAgICBkc3RzID0gW10gIyBkaXIgc3RhdHNcbiAgICBmc3RzID0gW10gIyBmaWxlIHN0YXRzXG4gICAgZXh0cyA9IFtdICMgZmlsZSBleHRlbnNpb25zXG5cbiAgICBpZiBhcmdzLm93bmVyXG4gICAgICAgIGZpbGVzLmZvckVhY2ggKHJwKSAtPlxuICAgICAgICAgICAgaWYgc2xhc2guaXNBYnNvbHV0ZSBycFxuICAgICAgICAgICAgICAgIGZpbGUgPSBzbGFzaC5yZXNvbHZlIHJwXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmlsZSAgPSBzbGFzaC5qb2luIHAsIHJwXG4gICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICBzdGF0ID0gZnMubHN0YXRTeW5jKGZpbGUpXG4gICAgICAgICAgICAgICAgb2wgPSBvd25lck5hbWUoc3RhdCkubGVuZ3RoXG4gICAgICAgICAgICAgICAgZ2wgPSBncm91cE5hbWUoc3RhdCkubGVuZ3RoXG4gICAgICAgICAgICAgICAgaWYgb2wgPiBzdGF0cy5tYXhPd25lckxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5tYXhPd25lckxlbmd0aCA9IG9sXG4gICAgICAgICAgICAgICAgaWYgZ2wgPiBzdGF0cy5tYXhHcm91cExlbmd0aFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5tYXhHcm91cExlbmd0aCA9IGdsXG4gICAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgZmlsZXMuZm9yRWFjaCAocnApIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC5pc0Fic29sdXRlIHJwXG4gICAgICAgICAgICBmaWxlICA9IHNsYXNoLnJlc29sdmUgcnBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZmlsZSAgPSBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gcCwgcnBcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZmlsdGVyIHJwXG4gICAgICAgIFxuICAgICAgICB0cnlcbiAgICAgICAgICAgIGxzdGF0ID0gZnMubHN0YXRTeW5jIGZpbGVcbiAgICAgICAgICAgIGxpbmsgID0gbHN0YXQuaXNTeW1ib2xpY0xpbmsoKVxuICAgICAgICAgICAgc3RhdCAgPSBsaW5rIGFuZCBmcy5zdGF0U3luYyhmaWxlKSBvciBsc3RhdFxuICAgICAgICBjYXRjaFxuICAgICAgICAgICAgaWYgbGlua1xuICAgICAgICAgICAgICAgIHN0YXQgPSBsc3RhdFxuICAgICAgICAgICAgICAgIHN0YXRzLmJyb2tlbkxpbmtzLnB1c2ggZmlsZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxvZ19lcnJvciBcImNhbid0IHJlYWQgZmlsZTogXCIsIGZpbGUsIGxpbmtcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBleHQgID0gc2xhc2guZXh0bmFtZShmaWxlKS5zdWJzdHIoMSlcbiAgICAgICAgbmFtZSA9IHNsYXNoLmJhc2VuYW1lKGZpbGUsIHNsYXNoLmV4dG5hbWUgZmlsZSlcbiAgICAgICAgaWYgbmFtZVswXSA9PSAnLidcbiAgICAgICAgICAgIGV4dCA9IG5hbWUuc3Vic3RyKDEpICsgc2xhc2guZXh0bmFtZSBmaWxlXG4gICAgICAgICAgICBuYW1lID0gJydcbiAgICAgICAgaWYgbmFtZS5sZW5ndGggYW5kIG5hbWVbbmFtZS5sZW5ndGgtMV0gIT0gJ1xccicgb3IgYXJncy5hbGxcbiAgICAgICAgICAgIHMgPSBcIiBcIlxuICAgICAgICAgICAgaWYgYXJncy5yaWdodHNcbiAgICAgICAgICAgICAgICBzICs9IHJpZ2h0c1N0cmluZyBzdGF0XG4gICAgICAgICAgICAgICAgcyArPSBcIiBcIlxuICAgICAgICAgICAgaWYgYXJncy5vd25lclxuICAgICAgICAgICAgICAgIHMgKz0gb3duZXJTdHJpbmcgc3RhdFxuICAgICAgICAgICAgICAgIHMgKz0gXCIgXCJcbiAgICAgICAgICAgIGlmIGFyZ3MuYnl0ZXNcbiAgICAgICAgICAgICAgICBzICs9IHNpemVTdHJpbmcgc3RhdFxuICAgICAgICAgICAgaWYgYXJncy5tZGF0ZVxuICAgICAgICAgICAgICAgIHMgKz0gdGltZVN0cmluZyBzdGF0XG4gICAgICAgICAgICBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICBpZiBub3QgYXJncy5maWxlc1xuICAgICAgICAgICAgICAgICAgICBzICs9IGRpclN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgbGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBsaW5rU3RyaW5nIGZpbGVcbiAgICAgICAgICAgICAgICAgICAgZGlycy5wdXNoIHMrcmVzZXRcbiAgICAgICAgICAgICAgICAgICAgYWxwaC5wdXNoIHMrcmVzZXQgaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICAgICAgICAgICAgICAgICAgZHN0cy5wdXNoIHN0YXRcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubnVtX2RpcnMgKz0gMVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMuaGlkZGVuX2RpcnMgKz0gMVxuICAgICAgICAgICAgZWxzZSAjIGlmIHBhdGggaXMgZmlsZVxuICAgICAgICAgICAgICAgIGlmIG5vdCBhcmdzLmRpcnNcbiAgICAgICAgICAgICAgICAgICAgcyArPSBuYW1lU3RyaW5nIG5hbWUsIGV4dFxuICAgICAgICAgICAgICAgICAgICBpZiBleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gZXh0U3RyaW5nIGV4dFxuICAgICAgICAgICAgICAgICAgICBpZiBsaW5rXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGxpbmtTdHJpbmcgZmlsZVxuICAgICAgICAgICAgICAgICAgICBmaWxzLnB1c2ggcytyZXNldFxuICAgICAgICAgICAgICAgICAgICBhbHBoLnB1c2ggcytyZXNldCBpZiBhcmdzLmFscGhhYmV0aWNhbFxuICAgICAgICAgICAgICAgICAgICBmc3RzLnB1c2ggc3RhdFxuICAgICAgICAgICAgICAgICAgICBleHRzLnB1c2ggZXh0XG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm51bV9maWxlcyArPSAxXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5oaWRkZW5fZmlsZXMgKz0gMVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBzdGF0LmlzRmlsZSgpXG4gICAgICAgICAgICAgICAgc3RhdHMuaGlkZGVuX2ZpbGVzICs9IDFcbiAgICAgICAgICAgIGVsc2UgaWYgc3RhdC5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICAgICAgc3RhdHMuaGlkZGVuX2RpcnMgKz0gMVxuXG4gICAgaWYgYXJncy5zaXplIG9yIGFyZ3Mua2luZCBvciBhcmdzLnRpbWVcbiAgICAgICAgaWYgZGlycy5sZW5ndGggYW5kIG5vdCBhcmdzLmZpbGVzXG4gICAgICAgICAgICBkaXJzID0gc29ydCBkaXJzLCBkc3RzXG4gICAgICAgIGlmIGZpbHMubGVuZ3RoXG4gICAgICAgICAgICBmaWxzID0gc29ydCBmaWxzLCBmc3RzLCBleHRzXG5cbiAgICBpZiBhcmdzLmFscGhhYmV0aWNhbFxuICAgICAgICBsb2cgcCBmb3IgcCBpbiBhbHBoXG4gICAgZWxzZVxuICAgICAgICBsb2cgZCBmb3IgZCBpbiBkaXJzXG4gICAgICAgIGxvZyBmIGZvciBmIGluIGZpbHNcblxuIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAgMDAwICAwMDAgICAwMDBcblxubGlzdERpciA9IChwKSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBmaWx0ZXIgcFxuICAgIFxuICAgIHBzID0gcFxuXG4gICAgdHJ5XG4gICAgICAgIGZpbGVzID0gZnMucmVhZGRpclN5bmMocClcbiAgICBjYXRjaCBlcnJvclxuICAgICAgICBtc2cgPSBlcnJvci5tZXNzYWdlXG4gICAgICAgIG1zZyA9IFwicGVybWlzc2lvbiBkZW5pZWRcIiBpZiBfcy5zdGFydHNXaXRoKG1zZywgXCJFQUNDRVNcIilcbiAgICAgICAgbG9nX2Vycm9yIG1zZ1xuXG4gICAgaWYgYXJncy5maW5kXG4gICAgICAgIGZpbGVzID0gZmlsZXMuZmlsdGVyIChmKSAtPlxuICAgICAgICAgICAgZiBpZiBSZWdFeHAoYXJncy5maW5kKS50ZXN0IGZcbiAgICAgICAgICAgIFxuICAgIGlmIGFyZ3MuZmluZCBhbmQgbm90IGZpbGVzLmxlbmd0aFxuICAgICAgICB0cnVlXG4gICAgZWxzZSBpZiBhcmdzLnBhdGhzLmxlbmd0aCA9PSAxIGFuZCBhcmdzLnBhdGhzWzBdID09ICcuJyBhbmQgbm90IGFyZ3MucmVjdXJzZVxuICAgICAgICBsb2cgcmVzZXRcbiAgICBlbHNlXG4gICAgICAgIHMgPSBjb2xvcnNbJ19hcnJvdyddICsgXCLilrpcIiArIGNvbG9yc1snX2hlYWRlciddWzBdICsgXCIgXCJcbiAgICAgICAgcHMgPSBzbGFzaC5yZXNvbHZlKHBzKSBpZiBwc1swXSAhPSAnfidcbiAgICAgICAgaWYgX3Muc3RhcnRzV2l0aChwcywgcHJvY2Vzcy5lbnYuUFdEKVxuICAgICAgICAgICAgcHMgPSBcIi4vXCIgKyBwcy5zdWJzdHIocHJvY2Vzcy5lbnYuUFdELmxlbmd0aClcbiAgICAgICAgZWxzZSBpZiBfcy5zdGFydHNXaXRoKHAsIHByb2Nlc3MuZW52LkhPTUUpXG4gICAgICAgICAgICBwcyA9IFwiflwiICsgcC5zdWJzdHIocHJvY2Vzcy5lbnYuSE9NRS5sZW5ndGgpXG5cbiAgICAgICAgaWYgcHMgPT0gJy8nXG4gICAgICAgICAgICBzICs9ICcvJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzcCA9IHBzLnNwbGl0KCcvJylcbiAgICAgICAgICAgIHMgKz0gY29sb3JzWydfaGVhZGVyJ11bMF0gKyBzcC5zaGlmdCgpXG4gICAgICAgICAgICB3aGlsZSBzcC5sZW5ndGhcbiAgICAgICAgICAgICAgICBwbiA9IHNwLnNoaWZ0KClcbiAgICAgICAgICAgICAgICBpZiBwblxuICAgICAgICAgICAgICAgICAgICBzICs9IGNvbG9yc1snX2hlYWRlciddWzFdICsgJy8nXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gY29sb3JzWydfaGVhZGVyJ11bc3AubGVuZ3RoID09IDAgYW5kIDIgb3IgMF0gKyBwblxuICAgICAgICBsb2cgcmVzZXRcbiAgICAgICAgbG9nIHMgKyBcIiBcIiArIHJlc2V0XG4gICAgICAgIGxvZyByZXNldFxuXG4gICAgaWYgZmlsZXMubGVuZ3RoXG4gICAgICAgIGxpc3RGaWxlcyhwLCBmaWxlcylcblxuICAgIGlmIGFyZ3MucmVjdXJzZVxuICAgICAgICBmb3IgcHIgaW4gZnMucmVhZGRpclN5bmMocCkuZmlsdGVyKCAoZikgLT4gZnMubHN0YXRTeW5jKHNsYXNoLmpvaW4ocCxmKSkuaXNEaXJlY3RvcnkoKSApXG4gICAgICAgICAgICBsaXN0RGlyKHNsYXNoLnJlc29sdmUoc2xhc2guam9pbihwLCBwcikpKVxuXG4jIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcblxucGF0aHN0YXRzID0gYXJncy5wYXRocy5tYXAgKGYpIC0+XG4gICAgdHJ5XG4gICAgICAgIFtmLCBmcy5zdGF0U3luYyhmKV1cbiAgICBjYXRjaCBlcnJvclxuICAgICAgICBsb2dfZXJyb3IgJ25vIHN1Y2ggZmlsZTogJywgZlxuICAgICAgICBbXVxuXG5maWxlc3RhdHMgPSBwYXRoc3RhdHMuZmlsdGVyKCAoZikgLT4gZi5sZW5ndGggYW5kIG5vdCBmWzFdLmlzRGlyZWN0b3J5KCkgKVxuaWYgZmlsZXN0YXRzLmxlbmd0aCA+IDBcbiAgICBsb2cgcmVzZXRcbiAgICBsaXN0RmlsZXMgcHJvY2Vzcy5jd2QoKSwgZmlsZXN0YXRzLm1hcCggKHMpIC0+IHNbMF0gKVxuXG5mb3IgcCBpbiBwYXRoc3RhdHMuZmlsdGVyKCAoZikgLT4gZi5sZW5ndGggYW5kIGZbMV0uaXNEaXJlY3RvcnkoKSApXG4gICAgbGlzdERpciBwWzBdXG5cbmxvZyBcIlwiXG5pZiBhcmdzLnN0YXRzXG4gICAgc3ByaW50ZiA9IHJlcXVpcmUoXCJzcHJpbnRmLWpzXCIpLnNwcmludGZcbiAgICBsb2cgQlcoMSkgKyBcIiBcIiArXG4gICAgZncoOCkgKyBzdGF0cy5udW1fZGlycyArIChzdGF0cy5oaWRkZW5fZGlycyBhbmQgZncoNCkgKyBcIitcIiArIGZ3KDUpICsgKHN0YXRzLmhpZGRlbl9kaXJzKSBvciBcIlwiKSArIGZ3KDQpICsgXCIgZGlycyBcIiArXG4gICAgZncoOCkgKyBzdGF0cy5udW1fZmlsZXMgKyAoc3RhdHMuaGlkZGVuX2ZpbGVzIGFuZCBmdyg0KSArIFwiK1wiICsgZncoNSkgKyAoc3RhdHMuaGlkZGVuX2ZpbGVzKSBvciBcIlwiKSArIGZ3KDQpICsgXCIgZmlsZXMgXCIgK1xuICAgIGZ3KDgpICsgc3ByaW50ZihcIiUyLjFmXCIsIHByb2YoJ2VuZCcsICdscycpKSArIGZ3KDQpICsgXCIgbXNcIiArIFwiIFwiICtcbiAgICByZXNldFxuIl19
//# sourceURL=../coffee/color-ls.coffee