# shelf

Here is a shelf: [VALUE, VERSION_NUMBER]
* VALUE: anything, but if it is an object, then its values must be shelves (i.e. shelves are recursive)
* VERSION_NUMBER: a number generally starting at 0 and going up with each change

Shelves can be merged. [A, A#] and [B, B#] merge like this:
* if A# > B#, then result is [A, A#]
* if B# > A#, then result is [B, B#]
* if A# == B#, then result is [X, A#], where:
    * if A and B are both objects, then X is an object where for every key in either A or B, X[key] = recursive_merge(A[k], B[k])
    * else if JSON(A) > JSON(B), then X is A
    * else X is B

# install

``` js
var shelf = require('@glittle/shelf')

or

<script src="https://unpkg.com/@glittle/shelf"></script>
```

# API

here's how to use the `create`, `read`, `get`, `merge`, `get_change`, and `mask` functions..

``` js
shelf.create({a: 42})              --> [{a: [42, 0]}, 0]

shelf.read([{a: [42, 0]}, 0])      --> {a: 42}
shelf.read([{a: [42, 0]}, 0], 'a') --> 42

shelf.get = shelf.read

// here's the merge function
            a = [{a: [42, 0], b: [42, 0], c: [42, 0]}, 0]
shelf.merge(a,  [{a: [42, 0],             c: [43, 1]}, 0]) --> 
                [{                        c: [43, 1]}, 0], // returns what changed
   and a is now [{a: [42, 0], b: [42, 0], c: [43, 1]}, 0]

// you can leave off versions, and it will create them..
shelf.merge(a,  [{a: [42   ],             c: [43   ]}   ])

// you can leave off []'s, and it will create them too..
shelf.merge(a,   {a:  42    ,             c:  43    }    )

// we can also just get the change, without modifying our inputs
shelf.get_change(
    [{a: [42, 0], b: [42, 0], c: [42, 0]}, 0],
    [{a: [42, 0],             c: [43, 1]}, 0]) -->
    [{                        c: [43, 1]}, 0] // returns what changed

shelf.get_change(
    [{a: [42, 0], b: [42, 0], c: [43, 1]}, 0],
    [{a: [42, 0],             c: [42, 0]}, 0]) --> null // no change!


shelf.mask([{a: [42, 0], b: [43, 1]}, 0], {b: true}) --> [{b: [43, 1]}, 0]
```

# fancy API `local_update/remote_update`

here is a paradigm for some clients to synchronize their state.
each client has a shelf called `backend`,
and a regular javascript object called `frontend`.
when an end-user makes a change, they modify their `frontend` directly.
when a client wants to commit the recent changes made to their `frontend`,
they call `local_update(backend, frontend)`,
and send the return value `CHANGE` to all the other clients,
who each then call `remote_update(backend, frontend, CHANGE)`,
which will merge the change into `backend`,
and even modify `frontend` in a sensible way,
namely only modifying `frontend` in places where it was the same as `backend` before the `CHANGE`.
let's see it in action..

``` js
// client Alice
backend  = [{a: [42, 0],   b: [42, 0]}, 0] 
frontend =  {              b:  55    }
CHANGE   = shelf.local_update(backend, frontend) -->
           [{a: [null, 1], b: [55, 1]}, 0] // returns change

// client Bob
backend  = [{a: [42, 0],   b: [42, 0]}, 0] 
frontend =  {a:  42,       b:  43    }     // user has modified b
CHANGE   = [{a: [null, 1], b: [55, 1]}, 0] // from Alice
shelf.remote_update(backend, frontend, CHANGE) -->
            {              b:  43    } // returns new frontend (and modifies it)
                                       // note b is still 43
backend is [{a: [null, 1], b: [55, 1]}, 0]
```

# braid API

here are a couple methods to assist in using shelves with the braid protocol

``` js
shelf.to_braid([{a: [{b: [42, 1]}, 2], c: [55, 3]}, 4]) -->
{
    "json_slice": {"a": {"b": 0}, "c": 1}, // key/path information encoded here,
                                           // where values are indexes into "values" array;
    "values": [42, 55],                    // <-- here is that "values" array;
    "version": "random_prefix:1,2,3,4"     // all version numbers encoded here
}

shelf.from_braid({
    "json_slice": {"a": {"b": 0}, "c": 1}, 
    "values": [42, 55],
    "version": "random_prefix:1,2,3,4"
}) --> [{a: [{b: [42, 1]}, 2], c: [55, 3]}, 4] // we're back where we started!
```

# utility API

here are some utility methods used internally, but maybe useful outside

``` js
shelf.wrap({a: 42}) --> [{a: [42]}]
```
