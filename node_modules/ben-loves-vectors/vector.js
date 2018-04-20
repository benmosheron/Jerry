(function () {
if(typeof module === "undefined") module = {};
"use strict";

// Constructor
function Vector(arrayOrVector){
    const array = isAVector(arrayOrVector) ? arrayOrVector.array : arrayOrVector;
    if (!Array.isArray(array)) throw new Error(`Input must be an array. [${array}] is not an array.`);
    if(arguments.length > 1) throw new Error("More than one argument provided to create.");

    // For dimension > 1, we convert each sub array to a vector.
    const vectorArray = array.map(e => Array.isArray(e) ? new Vector(e) : e);
    // This vector's number array.
    this.array = vectorArray;
    // Length of this vector's array.
    this.length = vectorArray.length;
    // The dimension of this vector.
    this.dimension = getDepth(vectorArray);
    // Indicate that we have a vector.
    this.isAVector = true;
    // z, y & z shortcuts
    if(vectorArray.length > 0 && !isAVector(vectorArray[0])) this.x = vectorArray[0];
    if(vectorArray.length > 1 && !isAVector(vectorArray[1])) this.y = vectorArray[1];
    if(vectorArray.length > 2 && !isAVector(vectorArray[2])) this.z = vectorArray[2];
}

//feature requests: 
// zipMany([v1,v2,...,vN], f)
// invert(v1)
// eye()
// diagonal()
// shortcut functions for matrixMultiply, elemwise stuff.
// mutate functions which change array values in place (useful IRL).

// todo: move these to the Vector declarations below
// This is now officially the messiest code base ever D:
// Also consider swapping static/prototype calls to make the static call the prototype.

// Add two vectors of the same size
function add(v1, v2) {
    if (!isAVector(v1)) throw new Error("v1 must be a vector.");
    if (!isAVector(v2)) throw new Error("v2 must be a vector.");
    return Vector.zip(v1,v2,(e1, e2) => e1 + e2);
}

function addScalar(v1, s){
    if(typeof s !== "number") throw new Error("s must be a number");
    return add(v1, Vector.createWithDimensions(v1.size(), s));
}

// Subtract v2 from v1 where v2 and v1 are both vectors of the same length
function sub(v1, v2) {
    return(add(v1, v2.negate()));
}

function subScalar(v1, s){
    return addScalar(v1, -s);
}

// Multiply a vector by a scalar
function multiplyScalar(v, s) {
    return v.cascadeMap(e => e * s);
}

function multiplyElementWise(v1, v2) {
    return Vector.zip(v1, v2, (e1, e2) => e1 * e2);
}

function matrixMultiply(v1, v2) {
    // If either v1 or v2 is a 1D vector, make them 2D
    let to2D = (v) => v.dimension === 1 ? new Vector([v.array]) : v;
    v1 = to2D(v1);
    v2 = to2D(v2);
    if(v1.dimension !== 2 || v1.dimension !== 2) throw new Error("Vectors must be 1D or 2D");
    let s1 = v1.size();
    let s2 = v2.size();
    checkMatrixMultiplyDimensions(s1,s2);
    // We will use the transpose of v2 to make the calculations easier
    let v2t = v2.transpose();
    let temp = [];
    // i will iterate over the rows of v1
    // j will iterate over the cols of v2
    for (var i = 0; i < s1[0]; i++) {
        temp.push([]);
        for (var j = 0; j < s2[1]; j++) {
            // total up elements temp[i,j]
            // zip the elems of the row from v1 with the col from v2
            let row = v1.get(i);
            let col = v2t.get(j);
            temp[i][j] = row
                            .zip(col, (e1, e2) => e1*e2)
                            .reduce((prev, next) => prev + next, 0);
        }
    }
    // collapse dimensions if we have [[n]]
    let result = new Vector(temp);
    if(arraysEqual(result.size(), [1,1])) return temp[0][0];
    return result;
}

// Divide a vector by a scalar
function divideScalar(v, s) {
    return v.multiplyScalar(1/s);
}

// True if the v1 and v2 represent the same vectors (do not need to be the same instance).
function equals(v1, v2) {
    if (!arraysEqual(v1.size(), v2.size())) return false;
    return Vector.cascadeReduce(Vector.zip(v1, v2, (e1, e2) => e1 === e2), (prev, next) => prev && next, true);
}

function isAVector(v){
    if(undef(v) || v === null) return false;
    if(undef(v.isAVector)) return false;
    return v.isAVector;
}

function floor(v) {
    return v.map(e => Math.floor(e));
}

// Create a vector of length two, providing x and (optionally) y values.
function create2(x, y) {
    if (typeof x === "undefined") throw new Error("At least one argument must be provided.");
    if (typeof y === "undefined") y = x;
    return new Vector([x, y]);
}

// Create a 2D vector by providing one, two, or four values
function create2x2(a, b, c, d){
    if (undef(a)) throw new Error("At least one argument must be provided.");

    if (undef(b)){
        // Everything = a
        b = a;
        c = a;
        d = a;
    }
    else{
        // we have a and b
        if(undef(c)){
            c = a;
            d = b;
        }
        else{
            if(undef(d)) throw new Error("Argument 'd' must be provided if 'c' is.");
        }
    }

    return new Vector([[a, b],[c, d]]);
}

// Create a uniform random n-length vector, bounded by min (inclusive) and max (exclusive).
function createRandom(n, min, max) {
    let scale = max - min;
    let array = [];
    for (var i = 0; i < n; i++) {
        array[i] = (Math.random() * scale) + min;
    }
    return new Vector(array);
}

// todo createWithGenerator(dims, (i,j,...) => someValue)

// Create a vector with dimensions dims, and all values val.
function createWithDimensions(dims, val){
    if(!Array.isArray(dims)) throw new Error("dims must be an array.");
    if(undef(val)) throw new Error("val must be defined.");
    
    const l = dims.pop();
    const array = new Array(l).fill(val);

    if(dims.length === 0) return new Vector(array);
    return createWithDimensions(dims, array);
}

// Private functions

function arraysEqual(first, second){
    if(!Array.isArray(first)) throw new Error("first must be an array.");    
    if(!Array.isArray(second)) throw new Error("second must be an array.");
    if(first.length !== second.length) return false;
    for (var i = 0; i < first.length; i++) {
        if(first[i] !== second[i]) return false;
    }
    return true;
}

function getDepthRec(vector, depth){
    depth += 1;
    // Input is always a vector of numbers or other vectors.
    // If it is neither an array nor a vector, return now
    let next = vector.get(0);
    if(!isAVector(next)) return depth;
    return getDepthRec(next, depth);
}

// Input may be an array of elements or vectors.
// Input will either be an array of vectors, or an array of elements.
// Never an array of arrays.
// A -> 123
// A -> VVV -> 123 123 123
// A -> VVV -> VVV VVV VVV -> 123 ... 123
function getDepth(array){ 
    const first = array[0];
    if(!isAVector(first)) return 1
    return getDepthRec(first, 1);
}

function sizeRec(v, dim, sizeArray){
    if(dim === 0) return sizeArray;
    sizeArray.push(v.length);
    return sizeRec(v.get(0), dim - 1, sizeArray);
}

function getElementFromIndex(vector, i){
    if(i >= vector.length) throw new Error(`Index ${i} is out of bounds.`);
    return vector.array[i];
}

function getElementFromIndexArray(vector, indexArray){
    // Assert all are numbers
    if(!indexArray.every(i => typeof i === "number")) throw new Error("get requires all indices to be numbers.");
    // Check dimension is OK
    if(indexArray.length > vector.dimension) throw new Error(`Too many indices [${indexArray.length}] to access a ${vector.dimension}D vector.`);
    if(indexArray.length === 1) return getElementFromIndex(vector, indexArray[0]);
    const i = indexArray.shift();
    return getElementFromIndexArray(getElementFromIndex(vector, i), indexArray);
}

function getElement(vector, i){
    if(!isAVector(vector)) throw new Error(`Not a vector [${vector}]`);
    // if i is an array, use it for multi dimension access.
    // Use an array
    if(Array.isArray(i)){
        return getElementFromIndexArray(vector, i);
    }
    // Use the single index
    return getElementFromIndex(vector, i);
}

function checkMatrixMultiplyDimensions(s1, s2){
    //           a b     c d
    // 1D*T(1D) [n,1] * [1,n] => [n,n] 
    // T(1D)*1D [1,n] * [n,1] => scalar
    // 2D*T(1D)
    //          [n,n] * [n,1] => [n,1]
    // 2D*2D
    //          [n,n] * [n,n] => [n,n]
    // We won't worry about D>2 for now.
    //
    // valid conditions
    //a=b=c=d=n
    //a=b=c=n, d=1
    //b=c=n, a=d=1
    //a=d=n, b=c=1
    //
    // [4,3]*[3,1] this is OK!
    // a=4, b=3, c=3, d=1
    let a = s1[0];let b = s1[1];let c = s2[0];let d = s2[1];
    // Fail if a != d (unless d is 1 and a = b) or b != c
    if(b !== c) throw new Error(`Matrix size mismatch: ${s1} * ${s2}`);
}

function getStringRec(v1){
    let bracket = (s) => `[${s}]`;
    if(!isAVector(v1.get(0))) return bracket(v1.array.join());
    return bracket(v1.map(getStringRec).array.join());
}

function undef(obj){
    return typeof obj === "undefined";
}

Vector.create2 =  create2;
Vector.create2x2 =  create2x2;
Vector.createRandom =  createRandom;
Vector.createWithDimensions =  createWithDimensions;
// Create an nxn vector with diagonal elements x
Vector.diag = function (n, x){
    let array = [];
    for (var i = 0; i < n; i++) {
        array.push([]);
        for (var j = 0; j < n; j++) {
            if(i===j) array[i].push(x);
            else array[i].push(0);
        }
    }
    return new Vector(array);
}
// Create an nxn identity matrix
Vector.eye = function (n) { return Vector.diag(n, 1); }

Vector.get = getElement;
Vector.prototype.get = function (i) { return Vector.get(this, i); };
// Get an array of the lengths of each dimension of v.
Vector.size = function(v){
    if(!isAVector(v)) throw new Error("v must be vector.");
    return sizeRec(v, v.dimension, []);
}
Vector.prototype.size = function () { return Vector.size(this); };

Vector.map = function (v, f, i) { return new Vector(v.array.map(f, i)) };
Vector.prototype.map = function (f, i) { return Vector.map(this, f, i) };

// Apply a function to element pairs of two vectors.
Vector.zip = function(v1, v2, f){
    if (!arraysEqual(v1.size(), v2.size())) throw `Vector addition requires equal sizes ([${v1.size()}] != [${v2.size()}])`;
    return v1.map(function(e1, i){
        let e2 = v2.get(i);
        if(!isAVector(e1)) return f(e1, e2);
        return Vector.zip(e1, e2, f);
    });
}
Vector.prototype.zip = function(v2, f) { return Vector.zip(this, v2, f); };

// Shortcut to array.reduce
Vector.reduce = function (v, f, init) { return v.array.reduce(f, init) };
Vector.prototype.reduce = function (f, init) { return Vector.reduce(this, f, init); };

// Map a function over every element of a vector. Applied recursively to higher dimension vectors.
Vector.cascadeMap = function(v, f){
    if(!isAVector(v)) throw new Error("v must be vector.");
    return v.map(function (e) {
        if(!isAVector(e)) return f(e);
        return Vector.cascadeMap(e, f);
    });
}
Vector.prototype.cascadeMap = function (f) { return Vector.cascadeMap(this, f); };

// Apply an accumulator over all elements of a vector.
Vector.cascadeReduce = function(v, f, init){
    if(!isAVector(v)) "v must be a vector.";
    return v.reduce(function(prev, next){
        if(!isAVector(next)) return f(prev, next);
        return Vector.cascadeReduce(next, f, prev);
    }, init);
}
Vector.prototype.cascadeReduce = function(f, init){ return Vector.cascadeReduce(this, f, init); };

// Collapse a vector to 1 dimension by removing all length 1 dimensions.
Vector.collapse = function(v){
    if(v.size().filter(e => e > 1).length > 1) throw new Error(`Cannot collapse vector with size ${v.size()}.`);

    // drill to first level with >1 value
    function drillRec(v){
        const next = v.get(0);
        if(v.length > 1 || !isAVector(next)) return v;
        return drillRec(next);
    }

    // map to elementary values
    function mapToValues(v){
        function mapRec(e){
            if(!isAVector(e)) return e;
            return mapRec(e.get(0));
        }
        return v.map(mapRec);
    }

    return mapToValues(drillRec(v));
}
Vector.prototype.collapse = function () { return Vector.collapse(this); };

function transpose(v) {
    // If vector is 1D, we can wrap it in an empty vector to create vector with size [1,2]
    if(v.dimension === 1) v = new Vector([v.array]);
    if(v.dimension > 2) throw new Error(`transpose is not implemented for dimension > 2.`);
    let temp = [];
    for (var j = 0; j < v.size()[1]; j++) {
        temp.push([]);
        for (var i = 0; i < v.size()[0]; i++) {
            temp[j][i] = v.get([i,j]);
        }
    }
    return new Vector(temp);
}

// Calculate the magnitude of a vector.
Vector.magnitude = function (v) {
    if(v.dimension > 1) throw new Error("Not implemented for dimensions > 1.");
    if (v.length === 0) {
        return 0;
    }
    return Math.sqrt(v.reduce(function (t, n) { return t + (n * n); }, 0));
}
Vector.prototype.magnitude = function () { return Vector.magnitude(this); };

// Calculate a new magnitude s vector with the same direction as v.
Vector.normalise = function (v, s) {
    if (v.dimension > 1) throw new Error("Not implemented for dimensions > 1.");
    if (typeof s === "undefined") s = 1;
    if (v.magnitude() === 0) return v.map(e => e);
    return v.multiplyScalar(s / v.magnitude());
}
Vector.prototype.normalise = function (s) { return Vector.normalise(this, s); };

// Swap a 2D vector's rows and columns
Vector.transpose = transpose;
Vector.prototype.transpose = function () { return Vector.transpose(this); };

Vector.negate = function (v1) { return v1.cascadeMap((e) => -e); }
Vector.prototype.negate = function () { return Vector.negate(this); };

Vector.add = add;
Vector.prototype.add = function (v2) { return Vector.add(this, v2); };
Vector.addScalar = addScalar;
Vector.prototype.addScalar = function (s) { return Vector.addScalar(this, s); };
Vector.sub = sub;
Vector.prototype.sub = function (v2) { return Vector.sub(this, v2); };
Vector.subScalar = subScalar;
Vector.prototype.subScalar = function (s) { return Vector.subScalar(this, s); };
Vector.multiplyScalar = multiplyScalar;
Vector.prototype.multiplyScalar = function (s) { return Vector.multiplyScalar(this, s); };
Vector.multiplyElementWise = multiplyElementWise;
Vector.prototype.multiplyElementWise = function (v2) { return Vector.multiplyElementWise(this, v2); };
Vector.matrixMultiply = matrixMultiply;
Vector.prototype.matrixMultiply = function (v2) { return Vector.matrixMultiply(this, v2); };
Vector.divideScalar = divideScalar;
Vector.prototype.divideScalar = function (s) { return Vector.divideScalar(this, s); };
Vector.equals = equals;
Vector.prototype.equals = function (v2) { return Vector.equals(this, v2); };
Vector.floor = floor;
Vector.prototype.floor = function () { return Vector.floor(this); };
Vector.toString = function (v) { return getStringRec(v); };
Vector.prototype.toString = function(){ return Vector.toString(this); };

// Mutate a vectors underlying array by changing the value at a location.
// Location is an array of the indices of the location.
Vector.mutate = function(v, locationArray, newValue){
    const i = locationArray.shift();
    if(locationArray.length === 0) {
        v.array[i] = newValue;
        return;
    }
    Vector.mutate(v.get(i), locationArray, newValue);
}
Vector.prototype.mutate = function (locationArray, newValue) { return Vector.mutate(this, locationArray, newValue); };

module.exports = Vector;

try {
    // Assign the global variable "vector" in the browser.
    window.Vector = module.exports;
} catch (e) {}

})();