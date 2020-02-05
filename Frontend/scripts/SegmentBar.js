import { Object3D, ShaderMaterial, Vector3, PlaneGeometry, Mesh } from "./three.module.js";

const vertexText = 
`
varying vec2 fraguv;

void main(){
    fraguv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;
const fragmentText = 
`
uniform float level;
uniform vec3 c1;
uniform vec3 c2;

varying vec2 fraguv;

void main(){
    if(fraguv.y > level){
        discard;
    }

    float y = fraguv.y * 8.0;
    if(mod(y, 1.0) > 0.8){
        discard;
    }

    vec3 col = c1 * (1.0 - fraguv.y) + c2 * fraguv.y;

    gl_FragColor = vec4(col, 1.0);
}
`;


export default class SegmentBar extends Object3D{
    constructor(options = {}){
        super();
        let color1 = options.color1 ? options.color1 : new Vector3(0.271, 0.722, 0.945);
        let color2 = options.color2 ? options.color2 : new Vector3(1, 0.31, 0.675);
        let width = options.width ? options.width : 2.5;
        let height = options.height ? options.height : 8;

        let material = new ShaderMaterial({
            uniforms: {
                c1: {value: color1},
                c2: {value: color2},
                level: {value: 0.5}
            },
            vertexShader: vertexText,
            fragmentShader: fragmentText
        });
        let geometry = new PlaneGeometry(width, height);
        this.bar = new Mesh(geometry, material);
        this.bar.position.set(0, height/2, 0);
        this.add(this.bar);

        this.level = 0.5;
    }

    updateLevel(x){
        this.level = x;
        this.bar.material.uniforms.level.value = x;
    }
}