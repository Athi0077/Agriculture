import React, { useState, useEffect } from 'react';
import './AnalysisLoader.css'; // Assuming we create a basic CSS file or use inline styles

const steps = [
  "Analyzing crop image",
  "Checking weather conditions",
  "Evaluating crop stage",
  "Checking local disease history",
  "Calculating crop risk",
  "Generating recommendations"
];

const AnalysisLoader = ({ isComplete, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let interval;
    if (!isComplete && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1500); // 1.5 seconds per step
    } else if (isComplete) {
      setCurrentStep(steps.length);
      setTimeout(onComplete, 1000); // slight delay before hiding
    }
    return () => clearInterval(interval);
  }, [currentStep, isComplete, onComplete]);

  return (
    <div className="analysis-loader-overlay">
      <div className="analysis-loader-modal">
        <div className="loader-spinner"></div>
        <h3 className="loader-title">Intelligence Engine Active</h3>
        <ul className="loader-steps">
          {steps.map((step, index) => (
            <li 
              key={index} 
              className={`loader-step ${index < currentStep ? 'completed' : ''} ${index === currentStep && !isComplete ? 'active' : ''}`}
            >
              <span className="step-icon">
                {index < currentStep ? '✓' : index === currentStep && !isComplete ? '↻' : '○'}
              </span>
              {step}
            </li>
          ))}
          {isComplete && (
            <li className="loader-step completed final-step">
              <span className="step-icon">✓</span>
              Analysis Complete
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AnalysisLoader;
