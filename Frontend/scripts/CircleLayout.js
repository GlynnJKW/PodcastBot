import { Group } from "./three.module.js";

export default class CircleLayout extends Group{

    constructor(radius = 5){
        super();
        this.radius = radius;
    }


    add(obj){
        super.add.apply(this, arguments);

        const nc = this.children.length;
        if(nc == 1){
            obj.position.set(0,0,0);
            return;
        }
        for(let i = 0; i < nc; ++i){
            let p = i * (Math.PI * 2 / nc);
            let xpos = Math.cos(p) * this.radius;
            let ypos = Math.sin(p) * this.radius;
            this.children[i].position.set(xpos, ypos, 0);
        }
    }
}