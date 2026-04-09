import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { ThreeJSManager } from '../../lib/ThreeJSManager';
import { Box, Play } from 'lucide-react';

type ShapeType = 'balok' | 'prisma';

interface VolumeLabProps {
  mode: 'fixed' | 'lab';
  shape: ShapeType;
  // Fixed mode props
  p?: number;
  l?: number;
  t?: number;
  segments?: number; // For prisma base
}

/**
 * Komponen interaktif untuk memvisualisasikan volume bangun ruang menggunakan kubus satuan.
 * Mendukung mode 'fixed' (ukuran tetap) dan 'lab' (ukuran dapat diubah pengguna).
 *
 * @param {VolumeLabProps} props - Properti komponen.
 * @param {'fixed' | 'lab'} props.mode - Mode tampilan komponen.
 * @param {ShapeType} props.shape - Jenis bangun ruang ('balok' atau 'prisma').
 * @param {number} [props.p=4] - Panjang (untuk balok).
 * @param {number} [props.l=3] - Lebar (untuk balok).
 * @param {number} [props.t=2] - Tinggi.
 * @param {number} [props.segments=3] - Jumlah sisi alas (untuk prisma).
 * @returns {JSX.Element} Elemen laboratorium volume yang dirender.
 */
export const VolumeLab: React.FC<VolumeLabProps> = ({ mode, shape, p = 4, l = 3, t = 2, segments = 3 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<ThreeJSManager | null>(null);
  
  // Lab State
  const [inputP, setInputP] = useState(p);
  const [inputL, setInputL] = useState(l);
  const [inputT, setInputT] = useState(t);
  const [inputSegments, setInputSegments] = useState(segments);
  
  // Active render state
  const [activeDims, setActiveDims] = useState({ p, l, t, segments });

  useEffect(() => {
    if (!containerRef.current) return;
    const manager = new ThreeJSManager(containerRef.current);
    managerRef.current = manager;
    
    const camera = manager.getCamera();
    camera.position.set(5, 5, 8);
    camera.lookAt(0, 0, 0);

    return () => manager.cleanup();
  }, []);

  useEffect(() => {
    if (!managerRef.current) return;
    const scene = managerRef.current.getScene();
    
    // Clear scene
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const { p: curP, l: curL, t: curT, segments: curSeg } = activeDims;

    if (shape === 'balok') {
        // Draw Container (Wireframe)
        const geo = new THREE.BoxGeometry(curP, curT, curL);
        const edges = new THREE.EdgesGeometry(geo);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.3 });
        const line = new THREE.LineSegments(edges, lineMat);
        scene.add(line);

        // Labels
        const createLabel = (text: string, position: THREE.Vector3) => {
            const div = document.createElement('div');
            div.className = 'bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm text-xs font-bold text-slate-700 border border-slate-200';
            div.textContent = text;
            const label = new CSS2DObject(div);
            label.position.copy(position);
            return label;
        };

        // p (panjang) - front bottom edge
        scene.add(createLabel(`p = ${curP}`, new THREE.Vector3(0, -curT/2 - 0.5, curL/2 + 0.5)));
        // l (lebar) - right bottom edge
        scene.add(createLabel(`l = ${curL}`, new THREE.Vector3(curP/2 + 0.5, -curT/2 - 0.5, 0)));
        // t (tinggi) - right front edge
        scene.add(createLabel(`t = ${curT}`, new THREE.Vector3(curP/2 + 0.5, 0, curL/2 + 0.5)));

        // Instanced Rendering for Unit Cubes
        const totalCubes = curP * curL * curT;
        const cubeGeo = new THREE.BoxGeometry(0.95, 0.95, 0.95);
        const cubeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
        const instancedMesh = new THREE.InstancedMesh(cubeGeo, cubeMat, totalCubes);
        
        const dummy = new THREE.Object3D();
        let i = 0;
        
        const startX = -(curP) / 2 + 0.5;
        const startY = -(curT) / 2 + 0.5;
        const startZ = -(curL) / 2 + 0.5;

        for(let y=0; y<curT; y++) {
            for(let z=0; z<curL; z++) {
                for(let x=0; x<curP; x++) {
                    dummy.position.set(startX + x, startY + y, startZ + z);
                    dummy.updateMatrix();
                    instancedMesh.setMatrixAt(i++, dummy.matrix);
                }
            }
        }
        instancedMesh.instanceMatrix.needsUpdate = true;
        scene.add(instancedMesh);
        
    } else if (shape === 'prisma') {
        const radius = 3;
        
        // Draw Container (Wireframe)
        const containerGeo = new THREE.CylinderGeometry(radius + 0.1, radius + 0.1, curT, curSeg);
        const containerEdges = new THREE.EdgesGeometry(containerGeo);
        const containerLineMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.3 });
        const containerLine = new THREE.LineSegments(containerEdges, containerLineMat);
        scene.add(containerLine);

        // Labels
        const createLabel = (text: string, position: THREE.Vector3) => {
            const div = document.createElement('div');
            div.className = 'bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm text-xs font-bold text-slate-700 border border-slate-200';
            div.textContent = text;
            const label = new CSS2DObject(div);
            label.position.copy(position);
            return label;
        };

        // t (tinggi)
        scene.add(createLabel(`t = ${curT}`, new THREE.Vector3(radius + 0.5, 0, 0)));
        // alas (n-gon)
        scene.add(createLabel(`Alas Segi-${curSeg}`, new THREE.Vector3(0, -curT/2 - 0.5, radius + 0.5)));

        // Tumpukan alas (Layers)
        const layerGeo = new THREE.CylinderGeometry(radius, radius, 0.9, curSeg);
        const layerMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.9 });
        
        const instancedMesh = new THREE.InstancedMesh(layerGeo, layerMat, curT);
        const dummy = new THREE.Object3D();
        
        const startY = -(curT) / 2 + 0.5;
        
        for(let y=0; y<curT; y++) {
            dummy.position.set(0, startY + y, 0);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(y, dummy.matrix);
        }
        
        instancedMesh.instanceMatrix.needsUpdate = true;
        scene.add(instancedMesh);
        
        // Add edges for each layer to make them distinct
        for(let y=0; y<curT; y++) {
            const edges = new THREE.EdgesGeometry(layerGeo);
            const lineMat = new THREE.LineBasicMaterial({ color: 0x1e3a8a });
            const line = new THREE.LineSegments(edges, lineMat);
            line.position.set(0, startY + y, 0);
            scene.add(line);
        }
    }
    
    if (managerRef.current) {
        managerRef.current.needsUpdate = true;
    }

  }, [shape, activeDims]);

  const handleBuild = () => {
      setActiveDims({ p: inputP, l: inputL, t: inputT, segments: inputSegments });
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-slate-200 mt-8">
      <div className="bg-slate-100 p-4 border-b-2 border-slate-200 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Box size={20} /></div>
            <span className="ml-2 text-xs font-bold text-slate-500 uppercase">Lab Banyak Kubus Satuan</span>
         </div>
      </div>
      
      <div className="w-full h-[400px] cursor-move bg-slate-50 relative overflow-hidden" ref={containerRef} />
      
      {mode === 'lab' && (
          <div className="p-4 bg-white border-t-2 border-slate-200">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                  {shape === 'balok' ? (
                      <>
                          <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Panjang (p)</label>
                              <input type="number" min="1" max="10" value={inputP} onChange={e => setInputP(Number(e.target.value))} className="w-full p-2 border-2 rounded-xl font-bold" />
                          </div>
                          <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Lebar (l)</label>
                              <input type="number" min="1" max="10" value={inputL} onChange={e => setInputL(Number(e.target.value))} className="w-full p-2 border-2 rounded-xl font-bold" />
                          </div>
                          <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Tinggi (t)</label>
                              <input type="number" min="1" max="10" value={inputT} onChange={e => setInputT(Number(e.target.value))} className="w-full p-2 border-2 rounded-xl font-bold" />
                          </div>
                      </>
                  ) : (
                      <>
                          <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Jumlah Sisi Alas (n-gon)</label>
                              <input type="number" min="3" max="12" value={inputSegments} onChange={e => setInputSegments(Number(e.target.value))} className="w-full p-2 border-2 rounded-xl font-bold" />
                          </div>
                          <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Tinggi (t)</label>
                              <input type="number" min="1" max="10" value={inputT} onChange={e => setInputT(Number(e.target.value))} className="w-full p-2 border-2 rounded-xl font-bold" />
                          </div>
                      </>
                  )}
                  <button onClick={handleBuild} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition-colors h-[42px]">
                      <Play size={18} /> BANGUN SEKARANG
                  </button>
              </div>
          </div>
      )}
      
      <div className="p-3 bg-slate-50 text-center text-xs text-slate-400 font-bold border-t border-slate-200">
          Geser untuk memutar • Scroll untuk zoom
      </div>
    </div>
  );
};
