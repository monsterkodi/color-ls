(function() {
  /*
   0000000   0000000   000       0000000   00000000           000       0000000
  000       000   000  000      000   000  000   000          000      000
  000       000   000  000      000   000  0000000    000000  000      0000000
  000       000   000  000      000   000  000   000          000           000
   0000000   0000000   0000000   0000000   000   000          0000000  0000000
  */
  var BG, BW, _, _s, ansi, args, bold, childp, colors, dirString, dotString, extString, fg, filestats, filter, fs, fw, groupMap, groupName, groupname, j, karg, len, linkString, listDir, listFiles, log, log_error, moment, nameString, ownerName, ownerString, p, pathstats, prof, ref, ref1, reset, rightsString, rwxString, since, sizeString, slash, sort, sprintf, start, stats, timeString, token, userMap, username, util,
    indexOf = [].indexOf;

  ({childp, slash, karg, fs, _} = require('kxk'));

  log = console.log;

  ansi = require('ansi-256-colors');

  util = require('util');

  _s = require('underscore.string');

  moment = require('moment');

  // 00000000   00000000    0000000   00000000
  // 000   000  000   000  000   000  000
  // 00000000   0000000    000   000  000000
  // 000        000   000  000   000  000
  // 000        000   000   0000000   000
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

  // colors
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

  stats = { // counters for (hidden) dirs/files
    num_dirs: 0,
    num_files: 0,
    hidden_dirs: 0,
    hidden_files: 0,
    maxOwnerLength: 0,
    maxGroupLength: 0,
    brokenLinks: []
  };

  //  0000000   00000000    0000000    0000000
  // 000   000  000   000  000        000
  // 000000000  0000000    000  0000  0000000
  // 000   000  000   000  000   000       000
  // 000   000  000   000   0000000   0000000
  args = karg(`color-ls\n    paths         . ? the file(s) and/or folder(s) to display . **\n    bytes         . ? include size                    . = false\n    mdate         . ? include modification date       . = false\n    long          . ? include size and date           . = false\n    owner         . ? include owner and group         . = false\n    rights        . ? include rights                  . = false\n    all           . ? show dot files                  . = false\n    dirs          . ? show only dirs                  . = false\n    files         . ? show only files                 . = false\n    size          . ? sort by size                    . = false\n    time          . ? sort by time                    . = false\n    kind          . ? sort by kind                    . = false\n    pretty        . ? pretty size and date            . = true\n    stats         . ? show statistics                 . = false . - i\n    recurse       . ? recurse into subdirs            . = false . - R\n    find          . ? filter with a regexp                      . - F\n    alphabetical  . ! don't group dirs before files   . = false . - A\n\nversion      ${(require(`${__dirname}/../package.json`).version)}`);

  if (args.size) {
    args.files = true;
  }

  if (args.long) {
    args.bytes = true;
    args.mdate = true;
  }

  if (!(((ref = args.paths) != null ? ref.length : void 0) > 0)) {
    args.paths = ['.'];
  }

  //  0000000   0000000   000       0000000   00000000    0000000
  // 000       000   000  000      000   000  000   000  000
  // 000       000   000  000      000   000  0000000    0000000
  // 000       000   000  000      000   000  000   000       000
  //  0000000   0000000   0000000   0000000   000   000  0000000
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
      default: fg(1, 0, 1)
    },
    '_groups': {
      wheel: fg(1, 0, 0),
      staff: fg(0, 1, 0),
      admin: fg(1, 1, 0),
      default: fg(1, 0, 1)
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
        userMap[uid] = childp.spawnSync("id", ["-un", `${uid}`]).stdout.toString('utf8').trim();
      } catch (error1) {
        e = error1;
        log(e);
      }
    }
    return userMap[uid];
  };

  groupMap = null;

  groupname = function(gid) {
    var e, gids, gnms, i, j, ref1;
    if (!groupMap) {
      try {
        gids = childp.spawnSync("id", ["-G"]).stdout.toString('utf8').split(' ');
        gnms = childp.spawnSync("id", ["-Gn"]).stdout.toString('utf8').split(' ');
        groupMap = {};
        for (i = j = 0, ref1 = gids.length; (0 <= ref1 ? j < ref1 : j > ref1); i = 0 <= ref1 ? ++j : --j) {
          groupMap[gids[i]] = gnms[i];
        }
      } catch (error1) {
        e = error1;
        log(e);
      }
    }
    return groupMap[gid];
  };

  if (_.isFunction(process.getuid)) {
    colors['_users'][username(process.getuid())] = fg(0, 4, 0);
  }

  // 00000000   00000000   000  000   000  000000000
  // 000   000  000   000  000  0000  000     000
  // 00000000   0000000    000  000 0 000     000
  // 000        000   000  000  000  0000     000
  // 000        000   000  000  000   000     000
  log_error = function() {
    return log(" " + colors['_error'][0] + " " + bold + arguments[0] + (arguments.length > 1 && (colors['_error'][1] + [].slice.call(arguments).slice(1).join(' ')) || '') + " " + reset);
  };

  linkString = function(file) {
    return reset + fw(1) + colors['_link']['arrow'] + " ► " + colors['_link'][(indexOf.call(stats.brokenLinks, file) >= 0) && 'broken' || 'path'] + slash.path(fs.readlinkSync(file));
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
    return (((mode >> (i * 3)) & 0b100) && colors['_rights']['r+'] + ' r' || colors['_rights']['r-'] + '  ') + (((mode >> (i * 3)) & 0b010) && colors['_rights']['w+'] + ' w' || colors['_rights']['w-'] + '  ') + (((mode >> (i * 3)) & 0b001) && colors['_rights']['x+'] + ' x' || colors['_rights']['x-'] + '  ');
  };

  rightsString = function(stat) {
    var gr, ro, ur;
    ur = rwxString(stat.mode, 2) + " ";
    gr = rwxString(stat.mode, 1) + " ";
    ro = rwxString(stat.mode, 0) + " ";
    return ur + gr + ro + reset;
  };

  //  0000000   0000000   00000000   000000000
  // 000       000   000  000   000     000
  // 0000000   000   000  0000000       000
  //      000  000   000  000   000     000
  // 0000000    0000000   000   000     000
  sort = function(list, stats, exts = []) {
    var l, ref1, ref2;
    l = _.zip(list, stats, (function() {
      var results = [];
      for (var j = 0, ref1 = list.length; 0 <= ref1 ? j < ref1 : j > ref1; 0 <= ref1 ? j++ : j--){ results.push(j); }
      return results;
    }).apply(this), exts.length > 0 && exts || (function() {
      var results = [];
      for (var j = 0, ref2 = list.length; 0 <= ref2 ? j < ref2 : j > ref2; 0 <= ref2 ? j++ : j--){ results.push(j); }
      return results;
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

  
  // 00000000  000  000      00000000   0000000
  // 000       000  000      000       000
  // 000000    000  000      0000000   0000000
  // 000       000  000      000            000
  // 000       000  0000000  00000000  0000000
  listFiles = function(p, files) {
    var alph, d, dirs, dsts, exts, f, fils, fsts, j, k, len, len1, len2, n, results, results1;
    if (args.alphabetical) {
      alph = [];
    }
    dirs = []; // visible dirs
    fils = []; // visible files
    dsts = []; // dir stats
    fsts = []; // file stats
    exts = []; // file extensions
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
            return stats.hidden_dirs += 1; // if path is file
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
        results.push(log(p));
      }
      return results;
    } else {
      for (k = 0, len1 = dirs.length; k < len1; k++) {
        d = dirs[k];
        log(d);
      }
      results1 = [];
      for (n = 0, len2 = fils.length; n < len2; n++) {
        f = fils[n];
        results1.push(log(f));
      }
      return results1;
    }
  };

  // 0000000    000  00000000
  // 000   000  000  000   000
  // 000   000  000  0000000
  // 000   000  000  000   000
  // 0000000    000  000   000
  listDir = function(p) {
    var error, files, j, len, msg, pn, pr, ps, ref1, results, s, sp;
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
      log(reset);
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
      log(reset);
      log(s + " " + reset);
      log(reset);
    }
    if (files.length) {
      listFiles(p, files);
    }
    if (args.recurse) {
      ref1 = fs.readdirSync(p).filter(function(f) {
        return fs.lstatSync(slash.join(p, f)).isDirectory();
      });
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        pr = ref1[j];
        results.push(listDir(slash.resolve(slash.join(p, pr))));
      }
      return results;
    }
  };

  // 00     00   0000000   000  000   000
  // 000   000  000   000  000  0000  000
  // 000000000  000000000  000  000 0 000
  // 000 0 000  000   000  000  000  0000
  // 000   000  000   000  000  000   000
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
    log(reset);
    listFiles(process.cwd(), filestats.map(function(s) {
      return s[0];
    }));
  }

  ref1 = pathstats.filter(function(f) {
    return f.length && f[1].isDirectory();
  });
  for (j = 0, len = ref1.length; j < len; j++) {
    p = ref1[j];
    listDir(p[0]);
  }

  log("");

  if (args.stats) {
    sprintf = require("sprintf-js").sprintf;
    log(BW(1) + " " + fw(8) + stats.num_dirs + (stats.hidden_dirs && fw(4) + "+" + fw(5) + stats.hidden_dirs || "") + fw(4) + " dirs " + fw(8) + stats.num_files + (stats.hidden_files && fw(4) + "+" + fw(5) + stats.hidden_files || "") + fw(4) + " files " + fw(8) + sprintf("%2.1f", prof('end', 'ls')) + fw(4) + " ms" + " " + reset);
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItbHMuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzIjpbImNvZmZlZS9jb2xvci1scy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsRUFBQSxFQUFBLFNBQUEsRUFBQSxNQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxRQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxDQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxVQUFBLEVBQUEsT0FBQSxFQUFBLFNBQUEsRUFBQSxHQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxDQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxZQUFBLEVBQUEsU0FBQSxFQUFBLEtBQUEsRUFBQSxVQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxVQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUEsSUFBQTtJQUFBOztFQVFBLENBQUEsQ0FBRSxNQUFGLEVBQVUsS0FBVixFQUFpQixJQUFqQixFQUF1QixFQUF2QixFQUEyQixDQUEzQixDQUFBLEdBQWlDLE9BQUEsQ0FBUSxLQUFSLENBQWpDOztFQUVBLEdBQUEsR0FBUyxPQUFPLENBQUM7O0VBQ2pCLElBQUEsR0FBUyxPQUFBLENBQVEsaUJBQVI7O0VBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUNULEVBQUEsR0FBUyxPQUFBLENBQVEsbUJBQVI7O0VBQ1QsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLEVBZFQ7Ozs7Ozs7RUFzQkEsS0FBQSxHQUFROztFQUNSLEtBQUEsR0FBUSxDQUFBOztFQUVSLEtBQUEsR0FBUSxRQUFBLENBQUMsQ0FBRCxDQUFBO0FBQ04sUUFBQTtJQUFBLElBQUEsR0FBTyxPQUFPLENBQUMsTUFBUixDQUFlLEtBQU0sQ0FBQSxDQUFBLENBQXJCO1dBQ1AsSUFBSyxDQUFBLENBQUEsQ0FBTCxHQUFVLElBQVYsR0FBaUIsSUFBSyxDQUFBLENBQUEsQ0FBTCxHQUFVO0VBRnJCOztFQUlSLElBQUEsR0FBTyxRQUFBLENBQUEsQ0FBQTtBQUNILFFBQUEsR0FBQSxFQUFBO0lBQUEsSUFBRyxTQUFTLENBQUMsTUFBVixLQUFvQixDQUF2QjtNQUNJLEdBQUEsR0FBTSxTQUFVLENBQUEsQ0FBQTtNQUNoQixDQUFBLEdBQUksU0FBVSxDQUFBLENBQUEsRUFGbEI7S0FBQSxNQUdLLElBQUcsU0FBUyxDQUFDLE1BQVYsS0FBb0IsQ0FBdkI7TUFDRCxDQUFBLEdBQUksU0FBVSxDQUFBLENBQUE7TUFDZCxHQUFBLEdBQU0sUUFGTDs7SUFJTCxLQUFBLEdBQVEsT0FBTyxDQUFDLE1BQVIsQ0FBQTtJQUNSLElBQUcsR0FBQSxLQUFPLE9BQVY7YUFDSSxLQUFNLENBQUEsQ0FBQSxDQUFOLEdBQVcsTUFEZjtLQUFBLE1BRUssSUFBRyxHQUFBLEtBQU8sS0FBVjthQUNELEtBQUEsQ0FBTSxDQUFOLEVBREM7O0VBWEY7O0VBY1AsSUFBQSxDQUFLLE9BQUwsRUFBYyxJQUFkLEVBM0NBOzs7RUE4Q0EsSUFBQSxHQUFTOztFQUNULEtBQUEsR0FBUyxJQUFJLENBQUM7O0VBQ2QsRUFBQSxHQUFTLElBQUksQ0FBQyxFQUFFLENBQUM7O0VBQ2pCLEVBQUEsR0FBUyxJQUFJLENBQUMsRUFBRSxDQUFDOztFQUNqQixFQUFBLEdBQVMsUUFBQSxDQUFDLENBQUQsQ0FBQTtXQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBVSxDQUFBLENBQUE7RUFBekI7O0VBQ1QsRUFBQSxHQUFTLFFBQUEsQ0FBQyxDQUFELENBQUE7V0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVUsQ0FBQSxDQUFBO0VBQXpCOztFQUVULEtBQUEsR0FDSSxDQUFBO0lBQUEsUUFBQSxFQUFnQixDQUFoQjtJQUNBLFNBQUEsRUFBZ0IsQ0FEaEI7SUFFQSxXQUFBLEVBQWdCLENBRmhCO0lBR0EsWUFBQSxFQUFnQixDQUhoQjtJQUlBLGNBQUEsRUFBZ0IsQ0FKaEI7SUFLQSxjQUFBLEVBQWdCLENBTGhCO0lBTUEsV0FBQSxFQUFnQjtFQU5oQixFQXRESjs7Ozs7OztFQW9FQSxJQUFBLEdBQU8sSUFBQSxDQUFLLENBQUEsb29DQUFBLENBQUEsQ0FvQkUsQ0FBQyxPQUFBLENBQVEsQ0FBQSxDQUFBLENBQUcsU0FBSCxDQUFhLGdCQUFiLENBQVIsQ0FBdUMsQ0FBQyxPQUF6QyxDQXBCRixDQUFBLENBQUw7O0VBdUJQLElBQUcsSUFBSSxDQUFDLElBQVI7SUFDSSxJQUFJLENBQUMsS0FBTCxHQUFhLEtBRGpCOzs7RUFHQSxJQUFHLElBQUksQ0FBQyxJQUFSO0lBQ0ksSUFBSSxDQUFDLEtBQUwsR0FBYTtJQUNiLElBQUksQ0FBQyxLQUFMLEdBQWEsS0FGakI7OztFQUlBLElBQUEsQ0FBQSxrQ0FBb0MsQ0FBRSxnQkFBWixHQUFxQixDQUEvQyxDQUFBO0lBQUEsSUFBSSxDQUFDLEtBQUwsR0FBYSxDQUFDLEdBQUQsRUFBYjtHQWxHQTs7Ozs7OztFQTBHQSxNQUFBLEdBQ0k7SUFBQSxRQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE5QixDQUFaO0lBQ0EsSUFBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FEWjtJQUVBLElBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBRlo7SUFHQSxNQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE5QixDQUhaO0lBSUEsTUFBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FKWjtJQUtBLE1BQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBTFo7SUFNQSxPQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE5QixDQU5aO0lBT0EsSUFBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FQWjtJQVFBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE5QixDQVJaO0lBU0EsR0FBQSxFQUFZLENBQU8sRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUIsQ0FUWjtJQVVBLEtBQUEsRUFBWSxDQUFPLEVBQUEsQ0FBRyxDQUFILENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsQ0FBOUIsQ0FWWjtJQVdBLEtBQUEsRUFBWSxDQUFPLEVBQUEsQ0FBRyxDQUFILENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsQ0FBOUIsQ0FYWjtJQVlBLEtBQUEsRUFBWSxDQUFPLEVBQUEsQ0FBRyxDQUFILENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsQ0FBOUIsQ0FaWjtJQWFBLEtBQUEsRUFBWSxDQUFPLEVBQUEsQ0FBRyxFQUFILENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsQ0FBbkIsRUFBOEIsRUFBQSxDQUFHLENBQUgsQ0FBOUIsQ0FiWjtJQWNBLElBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsRUFBSCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILENBQTlCLENBZFo7SUFlQSxVQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLEVBQUgsQ0FBUCxFQUFtQixFQUFBLENBQUcsQ0FBSCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxDQUE5QixDQWZaO0lBZ0JBLElBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBaEJaO0lBaUJBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBakJaO0lBa0JBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBbEJaO0lBbUJBLEtBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBbkJaO0lBb0JBLE1BQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVAsRUFBbUIsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFuQixFQUE4QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQTlCLENBcEJaOztJQXNCQSxVQUFBLEVBQVksQ0FBTyxFQUFBLENBQUcsRUFBSCxDQUFQLEVBQW1CLEVBQUEsQ0FBRyxDQUFILENBQW5CLEVBQThCLEVBQUEsQ0FBRyxDQUFILENBQTlCLENBdEJaO0lBdUJBLE1BQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQUwsR0FBZSxFQUFBLENBQUcsRUFBSCxDQUFqQixFQUF5QixFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQXpCLEVBQW9DLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBcEMsQ0F2Qlo7SUF3QkEsT0FBQSxFQUFZLENBQUUsSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBTCxHQUFlLEVBQUEsQ0FBRyxFQUFILENBQWpCLEVBQXlCLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQUwsR0FBZSxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQXhDLEVBQW1ELElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQUwsR0FBZSxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQWxFLENBeEJaO0lBeUJBLE9BQUEsRUFBWTtNQUFFLE9BQUEsRUFBUyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVg7TUFBc0IsTUFBQSxFQUFRLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBOUI7TUFBeUMsUUFBQSxFQUFVLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBQSxHQUFVLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVA7SUFBN0QsQ0F6Qlo7SUEwQkEsUUFBQSxFQUFjLEVBQUEsQ0FBRyxDQUFILENBMUJkO0lBMkJBLFNBQUEsRUFBWSxDQUFFLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxDQUFMLEdBQVcsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFiLEVBQXlCLEVBQUEsQ0FBRyxDQUFILENBQXpCLEVBQWdDLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxDQUFMLEdBQVcsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUEzQyxDQTNCWjs7SUE2QkEsT0FBQSxFQUFZO01BQUUsQ0FBQSxFQUFHLENBQUMsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFELENBQUw7TUFBa0IsRUFBQSxFQUFJLENBQUMsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFELEVBQVksRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFaLENBQXRCO01BQThDLEVBQUEsRUFBSSxDQUFDLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBRCxFQUFZLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBWixDQUFsRDtNQUEwRSxFQUFBLEVBQUksQ0FBQyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQUQsRUFBWSxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVosQ0FBOUU7TUFBc0csRUFBQSxFQUFJLENBQUMsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFELEVBQVksRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFaO0lBQTFHLENBN0JaO0lBOEJBLFFBQUEsRUFBWTtNQUFFLElBQUEsRUFBTyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQVQ7TUFBb0IsT0FBQSxFQUFTLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVA7SUFBN0IsQ0E5Qlo7SUErQkEsU0FBQSxFQUFZO01BQUUsS0FBQSxFQUFPLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FBVDtNQUFvQixLQUFBLEVBQU8sRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUEzQjtNQUFzQyxLQUFBLEVBQU8sRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUE3QztNQUF3RCxPQUFBLEVBQVMsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUDtJQUFqRSxDQS9CWjtJQWdDQSxRQUFBLEVBQVksQ0FBRSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFMLEdBQWUsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFqQixFQUE0QixJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUFMLEdBQWUsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUEzQyxDQWhDWjtJQWlDQSxTQUFBLEVBQ2M7TUFBQSxJQUFBLEVBQU0sSUFBQSxHQUFLLEVBQUEsQ0FBRyxDQUFILENBQUwsR0FBVyxFQUFBLENBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQLENBQWpCO01BQ0EsSUFBQSxFQUFNLEtBQUEsR0FBTSxFQUFBLENBQUcsQ0FBSCxDQURaO01BRUEsSUFBQSxFQUFNLElBQUEsR0FBSyxFQUFBLENBQUcsQ0FBSCxDQUFMLEdBQVcsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxDQUZqQjtNQUdBLElBQUEsRUFBTSxLQUFBLEdBQU0sRUFBQSxDQUFHLENBQUgsQ0FIWjtNQUlBLElBQUEsRUFBTSxJQUFBLEdBQUssRUFBQSxDQUFHLENBQUgsQ0FBTCxHQUFXLEVBQUEsQ0FBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsQ0FKakI7TUFLQSxJQUFBLEVBQU0sS0FBQSxHQUFNLEVBQUEsQ0FBRyxDQUFIO0lBTFo7RUFsQ2Q7O0VBeUNKLE9BQUEsR0FBVSxDQUFBOztFQUNWLFFBQUEsR0FBVyxRQUFBLENBQUMsR0FBRCxDQUFBO0FBQ1AsUUFBQTtJQUFBLElBQUcsQ0FBSSxPQUFRLENBQUEsR0FBQSxDQUFmO0FBQ0k7UUFDSSxPQUFRLENBQUEsR0FBQSxDQUFSLEdBQWUsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsSUFBakIsRUFBdUIsQ0FBQyxLQUFELEVBQVEsQ0FBQSxDQUFBLENBQUcsR0FBSCxDQUFBLENBQVIsQ0FBdkIsQ0FBeUMsQ0FBQyxNQUFNLENBQUMsUUFBakQsQ0FBMEQsTUFBMUQsQ0FBaUUsQ0FBQyxJQUFsRSxDQUFBLEVBRG5CO09BQUEsY0FBQTtRQUVNO1FBQ0YsR0FBQSxDQUFJLENBQUosRUFISjtPQURKOztXQUtBLE9BQVEsQ0FBQSxHQUFBO0VBTkQ7O0VBUVgsUUFBQSxHQUFXOztFQUNYLFNBQUEsR0FBWSxRQUFBLENBQUMsR0FBRCxDQUFBO0FBQ1IsUUFBQSxDQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBO0lBQUEsSUFBRyxDQUFJLFFBQVA7QUFDSTtRQUNJLElBQUEsR0FBTyxNQUFNLENBQUMsU0FBUCxDQUFpQixJQUFqQixFQUF1QixDQUFDLElBQUQsQ0FBdkIsQ0FBOEIsQ0FBQyxNQUFNLENBQUMsUUFBdEMsQ0FBK0MsTUFBL0MsQ0FBc0QsQ0FBQyxLQUF2RCxDQUE2RCxHQUE3RDtRQUNQLElBQUEsR0FBTyxNQUFNLENBQUMsU0FBUCxDQUFpQixJQUFqQixFQUF1QixDQUFDLEtBQUQsQ0FBdkIsQ0FBK0IsQ0FBQyxNQUFNLENBQUMsUUFBdkMsQ0FBZ0QsTUFBaEQsQ0FBdUQsQ0FBQyxLQUF4RCxDQUE4RCxHQUE5RDtRQUNQLFFBQUEsR0FBVyxDQUFBO1FBQ1gsS0FBUywyRkFBVDtVQUNJLFFBQVMsQ0FBQSxJQUFLLENBQUEsQ0FBQSxDQUFMLENBQVQsR0FBb0IsSUFBSyxDQUFBLENBQUE7UUFEN0IsQ0FKSjtPQUFBLGNBQUE7UUFNTTtRQUNGLEdBQUEsQ0FBSSxDQUFKLEVBUEo7T0FESjs7V0FTQSxRQUFTLENBQUEsR0FBQTtFQVZEOztFQVlaLElBQUcsQ0FBQyxDQUFDLFVBQUYsQ0FBYSxPQUFPLENBQUMsTUFBckIsQ0FBSDtJQUNJLE1BQU8sQ0FBQSxRQUFBLENBQVUsQ0FBQSxRQUFBLENBQVMsT0FBTyxDQUFDLE1BQVIsQ0FBQSxDQUFULENBQUEsQ0FBakIsR0FBK0MsRUFBQSxDQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUCxFQURuRDtHQTFLQTs7Ozs7OztFQW1MQSxTQUFBLEdBQVksUUFBQSxDQUFBLENBQUE7V0FDUixHQUFBLENBQUksR0FBQSxHQUFNLE1BQU8sQ0FBQSxRQUFBLENBQVUsQ0FBQSxDQUFBLENBQXZCLEdBQTRCLEdBQTVCLEdBQWtDLElBQWxDLEdBQXlDLFNBQVUsQ0FBQSxDQUFBLENBQW5ELEdBQXdELENBQUMsU0FBUyxDQUFDLE1BQVYsR0FBbUIsQ0FBbkIsSUFBeUIsQ0FBQyxNQUFPLENBQUEsUUFBQSxDQUFVLENBQUEsQ0FBQSxDQUFqQixHQUFzQixFQUFFLENBQUMsS0FBSyxDQUFDLElBQVQsQ0FBYyxTQUFkLENBQXdCLENBQUMsS0FBekIsQ0FBK0IsQ0FBL0IsQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxHQUF2QyxDQUF2QixDQUF6QixJQUFnRyxFQUFqRyxDQUF4RCxHQUErSixHQUEvSixHQUFxSyxLQUF6SztFQURROztFQUdaLFVBQUEsR0FBYSxRQUFBLENBQUMsSUFBRCxDQUFBO1dBQWUsS0FBQSxHQUFRLEVBQUEsQ0FBRyxDQUFILENBQVIsR0FBZ0IsTUFBTyxDQUFBLE9BQUEsQ0FBUyxDQUFBLE9BQUEsQ0FBaEMsR0FBMkMsS0FBM0MsR0FBbUQsTUFBTyxDQUFBLE9BQUEsQ0FBUyxDQUFBLENBQUMsYUFBUSxLQUFLLENBQUMsV0FBZCxFQUFBLElBQUEsTUFBRCxDQUFBLElBQWdDLFFBQWhDLElBQTRDLE1BQTVDLENBQW5FLEdBQXlILEtBQUssQ0FBQyxJQUFOLENBQVcsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsSUFBaEIsQ0FBWDtFQUF4STs7RUFDYixVQUFBLEdBQWEsUUFBQSxDQUFDLElBQUQsRUFBTyxHQUFQLENBQUE7V0FBZSxHQUFBLEdBQU0sTUFBTyxDQUFBLHFCQUFBLElBQWlCLEdBQWpCLElBQXdCLFVBQXhCLENBQW9DLENBQUEsQ0FBQSxDQUFqRCxHQUFzRCxJQUF0RCxHQUE2RDtFQUE1RTs7RUFDYixTQUFBLEdBQWEsUUFBQSxDQUFPLEdBQVAsQ0FBQTtXQUFlLE1BQU8sQ0FBQSxxQkFBQSxJQUFpQixHQUFqQixJQUF3QixVQUF4QixDQUFvQyxDQUFBLENBQUEsQ0FBM0MsR0FBZ0QsR0FBaEQsR0FBc0Q7RUFBckU7O0VBQ2IsU0FBQSxHQUFhLFFBQUEsQ0FBTyxHQUFQLENBQUE7V0FBZSxTQUFBLENBQVUsR0FBVixDQUFBLEdBQWlCLE1BQU8sQ0FBQSxxQkFBQSxJQUFpQixHQUFqQixJQUF3QixVQUF4QixDQUFvQyxDQUFBLENBQUEsQ0FBNUQsR0FBaUUsR0FBakUsR0FBdUU7RUFBdEY7O0VBQ2IsU0FBQSxHQUFhLFFBQUEsQ0FBQyxJQUFELEVBQU8sR0FBUCxDQUFBO0FBQ1QsUUFBQTtJQUFBLENBQUEsR0FBSSxJQUFBLElBQVMsTUFBVCxJQUFtQjtXQUN2QixNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFWLEdBQWUsQ0FBQyxJQUFBLElBQVMsQ0FBQyxHQUFBLEdBQU0sSUFBUCxDQUFULElBQXlCLEVBQTFCLENBQWYsR0FBK0MsQ0FBSSxHQUFILEdBQVksTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBVixHQUFlLEdBQWYsR0FBcUIsTUFBTyxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBL0IsR0FBb0MsR0FBaEQsR0FBeUQsRUFBMUQsQ0FBL0MsR0FBK0c7RUFGdEc7O0VBSWIsVUFBQSxHQUFhLFFBQUEsQ0FBQyxJQUFELENBQUE7SUFDVCxJQUFHLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBZjthQUNJLE1BQU8sQ0FBQSxPQUFBLENBQVMsQ0FBQSxHQUFBLENBQUssQ0FBQSxDQUFBLENBQXJCLEdBQTBCLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBSSxDQUFDLElBQWIsRUFBbUIsRUFBbkIsQ0FBMUIsR0FBbUQsSUFEdkQ7S0FBQSxNQUVLLElBQUcsSUFBSSxDQUFDLElBQUwsR0FBWSxPQUFmO01BQ0QsSUFBRyxJQUFJLENBQUMsTUFBUjtlQUNJLE1BQU8sQ0FBQSxPQUFBLENBQVMsQ0FBQSxJQUFBLENBQU0sQ0FBQSxDQUFBLENBQXRCLEdBQTJCLEVBQUUsQ0FBQyxJQUFILENBQVEsQ0FBQyxJQUFJLENBQUMsSUFBTCxHQUFZLElBQWIsQ0FBa0IsQ0FBQyxPQUFuQixDQUEyQixDQUEzQixDQUFSLEVBQXVDLENBQXZDLENBQTNCLEdBQXVFLEdBQXZFLEdBQTZFLE1BQU8sQ0FBQSxPQUFBLENBQVMsQ0FBQSxJQUFBLENBQU0sQ0FBQSxDQUFBLENBQW5HLEdBQXdHLE1BRDVHO09BQUEsTUFBQTtlQUdJLE1BQU8sQ0FBQSxPQUFBLENBQVMsQ0FBQSxJQUFBLENBQU0sQ0FBQSxDQUFBLENBQXRCLEdBQTJCLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBSSxDQUFDLElBQWIsRUFBbUIsRUFBbkIsQ0FBM0IsR0FBb0QsSUFIeEQ7T0FEQztLQUFBLE1BS0EsSUFBRyxJQUFJLENBQUMsSUFBTCxHQUFZLFVBQWY7TUFDRCxJQUFHLElBQUksQ0FBQyxNQUFSO2VBQ0ksTUFBTyxDQUFBLE9BQUEsQ0FBUyxDQUFBLElBQUEsQ0FBTSxDQUFBLENBQUEsQ0FBdEIsR0FBMkIsRUFBRSxDQUFDLElBQUgsQ0FBUSxDQUFDLElBQUksQ0FBQyxJQUFMLEdBQVksT0FBYixDQUFxQixDQUFDLE9BQXRCLENBQThCLENBQTlCLENBQVIsRUFBMEMsQ0FBMUMsQ0FBM0IsR0FBMEUsR0FBMUUsR0FBZ0YsTUFBTyxDQUFBLE9BQUEsQ0FBUyxDQUFBLElBQUEsQ0FBTSxDQUFBLENBQUEsQ0FBdEcsR0FBMkcsTUFEL0c7T0FBQSxNQUFBO2VBR0ksTUFBTyxDQUFBLE9BQUEsQ0FBUyxDQUFBLElBQUEsQ0FBTSxDQUFBLENBQUEsQ0FBdEIsR0FBMkIsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFJLENBQUMsSUFBYixFQUFtQixFQUFuQixDQUEzQixHQUFvRCxJQUh4RDtPQURDO0tBQUEsTUFLQSxJQUFHLElBQUksQ0FBQyxJQUFMLEdBQVksYUFBZjtNQUNELElBQUcsSUFBSSxDQUFDLE1BQVI7ZUFDSSxNQUFPLENBQUEsT0FBQSxDQUFTLENBQUEsSUFBQSxDQUFNLENBQUEsQ0FBQSxDQUF0QixHQUEyQixFQUFFLENBQUMsSUFBSCxDQUFRLENBQUMsSUFBSSxDQUFDLElBQUwsR0FBWSxVQUFiLENBQXdCLENBQUMsT0FBekIsQ0FBaUMsQ0FBakMsQ0FBUixFQUE2QyxDQUE3QyxDQUEzQixHQUE2RSxHQUE3RSxHQUFtRixNQUFPLENBQUEsT0FBQSxDQUFTLENBQUEsSUFBQSxDQUFNLENBQUEsQ0FBQSxDQUF6RyxHQUE4RyxNQURsSDtPQUFBLE1BQUE7ZUFHSSxNQUFPLENBQUEsT0FBQSxDQUFTLENBQUEsSUFBQSxDQUFNLENBQUEsQ0FBQSxDQUF0QixHQUEyQixFQUFFLENBQUMsSUFBSCxDQUFRLElBQUksQ0FBQyxJQUFiLEVBQW1CLEVBQW5CLENBQTNCLEdBQW9ELElBSHhEO09BREM7S0FBQSxNQUFBO01BTUQsSUFBRyxJQUFJLENBQUMsTUFBUjtlQUNJLE1BQU8sQ0FBQSxPQUFBLENBQVMsQ0FBQSxJQUFBLENBQU0sQ0FBQSxDQUFBLENBQXRCLEdBQTJCLEVBQUUsQ0FBQyxJQUFILENBQVEsQ0FBQyxJQUFJLENBQUMsSUFBTCxHQUFZLGFBQWIsQ0FBMkIsQ0FBQyxPQUE1QixDQUFvQyxDQUFwQyxDQUFSLEVBQWdELENBQWhELENBQTNCLEdBQWdGLEdBQWhGLEdBQXNGLE1BQU8sQ0FBQSxPQUFBLENBQVMsQ0FBQSxJQUFBLENBQU0sQ0FBQSxDQUFBLENBQTVHLEdBQWlILE1BRHJIO09BQUEsTUFBQTtlQUdJLE1BQU8sQ0FBQSxPQUFBLENBQVMsQ0FBQSxJQUFBLENBQU0sQ0FBQSxDQUFBLENBQXRCLEdBQTJCLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBSSxDQUFDLElBQWIsRUFBbUIsRUFBbkIsQ0FBM0IsR0FBb0QsSUFIeEQ7T0FOQzs7RUFiSTs7RUF3QmIsVUFBQSxHQUFhLFFBQUEsQ0FBQyxJQUFELENBQUE7QUFDVCxRQUFBLEdBQUEsRUFBQTtJQUFBLENBQUEsR0FBSSxNQUFBLENBQU8sSUFBSSxDQUFDLEtBQVo7V0FDSixFQUFBLENBQUcsRUFBSCxDQUFBLEdBQVMsQ0FBSSxJQUFJLENBQUMsTUFBUixHQUFvQixFQUFFLENBQUMsSUFBSCxDQUFRLENBQUMsQ0FBQyxNQUFGLENBQVMsR0FBVCxDQUFSLEVBQXNCLENBQXRCLENBQXBCLEdBQWtELENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxDQUFuRCxDQUFULEdBQThFLEVBQUEsQ0FBRyxDQUFILENBQTlFLEdBQW9GLEdBQXBGLEdBQ0EsQ0FBSSxJQUFJLENBQUMsTUFBUixHQUFvQixFQUFBLENBQUcsRUFBSCxDQUFBLEdBQVMsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxLQUFULENBQVQsR0FBMkIsRUFBQSxDQUFHLENBQUgsQ0FBM0IsR0FBaUMsR0FBckQsR0FBOEQsRUFBQSxDQUFHLEVBQUgsQ0FBQSxHQUFTLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxDQUFULEdBQTBCLEVBQUEsQ0FBRyxDQUFILENBQTFCLEdBQWdDLEdBQS9GLENBREEsR0FFQSxFQUFBLENBQUksQ0FBSixDQUZBLEdBRVMsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULENBRlQsR0FFMEIsR0FGMUIsR0FHQSxFQUFBLENBQUcsRUFBSCxDQUhBLEdBR1MsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULENBSFQsR0FHMEIsQ0FBQSxHQUFBLEdBQU0sRUFBQSxDQUFHLENBQUgsQ0FBQSxHQUFNLEdBQU4sR0FDaEMsRUFBQSxDQUFHLEVBQUgsQ0FEZ0MsR0FDdkIsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULENBRHVCLEdBQ04sQ0FBQSxHQUFBLEdBQU0sRUFBQSxDQUFHLENBQUgsQ0FBQSxHQUFNLEdBQU4sR0FDaEMsRUFBQSxDQUFJLENBQUosQ0FEZ0MsR0FDdkIsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULENBRHVCLEdBQ04sR0FEQSxDQURBO0VBTGpCOztFQVNiLFNBQUEsR0FBWSxRQUFBLENBQUMsSUFBRCxDQUFBO0FBQ1I7YUFDSSxRQUFBLENBQVMsSUFBSSxDQUFDLEdBQWQsRUFESjtLQUFBLGNBQUE7YUFHSSxJQUFJLENBQUMsSUFIVDs7RUFEUTs7RUFNWixTQUFBLEdBQVksUUFBQSxDQUFDLElBQUQsQ0FBQTtBQUNSO2FBQ0ksU0FBQSxDQUFVLElBQUksQ0FBQyxHQUFmLEVBREo7S0FBQSxjQUFBO2FBR0ksSUFBSSxDQUFDLElBSFQ7O0VBRFE7O0VBTVosV0FBQSxHQUFjLFFBQUEsQ0FBQyxJQUFELENBQUE7QUFDVixRQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBO0lBQUEsR0FBQSxHQUFNLFNBQUEsQ0FBVSxJQUFWO0lBQ04sR0FBQSxHQUFNLFNBQUEsQ0FBVSxJQUFWO0lBQ04sR0FBQSxHQUFNLE1BQU8sQ0FBQSxRQUFBLENBQVUsQ0FBQSxHQUFBO0lBQ3ZCLElBQUEsQ0FBeUMsR0FBekM7TUFBQSxHQUFBLEdBQU0sTUFBTyxDQUFBLFFBQUEsQ0FBVSxDQUFBLFNBQUEsRUFBdkI7O0lBQ0EsR0FBQSxHQUFNLE1BQU8sQ0FBQSxTQUFBLENBQVcsQ0FBQSxHQUFBO0lBQ3hCLElBQUEsQ0FBMEMsR0FBMUM7TUFBQSxHQUFBLEdBQU0sTUFBTyxDQUFBLFNBQUEsQ0FBVyxDQUFBLFNBQUEsRUFBeEI7O1dBQ0EsR0FBQSxHQUFNLEVBQUUsQ0FBQyxJQUFILENBQVEsR0FBUixFQUFhLEtBQUssQ0FBQyxjQUFuQixDQUFOLEdBQTJDLEdBQTNDLEdBQWlELEdBQWpELEdBQXVELEVBQUUsQ0FBQyxJQUFILENBQVEsR0FBUixFQUFhLEtBQUssQ0FBQyxjQUFuQjtFQVA3Qzs7RUFTZCxTQUFBLEdBQVksUUFBQSxDQUFDLElBQUQsRUFBTyxDQUFQLENBQUE7V0FDUixDQUFDLENBQUMsQ0FBQyxJQUFBLElBQVEsQ0FBQyxDQUFBLEdBQUUsQ0FBSCxDQUFULENBQUEsR0FBa0IsS0FBbkIsQ0FBQSxJQUE4QixNQUFPLENBQUEsU0FBQSxDQUFXLENBQUEsSUFBQSxDQUFsQixHQUEwQixJQUF4RCxJQUFnRSxNQUFPLENBQUEsU0FBQSxDQUFXLENBQUEsSUFBQSxDQUFsQixHQUEwQixJQUEzRixDQUFBLEdBQ0EsQ0FBQyxDQUFDLENBQUMsSUFBQSxJQUFRLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBVCxDQUFBLEdBQWtCLEtBQW5CLENBQUEsSUFBOEIsTUFBTyxDQUFBLFNBQUEsQ0FBVyxDQUFBLElBQUEsQ0FBbEIsR0FBMEIsSUFBeEQsSUFBZ0UsTUFBTyxDQUFBLFNBQUEsQ0FBVyxDQUFBLElBQUEsQ0FBbEIsR0FBMEIsSUFBM0YsQ0FEQSxHQUVBLENBQUMsQ0FBQyxDQUFDLElBQUEsSUFBUSxDQUFDLENBQUEsR0FBRSxDQUFILENBQVQsQ0FBQSxHQUFrQixLQUFuQixDQUFBLElBQThCLE1BQU8sQ0FBQSxTQUFBLENBQVcsQ0FBQSxJQUFBLENBQWxCLEdBQTBCLElBQXhELElBQWdFLE1BQU8sQ0FBQSxTQUFBLENBQVcsQ0FBQSxJQUFBLENBQWxCLEdBQTBCLElBQTNGO0VBSFE7O0VBS1osWUFBQSxHQUFlLFFBQUEsQ0FBQyxJQUFELENBQUE7QUFDWCxRQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUE7SUFBQSxFQUFBLEdBQUssU0FBQSxDQUFVLElBQUksQ0FBQyxJQUFmLEVBQXFCLENBQXJCLENBQUEsR0FBMEI7SUFDL0IsRUFBQSxHQUFLLFNBQUEsQ0FBVSxJQUFJLENBQUMsSUFBZixFQUFxQixDQUFyQixDQUFBLEdBQTBCO0lBQy9CLEVBQUEsR0FBSyxTQUFBLENBQVUsSUFBSSxDQUFDLElBQWYsRUFBcUIsQ0FBckIsQ0FBQSxHQUEwQjtXQUMvQixFQUFBLEdBQUssRUFBTCxHQUFVLEVBQVYsR0FBZTtFQUpKLEVBelBmOzs7Ozs7O0VBcVFBLElBQUEsR0FBTyxRQUFBLENBQUMsSUFBRCxFQUFPLEtBQVAsRUFBYyxPQUFLLEVBQW5CLENBQUE7QUFDSCxRQUFBLENBQUEsRUFBQSxJQUFBLEVBQUE7SUFBQSxDQUFBLEdBQUksQ0FBQyxDQUFDLEdBQUYsQ0FBTSxJQUFOLEVBQVksS0FBWixFQUFtQjs7OztrQkFBbkIsRUFBdUMsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUFkLElBQW9CLElBQXBCLElBQTRCOzs7O2tCQUFuRTtJQUNKLElBQUcsSUFBSSxDQUFDLElBQVI7TUFDSSxJQUFHLElBQUEsS0FBUSxFQUFYO0FBQW1CLGVBQU8sS0FBMUI7O01BQ0EsQ0FBQyxDQUFDLElBQUYsQ0FBTyxRQUFBLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBQTtBQUNILFlBQUE7UUFBQSxJQUFHLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBTyxDQUFFLENBQUEsQ0FBQSxDQUFaO0FBQW9CLGlCQUFPLEVBQTNCOztRQUNBLElBQUcsQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLENBQUUsQ0FBQSxDQUFBLENBQVo7QUFBb0IsaUJBQU8sQ0FBQyxFQUE1Qjs7UUFDQSxJQUFHLElBQUksQ0FBQyxJQUFSO1VBQ0ksQ0FBQSxHQUFJLE1BQUEsQ0FBTyxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBWjtVQUNKLElBQUcsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixDQUFIO0FBQThCLG1CQUFPLEVBQXJDOztVQUNBLElBQUcsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBaEIsQ0FBSDtBQUErQixtQkFBTyxDQUFDLEVBQXZDO1dBSEo7O1FBSUEsSUFBRyxJQUFJLENBQUMsSUFBUjtVQUNJLElBQUcsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQUwsR0FBWSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBcEI7QUFBOEIsbUJBQU8sRUFBckM7O1VBQ0EsSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBTCxHQUFZLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFwQjtBQUE4QixtQkFBTyxDQUFDLEVBQXRDO1dBRko7O1FBR0EsSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU8sQ0FBRSxDQUFBLENBQUEsQ0FBWjtBQUFvQixpQkFBTyxFQUEzQjs7ZUFDQSxDQUFDO01BWEUsQ0FBUCxFQUZKO0tBQUEsTUFjSyxJQUFHLElBQUksQ0FBQyxJQUFSO01BQ0QsQ0FBQyxDQUFDLElBQUYsQ0FBTyxRQUFBLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBQTtBQUNILFlBQUE7UUFBQSxDQUFBLEdBQUksTUFBQSxDQUFPLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFaO1FBQ0osSUFBRyxDQUFDLENBQUMsT0FBRixDQUFVLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLENBQUg7QUFBOEIsaUJBQU8sRUFBckM7O1FBQ0EsSUFBRyxDQUFDLENBQUMsUUFBRixDQUFXLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFoQixDQUFIO0FBQStCLGlCQUFPLENBQUMsRUFBdkM7O1FBQ0EsSUFBRyxJQUFJLENBQUMsSUFBUjtVQUNJLElBQUcsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQUwsR0FBWSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBcEI7QUFBOEIsbUJBQU8sRUFBckM7O1VBQ0EsSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBTCxHQUFZLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFwQjtBQUE4QixtQkFBTyxDQUFDLEVBQXRDO1dBRko7O1FBR0EsSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQU8sQ0FBRSxDQUFBLENBQUEsQ0FBWjtBQUFvQixpQkFBTyxFQUEzQjs7ZUFDQSxDQUFDO01BUkUsQ0FBUCxFQURDO0tBQUEsTUFVQSxJQUFHLElBQUksQ0FBQyxJQUFSO01BQ0QsQ0FBQyxDQUFDLElBQUYsQ0FBTyxRQUFBLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBQTtRQUNILElBQUcsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQUwsR0FBWSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBcEI7QUFBOEIsaUJBQU8sRUFBckM7O1FBQ0EsSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBTCxHQUFZLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFwQjtBQUE4QixpQkFBTyxDQUFDLEVBQXRDOztRQUNBLElBQUcsQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFPLENBQUUsQ0FBQSxDQUFBLENBQVo7QUFBb0IsaUJBQU8sRUFBM0I7O2VBQ0EsQ0FBQztNQUpFLENBQVAsRUFEQzs7V0FNTCxDQUFDLENBQUMsS0FBRixDQUFRLENBQVIsQ0FBVyxDQUFBLENBQUE7RUFoQ1I7O0VBa0NQLE1BQUEsR0FBUyxRQUFBLENBQUMsQ0FBRCxDQUFBO0lBQ0wsSUFBRyxLQUFLLENBQUMsR0FBTixDQUFBLENBQUg7TUFDSSxJQUFlLENBQUUsQ0FBQSxDQUFBLENBQUYsS0FBUSxHQUF2QjtBQUFBLGVBQU8sS0FBUDs7TUFDQSxJQUFlLENBQUEsS0FBSyxhQUFwQjtBQUFBLGVBQU8sS0FBUDs7TUFDQSxJQUFlLENBQUMsQ0FBQyxXQUFGLENBQUEsQ0FBZSxDQUFDLFVBQWhCLENBQTJCLFFBQTNCLENBQWY7QUFBQSxlQUFPLEtBQVA7T0FISjs7V0FJQTtFQUxLLEVBdlNUOzs7Ozs7OztFQW9UQSxTQUFBLEdBQVksUUFBQSxDQUFDLENBQUQsRUFBSSxLQUFKLENBQUE7QUFDUixRQUFBLElBQUEsRUFBQSxDQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBO0lBQUEsSUFBYSxJQUFJLENBQUMsWUFBbEI7TUFBQSxJQUFBLEdBQU8sR0FBUDs7SUFDQSxJQUFBLEdBQU8sR0FEUDtJQUVBLElBQUEsR0FBTyxHQUZQO0lBR0EsSUFBQSxHQUFPLEdBSFA7SUFJQSxJQUFBLEdBQU8sR0FKUDtJQUtBLElBQUEsR0FBTyxHQUxQO0lBT0EsSUFBRyxJQUFJLENBQUMsS0FBUjtNQUNJLEtBQUssQ0FBQyxPQUFOLENBQWMsUUFBQSxDQUFDLEVBQUQsQ0FBQTtBQUNWLFlBQUEsSUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUE7UUFBQSxJQUFHLEtBQUssQ0FBQyxVQUFOLENBQWlCLEVBQWpCLENBQUg7VUFDSSxJQUFBLEdBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxFQUFkLEVBRFg7U0FBQSxNQUFBO1VBR0ksSUFBQSxHQUFRLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxFQUFjLEVBQWQsRUFIWjs7QUFJQTtVQUNJLElBQUEsR0FBTyxFQUFFLENBQUMsU0FBSCxDQUFhLElBQWI7VUFDUCxFQUFBLEdBQUssU0FBQSxDQUFVLElBQVYsQ0FBZSxDQUFDO1VBQ3JCLEVBQUEsR0FBSyxTQUFBLENBQVUsSUFBVixDQUFlLENBQUM7VUFDckIsSUFBRyxFQUFBLEdBQUssS0FBSyxDQUFDLGNBQWQ7WUFDSSxLQUFLLENBQUMsY0FBTixHQUF1QixHQUQzQjs7VUFFQSxJQUFHLEVBQUEsR0FBSyxLQUFLLENBQUMsY0FBZDttQkFDSSxLQUFLLENBQUMsY0FBTixHQUF1QixHQUQzQjtXQU5KO1NBQUEsY0FBQTtBQUFBOztNQUxVLENBQWQsRUFESjs7SUFpQkEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxRQUFBLENBQUMsRUFBRCxDQUFBO0FBRVYsVUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQTtNQUFBLElBQUcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsRUFBakIsQ0FBSDtRQUNJLElBQUEsR0FBUSxLQUFLLENBQUMsT0FBTixDQUFjLEVBQWQsRUFEWjtPQUFBLE1BQUE7UUFHSSxJQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxLQUFLLENBQUMsSUFBTixDQUFXLENBQVgsRUFBYyxFQUFkLENBQWQsRUFIWjs7TUFLQSxJQUFVLE1BQUEsQ0FBTyxFQUFQLENBQVY7QUFBQSxlQUFBOztBQUVBO1FBQ0ksS0FBQSxHQUFRLEVBQUUsQ0FBQyxTQUFILENBQWEsSUFBYjtRQUNSLElBQUEsR0FBUSxLQUFLLENBQUMsY0FBTixDQUFBO1FBQ1IsSUFBQSxHQUFRLElBQUEsSUFBUyxFQUFFLENBQUMsUUFBSCxDQUFZLElBQVosQ0FBVCxJQUE4QixNQUgxQztPQUFBLGNBQUE7UUFLSSxJQUFHLElBQUg7VUFDSSxJQUFBLEdBQU87VUFDUCxLQUFLLENBQUMsV0FBVyxDQUFDLElBQWxCLENBQXVCLElBQXZCLEVBRko7U0FBQSxNQUFBO1VBSUksU0FBQSxDQUFVLG1CQUFWLEVBQStCLElBQS9CLEVBQXFDLElBQXJDO0FBQ0EsaUJBTEo7U0FMSjs7TUFZQSxHQUFBLEdBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkLENBQW1CLENBQUMsTUFBcEIsQ0FBMkIsQ0FBM0I7TUFDUCxJQUFBLEdBQU8sS0FBSyxDQUFDLFFBQU4sQ0FBZSxJQUFmLEVBQXFCLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxDQUFyQjtNQUNQLElBQUcsSUFBSyxDQUFBLENBQUEsQ0FBTCxLQUFXLEdBQWQ7UUFDSSxHQUFBLEdBQU0sSUFBSSxDQUFDLE1BQUwsQ0FBWSxDQUFaLENBQUEsR0FBaUIsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkO1FBQ3ZCLElBQUEsR0FBTyxHQUZYOztNQUdBLElBQUcsSUFBSSxDQUFDLE1BQUwsSUFBZ0IsSUFBSyxDQUFBLElBQUksQ0FBQyxNQUFMLEdBQVksQ0FBWixDQUFMLEtBQXVCLElBQXZDLElBQStDLElBQUksQ0FBQyxHQUF2RDtRQUNJLENBQUEsR0FBSTtRQUNKLElBQUcsSUFBSSxDQUFDLE1BQVI7VUFDSSxDQUFBLElBQUssWUFBQSxDQUFhLElBQWI7VUFDTCxDQUFBLElBQUssSUFGVDs7UUFHQSxJQUFHLElBQUksQ0FBQyxLQUFSO1VBQ0ksQ0FBQSxJQUFLLFdBQUEsQ0FBWSxJQUFaO1VBQ0wsQ0FBQSxJQUFLLElBRlQ7O1FBR0EsSUFBRyxJQUFJLENBQUMsS0FBUjtVQUNJLENBQUEsSUFBSyxVQUFBLENBQVcsSUFBWCxFQURUOztRQUVBLElBQUcsSUFBSSxDQUFDLEtBQVI7VUFDSSxDQUFBLElBQUssVUFBQSxDQUFXLElBQVgsRUFEVDs7UUFFQSxJQUFHLElBQUksQ0FBQyxXQUFMLENBQUEsQ0FBSDtVQUNJLElBQUcsQ0FBSSxJQUFJLENBQUMsS0FBWjtZQUNJLENBQUEsSUFBSyxTQUFBLENBQVUsSUFBVixFQUFnQixHQUFoQjtZQUNMLElBQUcsSUFBSDtjQUNJLENBQUEsSUFBSyxVQUFBLENBQVcsSUFBWCxFQURUOztZQUVBLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQSxHQUFFLEtBQVo7WUFDQSxJQUFxQixJQUFJLENBQUMsWUFBMUI7Y0FBQSxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUEsR0FBRSxLQUFaLEVBQUE7O1lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWO21CQUNBLEtBQUssQ0FBQyxRQUFOLElBQWtCLEVBUHRCO1dBQUEsTUFBQTttQkFTSSxLQUFLLENBQUMsV0FBTixJQUFxQixFQVR6QjtXQURKO1NBQUEsTUFBQTtVQVlJLElBQUcsQ0FBSSxJQUFJLENBQUMsSUFBWjtZQUNJLENBQUEsSUFBSyxVQUFBLENBQVcsSUFBWCxFQUFpQixHQUFqQjtZQUNMLElBQUcsR0FBSDtjQUNJLENBQUEsSUFBSyxTQUFBLENBQVUsR0FBVixFQURUOztZQUVBLElBQUcsSUFBSDtjQUNJLENBQUEsSUFBSyxVQUFBLENBQVcsSUFBWCxFQURUOztZQUVBLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQSxHQUFFLEtBQVo7WUFDQSxJQUFxQixJQUFJLENBQUMsWUFBMUI7Y0FBQSxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUEsR0FBRSxLQUFaLEVBQUE7O1lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWO1lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWO21CQUNBLEtBQUssQ0FBQyxTQUFOLElBQW1CLEVBVnZCO1dBQUEsTUFBQTttQkFZSSxLQUFLLENBQUMsWUFBTixJQUFzQixFQVoxQjtXQVpKO1NBWko7T0FBQSxNQUFBO1FBc0NJLElBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFIO2lCQUNJLEtBQUssQ0FBQyxZQUFOLElBQXNCLEVBRDFCO1NBQUEsTUFFSyxJQUFHLElBQUksQ0FBQyxXQUFMLENBQUEsQ0FBSDtpQkFDRCxLQUFLLENBQUMsV0FBTixJQUFxQixFQURwQjtTQXhDVDs7SUExQlUsQ0FBZDtJQXFFQSxJQUFHLElBQUksQ0FBQyxJQUFMLElBQWEsSUFBSSxDQUFDLElBQWxCLElBQTBCLElBQUksQ0FBQyxJQUFsQztNQUNJLElBQUcsSUFBSSxDQUFDLE1BQUwsSUFBZ0IsQ0FBSSxJQUFJLENBQUMsS0FBNUI7UUFDSSxJQUFBLEdBQU8sSUFBQSxDQUFLLElBQUwsRUFBVyxJQUFYLEVBRFg7O01BRUEsSUFBRyxJQUFJLENBQUMsTUFBUjtRQUNJLElBQUEsR0FBTyxJQUFBLENBQUssSUFBTCxFQUFXLElBQVgsRUFBaUIsSUFBakIsRUFEWDtPQUhKOztJQU1BLElBQUcsSUFBSSxDQUFDLFlBQVI7QUFDVTtNQUFBLEtBQUEsc0NBQUE7O3FCQUFOLEdBQUEsQ0FBSSxDQUFKO01BQU0sQ0FBQTtxQkFEVjtLQUFBLE1BQUE7TUFHVSxLQUFBLHdDQUFBOztRQUFOLEdBQUEsQ0FBSSxDQUFKO01BQU07QUFDQTtNQUFBLEtBQUEsd0NBQUE7O3NCQUFOLEdBQUEsQ0FBSSxDQUFKO01BQU0sQ0FBQTtzQkFKVjs7RUFwR1EsRUFwVFo7Ozs7Ozs7RUFvYUEsT0FBQSxHQUFVLFFBQUEsQ0FBQyxDQUFELENBQUE7QUFFTixRQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLEVBQUE7SUFBQSxJQUFVLE1BQUEsQ0FBTyxDQUFQLENBQVY7QUFBQSxhQUFBOztJQUVBLEVBQUEsR0FBSztBQUVMO01BQ0ksS0FBQSxHQUFRLEVBQUUsQ0FBQyxXQUFILENBQWUsQ0FBZixFQURaO0tBQUEsY0FBQTtNQUVNO01BQ0YsR0FBQSxHQUFNLEtBQUssQ0FBQztNQUNaLElBQTZCLEVBQUUsQ0FBQyxVQUFILENBQWMsR0FBZCxFQUFtQixRQUFuQixDQUE3QjtRQUFBLEdBQUEsR0FBTSxvQkFBTjs7TUFDQSxTQUFBLENBQVUsR0FBVixFQUxKOztJQU9BLElBQUcsSUFBSSxDQUFDLElBQVI7TUFDSSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxRQUFBLENBQUMsQ0FBRCxDQUFBO1FBQ2pCLElBQUssTUFBQSxDQUFPLElBQUksQ0FBQyxJQUFaLENBQWlCLENBQUMsSUFBbEIsQ0FBdUIsQ0FBdkIsQ0FBTDtpQkFBQSxFQUFBOztNQURpQixDQUFiLEVBRFo7O0lBSUEsSUFBRyxJQUFJLENBQUMsSUFBTCxJQUFjLENBQUksS0FBSyxDQUFDLE1BQTNCO01BQ0ksS0FESjtLQUFBLE1BRUssSUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQVgsS0FBcUIsQ0FBckIsSUFBMkIsSUFBSSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQVgsS0FBaUIsR0FBNUMsSUFBb0QsQ0FBSSxJQUFJLENBQUMsT0FBaEU7TUFDRCxHQUFBLENBQUksS0FBSixFQURDO0tBQUEsTUFBQTtNQUdELENBQUEsR0FBSSxNQUFPLENBQUEsUUFBQSxDQUFQLEdBQW1CLEdBQW5CLEdBQXlCLE1BQU8sQ0FBQSxTQUFBLENBQVcsQ0FBQSxDQUFBLENBQTNDLEdBQWdEO01BQ3BELElBQTBCLEVBQUcsQ0FBQSxDQUFBLENBQUgsS0FBUyxHQUFuQztRQUFBLEVBQUEsR0FBSyxLQUFLLENBQUMsT0FBTixDQUFjLEVBQWQsRUFBTDs7TUFDQSxJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsRUFBZCxFQUFrQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQTlCLENBQUg7UUFDSSxFQUFBLEdBQUssSUFBQSxHQUFPLEVBQUUsQ0FBQyxNQUFILENBQVUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBMUIsRUFEaEI7T0FBQSxNQUVLLElBQUcsRUFBRSxDQUFDLFVBQUgsQ0FBYyxDQUFkLEVBQWlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBN0IsQ0FBSDtRQUNELEVBQUEsR0FBSyxHQUFBLEdBQU0sQ0FBQyxDQUFDLE1BQUYsQ0FBUyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUExQixFQURWOztNQUdMLElBQUcsRUFBQSxLQUFNLEdBQVQ7UUFDSSxDQUFBLElBQUssSUFEVDtPQUFBLE1BQUE7UUFHSSxFQUFBLEdBQUssRUFBRSxDQUFDLEtBQUgsQ0FBUyxHQUFUO1FBQ0wsQ0FBQSxJQUFLLE1BQU8sQ0FBQSxTQUFBLENBQVcsQ0FBQSxDQUFBLENBQWxCLEdBQXVCLEVBQUUsQ0FBQyxLQUFILENBQUE7QUFDNUIsZUFBTSxFQUFFLENBQUMsTUFBVDtVQUNJLEVBQUEsR0FBSyxFQUFFLENBQUMsS0FBSCxDQUFBO1VBQ0wsSUFBRyxFQUFIO1lBQ0ksQ0FBQSxJQUFLLE1BQU8sQ0FBQSxTQUFBLENBQVcsQ0FBQSxDQUFBLENBQWxCLEdBQXVCO1lBQzVCLENBQUEsSUFBSyxNQUFPLENBQUEsU0FBQSxDQUFXLENBQUEsRUFBRSxDQUFDLE1BQUgsS0FBYSxDQUFiLElBQW1CLENBQW5CLElBQXdCLENBQXhCLENBQWxCLEdBQStDLEdBRnhEOztRQUZKLENBTEo7O01BVUEsR0FBQSxDQUFJLEtBQUo7TUFDQSxHQUFBLENBQUksQ0FBQSxHQUFJLEdBQUosR0FBVSxLQUFkO01BQ0EsR0FBQSxDQUFJLEtBQUosRUF0QkM7O0lBd0JMLElBQUcsS0FBSyxDQUFDLE1BQVQ7TUFDSSxTQUFBLENBQVUsQ0FBVixFQUFhLEtBQWIsRUFESjs7SUFHQSxJQUFHLElBQUksQ0FBQyxPQUFSO0FBQ0k7OztBQUFBO01BQUEsS0FBQSxzQ0FBQTs7cUJBQ0ksT0FBQSxDQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLEVBQWMsRUFBZCxDQUFkLENBQVI7TUFESixDQUFBO3FCQURKOztFQTlDTSxFQXBhVjs7Ozs7OztFQTRkQSxTQUFBLEdBQVksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFYLENBQWUsUUFBQSxDQUFDLENBQUQsQ0FBQTtBQUN2QixRQUFBO0FBQUE7YUFDSSxDQUFDLENBQUQsRUFBSSxFQUFFLENBQUMsUUFBSCxDQUFZLENBQVosQ0FBSixFQURKO0tBQUEsY0FBQTtNQUVNO01BQ0YsU0FBQSxDQUFVLGdCQUFWLEVBQTRCLENBQTVCO2FBQ0EsR0FKSjs7RUFEdUIsQ0FBZjs7RUFPWixTQUFBLEdBQVksU0FBUyxDQUFDLE1BQVYsQ0FBa0IsUUFBQSxDQUFDLENBQUQsQ0FBQTtXQUFPLENBQUMsQ0FBQyxNQUFGLElBQWEsQ0FBSSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBTCxDQUFBO0VBQXhCLENBQWxCOztFQUNaLElBQUcsU0FBUyxDQUFDLE1BQVYsR0FBbUIsQ0FBdEI7SUFDSSxHQUFBLENBQUksS0FBSjtJQUNBLFNBQUEsQ0FBVSxPQUFPLENBQUMsR0FBUixDQUFBLENBQVYsRUFBeUIsU0FBUyxDQUFDLEdBQVYsQ0FBZSxRQUFBLENBQUMsQ0FBRCxDQUFBO2FBQU8sQ0FBRSxDQUFBLENBQUE7SUFBVCxDQUFmLENBQXpCLEVBRko7OztBQUlBOzs7RUFBQSxLQUFBLHNDQUFBOztJQUNJLE9BQUEsQ0FBUSxDQUFFLENBQUEsQ0FBQSxDQUFWO0VBREo7O0VBR0EsR0FBQSxDQUFJLEVBQUo7O0VBQ0EsSUFBRyxJQUFJLENBQUMsS0FBUjtJQUNJLE9BQUEsR0FBVSxPQUFBLENBQVEsWUFBUixDQUFxQixDQUFDO0lBQ2hDLEdBQUEsQ0FBSSxFQUFBLENBQUcsQ0FBSCxDQUFBLEdBQVEsR0FBUixHQUNKLEVBQUEsQ0FBRyxDQUFILENBREksR0FDSSxLQUFLLENBQUMsUUFEVixHQUNxQixDQUFDLEtBQUssQ0FBQyxXQUFOLElBQXNCLEVBQUEsQ0FBRyxDQUFILENBQUEsR0FBUSxHQUFSLEdBQWMsRUFBQSxDQUFHLENBQUgsQ0FBZCxHQUF1QixLQUFLLENBQUMsV0FBbkQsSUFBbUUsRUFBcEUsQ0FEckIsR0FDK0YsRUFBQSxDQUFHLENBQUgsQ0FEL0YsR0FDdUcsUUFEdkcsR0FFSixFQUFBLENBQUcsQ0FBSCxDQUZJLEdBRUksS0FBSyxDQUFDLFNBRlYsR0FFc0IsQ0FBQyxLQUFLLENBQUMsWUFBTixJQUF1QixFQUFBLENBQUcsQ0FBSCxDQUFBLEdBQVEsR0FBUixHQUFjLEVBQUEsQ0FBRyxDQUFILENBQWQsR0FBdUIsS0FBSyxDQUFDLFlBQXBELElBQXFFLEVBQXRFLENBRnRCLEdBRWtHLEVBQUEsQ0FBRyxDQUFILENBRmxHLEdBRTBHLFNBRjFHLEdBR0osRUFBQSxDQUFHLENBQUgsQ0FISSxHQUdJLE9BQUEsQ0FBUSxPQUFSLEVBQWlCLElBQUEsQ0FBSyxLQUFMLEVBQVksSUFBWixDQUFqQixDQUhKLEdBRzBDLEVBQUEsQ0FBRyxDQUFILENBSDFDLEdBR2tELEtBSGxELEdBRzBELEdBSDFELEdBSUosS0FKQSxFQUZKOztBQTVlQSIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgICAgMDAwICAgICAgIDAwMDAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgIDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAgICAgICAwMDBcbiAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAgICAgIDAwMDAwMDAgIDAwMDAwMDBcbiMjI1xuXG57IGNoaWxkcCwgc2xhc2gsIGthcmcsIGZzLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbmxvZyAgICA9IGNvbnNvbGUubG9nXG5hbnNpICAgPSByZXF1aXJlICdhbnNpLTI1Ni1jb2xvcnMnXG51dGlsICAgPSByZXF1aXJlICd1dGlsJ1xuX3MgICAgID0gcmVxdWlyZSAndW5kZXJzY29yZS5zdHJpbmcnXG5tb21lbnQgPSByZXF1aXJlICdtb21lbnQnXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwXG5cbnN0YXJ0ID0gMFxudG9rZW4gPSB7fVxuXG5zaW5jZSA9ICh0KSAtPlxuICBkaWZmID0gcHJvY2Vzcy5ocnRpbWUgdG9rZW5bdF1cbiAgZGlmZlswXSAqIDEwMDAgKyBkaWZmWzFdIC8gMTAwMDAwMFxuXG5wcm9mID0gKCkgLT5cbiAgICBpZiBhcmd1bWVudHMubGVuZ3RoID09IDJcbiAgICAgICAgY21kID0gYXJndW1lbnRzWzBdXG4gICAgICAgIHQgPSBhcmd1bWVudHNbMV1cbiAgICBlbHNlIGlmIGFyZ3VtZW50cy5sZW5ndGggPT0gMVxuICAgICAgICB0ID0gYXJndW1lbnRzWzBdXG4gICAgICAgIGNtZCA9ICdzdGFydCdcblxuICAgIHN0YXJ0ID0gcHJvY2Vzcy5ocnRpbWUoKVxuICAgIGlmIGNtZCA9PSAnc3RhcnQnXG4gICAgICAgIHRva2VuW3RdID0gc3RhcnRcbiAgICBlbHNlIGlmIGNtZCA9PSAnZW5kJ1xuICAgICAgICBzaW5jZSh0KVxuXG5wcm9mICdzdGFydCcsICdscydcblxuIyBjb2xvcnNcbmJvbGQgICA9ICdcXHgxYlsxbSdcbnJlc2V0ICA9IGFuc2kucmVzZXRcbmZnICAgICA9IGFuc2kuZmcuZ2V0UmdiXG5CRyAgICAgPSBhbnNpLmJnLmdldFJnYlxuZncgICAgID0gKGkpIC0+IGFuc2kuZmcuZ3JheXNjYWxlW2ldXG5CVyAgICAgPSAoaSkgLT4gYW5zaS5iZy5ncmF5c2NhbGVbaV1cblxuc3RhdHMgPSAjIGNvdW50ZXJzIGZvciAoaGlkZGVuKSBkaXJzL2ZpbGVzXG4gICAgbnVtX2RpcnM6ICAgICAgIDBcbiAgICBudW1fZmlsZXM6ICAgICAgMFxuICAgIGhpZGRlbl9kaXJzOiAgICAwXG4gICAgaGlkZGVuX2ZpbGVzOiAgIDBcbiAgICBtYXhPd25lckxlbmd0aDogMFxuICAgIG1heEdyb3VwTGVuZ3RoOiAwXG4gICAgYnJva2VuTGlua3M6ICAgIFtdXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgIDAwMDAgIDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuXG5hcmdzID0ga2FyZyBcIlwiXCJcbmNvbG9yLWxzXG4gICAgcGF0aHMgICAgICAgICAuID8gdGhlIGZpbGUocykgYW5kL29yIGZvbGRlcihzKSB0byBkaXNwbGF5IC4gKipcbiAgICBieXRlcyAgICAgICAgIC4gPyBpbmNsdWRlIHNpemUgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIG1kYXRlICAgICAgICAgLiA/IGluY2x1ZGUgbW9kaWZpY2F0aW9uIGRhdGUgICAgICAgLiA9IGZhbHNlXG4gICAgbG9uZyAgICAgICAgICAuID8gaW5jbHVkZSBzaXplIGFuZCBkYXRlICAgICAgICAgICAuID0gZmFsc2VcbiAgICBvd25lciAgICAgICAgIC4gPyBpbmNsdWRlIG93bmVyIGFuZCBncm91cCAgICAgICAgIC4gPSBmYWxzZVxuICAgIHJpZ2h0cyAgICAgICAgLiA/IGluY2x1ZGUgcmlnaHRzICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgYWxsICAgICAgICAgICAuID8gc2hvdyBkb3QgZmlsZXMgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICBkaXJzICAgICAgICAgIC4gPyBzaG93IG9ubHkgZGlycyAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIGZpbGVzICAgICAgICAgLiA/IHNob3cgb25seSBmaWxlcyAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgc2l6ZSAgICAgICAgICAuID8gc29ydCBieSBzaXplICAgICAgICAgICAgICAgICAgICAuID0gZmFsc2VcbiAgICB0aW1lICAgICAgICAgIC4gPyBzb3J0IGJ5IHRpbWUgICAgICAgICAgICAgICAgICAgIC4gPSBmYWxzZVxuICAgIGtpbmQgICAgICAgICAgLiA/IHNvcnQgYnkga2luZCAgICAgICAgICAgICAgICAgICAgLiA9IGZhbHNlXG4gICAgcHJldHR5ICAgICAgICAuID8gcHJldHR5IHNpemUgYW5kIGRhdGUgICAgICAgICAgICAuID0gdHJ1ZVxuICAgIHN0YXRzICAgICAgICAgLiA/IHNob3cgc3RhdGlzdGljcyAgICAgICAgICAgICAgICAgLiA9IGZhbHNlIC4gLSBpXG4gICAgcmVjdXJzZSAgICAgICAuID8gcmVjdXJzZSBpbnRvIHN1YmRpcnMgICAgICAgICAgICAuID0gZmFsc2UgLiAtIFJcbiAgICBmaW5kICAgICAgICAgIC4gPyBmaWx0ZXIgd2l0aCBhIHJlZ2V4cCAgICAgICAgICAgICAgICAgICAgICAuIC0gRlxuICAgIGFscGhhYmV0aWNhbCAgLiAhIGRvbid0IGdyb3VwIGRpcnMgYmVmb3JlIGZpbGVzICAgLiA9IGZhbHNlIC4gLSBBXG5cbnZlcnNpb24gICAgICAje3JlcXVpcmUoXCIje19fZGlybmFtZX0vLi4vcGFja2FnZS5qc29uXCIpLnZlcnNpb259XG5cIlwiXCJcblxuaWYgYXJncy5zaXplXG4gICAgYXJncy5maWxlcyA9IHRydWVcblxuaWYgYXJncy5sb25nXG4gICAgYXJncy5ieXRlcyA9IHRydWVcbiAgICBhcmdzLm1kYXRlID0gdHJ1ZVxuXG5hcmdzLnBhdGhzID0gWycuJ10gdW5sZXNzIGFyZ3MucGF0aHM/Lmxlbmd0aCA+IDBcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxuY29sb3JzID1cbiAgICAnY29mZmVlJzogICBbIGJvbGQrZmcoNCw0LDApLCAgZmcoMSwxLDApLCBmZygxLDEsMCkgXVxuICAgICdweSc6ICAgICAgIFsgYm9sZCtmZygwLDIsMCksICBmZygwLDEsMCksIGZnKDAsMSwwKSBdXG4gICAgJ3JiJzogICAgICAgWyBib2xkK2ZnKDQsMCwwKSwgIGZnKDEsMCwwKSwgZmcoMSwwLDApIF1cbiAgICAnanNvbic6ICAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygxLDAsMSkgXVxuICAgICdjc29uJzogICAgIFsgYm9sZCtmZyg0LDAsNCksICBmZygxLDAsMSksIGZnKDEsMCwxKSBdXG4gICAgJ25vb24nOiAgICAgWyBib2xkK2ZnKDQsNCwwKSwgIGZnKDEsMSwwKSwgZmcoMSwxLDApIF1cbiAgICAncGxpc3QnOiAgICBbIGJvbGQrZmcoNCwwLDQpLCAgZmcoMSwwLDEpLCBmZygxLDAsMSkgXVxuICAgICdqcyc6ICAgICAgIFsgYm9sZCtmZyg1LDAsNSksICBmZygxLDAsMSksIGZnKDEsMCwxKSBdXG4gICAgJ2NwcCc6ICAgICAgWyBib2xkK2ZnKDUsNCwwKSwgIGZ3KDEpLCAgICAgZmcoMSwxLDApIF1cbiAgICAnaCc6ICAgICAgICBbICAgICAgZmcoMywxLDApLCAgZncoMSksICAgICBmZygxLDEsMCkgXVxuICAgICdweWMnOiAgICAgIFsgICAgICBmdyg1KSwgICAgICBmdygxKSwgICAgIGZ3KDEpIF1cbiAgICAnbG9nJzogICAgICBbICAgICAgZncoNSksICAgICAgZncoMSksICAgICBmdygxKSBdXG4gICAgJ2xvZyc6ICAgICAgWyAgICAgIGZ3KDUpLCAgICAgIGZ3KDEpLCAgICAgZncoMSkgXVxuICAgICd0eHQnOiAgICAgIFsgICAgICBmdygyMCksICAgICBmdygxKSwgICAgIGZ3KDIpIF1cbiAgICAnbWQnOiAgICAgICBbIGJvbGQrZncoMjApLCAgICAgZncoMSksICAgICBmdygyKSBdXG4gICAgJ21hcmtkb3duJzogWyBib2xkK2Z3KDIwKSwgICAgIGZ3KDEpLCAgICAgZncoMikgXVxuICAgICdzaCc6ICAgICAgIFsgYm9sZCtmZyg1LDEsMCksICBmZygxLDAsMCksIGZnKDEsMCwwKSBdXG4gICAgJ3BuZyc6ICAgICAgWyBib2xkK2ZnKDUsMCwwKSwgIGZnKDEsMCwwKSwgZmcoMSwwLDApIF1cbiAgICAnanBnJzogICAgICBbIGJvbGQrZmcoMCwzLDApLCAgZmcoMCwxLDApLCBmZygwLDEsMCkgXVxuICAgICdweG0nOiAgICAgIFsgYm9sZCtmZygxLDEsNSksICBmZygwLDAsMSksIGZnKDAsMCwyKSBdXG4gICAgJ3RpZmYnOiAgICAgWyBib2xkK2ZnKDEsMSw1KSwgIGZnKDAsMCwxKSwgZmcoMCwwLDIpIF1cbiAgICAjXG4gICAgJ19kZWZhdWx0JzogWyAgICAgIGZ3KDE1KSwgICAgIGZ3KDEpLCAgICAgZncoNikgXVxuICAgICdfZGlyJzogICAgIFsgYm9sZCtCRygwLDAsMikrZncoMjMpLCBmZygxLDEsNSksIGZnKDIsMiw1KSBdXG4gICAgJ18uZGlyJzogICAgWyBib2xkK0JHKDAsMCwxKStmdygyMyksIGJvbGQrQkcoMCwwLDEpK2ZnKDEsMSw1KSwgYm9sZCtCRygwLDAsMSkrZmcoMiwyLDUpIF1cbiAgICAnX2xpbmsnOiAgICB7ICdhcnJvdyc6IGZnKDEsMCwxKSwgJ3BhdGgnOiBmZyg0LDAsNCksICdicm9rZW4nOiBCRyg1LDAsMCkrZmcoNSw1LDApIH1cbiAgICAnX2Fycm93JzogICAgIGZ3KDEpXG4gICAgJ19oZWFkZXInOiAgWyBib2xkK0JXKDIpK2ZnKDMsMiwwKSwgIGZ3KDQpLCBib2xkK0JXKDIpK2ZnKDUsNSwwKSBdXG4gICAgI1xuICAgICdfc2l6ZSc6ICAgIHsgYjogW2ZnKDAsMCwyKV0sIGtCOiBbZmcoMCwwLDQpLCBmZygwLDAsMildLCBNQjogW2ZnKDEsMSw1KSwgZmcoMCwwLDMpXSwgR0I6IFtmZyg0LDQsNSksIGZnKDIsMiw1KV0sIFRCOiBbZmcoNCw0LDUpLCBmZygyLDIsNSldIH1cbiAgICAnX3VzZXJzJzogICB7IHJvb3Q6ICBmZygzLDAsMCksIGRlZmF1bHQ6IGZnKDEsMCwxKSB9XG4gICAgJ19ncm91cHMnOiAgeyB3aGVlbDogZmcoMSwwLDApLCBzdGFmZjogZmcoMCwxLDApLCBhZG1pbjogZmcoMSwxLDApLCBkZWZhdWx0OiBmZygxLDAsMSkgfVxuICAgICdfZXJyb3InOiAgIFsgYm9sZCtCRyg1LDAsMCkrZmcoNSw1LDApLCBib2xkK0JHKDUsMCwwKStmZyg1LDUsNSkgXVxuICAgICdfcmlnaHRzJzpcbiAgICAgICAgICAgICAgICAgICdyKyc6IGJvbGQrQlcoMSkrZmcoMSwxLDEpXG4gICAgICAgICAgICAgICAgICAnci0nOiByZXNldCtCVygxKVxuICAgICAgICAgICAgICAgICAgJ3crJzogYm9sZCtCVygxKStmZygyLDIsNSlcbiAgICAgICAgICAgICAgICAgICd3LSc6IHJlc2V0K0JXKDEpXG4gICAgICAgICAgICAgICAgICAneCsnOiBib2xkK0JXKDEpK2ZnKDUsMCwwKVxuICAgICAgICAgICAgICAgICAgJ3gtJzogcmVzZXQrQlcoMSlcblxudXNlck1hcCA9IHt9XG51c2VybmFtZSA9ICh1aWQpIC0+XG4gICAgaWYgbm90IHVzZXJNYXBbdWlkXVxuICAgICAgICB0cnlcbiAgICAgICAgICAgIHVzZXJNYXBbdWlkXSA9IGNoaWxkcC5zcGF3blN5bmMoXCJpZFwiLCBbXCItdW5cIiwgXCIje3VpZH1cIl0pLnN0ZG91dC50b1N0cmluZygndXRmOCcpLnRyaW0oKVxuICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICBsb2cgZVxuICAgIHVzZXJNYXBbdWlkXVxuXG5ncm91cE1hcCA9IG51bGxcbmdyb3VwbmFtZSA9IChnaWQpIC0+XG4gICAgaWYgbm90IGdyb3VwTWFwXG4gICAgICAgIHRyeVxuICAgICAgICAgICAgZ2lkcyA9IGNoaWxkcC5zcGF3blN5bmMoXCJpZFwiLCBbXCItR1wiXSkuc3Rkb3V0LnRvU3RyaW5nKCd1dGY4Jykuc3BsaXQoJyAnKVxuICAgICAgICAgICAgZ25tcyA9IGNoaWxkcC5zcGF3blN5bmMoXCJpZFwiLCBbXCItR25cIl0pLnN0ZG91dC50b1N0cmluZygndXRmOCcpLnNwbGl0KCcgJylcbiAgICAgICAgICAgIGdyb3VwTWFwID0ge31cbiAgICAgICAgICAgIGZvciBpIGluIFswLi4uZ2lkcy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgZ3JvdXBNYXBbZ2lkc1tpXV0gPSBnbm1zW2ldXG4gICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgIGxvZyBlXG4gICAgZ3JvdXBNYXBbZ2lkXVxuXG5pZiBfLmlzRnVuY3Rpb24gcHJvY2Vzcy5nZXR1aWRcbiAgICBjb2xvcnNbJ191c2VycyddW3VzZXJuYW1lKHByb2Nlc3MuZ2V0dWlkKCkpXSA9IGZnKDAsNCwwKVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbmxvZ19lcnJvciA9ICgpIC0+XG4gICAgbG9nIFwiIFwiICsgY29sb3JzWydfZXJyb3InXVswXSArIFwiIFwiICsgYm9sZCArIGFyZ3VtZW50c1swXSArIChhcmd1bWVudHMubGVuZ3RoID4gMSBhbmQgKGNvbG9yc1snX2Vycm9yJ11bMV0gKyBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykuc2xpY2UoMSkuam9pbignICcpKSBvciAnJykgKyBcIiBcIiArIHJlc2V0XG5cbmxpbmtTdHJpbmcgPSAoZmlsZSkgICAgICAtPiByZXNldCArIGZ3KDEpICsgY29sb3JzWydfbGluayddWydhcnJvdyddICsgXCIg4pa6IFwiICsgY29sb3JzWydfbGluayddWyhmaWxlIGluIHN0YXRzLmJyb2tlbkxpbmtzKSBhbmQgJ2Jyb2tlbicgb3IgJ3BhdGgnXSArIHNsYXNoLnBhdGggZnMucmVhZGxpbmtTeW5jKGZpbGUpXG5uYW1lU3RyaW5nID0gKG5hbWUsIGV4dCkgLT4gXCIgXCIgKyBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMF0gKyBuYW1lICsgcmVzZXRcbmRvdFN0cmluZyAgPSAoICAgICAgZXh0KSAtPiBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMV0gKyBcIi5cIiArIHJlc2V0XG5leHRTdHJpbmcgID0gKCAgICAgIGV4dCkgLT4gZG90U3RyaW5nKGV4dCkgKyBjb2xvcnNbY29sb3JzW2V4dF0/IGFuZCBleHQgb3IgJ19kZWZhdWx0J11bMl0gKyBleHQgKyByZXNldFxuZGlyU3RyaW5nICA9IChuYW1lLCBleHQpIC0+XG4gICAgYyA9IG5hbWUgYW5kICdfZGlyJyBvciAnXy5kaXInXG4gICAgY29sb3JzW2NdWzBdICsgKG5hbWUgYW5kIChcIiBcIiArIG5hbWUpIG9yIFwiXCIpICsgKGlmIGV4dCB0aGVuIGNvbG9yc1tjXVsxXSArICcuJyArIGNvbG9yc1tjXVsyXSArIGV4dCBlbHNlIFwiXCIpICsgXCIgXCJcblxuc2l6ZVN0cmluZyA9IChzdGF0KSAtPlxuICAgIGlmIHN0YXQuc2l6ZSA8IDEwMDBcbiAgICAgICAgY29sb3JzWydfc2l6ZSddWydiJ11bMF0gKyBfcy5scGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlIGlmIHN0YXQuc2l6ZSA8IDEwMDAwMDBcbiAgICAgICAgaWYgYXJncy5wcmV0dHlcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsna0InXVswXSArIF9zLmxwYWQoKHN0YXQuc2l6ZSAvIDEwMDApLnRvRml4ZWQoMCksIDcpICsgXCIgXCIgKyBjb2xvcnNbJ19zaXplJ11bJ2tCJ11bMV0gKyBcImtCIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbG9yc1snX3NpemUnXVsna0InXVswXSArIF9zLmxwYWQoc3RhdC5zaXplLCAxMCkgKyBcIiBcIlxuICAgIGVsc2UgaWYgc3RhdC5zaXplIDwgMTAwMDAwMDAwMFxuICAgICAgICBpZiBhcmdzLnByZXR0eVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydNQiddWzBdICsgX3MubHBhZCgoc3RhdC5zaXplIC8gMTAwMDAwMCkudG9GaXhlZCgxKSwgNykgKyBcIiBcIiArIGNvbG9yc1snX3NpemUnXVsnTUInXVsxXSArIFwiTUIgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29sb3JzWydfc2l6ZSddWydNQiddWzBdICsgX3MubHBhZChzdGF0LnNpemUsIDEwKSArIFwiIFwiXG4gICAgZWxzZSBpZiBzdGF0LnNpemUgPCAxMDAwMDAwMDAwMDAwXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMF0gKyBfcy5scGFkKChzdGF0LnNpemUgLyAxMDAwMDAwMDAwKS50b0ZpeGVkKDEpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydHQiddWzFdICsgXCJHQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ0dCJ11bMF0gKyBfcy5scGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcbiAgICBlbHNlXG4gICAgICAgIGlmIGFyZ3MucHJldHR5XG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMF0gKyBfcy5scGFkKChzdGF0LnNpemUgLyAxMDAwMDAwMDAwMDAwKS50b0ZpeGVkKDMpLCA3KSArIFwiIFwiICsgY29sb3JzWydfc2l6ZSddWydUQiddWzFdICsgXCJUQiBcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb2xvcnNbJ19zaXplJ11bJ1RCJ11bMF0gKyBfcy5scGFkKHN0YXQuc2l6ZSwgMTApICsgXCIgXCJcblxudGltZVN0cmluZyA9IChzdGF0KSAtPlxuICAgIHQgPSBtb21lbnQoc3RhdC5tdGltZSlcbiAgICBmdygxNikgKyAoaWYgYXJncy5wcmV0dHkgdGhlbiBfcy5scGFkKHQuZm9ybWF0KFwiRFwiKSwyKSBlbHNlIHQuZm9ybWF0KFwiRERcIikpICsgZncoNykrJy4nICtcbiAgICAoaWYgYXJncy5wcmV0dHkgdGhlbiBmdygxNCkgKyB0LmZvcm1hdChcIk1NTVwiKSArIGZ3KDEpK1wiJ1wiIGVsc2UgZncoMTQpICsgdC5mb3JtYXQoXCJNTVwiKSArIGZ3KDEpK1wiJ1wiKSArXG4gICAgZncoIDQpICsgdC5mb3JtYXQoXCJZWVwiKSArIFwiIFwiICtcbiAgICBmdygxNikgKyB0LmZvcm1hdChcIkhIXCIpICsgY29sID0gZncoNykrJzonICtcbiAgICBmdygxNCkgKyB0LmZvcm1hdChcIm1tXCIpICsgY29sID0gZncoMSkrJzonICtcbiAgICBmdyggNCkgKyB0LmZvcm1hdChcInNzXCIpICsgXCIgXCJcblxub3duZXJOYW1lID0gKHN0YXQpIC0+XG4gICAgdHJ5XG4gICAgICAgIHVzZXJuYW1lIHN0YXQudWlkXG4gICAgY2F0Y2hcbiAgICAgICAgc3RhdC51aWRcblxuZ3JvdXBOYW1lID0gKHN0YXQpIC0+XG4gICAgdHJ5XG4gICAgICAgIGdyb3VwbmFtZSBzdGF0LmdpZFxuICAgIGNhdGNoXG4gICAgICAgIHN0YXQuZ2lkXG5cbm93bmVyU3RyaW5nID0gKHN0YXQpIC0+XG4gICAgb3duID0gb3duZXJOYW1lKHN0YXQpXG4gICAgZ3JwID0gZ3JvdXBOYW1lKHN0YXQpXG4gICAgb2NsID0gY29sb3JzWydfdXNlcnMnXVtvd25dXG4gICAgb2NsID0gY29sb3JzWydfdXNlcnMnXVsnZGVmYXVsdCddIHVubGVzcyBvY2xcbiAgICBnY2wgPSBjb2xvcnNbJ19ncm91cHMnXVtncnBdXG4gICAgZ2NsID0gY29sb3JzWydfZ3JvdXBzJ11bJ2RlZmF1bHQnXSB1bmxlc3MgZ2NsXG4gICAgb2NsICsgX3MucnBhZChvd24sIHN0YXRzLm1heE93bmVyTGVuZ3RoKSArIFwiIFwiICsgZ2NsICsgX3MucnBhZChncnAsIHN0YXRzLm1heEdyb3VwTGVuZ3RoKVxuXG5yd3hTdHJpbmcgPSAobW9kZSwgaSkgLT5cbiAgICAoKChtb2RlID4+IChpKjMpKSAmIDBiMTAwKSBhbmQgY29sb3JzWydfcmlnaHRzJ11bJ3IrJ10gKyAnIHInIG9yIGNvbG9yc1snX3JpZ2h0cyddWydyLSddICsgJyAgJykgK1xuICAgICgoKG1vZGUgPj4gKGkqMykpICYgMGIwMTApIGFuZCBjb2xvcnNbJ19yaWdodHMnXVsndysnXSArICcgdycgb3IgY29sb3JzWydfcmlnaHRzJ11bJ3ctJ10gKyAnICAnKSArXG4gICAgKCgobW9kZSA+PiAoaSozKSkgJiAwYjAwMSkgYW5kIGNvbG9yc1snX3JpZ2h0cyddWyd4KyddICsgJyB4JyBvciBjb2xvcnNbJ19yaWdodHMnXVsneC0nXSArICcgICcpXG5cbnJpZ2h0c1N0cmluZyA9IChzdGF0KSAtPlxuICAgIHVyID0gcnd4U3RyaW5nKHN0YXQubW9kZSwgMikgKyBcIiBcIlxuICAgIGdyID0gcnd4U3RyaW5nKHN0YXQubW9kZSwgMSkgKyBcIiBcIlxuICAgIHJvID0gcnd4U3RyaW5nKHN0YXQubW9kZSwgMCkgKyBcIiBcIlxuICAgIHVyICsgZ3IgKyBybyArIHJlc2V0XG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDBcblxuc29ydCA9IChsaXN0LCBzdGF0cywgZXh0cz1bXSkgLT5cbiAgICBsID0gXy56aXAgbGlzdCwgc3RhdHMsIFswLi4ubGlzdC5sZW5ndGhdLCAoZXh0cy5sZW5ndGggPiAwIGFuZCBleHRzIG9yIFswLi4ubGlzdC5sZW5ndGhdKVxuICAgIGlmIGFyZ3Mua2luZFxuICAgICAgICBpZiBleHRzID09IFtdIHRoZW4gcmV0dXJuIGxpc3RcbiAgICAgICAgbC5zb3J0KChhLGIpIC0+XG4gICAgICAgICAgICBpZiBhWzNdID4gYlszXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICBpZiBhWzNdIDwgYlszXSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYXJncy50aW1lXG4gICAgICAgICAgICAgICAgbSA9IG1vbWVudChhWzFdLm10aW1lKVxuICAgICAgICAgICAgICAgIGlmIG0uaXNBZnRlcihiWzFdLm10aW1lKSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgaWYgbS5pc0JlZm9yZShiWzFdLm10aW1lKSB0aGVuIHJldHVybiAtMVxuICAgICAgICAgICAgaWYgYXJncy5zaXplXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplID4gYlsxXS5zaXplIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBpZiBhWzFdLnNpemUgPCBiWzFdLnNpemUgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFbMl0gPiBiWzJdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIC0xKVxuICAgIGVsc2UgaWYgYXJncy50aW1lXG4gICAgICAgIGwuc29ydCgoYSxiKSAtPlxuICAgICAgICAgICAgbSA9IG1vbWVudChhWzFdLm10aW1lKVxuICAgICAgICAgICAgaWYgbS5pc0FmdGVyKGJbMV0ubXRpbWUpIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIGlmIG0uaXNCZWZvcmUoYlsxXS5tdGltZSkgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFyZ3Muc2l6ZVxuICAgICAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA+IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAgICAgaWYgYVsxXS5zaXplIDwgYlsxXS5zaXplIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgICAgICBpZiBhWzJdID4gYlsyXSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICAtMSlcbiAgICBlbHNlIGlmIGFyZ3Muc2l6ZVxuICAgICAgICBsLnNvcnQoKGEsYikgLT5cbiAgICAgICAgICAgIGlmIGFbMV0uc2l6ZSA+IGJbMV0uc2l6ZSB0aGVuIHJldHVybiAxXG4gICAgICAgICAgICBpZiBhWzFdLnNpemUgPCBiWzFdLnNpemUgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgICAgIGlmIGFbMl0gPiBiWzJdIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgICAgIC0xKVxuICAgIF8udW56aXAobClbMF1cblxuZmlsdGVyID0gKHApIC0+XG4gICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgcmV0dXJuIHRydWUgaWYgcFswXSA9PSAnJCdcbiAgICAgICAgcmV0dXJuIHRydWUgaWYgcCA9PSAnZGVza3RvcC5pbmknXG4gICAgICAgIHJldHVybiB0cnVlIGlmIHAudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoICdudHVzZXInXG4gICAgZmFsc2VcbiAgICBcbiMgMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDBcbiMgMDAwMDAwICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgICAgICAgMDAwXG4jIDAwMCAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwXG5cbmxpc3RGaWxlcyA9IChwLCBmaWxlcykgLT5cbiAgICBhbHBoID0gW10gaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICBkaXJzID0gW10gIyB2aXNpYmxlIGRpcnNcbiAgICBmaWxzID0gW10gIyB2aXNpYmxlIGZpbGVzXG4gICAgZHN0cyA9IFtdICMgZGlyIHN0YXRzXG4gICAgZnN0cyA9IFtdICMgZmlsZSBzdGF0c1xuICAgIGV4dHMgPSBbXSAjIGZpbGUgZXh0ZW5zaW9uc1xuXG4gICAgaWYgYXJncy5vd25lclxuICAgICAgICBmaWxlcy5mb3JFYWNoIChycCkgLT5cbiAgICAgICAgICAgIGlmIHNsYXNoLmlzQWJzb2x1dGUgcnBcbiAgICAgICAgICAgICAgICBmaWxlID0gc2xhc2gucmVzb2x2ZSBycFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZpbGUgID0gc2xhc2guam9pbiBwLCBycFxuICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgc3RhdCA9IGZzLmxzdGF0U3luYyhmaWxlKVxuICAgICAgICAgICAgICAgIG9sID0gb3duZXJOYW1lKHN0YXQpLmxlbmd0aFxuICAgICAgICAgICAgICAgIGdsID0gZ3JvdXBOYW1lKHN0YXQpLmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIG9sID4gc3RhdHMubWF4T3duZXJMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubWF4T3duZXJMZW5ndGggPSBvbFxuICAgICAgICAgICAgICAgIGlmIGdsID4gc3RhdHMubWF4R3JvdXBMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMubWF4R3JvdXBMZW5ndGggPSBnbFxuICAgICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuICAgIGZpbGVzLmZvckVhY2ggKHJwKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgc2xhc2guaXNBYnNvbHV0ZSBycFxuICAgICAgICAgICAgZmlsZSAgPSBzbGFzaC5yZXNvbHZlIHJwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZpbGUgID0gc2xhc2gucmVzb2x2ZSBzbGFzaC5qb2luIHAsIHJwXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGZpbHRlciBycFxuICAgICAgICBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgICBsc3RhdCA9IGZzLmxzdGF0U3luYyBmaWxlXG4gICAgICAgICAgICBsaW5rICA9IGxzdGF0LmlzU3ltYm9saWNMaW5rKClcbiAgICAgICAgICAgIHN0YXQgID0gbGluayBhbmQgZnMuc3RhdFN5bmMoZmlsZSkgb3IgbHN0YXRcbiAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICBzdGF0ID0gbHN0YXRcbiAgICAgICAgICAgICAgICBzdGF0cy5icm9rZW5MaW5rcy5wdXNoIGZpbGVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsb2dfZXJyb3IgXCJjYW4ndCByZWFkIGZpbGU6IFwiLCBmaWxlLCBsaW5rXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgZXh0ICA9IHNsYXNoLmV4dG5hbWUoZmlsZSkuc3Vic3RyKDEpXG4gICAgICAgIG5hbWUgPSBzbGFzaC5iYXNlbmFtZShmaWxlLCBzbGFzaC5leHRuYW1lIGZpbGUpXG4gICAgICAgIGlmIG5hbWVbMF0gPT0gJy4nXG4gICAgICAgICAgICBleHQgPSBuYW1lLnN1YnN0cigxKSArIHNsYXNoLmV4dG5hbWUgZmlsZVxuICAgICAgICAgICAgbmFtZSA9ICcnXG4gICAgICAgIGlmIG5hbWUubGVuZ3RoIGFuZCBuYW1lW25hbWUubGVuZ3RoLTFdICE9ICdcXHInIG9yIGFyZ3MuYWxsXG4gICAgICAgICAgICBzID0gXCIgXCJcbiAgICAgICAgICAgIGlmIGFyZ3MucmlnaHRzXG4gICAgICAgICAgICAgICAgcyArPSByaWdodHNTdHJpbmcgc3RhdFxuICAgICAgICAgICAgICAgIHMgKz0gXCIgXCJcbiAgICAgICAgICAgIGlmIGFyZ3Mub3duZXJcbiAgICAgICAgICAgICAgICBzICs9IG93bmVyU3RyaW5nIHN0YXRcbiAgICAgICAgICAgICAgICBzICs9IFwiIFwiXG4gICAgICAgICAgICBpZiBhcmdzLmJ5dGVzXG4gICAgICAgICAgICAgICAgcyArPSBzaXplU3RyaW5nIHN0YXRcbiAgICAgICAgICAgIGlmIGFyZ3MubWRhdGVcbiAgICAgICAgICAgICAgICBzICs9IHRpbWVTdHJpbmcgc3RhdFxuICAgICAgICAgICAgaWYgc3RhdC5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICAgICAgaWYgbm90IGFyZ3MuZmlsZXNcbiAgICAgICAgICAgICAgICAgICAgcyArPSBkaXJTdHJpbmcgbmFtZSwgZXh0XG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmtcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gbGlua1N0cmluZyBmaWxlXG4gICAgICAgICAgICAgICAgICAgIGRpcnMucHVzaCBzK3Jlc2V0XG4gICAgICAgICAgICAgICAgICAgIGFscGgucHVzaCBzK3Jlc2V0IGlmIGFyZ3MuYWxwaGFiZXRpY2FsXG4gICAgICAgICAgICAgICAgICAgIGRzdHMucHVzaCBzdGF0XG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLm51bV9kaXJzICs9IDFcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9kaXJzICs9IDFcbiAgICAgICAgICAgIGVsc2UgIyBpZiBwYXRoIGlzIGZpbGVcbiAgICAgICAgICAgICAgICBpZiBub3QgYXJncy5kaXJzXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gbmFtZVN0cmluZyBuYW1lLCBleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IGV4dFN0cmluZyBleHRcbiAgICAgICAgICAgICAgICAgICAgaWYgbGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgcyArPSBsaW5rU3RyaW5nIGZpbGVcbiAgICAgICAgICAgICAgICAgICAgZmlscy5wdXNoIHMrcmVzZXRcbiAgICAgICAgICAgICAgICAgICAgYWxwaC5wdXNoIHMrcmVzZXQgaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICAgICAgICAgICAgICAgICAgZnN0cy5wdXNoIHN0YXRcbiAgICAgICAgICAgICAgICAgICAgZXh0cy5wdXNoIGV4dFxuICAgICAgICAgICAgICAgICAgICBzdGF0cy5udW1fZmlsZXMgKz0gMVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgc3RhdHMuaGlkZGVuX2ZpbGVzICs9IDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgc3RhdC5pc0ZpbGUoKVxuICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9maWxlcyArPSAxXG4gICAgICAgICAgICBlbHNlIGlmIHN0YXQuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICAgIHN0YXRzLmhpZGRlbl9kaXJzICs9IDFcblxuICAgIGlmIGFyZ3Muc2l6ZSBvciBhcmdzLmtpbmQgb3IgYXJncy50aW1lXG4gICAgICAgIGlmIGRpcnMubGVuZ3RoIGFuZCBub3QgYXJncy5maWxlc1xuICAgICAgICAgICAgZGlycyA9IHNvcnQgZGlycywgZHN0c1xuICAgICAgICBpZiBmaWxzLmxlbmd0aFxuICAgICAgICAgICAgZmlscyA9IHNvcnQgZmlscywgZnN0cywgZXh0c1xuXG4gICAgaWYgYXJncy5hbHBoYWJldGljYWxcbiAgICAgICAgbG9nIHAgZm9yIHAgaW4gYWxwaFxuICAgIGVsc2VcbiAgICAgICAgbG9nIGQgZm9yIGQgaW4gZGlyc1xuICAgICAgICBsb2cgZiBmb3IgZiBpbiBmaWxzXG5cbiMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwXG5cbmxpc3REaXIgPSAocCkgLT5cbiAgICBcbiAgICByZXR1cm4gaWYgZmlsdGVyIHBcbiAgICBcbiAgICBwcyA9IHBcblxuICAgIHRyeVxuICAgICAgICBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKHApXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgbXNnID0gZXJyb3IubWVzc2FnZVxuICAgICAgICBtc2cgPSBcInBlcm1pc3Npb24gZGVuaWVkXCIgaWYgX3Muc3RhcnRzV2l0aChtc2csIFwiRUFDQ0VTXCIpXG4gICAgICAgIGxvZ19lcnJvciBtc2dcblxuICAgIGlmIGFyZ3MuZmluZFxuICAgICAgICBmaWxlcyA9IGZpbGVzLmZpbHRlciAoZikgLT5cbiAgICAgICAgICAgIGYgaWYgUmVnRXhwKGFyZ3MuZmluZCkudGVzdCBmXG4gICAgICAgICAgICBcbiAgICBpZiBhcmdzLmZpbmQgYW5kIG5vdCBmaWxlcy5sZW5ndGhcbiAgICAgICAgdHJ1ZVxuICAgIGVsc2UgaWYgYXJncy5wYXRocy5sZW5ndGggPT0gMSBhbmQgYXJncy5wYXRoc1swXSA9PSAnLicgYW5kIG5vdCBhcmdzLnJlY3Vyc2VcbiAgICAgICAgbG9nIHJlc2V0XG4gICAgZWxzZVxuICAgICAgICBzID0gY29sb3JzWydfYXJyb3cnXSArIFwi4pa6XCIgKyBjb2xvcnNbJ19oZWFkZXInXVswXSArIFwiIFwiXG4gICAgICAgIHBzID0gc2xhc2gucmVzb2x2ZShwcykgaWYgcHNbMF0gIT0gJ34nXG4gICAgICAgIGlmIF9zLnN0YXJ0c1dpdGgocHMsIHByb2Nlc3MuZW52LlBXRClcbiAgICAgICAgICAgIHBzID0gXCIuL1wiICsgcHMuc3Vic3RyKHByb2Nlc3MuZW52LlBXRC5sZW5ndGgpXG4gICAgICAgIGVsc2UgaWYgX3Muc3RhcnRzV2l0aChwLCBwcm9jZXNzLmVudi5IT01FKVxuICAgICAgICAgICAgcHMgPSBcIn5cIiArIHAuc3Vic3RyKHByb2Nlc3MuZW52LkhPTUUubGVuZ3RoKVxuXG4gICAgICAgIGlmIHBzID09ICcvJ1xuICAgICAgICAgICAgcyArPSAnLydcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc3AgPSBwcy5zcGxpdCgnLycpXG4gICAgICAgICAgICBzICs9IGNvbG9yc1snX2hlYWRlciddWzBdICsgc3Auc2hpZnQoKVxuICAgICAgICAgICAgd2hpbGUgc3AubGVuZ3RoXG4gICAgICAgICAgICAgICAgcG4gPSBzcC5zaGlmdCgpXG4gICAgICAgICAgICAgICAgaWYgcG5cbiAgICAgICAgICAgICAgICAgICAgcyArPSBjb2xvcnNbJ19oZWFkZXInXVsxXSArICcvJ1xuICAgICAgICAgICAgICAgICAgICBzICs9IGNvbG9yc1snX2hlYWRlciddW3NwLmxlbmd0aCA9PSAwIGFuZCAyIG9yIDBdICsgcG5cbiAgICAgICAgbG9nIHJlc2V0XG4gICAgICAgIGxvZyBzICsgXCIgXCIgKyByZXNldFxuICAgICAgICBsb2cgcmVzZXRcblxuICAgIGlmIGZpbGVzLmxlbmd0aFxuICAgICAgICBsaXN0RmlsZXMocCwgZmlsZXMpXG5cbiAgICBpZiBhcmdzLnJlY3Vyc2VcbiAgICAgICAgZm9yIHByIGluIGZzLnJlYWRkaXJTeW5jKHApLmZpbHRlciggKGYpIC0+IGZzLmxzdGF0U3luYyhzbGFzaC5qb2luKHAsZikpLmlzRGlyZWN0b3J5KCkgKVxuICAgICAgICAgICAgbGlzdERpcihzbGFzaC5yZXNvbHZlKHNsYXNoLmpvaW4ocCwgcHIpKSlcblxuIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG5cbnBhdGhzdGF0cyA9IGFyZ3MucGF0aHMubWFwIChmKSAtPlxuICAgIHRyeVxuICAgICAgICBbZiwgZnMuc3RhdFN5bmMoZildXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgbG9nX2Vycm9yICdubyBzdWNoIGZpbGU6ICcsIGZcbiAgICAgICAgW11cblxuZmlsZXN0YXRzID0gcGF0aHN0YXRzLmZpbHRlciggKGYpIC0+IGYubGVuZ3RoIGFuZCBub3QgZlsxXS5pc0RpcmVjdG9yeSgpIClcbmlmIGZpbGVzdGF0cy5sZW5ndGggPiAwXG4gICAgbG9nIHJlc2V0XG4gICAgbGlzdEZpbGVzIHByb2Nlc3MuY3dkKCksIGZpbGVzdGF0cy5tYXAoIChzKSAtPiBzWzBdIClcblxuZm9yIHAgaW4gcGF0aHN0YXRzLmZpbHRlciggKGYpIC0+IGYubGVuZ3RoIGFuZCBmWzFdLmlzRGlyZWN0b3J5KCkgKVxuICAgIGxpc3REaXIgcFswXVxuXG5sb2cgXCJcIlxuaWYgYXJncy5zdGF0c1xuICAgIHNwcmludGYgPSByZXF1aXJlKFwic3ByaW50Zi1qc1wiKS5zcHJpbnRmXG4gICAgbG9nIEJXKDEpICsgXCIgXCIgK1xuICAgIGZ3KDgpICsgc3RhdHMubnVtX2RpcnMgKyAoc3RhdHMuaGlkZGVuX2RpcnMgYW5kIGZ3KDQpICsgXCIrXCIgKyBmdyg1KSArIChzdGF0cy5oaWRkZW5fZGlycykgb3IgXCJcIikgKyBmdyg0KSArIFwiIGRpcnMgXCIgK1xuICAgIGZ3KDgpICsgc3RhdHMubnVtX2ZpbGVzICsgKHN0YXRzLmhpZGRlbl9maWxlcyBhbmQgZncoNCkgKyBcIitcIiArIGZ3KDUpICsgKHN0YXRzLmhpZGRlbl9maWxlcykgb3IgXCJcIikgKyBmdyg0KSArIFwiIGZpbGVzIFwiICtcbiAgICBmdyg4KSArIHNwcmludGYoXCIlMi4xZlwiLCBwcm9mKCdlbmQnLCAnbHMnKSkgKyBmdyg0KSArIFwiIG1zXCIgKyBcIiBcIiArXG4gICAgcmVzZXRcbiJdfQ==
//# sourceURL=C:/Users/t.kohnhorst/s/color-ls/coffee/color-ls.coffee