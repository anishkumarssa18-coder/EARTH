import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, Float } from '@react-three/drei';
import { io, Socket } from 'socket.io-client';
import { Activity, Globe, Zap, AlertTriangle, ChevronRight, Eye, Radio, Server, TerminalSquare } from 'lucide-react';
import './App.css';

function Planet({ cities, activeAnomalies }: { cities: any[], activeAnomalies: any[] }) {
  const earthRef = useRef<any>();

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
        <group ref={earthRef}>
          {/* Deep Ocean Core */}
          <Sphere args={[2, 64, 64]}>
            <meshStandardMaterial 
              color="#020813" 
              roughness={0.6}
              metalness={0.8}
            />
          </Sphere>

          {/* Wireframe Hologram Layer */}
          <Sphere args={[2.01, 32, 32]}>
            <meshBasicMaterial 
              color="#00ffcc" 
              wireframe={true} 
              transparent 
              opacity={0.03} 
            />
          </Sphere>

          {/* Atmosphere Glow */}
          <Sphere args={[2.1, 64, 64]}>
            <meshStandardMaterial 
              color="#0a1a2f" 
              transparent 
              opacity={0.15} 
              blending={2} // Additive blending equivalent conceptually
            />
          </Sphere>

          {cities.map((city, i) => {
             const phi = Math.acos(-1 + (2 * i) / cities.length);
             const theta = Math.sqrt(cities.length * Math.PI) * phi;
             const x = 2.02 * Math.cos(theta) * Math.sin(phi);
             const y = 2.02 * Math.sin(theta) * Math.sin(phi);
             const z = 2.02 * Math.cos(phi);

             const isAlert = city.event !== 'None';

             return (
               <group key={city.id} position={[x, y, z]}>
                  {/* City Core Point */}
                  <Sphere args={[0.02, 16, 16]}>
                    <meshBasicMaterial color={isAlert ? '#ff2a2a' : '#00ffcc'} />
                  </Sphere>
                  {/* City Aura */}
                  <Sphere args={[0.06, 16, 16]}>
                    <meshBasicMaterial color={isAlert ? '#ff2a2a' : '#00ffcc'} transparent opacity={0.3} />
                  </Sphere>
               </group>
             )
          })}
        </group>
      </Float>
    </group>
  );
}

function App() {
  const [worldState, setWorldState] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeTab, setActiveTab] = useState<'monitor' | 'god'>('monitor');

  useEffect(() => {
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    newSocket.on('world_update', (data) => {
      setWorldState(data);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const triggerDisaster = (cityId: number) => {
    socket?.emit('trigger_disaster', cityId);
  };

  const triggerAnomaly = () => {
    socket?.emit('manipulate_gravity', { location: { lat: 0, lng: 0 } });
  };

  if (!worldState) {
    return (
      <div className="init-screen">
        <div className="scanner-line"></div>
        <div className="init-content">
          <Globe className="spin-icon" size={48} />
          <h2>SYNCING TO CORE...</h2>
          <p className="monospace">Awaiting connection to planetary persistence engine.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 3D Background */}
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.2} color="#406080" />
          <directionalLight position={[5, 3, 5]} intensity={2} color="#e0f0ff" />
          <pointLight position={[-10, -5, -10]} intensity={1.5} color="#00ffcc" />
          <Stars radius={100} depth={50} count={6000} factor={3} saturation={0.5} fade speed={0.5} />
          <Planet cities={worldState.cities} activeAnomalies={worldState.activeAnomalies} />
          <OrbitControls enableZoom={true} maxDistance={10} minDistance={3} enablePan={false} autoRotate={true} autoRotateSpeed={0.2} />
        </Canvas>
        <div className="vignette-overlay"></div>
      </div>

      {/* Cinematic HUD Layer */}
      <div className="hud-layer">
        
        {/* Top Navbar */}
        <nav className="top-nav">
          <div className="brand">
            <Globe className="brand-icon" />
            <div className="brand-text">
              <h1>EARTH // ALIVE</h1>
              <span className="subtitle">AUTONOMOUS OBSERVER TERMINAL</span>
            </div>
          </div>

          <div className="global-metrics">
            <div className="metric">
              <span className="label">SYS_TICK</span>
              <span className="value monospace neon-text">{worldState.globalTime.toString().padStart(6, '0')}</span>
            </div>
            <div className="divider"></div>
            <div className="metric">
              <span className="label">POPULATION</span>
              <span className="value monospace">{(worldState.population).toLocaleString()}</span>
            </div>
            <div className="divider"></div>
            <div className="metric">
              <span className="label">STATUS</span>
              <span className="value pulse-text success"><Radio size={14}/> LIVE</span>
            </div>
          </div>
        </nav>

        {/* Floating Side Panel */}
        <div className="side-panel left">
          <div className="tabs">
            <button className={`tab ${activeTab === 'monitor' ? 'active' : ''}`} onClick={() => setActiveTab('monitor')}>
              <Server size={16} /> MONITOR
            </button>
            <button className={`tab ${activeTab === 'god' ? 'active' : ''}`} onClick={() => setActiveTab('god')}>
              <TerminalSquare size={16} /> TERMINAL
            </button>
          </div>

          <div className="panel-content glass-card">
            {activeTab === 'monitor' && (
              <div className="node-list">
                <div className="section-title">ACTIVE NODES</div>
                {worldState.cities.map((city: any) => (
                  <div key={city.id} className={`node-item ${city.event !== 'None' ? 'critical' : ''}`}>
                    <div className="node-header">
                      <span className="node-name">{city.name}</span>
                      <span className="node-tech monospace">v{city.techLevel.toFixed(1)}</span>
                    </div>
                    <div className="node-stats">
                      <span>POP: {(city.population / 1000000).toFixed(2)}M</span>
                      <span>WLTH: ${(city.wealth / 1000).toFixed(0)}K</span>
                    </div>
                    {city.event !== 'None' && (
                      <div className="node-alert">
                        <AlertTriangle size={12} /> {city.event}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'god' && (
              <div className="terminal-view">
                <div className="section-title text-red">S-CLASS OVERRIDES</div>
                <div className="action-grid">
                  <button className="override-btn" onClick={triggerAnomaly}>
                    <Zap size={16} /> GRAVITY WELL
                  </button>
                  {worldState.cities.map((city: any) => (
                    <button key={city.id} className="override-btn danger" onClick={() => triggerDisaster(city.id)}>
                      STRIKE: {city.name.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Right Live Feed */}
        <div className="feed-panel right">
          <div className="feed-header">
            <Activity size={16} className="pulse-icon" />
            <span>NEURAL STREAM</span>
          </div>
          <div className="feed-list">
            {worldState.newsFeed.map((news: string, idx: number) => (
              <div key={idx} className="feed-item fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                <span className="bullet"></span>
                <p className="monospace">{news}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
