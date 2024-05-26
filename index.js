
function shelf_merge(shelf, incoming) {
    if (!(incoming instanceof Array)) incoming = [incoming, null]
    let [val, ver, change] = merge(shelf[0], shelf[1], incoming[0], incoming[1])
    shelf[0] = val
    shelf[1] = ver
    return change

    function is_obj(o) { return o && typeof o == 'object' && !Array.isArray(o) }
    function ver_num(x) { return (x instanceof Array) ? x[0] : x }

    function make_ver(val) {
        let x = {}
        for (let [k, v] of Object.entries(val))
            x[k] = is_obj(v) ? [1, make_ver(v)] : 1
        return x
    }

    function merge(a_val, a_ver, b_val, b_ver) {
        if (b_ver == null) {
            if (!is_obj(a_val) || !is_obj(b_val)) {
                b_ver = (a_ver ? ver_num(a_ver) : 0) + 1
                if (is_obj(b_val)) b_ver = [b_ver, make_ver(b_val)]
                return [b_val, b_ver, [b_val, b_ver]]
            }
        } else {
            let c = (a_ver != null) ? (ver_num(a_ver) - ver_num(b_ver)) : -1
            if (c > 0) return [a_val, a_ver, null]
            if (c < 0) return [b_val, b_ver, [b_val, b_ver]]
        }

        if (is_obj(a_val) && is_obj(b_val)) {
            let change = null
            for (let key of Object.keys(a_ver[1])) {
                if ((!b_ver && b_val[key] !== undefined) || b_ver?.[1][key] != null) {
                    let [val, ver, c] = merge(a_val[key], a_ver[1][key], b_val[key], b_ver?.[1][key])

                    if (val != null) a_val[key] = val
                    else delete a_val[key]

                    a_ver[1][key] = ver
                    if (c) {
                        if (!change) change = [{}, [ver_num(a_ver), {}]]
                        change[0][key] = c[0]
                        change[1][1][key] = c[1]                            
                    }
                }                    
            }
            for (let key of Object.keys(b_val)) {
                if (a_ver[1][key] == null) {
                    let [val, ver, c] = merge(null, null, b_val[key], b_ver?.[1][key])

                    if (val != null) a_val[key] = val
                    else delete a_val[key]

                    a_ver[1][key] = ver

                    if (!change) change = [{}, [ver_num(a_ver), {}]]
                    change[0][key] = c[0]
                    change[1][1][key] = c[1]
                }
            }
            return [a_val, a_ver, change]
        } else if (JSON.stringify(a_val) > JSON.stringify(b_val)) {
            return [a_val, a_ver, null]
        } else {
            return [b_val, b_ver, [b_val, b_ver]]
        }
    }
}

if (typeof module != 'undefined') module.exports = shelf_merge
