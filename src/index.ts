import { Noise } from 'noisejs';
import * as React from 'react';
import * as THREE from 'three';
import * as OBJLoader from 'three-obj-loader';
const noise = new Noise(Math.random());
import 'styles/main.scss';
declare function require(name: string);
const Bird = require('./models/bird.obj');

OBJLoader(THREE);
const loader: THREE.OBJLoader = new THREE.OBJLoader();

const rendererWidth = 800;
const rendererHeight = 800;

const birds: THREE.Group[] = [];
loader.load(
  Bird,
  (object) => {
    const process = (radius: number, angle: number, scale: number = 1) => {
      const clone = object.clone();
      birds.push(clone);
      clone.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      clone.rotateX(Math.PI * 2 * Math.random());
      clone.rotateY(Math.PI * 2 * Math.random());
      clone.scale.multiplyScalar(scale);
      clone.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, side: THREE.DoubleSide });
        }
      });
      scene.add(clone);
    };
    const offeset = 8;
    let startPoint = 60;
    while (startPoint > 0) {
      for (let i = 0; i < startPoint; i++) {
        process(startPoint, Math.PI * 2 / startPoint * i);
      }
      startPoint -= offeset;
    }
  },
);

const scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0xFFFFFF));
const light = new THREE.PointLight(0x4488ff, 5, 100);
light.position.set(2, 2, 5);
scene.add(light);
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(75, rendererWidth / rendererHeight, 0.1, 1000);
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(rendererWidth, rendererHeight);

function renderingLoop() {
  renderer.render(scene, camera);
  requestAnimationFrame(renderingLoop);
  birds.forEach(d => {
    d.rotateX(Math.random() * 0.04 + 0.01);
    d.rotateY(Math.random() * 0.04 + 0.01);
  });
}
document.body.appendChild(renderer.domElement);
renderingLoop();
