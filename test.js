
var shelf = require('./index.js')

// get_patch
var orig = {a: 5, b: {c: 42}}
var a = shelf.get_patch([null, -1], orig)
if (JSON.stringify(a) != '[{"a":[5,0],"b":[{"c":[42,0]},0]},0]') throw 'fail'

// read
var orig = {a: 5, b: {c: 42}}
var a = [{"a":[5,0],"del":[null,0],"b":[{"c":[42,0]},0]},0]
if (JSON.stringify(shelf.read(a)) != JSON.stringify(orig)) throw 'fail'

// read_into
var orig = {a: 5, b: {c: 42}}
var a = [{"a":[5,0],"del":[null,1],"b":[{"c":[42,0]},0]},0]
var b = {}
shelf.read_into(a, b)
if (JSON.stringify(b) != JSON.stringify(orig)) throw 'fail'

// merge
var a = [{a:[7,0],b:[{c:[42,0]},0]},0]
var b = shelf.get_patch([null, -1], {a: 6, b: {d: 55}})
var x = shelf.merge(b, a)
if (JSON.stringify(b) != '[{"a":[7,0],"b":[{"d":[55,0],"c":[42,0]},0]},0]') throw 'fail'
if (JSON.stringify(x) != '[{"a":[7,0],"b":[{"c":[42,0]},0]},0]') throw 'fail'

var x = shelf.merge(b, a)
if (x) throw 'fail'

var a = [{a:[7],b:[{c:[42]}]}]

var b = shelf.get_patch([null, -1], {a: 6, b: {d: 55}})
var x = shelf.merge(b, a)

if (JSON.stringify(b) != '[{"a":[7,1],"b":[{"d":[55,0],"c":[42,0]},0]},0]') throw 'fail'
if (JSON.stringify(x) != '[{"a":[7,1],"b":[{"c":[42,0]},0]},0]') throw 'fail'

var a = [{a: [55, 1], b: [56, 1]}, 0]
var x = shelf.merge(a, [{a: [100, 0]}, 0])
if (x) throw 'fail'

var x = shelf.merge(a, [{c: [100]}, 0])
if (JSON.stringify(x) != '[{"c":[100,0]},0]') throw 'fail'

var a = [{c: [101]}, 0]
var x = shelf.merge(a, [{c: [100, 0]}, 0])
if (JSON.stringify(a) != '[{"c":[100,0]},0]') throw 'fail'
if (JSON.stringify(x) != '[{"c":[100,0]},0]') throw 'fail'

var a = [{a: [{b: [{c: [3, 0]}, 0]}, 0]}, 0]
var x = shelf.merge(a, [{a: [{b: [{c: [2, 'add']}, 0]}, 0]}, 0])

if (JSON.stringify(a) != '[{"a":[{"b":[{"c":[5,1]},0]},0]},0]') throw 'fail'
if (JSON.stringify(x) != '[{"a":[{"b":[{"c":[5,1]},0]},0]},0]') throw 'fail'

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
