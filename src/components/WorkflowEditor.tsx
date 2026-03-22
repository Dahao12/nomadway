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
  addEdge,
  Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const stageTypes = [
  { type: "onboarding", name: "Onboarding", icon: "👋" },
  { type: "profile", name: "Perfil", icon: "👤" },
  { type: "strategy", name: "Estratégia", icon: "🎯" },
  { type: "documentation", name: "Documentação", icon: "📄" },
  { type: "translations", name: "Traduções", icon: "🌐" },
  { type: "apostille", name: "Apostila", icon: "📋" },
  { type: "review", name: "Revisão", icon: "⚖️" },
  { type: "application", name: "Candidatura", icon: "📝" },
  { type: "follow_up", name: "Acompanhamento", icon: "📞" },
  { type: "approval", name: "Aprovação", icon: "✅" },
  { type: "post_approval", name: "Pós-Aprovação", icon: "🎉" },
  { type: "relocation", name: "Relocação", icon: "✈️" },
];

const statusConfig = {
  pending: { label: "Pendente", color: "bg-gray-100 text-gray-600", border: "border-gray-200" },
  in_progress: { label: "Em andamento", color: "bg-blue-100 text-blue-700", border: "border-blue-300" },
  awaiting_client: { label: "Aguardando cliente", color: "bg-amber-100 text-amber-700", border: "border-amber-300" },
  in_review: { label: "Em revisão", color: "bg-purple-100 text-purple-700", border: "border-purple-300" },
  blocked: { label: "Bloqueado", color: "bg-red-100 text-red-700", border: "border-red-300" },
  completed: { label: "Concluído", color: "bg-green-100 text-green-700", border: "border-green-300" },
};

const stageGradients: Record<string, string> = {
  onboarding: "from-blue-400 to-cyan-400",
  profile: "from-violet-400 to-purple-400",
  strategy: "from-fuchsia-400 to-pink-400",
  documentation: "from-amber-400 to-orange-400",
  translations: "from-emerald-400 to-teal-400",
  apostille: "from-indigo-400 to-blue-400",
  review: "from-pink-400 to-rose-400",
  application: "from-teal-400 to-cyan-400",
  follow_up: "from-orange-400 to-amber-400",
  approval: "from-green-400 to-emerald-400",
  post_approval: "from-purple-400 to-violet-400",
  relocation: "from-cyan-400 to-sky-400",
  default: "from-gray-400 to-slate-400",
};

interface Stage {
  id: string;
  stage_type: string;
  stage_name: string;
  stage_order: number;
  status: string;
  progress_percent: number;
  notes_client?: string | null;
}

interface WorkflowEditorProps {
  stages: Stage[];
  onStageClick?: (stageId: string) => void;
  onStageAdd?: (stage: { stage_type: string; stage_name: string; stage_order: number }) => void;
  onStageDelete?: (stageId: string) => void;
  isEditable?: boolean;
  isClientView?: boolean;
}

function StageNode({ data }: { data: any }) {
  const config = statusConfig[data.status as keyof typeof statusConfig] || statusConfig.pending;
  const gradient = stageGradients[data.stageType as keyof typeof stageGradients] || stageGradients.default;
  const isCompleted = data.status === "completed";
  const isActive = data.status === "in_progress" || data.status === "awaiting_client";
  const stageIcon = stageTypes.find(s => s.type === data.stageType)?.icon || "📌";

  return (
    <div className="relative group">
      {/* Glow for active */}
      {isActive && (
        <div className={`absolute -inset-2 rounded-2xl opacity-20 blur-lg bg-gradient-to-r ${gradient}`} />
      )}
      
      {/* Main card */}
      <div
        className={`
          relative px-4 py-3 min-w-[200px] max-w-[240px]
          rounded-xl border-2 backdrop-blur-sm
          transition-all duration-200 ease-out
          cursor-pointer select-none
          ${isCompleted ? "border-green-300 bg-green-50/80" : config.border}
          ${isActive ? "shadow-xl ring-2 ring-offset-1 ring-blue-200" : "shadow-md"}
          ${data.isEditable ? "hover:shadow-lg hover:-translate-y-0.5" : ""}
          bg-white/90
        `}
        onClick={() => data.onClick?.(data.id)}
      >
        <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gray-300 !border-2 !border-white !opacity-0 group-hover:!opacity-100" />
        <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-gray-300 !border-2 !border-white !opacity-0 group-hover:!opacity-100" />

        {/* Order badge */}
        <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md bg-gradient-to-br ${gradient}`}>
          {data.order}
        </div>

        {/* Completed check */}
        {isCompleted && (
          <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Delete button (editable only) */}
        {data.isEditable && !isCompleted && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete?.(data.id);
            }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Content */}
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-base bg-gradient-to-br ${gradient} shadow-sm`}>
            {stageIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-900 truncate">{data.label}</div>
            {isActive && data.progress > 0 && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${gradient}`} style={{ width: `${data.progress}%` }} />
                </div>
                <span className="text-xs text-gray-500">{data.progress}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Status badge */}
        {!isCompleted && !isActive && (
          <Badge className={`mt-2 text-xs ${config.color}`}>{config.label}</Badge>
        )}
      </div>
    </div>
  );
}

const nodeTypes = { stageNode: StageNode };

export default function WorkflowEditor({ 
  stages, 
  onStageClick,
  onStageAdd,
  onStageDelete,
  isEditable = false,
  isClientView = false,
}: WorkflowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newStageType, setNewStageType] = useState("");
  const [newStageName, setNewStageName] = useState("");

  // Calculate grid positions
  const calculatePositions = useCallback((stages: Stage[]) => {
    if (!stages.length) return [];
    const nodeWidth = 220;
    const nodeHeight = 100;
    const horizontalGap = 50;
    const verticalGap = 40;
    const nodesPerRow = 3;

    return stages.map((stage, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      const isEvenRow = row % 2 === 0;
      const colIndex = isEvenRow ? col : nodesPerRow - 1 - col;
      
      return {
        x: colIndex * (nodeWidth + horizontalGap) + 50,
        y: row * (nodeHeight + verticalGap) + 50,
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
        isEditable,
        onClick: onStageClick,
        onDelete: onStageDelete,
      },
      draggable: false,
    }));

    const newEdges: Edge[] = stages.slice(0, -1).map((stage, index) => {
      const isCompleted = stage.status === "completed";
      const nextStage = stages[index + 1];
      
      return {
        id: `e-${stage.id}-${nextStage.id}`,
        source: stage.id,
        target: nextStage.id,
        type: "smoothstep",
        animated: isCompleted,
        style: { stroke: isCompleted ? "#22c55e" : "#d1d5db", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: isCompleted ? "#22c55e" : "#9ca3af" },
      };
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [stages, calculatePositions, isEditable, onStageClick, onStageDelete, setNodes, setEdges]);

  const handleAddStage = () => {
    if (!newStageType || !newStageName) return;
    
    const stageType = stageTypes.find(s => s.type === newStageType);
    onStageAdd?.({
      stage_type: newStageType,
      stage_name: newStageName,
      stage_order: stages.length + 1,
    });
    
    setShowAddMenu(false);
    setNewStageType("");
    setNewStageName("");
  };

  if (!stages || stages.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
        <div className="text-center">
          {isEditable ? (
            <>
              <div className="text-5xl mb-3">➕</div>
              <p className="text-gray-500 font-medium mb-4">Nenhuma etapa. Adicione a primeira!</p>
              <Button onClick={() => setShowAddMenu(true)} className="bg-gradient-to-r from-primary-500 to-primary-600">
                Adicionar Etapa
              </Button>
            </>
          ) : (
            <>
              <div className="text-5xl mb-3">📋</div>
              <p className="text-gray-500 font-medium">Nenhuma etapa configurada</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const rows = Math.ceil(stages.length / 3);
  const canvasHeight = Math.max(450, rows * 150 + 100);

  return (
    <div className="relative">
      <div className="w-full rounded-2xl border border-gray-200 overflow-hidden bg-gradient-to-br from-slate-50 to-white" style={{ height: canvasHeight }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.5}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#e5e7eb" gap={24} size={1} />
          <Controls 
            className="!bg-white !border !border-gray-200 !rounded-xl !shadow-lg"
            showZoom={true}
            showFitView={true}
            showInteractive={false}
          />
          <Panel position="top-right" className="!m-3">
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {stages.filter(s => s.status === "completed").length} de {stages.length} etapas
              </div>
              {isEditable && (
                <Button
                  size="sm"
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="bg-gradient-to-r from-primary-500 to-primary-600"
                >
                  + Etapa
                </Button>
              )}
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Add Stage Modal */}
      {showAddMenu && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nova Etapa</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={newStageType}
                  onChange={(e) => {
                    setNewStageType(e.target.value);
                    const stage = stageTypes.find(s => s.type === e.target.value);
                    if (stage) setNewStageName(stage.name);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Selecione...</option>
                  {stageTypes.map(s => (
                    <option key={s.type} value={s.type}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <Input
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="Nome da etapa"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddMenu(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleAddStage} className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600">
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}