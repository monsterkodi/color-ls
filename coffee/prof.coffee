###

00000000   00000000    0000000   00000000
000   000  000   000  000   000  000     
00000000   0000000    000   000  000000  
000        000   000  000   000  000     
000        000   000   0000000   000     

###

start = 0
token = {}

since = (t) ->
  diff = process.hrtime token[t]
  diff[0] * 1000 + diff[1] / 1000000
  
module.exports = () -> 
    if arguments.length == 2
        cmd = arguments[0]
        t = arguments[1]
    else if arguments.length == 1
        t = arguments[0]
        cmd = 'start' 

    start = process.hrtime()
    if cmd == 'start'
        token[t] = start
    else if cmd == 'end'
        since(t)
        
