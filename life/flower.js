// E.g.
// http://192.168.1.227:8080/jerry.html?generator=flower&engine=flower&canvasHeight=1000&canvasWidth=1000
// Lets provide a generator and engine
function Flower(config, canvasController){
    // Important! override any iterationsPerFrame to 1
    config.iterationsPerFrame = 1
    const centre = new Vector([config.canvasWidth / 2 , config.canvasHeight / 2]).transpose()

    this.generate = function(){
        // n = number of petals
        // r = rotation between petal placement
        // d = pixels to move away from centre each iteration
        const n = 200;
        const r_def = 2*Math.PI/2.12318723821127;
        const d = 1.0
        const phi = (1+Math.sqrt(5))/2

        // Set up r slider
        document.getElementById("slider0").max = config.life.flower.rSliderMax
        document.getElementById("slider0").value = config.life.flower.rSliderMax/phi
        document.getElementById("slider0").style.width = `${config.canvasWidth}px`
        document.getElementById("slider0").hidden = false


        // convert 0-rMax to 0->2pi
        function getR(){ 
            return document.getElementById("slider0").value/config.life.flower.rSliderMax * 2*Math.PI
         }

        // Our state will be an array of petals, and our run function
        // We probably don't need to store an array or positions, as we can calculate them each time from the parameters,
        const petals = placePetals(n,r_def,d)
        // Draw the centre
        // canvasController.drawSquare(centre.collapse().x, centre.collapse().y, 10, "rgb(180,30,40)")
        //renderAll(petals)
        // Capture a petal pointer
        let point_mut = 0
        return {
            run: function(){
                // We can reposition the petals based on input parameters
                placePetalsInto_mutates(petals,getR(),d)
                if(point_mut>=petals.length) point_mut = 0
                render(petals, point_mut)
                point_mut++
            },
            petals: petals 
        }
    }

    // HOT PATH
    function render(petals, i){
        const p = petals[i]
        // Draw one petal per iteration (avoid horrible performance, see commented code below)...
        canvasController.drawSquare(0,0,config.canvasWidth + config.canvasHeight, "rgba(255,255,255,0.01)")
        canvasController.drawCircle(p.array[0].array[0], p.array[1].array[0], scalePetalRadius(i), scalePetalColour(i))
        // petals
        //     // .map(p => p.collapse()) // collapse column vectors ([[x],[y]]) to flat vector ([x,y]) // OH GOD THE PERFORMANCE!! *cries*
        //     // .map((p, i) => canvasController.drawSquareRandom(p.x, p.y, 10))
        //     // hack the values out of the column vector to avoid the horrible ben-loves-vectors performance
        //     .map(p => canvasController.drawSquareRandom(p.array[0].array[0], p.array[1].array[0], 10))
    }

    // HOT
    function scalePetalRadius(i){
        // i <- 0..n
        // Petal is i*d pixels from centre
        return 1 + Math.sqrt(i/1)
    }

    // HOT
    function scalePetalColour(i){
        // i <- 0..n
        // Petal is i*d pixels from centre
        // want to avoid having r==g==b as it will blend with the background
        const min = 30
        const r = Math.max(180 - i/2, min)
        const g = min// * i/10 - i*i/100
        const b = Math.min(60 + i, 210)
        return `rgb(${r},${g},${b})`
    }

    function renderAll(petals){
        petals
        //     // .map(p => p.collapse()) // collapse column vectors ([[x],[y]]) to flat vector ([x,y]) // OH GOD THE PERFORMANCE!! *cries*
        //     // .map((p, i) => canvasController.drawSquareRandom(p.x, p.y, 10))
            // hack the values out of the column vector to avoid the horrible ben-loves-vectors performance
            .map(p => canvasController.drawSquareRandom(p.array[0].array[0], p.array[1].array[0], 10))
    }

    // n = number of petals
    // r = rotation between petal placement
    // d = pixels to move away from centre each iteration
    function placePetals(n, r, d){
        // First petal is d to the right of centre
        const p_mut = [centre.add(Vector.create2(d,0).transpose())]

        function iterate(prev){
            return rotateAndAdd(prev,r,d)
        }

        while(p_mut.length < n){
            p_mut.push(iterate(p_mut[p_mut.length - 1]))
        }

        return p_mut
    }

    // Generate petals by writing to the array in place
    function placePetalsInto_mutates(array, r, d){
        for(let i=1;i<array.length;i++){
            array[i] = rotateAndAdd(array[i-1],r,d)
        }
        return array
    }

    function rotateAndAdd(vCanvas, theta, amt){
        // Transform to centre
        const v = vCanvas.sub(centre)
        // Rotation matrix
        const R = new Vector([
            [Math.cos(theta), -Math.sin(theta)],
            [Math.sin(theta),  Math.cos(theta)]])
        const rotated = R.matrixMultiply(v)

        // Add amt to vector magnitude
        // bug in ben-loves-vectors: we should be able to normalise/magnitude a column vector (added to trello)
        const added = rotated.add(rotated.collapse().normalise(amt).transpose())
        return added.add(centre)
    }
}