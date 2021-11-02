###
000000000  00000000   0000000  000000000
   000     000       000          000   
   000     0000000   0000000      000   
   000     000            000     000   
   000     00000000  0000000      000   
###

chai  = require 'chai'
slash = require 'kslash'
kstr  = require 'kstr'

chai.should()

ls = require '../'

cls = -> 
    
    raw = ls.apply ls, arguments
    stripped = kstr.stripAnsi raw
    lines = stripped.split '\n'
    trimmed = lines.map (s) -> s.trim()
    trimmed.lines = lines
    trimmed.clrzd = raw.split '\n'
    trimmed

describe 'ls' ->
           
    it 'module' ->
        
        ls.should.be.an 'function'
        
    it 'ls' ->
        
        out = cls()
        out.should.include 'js'
        out.should.include 'bin'
        out.should.include 'coffee'
        out.should.include 'node_modules'
        out.should.include 'package.noon'
        out.should.include 'package.json'
        out.should.include 'readme.md'
        
    it 'ls .' ->
        
        out = cls '.'
        out.should.include 'js'
        out.should.include 'bin'
        out.should.include 'coffee'
        out.should.include 'node_modules'
        out.should.include 'package.noon'
        out.should.include 'package.json'
        out.should.include 'readme.md'
        
    it 'ls bin' ->
        
        out = cls './bin'
        out.should.include 'img'
        out.should.include 'test'
        out.should.include 'color-ls'

    it 'cd bin/test and ls .' ->
        
        process.chdir './bin/test'
        out = cls '.'
        out.should.include 'Makefile'
        
    it 'offset' ->
        
        out = cls '.', {offset:true}
        out.lines.should.include '        Makefile'
        out.lines.should.include '        coffee.coffee'
    
    it 'tree' -> # todo: test depth
        
        out = cls 'a', {tree:true, depth:99}
        out[1].should.include 'a'
        out[2].should.include 'a.b.c'
        out[3].should.include 'a.txt'
        out[4].should.include 'txt.txt'        
        out[5].should.include 'b'
        
        if not slash.win()
            out[6].should.include 'b.lnk ► b.txt'
        
    it 'recursive' ->
        
        out = cls 'a', {recurse:true, depth:99}
        out[1].should.include '▶ a'
        
        out[3].should.include 'b'
        out[4].should.include 'a.b.c'
        out[5].should.include 'a.txt'        
        out[6].should.include 'txt.txt'        
        out[8].should.include '▶ a/b'
        
        out[10].should.include 'c'
        
        if not slash.win()
            out[11].should.include 'b.lnk ► b.txt'
        
        