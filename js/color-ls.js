// monsterkodi/kode 0.184.0

var _k_ = {in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}, list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}}

var ansi, args, BG, bold, BW, colors, dirString, dotString, exec, extString, fg, filter, fs, fw, getPrefix, groupMap, groupname, groupName, ignore, initArgs, inodeString, karg, linkString, listDir, listFiles, log_error, lpad, main, makeCommand, moduleMain, nameString, os, ownerName, ownerString, pathDepth, reset, rightsString, rpad, rwxString, sizeString, slash, sort, startTime, stats, time, timeString, token, userMap, username, util, _9_33_

startTime = (typeof process.hrtime.bigint === "function" ? process.hrtime.bigint() : undefined)
lpad = require('kstr').lpad
rpad = require('kstr').rpad
time = require('kstr').time

os = require('os')
fs = require('fs')
slash = require('kslash')
filter = require('lodash.filter')
ansi = require('ansi-256-colors')
util = require('util')
args = null
token = {}
bold = '\x1b[1m'
reset = ansi.reset
fg = ansi.fg.getRgb
BG = ansi.bg.getRgb

fw = function (i)
{
    return ansi.fg.grayscale[i]
}

BW = function (i)
{
    return ansi.bg.grayscale[i]
}
stats = {num_dirs:0,num_files:0,hidden_dirs:0,hidden_files:0,maxOwnerLength:0,maxGroupLength:0,brokenLinks:[]}
if (!module.parent || module.parent.id === '.')
{
    karg = require('karg')
    args = karg(`color-ls
    paths           . ? the file(s) and/or folder(s) to display . **
    all             . ? show dot files                  . = false
    dirs            . ? show only dirs                  . = false
    files           . ? show only files                 . = false
    bytes           . ? include size                    . = false
    mdate           . ? include modification date       . = false
    long            . ? include size and date           . = false
    owner           . ? include owner and group         . = false
    rights          . ? include rights                  . = false
    size            . ? sort by size                    . = false
    time            . ? sort by time                    . = false
    kind            . ? sort by kind                    . = false
    nerdy           . ? use nerd font icons             . = false
    execute         . ? execute command for each find result            . - X
    dryrun          . ? print instead of execute commands     . = false . - x
    pretty          . ? pretty size and age             . = true
    ignore          . ? don't recurse into              . = node_modules .git
    info            . ? show statistics                 . = false . - I
    alphabetical    . ? don't group dirs before files   . = false . - A
    offset          . ? indent short listings           . = false . - O
    recurse         . ? recurse into subdirs            . = false . - R
    tree            . ? recurse and indent              . = false . - T
    followSymLinks  . ? recurse follows symlinks        . = false . - S 
    depth           . ? recursion depth                 . = ∞     . - D
    find            . ? filter with a regexp            .           - F
    debug                                               . = false . - Z
    inodeInfos                                          . = false . - N 

version      ${require(`${__dirname}/../package.json`).version}

execute variables: #path #file #dir         `)
}

initArgs = function ()
{
    var noon, _111_40_, _98_18_

    if (args.size)
    {
        args.files = true
    }
    if (args.long)
    {
        args.bytes = true
        args.mdate = true
    }
    if (args.tree)
    {
        args.recurse = true
        args.offset = false
    }
    if (args.dirs && args.files)
    {
        args.dirs = args.files = false
    }
    if ((args.ignore != null ? args.ignore.length : undefined))
    {
        args.ignore = args.ignore.split(' ')
    }
    else
    {
        args.ignore = []
    }
    if (args.depth === '∞')
    {
        args.depth = Infinity
    }
    else
    {
        args.depth = Math.max(0,parseInt(args.depth))
    }
    if (Number.isNaN(args.depth))
    {
        args.depth = 0
    }
    if (args.debug)
    {
        noon = require('noon')
        console.log(noon.stringify(args,{colors:true}))
    }
    if (!(args.paths != null ? args.paths.length : undefined) > 0)
    {
        return args.paths = ['.']
    }
}
colors = {'coffee':[bold + fg(4,4,0),fg(1,1,0),fg(2,2,0)],'koffee':[bold + fg(5,5,0),fg(1,0,0),fg(3,1,0)],'py':[bold + fg(0,3,0),fg(0,1,0),fg(0,2,0)],'rb':[bold + fg(4,0,0),fg(1,0,0),fg(2,0,0)],'json':[bold + fg(4,0,4),fg(1,0,1),fg(2,0,1)],'cson':[bold + fg(4,0,4),fg(1,0,1),fg(2,0,2)],'noon':[bold + fg(4,4,0),fg(1,1,0),fg(2,2,0)],'plist':[bold + fg(4,0,4),fg(1,0,1),fg(2,0,2)],'js':[bold + fg(5,0,5),fg(2,0,2),fg(3,0,3)],'cpp':[bold + fg(5,4,0),fw(3),fg(3,2,0)],'h':[fg(3,1,0),fw(3),fg(2,1,0)],'pyc':[fw(5),fw(3),fw(4)],'log':[fw(5),fw(2),fw(3)],'log':[fw(5),fw(2),fw(3)],'txt':[fw(20),fw(3),fw(4)],'md':[bold + fw(20),fw(3),fw(4)],'markdown':[bold + fw(20),fw(3),fw(4)],'sh':[bold + fg(5,1,0),fg(2,0,0),fg(3,0,0)],'png':[bold + fg(5,0,0),fg(2,0,0),fg(3,0,0)],'jpg':[bold + fg(0,3,0),fg(0,2,0),fg(0,2,0)],'pxm':[bold + fg(1,1,5),fg(0,0,2),fg(0,0,4)],'tiff':[bold + fg(1,1,5),fg(0,0,3),fg(0,0,4)],'tgz':[bold + fg(0,3,4),fg(0,1,2),fg(0,2,3)],'pkg':[bold + fg(0,3,4),fg(0,1,2),fg(0,2,3)],'zip':[bold + fg(0,3,4),fg(0,1,2),fg(0,2,3)],'dmg':[bold + fg(1,4,4),fg(0,2,2),fg(0,3,3)],'ttf':[bold + fg(2,1,3),fg(1,0,2),fg(1,0,2)],'_default':[fw(15),fw(4),fw(10)],'_dir':[bold + BG(0,0,2) + fw(23),fg(1,1,5),bold + BG(0,0,2) + fg(2,2,5)],'_.dir':[bold + BG(0,0,1) + fw(23),bold + BG(0,0,1) + fg(1,1,5),bold + BG(0,0,1) + fg(2,2,5)],'_link':{'arrow':fg(1,0,1),'path':fg(4,0,4),'broken':BG(5,0,0) + fg(5,5,0)},'_arrow':BW(2) + fw(0),'_header':[bold + BW(2) + fg(3,2,0),fw(4),bold + BW(2) + fg(5,5,0)],'_size':{b:[fg(0,0,3),fg(0,0,2)],kB:[fg(0,0,5),fg(0,0,3)],MB:[fg(1,1,5),fg(0,0,4)],GB:[fg(4,4,5),fg(2,2,5)],TB:[fg(4,4,5),fg(2,2,5)]},'_users':{root:fg(3,0,0),default:fg(1,0,1)},'_groups':{wheel:fg(1,0,0),staff:fg(0,1,0),admin:fg(1,1,0),default:fg(1,0,1)},'_error':[bold + BG(5,0,0) + fg(5,5,0),bold + BG(5,0,0) + fg(5,5,5)],'_inodes':{'id':bold + BG(1,0,1) + fg(4,0,4),'lnk':bold + BG(4,0,4) + fg(1,0,1)},'_rights':{'r+':bold + BW(1) + fw(6),'r-':reset + BW(1) + fw(2),'w+':bold + BW(1) + fg(2,2,5),'w-':reset + BW(1) + fw(2),'x+':bold + BW(1) + fg(5,0,0),'x-':reset + BW(1) + fw(2)}}
userMap = {}

username = function (uid)
{
    var childp

    if (!userMap[uid])
    {
        try
        {
            childp = require('child_process')
            userMap[uid] = childp.spawnSync("id",["-un",`${uid}`]).stdout.toString('utf8').trim()
        }
        catch (e)
        {
            console.log(e)
        }
    }
    return userMap[uid]
}
groupMap = null

groupname = function (gid)
{
    var childp, gids, gnms, i

    if (!groupMap)
    {
        try
        {
            childp = require('child_process')
            gids = childp.spawnSync("id",["-G"]).stdout.toString('utf8').split(' ')
            gnms = childp.spawnSync("id",["-Gn"]).stdout.toString('utf8').split(' ')
            groupMap = {}
            for (var _187_22_ = i = 0, _187_26_ = gids.length; (_187_22_ <= _187_26_ ? i < gids.length : i > gids.length); (_187_22_ <= _187_26_ ? ++i : --i))
            {
                groupMap[gids[i]] = gnms[i]
            }
        }
        catch (e)
        {
            console.log(e)
        }
    }
    return groupMap[gid]
}
if ('function' === typeof(process.getuid))
{
    colors['_users'][username(process.getuid())] = fg(0,4,0)
}

log_error = function ()
{
    console.log(" " + colors['_error'][0] + " " + bold + arguments[0] + (arguments.length > 1 && (colors['_error'][1] + [].slice.call(arguments).slice(1).join(' ')) || '') + " " + reset)
}

linkString = function (file)
{
    var s

    s = reset + fw(1) + colors['_link']['arrow'] + " ► "
    s += colors['_link'][(_k_.in(file,stats.brokenLinks)) && 'broken' || 'path']
    try
    {
        s += slash.tilde(fs.readlinkSync(file))
    }
    catch (err)
    {
        s += ' ? '
    }
    return s
}

nameString = function (name, ext)
{
    var icon, icons, _226_86_

    if (args.nerdy)
    {
        icons = require('./icons')
        icon = (colors[(colors[ext] != null) && ext || '_default'][2] + (((_226_86_=icons.get(name,ext)) != null ? _226_86_ : ' '))) + ' '
    }
    else
    {
        icon = ''
    }
    return " " + icon + colors[(colors[ext] != null) && ext || '_default'][0] + name + reset
}

dotString = function (ext)
{
    return colors[(colors[ext] != null) && ext || '_default'][1] + "." + reset
}

extString = function (name, ext)
{
    var icons

    if (args.nerdy && name)
    {
        icons = require('./icons')
        if (icons.get(name,ext))
        {
            return ''
        }
    }
    return dotString(ext) + colors[(colors[ext] != null) && ext || '_default'][1] + ext + reset
}

dirString = function (name, ext)
{
    var c, icon

    c = name && '_dir' || '_.dir'
    icon = args.nerdy && colors[c][2] + ' \uf413' || ''
    return icon + colors[c][0] + (name && (" " + name) || " ") + (ext ? colors[c][1] + '.' + colors[c][2] + ext : "") + " "
}

sizeString = function (stat)
{
    var bar, gb, mb

    if (args.nerdy && args.pretty)
    {
        bar = function (n)
        {
            var b

            b = '▏▎▍▌▋▊▉'
            return b[Math.floor(n / (1000 / 7))]
        }
        if (stat.size === 0)
        {
            return rpad('',8)
        }
        if (stat.size <= 1000)
        {
            return colors['_size']['b'][1] + rpad(bar(stat.size),8)
        }
        if (stat.size <= 10000)
        {
            return fg(0,0,2) + '█' + rpad(bar(stat.size / 10),7)
        }
        if (stat.size <= 100000)
        {
            return fg(0,0,2) + '██' + rpad(bar(stat.size / 100),6)
        }
        if (stat.size <= 1000000)
        {
            return fg(0,0,3) + '███' + rpad(bar(stat.size / 1000),5)
        }
        mb = parseInt(stat.size / 1000000)
        if (stat.size <= 10000000)
        {
            return fg(0,0,2) + '███' + fg(0,0,3) + '█' + fg(0,0,3) + rpad(bar(stat.size / 10000),4)
        }
        if (stat.size <= 100000000)
        {
            return fg(0,0,2) + '███' + fg(0,0,3) + '██' + fg(0,0,3) + rpad(bar(stat.size / 100000),3)
        }
        if (stat.size <= 1000000000)
        {
            return fg(0,0,2) + '███' + fg(0,0,3) + '███' + fg(0,0,4) + rpad(bar(stat.size / 1000000),2)
        }
        gb = parseInt(mb / 1000)
        if (stat.size <= 10000000000)
        {
            return fg(0,0,2) + '███' + fg(0,0,3) + '███' + fg(0,0,4) + '█' + fg(0,0,4) + rpad(bar(stat.size / 10000000),1)
        }
        if (stat.size <= 100000000000)
        {
            return fg(0,0,2) + '███' + fg(0,0,3) + '███' + fg(0,0,4) + '██' + fg(0,0,4) + bar(stat.size / 100000000)
        }
    }
    if (args.pretty && stat.size === 0)
    {
        return lpad(' ',11)
    }
    if (stat.size < 1000)
    {
        return colors['_size']['b'][0] + lpad(stat.size,10) + " "
    }
    else if (stat.size < 1000000)
    {
        if (args.pretty)
        {
            return colors['_size']['kB'][0] + lpad((stat.size / 1000).toFixed(0),7) + " " + colors['_size']['kB'][1] + "kB "
        }
        else
        {
            return colors['_size']['kB'][0] + lpad(stat.size,10) + " "
        }
    }
    else if (stat.size < 1000000000)
    {
        if (args.pretty)
        {
            return colors['_size']['MB'][0] + lpad((stat.size / 1000000).toFixed(1),7) + " " + colors['_size']['MB'][1] + "MB "
        }
        else
        {
            return colors['_size']['MB'][0] + lpad(stat.size,10) + " "
        }
    }
    else if (stat.size < 1000000000000)
    {
        if (args.pretty)
        {
            return colors['_size']['GB'][0] + lpad((stat.size / 1000000000).toFixed(1),7) + " " + colors['_size']['GB'][1] + "GB "
        }
        else
        {
            return colors['_size']['GB'][0] + lpad(stat.size,10) + " "
        }
    }
    else
    {
        if (args.pretty)
        {
            return colors['_size']['TB'][0] + lpad((stat.size / 1000000000000).toFixed(3),7) + " " + colors['_size']['TB'][1] + "TB "
        }
        else
        {
            return colors['_size']['TB'][0] + lpad(stat.size,10) + " "
        }
    }
}

timeString = function (stat)
{
    var age, col, dy, hr, mn, moment, mt, num, range, sec, t, wk, yr

    if (args.nerdy && args.pretty)
    {
        sec = parseInt((Date.now() - stat.mtimeMs) / 1000)
        mn = parseInt(sec / 60)
        hr = parseInt(sec / 3600)
        if (hr < 12)
        {
            if (sec < 60)
            {
                return BG(0,0,1) + '   ' + fg(5,5,5) + '○◔◑◕'[parseInt(sec / 15)] + ' '
            }
            else if (mn < 60)
            {
                return BG(0,0,1) + '  ' + fg(3,3,5) + '○◔◑◕'[parseInt(mn / 15)] + fg(0,0,3) + '◌ '
            }
            else
            {
                return BG(0,0,1) + ' ' + fg(2,2,5) + '○◔◑◕'[parseInt(hr / 3)] + fg(0,0,3) + '◌◌ '
            }
        }
        else
        {
            dy = parseInt(Math.round(sec / (24 * 3600)))
            wk = parseInt(Math.round(sec / (7 * 24 * 3600)))
            mt = parseInt(Math.round(sec / (30 * 24 * 3600)))
            yr = parseInt(Math.round(sec / (365 * 24 * 3600)))
            if (dy < 10)
            {
                return BG(0,0,1) + fg(0,0,5) + ` ${dy} \uf185 `
            }
            else if (wk < 5)
            {
                return BG(0,0,1) + fg(0,0,4) + ` ${wk} \uf186 `
            }
            else if (mt < 10)
            {
                return BG(0,0,1) + fg(0,0,3) + ` ${mt} \uf455 `
            }
            else
            {
                return BG(0,0,1) + fg(0,0,3) + ` ${rpad(yr,2)}\uf6e6 `
            }
        }
    }
    moment = require('moment')
    t = moment(stat.mtime)
    if (args.pretty)
    {
        age = moment().to(t,true)
        var _348_21_ = age.split(' ') ; num = _348_21_[0]        ; range = _348_21_[1]

        if (num[0] === 'a')
        {
            num = '1'
        }
        if (range === 'few')
        {
            num = moment().diff(t,'seconds')
            range = 'seconds'
            return fw(23) + lpad(num,2) + ' ' + fw(16) + rpad(range,7) + ' '
        }
        else if (range.startsWith('year'))
        {
            return fw(6) + lpad(num,2) + ' ' + fw(3) + rpad(range,7) + ' '
        }
        else if (range.startsWith('month'))
        {
            return fw(8) + lpad(num,2) + ' ' + fw(4) + rpad(range,7) + ' '
        }
        else if (range.startsWith('day'))
        {
            return fw(10) + lpad(num,2) + ' ' + fw(6) + rpad(range,7) + ' '
        }
        else if (range.startsWith('hour'))
        {
            return fw(15) + lpad(num,2) + ' ' + fw(8) + rpad(range,7) + ' '
        }
        else
        {
            return fw(18) + lpad(num,2) + ' ' + fw(12) + rpad(range,7) + ' '
        }
    }
    else
    {
        return fw(16) + lpad(t.format("DD"),2) + fw(7) + '.' + fw(12) + t.format("MM") + fw(7) + "." + fw(8) + t.format("YY") + ' ' + fw(16) + t.format("HH") + (col = fw(7) + ':' + fw(14) + t.format("mm") + (col = fw(1) + ':' + fw(4) + t.format("ss") + ' '))
    }
}

ownerName = function (stat)
{
    try
    {
        return username(stat.uid)
    }
    catch (err)
    {
        return stat.uid
    }
}

groupName = function (stat)
{
    try
    {
        return groupname(stat.gid)
    }
    catch (errerr)
    {
        return stat.gid
    }
}

ownerString = function (stat)
{
    var gcl, grp, ocl, own

    own = ownerName(stat)
    grp = groupName(stat)
    ocl = colors['_users'][own]
    if (!ocl)
    {
        ocl = colors['_users']['default']
    }
    gcl = colors['_groups'][grp]
    if (!gcl)
    {
        gcl = colors['_groups']['default']
    }
    return ocl + rpad(own,stats.maxOwnerLength) + " " + gcl + rpad(grp,stats.maxGroupLength)
}

rwxString = function (stat, i)
{
    var mode, r, w, x

    mode = stat.mode
    if (args.nerdy)
    {
        r = ' \uf441'
        w = '\uf040'
        x = stat.isDirectory() && '\uf085' || '\uf013'
        return ((((mode >> (i * 3)) & 0b100) && colors['_rights']['r+'] + r || colors['_rights']['r-'] + r) + (((mode >> (i * 3)) & 0b010) && colors['_rights']['w+'] + w || colors['_rights']['w-'] + w) + (((mode >> (i * 3)) & 0b001) && colors['_rights']['x+'] + x || colors['_rights']['x-'] + x))
    }
    else
    {
        return ((((mode >> (i * 3)) & 0b100) && colors['_rights']['r+'] + ' r' || colors['_rights']['r-'] + '  ') + (((mode >> (i * 3)) & 0b010) && colors['_rights']['w+'] + ' w' || colors['_rights']['w-'] + '  ') + (((mode >> (i * 3)) & 0b001) && colors['_rights']['x+'] + ' x' || colors['_rights']['x-'] + '  '))
    }
}

rightsString = function (stat)
{
    var gr, ro, ur

    ur = rwxString(stat,2)
    gr = rwxString(stat,1)
    ro = rwxString(stat,0) + " "
    return ur + gr + ro + reset
}

inodeString = function (stat)
{
    var lnk

    if (stat.nlink > 1)
    {
        lnk = colors['_inodes']['lnk'] + lpad(stat.nlink,3) + ' ' + reset
    }
    else
    {
        lnk = reset + '    '
    }
    return colors['_inodes']['id'] + lpad(stat.ino,8) + ' ' + lnk
}

getPrefix = function (stat, depth)
{
    var s

    s = ''
    if (args.inodeInfos)
    {
        s += inodeString(stat)
        s += " "
    }
    if (args.rights)
    {
        s += rightsString(stat)
        s += " "
    }
    if (args.owner)
    {
        s += ownerString(stat)
        s += " "
    }
    if (args.mdate)
    {
        s += timeString(stat)
        s += reset
    }
    if (args.bytes)
    {
        s += sizeString(stat)
    }
    if (depth && args.tree)
    {
        s += rpad('',depth * 4)
    }
    if (s.length === 0 && args.offset)
    {
        s += '       '
    }
    return s
}

sort = function (list, stats, exts = [])
{
    var l, moment, unzip, zip

    zip = require('lodash.zip')
    unzip = require('lodash.unzip')
    moment = require('moment')
    l = zip(list,stats,(function() { var r = []; for (var i = 0; i < list.length; i++){ r.push(i); } return r; }).apply(this),(exts.length > 0 && exts || (function() { var r = []; for (var i = 0; i < list.length; i++){ r.push(i); } return r; }).apply(this)))
    if (args.kind)
    {
        if (exts === [])
        {
            return list
        }
        l.sort(function (a, b)
        {
            var m

            if (a[3] > b[3])
            {
                return 1
            }
            if (a[3] < b[3])
            {
                return -1
            }
            if (args.time)
            {
                m = moment(a[1].mtime)
                if (m.isAfter(b[1].mtime))
                {
                    return 1
                }
                if (m.isBefore(b[1].mtime))
                {
                    return -1
                }
            }
            if (args.size)
            {
                if (a[1].size > b[1].size)
                {
                    return 1
                }
                if (a[1].size < b[1].size)
                {
                    return -1
                }
            }
            if (a[2] > b[2])
            {
                return 1
            }
            return -1
        })
    }
    else if (args.time)
    {
        l.sort(function (a, b)
        {
            var m

            m = moment(a[1].mtime)
            if (m.isAfter(b[1].mtime))
            {
                return 1
            }
            if (m.isBefore(b[1].mtime))
            {
                return -1
            }
            if (args.size)
            {
                if (a[1].size > b[1].size)
                {
                    return 1
                }
                if (a[1].size < b[1].size)
                {
                    return -1
                }
            }
            if (a[2] > b[2])
            {
                return 1
            }
            return -1
        })
    }
    else if (args.size)
    {
        l.sort(function (a, b)
        {
            if (a[1].size > b[1].size)
            {
                return 1
            }
            if (a[1].size < b[1].size)
            {
                return -1
            }
            if (a[2] > b[2])
            {
                return 1
            }
            return -1
        })
    }
    return unzip(l)[0]
}

ignore = function (p)
{
    var base

    base = slash.basename(p)
    if (base[0] === '$')
    {
        return true
    }
    if (base === 'desktop.ini')
    {
        return true
    }
    if (base.toLowerCase().startsWith('ntuser'))
    {
        return true
    }
    return false
}
exec = []

listFiles = function (p, dirents, depth)
{
    var alph, d, dirs, dsts, exts, f, fils, fsts

    if (args.alphabetical)
    {
        alph = []
    }
    dirs = []
    fils = []
    dsts = []
    fsts = []
    exts = []
    if (args.owner)
    {
        dirents.forEach(function (de)
        {
            var file, gl, ol, rp, stat

            rp = de.name
            if (slash.isAbsolute(rp))
            {
                file = slash.resolve(rp)
            }
            else
            {
                file = slash.join(p,rp)
            }
            try
            {
                stat = fs.lstatSync(file)
                ol = ownerName(stat).length
                gl = groupName(stat).length
                if (ol > stats.maxOwnerLength)
                {
                    stats.maxOwnerLength = ol
                }
                if (gl > stats.maxGroupLength)
                {
                    return stats.maxGroupLength = gl
                }
            }
            catch (err)
            {
                return
            }
        })
    }
    dirents.forEach(function (de)
    {
        var ext, file, link, lstat, name, rp, s, stat, target

        rp = de.name
        if (slash.isAbsolute(rp))
        {
            file = slash.resolve(rp)
        }
        else
        {
            file = slash.resolve(slash.join(p,rp))
        }
        if (ignore(rp))
        {
            return
        }
        try
        {
            lstat = fs.lstatSync(file)
            link = lstat.isSymbolicLink()
            if (link && os.platform() === 'win32')
            {
                if (slash.tilde(file)[0] === '~')
                {
                    try
                    {
                        target = slash.tilde(fs.readlinkSync(file))
                        if (target.startsWith('~/AppData'))
                        {
                            return
                        }
                        if (_k_.in(target,['~/Documents']))
                        {
                            return
                        }
                    }
                    catch (err)
                    {
                        true
                    }
                }
            }
            stat = link && fs.statSync(file) || lstat
        }
        catch (err)
        {
            if (link)
            {
                stat = lstat
                stats.brokenLinks.push(file)
            }
            else
            {
                return
            }
        }
        ext = slash.ext(file)
        name = slash.base(file)
        if (name[0] === '.')
        {
            ext = name.substr(1) + slash.extname(file)
            name = ''
        }
        if (name.length && name[name.length - 1] !== '\r' || args.all)
        {
            s = getPrefix(stat,depth)
            if (stat.isDirectory())
            {
                if (!args.files)
                {
                    if (!args.tree)
                    {
                        if (name.startsWith('./'))
                        {
                            name = name.slice(2)
                        }
                        s += dirString(name,ext)
                        if (link)
                        {
                            s += linkString(file)
                        }
                        dirs.push(s + reset)
                        if (args.alphabetical)
                        {
                            alph.push(s + reset)
                        }
                        if (args.execute)
                        {
                            exec.push(file)
                        }
                    }
                    dsts.push(stat)
                    return stats.num_dirs += 1
                }
                else
                {
                    return stats.hidden_dirs += 1
                }
            }
            else
            {
                if (!args.dirs)
                {
                    s += nameString(name,ext)
                    if (ext)
                    {
                        s += extString(name,ext)
                    }
                    if (link)
                    {
                        s += linkString(file)
                    }
                    fils.push(s + reset)
                    if (args.alphabetical)
                    {
                        alph.push(s + reset)
                    }
                    fsts.push(stat)
                    exts.push(ext)
                    if (args.execute)
                    {
                        exec.push(file)
                    }
                    return stats.num_files += 1
                }
                else
                {
                    return stats.hidden_files += 1
                }
            }
        }
        else
        {
            if (stat.isFile())
            {
                return stats.hidden_files += 1
            }
            else if (stat.isDirectory())
            {
                return stats.hidden_dirs += 1
            }
        }
    })
    if (args.size || args.kind || args.time)
    {
        if (dirs.length && !args.files)
        {
            dirs = sort(dirs,dsts)
        }
        if (fils.length)
        {
            fils = sort(fils,fsts,exts)
        }
    }
    if (args.alphabetical)
    {
        var list = _k_.list(alph)
        for (var _649_20_ = 0; _649_20_ < list.length; _649_20_++)
        {
            p = list[_649_20_]
            console.log(p)
        }
    }
    else
    {
        var list1 = _k_.list(dirs)
        for (var _651_20_ = 0; _651_20_ < list1.length; _651_20_++)
        {
            d = list1[_651_20_]
            console.log(d)
        }
        var list2 = _k_.list(fils)
        for (var _652_20_ = 0; _652_20_ < list2.length; _652_20_++)
        {
            f = list2[_652_20_]
            console.log(f)
        }
    }
}

listDir = function (de, opt = {})
{
    var alldirents, depth, dirents, doRecurse, msg, p, pn, ps, rs, s, sp

    p = de.name
    if (slash.isRelative(p) && opt.parent)
    {
        p = slash.join(opt.parent,p)
    }
    if (args.recurse)
    {
        depth = pathDepth(p,opt)
        if (depth > args.depth)
        {
            return
        }
    }
    ps = p
    try
    {
        alldirents = fs.readdirSync(p,{withFileTypes:true})
    }
    catch (err)
    {
        true
    }
    if (args.find)
    {
        dirents = filter(alldirents,function (de)
        {
            return RegExp(args.find).test(de.name)
        })
    }
    else
    {
        dirents = alldirents
    }
    if (args.find && !(dirents != null ? dirents.length : undefined))
    {
        true
    }
    else if (args.paths.length === 1 && args.paths[0] === '.' && !args.recurse)
    {
        console.log(reset)
    }
    else if (args.tree)
    {
        console.log(getPrefix(fs.lstatSync(ps),depth - 1) + dirString(slash.base(ps),slash.ext(ps)) + reset)
    }
    else
    {
        s = colors['_arrow'] + " ▶ " + colors['_header'][0]
        ps = slash.tilde(slash.resolve(p))
        rs = slash.relative(ps,process.cwd())
        if (rs.length < ps.length)
        {
            ps = rs
        }
        if (ps === '/')
        {
            s += '/'
        }
        else
        {
            sp = ps.split('/')
            s += colors['_header'][0] + sp.shift()
            while (sp.length)
            {
                pn = sp.shift()
                if (pn)
                {
                    s += colors['_header'][1] + '/'
                    s += colors['_header'][sp.length === 0 && 2 || 0] + pn
                }
            }
        }
        console.log(reset)
        console.log(s + " " + reset)
        console.log(reset)
    }
    if ((dirents != null ? dirents.length : undefined))
    {
        listFiles(p,dirents,depth)
    }
    if (args.recurse)
    {
        doRecurse = function (de)
        {
            var f

            f = de.name
            if (_k_.in(slash.basename(f),args.ignore))
            {
                return false
            }
            if (!args.all && slash.ext(f) === 'app')
            {
                return false
            }
            if (!args.all && f[0] === '.')
            {
                return false
            }
            if (!args.followSymLinks && de.isSymbolicLink())
            {
                return false
            }
            return de.isDirectory() || de.isSymbolicLink() && fs.statSync(slash.join(p,f)).isDirectory()
        }
        try
        {
            var list = _k_.list(filter(alldirents,doRecurse))
            for (var _724_19_ = 0; _724_19_ < list.length; _724_19_++)
            {
                de = list[_724_19_]
                listDir(de,{parent:p,relativeTo:opt.relativeTo})
            }
        }
        catch (err)
        {
            msg = err.message
            if (msg.startsWith("EACCES"))
            {
                msg = "permission denied"
            }
            if (msg.startsWith("EPERM"))
            {
                msg = "permission denied"
            }
            return log_error(msg)
        }
    }
}

pathDepth = function (p, opt)
{
    var rel, _734_44_

    rel = slash.relative(p,((_734_44_=(opt != null ? opt.relativeTo : undefined)) != null ? _734_44_ : process.cwd()))
    if (p === '.')
    {
        return 0
    }
    return rel.split('/').length
}

makeCommand = function (p)
{
    return args.execute.replace(/\#\w+/g,function (s)
    {
        return `${slash[s.slice(1)](p)}`
    })
}

main = function ()
{
    var abspth, childp, cmd, commands, dirstats, ex, file, filestats, noon, p, parent, pathstats, result, _779_18_, _798_36_, _798_54_, _805_63_, _812_42_

    pathstats = args.paths.map(function (f)
    {
        try
        {
            return [f,fs.statSync(f)]
        }
        catch (err)
        {
            log_error('no such file: ',f)
            return []
        }
    })
    pathstats = pathstats.filter(function (f)
    {
        return f.length
    })
    if (!pathstats.length)
    {
        process.exit(1)
    }
    filestats = pathstats.filter(function (f)
    {
        return !f[1].isDirectory()
    })
    if (filestats.length > 0)
    {
        console.log(reset)
        listFiles(process.cwd(),filestats.map(function (s)
        {
            var _767_65_

            s[1].name = ((_767_65_=s[1].name) != null ? _767_65_ : s[0])
            return s[1]
        }))
    }
    dirstats = pathstats.filter(function (f)
    {
        return (f[1] != null ? f[1].isDirectory() : undefined)
    })
    var list = _k_.list(dirstats)
    for (var _771_10_ = 0; _771_10_ < list.length; _771_10_++)
    {
        p = list[_771_10_]
        if (args.tree)
        {
            console.log('')
        }
        if (slash.isRelative(p[0]))
        {
            abspth = slash.resolve(slash.join(process.cwd(),p[0]))
        }
        else
        {
            abspth = slash.resolve(p[0])
        }
        file = slash.file(abspth)
        parent = slash.dir(abspth)
        p[1].name = ((_779_18_=p[1].name) != null ? _779_18_ : file)
        listDir(p[1],{parent:parent,relativeTo:parent})
    }
    if (args.execute && exec)
    {
        noon = require('noon')
        commands = (function () { var result = []; var list1 = _k_.list(exec); for (var _784_43_ = 0; _784_43_ < list1.length; _784_43_++)  { ex = list1[_784_43_];result.push(makeCommand(ex))  } return result }).bind(this)()
        console.log('')
        if (args.dryrun)
        {
            console.log(BG(0,1,0) + fg(0,3,0) + ' dryrun ' + reset)
            console.log('')
            console.log(noon.stringify(commands))
        }
        else
        {
            childp = require('child_process')
            console.log(BG(2,0,0) + fg(5,5,0) + ' execute ' + reset)
            console.log('')
            var list2 = _k_.list(commands)
            for (var _794_20_ = 0; _794_20_ < list2.length; _794_20_++)
            {
                cmd = list2[_794_20_]
                console.log(BW(1) + fw(4) + cmd + reset)
                try
                {
                    result = childp.execSync(cmd,{encoding:'utf8'})
                    if ((result.status != null) || (result.stdout != null))
                    {
                        console.log('dafuk?')
                        console.log(result.stdout)
                        console.log(BG(4,0,0) + fg(5,5,0) + result.stderr + reset)
                    }
                    else
                    {
                        console.log(result)
                    }
                }
                catch (err)
                {
                    console.error(BG(4,0,0) + fg(5,5,0) + (((_805_63_=(err != null ? err.stdout : undefined)) != null ? _805_63_ : err)) + reset)
                }
            }
        }
    }
    console.log("")
    if (args.info)
    {
        console.log(BW(1) + " " + fw(8) + stats.num_dirs + (stats.hidden_dirs && fw(4) + "+" + fw(5) + (stats.hidden_dirs) || "") + fw(4) + " dirs " + fw(8) + stats.num_files + (stats.hidden_files && fw(4) + "+" + fw(5) + (stats.hidden_files) || "") + fw(4) + " files " + fw(8) + time((typeof process.hrtime.bigint === "function" ? process.hrtime.bigint() : undefined) - startTime) + " " + reset)
    }
}
if (args)
{
    initArgs()
    main()
}
else
{
    moduleMain = function (arg, opt = {})
    {
        var oldlog, out, _824_27_

        switch (typeof(arg))
        {
            case 'string':
                args = Object.assign({},opt)
                args.paths = ((_824_27_=args.paths) != null ? _824_27_ : [])
                args.paths.push(arg)
                break
            case 'object':
                args = Object.assign({},arg)
                break
            default:
                args = {paths:['.']}
        }

        initArgs()
        out = ''
        oldlog = console.log
        console.log = function ()
        {
            var list = _k_.list(arguments)
            for (var _835_20_ = 0; _835_20_ < list.length; _835_20_++)
            {
                arg = list[_835_20_]
                out += String(arg)
            }
            return out += '\n'
        }
        main()
        console.log = oldlog
        return out
    }
    module.exports = moduleMain
}