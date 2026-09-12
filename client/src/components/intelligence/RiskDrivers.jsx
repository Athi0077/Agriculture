import React from 'react';
import './RiskDrivers.css';

const RiskDrivers = ({ explanation }) => {
  if (!explanation) return null;

  // Simple splitting by period to create list items, ignoring empty strings
  const drivers = explanation.split('.').filter(driver => driver.trim().length > 0);

  return (
    <div className="risk-drivers-container">
      <h3 className="drivers-title">Main Risk Drivers</h3>
      <ul className="drivers-list">
        {drivers.map((driver, index) => (
          <li key={index} className="driver-item">
            <span className="driver-bullet">•</span>
            <span className="driver-text">{driver.trim()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RiskDrivers;
