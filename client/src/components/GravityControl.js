import React, { useState, useRef, useEffect } from 'react';
import { wsService } from '../services/websocket';
import { StatusPanel } from './StatusPanel';

// Particle component for visual effects
const Particle = ({ gravity }) => {
  const [position, setPosition] = useState({
    x: Math.random() * 100,
    y: Math.random() * 100
  });
  const [velocity, setVelocity] = useState({
    x: (Math.random() - 0.5) * 2,
    y: (Math.random() - 0.5) * 2
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        // Calculate new position based on gravity
        const gravityEffect = (gravity / 100) * 0.5;
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y + gravityEffect;

        // Bounce off walls
        if (newX < 0 || newX > 100) {
          setVelocity(prev => ({ ...prev, x: -prev.x * 0.8 }));
          newX = Math.max(0, Math.min(100, newX));
        }

        // Floor collision when gravity is high
        if (newY > 100) {
          newY = 100;
          setVelocity(prev => ({ ...prev, y: -prev.y * 0.5 }));
        }

        // Ceiling collision
        if (newY < 0) {
          newY = 0;
          setVelocity(prev => ({ ...prev, y: -prev.y * 0.5 }));
        }

        return { x: newX, y: newY };
      });

      // Add random movement when gravity is low
      if (gravity < 20) {
        setVelocity(prev => ({
          x: prev.x + (Math.random() - 0.5) * 0.2,
          y: prev.y + (Math.random() - 0.5) * 0.2
        }));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [gravity]);

  return (
    <div 
      className="absolute w-2 h-2 rounded-full bg-blue-400/50"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transition: 'box-shadow 0.3s',
        boxShadow: `0 0 ${(100 - gravity) / 10}px ${(100 - gravity) / 20}px rgba(96, 165, 250, 0.5)`
      }}
    />
  );
};

export const GravityControl = () => {
  const [gravity, setGravity] = useState(100);
  const [connected, setConnected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const leverRef = useRef(null);
  const containerRef = useRef(null);
  const particles = Array(15).fill(null);

  useEffect(() => {
    wsService.connect();

    const unsubscribe = wsService.subscribe(({ type, data }) => {
      if (type === 'state') {
        setGravity(data.gravity);
        setConnected(data.connected);
      }
    });

    return () => {
      unsubscribe();
      wsService.disconnect();
    };
  }, []);

  const updateLeverPosition = (clientY) => {
    if (!containerRef.current || !leverRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const leverHeight = 40;
    let newY = clientY - containerRect.top - (leverHeight / 2);
    newY = Math.max(0, Math.min(newY, containerRect.height - leverHeight));
    
    leverRef.current.style.top = `${newY}px`;
    const percentage = Math.round((newY / (containerRect.height - leverHeight)) * 100);
    setGravity(percentage);
    wsService.sendGravity(percentage);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      updateLeverPosition(e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-800 p-8 rounded-2xl shadow-2xl border-2 border-blue-500/30 relative overflow-hidden">
        {/* Particle Container */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((_, i) => (
            <Particle key={i} gravity={gravity} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-8 relative z-10">
          {/* Left Panel - System Status */}
          <StatusPanel
            title="SYSTEM STATUS"
            items={[
              {
                label: "Power",
                value: "ONLINE",
                color: "text-green-400"
              },
              {
                label: "OSC Link",
                value: connected ? "CONNECTED" : "STANDBY",
                color: connected ? "text-green-400" : "text-yellow-400"
              },
              {
                label: "Artificial Gravity",
                value: gravity === 0 ? "DISABLED" : "ENABLED",
                color: gravity === 0 ? "text-red-400" : "text-green-400"
              }
            ]}
          />

          {/* Center Panel - Main Control */}
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold text-blue-400 mb-6 font-mono tracking-wider">
              GRAVITY CONTROL
            </h1>
            <div 
              ref={containerRef}
              className="h-96 w-24 bg-gradient-to-b from-slate-700 to-slate-900 rounded-lg relative border border-blue-500/30"
            >
              <div className="absolute left-1/2 top-2 bottom-2 w-1 bg-blue-900/50 transform -translate-x-1/2" />
              <div 
                ref={leverRef}
                onMouseDown={handleMouseDown}
                className="absolute left-1/2 w-20 h-10 -translate-x-1/2 bg-gradient-to-r from-red-600 to-red-500 rounded cursor-pointer shadow-lg flex items-center justify-center transition-colors hover:from-red-500 hover:to-red-400"
                style={{ top: '0px' }}
              >
                <div className="w-12 h-1 bg-white/80 rounded-full" />
              </div>
              <div className="absolute -right-8 top-0 bottom-0 flex flex-col justify-between py-2">
                {[0, 25, 50, 75, 100].map((mark) => (
                  <div key={mark} className="flex items-center">
                    <div className="w-2 h-0.5 bg-blue-500/50" />
                    <span className="text-blue-400 text-xs ml-2 font-mono">{mark}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 bg-black/50 px-6 py-3 rounded-lg border border-blue-500/30">
              <span className="text-2xl font-mono text-green-400">
                G: {gravity}%
              </span>
            </div>
          </div>

          {/* Right Panel - Telemetry */}
          <StatusPanel
            title="TELEMETRY"
            items={[
              {
                label: "Room Pressure",
                value: "1.013 atm"
              },
              {
                label: "Particle Behavior",
                value: gravity === 0 ? "FLOATING" : "FALLING"
              },
              {
                label: "Field Strength",
                value: `${gravity / 100} G`
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default GravityControl;