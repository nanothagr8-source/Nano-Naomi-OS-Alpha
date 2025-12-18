
export enum FeatureId {
  VIDEO_UNDERSTANDING = 'video_understanding',
  IMAGE_ANALYSIS = 'image_analysis',
  IMAGE_GENERATION = 'image_generation',
  IMAGE_EDITING = 'image_editing',
  SEARCH_GROUNDING = 'search_grounding',
  VEO_ANIMATION = 'veo_animation',
  ART_BOT = 'artist_bot',
  LIVE_VOICE = 'live_voice',
  AUDIO_STUDIO = 'audio_studio',
  CHATBOT = 'chatbot',
  DEV_ENGINE = 'dev_engine',
  QUANTUM_LAB = 'quantum_lab',
  VISUAL_INTELLIGENCE = 'visual_intelligence',
  CONSCIENCE = 'conscience',
  RECURSIVE_SYNTHESIS = 'recursive_synthesis',
  ASSET_NEXUS = 'asset_nexus',
  CHRONOS_FORGE = 'chronos_forge',
  UI_MIRROR = 'ui_mirror',
  KINETIC_BLUEPRINT = 'kinetic_blueprint',
  LOCAL_BRIDGE = 'local_bridge',
  SYSTEM_SETTINGS = 'system_settings',
  KERNEL_DEBUGGER = 'kernel_debugger',
  KERNEL_TERMINAL = 'kernel_terminal',
  HARDWARE_MANAGER = 'hardware_manager',
  FILE_EXPLORER = 'file_explorer',
  SVELTE_STUDIO = 'svelte_studio',
  TASK_MANAGER = 'task_manager',
  NAOMI_STORE = 'naomi_store',
  SYSTEM_INFO = 'system_info',
  NAOMI_BROWSER = 'naomi_browser',
  NANO_NOTEPAD = 'nano_notepad',
  QUANTUM_CALC = 'quantum_calc',
  MEDIA_PLAYER = 'media_player',
  SYSTEM_LOGS = 'system_logs',
  NETWORK_MONITOR = 'network_monitor',
  NAOMI_CALENDAR = 'naomi_calendar',
  PERFORMANCE_PROFILER = 'performance_profiler',
  GENETIC_SYNTH = 'genetic_synth',
  REASONING_CONSOLE = 'reasoning_console'
}

export interface SynthesisIteration {
  version: number;
  code: string;
  critique: string;
  score: number;
  timestamp: number;
}

export interface RecursiveSynthesisState {
  goal: string;
  iterations: SynthesisIteration[];
  isComplete: boolean;
}

export interface GeneticOrganism {
  id: string;
  generation: number;
  dna: string; // The Svelte code
  fitnessScore: number;
  mutations: string[];
  parentIds: string[];
  status: 'alive' | 'archived' | 'extinct';
}

export interface ReasoningStep {
  id: string;
  timestamp: number;
  thought: string;
  complexity: number;
  entropy: number;
  connections: string[];
}

export interface PerformanceSnapshot {
  timestamp: number;
  cpu: number;
  memory: number;
  fps: number;
  activeProcesses: number;
  latency: number;
}

export interface OptimizationDirective {
  summary: string;
  bottlenecks: { component: string; impact: string; fix: string }[];
  codePatch?: string;
  efficiencyScore: number;
}

export interface WindowState {
  id: FeatureId;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  cpuUsage?: number;
  memUsage?: number;
  startTime: number;
}

export interface TelemetryMetric {
  timestamp: number;
  featureId: FeatureId | 'system';
  duration: number;
  status: 'success' | 'error';
  tokenUsage?: number;
}

export interface HotkeyMapping {
  id: string;
  action: string;
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
}

export interface ProfileNode {
  id: string;
  label: string;
  startTime: number;
  endTime?: number;
  children: ProfileNode[];
  metadata?: any;
}

export interface ReactivityNode {
  id: string;
  type: 'state' | 'derived' | 'effect' | 'prop';
  label: string;
  dependencies: string[];
}

export interface EdgeCaseStressor {
  id: string;
  label: string;
  description: string;
  injectedLogic: string; 
}

export interface UILayoutBox {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'container' | 'button' | 'text' | 'image' | 'icon' | 'input';
  tailwindClasses: string;
  heuristicScore?: number;
}

export interface ProjectComponent {
  name: string;
  code: string;
  description: string;
  props: string[];
}

export interface InteractionState {
  from: string;
  to: string;
  trigger: string;
  logic: string;
}

export interface DesignEraConfig {
  id: 'modern' | 'retro' | 'cyber' | 'neumorphic';
  label: string;
  cssOverrides: string;
  vibeDescription: string;
}

export interface UIMirrorResult {
  layout: UILayoutBox[];
  svelteCode: string;
  atomicComponents: ProjectComponent[];
  interactionSchema: InteractionState[];
  reactivityPulse: ReactivityNode[];
  edgeCaseStressors: EdgeCaseStressor[];
  e2eProtocols: string; 
  i18nMap: Record<string, Record<string, string>>;
  designEras: DesignEraConfig[];
  uxFrictionReport: {
    id: string;
    point: { x: number; y: number };
    severity: 'low' | 'medium' | 'high';
    issue: string;
    fix: string;
    healingPayload?: string;
  }[];
  accessibilityHeatmap: {
    selector: string;
    role: string;
    label: string;
    tabIndex: number;
    score: number;
  }[];
  designSystemConfig: {
    tailwindExtended: string;
    rootVariables: string;
    componentPrinciples: string[];
  };
  gridAudit: {
    spacingCoherence: number;
    alignmentGravity: number;
    suggestedPatches: { element: string; css: string; reason: string }[];
  };
  apiContract: string;
  opsConfig: {
    dockerfile: string;
    githubWorkflow: string;
    readme: string;
  };
  semanticRoadmap: any[];
  tailwindConfig: string;
  viteConfig: string;
  detectedNiche: string;
  mockData: Record<string, any>;
  themeVariants: any;
  designTokens: {
    colors: Record<string, string>;
    typography: Record<string, string>;
    spacing: Record<string, string>;
    shadows: Record<string, string>;
  };
  analysis: string;
  selfHealingAudit?: {
    matchScore: number;
    discrepancies: string[];
    suggestedFixes: { selector: string; fix: string }[];
  };
}

export interface KineticMotionData {
  transitions: {
    element: string;
    property: string;
    duration: number;
    easing: string;
    trigger: string;
  }[];
  svelteCode: string;
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT_3_4 = '3:4',
  LANDSCAPE_4_3 = '4:3',
  PORTRAIT_9_16 = '9:16',
  LANDSCAPE_16_9 = '16:9'
}

export enum ImageSize {
  K1 = '1K',
  K2 = '2K',
  K4 = '4K'
}

export enum SuperGemType {
  VELOCITY = 'ruby_velocity',
  DEPTH = 'sapphire_depth',
  SYNTHESIS = 'emerald_synthesis',
  QUANTUM = 'diamond_quantum',
  CONSCIENCE = 'obsidian_conscience',
  RECURSIVE = 'white_hole_recursive'
}

export interface StoryScene {
  id: string;
  timestamp: number;
  visualPrompt: string;
  audioPrompt: string;
  description: string;
  status: 'draft' | 'generating' | 'ready';
  assetUrl?: string;
  audioUrl?: string;
}

export interface ChronosForgeStory {
  id: string;
  title: string;
  genre: string;
  scenes: StoryScene[];
  overallAtmosphere: string;
}

export interface VisualAuditReport {
  matchScore: number;
  differences: string[];
  precisionFixes: { selector: string; property: string; value: string; reason: string }[];
  visualHeatmap?: string;
}

export interface MissionStep {
  id: string;
  featureId: FeatureId;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  params?: any;
  result?: string;
}

export interface MissionPlan {
  id: string;
  title: string;
  objective: string;
  steps: MissionStep[];
  overallStatus: 'planning' | 'executing' | 'finalizing' | 'finished';
}

export interface CapabilitySynthesis {
  id: string;
  targetCapability: string;
  logicCode: string;
  uiComponent: string;
  status: 'ideation' | 'compiling' | 'deploying' | 'active';
  confidence: number;
}

export interface CognitiveNode {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'thought' | 'action' | 'research' | 'mission';
  timestamp: number;
}

export interface Thought {
  id: string;
  timestamp: number;
  origin: 'neural' | 'quantum' | 'sensory' | 'recursive' | 'orchestrator';
  content: string;
  relevance: number;
  actionTaken?: string;
  synthesizedCapability?: CapabilitySynthesis;
  activeMission?: MissionPlan;
  nodePosition?: { x: number; y: number };
}

export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video' | 'code' | 'audio';
  url: string;
  thumbnail?: string;
  prompt: string;
  timestamp: number;
  metadata: Record<string, any>;
  tags: string[];
}

export interface OcularReview {
  rating: number;
  critique: string;
  gazePoints: { x: number; y: number; label: string; issue?: string }[];
  suggestedFixes: string;
  autoCodePatch?: string;
}

export interface EvolutionResult {
  summary: string;
  techStack: string[];
  architecturePlan: string;
  codeImprovements: { filename: string; code: string; reason: string }[];
  fullProjectFiles: { name: string; content: string; path: string }[];
  previewBundle: string;
  visualConcepts: string[];
  performanceMetrics: {
    fpsBoost: number;
    latencyReduction: number;
    memoryEfficiency: number;
  };
  visualReview?: OcularReview;
}

export interface QuantumCircuitResult {
  title: string;
  description: string;
  cirqCode: string;
  qubitStates: { id: number; active: boolean; probability: number; phase: number }[];
  expectedSpeedup: string;
  complexComplexity: string;
}

export interface DevProjectFile {
  name: string;
  content: string;
  type: string;
}

export type SupportedFramework = 'Svelte' | 'React' | 'Remotion' | 'Next.js' | 'Vue' | 'Angular' | 'Solid' | 'Qwik' | 'PixiJS' | 'Spine2D' | 'Storybook' | 'Adobe Script';
export type AnimationType = 'CSS' | 'GSAP' | 'Framer Motion' | 'React Spring';

export interface GroundingChunk {
  web?: { uri: string; title: string };
  maps?: { uri: string; title: string };
}

export interface ArtistBotLayer {
  id: string;
  name: string;
  svgContent: string;
  description: string;
  toolUsed?: string;
  boneId?: string;
  animationClass?: string;
  visible?: boolean;
  locked?: boolean;
  opacity?: number;
  blendMode?: string;
  animationDuration?: number;
  animationIterationCount?: number | 'infinite';
}

export interface SkeletonJoint {
  id: string;
  name: string;
  x: number;
  y: number;
  initialX?: number;
  initialY?: number;
}

export interface ArtistBotGroup {
  id: string;
  name: string;
  layerIds: string[];
}

export interface ArtistBotResponse {
  analysis: string;
  palette: string[];
  layers: ArtistBotLayer[];
  groups?: ArtistBotGroup[];
  skeleton?: {
    joints: SkeletonJoint[];
    connections: { from: string; to: string }[];
  };
  cssAnimations?: string; 
}

export interface EdgeCaseSimulation {
  id: string;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'untested';
}

export interface NeuralNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai';
  timestamp: number;
  isRead: boolean;
}
