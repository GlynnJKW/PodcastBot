import { Group, TextGeometry, MeshBasicMaterial, Mesh, FontLoader } from "./three.module.js";

export default class Speaker extends Group{
    constructor(username){
        super();
        this.username = username;
        this._volume = 1.0;
        this.scale.set(0,0,0);

        let loader = new FontLoader();
        let that = this;
        loader.load('fonts/helvetiker_regular.typeface.json', function(font){
            let geometry = new TextGeometry(username, {
                font: font,
                size: 1.0,
                height: 0.01
            });
            let material = new MeshBasicMaterial({color: 0x000000});
            let mesh = new Mesh(geometry, material);

            geometry.computeBoundingBox()

            let width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
            let height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
            mesh.position.x = -0.5 * width;
            mesh.position.y = -0.5 * height;
            that.originalScale = 4.0 / width;
            that.scale.set(that.originalScale, that.originalScale, that.originalScale);

            that.add(mesh);
        });

    }

    set volume(v){
        if(v !== null){
            const lerp = (this._volume + v) / 2;
            this._volume = lerp;

            let scale = this.originalScale * lerp;
            this.scale.set(scale, scale, scale);    
        }
    }
    get volume(){
        return this._volume;
    }

    
}