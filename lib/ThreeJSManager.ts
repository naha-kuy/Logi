import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

/**
 * Kelas manajer untuk menangani rendering dan interaksi 3D menggunakan Three.js.
 * Mengelola scene, kamera, renderer, dan kontrol orbit.
 */
export class ThreeJSManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private labelRenderer: CSS2DRenderer;
  private controls: OrbitControls;
  private animationId: number | null = null;
  private isMobile: boolean;
  
  // FPS Control
  private fps: number = 30;
  private fpsInterval: number;
  private now: number = 0;
  private then: number = 0;
  private elapsed: number = 0;

  // On-Demand Control
  public needsUpdate: boolean = true;

  /**
   * Menginisialisasi manager Three.js dengan scene, kamera, renderer, dan kontrol.
   * @param container Elemen HTML tempat canvas 3D akan dirender.
   */
  constructor(container: HTMLElement) {
    this.container = container;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // FPS Init
    this.fpsInterval = 1000 / this.fps;
    this.then = Date.now();

    // Init Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf8fafc); // Slate-50

    // Init Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(4, 3, 5);

    // Init Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1 : 1.5)); // Reduced pixel ratio for performance
    container.appendChild(this.renderer.domElement);

    // Init Label Renderer
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(container.clientWidth, container.clientHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0px';
    this.labelRenderer.domElement.style.left = '0px';
    this.labelRenderer.domElement.style.width = '100%';
    this.labelRenderer.domElement.style.height = '100%';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    this.labelRenderer.domElement.style.overflow = 'hidden';
    container.appendChild(this.labelRenderer.domElement);

    // Init Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 1.0;

    // On-Demand Triggers
    this.controls.addEventListener('change', () => {
      this.needsUpdate = true;
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

    // Resize Handler
    window.addEventListener('resize', this.onResize);
    
    // Start Loop
    this.animate();
  }

  /**
   * Menangani perubahan ukuran jendela (resize) untuk menyesuaikan aspek rasio kamera dan ukuran renderer.
   */
  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.labelRenderer.setSize(width, height);
    this.needsUpdate = true;
  };

  /**
   * Loop animasi utama yang mengatur rendering berdasarkan frame rate (FPS) dan kebutuhan pembaruan (on-demand).
   */
  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    // Calc elapsed time
    this.now = Date.now();
    this.elapsed = this.now - this.then;

    // If enough time has passed, render (Cap at 30 FPS)
    if (this.elapsed > this.fpsInterval) {
      this.then = this.now - (this.elapsed % this.fpsInterval);

      // Always update controls to handle damping and auto-rotation
      // This will trigger 'change' event if the camera moves
      this.controls.update();

      // Render only if needed
      if (this.needsUpdate) {
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
        
        // Reset flag. 
        // If autoRotate is on, 'change' event will fire again immediately in next controls.update(), setting it to true.
        // If damping is active, 'change' event will fire as long as it moves.
        // If static, 'change' won't fire, so needsUpdate remains false.
        this.needsUpdate = false;
      }
    }
  };

  /**
   * Mengambil objek Scene utama.
   * @returns THREE.Scene
   */
  public getScene() {
    return this.scene;
  }

  /**
   * Mengambil objek Kamera utama.
   * @returns THREE.PerspectiveCamera
   */
  public getCamera() {
    return this.camera;
  }

  /**
   * Mengambil objek OrbitControls untuk interaksi kamera.
   * @returns OrbitControls
   */
  public getControls() {
    return this.controls;
  }

  /**
   * Meminta renderer untuk melakukan render ulang pada frame berikutnya.
   */
  public requestRender() {
    this.needsUpdate = true;
  }

  /**
   * Membersihkan semua resource Three.js (geometri, material, event listener) untuk mencegah memory leak.
   */
  public cleanup() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onResize);
    
    // Dispose Controls
    this.controls.dispose();

    // Dispose Scene Objects (Recursive)
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Sprite) {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          const cleanMaterial = (material: THREE.Material) => {
            material.dispose();
            // Dispose textures
            const mat = material as THREE.MeshStandardMaterial;
            if (mat.map) mat.map.dispose();
            if (mat.lightMap) mat.lightMap.dispose();
            if (mat.bumpMap) mat.bumpMap.dispose();
            if (mat.normalMap) mat.normalMap.dispose();
            if ((mat as any).specularMap) (mat as any).specularMap.dispose();
            if (mat.envMap) mat.envMap.dispose();
            if (mat.alphaMap) mat.alphaMap.dispose();
            if (mat.aoMap) mat.aoMap.dispose();
            if (mat.displacementMap) mat.displacementMap.dispose();
            if (mat.emissiveMap) mat.emissiveMap.dispose();
            if (mat.metalnessMap) mat.metalnessMap.dispose();
            if (mat.roughnessMap) mat.roughnessMap.dispose();
          };

          if (Array.isArray(object.material)) {
            object.material.forEach(cleanMaterial);
          } else {
            cleanMaterial(object.material);
          }
        }
      }
    });

    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
    if (this.container.contains(this.labelRenderer.domElement)) {
      this.container.removeChild(this.labelRenderer.domElement);
    }
  }
}
