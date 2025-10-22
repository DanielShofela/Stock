import React, { useEffect, useState } from 'react';

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

  useEffect(() => {
    if (stepConfig?.targetId) {
       const timer = setTimeout(() => {
        const element = document.getElementById(stepConfig.targetId);
        if (element) {
          setTargetRect(element.getBoundingClientRect());
        } else {
          setTargetRect(null);
        }
      }, 100); // Small delay to allow for page transitions
      return () => clearTimeout(timer);
    } else {
      setTargetRect(null);
    }
  }, [stepConfig]);

  if (!stepConfig) {
    return null;
  }
  
  const spotlightStyle: React.CSSProperties = targetRect ? {
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

  const bubbleStyle: React.CSSProperties = {};
  if (targetRect) {
      if(stepConfig.position === 'top') {
          bubbleStyle.bottom = `${window.innerHeight - targetRect.top + 16}px`;
          bubbleStyle.left = `${targetRect.left + targetRect.width / 2}px`;
          bubbleStyle.transform = 'translateX(-50%)';
      } else { // bottom
          bubbleStyle.top = `${targetRect.bottom + 16}px`;
          bubbleStyle.left = `${targetRect.left + targetRect.width / 2}px`;
          bubbleStyle.transform = 'translateX(-50%)';
      }
  } else { // center
      bubbleStyle.top = '50%';
      bubbleStyle.left = '50%';
      bubbleStyle.transform = 'translate(-50%, -50%)';
  }

  return (
    <div className="fixed inset-0 z-[9999]">
      <div style={spotlightStyle} />
      <div
        style={bubbleStyle}
        className="absolute bg-white rounded-lg p-4 w-[calc(100%-2rem)] max-w-sm shadow-2xl z-[10001]"
      >
        <h3 className="text-lg font-bold mb-2 text-gray-800">{stepConfig.title}</h3>
        <p className="text-sm text-gray-600">{stepConfig.text}</p>
        <div className="mt-4 flex justify-between items-center">
            {!isLastStep ? <button onClick={onSkip} className="text-xs text-gray-500 hover:underline">Passer</button> : <div />}
            <button 
                onClick={isLastStep ? onDone : onNext}
                className="bg-[#0076BC] text-white font-bold py-2 px-4 rounded-lg text-sm"
            >
                {isLastStep ? 'Terminer' : 'Suivant'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default WalkthroughGuide;