# shelf

A shelf is at heart, an abstract idea, but to explain it, let's look at a concrete representation of a shelf in javascript: [VALUE, VERSION_NUMBER], where VALUE can be anything, but if it is an object, then its values must themselves be shelves, and VERSION_NUMBER is a number.

Shelves can be merged. [A, B] and [X, Y] merge like this:
1. if the version numbers are different, then the shelf with WORK HERE


``` js

var shelf = require('@glittle/shelf')
or
<script src="https://unpkg.com/@glittle/shelf"></script>

shelf.get_patch(s, patch)
shelf.read(s)
shelf.merge(a, b)
shelf.mask(s, mask)
shelf.remote_update(backend_shelf, frontend, remote_shelf)
shelf.local_update(backend_shelf, frontend)
shelf.to_braid(s)
shelf.from_braid(version, json_slice, values)

```
