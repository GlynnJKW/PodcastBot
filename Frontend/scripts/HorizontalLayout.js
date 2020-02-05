import { Group } from "./three.module.js";

export default class HorizontalLayout extends Group{

    constructor(float = "left", spacing = 5){
        super();
        this.spacing = spacing;
        this.float = float;
    }


    add(obj){
        super.add.apply(this, arguments);
        this.format();
    }

    remove(obj){
        super.remove.apply(this, arguments);
        this.format();
    }

    format(){
        const nc = this.children.length;
        if(this.float === "left"){
            for(let i = 0; i < nc; ++i){
                this.children[i].position.set(i * this.spacing, 0, 0);
            }
        }
        else if(this.float === "right"){
            for(let i = 0; i < nc; ++i){
                this.children[i].position.set(-i * this.spacing, 0, 0);
            }
        }
        else{
            for(let i = 0; i < nc; ++i){
                this.children[i].position.set(i * this.spacing - (nc * this.spacing)/2, 0, 0);
            }
        }
    }
}