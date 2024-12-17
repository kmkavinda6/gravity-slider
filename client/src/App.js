import { useEffect } from 'react';
import './App.css';
import { GravityControl } from './components/GravityControl';
function App() {
  // pagereload prevention test -  1
  useEffect(() => {
    // Prevent pull-to-refresh on touch devices
    const handleTouchStart = (event) => {
      if (event.touches.length > 1) {
        event.preventDefault(); // Prevent multi-touch gestures
      }
    };

    let lastY = 0;
    const handleTouchMove = (event) => {
      const currentY = event.touches[0].clientY;

      // Prevent pull-to-refresh when scrolling up at the top of the page
      if (window.scrollY === 0 && currentY > lastY) {
        event.preventDefault();
      }

      lastY = currentY;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Cleanup listeners on component unmount
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div className="App">
      <GravityControl />
    </div>
  );
}

export default App;
