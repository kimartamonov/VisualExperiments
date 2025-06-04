import React from 'react';
import ReactFlow, { Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  flowRef,
  onSave,
  onRestore
}) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        ref={flowRef}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
      >
        <Panel position="top-left">
          <button onClick={onSave}>Save</button>
          <button onClick={onRestore}>Restore</button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
