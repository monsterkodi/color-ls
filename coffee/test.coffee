###
000000000  00000000   0000000  000000000
   000     000       000          000   
   000     0000000   0000000      000   
   000     000            000     000   
   000     00000000  0000000      000   
###

{ chai, _ } = require 'kxk'

chai()

describe 'ls' ->
          
    it 'as a module' ->
       
        ▸profile 'require color-ls' ls = require '../'
        ls.should.be.an 'function'