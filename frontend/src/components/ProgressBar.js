// src/components/ProgressBar.jsx
import { useEffect, useRef } from 'react';

export default function ProgressBar({ steps = [], active = 0 }) {
  const barRef = useRef(null);

  useEffect(() => {
    if (!barRef.current) return;

    const total = steps.length - 1;
    const progress = (active / total) * 100;
    barRef.current.style.width = `${progress}%`;
  }, [active, steps.length]);

  return (
    <div className="progress-container">
      <div className="progress-track" />
      <div className="progress-fill" ref={barRef} />

      <div className="progress-steps">
        {steps.map((label, i) => (
          <div
            key={i}
            className={`step ${i < active ? 'completed' : ''} ${i === active ? 'active' : ''}`}
          >
            <span className="step-label">{label}</span>
            <div className="dot">
              <div className="inner" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
