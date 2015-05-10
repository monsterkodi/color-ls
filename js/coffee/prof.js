
/*

00000000   00000000    0000000   00000000
000   000  000   000  000   000  000     
00000000   0000000    000   000  000000  
000        000   000  000   000  000     
000        000   000   0000000   000
 */
var since, start, token;

start = 0;

token = {};

since = function(t) {
  var diff;
  diff = process.hrtime(token[t]);
  return diff[0] * 1000 + diff[1] / 1000000;
};

module.exports = function() {
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
