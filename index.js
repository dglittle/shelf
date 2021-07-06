
var shelf = {}

;(() => {
    function is_obj(o) { return o && typeof o == 'object' && !Array.isArray(o) }
    function greater_than(a, b) {
        if (is_obj(b)) return false
        if (is_obj(a)) return true
        return JSON.stringify(a) > JSON.stringify(b)
    }
    function equal(a, b) {
        if (is_obj(a)) return is_obj(b)
        if (is_obj(b)) return false
        return JSON.stringify(a) == JSON.stringify(b)
    }

    shelf.wrap = s => is_obj(s) ? Object.fromEntries(Object.entries(s).map(([k, v]) => [k, shelf.wrap(v)])) : [s]

    shelf.create = init => {
        let x = [null, -1]
        if (init !== undefined) shelf.merge(x, shelf.wrap(init))
        return x            
    }
    
    shelf.read = (s, ...path) => {
        s = path.reduce((s, x) => s?.[0]?.[x], s)
        if (s && is_obj(s[0])) {
            return Object.fromEntries(Object.entries(s[0]).map(([k, v]) => [k, shelf.read(v)]).filter(([k, v]) => v != null))
        } else return s?.[0]
    }
    shelf.get = shelf.read

    shelf.get_change = (a, b) => {
        return shelf.merge(a, b, true)
    }

    shelf.merge = (a, b, dont_modify) => {
        let change = null

        if (!a) a = [null, -1]
        if (!Array.isArray(b)) b = [b]

        let both_objs = is_obj(a[0]) && is_obj(b[0])
        let eq = equal(a[0], b[0])

        if (b[1] == null) b = [b[0], a[1] + (eq ? 0 : 1)]
        else if (b[1] == 'add') b = [a[0] + b[0], a[1] + 1]

        if (b[1] > (a[1] ?? -1) || (b[1] == a[1] && greater_than(b[0], a[0]))) {
            if (is_obj(b[0])) {
                if (!dont_modify) {
                    a[0] = {}
                    a[1] = b[1]
                }
                change = shelf.merge(dont_modify ? [{}, b[1]] : a, b, dont_modify)
                if (!change) change = [{}, b[1]]
            } else {
                if (!dont_modify) {
                    a[0] = b[0]
                    a[1] = b[1]
                }
                change = b
            }
        } else if (b[1] == a[1] && both_objs) {
            for (let [k, v] of Object.entries(b[0])) {
                if (!dont_modify && !a[0][k]) a[0][k] = [null, -1]
                let diff = shelf.merge(a[0][k], v, dont_modify)
                if (diff) {
                    if (!change) change = [{}, b[1]]
                    change[0][k] = diff
                }
            }
        }
        return change
    }
    
    shelf.mask = (s, mask) => {
        return mask == true || !is_obj(s[0]) ? s : [Object.fromEntries(Object.entries(mask).filter(([k, v]) => s[0][k]).map(([k, v]) => [k, shelf.mask(s[0][k], v)])), s[1]]
    }

    shelf.local_update = (backend, frontend, override_new_version) => {
        if (equal(backend[0], frontend)) {
            if (is_obj(frontend)) {
                var ret = [{}, backend[1]]
                for (let [k, v] of Object.entries(backend[0])) {
                    if (v[0] != null && frontend[k] == null) {
                        v[0] = null
                        v[1] = override_new_version || ((v[1] ?? -1) + 1)
                        ret[0][k] = v
                    }
                }
                for (let [k, v] of Object.entries(frontend)) {
                    if (!backend[0][k]) backend[0][k] = [null, -1]
                    let changes = shelf.local_update(backend[0][k], v, override_new_version)
                    if (changes) ret[0][k] = changes
                }
                return Object.keys(ret[0]).length ? ret : null
            }
        } else {
            backend[1] = override_new_version || ((backend[1] ?? -1) + 1)
            if (is_obj(frontend)) {
                backend[0] = {}
                for (let [k, v] of Object.entries(frontend)) {
                    if (is_obj(v)) {
                        backend[0][k] = [null, -1]
                        shelf.local_update(backend[0][k], v, override_new_version)
                    } else {
                        backend[0][k] = [v, 0]
                    }
                }
            } else backend[0] = frontend
            return backend
        }
    }

    shelf.remote_update = (a, f, b) => {
        if (b[1] > (a[1] ?? -1) || (b[1] == a[1] && greater_than(b[0], a[0]))) {
            a[1] = b[1]
            if (is_obj(b[0])) {
                a[0] = {}
                shelf.merge(a, b)
            } else a[0] = b[0]
            f = shelf.read(a)
        } else if (b[1] == a[1] && is_obj(a[0]) && is_obj(b[0])) {
            for (let [k, v] of Object.entries(b[0])) {
                if (!a[0][k]) a[0][k] = [null, -1]
                if (is_obj(f)) {
                    f[k] = shelf.remote_update(a[0][k], f[k], v)
                    if (f[k] == null) delete f[k]
                } else shelf.merge(a[0][k], v)
            }
        }
        return f
    }

    shelf.proxy = s => {
        // return new Proxy(s, {
        //     get(s, k) {
        //         let v = s[0]?.[k]

        //         if (is_obj(v)) return 


        //         if (!v) return null



        //         if (v) {

        //         }



        //         let v = s[k]




        //         console.log({o, k})
        //         return 55
        //     },
        //     set(s, k, v) {
        //         console.log({o, k, v})
        //     }
        // })





        // let p = new Proxy({}, {
        // })
        
        // p.x = 5
        // console.log(p.y)
        

    }

    shelf.to_braid = s => {
        var vs = []
        var values = []
        function f(s) {
            var x = s[0]
            if (is_obj(x)) x = Object.fromEntries(Object.entries(x).map(([k, v]) => [k, f(v)]))
            else {
                values.push(x)
                x = values.length - 1
            }
            vs.push(s[1])
            return x
        }
        return {json_slice: f(s), values, version: `${Math.random().toString(36).slice(2)}:${vs.join(',')}`}
    }

    shelf.from_braid = ({version, json_slice, values}) => {
        var f = x => {
            if (typeof x == 'object') return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, f(v)]))
            else return values[x]
        }
        var x = f(json_slice)

        var vs = version.split(':')[1].split(',').map(x => 1*x)
        f = x => {
            return [is_obj(x) ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, f(v)])) : x, vs.shift()]
        }
        return f(x)
    }

})()

if (typeof module != 'undefined') module.exports = shelf
