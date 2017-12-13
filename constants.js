function getConstants(){
    c = {
        generator: "ising",
        engine: "ising",
        canvasWidth: 100,
        canvasHeight: 100,
        canvasId: "canvas0",
        cellSize: 10,
        cellPadding: 0,
        iterationsPerFrame: 200,
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