
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
    
    shelf.read_into = (s, to) => {
        if (is_obj(s[0])) {
            if (typeof to != 'object') to = {}
            for (let k of Object.keys(to)) if (!s[0][k]) delete to[k]
            for (let k of Object.keys(s[0])) {
                to[k] = shelf.read_into(s[0][k], to[k])
                if (to[k] == null) delete to[k]
            }
            return to
        } else return s[0]
    }

    shelf.get = (s, ...path) => path.reduce((cur, x) => cur?.[x]?.[0], s?.[0])

    shelf.get_change = (a, b) => {
        return shelf.merge(a, b, true)
    }

    shelf.merge = (a, b, dont_modify) => {
        let change = null

        if (!a) a = [null, -1]
        if (!Array.isArray(b)) b = [b]

        let both_objs = is_obj(a[0]) && is_obj(b[0])

        if (b[1] == null) b = [b[0], a[1] + (both_objs ? 0 : 1)]
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

    shelf.remote_update = (backend_shelf, frontend, remote_shelf) => {
        var save_frontend = shelf.read(shelf.get_patch(backend_shelf, frontend))
        shelf.merge(backend_shelf, remote_shelf)
        shelf.local_update(backend_shelf, save_frontend)
        return shelf.read_into(backend_shelf, frontend)
    }

    shelf.local_update = (backend_shelf, frontend) => {
        return shelf.merge(backend_shelf, shelf.get_patch(backend_shelf, frontend))
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
