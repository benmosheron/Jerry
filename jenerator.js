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
        const generator = constants.generator;

        switch(generator){
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
        let state = {};
        // Const for drawing
        const size = constants.getActualSize();
        const fillSize = constants.cellSize;
        const pad = constants.cellPadding / 2;

        array = [];
        state.generateIMin = () => 0;
        state.generateJMin = () => 0;
        state.generateIMax = () => Math.floor(constants.canvasWidth / size);
        state.generateJMax = () => Math.floor(constants.canvasHeight / size);

        const nx = state.generateIMax();
        const ny = state.generateJMax();

        state.getNeighbours = function(state, i, j){
            let neighbours = new Array(4);
            neighbours[0] = [i === 0 ? nx - 1 : i - 1, j];
            neighbours[1] = [i, j === 0 ? ny - 1 : j - 1];
            neighbours[2] = [i === nx - 1 ? 0 : i + 1, j];
            neighbours[3] = [i, j === ny - 1 ? 0 : j + 1];
            return neighbours;
        };


        let rand1or1 = () => Math.random() < 0.5 ? 1 : -1;
        let getColour = (s) => s == 1 ? "rgb(200, 200, 200)" : "rgb(50, 50, 50)";
        for (var i = 0; i < nx; i++) {
            array.push([]);
            for (var j = 0; j < ny; j++) {
                let s = rand1or1();
                array[i][j] = s;
                let x = i * size;
                let y = j * size;
                canvasController.drawSquare(x + pad, y + pad, fillSize, getColour(s));
            }
        }

        state.vector = new Vector(array);
        return state;
    }

    function genHex(constants, canvasController){
        const state = {};
        const yp = constants.canvasHeight;
        const xp = constants.canvasWidth;
        const s = constants.getActualSize();
        const sizeToFill = constants.cellSize;
        const h = hexagon(constants.canvasWidth, constants.canvasHeight, constants.getActualSize());

        state.hexagon = h;

        // Draw them for lols
        for (var i = 0; i < h.generateIMax(); i++) {
            const jMin = h.generateJMin(i);
            const jMax = h.generateJMax(i);
            for (var j = jMin; j < jMax; j++) {
                let xyPix = h.transformToPix([i, j]);
                canvasController.drawHexRandom(xyPix[0], xyPix[1], sizeToFill);
            }
        }

        // mousehandler
        canvasController.addClickHandler(function(evt){
            let x = evt.offsetX;
            let y = evt.offsetY;
            // transform to hex
            let xyHex = h.getCanonicalHexPosition(h.transformToHex([x,y]).map(e => Math.round(e)));
            canvasController.drawHexRandom(h.transformToPix(xyHex)[0], h.transformToPix(xyHex)[1], sizeToFill - 1);
        });
        canvasController.addMouseMoveHandler(function(evt){
            let x = evt.offsetX;
            let y = evt.offsetY;
            let doHex = evt.shiftKey ? canvasController.drawHexRandom : canvasController.drawHex;
            // transform to hex
            let xyHex = h.getCanonicalHexPosition(h.transformToHex([x,y]).map(e => Math.round(e)));
            doHex(h.transformToPix(xyHex)[0], h.transformToPix(xyHex)[1], sizeToFill - 1, "rgb(0, 0, 0)");
            h.getHexNeighbours(xyHex).forEach(function(nHex) {
                let nPix = h.transformToPix(h.getCanonicalHexPosition(nHex));
                doHex(nPix[0], nPix[1], sizeToFill - 1, "rgb(0,0,0)");
            }, canvasController);
        });

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