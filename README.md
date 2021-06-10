# shelf

A shelf is at heart, an abstract idea, but to explain it, let's look at a concrete representation of a shelf in javascript: [VALUE, VERSION_NUMBER], where VALUE can be anything, but if it is an object, then its values must themselves be shelves, and VERSION_NUMBER is a number.

Shelves can be merged. [A, B] and [X, Y] merge like this:

1. if the version numbers are different, then the result is the shelf with the higher version number.

2. if the version numbers are the same, then A or X will win according to whichever is an object, or if neither is an object, then the larger one lexiagraphically sorted according to its JSON representation wins.

3. if the version numbers are the same, and A and X are both objects, then take the key/values from both of them, and where they have the same key, set the value equal to the shelf-merging of the values.

``` js

var shelf = require('@glittle/shelf')

or

<script src="https://unpkg.com/@glittle/shelf"></script>

shelf.get_patch(s, patch)
shelf.read(s)
shelf.read_into(s, to)
shelf.merge(a, b)
shelf.mask(s, mask)
shelf.remote_update(backend_shelf, frontend, remote_shelf)
shelf.local_update(backend_shelf, frontend)
shelf.to_braid(s)
shelf.from_braid(version, json_slice, values)

```
