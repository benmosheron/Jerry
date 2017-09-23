// Functions for working with a hex grid.
function hexagon(canvasWidth, canvasHeight, hexSize){
    const root3 = Math.sqrt(3);
    let s = hexSize;
    // lower horizontal bound on hexagons
    const xBound = Math.floor(transformToHex([canvasWidth, 0], s)[0]);
    // -(s/root3) because every other vertical column will be s/root3 lower
    const yBound = Math.floor(transformToHex([0, canvasHeight-(s/root3)], s)[1]);
    const bfs = getBoundaryFunctions([xBound,yBound]);
    function transformToPix(xyHex){
        let xHex = xyHex[0];
        let yHex = xyHex[1];

        // Transforms are T_hp = RXYv + Offset where:
        // X is the scaling of the x axis
        // Y is the scaling of the y axis
        // R is the rotation of the x axis down by 30 degrees
        // Offset is the offset amount of the first hexagon

        // A proportion of the x value gets transferred to the y axis
        // due to the 30 degree rotation of the x axis.
        let xPix = (xHex * s * root3) * (root3 / 2);
        let yPix = yHex * s * root3 + (xPix / root3);
        // Scale from x component

        // Offset
        xPix += s;
        yPix += root3 * s / 2;

        return [xPix, yPix];
    }

    function transformToHex(xyPix){
        let xPix = xyPix[0];
        let yPix = xyPix[1];  
        
        // Offset
        xPix -= s;
        yPix -= root3 * s / 2;

        let xHex = 2 * xPix / (s * root3 * root3);
        let yHex = (yPix - (xPix / root3)) / (s * root3);

        return [xHex, yHex];
    }

    function getHexNeighbours([i,j]){
        // A hex has six neighbours, 
        // one to four of which may be on the periodic boundary
        return [
            [i+1,j],        
            [i,j+1],
            [i-1,j],
            [i,j-1],
            [i+1,j-1],
            [i-1,j+1],
        ];
    }

    function getCanonicalHexPosition([i,j]){
        const jMin = bfs.generateJMin(i);

        const remI = i%(bfs.getIRange());
        // If the remainder is negative (note that in JS % isn't a modulus), we need to map onto i range
        const chpI = remI < 0 ? bfs.generateIMax() + remI : remI;
        const deltaI = chpI - i;

        const chpJ = getCanonicalHexJ(chpI, j, deltaI);
        const chp = [chpI, chpJ];
        return chp;
    }

    function getCanonicalHexJ(i, j, deltaI){
        // Calculate canonical j coordinate, given a canonical i coordinate.
        // (Note that i should already have been canonicalised.)
        // deltaI is the change in i, if i has crossed a periodic boundary.
        const jMin = bfs.generateJMin(i);
        const initJ = j + Math.floor((-deltaI)/2);
        const remJ = (initJ-jMin)%(bfs.getJRange(i)) + jMin;
        // If the remainder is below the lower limit, we need to map onto j range
        const jRange = bfs.getJRange(i);
        const chpJ = remJ < jMin ? jRange + remJ : remJ;
        return chpJ;
    }

    function getBoundaryFunctions(xyHexMax){
        return {
            // Maximum i should always be even (for periodic boundary conditions)
            generateIMax: () => 2 * Math.floor(xyHexMax[0]/2),
            // Boundary j coordinates depends on x position
            generateJMin: (i) => Math.ceil(-i/2),
            generateJMax: (i) => Math.floor(xyHexMax[1] - ((i-1)/2)),
            getIRange: () => xyHexMax[0],
            getJRange: function(i){return this.generateJMax(i) - this.generateJMin(i);},
            isLeftBoundary: (xyHex) => xyHex[0] === 0,
            isRightBoundary: (xyHex) => xyHex[0] === xyHexMax[0] - 1,
            isTopBoundary: (xyHex) => xyHex[0] === -xyHex[1] * 2,
            isInnerTopBoundary: (xyHex) => xyHex[0] === -2 * xyHex[1] + 1,
            isBottomBoundary: (xyHex) => xyHex[0] === -2 * (xyHex[1]-(xyHexMax[1]-1)) + 1,
            isInnerBottomBoundary: (xyHex) => xyHex[0] === -(xyHex[1]-xyHexMax[1]+1) * 2,
        };
    }

    return {
        generateIMax: () => bfs.generateIMax(),
        generateJMin: (i) => bfs.generateJMin(i),
        generateJMax: (i) => bfs.generateJMax(i),
        transformToPix: transformToPix,
        transformToHex: transformToHex,
        getHexNeighbours: getHexNeighbours,
        getCanonicalHexPosition: getCanonicalHexPosition,
        getCanonicalHexJ: getCanonicalHexJ,
        getBoundaryFunctions: getBoundaryFunctions,
    }
}