import React from 'react';

export default function LoaderOverlay() {
  return (
    <div className="loader-overlay">
      <div className="spinner"></div>
      <p>Fetching Data...</p>
    </div>
  );
}
