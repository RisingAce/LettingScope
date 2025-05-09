import React, { useRef, useState } from 'react';

interface CompareSliderProps {
  before: string; // URL or base64
  after: string;  // URL or base64
  height?: number | string;
  width?: number | string;
}

const CompareSlider: React.FC<CompareSliderProps> = ({ before, after, height = 400, width = '100%' }) => {
  const [sliderPos, setSliderPos] = useState(50); // percent
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    let clientX;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    let pos = ((clientX - rect.left) / rect.width) * 100;
    pos = Math.max(0, Math.min(100, pos));
    setSliderPos(pos);
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', height, width, overflow: 'hidden', userSelect: 'none' }}
      onMouseMove={e => e.buttons === 1 && handleDrag(e)}
      onTouchMove={handleDrag}
    >
      {/* Before Image (clipped right of slider) */}
      <img
        src={before}
        alt="Before"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          objectFit: 'cover',
          zIndex: 1,
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
        }}
        draggable={false}
      />
      {/* After Image (clipped left of slider) */}
      <img
        src={after}
        alt="After"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          objectFit: 'cover',
          zIndex: 2,
          clipPath: `inset(0 0 0 ${sliderPos}%)`
        }}
        draggable={false}
      />
      {/* Slider Handle */}
      <div
        style={{
          position: 'absolute',
          left: `calc(${sliderPos}% - 16px)`,
          top: 0,
          height: '100%',
          width: 32,
          cursor: 'ew-resize',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 215, 0, 0.10)',
        }}
        onMouseDown={e => e.preventDefault()}
        onMouseMove={e => e.buttons === 1 && handleDrag(e)}
        onTouchStart={handleDrag}
        onTouchMove={handleDrag}
      >
        <div
          style={{
            width: 4,
            height: '80%',
            background: 'gold',
            borderRadius: 2,
            boxShadow: '0 0 6px gold',
          }}
        />
      </div>
    </div>
  );
};

export default CompareSlider;
