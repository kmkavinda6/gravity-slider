import React, { useState, useRef, useEffect } from 'react';
import { wsService } from '../services/websocket';
import { StatusPanel } from './StatusPanel';
import ReactPlayer from 'react-player'

// text shuffling aniamtion 
import Scramble from 'react-scramble'

// particles effect 
import Particle from './Particles';

// markers
import Markers from './UI/markers';

// custom styles
import Styles from './custom_styles.module.css'

const ParticleComponent = () => <Particle className={Styles.particle_layer} />;

export const GravityControl = () => {
  const [gravity, setGravity] = useState(100);
  const [connected, setConnected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const leverRef = useRef(null);
  const containerRef = useRef(null);
  // const particles = Array(15).fill(null);

  setInterval(() => {
    console.log("lolz")
  }, 2000);

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

  const handleTouchStart = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      updateLeverPosition(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div className={`${Styles.parent_com} min-h-screen`}>
      {/* real time particles */}
      <ParticleComponent />

      <div className={`${Styles.child_comp} relative overflow-hidden`}>
        {/* slicer */}
        <div className={Styles.slicer}>
          <div className={Styles.partition_1}>
            <Scramble
              className={`${Styles.heading} text-blue-400`}
              autoStart={true}
              text="GRAVITY CONTROL"
              steps={[
                {
                  roll: 10,
                  action: '+',
                  type: 'all',
                },
                {
                  action: '-',
                  type: 'forward',
                },
              ]}
            />
            {/* <h1 className={`${Styles.heading} text-blue-400`}>GRAVITY CONTROL</h1> */}
          </div>

          <div className={Styles.partition_2}>
            <div ref={containerRef} className={`${Styles.scroll_bar} h-96 w-24  relative`}>
              {/* markers */}
              <Markers />

              {/* middle line */}
              <div className={`${Styles.middle_line} absolute left-1/2 top-2 bottom-2 w-1 transform -translate-x-1/2`} />

              {/* scroll bar */}
              <div
                ref={leverRef}
                onTouchStart={handleTouchStart}
                onMouseDown={handleMouseDown}
                className={`${Styles.thumb} cursor-pointer shadow-lg flex items-center justify-center`}
                style={{ top: '0px' }}
              >
                <div style={{ backgroundColor: '#009af9' }} className="w-12 h-1 bg-white/80 rounded-full" />
              </div>

              {/* number systems /side panel */}
              <div className="absolute -right-14 top-0 bottom-0 flex flex-col justify-between py-2">
                {['000', '025', '050', '075', '100'].map((mark) => (
                  <div key={mark} className="flex items-center">
                    <span className={`${Styles.number_system}`}>{mark}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* <div className={Styles.partition_3}>
            <div className={Styles.g_value}>
              <span> G: {gravity}% </span>
            </div>
          </div> */}
        </div>

        {/* blur layer */}
        <div className={Styles.blur_layer}></div>

        {/* video background */}
        <ReactPlayer
          className={Styles.video_background}
          loop={true}
          controls={false}
          muted={true}
          playing={true}
          style={{ objectFit: 'fill' }}
          url='/Background_Loop.0.mp4'></ReactPlayer>
      </div>
    </div>
  );
};

export default GravityControl;