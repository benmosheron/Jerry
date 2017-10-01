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
            const flip = (ij) => state.vector.get(ij[0]).array[ij[1]] = -state.vector.get(ij[0]).array[ij[1]];
            function calcEnergy(s, state, neighbours){
                 return -s * neighbours.reduce((prev, next) => prev + state.vector.get(state.at(next)), 0);
            };
            enjine.run = function(){
                const vSize = state.vector.size();
                // Pick a random state
                // Pick a random i
                const i = Math.floor(Math.random() * state.generateIMax());
                // const i = 0;
                // Pick a random j (which for hex, is dependent on i)
                const jMin = state.generateJMin(i);
                const jMax = state.generateJMax(i);
                const jRange = jMax - jMin;
                const j = Math.floor((Math.random() * jRange) + jMin);
                // const j = 0;

                // Get neighbour indices
                let neighbours = state.getNeighbours(i, j);
                let energyNow = calcEnergy(state.vector.get(state.at([i,j])), state, neighbours);
                let energyIfChanged = -energyNow;
                let delta = energyIfChanged - energyNow;
                if(delta < 0){
                    flip(state.at([i,j]));
                }
                else{
                    let probabilityOfChange = Math.exp(-delta * state.getTemperature());
                    if(Math.random() < probabilityOfChange){
                        flip(state.at([i,j]));
                    }
                }
                
                // Draw the square
                let size = config.getActualSize();
                const fillSize = config.cellSize;
                const pad = config.cellPadding / 2;
                switch(config.generator){
                    case "ising":
                        let x = i * size;
                        let y = j * size;
                        canvasController.drawSquare(x + pad, y + pad, fillSize, getColour(state.vector.get([i,j])));
                        break;
                    case "hex":
                        let xyPix = state.hexagon.transformToPix([i, j]);
                        canvasController.drawHex(xyPix[0], xyPix[1], fillSize, getColour(state.vector.get(state.at([i,j]))));
                        break;
                }

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