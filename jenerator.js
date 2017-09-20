function getJenerator(){

    function getCanvasString(constants){
        return `<canvas id=${constants.canvasId} width=${constants.canvasWidth} height=${constants.canvasHeight}></canvas>`
    }

    function getSlider(constants){
        let s = constants.temperatureSlider;
        return `<input type="range" min="${s.min}" max="${s.max}" value="${s.default}" class="slider" id="${s.id}">`;
    }

    function initCanvas(constants, strategy){
        let state = {};
        let canvas = document.getElementById(constants.canvasId);
        let ctx = canvas.getContext("2d");
        let size = constants.cellSize;
        let nx = constants.canvasWidth / size;
        let ny = constants.canvasHeight / size;
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

        // test with hex00 and hex2-1

        //hex00 should be [10, 8.66]
        console.log(transformToPix([0,0],s));
        //hex2-1 should be [40, 8.66]
        console.log(transformToPix([2,-1],s));
        // we are 1.3660254037844386 times too high

        // lower horizontal bound on hexagons
        let xBound = Math.floor(transformToHex([constants.canvasWidth, 0], s)[0]);
        let yBound = Math.floor(transformToHex([0, constants.canvasHeight], s)[1]);

        // Draw them for lols
        for (var i = 0; i < xBound; i++) {
            let jMin = Math.ceil(-i/2);
            let jMax = Math.floor(yBound - (i/2))
            for (var j = jMin; j < jMax; j++) {
                let xyPix = transformToPix([i, j], s);
                drawHex(ctx, xyPix[0], xyPix[1], sizeToFill);
            }
        }

        return state;
    }

    return {
        getCanvasString: getCanvasString,
        getSlider: getSlider,
        initCanvas: initCanvas
    }
}

// todo move these elsewhere, along with colour functions and vector stuff
const root3 = Math.sqrt(3);
let rand255 = () => Math.floor(Math.random() * 256);
let randomColour = () => `rgb(${rand255()}, ${rand255()}, ${rand255()})`;

function transformToPix(xyHex, s){
    let xHex = xyHex[0];
    let yHex = xyHex[1];

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

function drawHex(ctx, x, y, s){
    // Draw a flat-top hexagon
    // centered on (x,y) with side length s
    ctx.fillStyle = randomColour();
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
    ctx.fill();
}