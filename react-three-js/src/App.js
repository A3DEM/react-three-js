import * as THREE from 'three'; 
import React, {useRef, Suspense} from 'react';
import {Canvas, extend, useFrame, useLoader} from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import glsl from 'babel-plugin-glsl/macro';
import './App.css';

const WaveShaderMaterial = shaderMaterial(
  // Uniform
  { 
    uTime: 0,
    uColor: new THREE.Color(0.5, 0.1, 0.8),
    uTexture:  new THREE.Texture(),
  },
  // Vertex Shader
  glsl`
    precision mediump float;

    varying vec2 vUv;

    uniform float uTime;

    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d); 

    void main() {
      vUv = uv;

      vec3 pos = position;
      float noiseFreq = 2.5;
      float noiseAmp = 0.5;
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
      pos.z += snoise3(noisePos) * noiseAmp;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  glsl`
    precision mediump float;
    uniform vec3 uColor;

    varying vec2 vUv;
    uniform float uTime;
    uniform sampler2D uTexture;
    
    void main() {
      vec3 texture = texture2D(uTexture, vUv).rgb;
      gl_FragColor = vec4(texture, 0.9);
    }
  `
);

extend({ WaveShaderMaterial });

const Wave = () => {
  const ref = useRef();
  useFrame(({clock}) => (ref.current.uTime = clock.getElapsedTime()));

  const image = useLoader(THREE.TextureLoader, 'portrait.jpg');

  return (
    <mesh rotation={[0, 0, 0]}>
      <planeBufferGeometry args={[0.5, 0.66, 32, 32]} />
      <waveShaderMaterial ref={ref} uTexture={image} />
    </mesh>
  );
} 

const Scene = () => { 
  return (
    <Canvas camera={{fov: 10, position: [0, 0, 5]}}>
      <Suspense fallback={null}>
        <Wave/>
      </Suspense>
    </Canvas>
  ) 
}

const App = () => {
  return <Scene/>
}

export default App;
