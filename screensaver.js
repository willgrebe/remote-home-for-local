enum Mode { Asleep = 0, Working = 1 } //modes of the "screen," diff screensavers per mode
enum Falling { Down = 0, Up } //allows the marbles to follow trajectory
enum Target { Simulator = 0, Microbit } //where the marbles end
enum Trajectory { Vertical = 0, Duration, Heading } // marble trajectory

let mode: Mode = Mode.Working //stores mode, set default mode to working
let modes: Mode[]=[Mode.Asleep, Mode.Working] // declares the different modes
let screen= [screensaver.rain, screensaver.coding] //functions working mode
let savers= [screensaver.rain, screensaver.freqbars, screensaver.bouncing_marbles] //functions for asleep mode
let gesture : Gesture= Gesture.TiltLeft //stores gesture, default left
let gestures: Gesture[]=[Gesture.TiltLeft, Gesture.TiltRight, Gesture.Shake] //different gestures called


namespace screensaver {
    let line_lengths : number[] = [4, 1, 2, 2, 3] //line lengths in coding function
    let y: number //y value on grid 
    let x: number //x value on grid

    /**
     * changes mode to asleep
     */
    input.onButtonPressed(Button.A, function () {
    mode = Mode.Asleep
    })

    /**
     * changes mode to working
     */
    input.onButtonPressed(Button.B, function () {
    mode= Mode.Working
    })

    /**
     * pushes left gesture upon left gesture
     */
    input.onGesture(Gesture.TiltLeft, function () {
    gesture = Gesture.TiltLeft
    })

    /**
     * pushes right gesture
     */
    input.onGesture(Gesture.TiltRight, function () {
    gesture= Gesture.TiltRight
    })

    /**
     * pushes shake gesture
     */
    input.onGesture(Gesture.Shake, function () {
    gesture= Gesture.Shake
    })

    /**
     * scrolls random line lengths
     */
    export function coding() {
        for (let y=0; y<=5; y++) {
            for(let x=0; x<=5; x++){
                led.unplot(x, y)
            }
            for (let x=0; x<line_lengths[y]; x++) {
                led.plot(x, y)
                basic.pause(50) 
            } 
        }
        line_lengths.push(randint(1, 4))
        if(line_lengths[x]=5){
            line_lengths.removeAt(0)
            basic.pause(50)  
        }
    }

    class raindrops {
        x : number 
        y : number 
        depth : number
        timing: number

        constructor(x : number, y: number){
            this.x= x
            this.y= y
            this.depth= randint(0, 4)
            this.timing= 0
        }
        /**
         * plots point with brightness related to 'depth'
         */
        show(){
            led.plotBrightness(this.x, this.y, 255/(this.depth+1))
        }
        /**
         * unplots
         */
        hide(){
            led.unplot(this.x, this.y)
        }
        /**
         * moves raindrop down, re-uses drop when it fall off screen. Diff speeds based on 'depth'
         */
        move(){
            if((this.timing) % (this.depth+1) == 0){
                this.hide()
                this.y ++
                if (this.y >= 5){
                    this.y = randint(-10, 0)
                    this.depth = randint(0, 4)
                    this.timing= 0
                    this.x = randint(0, 4)
                } 
                this.show()
            }   
            this.timing++
        }  
    }

    let rainfall: raindrops[]=[]

    for(let i=0; i<10; i++){
        rainfall.push(new raindrops(randint(0, 4),randint(-10,0)))
    }
    /**
     * moves raindrops that are pushed into the rainfall array
     */
    export function rain() {
        for(let i=0; i<rainfall.length; i++){
            rainfall[i].move()
        }
    }
    /**
     * plots five different lines at varying heights and brightnesses.
     */
    export function freqbars() {
        let line_heights : number[] = []
        for (x=0; x<5; x++){
            line_heights.push(randint(0, 4))
        }
        for (let x=0; x<5; x++) {
            for (let y=4; y>=line_heights[x]; y--) {
                led.plotBrightness(x, y, 255-(y*51))
            }
        }
        basic.pause(100)
        for(let x=0; x<5; x++){
            for(let y=0; y<=4; y++){
                led.unplot(x, y)
            }
        }
        basic.pause(500)
    }


    class Marble{
        x: number
        y: number
        trajectory: number[][]=[]
        step: number
        counter: number
        brightness: number
        active: boolean

        constructor(x: number, y: number){
            this.x = x
            this.y = y
            this.trajectory= [                  
                [0,  50, Falling.Down],
                [1, 120, Falling.Down],
                [2,  80, Falling.Down],
                [3,  30, Falling.Down],
                [4,  10, Falling.Up],
                [3,  40, Falling.Up],
                [2, 100, Falling.Up],
                [1, 160, Falling.Down],
                [2, 100, Falling.Down],
                [3,  50, Falling.Down],
                [4,  20, Falling.Up],
                [3,  70, Falling.Up],
                [2, 120, Falling.Down],
                [3,  90, Falling.Down],
                [4,  50, Falling.Up],
                [3, 120, Falling.Down],
                [4, 100, Falling.Up],
                [4, 120, Falling.Down]
            ]
            this.step= 0
            this.counter= 0
            this.active= true
        }
        /**
         * plots 'marble'
         */
        show(){
            led.plot(this.x, this.y)
        }
        /**
         * unplots
         */
        hide(){
            led.unplot(this.x, this.y)
        }
        /**
         * moves created 'marble' along trajectory array, returns false at end of traj
         */
        move(){
            if (this.counter % this.trajectory[this.step][Trajectory.Duration] == 0) {
                this.hide()
                this.step ++
                this.counter= 0
                basic.pause(50)
                if (this.step == this.trajectory.length) {
                    this.active = false 
                } else {
                    this.y = this.trajectory[this.step][Trajectory.Vertical]
                    led.plotBrightness(this.x, this.y, this.y == 4 ? 255 : this.brightness)
                }
                this.show()
            }
            this.counter ++
        }
    }
    /**
     * generates random # of 'marbles' then moves them along trajectory until it finishes, clears then repeats.
     */
    export function bouncing_marbles() {
        let marbles: Marble[]=[]
        let numMarbles: number= randint(1, 5)
        for(let i=0; i<numMarbles; i++){
            marbles.push(new Marble(i, 0))
        }
        while(marbles[0].active){
            for(let i=0; i<marbles.length; i++){
                if(marbles[i].active){
                    marbles[i].move()
                } 
            }
        }
        basic.clearScreen()
    }
}
/**
 * main function, calls each function based on what mode and what gesture is pushed into the variable.
 */
basic.forever(function () {
    if(mode == Mode.Working){
        screen[modes.indexOf(mode)]()
    }
    if(mode == Mode.Asleep){
        savers[gestures.indexOf(gesture)]()
    }
})
