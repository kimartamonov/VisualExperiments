import React, { useCallback, useState, useRef } from 'react';
import { useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import Canvas from './components/Canvas';
import NodeDetails from './components/NodeDetails';

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: '2', position: { x: 150, y: 100 }, data: { label: 'Node 2' } }
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' }
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selected, setSelected] = useState(null);
  const flowRef = useRef(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((evt, node) => {
    setSelected(node);
  }, []);

  const onSave = () => {
    const instance = flowRef.current;
    if (instance) {
      const flow = instance.toObject();
      localStorage.setItem('myFlow', JSON.stringify(flow));
    }
  };

  const onRestore = () => {
    const flow = JSON.parse(localStorage.getItem('myFlow'));
    if (flow) {
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        flowRef={flowRef}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onSave={onSave}
        onRestore={onRestore}
      />
      {selected && (
        <NodeDetails node={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
