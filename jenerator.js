function getJenerator(){

    function getCanvasString(constants){
        return `<canvas id=${constants.canvasId} width=${constants.canvasWidth} height=${constants.canvasHeight}></canvas>`
    }

    function getSlider(constants){
        let s = constants.temperatureSlider;
        return `<input type="range" min="${s.min}" max="${s.max}" value="${s.default}" class="slider" id="${s.id}">`;
    }

    function initCanvas(constants){
        let state = {};
        const strategy = constants.strategy;
        let canvas = document.getElementById(constants.canvasId);
        let ctx = canvas.getContext("2d");
        let size = constants.cellSize;
        let nx = Math.floor(constants.canvasWidth / size);
        let ny = Math.floor(constants.canvasHeight / size);
        switch(strategy){
            case "random":
                state = genRandom(ctx, nx, ny, size);
                break;
            case "ising":
                state = genIsing(ctx, nx, ny, size);
                break;
            case "hex":
                state = genHex(ctx, constants);
                break;
            default:
                state = genRandom(ctx, nx, ny, size);
        }
        return state;
    }

    // Private functions
    
    function genRandom(ctx, nx, ny, size){
        for (var i = 0; i < nx; i++) {
            for (var j = 0; j < ny; j++) {
                let x = i * size;
                let y = j * size;
                let colour = `rgb(${rand255()}, ${rand255()}, ${rand255()})`;
                ctx.fillStyle = colour;
                ctx.fillRect(x, y, size, size);
            }
        }
        return {};
    }

    function genIsing(ctx, nx, ny, size){
        // Generate nx*ny states
        let state = {};
        state.length = nx * ny;
        state.nx = nx;
        state.ny = ny;
        state.array = new Array(nx * ny);
        let rand1or1 = () => Math.random() < 0.5 ? 1 : -1;
        let getColour = (s) => s == 1 ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)";
        for (var i = 0; i < nx; i++) {
            for (var j = 0; j < ny; j++) {
                let s = rand1or1();
                state.array[i*ny+j] = s;
                let x = i * size;
                let y = j * size;
                ctx.fillStyle = getColour(s);
                ctx.fillRect(x, y, size, size);
            }
        }
        return state;
    }

    function genHex(ctx, constants){
        const state = {};
        const yp = constants.canvasHeight;
        const xp = constants.canvasWidth;
        const s = constants.getActualSize();
        const sizeToFill = constants.cellSize;

        // lower horizontal bound on hexagons
        const xBound = Math.floor(transformToHex([constants.canvasWidth, 0], s)[0]);
        // -(s/root3) because every other vertical column will be s/root3 lower
        const yBound = Math.floor(transformToHex([0, constants.canvasHeight-(s/root3)], s)[1]);
        const bfs = getBoundaryFunctions([xBound,yBound]);

        // Draw them for lols
        for (var i = 0; i < bfs.generateIMax(); i++) {
            const jMin = bfs.generateJMin(i);
            const jMax = bfs.generateJMax(i);
            for (var j = jMin; j < jMax; j++) {
                let xyPix = transformToPix([i, j], s);
                drawHexRandom(ctx, xyPix[0], xyPix[1], sizeToFill);
            }
        }

        let ij = constants.testVal;
        getHexNeighbours(ij).forEach(function(nHex) {
            let nPix = transformToPix(getCanonicalHexPosition(nHex, bfs), s);
            drawHex(ctx, nPix[0], nPix[1], sizeToFill, "rgb(0,0,0)");
        }, this);
        drawHex(ctx, transformToPix(ij, s)[0], transformToPix(ij, s)[1], 5, "rgb(255, 0, 50)");

        return state;
    }

    return {
        getCanvasString: getCanvasString,
        getSlider: getSlider,
        initCanvas: initCanvas
    }
}

// todo move these elsewhere, along with colour functions and vector stuff
// hex.js
// canvasController.js
// Create npm modules?
// BenLovesVectors.js
// BenLovesColours.js
// BenLovesCanvases.js

const root3 = Math.sqrt(3);
let rand255 = () => Math.floor(Math.random() * 127 + 127);
let randomColour = () => `rgb(${rand255()}, ${rand255()}, ${rand255()})`;

function transformToPix(xyHex, s){
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

function transformToHex(xyPix, s){
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

function getCanonicalHexPosition([i,j], boundaryFunctions){
    const bfs = boundaryFunctions;
    const jMin = bfs.generateJMin(i);

    const remI = i%(bfs.getIRange());
    // If the remainder is negative (note that in JS % isn't a modulus), we need to map onto i range
    const chpI = remI < 0 ? bfs.generateIMax() + remI : remI;
    const deltaI = chpI - i;

    const chpJ = getCanonicalHexJ(bfs, chpI, j, deltaI);
    const chp = [chpI, chpJ];
    return chp;
}

function getCanonicalHexJ(bfs, i, j, deltaI){
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

function drawHexRandom(ctx, x, y, s){
    drawHex(ctx, x, y, s, randomColour());
}

function drawHex(ctx, x, y, s, colour){
    // Draw a flat-top hexagon
    // centered on (x,y) with side length s
    ctx.fillStyle = colour;
    // ctx.strokeStyle = "rgb(0,0,0)";
    ctx.beginPath();
    // Start with the right point
    ctx.moveTo(x + s, y);
    // Bottom right
    ctx.lineTo(x + (s/2), y - (root3 * s)/2);
    // Bottom left
    ctx.lineTo(x - (s/2), y - (root3 * s)/2);
    // Left
    ctx.lineTo(x - s, y);
    // Top left
    ctx.lineTo(x - (s/2), y + (root3 * s)/2);
    // Top right
    ctx.lineTo(x + (s/2), y + (root3 * s)/2);
    // Back to start
    ctx.lineTo(x + s, y);
    ctx.closePath();
    // If we want to draw and outline around each hexagon
    // ctx.stroke();
    ctx.fill();
}