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

// number system
import NumberSystem from './UI/NumberSystem';

// overlays
import Overlay from './UI/Overlay';

// custom styles
import Styles from './custom_styles.module.css'

const ParticleComponent = () => <Particle className={Styles.particle_layer} />;

export const GravityControl = () => {
  const [gravity, setGravity] = useState(100);
  const [connected, setConnected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const leverRef = useRef(null);
  const containerRef = useRef(null);
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

    const sections = [
      { start: -1, end: 6, value: 0 },
      { start: 5, end: 11, value: 5 },
      { start: 10, end: 16, value: 10 },
      { start: 15, end: 21, value: 15 },

      { start: 20, end: 26, value: 20 },
      { start: 25, end: 31, value: 25 },
      { start: 30, end: 36, value: 30 },
      { start: 35, end: 41, value: 35 },

      { start: 40, end: 46, value: 40 },
      { start: 45, end: 51, value: 45 },
      { start: 50, end: 56, value: 50 },
      { start: 55, end: 61, value: 55 },

      { start: 60, end: 66, value: 60 },
      { start: 65, end: 71, value: 65 },
      { start: 70, end: 76, value: 70 },
      { start: 75, end: 81, value: 75 },

      { start: 80, end: 86, value: 80 },
      { start: 85, end: 91, value: 85 },
      { start: 90, end: 96, value: 90 },
      { start: 95, end: 101, value: 95 },
    ]

    for (const { start, end, value } of sections) {
      if (start < percentage && percentage < end) {
        // console.log(percentage)
        // console.log(value)
        setGravity(value);
        wsService.sendGravity(value);
      }
    }
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
      {/* overlay messages */}
      {/* <Overlay
        message="Start the Program"
        display={true} /> */}

      {/* <Overlay
        message="End of the Program"
        display={true} /> */}

      {/* real time particles */}
      <ParticleComponent />

      {/* outer border */}
      <div className={Styles.outer_border}></div>

      <div className={`${Styles.child_comp} relative overflow-hidden`}>
        {/* slicer */}
        <div className={Styles.slicer}>
          <div className={Styles.partition_1}>
            <h1 className={`${Styles.heading} text-blue-400`}>GRAVITY CONTROL</h1>
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
                <div className={Styles.thumb_line} />
              </div>

              {/* number systems /side panel */}
              <NumberSystem />
            </div>
          </div>
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
          url='/Background.mp4'></ReactPlayer>
      </div>
    </div>
  );
};

export default GravityControl;