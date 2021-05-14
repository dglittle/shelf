
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

    shelf.get_patch = (s, patch) => {
        if (is_obj(patch)) {
            return [
                Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, shelf.get_patch(is_obj(s[0]) ? (s[0][k] ?? [null, s[1] - 1]) : [null, s[1]], v)]).filter(x => x[1])),
                s[1] + (is_obj(s[0]) ? 0 : 1)
            ]
        } else if (equal(s[0], patch)) {
            return null
        } else return [patch, s[1] + 1]
    }
    
    shelf.read = s => {
        if (is_obj(s[0])) {
            return Object.fromEntries(Object.entries(s[0]).map(([k, v]) => [k, shelf.read(v)]).filter(([k, v]) => v != null))
        } else return s[0]
    }

    shelf.merge = (a, b) => {
        var did_something = false
        if (is_obj(a[0]) && is_obj(b[0])) {
            if (b[1] > a[1]) {
                did_something = true
                a[1] = b[1]
                for (let [k, v] of Object.entries(a[0]))
                    if (v[1] < a[1]) delete a[0][k]
            }
            for (let [k, v] of Object.entries(b[0])) {
                if (v[1] < a[1]) continue
                if (!a[0][k]) {
                    did_something = true
                    a[0][k] = [null, -1]
                }
                if (shelf.merge(a[0][k], v)) did_something = true
            }
        } else {
            if (b[1] > a[1] || (b[1] == a[1] && greater_than(b[0], a[0]))) {
                did_something = true
                a[0] = b[0]
                a[1] = b[1]
            }
        }
        return did_something
    }
    
    shelf.mask = (s, mask) => {
        return mask == true || !is_obj(s[0]) ? s : [Object.fromEntries(Object.entries(mask).filter(([k, v]) => s[0][k]).map(([k, v]) => [k, shelf.mask(s[0][k], v)])), s[1]]
    }

    shelf.remote_update = (backend_shelf, frontend, remote_shelf) => {
    
        if ((remote_shelf[1] > backend_shelf[1] || (remote_shelf[1] == backend_shelf[1] && greater_than(remote_shelf[0], backend_shelf[0]))) && equal(backend_shelf[0], frontend)) {
            backend_shelf[1] = remote_shelf[1]
            
            if (is_obj(remote_shelf[0])) {
                if (!is_obj(backend_shelf[0])) {
                    backend_shelf[0] = {}
                    frontend = {}
                } else {
                    for (let [k, v] of Object.entries(backend_shelf[0])) {
                        if (v[1] < remote_shelf[1]) {
                            delete backend_shelf[0][k]
                            delete frontend[k]
                        }
                    }
                }
            } else {
                backend_shelf[0] = frontend = remote_shelf[0]
            }
        }
    
        if (is_obj(backend_shelf[0]) && is_obj(remote_shelf[0])) {
            for (let [k, v] of Object.entries(remote_shelf[0])) {
                if (v[1] < backend_shelf[1]) continue
                if (!backend_shelf[0][k]) backend_shelf[0][k] = [null, -1]
                frontend[k] = shelf.remote_update(backend_shelf[0][k], frontend[k], v)
                if (frontend[k] == null) delete frontend[k]
            }
        }
    
        return frontend
    }    

    shelf.local_update = (backend_shelf, frontend) => {
        if (equal(backend_shelf[0], frontend)) {
            if (is_obj(frontend)) {
                var ret = [{}, backend_shelf[1]]
                for (let [k, v] of Object.entries(backend_shelf[0])) {
                    if (v[0] != null && frontend[k] == null) {
                        v[0] = null
                        v[1]++
                        ret[0][k] = v
                    }
                }
                for (let [k, v] of Object.entries(frontend)) {
                    if (!backend_shelf[0][k]) backend_shelf[0][k] = [null, backend_shelf[1] - 1]
                    let changes = shelf.local_update(backend_shelf[0][k], v)
                    if (changes) ret[0][k] = changes
                }
                return Object.keys(ret[0]).length ? ret : null
            }
        } else {
            backend_shelf[1]++
            if (is_obj(frontend)) {
                backend_shelf[0] = {}
                for (let [k, v] of Object.entries(frontend)) {
                    if (is_obj(v)) {
                        backend_shelf[0][k] = [null, backend_shelf[1] - 1]
                        shelf.local_update(backend_shelf[0][k], v)
                    } else {
                        backend_shelf[0][k] = [v, backend_shelf[1]]
                    }
                }
            } else backend_shelf[0] = frontend
            return backend_shelf
        }
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

    shelf.from_braid = (version, json_slice, values) => {
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
