import * as THREE from "three";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// model
export class Model {
    // public
    vrm = null
    mixer = null
    currentAction = 'neutral'
    baseClips = {}
    emoteActions = {}

    // constructor
    constructor() {}

    async loadVRM(url) {
        const loader = new GLTFLoader();
        loader.register(
            (parser) =>
            new VRMLoaderPlugin(parser, {
                autoUpdateHumanBones: true,
            })
        );

        const gltf = await loader.loadAsync(url);

        const vrm = (this.vrm = gltf.userData.vrm);
        // calling these functions greatly improves the performance
        VRMUtils.removeUnnecessaryVertices( gltf.scene );
        VRMUtils.removeUnnecessaryJoints( gltf.scene );
        vrm.scene.name = "VRMRoot";

        VRMUtils.rotateVRM0(vrm);

        this.mixer = new THREE.AnimationMixer(vrm.scene);
    }

    unLoadVRM() {
        if (this.vrm) {
            VRMUtils.deepDispose(this.vrm.scene);
            this.vrm = null;
        }
    }

    async loadAnimationClips(url, initAction) {
        const response = await fetch(url)
        const animationClips = await response.json()
        const animations = Object.keys(animationClips)
        // clip
        for ( let i = 0; i !== animations.length; ++ i ) {
            const name = animations[ i ]
            let clip = THREE.AnimationClip.parse(animationClips[name]);
            this.baseClips[ clip.name ] = clip
        }
        // blend actions
        let newTrack = null, newClip = null, newAction = null
        const clipNames = Object.keys(this.baseClips)
        for ( let i = 0; i !== clipNames.length; ++ i ) {
            const name = clipNames[ i ]
            switch (name) {
                case 'greeting':
                    newAction = this.mixer.clipAction( this.baseClips[name] )
                    this.emoteActions[name] = newAction
                    break
                case 'neutral':
                    newTrack = [...this.baseClips['neutral'].tracks, ...this.baseClips['blink'].tracks]
                    newClip = { ...this.baseClips['neutral'], tracks: newTrack }
                    newAction = this.mixer.clipAction( newClip )
                    this.emoteActions[name] = newAction
                    break
                case 'smile':
                case 'angry':
                case 'surprised':
                case 'sad':
                    newTrack = [...this.baseClips['neutral'].tracks, 
                                ...this.baseClips[name].tracks, 
                                ...this.baseClips['blink'].tracks]
                    newClip = { ...this.baseClips['neutral'], tracks: newTrack, uuid: this.baseClips[name].uuid}
                    newAction = this.mixer.clipAction( newClip )
                    this.emoteActions[name] = newAction
                    break
                case 'joy':
                case 'wink':
                case 'thinking':
                    newTrack = [...this.baseClips['neutral'].tracks, 
                                ...this.baseClips[name].tracks]
                    newClip = { ...this.baseClips['neutral'], tracks: newTrack, uuid: this.baseClips[name].uuid}
                    newAction = this.mixer.clipAction( newClip )
                    this.emoteActions[name] = newAction
                    break
            }
        }
        
        if(initAction in this.emoteActions) {
            this.currentAction = initAction
            this.emoteActions[initAction].play()
        }
        else {
            this.currentAction = 'neutral'
            this.emoteActions[this.currentAction].play()
        }
    }

    update(delta) {
        // Render loop
        this.mixer?.update(delta);
        this.vrm?.update(delta);
    }
}

// functions
// 3d model
let camera = undefined, controls = undefined
let scene = undefined, renderer = undefined
let model = undefined
let clock = new THREE.Clock();
clock.start();

/** @type {import('svelte/action').Action}  */
export function initVRM(node, params) {
    // the node has been mounted in the DOM

    const width = 240;
    const height = 240;

    // renderer
    renderer = new THREE.WebGLRenderer({
        canvas: node,
        antialias: true,
    });
    renderer.setSize( width, height );
    renderer.setPixelRatio( window.devicePixelRatio );

    // scene
    scene = new THREE.Scene();
    // light
    const light = new THREE.DirectionalLight( 0xffffff, Math.PI );
    light.position.set( 1.0, 1.0, 1.0 ).normalize();
    scene.add( light );

    // camera
    camera = new THREE.PerspectiveCamera( 30.0, width /height, 0.1, 20.0 );
    camera.position.set( 0.02798822913387066, 1.3943109739646713, 0.9521380830414028 );
    // camera control
    controls = new OrbitControls( camera, renderer.domElement );
    controls.screenSpacePanning = true;
    controls.target.set( 0.02798822913387066, 1.3943109739646715, 7.560454450670102e-17 );
    controls.update();

    // Load VRM
    // loadVrm(charactersJson[$user.char].model, charactersJson[$user.char].clips, initAction);
    loadVrm(params.modelURL, params.clipsURL, params.initAction);

    // Render
    update()

    return {
        update(params) {
            // the value of `params` has changed
        },

        destroy() {
            // the node has been removed from the DOM
            unloadVrM()
        }
    };
}

function loadVrm(urlVrm, urlClip, initAction) {
    if (model?.vrm) {
    unloadVrM();
    }

    // gltf and vrm
    // model = new Model(camera || new THREE.Object3D());
    model = new Model();
    model.loadVRM(urlVrm).then(async () => {
        if (!model?.vrm) return;

        // Disable frustum culling
        model.vrm.scene.traverse((obj) => {
            obj.frustumCulled = false;
        });

        await model.loadAnimationClips(urlClip, initAction);

        scene.add(model.vrm.scene);

    });
}

function unloadVrM() {
    if (model?.vrm) {
        scene.remove(model.vrm.scene);
        model?.unLoadVRM();
    }
}

function update() {
    requestAnimationFrame(update);
    const delta = clock.getDelta();

    // update vrm components
    if (model) {
        // vrm update
        model.update(delta);
    }

    renderer.render(scene, camera);
}

export function setEmotion(name) {
    if(model) {
        if( (name in model.emoteActions) && (name != model.currentAction) ) {
            const currentAction = model.emoteActions[model.currentAction]
            const newAction = model.emoteActions[name]
            currentAction.fadeOut( 0.35 )
            newAction
                .reset()
                .setEffectiveTimeScale( 1 )
                .setEffectiveWeight( 1 )
                .fadeIn( 0.35 )
                .play()
            model.currentAction = name
        }
    }
}
