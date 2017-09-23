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

        switch(strategy){
            case "random":
                state = genRandom(constants, canvasController);
                break;
            case "ising":
                state = genIsing(constants, canvasController);
                break;
            case "hex":
                state = genHex(constants, canvasController);
                break;
            default:
                state = genRandom(constants, canvasController);
        }
        return state;
    }

    // Private functions
    
    function genRandom(constants, canvasController){
        const size = constants.getActualSize();
        const nx = Math.floor(constants.canvasWidth / size);
        const ny = Math.floor(constants.canvasHeight / size);
        const fillSize = constants.cellSize;
        const pad = constants.cellPadding / 2;
        for (var i = 0; i < nx; i++) {
            for (var j = 0; j < ny; j++) {
                let x = i * size;
                let y = j * size;
                canvasController.drawSquareRandom(x + pad, y + pad, fillSize);
            }
        }
        return {};
    }

    function genIsing(constants, canvasController){
        // Generate nx*ny states
        let state = {};
        const size = constants.getActualSize();
        const nx = Math.floor(constants.canvasWidth / size);
        const ny = Math.floor(constants.canvasHeight / size);
        const fillSize = constants.cellSize;
        const pad = constants.cellPadding;
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
                canvasController.drawSquare(x + pad, y + pad, fillSize, getColour(s));
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
// Create npm modules?
// BenLovesVectors.js (move to using vectors)
// BenLovesColours.js