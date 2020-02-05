import { Scene, WebGLRenderer, PerspectiveCamera, GridHelper } from "./three.module.js";
import BarSpeaker from "./BarSpeaker.js";
import Speaker from "./Speaker.js";
import CircleLayout from "./CircleLayout.js";
import HorizontalLayout from "./HorizontalLayout.js";
import layoutsettings from "./../settings/layout.js"

import * as THREE from "./three.module.js";
import CanadianHead from "./CanadianHead.js";
window.CanadianHead = CanadianHead;

const scene = new Scene();
window.scene = scene;
window.THREE = THREE;
const renderer = new WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

let camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 0, 10);
window.camera = camera;

// const light1 = new DirectionalLight(0xffffff, 1.0);
// light1.position.set(0.5, 1.0, 0.5);
// scene.add(light1);

// const light2 = new AmbientLight(0xffffff, 0.5);
// scene.add(light2);

// const gridHelper = new GridHelper(10, 10);
// scene.add(gridHelper);

const layout = new HorizontalLayout(layoutsettings.float, layoutsettings.spacing);
if(layoutsettings.float == "left"){
    layout.position.set(-10,0,0);
}
else if(layoutsettings.float == "right"){
    layout.position.set(10,0,0);
}
window.layout = layout;
scene.add(layout);




let talking = [];



// if user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;
var connection = new WebSocket('ws://127.0.0.1:1337');

connection.onmessage = function (message) {
    // try to decode json (I assume that each message
    // from server is json)
    try {
        const json = JSON.parse(message.data);
        console.log(json);
        switch(json.type){
            case "connect":
                for(let user of json.users){
                    if(!talking[user.id]){
                        let s = new CanadianHead(user.name, user.avatar, user.displayName);
                        talking[user.id] = s;
                        layout.add(s);
                    }
                }
                break;
            case "disconnect":
                for(let user of json.users){
                    if(talking[user.id]){
                        layout.remove(talking[user.id]);
                        delete(talking[user.id]);
                    }
                }
                break;
            case "speaking":
                if(json.speaking){
                }
                else{
                    if(talking[json.id]){
                        talking[json.id].volume = 0;
                    }
                }
                break;
            case "volume":
                if(talking[json.id]){
                    talking[json.id].volume = json.volume;
                }
                break;
        }
    } catch (e) {
        // console.log(e);
        return;
    }
};


function animate(){
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}
animate();