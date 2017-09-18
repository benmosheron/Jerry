function getConstants(){
    c = {
        strategy: "ising",
        canvasWidth: 500,
        canvasHeight: 500,
        canvasId: "canvas0",
        cellSize: 10,
        iterationsPerFrame: 1000,
        temperatureSlider: {
            id: "temperatureSlider0",
            min: 0,
            max: 200,
            default: 100
        }
    };

    return c;
}