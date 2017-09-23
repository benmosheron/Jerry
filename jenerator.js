function getJenerator(){

    function getCanvasString(constants){
        return `<canvas id=${constants.canvasId} width=${constants.canvasWidth} height=${constants.canvasHeight}></canvas>`
    }

    function getSlider(constants){
        let s = constants.temperatureSlider;
        return `<input type="range" min="${s.min}" max="${s.max}" value="${s.default}" class="slider" id="${s.id}">`;
    }

    function initCanvas(constants, canvasController){
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
                state = genHex(constants, canvasController);
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

    function genHex(constants, canvasController){
        const state = {};
        const yp = constants.canvasHeight;
        const xp = constants.canvasWidth;
        const s = constants.getActualSize();
        const sizeToFill = constants.cellSize;
        const h = hexagon(constants.canvasWidth, constants.canvasHeight, constants.getActualSize());

        // Draw them for lols
        for (var i = 0; i < h.generateIMax(); i++) {
            const jMin = h.generateJMin(i);
            const jMax = h.generateJMax(i);
            for (var j = jMin; j < jMax; j++) {
                let xyPix = h.transformToPix([i, j]);
                canvasController.drawHexRandom(xyPix[0], xyPix[1], sizeToFill);
            }
        }

        let ij = constants.testVal;
        h.getHexNeighbours(ij).forEach(function(nHex) {
            let nPix = h.transformToPix(h.getCanonicalHexPosition(nHex));
            canvasController.drawHex(nPix[0], nPix[1], sizeToFill, "rgb(0,0,0)");
        }, this);
        canvasController.drawHex(h.transformToPix(ij)[0], h.transformToPix(ij)[1], 5, "rgb(255, 0, 50)");

        return state;
    }

    return {
        getCanvasString: getCanvasString,
        getSlider: getSlider,
        initCanvas: initCanvas
    }
}

// todo move these elsewhere, along with colour functions and vector stuff
// canvasController.js
// Create npm modules?
// BenLovesVectors.js
// BenLovesColours.js