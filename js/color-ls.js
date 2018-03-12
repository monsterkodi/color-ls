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
