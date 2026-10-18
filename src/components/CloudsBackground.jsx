import { useEffect, useRef } from 'react';
import {
  Camera, Color, Mesh, PlaneGeometry, Scene, ShaderMaterial,
  TextureLoader, Vector2, Vector3, WebGLRenderer,
} from 'three';
import CLOUDS2 from 'vanta/src/vanta.clouds2.js';

const THREE = {
  Camera, Color, Mesh, PlaneGeometry, Scene, ShaderMaterial,
  TextureLoader, Vector2, Vector3, WebGLRenderer,
};

export const cloudsOptions = {
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200,
  minWidth: 200,
  scale: 1,
  scaleMobile: 4,
  backgroundAlpha: 1,
  backgroundColor: 0x000000,
  skyColor: 0x5ca6ca,
  cloudColor: 0x334d80,
  lightColor: 0xffffff,
  speed: 0.5,
  texturePath: `${import.meta.env.BASE_URL}textures/clouds-noise.png`,
};

export default function CloudsBackground() {
  const container = useRef(null);

  useEffect(() => {
    const element = container.current;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let effect;
    let ready = false;
    let running = true;
    let disposed = false;
    let textureCheck;
    let firstResize;
    const loadingStarted = performance.now();

    function syncAnimation() {
      if (!effect || !ready || disposed) return;

      const shouldRun = !document.hidden && !motionPreference.matches;
      if (!shouldRun && running) {
        cancelAnimationFrame(effect.req);
        running = false;
      } else if (shouldRun && !running) {
        effect.prevNow = performance.now();
        effect.animationLoop();
        running = true;
      }
    }

    function waitForTexture() {
      if (disposed) return;
      const textureImage = effect.uniforms?.iTex?.value?.image;

      if (textureImage?.complete && textureImage.naturalWidth > 0) {
        ready = true;
        element.dataset.ready = 'true';
        effect.resize();
        effect.renderer.render(effect.scene, effect.camera);
        syncAnimation();
      } else if (performance.now() - loadingStarted < 15000) {
        textureCheck = requestAnimationFrame(waitForTexture);
      } else {
        cancelAnimationFrame(effect.req);
        running = false;
        console.warn('Cloud texture unavailable. Using the static sky.');
      }
    }

    function renderStillFrame() {
      if (ready && !running && effect?.renderer) {
        effect.resize();
        effect.renderer.render(effect.scene, effect.camera);
      }
    }

    try {
      effect = CLOUDS2({ ...cloudsOptions, el: element, THREE });
      if (!effect.renderer) throw new Error('WebGL is unavailable');
      const originalResize = effect.resize;
      const bufferSize = new Vector2();
      window.removeEventListener('resize', originalResize);
      effect.resize = () => {
        originalResize();
        effect.renderer.getDrawingBufferSize(bufferSize);
        effect.uniforms.iResolution.value.copy(bufferSize);
      };
      window.addEventListener('resize', effect.resize);
      firstResize = requestAnimationFrame(effect.resize);
      waitForTexture();
    } catch (error) {
      element.dataset.ready = 'false';
      console.warn('Cloud background unavailable. Using the static sky.', error);
    }

    document.addEventListener('visibilitychange', syncAnimation);
    motionPreference.addEventListener('change', syncAnimation);
    window.addEventListener('resize', renderStillFrame);

    return () => {
      disposed = true;
      cancelAnimationFrame(textureCheck);
      cancelAnimationFrame(firstResize);
      document.removeEventListener('visibilitychange', syncAnimation);
      motionPreference.removeEventListener('change', syncAnimation);
      window.removeEventListener('resize', renderStillFrame);
      const renderer = effect?.renderer;
      const texture = effect?.uniforms?.iTex?.value;
      effect?.destroy();
      texture?.dispose();
      renderer?.dispose();
    };
  }, []);

  return <div ref={container} className="clouds-background" aria-hidden="true" />;
}
