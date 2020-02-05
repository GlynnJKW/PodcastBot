import { Group, TextGeometry, MeshBasicMaterial, Mesh, FontLoader, TextureLoader, PlaneGeometry, LinearFilter, Vector2, Vector3 } from "./three.module.js";
import settings from "../settings/heads.js"

const spd = 1.5;

export default class CanadianHead extends Group{
    constructor(username, avatarURL, displayName){
        super();
        this.username = username;
        this._volume = 1.0;
        this._volumeUntilMove = spd;

        const breakpoint = settings.canadianHeadProfiles[username] ? settings.canadianHeadProfiles[username] :settings.canadianHeadProfiles.default;
        this.breakpoint = breakpoint;

        let avatarTexture = new TextureLoader().load(avatarURL);
        avatarTexture.minFilter = LinearFilter;
        let avatarMaterial = new MeshBasicMaterial({map: avatarTexture});

        let avatarHeadGeom = new PlaneGeometry(3, 3 - (3 * breakpoint));

        avatarHeadGeom.faceVertexUvs = [[
            [
                new Vector2(0,1),
                new Vector2(0,breakpoint),
                new Vector2(1,1)
            ],
            [
                new Vector2(0,breakpoint),
                new Vector2(1,breakpoint),
                new Vector2(1,1)
            ]
        ]];
        avatarHeadGeom.uvsNeedUpdate = true;

        let avatarChinGeom = new PlaneGeometry(3, 3 * breakpoint);
        avatarChinGeom.faceVertexUvs = [[
            [
                new Vector2(0,breakpoint),
                new Vector2(0,0),
                new Vector2(1,breakpoint)
            ],
            [
                new Vector2(0,0),
                new Vector2(1,0),
                new Vector2(1,breakpoint)
            ]
        ]];
        avatarChinGeom.uvsNeedUpdate = true;

        this.avatarHead = new Mesh(avatarHeadGeom, avatarMaterial);
        this.avatarChin = new Mesh(avatarChinGeom, avatarMaterial);


        let loader = new FontLoader();
        let that = this;
        loader.load('fonts/helvetiker_regular.typeface.json', function(font){
            let geometry = new TextGeometry(displayName, {
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

            let s = Math.min(3.5 / width, 0.33);
            container.scale.set(s, s, s);
            container.position.set(0, -2, 0);

            that.add(container);

            that.avatarHead.position.set(0, 0, 0);
            that.avatarChin.position.set(0, -(breakpoint * 3 / 2) - (3 - breakpoint * 3) / 2, 0);

            let avatarContainer = new Group();
            avatarContainer.position.set(0, breakpoint * 3 / 2, 0);

            avatarContainer.add(that.avatarHead);
            avatarContainer.add(that.avatarChin);

            that.add(avatarContainer);
        });


    }

    set volume(v = 0){
        const lerp = (this._volume + v) / 2;
        let diff = lerp - this._volume;
        this._volume = lerp;

        const vol = Math.pow(Math.max(this._volume - 1, 0) * 2, 0.75);
        console.log(this._volume, Math.max(this._volume - 1, 0) * 2, vol);
        this._volumeUntilMove -= vol;
        if(this._volumeUntilMove < 0){
            this.move(vol);
        }
        else if(vol <= 0.001){
            this.avatarHead.setRotationFromAxisAngle(new Vector3(0,0,1), 0);

            this.avatarHead.position.set(0,0, 0);    
        }
    }
    get volume(){
        return this._volume;
    }

    move(vol){
        const angle = (Math.random() * 2 - 1) * 60 * Math.max((this._volume - 1) * 2, 0) * Math.PI / 180;
        this.avatarHead.setRotationFromAxisAngle(new Vector3(0,0,1), angle);

        this.avatarHead.position.set(-Math.sin(angle) * 1.5 + Math.random() * 0.2 - 0.1, Math.cos(angle) * ((3 - 3 * this.breakpoint)/2) - 0.75 + Math.random() * 0.2 - 0.1, 0);

        this._volumeUntilMove += spd;
    }

    
}