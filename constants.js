function getConstants(){
    c = {
        generator: "ising",
        engine: "ising",
        canvasWidth: 1000,
        canvasHeight: 400,
        canvasId: "canvas0",
        cellSize: 4,
        cellPadding: 1,
        iterationsPerFrame: 1000,
        temperatureSlider: {
            id: "temperatureSlider0",
            min: 0,
            max: 200,
            default: 100
        },
        getActualSize: function(){ return this.cellSize + this.cellPadding; }
    };

    return c;
}