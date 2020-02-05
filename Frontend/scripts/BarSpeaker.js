import { Group, TextGeometry, MeshBasicMaterial, Mesh, FontLoader, TextureLoader, PlaneGeometry, LinearFilter } from "./three.module.js";
import SegmentBar from "./SegmentBar.js";

export default class BarSpeaker extends Group{
    constructor(username, avatarURL){
        super();
        this.username = username;
        this._volume = 1.0;


        let avatarTexture = new TextureLoader().load(avatarURL);
        avatarTexture.minFilter = LinearFilter;
        let avatarMaterial = new MeshBasicMaterial({map: avatarTexture});
        let avatarGeom = new PlaneGeometry(3, 3);
        this.avatar = new Mesh(avatarGeom, avatarMaterial);


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

            that.text = mesh;

            geometry.computeBoundingBox()

            let width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
            let height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
            let container = new Group();
            container.add(mesh);

            mesh.position.x -= 0.5 * width;
            mesh.position.y -= 0.5 * height;

            let s = Math.min(4.0 / width, 0.33);
            container.scale.set(s, s, s);

            that.add(container);

            that.avatar.position.set(0, -2, 0);
            that.add(that.avatar);

            that.bar = new SegmentBar();
            that.bar.position.set(0, 0.5, 0);
            that.add(that.bar);    
        });


    }

    set volume(v = 0){
        const lerp = (this._volume + v) / 2;
        this._volume = lerp;

        if(this.bar){
            let level = (this._volume - 1) * 2;
            this.bar.updateLevel(level);
        }
    }
    get volume(){
        return this._volume;
    }

    
}