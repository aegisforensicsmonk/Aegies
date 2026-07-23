import React, { useEffect, useState, useRef } from 'react';
import { Loader2, Share2 } from 'lucide-react';
// import ForceGraph2D from 'react-force-graph-2d';

interface Node {
  id: string;
  group: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

export function IPDRGraphView() {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/ipdr/analytics/graph');
        if (!res.ok) throw new Error('Failed to fetch graph data');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGraphData();
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-card rounded-xl border overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b flex justify-between items-center bg-muted/30">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" />
            Communication Network
          </h3>
          <p className="text-sm text-muted-foreground">Force-directed visualization of source-destination relationships</p>
        </div>
        <div className="flex items-center gap-2">
          {data && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{data.nodes.length} Nodes</span>}
          {data && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{data.links.length} Links</span>}
        </div>
      </div>
      
      <div className="flex-1 relative min-h-[500px] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        {loading && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
        
        {error && (
          <div className="text-destructive text-sm bg-destructive/10 p-4 rounded-lg">
            {error}
          </div>
        )}
        
        {data && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Note: Requires `npm install react-force-graph-2d` */}
            {/* <ForceGraph2D
              graphData={data}
              nodeLabel="id"
              nodeColor={(node: any) => node.group === 1 ? '#3b82f6' : '#10b981'}
              linkColor={() => '#94a3b8'}
              linkWidth={(link: any) => Math.min(link.value, 5)}
              nodeRelSize={6}
            /> */}
            
            {/* Placeholder until package is installed */}
            <div className="text-center p-8 max-w-md bg-background/80 backdrop-blur rounded-xl border shadow-sm">
              <Share2 className="w-12 h-12 text-primary/50 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Graph Data Ready</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Retrieved {data.nodes.length} entities and {data.links.length} communication paths. 
                Install <code>react-force-graph-2d</code> to render the interactive visualization.
              </p>
              <pre className="text-xs text-left bg-muted p-2 rounded overflow-auto max-h-32">
                {JSON.stringify({ nodes: data.nodes.slice(0, 2), links: data.links.slice(0, 2) }, null, 2)}
                {data.nodes.length > 2 ? '\n  ...' : ''}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
