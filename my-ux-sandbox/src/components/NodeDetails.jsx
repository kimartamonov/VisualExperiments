import React from 'react';

export default function NodeDetails({ node, onClose }) {
  return (
    <div style={{ position: 'absolute', right: 10, top: 10, background: '#fff', border: '1px solid #ccc', padding: 10 }}>
      <h4>Node Details</h4>
      <p>{node.data.label}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
