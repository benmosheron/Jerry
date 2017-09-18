function getJenerator(){

    function getCanvasString(constants){
        return `<canvas id=${constants.canvasId} width=${constants.canvasWidth} height=${constants.canvasHeight}></canvas>`
    }

    function initCanvas(constants, strategy){
        let canvas = document.getElementById(constants.canvasId);
        let ctx = canvas.getContext("2d");
        let size = constants.cellSize;
        let nx = constants.canvasWidth / size;
        let ny = constants.canvasHeight / size;
        switch(strategy){
            case "random":
                genRandom(ctx, nx, ny, size);
                break;
            default:
                genRandom(ctx, nx, ny, size);
        }
    }

    // Private functions
    
    function genRandom(ctx, nx, ny, size){
        let rand255 = () => Math.floor(Math.random() * 256);
        for (var i = 0; i < nx; i++) {
            for (var j = 0; j < ny; j++) {
                let x = i * size;
                let y = j * size;
                let colour = `rgb(${rand255()}, ${rand255()}, ${rand255()})`;
                ctx.fillStyle = colour;
                ctx.fillRect(x, y, size, size);
            }
            
        }
    }

    return {
        getCanvasString: getCanvasString,
        initCanvas: initCanvas
    }
}
