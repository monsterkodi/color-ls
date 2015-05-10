
/*

 0000000  000000000  00000000 
000          000     000   000
0000000      000     0000000  
     000     000     000   000
0000000      000     000   000
 */
var _, str, strIndent, vsprintf,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

vsprintf = require("sprintf-js").vsprintf;

_ = require('lodash');

strIndent = "    ";

str = function(o, indent, visited) {
  var k, protoname, s, t, v;
  if (indent == null) {
    indent = "";
  }
  if (visited == null) {
    visited = [];
  }
  if (o == null) {
    if (o === null) {
      return "<null>";
    }
    if (o === void 0) {
      return "<undefined>";
    }
    return "<0>";
  }
  t = typeof o;
  if (t === 'string') {
    return o;
  } else if (t === 'object') {
    if (indexOf.call(visited, o) >= 0) {
      if ((o.id != null) && typeof o.id === 'string' && (o.localName != null)) {
        return "<" + o.localName + "#" + o.id + ">";
      }
      return "<visited>";
    }
    protoname = o.constructor.name;
    if ((protoname == null) || protoname === "") {
      if ((o.id != null) && typeof o.id === 'string' && (o.localName != null)) {
        protoname = o.localName + "#" + o.id;
      } else {
        protoname = "object";
      }
    }
    if (protoname === 'Array') {
      s = '[\n';
      visited.push(o);
      s += ((function() {
        var i, len, results;
        results = [];
        for (i = 0, len = o.length; i < len; i++) {
          v = o[i];
          results.push(indent + strIndent + str(v, indent + strIndent, visited));
        }
        return results;
      })()).join("\n");
      s += '\n' + indent + strIndent + ']';
    } else {
      if (o._str != null) {
        return o._str();
      } else {
        s = "<" + protoname + ">\n";
        visited.push(o);
        s += ((function() {
          var i, len, ref, results;
          ref = Object.getOwnPropertyNames(o);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            k = ref[i];
            if (!_.isFunction(o[k])) {
              results.push(indent + strIndent + k + ": " + str(o[k], indent + strIndent, visited));
            }
          }
          return results;
        })()).join("\n");
      }
    }
    return s + "\n";
  } else if (t === 'function') {
    return "->";
  } else {
    return String(o);
  }
  return "<???>";
};

String.prototype.fmt = function() {
  return vsprintf(this, [].slice.call(arguments));
};

module.exports = str;
