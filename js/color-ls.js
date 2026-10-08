// monsterkodi/kode 0.275.0

var _k_ = {list: function (l) {return l != null ? typeof l.length === 'number' ? l : [] : []}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}}

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
    var childp, entry, group, groups, _193_18_

    if (!groupMap)
    {
        try
        {
            childp = require('child_process')
            groups = childp.spawnSync('getent',['group']).stdout.toString('utf8').split('\n')
        }
        catch (e)
        {
            groups = []
        }
        if (!groups.length && fs.existsSync('/etc/group'))
        {
            groups = fs.readFileSync('/etc/group','utf8').split('\n')
        }
        groupMap = {}
        var list = _k_.list(groups)
        for (var _190_18_ = 0; _190_18_ < list.length; _190_18_++)
        {
            group = list[_190_18_]
            entry = group.split(':')
            if (entry.length > 2 && entry[2])
            {
                groupMap[entry[2]] = entry[0]
            }
        }
    }
    return ((_193_18_=groupMap[gid]) != null ? _193_18_ : `${gid}`)
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
    var icon, icons, _228_86_

    if (args.nerdy)
    {
        icons = require('./icons')
        icon = (colors[(colors[ext] != null) && ext || '_default'][2] + (((_228_86_=icons.get(name,ext)) != null ? _228_86_ : ' '))) + ' '
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
        var _350_21_ = age.split(' '); num = _350_21_[0]; range = _350_21_[1]

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
        for (var _651_20_ = 0; _651_20_ < list.length; _651_20_++)
        {
            p = list[_651_20_]
            console.log(p)
        }
    }
    else
    {
        var list1 = _k_.list(dirs)
        for (var _653_20_ = 0; _653_20_ < list1.length; _653_20_++)
        {
            d = list1[_653_20_]
            console.log(d)
        }
        var list2 = _k_.list(fils)
        for (var _654_20_ = 0; _654_20_ < list2.length; _654_20_++)
        {
            f = list2[_654_20_]
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
            for (var _726_19_ = 0; _726_19_ < list.length; _726_19_++)
            {
                de = list[_726_19_]
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
    var rel, _736_44_

    rel = slash.relative(p,((_736_44_=(opt != null ? opt.relativeTo : undefined)) != null ? _736_44_ : process.cwd()))
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
    var abspth, childp, cmd, commands, dirstats, ex, file, filestats, noon, p, parent, pathstats, result, _781_18_, _800_36_, _800_54_, _807_63_, _814_42_

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
            var _769_65_

            s[1].name = ((_769_65_=s[1].name) != null ? _769_65_ : s[0])
            return s[1]
        }))
    }
    dirstats = pathstats.filter(function (f)
    {
        return (f[1] != null ? f[1].isDirectory() : undefined)
    })
    var list = _k_.list(dirstats)
    for (var _773_10_ = 0; _773_10_ < list.length; _773_10_++)
    {
        p = list[_773_10_]
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
        p[1].name = ((_781_18_=p[1].name) != null ? _781_18_ : file)
        listDir(p[1],{parent:parent,relativeTo:parent})
    }
    if (args.execute && exec)
    {
        noon = require('noon')
        commands = (function () { var r_786_43_ = []; var list1 = _k_.list(exec); for (var _786_43_ = 0; _786_43_ < list1.length; _786_43_++)  { ex = list1[_786_43_];r_786_43_.push(makeCommand(ex))  } return r_786_43_ }).bind(this)()
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
            for (var _796_20_ = 0; _796_20_ < list2.length; _796_20_++)
            {
                cmd = list2[_796_20_]
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
                    console.error(BG(4,0,0) + fg(5,5,0) + (((_807_63_=(err != null ? err.stdout : undefined)) != null ? _807_63_ : err)) + reset)
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
        var oldlog, out, _826_27_

        switch (typeof(arg))
        {
            case 'string':
                args = Object.assign({},opt)
                args.paths = ((_826_27_=args.paths) != null ? _826_27_ : [])
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
            for (var _837_20_ = 0; _837_20_ < list.length; _837_20_++)
            {
                arg = list[_837_20_]
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3ItbHMuanMiLCJzb3VyY2VzIjpbImNvbG9yLWxzLmtvZGUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQVFBLG9CQUFZLFFBQVEsT0FBTztPQUVKLFFBQVE7Ozs7QUFDL0IsS0FBUyxRQUFRO0FBQ2pCLEtBQVMsUUFBUTtBQUNqQixRQUFTLFFBQVE7QUFDakIsU0FBUyxRQUFRO0FBQ2pCLE9BQVMsUUFBUTtBQUNqQixPQUFTLFFBQVE7QUFFakIsT0FBUTtBQUNSO0FBRUEsT0FBUztBQUNULFFBQVM7QUFDVCxLQUFTLFFBQVE7QUFDakIsS0FBUyxLQUFLLEdBQUc7O0FBQ2pCLFVBQVU7O1dBQU0sR0FBa0IsRUFBYixHQUFHOzs7QUFDeEIsVUFBVTs7V0FBTSxHQUFrQixFQUFiLEdBQUc7O0FBRXhCLFNBQ0ksU0FBZ0IsRUFDaEIsWUFDQSxjQUNBLGVBQ0EsaUJBQ0EsaUJBQ0E7S0FRRyxPQUFPLHdCQUF3QixPQUFNOztJQUV4QyxPQUFPLFFBQVE7SUFDZixPQUFPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTlDNkIsZUFBeEMsV0FBQTs7Ozs7QUFpRkE7Ozs7UUFFTyxLQUFLOztRQUdMLEtBRk0sUUFBUTs7UUFHYixLQURJOztRQUVKLEtBREssUUFBUTtRQUdkLEtBRk0sUUFBUTs7UUFHYixLQURJOztRQUVKLEtBREssVUFBVTtRQUdoQixLQUZNLFNBQVU7O1FBRUYsS0FBVCxhQUFjOztRQUduQix5QkFGMEI7O1NBR3pCLEtBREksNkJBQVE7O1FBR1osS0FBSyxxQkFGcUIsTUFBTTs7Ozs7O1FBSVYsS0FBbEIsVUFBUzs7UUFDWixLQUFLLFFBRDZCOzs7O1FBQ0EsS0FBSyxRQUExQixLQUFLLElBQUksRUFBRzs7UUFDM0IsT0FBTyxNQUFNLEtBQUs7O1FBRWxCLGFBRjBDOzthQUVyQzs7UUFDSixPQUFPLFFBQVE7UUFDZixZQUFJLEtBQUssVUFBVSxNQUFNLE9BQU87O1VBRXBDLEtBQStCLDJCQUFPLHNCQUFTOzs2QkFBakM7OztBQVFsQixVQUNJLFVB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
//# sourceURL=kode/color-ls.kode
