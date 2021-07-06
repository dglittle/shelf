
var shelf = require('./index.js')

print(shelf.create({a: {b: 42}, c: 55}))
print(shelf.to_braid(shelf.create({a: {b: 42}, c: 55})))
print(shelf.to_braid([{a: [{b: [42, 1]}, 2], c: [55, 3]}, 4]))
// print(shelf.create({a: 42}))

{
    let a = [null, -1]
    let b = [null, -1]
    let a_msg = [null, -1]
    let b_msg = [null, -1]

    for (var i = 0; i < 10000; i++) {
        process.stdout.write('.')

        if (!deep_eq(shelf.from_braid(shelf.to_braid(a)), a)) {
            print(a)
            print({to_braid: shelf.to_braid(a)})
            print({from_braid: shelf.from_braid(shelf.to_braid(a))})
            throw Error()
        }

        if (!looks_right(a)) throw Error()
        if (!looks_right(b)) throw Error()
        if (!looks_right(a_msg)) throw Error()
        if (!looks_right(b_msg)) throw Error()

        if (Math.random() < 0.5) {
            let tk = tweek(shelf.read(a))
            let m = shelf.merge(a, shelf.wrap(tk))
            if (!m) throw Error()
            shelf.merge(b_msg, m)
        }

        if (Math.random() < 0.5) {
            let tk = tweek(shelf.read(b))
            let m = shelf.merge(b, shelf.wrap(tk))
            if (!m) throw Error()
            shelf.merge(a_msg, m)
        }

        if (Math.random() < 0.1) {
            shelf.merge(a, a_msg)
            shelf.merge(b, b_msg)
            a_msg = [null, -1]
            b_msg = [null, -1]
            if (!deep_eq(shelf.read(a), shelf.read(b))) throw Error()
        }
    }
}

{
    let a = [null, -1]
    let b = [null, -1]
    let af = null
    let bf = null
    let a_msg = [null, -1]
    let b_msg = [null, -1]

    for (var i = 0; i < 10000; i++) {
        process.stdout.write('.')

        if (!looks_right(a)) throw Error()
        if (!looks_right(b)) throw Error()
        if (!looks_right(a_msg)) throw Error()
        if (!looks_right(b_msg)) throw Error()

        if (Math.random() < 0.2) af = tweek(af)

        if (Math.random() < 0.2) bf = tweek(bf)

        if (Math.random() < 0.2) {
            let diff = shelf.local_update(a, af)
            if (diff) shelf.merge(b_msg, diff)
            if (!deep_eq(shelf.read(a), af)) throw Error()
        }

        if (Math.random() < 0.2) {
            let diff = shelf.local_update(b, bf)
            if (diff) shelf.merge(a_msg, diff)
            if (!deep_eq(shelf.read(b), bf)) throw Error()
        }

        if (Math.random() < 0.1) {
            af = check_shelf_remote_update(a, af, a_msg)
            bf = check_shelf_remote_update(b, bf, b_msg)
            a_msg = [null, -1]
            b_msg = [null, -1]
            if (!deep_eq(shelf.read(a), shelf.read(b))) throw Error()
        }
    }
}

console.log('passed!')

function check_shelf_remote_update(backend, frontend, remote) {
    let orig = clone({backend, frontend, remote})

    let pre_diff = shelf.local_update(clone(backend), frontend, -3.333)

    frontend = shelf.remote_update(backend, frontend, remote)

    let post_diff = shelf.local_update(clone(backend), frontend, -3.333)
    if (!is_shelf_subset(post_diff, pre_diff)) {
        print({pre_diff, post_diff})
        print(orig)
        print({backend, frontend, remote})
        throw Error()
    }

    let lost_diff = shelf.merge(post_diff, pre_diff)
    if (!is_shelf_subset(lost_diff, remote)) {
        print({pre_diff, post_diff, lost_diff})
        print(orig)
        print({backend, frontend, remote})
        throw Error()
    }

    return frontend
}

function is_shelf_subset(s, S) {
    if (!s) return true
    if (!S) return false
    if (s[1] != S[1] || !is_obj(s[0]) || !is_obj(S[0])) return true

    for (let [k, v] of Object.entries(s[0]))
        if (!is_shelf_subset(v, S[0][k])) return false
    return true
}

function print(...a) { console.log(...a.map(x => JSON.stringify(x, null, '    '))) }

function clone(o) { return JSON.parse(JSON.stringify(o)) }

function is_obj(o) { return o && typeof o == 'object' && !Array.isArray(o) }
function equal(a, b) {
    if (is_obj(a)) return is_obj(b)
    if (is_obj(b)) return false
    return JSON.stringify(a) == JSON.stringify(b)
}

function looks_right(s) {
    if (!Array.isArray(s)) return false
    if (s.length < 1 || s.length > 2) return false
    if (!Number.isInteger(s[1]) && s != null && s != 'add') return false
    return is_obj(s[0]) ? Object.entries(s[0]).every(([k, v]) => looks_right(v)) : true
}

function deep_eq(a, b) {
    if (a && typeof a == 'object' && b && typeof b == 'object') {
        return Object.entries(a).every(([k, v]) => deep_eq(v, b[k])) && Object.entries(b).every(([k, v]) => deep_eq(v, a[k]))
    } else return a == b    
}

function create_random_string() {
    return String.fromCharCode('a'.charCodeAt(0) + Math.floor(Math.random() * 26)).repeat(Math.floor(Math.random() * 3) + 1)
}

function create_random_value() {
    if (Math.random() < 0.2) {
        let x = {}
        let n = Math.floor(Math.random() * 4)
        for (let i = 0; i < n; i++) {
            let k = create_random_string()
            x[k] = create_random_value()
        }
        return x
    } else if (Math.random() < 0.25) return Math.floor(Math.random() * 100)
    else if (Math.random() < 0.333) return create_random_string()
    else if (Math.random() < 0.5) return Math.random() < 0.5
    else if (Math.random() < 0.5) return null
    else {
        let a = []
        let n = Math.floor(Math.random() * 4)
        for (let i = 0; i < n; i++) a.push(create_random_value())
        return a
    }
}

function pick(x) {
    return x[Math.floor(Math.random() * x.length)]
}

function tweek(x) {
    if (is_obj(x)) {
        if (Math.random() < 0.2) {
            return null
        } else {
            let k = Math.random() < 0.8 && pick(Object.keys(x))
            if (!k) k = create_random_string()
            x[k] = tweek(x[k] ?? null)
            return x
        }
    } else {
        let new_val = x
        while (equal(new_val, x)) new_val = create_random_value()
        return new_val
    }
}
