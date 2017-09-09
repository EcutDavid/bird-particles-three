declare function require(name: string);
import * as React from 'react';
import * as THREE from 'three';
import * as OBJLoader from 'three-obj-loader';
const BirdOBJ = require('./models/bird.obj');

import 'styles/main.scss';

OBJLoader(THREE);
const loader: THREE.OBJLoader = new THREE.OBJLoader();

const rendererWidth = 800;
const rendererHeight = 800;
const camera = new THREE.PerspectiveCamera(75, rendererWidth / rendererHeight, 0.1, 1000);
// Every mesh will have 0 as its z postion to simplify things.
const distanceFromCamera = 100;
camera.position.z = distanceFromCamera;
const visibleHeight = 2 * Math.tan((Math.PI / 180) * camera.fov / 2) * distanceFromCamera;
const visibleWidth = visibleHeight * rendererHeight / rendererHeight;

const maxSpeed = 5;

class Bird {
  private speedX = 0;
  private speedY = 0;
  private rotateX = 0.05 * Math.random() + 0.01;
  private rotateY = 0.05 * Math.random() + 0.01;
  private mesh: THREE.Group;

  constructor(srcGroup: THREE.Group, private posX: number, private posY: number) {
    this.mesh = srcGroup.clone();

    this.mesh.rotateX(Math.PI * 2 * Math.random());
    this.mesh.rotateY(Math.PI * 2 * Math.random());

    this.mesh.scale.multiplyScalar(1 + Math.random())

    this.mesh.position.x = (Math.random() - 0.5) * visibleWidth;
    this.mesh.position.y = (Math.random() - 0.5) * visibleWidth;

    this.mesh.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, side: THREE.DoubleSide });
      }
    });
    scene.add(this.mesh);
  }

  update(mouseX: number, mouseY: number) {
    const { x, y } = this.mesh.position;
    this.speedX = (this.posX - x) / visibleWidth * maxSpeed;
    this.speedY = (this.posY - y) / visibleHeight * maxSpeed;

    const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
    if (distance < 20) {
      const accX = (mouseX - x) / 3;
      this.speedX -= accX;

      const accY = (mouseY - y) / 3;
      this.speedY -= accY;
    }

    this.mesh.position.x += this.speedX;
    this.mesh.rotateX(this.rotateX);
    this.mesh.rotateY(this.rotateY);
    this.mesh.position.y += this.speedY;
  }

}

const birds: Bird[] = [];
loader.load(
  BirdOBJ, object => {
    const process = (radius: number, angle: number, scale: number = 1) => {

      const bird = new Bird(object, Math.cos(angle) * radius, Math.sin(angle) * radius);
      birds.push(bird);
    };
    const offeset = 8;
    let startPoint = 75;
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
const renderer = new THREE.WebGLRenderer();
renderer.setSize(rendererWidth, rendererHeight);

const displayRatio = visibleHeight / rendererWidth;
document.addEventListener('mousemove', onDocumentMouseMove);
let rayX = -100;
let rayY = -100;
function onDocumentMouseMove(evt: MouseEvent) {
  rayX = (evt.clientX - renderer.domElement.offsetLeft) * displayRatio - visibleWidth / 2;
  rayY = -((evt.clientY - renderer.domElement.offsetTop) * displayRatio - visibleHeight / 2);
}

function renderingLoop() {
  renderer.render(scene, camera);
  requestAnimationFrame(renderingLoop);
  birds.forEach(d => d.update(rayX, rayY));
}
document.querySelector('#app').appendChild(renderer.domElement);
(document.querySelector('#SC') as any).style.display = 'block';
renderingLoop();
