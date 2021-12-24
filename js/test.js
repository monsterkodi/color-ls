// monsterkodi/kode 0.211.0

var _k_ = {in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}}

var cls, kstr, ls, out, slash

slash = require('kslash')
kstr = require('kstr')
ls = require('../')

cls = function ()
{
    var lines, raw, stripped, trimmed

    raw = ls.apply(ls,arguments)
    stripped = kstr.stripAnsi(raw)
    lines = stripped.split('\n')
    trimmed = lines.map(function (s)
    {
        return s.trim()
    })
    trimmed.lines = lines
    trimmed.clrzd = raw.split('\n')
    return trimmed
}
module.exports["ls"] = function ()
{
    section("module", function ()
    {
        compare(typeof(ls) === 'function',true)
    })
    section("ls", function ()
    {
        out = cls()
        compare(_k_.in('js',out) && _k_.in('bin',out) && _k_.in('kode',out) && _k_.in('node_modules',out) && _k_.in('package.noon',out) && _k_.in('package.json',out) && _k_.in('readme.md',out),true)
    })
    section("ls .", function ()
    {
        out = cls('.')
        compare(_k_.in('js',out) && _k_.in('bin',out) && _k_.in('kode',out) && _k_.in('node_modules',out) && _k_.in('package.noon',out) && _k_.in('package.json',out) && _k_.in('readme.md',out),true)
    })
    section("ls bin", function ()
    {
        out = cls('./bin')
        compare(_k_.in('img',out) && _k_.in('test',out) && _k_.in('color-ls',out),true)
    })
    section("cd bin/test and ls .", function ()
    {
        process.chdir('./bin/test')
        out = cls('.')
        compare(_k_.in('Makefile',out),true)
    })
    section("offset", function ()
    {
        out = cls('.',{offset:true})
        compare(_k_.in('        Makefile',out.lines) && _k_.in('        coffee.coffee',out.lines),true)
    })
    section("tree", function ()
    {
        out = cls('a',{tree:true,depth:99,followSymLinks:true})
        compare(_k_.in('a',out[1]),true)
        compare(_k_.in('a.b.c',out[2]),true)
        compare(_k_.in('a.txt',out[3]),true)
        compare(_k_.in('txt.txt',out[4]),true)
        compare(_k_.in('b',out[5]),true)
        if (!slash.win())
        {
            compare(_k_.in('b.lnk ► b.txt',out[6]),true)
        }
    })
    section("recursive", function ()
    {
        out = cls('a',{recurse:true,depth:99,followSymLinks:true})
        compare(_k_.in('▶ a',out[1]),true)
        compare(_k_.in('b',out[3]) && _k_.in('a.b.c',out[4]) && _k_.in('a.txt',out[5]) && _k_.in('txt.txt',out[6]) && _k_.in('▶ a/b',out[8]),true)
        compare(_k_.in('c',out[10]),true)
        if (!slash.win())
        {
            compare(_k_.in('b.lnk ► b.txt',out[11]),true)
        }
    })
}
module.exports["ls"]._section_ = true
module.exports._test_ = true
module.exports
