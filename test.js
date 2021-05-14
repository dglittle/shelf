
var shelf = require('./index.js')

// get_patch
var orig = {a: 5, b: {c: 42}}
var a = shelf.get_patch([null, -1], orig)
if (JSON.stringify(a) != '[{"a":[5,0],"b":[{"c":[42,0]},0]},0]') throw 'fail'

// read
var orig = {a: 5, b: {c: 42}}
var a = [{"a":[5,0],"b":[{"c":[42,0]},0]},0]
if (JSON.stringify(shelf.read(a)) != JSON.stringify(orig)) throw 'fail'

// merge
var a = [{"a":[5,0],"b":[{"c":[42,0]},0]},0]
var b = shelf.get_patch([null, -1], {a: 6, b: {d: 55}})
var x = shelf.merge(b, a)
if (JSON.stringify(b) != '[{"a":[6,0],"b":[{"d":[55,0],"c":[42,0]},0]},0]') throw 'fail'
if (!x) throw 'fail'

// mask
var b = [{"a":[6,0],"b":[{"d":[55,0],"c":[42,0]},0]},0]
var x = shelf.mask(b, {b: {c: true}})
if (JSON.stringify(x) != '[{"b":[{"c":[42,0]},0]},0]') throw 'fail'

// local_update / remote_update
var orig = {a: 5, b: {c: 42}}
var a = [{"a":[5,0],"b":[{"c":[42,0]},0]},0]
var x = shelf.local_update(a, {a: 5, b: {c: 43}})
if (JSON.stringify(x) != '[{"b":[{"c":[43,1]},0]},0]') throw 'fail'
if (JSON.stringify(a) != '[{"a":[5,0],"b":[{"c":[43,1]},0]},0]') throw 'fail'

var b = shelf.get_patch([null, -1], orig)
var y = shelf.remote_update(b, orig, x)
if (JSON.stringify(b) != '[{"a":[5,0],"b":[{"c":[43,1]},0]},0]') throw 'fail'
if (JSON.stringify(y) != '{"a":5,"b":{"c":43}}') throw 'fail'

// to_braid / from_braid
var a = [{"a":[5,0],"b":[{"c":[42,0]},0]},0]
var braid = shelf.to_braid(a)
var b = shelf.from_braid(braid.version, braid.json_slice, braid.values)
if (JSON.stringify(b) != '[{"a":[5,0],"b":[{"c":[42,0]},0]},0]') throw 'fail'

// done!
console.log('passed!')
