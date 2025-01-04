import React from 'react';
import styles from './Spinner.module.css';

interface SpinnerWrapperProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

const SpinnerWrapper: React.FC<SpinnerWrapperProps> = ({ children, label, className = '' }) => (
  <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
    {children}
    {label && (
      <div className="text-sm font-medium text-gray-600 animate-pulse">
        {label}
      </div>
    )}
  </div>
);

interface SpinnerProps {
  speed?: number;
  color?: string;
}

const Drummer: React.FC<SpinnerProps> = ({ speed = 800, color = '#ef4444' }) => {
  const speedClass = speed <= 400 ? styles.speedFast : styles.speedSlow;
  const colorClass = styles[`color${color.charAt(1).toUpperCase()}${color.slice(2)}`];

  return (
    <div
      aria-label="Loading"
      role="status"
      className="flex flex-col items-center justify-center p-4 space-y-2"
    >
      <div className="sr-only">Loading Drummer...</div>
      <div className="relative flex items-end justify-center space-x-4">
        <div className={`${styles.drumstick} ${styles.drumstickElement} ${speedClass} ${colorClass}`} />
      </div>
      <div className="flex space-x-4 mt-2">
        <div className="w-6 h-6 rounded-full bg-gray-300" />
        <div className="w-8 h-8 rounded-full bg-gray-400" />
        <div className="w-6 h-6 rounded-full bg-gray-300" />
      </div>
    </div>
  );
};

const BrickLayer: React.FC<SpinnerProps> = ({ speed = 600, color = '#f59e0b' }) => {
  const speedClass = speed <= 400 ? styles.speedFast : styles.speedSlow;
  const colorClass = styles[`color${color.charAt(1).toUpperCase()}${color.slice(2)}`];

  return (
    <div
      aria-label="Loading"
      role="status"
      className="flex flex-col items-center justify-center p-4 space-y-2"
    >
      <div className="sr-only">Loading Brick Layer...</div>
      <div className="flex flex-wrap w-32 h-16 bg-transparent relative overflow-hidden border-2 border-gray-200">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-1/3 h-1/2 flex items-center justify-center">
            <div className={`${styles.brick} ${styles.brickElement} ${speedClass} ${colorClass}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Gardener: React.FC<SpinnerProps> = ({ speed = 1200, color = '#10b981' }) => {
  const speedClass = speed <= 400 ? styles.speedFast : styles.speedSlow;
  const colorClass = styles[`color${color.charAt(1).toUpperCase()}${color.slice(2)}`];

  return (
    <div
      aria-label="Loading"
      role="status"
      className="flex flex-col items-center justify-center p-4"
    >
      <div className="sr-only">Loading Gardener...</div>
      <div className="relative w-16 h-16 flex items-end justify-center">
        <div className="absolute bottom-0 w-full h-2 bg-gray-400" />
        <div className={`${styles.growPlant} ${styles.plantElement} ${speedClass} ${colorClass}`} />
      </div>
    </div>
  );
};

const Scribbler: React.FC<SpinnerProps> = ({ speed = 1000, color = '#3b82f6' }) => {
  const speedClass = speed <= 400 ? styles.speedFast : styles.speedSlow;
  const colorClass = styles[`stroke${color.charAt(1).toUpperCase()}${color.slice(2)}`];

  return (
    <div
      aria-label="Loading"
      role="status"
      className="flex flex-col items-center justify-center p-4"
    >
      <div className="sr-only">Loading Scribbler...</div>
      <svg width="64" height="64" viewBox="0 0 64 64">
        <path
          d="M32 32 C 32 16, 48 16, 48 32 C 48 48, 16 48, 16 32 C 16 16, 32 16, 32 32 Z"
          className={`${styles.scribble} ${styles.scribblePath} ${speedClass} ${colorClass}`}
        />
      </svg>
    </div>
  );
};

const getRandomSpinner = (weights: { drummer: number; brick: number; gardener: number; scribbler: number; }) => {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  const randomColor = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'][Math.floor(Math.random() * 4)];
  const speed = Math.random() > 0.7 ? 400 : 800;

  if ((random -= weights.drummer) < 0) return <Drummer speed={speed} color={randomColor} />;
  if ((random -= weights.brick) < 0) return <BrickLayer speed={speed} color={randomColor} />;
  if ((random -= weights.gardener) < 0) return <Gardener speed={speed} color={randomColor} />;
  return <Scribbler speed={speed} color={randomColor} />;
};

const LoadingSpinner: React.FC<{ label?: string }> = ({ label }) => {
  const [spinner, setSpinner] = React.useState<React.ReactNode>(null);

  React.useEffect(() => {
    const updateSpinner = () => {
      setSpinner(getRandomSpinner({
        drummer: 1.5,
        brick: 1.2,
        gardener: 1,
        scribbler: 1
      }));
    };

    updateSpinner();
    const interval = setInterval(updateSpinner, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SpinnerWrapper label={label}>
      {spinner}
    </SpinnerWrapper>
  );
};

export {
  Drummer,
  BrickLayer,
  Gardener,
  Scribbler,
  getRandomSpinner,
  LoadingSpinner,
  SpinnerWrapper
};