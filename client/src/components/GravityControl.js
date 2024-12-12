import React, { useState, useRef, useEffect } from 'react';
import { wsService } from '../services/websocket';
import { StatusPanel } from './StatusPanel';

// text effect
import ShuffleText from 'react-shuffle-text';

// custom styles
import Styles from './custom_styles.module.css'

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

    <div className={`${Styles.parent_com} min-h-screen`}>
      <div className={`${Styles.child_comp} relative overflow-hidden`}>
        {/* Particle Container */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((_, i) => (
            <Particle key={i} gravity={gravity} />
          ))}
        </div>

        <div className={Styles.slicer}>
          <div className={Styles.partition_1}>
            {/* title */}
            <ShuffleText content="Zhuangbility" />
            <h1 className={`${Styles.heading} text-blue-400`}>GRAVITY CONTROL</h1>
          </div>

          <div className={Styles.partition_2}>
            <div ref={containerRef}
              className={`${Styles.scroll_bar} h-96 w-24  relative`}>

              {/* middle line */}
              <div className={`${Styles.middle_line} absolute left-1/2 top-2 bottom-2 w-1 transform -translate-x-1/2`} />

              {/* thumb element */}
              <div
                ref={leverRef}
                onMouseDown={handleMouseDown}
                className={`${Styles.thumb} cursor-pointer shadow-lg flex items-center justify-center`}
                style={{ top: '0px' }}
              >
                <div className="w-12 h-1 bg-white/80 rounded-full" />
              </div>

              {/* number system */}
              <div className="absolute -right-16 top-0 bottom-0 flex flex-col justify-between py-2">
                {['000', '025', '050', '075', '100'].map((mark) => (
                  <div key={mark} className="flex items-center">
                    {/* <div className="w-2 h-0.5 bg-blue-500/50" /> */}
                    <span className={`${Styles.number_system}`}>{mark}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={Styles.partition_3}>
            {/* value indicator */}
            <div className={Styles.g_value}>
              <span> G: {gravity}% </span>
            </div>
          </div>
        </div>

        {/* previous details panels */}
        {/* <div className={`${Styles.slider_wrapper} grid grid-cols-3 relative z-10`}>
          <StatusPanel title="SYSTEM STATUS"
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
        </div> */}
      </div>
    </div>
  );
};

export default GravityControl;