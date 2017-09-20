function getConstants(){
    c = {
        strategy: "hex",
        canvasWidth: 700,
        canvasHeight: 496,
        canvasId: "canvas0",
        cellSize: 10,
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