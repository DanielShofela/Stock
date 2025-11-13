import React, { useEffect, useState, useCallback } from 'react';

export type Step = {
  title: string;
  text: string;
  targetId?: string;
  position?: 'top' | 'bottom' | 'center';
};

interface WalkthroughGuideProps {
  stepConfig: Step | null;
  onNext: () => void;
  onSkip: () => void;
  onDone: () => void;
  isLastStep: boolean;
}

const WalkthroughGuide: React.FC<WalkthroughGuideProps> = ({ stepConfig, onNext, onSkip, onDone, isLastStep }) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const calculateTargetRect = useCallback(() => {
    if (stepConfig?.targetId) {
      const element = document.getElementById(stepConfig.targetId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [stepConfig?.targetId]);

  useEffect(() => {
    // A small delay is needed to wait for page transitions to finish
    // before calculating the target element's position.
    const timer = setTimeout(calculateTargetRect, 150);
    window.addEventListener('resize', calculateTargetRect);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateTargetRect);
    };
  }, [calculateTargetRect, stepConfig]);

  if (!stepConfig) {
    return null;
  }

  const hasTarget = Boolean(targetRect);
  
  const spotlightStyle: React.CSSProperties = hasTarget && targetRect ? {
      position: 'absolute',
      left: `${targetRect.left - 8}px`,
      top: `${targetRect.top - 8}px`,
      width: `${targetRect.width + 16}px`,
      height: `${targetRect.height + 16}px`,
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
      borderRadius: '12px',
      zIndex: 10000,
      transition: 'all 0.3s ease-in-out',
      pointerEvents: 'none',
  } : {};

  // Always center the informational bubble for maximum responsiveness.
  const bubbleStyle: React.CSSProperties = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10001,
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {hasTarget ? (
          <div style={spotlightStyle} />
      ) : (
          <div className="absolute inset-0 bg-black bg-opacity-60" aria-hidden="true" />
      )}
      
      <div
        style={bubbleStyle}
        className="bg-white rounded-lg p-4 w-[calc(100%-2rem)] max-w-sm shadow-2xl"
        role="dialog"
        aria-labelledby="walkthrough-title"
        aria-describedby="walkthrough-text"
      >
        <h3 id="walkthrough-title" className="text-lg font-bold mb-2 text-gray-800">{stepConfig.title}</h3>
        <p id="walkthrough-text" className="text-sm text-gray-600">{stepConfig.text}</p>
        <div className="mt-4 flex justify-between items-center">
            {!isLastStep ? <button onClick={onSkip} className="text-xs text-gray-500 hover:underline">Passer</button> : <div />}
            <button 
                onClick={isLastStep ? onDone : onNext}
                className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
            >
                {isLastStep ? 'Terminer' : 'Suivant'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default WalkthroughGuide;