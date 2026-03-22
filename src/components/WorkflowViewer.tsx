"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// Stage configurations with gradients and icons
const stageConfigs: Record<string, { 
  icon: string; 
  gradient: string; 
  bgGradient: string;
  glow: string;
}> = {
  onboarding: { 
    icon: "👋", 
    gradient: "from-blue-400 to-cyan-400", 
    bgGradient: "from-blue-500/10 to-cyan-500/10",
    glow: "shadow-blue-500/25"
  },
  profile: { 
    icon: "👤", 
    gradient: "from-violet-400 to-purple-400", 
    bgGradient: "from-violet-500/10 to-purple-500/10",
    glow: "shadow-violet-500/25"
  },
  strategy: { 
    icon: "🎯", 
    gradient: "from-fuchsia-400 to-pink-400", 
    bgGradient: "from-fuchsia-500/10 to-pink-500/10",
    glow: "shadow-fuchsia-500/25"
  },
  documentation: { 
    icon: "📄", 
    gradient: "from-amber-400 to-orange-400", 
    bgGradient: "from-amber-500/10 to-orange-500/10",
    glow: "shadow-amber-500/25"
  },
  translations: { 
    icon: "🌐", 
    gradient: "from-emerald-400 to-teal-400", 
    bgGradient: "from-emerald-500/10 to-teal-500/10",
    glow: "shadow-emerald-500/25"
  },
  apostille: { 
    icon: "📋", 
    gradient: "from-indigo-400 to-blue-400", 
    bgGradient: "from-indigo-500/10 to-blue-500/10",
    glow: "shadow-indigo-500/25"
  },
  review: { 
    icon: "⚖️", 
    gradient: "from-pink-400 to-rose-400", 
    bgGradient: "from-pink-500/10 to-rose-500/10",
    glow: "shadow-pink-500/25"
  },
  application: { 
    icon: "📝", 
    gradient: "from-teal-400 to-cyan-400", 
    bgGradient: "from-teal-500/10 to-cyan-500/10",
    glow: "shadow-teal-500/25"
  },
  follow_up: { 
    icon: "📞", 
    gradient: "from-orange-400 to-amber-400", 
    bgGradient: "from-orange-500/10 to-amber-500/10",
    glow: "shadow-orange-500/25"
  },
  approval: { 
    icon: "✅", 
    gradient: "from-green-400 to-emerald-400", 
    bgGradient: "from-green-500/10 to-emerald-500/10",
    glow: "shadow-green-500/25"
  },
  post_approval: { 
    icon: "🎉", 
    gradient: "from-purple-400 to-violet-400", 
    bgGradient: "from-purple-500/10 to-violet-500/10",
    glow: "shadow-purple-500/25"
  },
  relocation: { 
    icon: "✈️", 
    gradient: "from-cyan-400 to-sky-400", 
    bgGradient: "from-cyan-500/10 to-sky-500/10",
    glow: "shadow-cyan-500/25"
  },
  default: { 
    icon: "📌", 
    gradient: "from-gray-400 to-slate-400", 
    bgGradient: "from-gray-500/10 to-slate-500/10",
    glow: "shadow-gray-500/25"
  },
};

const statusStyles = {
  pending: { 
    ring: "ring-1 ring-gray-200", 
    bg: "bg-gray-50",
    text: "text-gray-500",
    badge: "bg-gray-100 text-gray-600"
  },
  in_progress: { 
    ring: "ring-2 ring-blue-400 ring-offset-2", 
    bg: "bg-white",
    text: "text-gray-900",
    badge: "bg-blue-100 text-blue-700"
  },
  awaiting_client: { 
    ring: "ring-2 ring-amber-400 ring-offset-2", 
    bg: "bg-amber-50/50",
    text: "text-gray-900",
    badge: "bg-amber-100 text-amber-700"
  },
  in_review: { 
    ring: "ring-2 ring-purple-400 ring-offset-2", 
    bg: "bg-purple-50/50",
    text: "text-gray-900",
    badge: "bg-purple-100 text-purple-700"
  },
  blocked: { 
    ring: "ring-2 ring-red-400 ring-offset-2", 
    bg: "bg-red-50/50",
    text: "text-gray-900",
    badge: "bg-red-100 text-red-700"
  },
  completed: { 
    ring: "ring-2 ring-green-500", 
    bg: "bg-gradient-to-br from-green-50 to-emerald-50",
    text: "text-gray-900",
    badge: "bg-green-100 text-green-700"
  },
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  awaiting_client: "Aguardando",
  in_review: "Em revisão",
  blocked: "Bloqueado",
  completed: "Concluído",
};

// Custom Node Component - Linear/Notion style
function StageNode({ data }: { data: any }) {
  const config = stageConfigs[data.stageType as keyof typeof stageConfigs] || stageConfigs.default;
  const status = statusStyles[data.status as keyof typeof statusStyles] || statusStyles.pending;
  const isCompleted = data.status === "completed";
  const isActive = data.status === "in_progress" || data.status === "awaiting_client";

  return (
    <div className="relative group">
      {/* Glow effect for active nodes */}
      {isActive && (
        <div 
          className={`absolute -inset-1 rounded-2xl blur-xl opacity-30 ${config.glow}`}
          style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
        />
      )}

      {/* Main card */}
      <div
        className={`
          relative px-4 py-3 min-w-[200px] max-w-[240px]
          rounded-xl border backdrop-blur-sm
          transition-all duration-300 ease-out
          hover:scale-[1.02] hover:shadow-xl hover:-translate-y-0.5
          cursor-pointer select-none
          ${status.ring} ${status.bg}
          ${isCompleted ? "border-green-200" : "border-gray-200/50"}
          shadow-lg
        `}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="!w-2.5 !h-2.5 !border-2 !border-white !bg-gray-400 !opacity-0 group-hover:!opacity-100 transition-opacity"
        />

        {/* Stage number - pill style */}
        <div
          className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg bg-gradient-to-br ${config.gradient}`}
        >
          {data.order}
        </div>

        {/* Completed checkmark */}
        {isCompleted && (
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className="flex items-start gap-3 mt-1">
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br ${config.gradient} shadow-sm`}
          >
            {config.icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className={`font-semibold text-sm truncate ${status.text}`}>
              {data.label}
            </div>
            
            {/* Progress bar for active */}
            {isActive && data.progress > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progresso</span>
                  <span className="font-medium">{data.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-500`}
                    style={{ width: `${data.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Status badge */}
            {!isCompleted && !isActive && (
              <div className={`mt-1.5 text-xs ${status.badge} px-2 py-0.5 rounded-full inline-block`}>
                {statusLabels[data.status]}
              </div>
            )}
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2.5 !h-2.5 !border-2 !border-white !bg-gray-400 !opacity-0 group-hover:!opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
}

const nodeTypes = {
  stageNode: StageNode,
};

interface WorkflowViewerProps {
  stages: Array<{
    id: string;
    stage_type: string;
    stage_name: string;
    stage_order: number;
    status: string;
    progress_percent: number;
  }>;
  onStageClick?: (stageId: string) => void;
}

export default function WorkflowViewer({ stages, onStageClick }: WorkflowViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Calculate positions in a flowing layout
  const calculatePositions = useCallback((stages: any[]) => {
    if (!stages.length) return [];
    
    const nodeWidth = 220;
    const nodeHeight = 100;
    const horizontalGap = 60;
    const verticalGap = 50;
    const nodesPerRow = 3;
    
    return stages.map((stage, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      const isEvenRow = row % 2 === 0;
      
      // Zigzag pattern for visual interest
      const colIndex = isEvenRow ? col : nodesPerRow - 1 - col;
      
      // Slight diagonal offset for organic feel
      const offsetY = colIndex * 20;
      
      return {
        x: colIndex * (nodeWidth + horizontalGap) + 50,
        y: row * (nodeHeight + verticalGap) + offsetY + 50,
      };
    });
  }, []);

  useEffect(() => {
    if (!stages || stages.length === 0) return;

    const positions = calculatePositions(stages);

    const newNodes: Node[] = stages.map((stage, index) => ({
      id: stage.id,
      type: "stageNode",
      position: positions[index],
      data: {
        label: stage.stage_name,
        stageType: stage.stage_type,
        order: stage.stage_order,
        status: stage.status,
        progress: stage.progress_percent,
      },
      draggable: false,
    }));

    // Create smooth curved edges
    const newEdges: Edge[] = stages.slice(0, -1).map((stage, index) => {
      const isCompleted = stage.status === "completed";
      const nextStage = stages[index + 1];
      
      return {
        id: `e-${stage.id}-${nextStage.id}`,
        source: stage.id,
        target: nextStage.id,
        type: "smoothstep",
        animated: isCompleted,
        style: {
          stroke: isCompleted ? "#22c55e" : "#d1d5db",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCompleted ? "#22c55e" : "#9ca3af",
        },
      };
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [stages, calculatePositions, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      if (onStageClick) {
        onStageClick(node.id);
      }
    },
    [onStageClick]
  );

  if (!stages || stages.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
        <div className="text-center">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500 font-medium">Nenhuma etapa configurada</p>
        </div>
      </div>
    );
  }

  // Calculate canvas height based on number of rows
  const rows = Math.ceil(stages.length / 3);
  const canvasHeight = Math.max(500, rows * 150 + 100);

  return (
    <div 
      className="w-full rounded-2xl border border-gray-200 overflow-hidden"
      style={{ height: canvasHeight }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          color="#e5e7eb" 
          gap={24}
          size={1}
        />
        <Controls 
          className="!bg-white !border !border-gray-200 !rounded-xl !shadow-lg"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
        <Panel position="top-right" className="!m-3">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500 shadow-sm">
            {stages.filter(s => s.status === "completed").length} de {stages.length} etapas concluídas
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}