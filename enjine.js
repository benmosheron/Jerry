function getEnjine(config, state, canvasController){
    let enjine = {};
    switch(config.engine){
        case "random":
            enjine.run = function(){
                // Pick a random square
                let size = config.getActualSize();
                let rand = (lim) => Math.floor(Math.random() * lim / size);
                let x = rand(config.canvasWidth) * size;
                let y = rand(config.canvasHeight) * size;
                const fillSize = config.cellSize;
                const pad = config.cellPadding / 2;
                canvasController.drawSquareRandom(x + pad, y + pad, fillSize);
            };
            break;
        case "ising":
            const rand1or1 = () => Math.random() < 0.5 ? 1 : -1;
            const getColour = (s) => s == 1 ? "rgb(200, 200, 200)" : "rgb(50, 50, 50)";
            // Note: flip mutates the vector - we really don't want to recreate the vector instances.
            const flip = (i,j) => state.vector.get(i).array[j] = -state.vector.get(i).array[j];
            function calcEnergy(s, state, neighbours){
                 return -s * neighbours.reduce((prev, next) => prev + state.vector.get(next), 0);
            };
            enjine.run = function(){
                const vSize = state.vector.size();
                // Pick a random state
                // Pick a random i
                const i = Math.floor(Math.random() * state.generateIMax());
                // Pick a random j (which for hex, is dependent on i)
                const jMin = state.generateJMin(i);
                const jMax = state.generateJMax(i);
                const jRange = jMax - jMin;
                const j = Math.floor((Math.random() * jRange) + jMin);

                // Get neighbour indices
                let neighbours = state.getNeighbours(state, i, j);
                let energyNow = calcEnergy(state.vector.get([i,j]), state, neighbours);
                let energyIfChanged = -energyNow;
                let delta = energyIfChanged - energyNow;
                if(delta < 0){
                    flip(i,j);
                }
                else{
                    let probabilityOfChange = Math.exp(-delta * state.getTemperature());
                    if(Math.random() < probabilityOfChange){
                        flip(i,j);
                    }
                }
                
                // Draw the square
                let size = config.getActualSize();
                let x = i * size;
                let y = j * size;
                const fillSize = config.cellSize;
                const pad = config.cellPadding / 2;
                canvasController.drawSquare(x + pad, y + pad, fillSize, getColour(state.vector.get([i,j])));
            };
            break;
        case "hex":
            enjine.run = function(){
                const h = state.hexagon;
                
            };
            break;
    };
    enjine.start = function(iterationsPerFrame){
        if(typeof(iterationsPerFrame) === "undefined" || iterationsPerFrame === null) iterationsPerFrame = 1;
        setInterval(
            function(){
                for (var i = 0; i < iterationsPerFrame; i++) {
                    enjine.run();
                }
            }, 16);
    }
    return enjine;
}