// koffee 0.52.0

/*
000000000  00000000   0000000  000000000
   000     000       000          000   
   000     0000000   0000000      000   
   000     000            000     000   
   000     00000000  0000000      000
 */
var _, chai, ref;

ref = require('kxk'), chai = ref.chai, _ = ref._;

chai();

describe('ls', function() {
    return it('as a module', function() {
        var ls;
        if (koffee_17_8 = process.hrtime.bigint()) {
            ls = require('../');
            console.log('require color-ls', (function(b){ let f=1000n; for (let u of ['ns','μs','ms','s']) { if (u=='s' || b<f) { return ''+(1000n*b/f)+u; } f*=1000n; }})(process.hrtime.bigint()-koffee_17_8));
        };
        return ls.should.be.an('function');
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBYyxPQUFBLENBQVEsS0FBUixDQUFkLEVBQUUsZUFBRixFQUFROztBQUVSLElBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQVMsSUFBVCxFQUFjLFNBQUE7V0FFVixFQUFBLENBQUcsYUFBSCxFQUFpQixTQUFBO0FBRWQsWUFBQTtRQUFBLElBQUEscUNBQUE7WUFBNkIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxLQUFSLEVBQWxDO2lOQUFBOztlQUNDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQWIsQ0FBZ0IsVUFBaEI7SUFIYSxDQUFqQjtBQUZVLENBQWQiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICBcbiMjI1xuXG57IGNoYWksIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuY2hhaSgpXG5cbmRlc2NyaWJlICdscycgLT5cbiAgICAgICAgICBcbiAgICBpdCAnYXMgYSBtb2R1bGUnIC0+XG4gICAgICAgXG4gICAgICAgIOKWuHByb2ZpbGUgJ3JlcXVpcmUgY29sb3ItbHMnIGxzID0gcmVxdWlyZSAnLi4vJ1xuICAgICAgICBscy5zaG91bGQuYmUuYW4gJ2Z1bmN0aW9uJyJdfQ==
//# sourceURL=../coffee/test.coffee