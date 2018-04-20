# ben-loves-vectors
A node package for vectors and matrices of arbitrary size and dimension.

Create vectors by calling `new Vector(array)`, for example:

```javascript
let v = new Vector([1,2,3]);
```
`v` is a 1-dimensional vector of length 3, with components 1, 2 and 3.

Higher dimensional vectors are created with nested arrays, and are represented by the module as vectors of vectors.

```javascript
let v2D = new Vector([[1,2,3],[4,5,6]]);
```
`v2D` represents the 2D matrix:
```
1 2 3
4 5 6
```

## High Level Functions

* size
* magnitude
* normalise
* transpose
* negate
* add
* addScalar
* sub
* subScalar
* multiplyScalar
* multiplyElementWise
* matrixMultiply
* divideScalar
* equals
* isAVector
* floor


## Low Level Functions

These functions act on the arrays wrapped in vector objects.

* vector.map
* vector.reduce
* zip
* cascadeMap
* cascadeReduce

## Vector Creation Functions

* create
* create2
* create2x2
* createRandom
* createWithDimensions
