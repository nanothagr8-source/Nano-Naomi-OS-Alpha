
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
  AspectRatio, 
  ImageSize, 
  ArtistBotResponse, 
  DevProjectFile, 
  EvolutionResult, 
  QuantumCircuitResult, 
  OcularReview, 
  Thought, 
  CapabilitySynthesis, 
  MissionPlan, 
  FeatureId,
  GeneratedAsset,
  VisualAuditReport,
  ChronosForgeStory,
  UIMirrorResult,
  KineticMotionData,
  SupportedFramework,
  PerformanceSnapshot,
  OptimizationDirective,
  GeneticOrganism,
  ReasoningStep,
  SynthesisIteration
} from "../types";
import { telemetry } from "./telemetryService";

// Tiered Neural Cache
class NeuralCache {
  private memory = new Map<string, any>();
  private prefix = 'neural_os_cache_';

  private async hash(input: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async get<T>(key: string): Promise<T | null> {
    const h = await this.hash(key);
    if (this.memory.has(h)) return this.memory.get(h);
    
    const local = localStorage.getItem(this.prefix + h);
    if (local) {
      const data = JSON.parse(local);
      this.memory.set(h, data);
      return data;
    }
    return null;
  }

  async set(key: string, value: any): Promise<void> {
    const h = await this.hash(key);
    this.memory.set(h, value);
    try {
      localStorage.setItem(this.prefix + h, JSON.stringify(value));
    } catch (e) {
      console.warn("Nexus Cache: Local storage limit reached.");
    }
  }

  purge() {
    this.memory.clear();
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(this.prefix)) localStorage.removeItem(k);
    });
  }
}

const nCache = new NeuralCache();

// Initialize AI client using environment variable
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Recursive Synthesis Engine: Iteratively refines code based on visual and logical feedback.
 */
export const performRecursiveSynthesis = async (goal: string, previousIterations: SynthesisIteration[]): Promise<SynthesisIteration> => {
  return telemetry.observe(FeatureId.RECURSIVE_SYNTHESIS, 'recursiveStep', async () => {
    const ai = getAiClient();
    const history = previousIterations.map(i => `V${i.version}: [SCORE ${i.score}] Critique: ${i.critique}`).join('\n');
    const lastCode = previousIterations.length > 0 ? previousIterations[previousIterations.length - 1].code : 'None';

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `TASK: Recursive Component Synthesis.
      GOAL: ${goal}
      HISTORY: 
      ${history}
      
      CURRENT CODE:
      ${lastCode}
      
      INSTRUCTION:
      Analyze the current code and the history of critiques. Generate a significantly improved version of the Svelte 5 component. 
      Focus on state management (Runes), styling (Tailwind), and UX fluidness.
      
      Return a valid JSON object matching the SynthesisIteration schema.`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

/**
 * Computer Genetics Engine: Mutates and breeds code based on a target aesthetic or goal.
 */
export const evolveGeneticUI = async (parents: GeneticOrganism[], goal: string): Promise<GeneticOrganism[]> => {
  return telemetry.observe(FeatureId.GENETIC_SYNTH, 'evolveGeneticUI', async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `TASK: Computer Genetics Evolution.
      GOAL: ${goal}
      PARENTS: ${JSON.stringify(parents.map(p => ({ id: p.id, fitness: p.fitnessScore, dna: p.dna })))}
      
      INSTRUCTION: Perform crossover and random mutations on the provided DNA (Svelte code). 
      Generate 4 new 'Organisms' (offspring).
      Return as JSON array of GeneticOrganism objects.`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 24576 }
      }
    });
    return JSON.parse(response.text || '[]');
  });
};

/**
 * Reasoning Trace Engine: Exposes the internal thought process of Gemini 3 Pro.
 */
export const fetchReasoningTrace = async (query: string): Promise<ReasoningStep[]> => {
  return telemetry.observe(FeatureId.REASONING_CONSOLE, 'fetchReasoningTrace', async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `TASK: Metacognitive Reasoning Audit.
      QUERY: ${query}
      
      INSTRUCTION: Deconstruct your internal reasoning chain into discrete nodes.
      Include entropy values and complexity scores for each step.
      Return as JSON array of ReasoningStep objects.`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return JSON.parse(response.text || '[]');
  });
};

/**
 * Performance Profiler Engine: Analyzes application telemetry and snapshots.
 */
export const analyzePerformanceMetrics = async (snapshots: PerformanceSnapshot[], context?: string): Promise<OptimizationDirective> => {
  return telemetry.observe(FeatureId.PERFORMANCE_PROFILER, 'analyzePerformance', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `TASK: Analyze the following application performance snapshots and provide architectural optimization directives.
        
        DATA: ${JSON.stringify(snapshots)}
        CONTEXT: ${context || 'General application profiling session.'}
        
        RULES:
        1. Identify specific bottlenecks (rendering, memory leaks, high API latency).
        2. Provide concrete 'Code Patch' suggestions to improve efficiency.
        3. Rate the overall efficiency on a scale of 0-100.
        4. Focus on React/Svelte best practices.
        
        Return a valid JSON object matching the OptimizationDirective schema.`,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 24576 }
        }
      });
      return JSON.parse(response.text || '{}');
    });
  });
};

/**
 * Robust File to Base64 converter.
 */
export const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file provided"));
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (!result) return reject(new Error("File could not be read or is empty"));
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    
    try {
      reader.readAsDataURL(file);
    } catch (e) {
      reject(e);
    }
  });
};

// Helper: Hardware-accelerated PCM decoding
export const pcmToAudioBuffer = async (data: Uint8Array, ctx: AudioContext, sampleRate: number = 24000, numChannels: number = 1): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const decodeBase64Audio = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const encodeBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const float32ToPcm = (data: Float32Array): Uint8Array => {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return new Uint8Array(int16.buffer);
};

export const checkAndRequestApiKey = async (): Promise<boolean> => {
  if (!(window as any).aistudio) return true;
  const hasKey = await (window as any).aistudio.hasSelectedApiKey();
  if (!hasKey) {
    await (window as any).aistudio.openSelectKey();
    return true;
  }
  return true;
};

async function withRetry<T>(fn: () => Promise<T>, retries = 5, baseDelay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = JSON.stringify(error).toLowerCase();
    const isRateLimit = errorStr.includes('429') || errorStr.includes('resource_exhausted') || errorStr.includes('quota');
    if (retries > 0 && isRateLimit) {
      const totalDelay = baseDelay + (Math.random() * 0.3 * baseDelay);
      await new Promise(resolve => setTimeout(resolve, totalDelay));
      return withRetry(fn, retries - 1, baseDelay * 2);
    }
    throw error;
  }
}

/**
 * UI Mirror Engine: Reconstructs an image EXACTLY using Svelte 5.
 * Now with Intelligent Caching and strict visual fidelity rules.
 */
export const reconstructUI = async (base64: string, mimeType: string): Promise<UIMirrorResult> => {
  const cacheKey = `ui_mirror_strict_${base64.substring(0, 1000)}`;
  const cached = await nCache.get<UIMirrorResult>(cacheKey);
  if (cached) return cached;

  return telemetry.observe(FeatureId.UI_MIRROR, 'reconstructUI', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const parts: any[] = [
        { inlineData: { mimeType, data: base64 } },
        { text: `TASK: Replicate this UI EXACTLY using Svelte 5 and Tailwind CSS.
        
        RULES:
        1. Accuracy: Layout, colors, font sizes, and spacing must be pixel-perfect based on the visual data.
        2. Framework: Use Svelte 5 Runes ($state, $derived, $effect).
        3. CSS: Use ONLY Tailwind CSS classes where possible. Use root variables for custom brand colors identified in the image.
        4. Components: Break the UI into logical atomic components.
        5. Interactivity: Infer likely interactions (hover states, button clicks) and implement them using Svelte logic.
        6. JSON Response: Return a structured UIMirrorResult object.
        
        OUTPUT SCHEMA:
        - layout: List of bounding boxes for major UI elements.
        - svelteCode: A single self-contained Svelte component that renders the entire UI.
        - atomicComponents: List of smaller components extracted.
        - designTokens: Map of colors, typography, and spacing values extracted.
        - uxFrictionReport: Any detected UI/UX improvements over the original.
        - i18nMap: Map of extracted text into English and at least one other language.
        ` }
      ];
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts },
        config: {
          thinkingConfig: { thinkingBudget: 32768 },
          responseMimeType: "application/json",
        }
      });
      const result = JSON.parse(response.text || '{}');
      await nCache.set(cacheKey, result);
      return result;
    });
  });
};

export const healUIComponent = async (currentCode: string, issueId: string, healingPayload: string): Promise<string> => {
  return telemetry.observe(FeatureId.UI_MIRROR, 'healUIComponent', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `CONTEXT: Svelte 5 Self-Healing Sequence. 
        GOAL: Fix the specific UI discrepancy or bug reported.
        ISSUE: ${issueId}. 
        FIX STRATEGY: ${healingPayload}. 
        CURRENT CODE: ${currentCode}
        
        Return ONLY the updated Svelte code.`,
      });
      return response.text || currentCode;
    });
  });
};

export const analyzeVideo = async (base64: string, mimeType: string, prompt: string): Promise<string> => {
  return telemetry.observe(FeatureId.VIDEO_UNDERSTANDING, 'analyzeVideo', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const parts: any[] = [{ inlineData: { mimeType, data: base64 } }, { text: prompt }];
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: { parts } });
      return response.text || '';
    });
  });
};

export const analyzeImage = async (data: { base64: string, mimeType: string }[], prompt: string): Promise<string> => {
  return telemetry.observe(FeatureId.IMAGE_ANALYSIS, 'analyzeImage', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const parts: any[] = data.map(item => ({ inlineData: { mimeType: item.mimeType, data: item.base64 } }));
      parts.push({ text: prompt });
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: { parts } });
      return response.text || '';
    });
  });
};

export const auditReconstruction = async (sourceBase64: string, resultBase64: string): Promise<VisualAuditReport> => {
  return telemetry.observe(FeatureId.ART_BOT, 'auditReconstruction', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const parts: any[] = [
        { inlineData: { mimeType: 'image/png', data: sourceBase64 } }, 
        { inlineData: { mimeType: 'image/png', data: resultBase64 } }, 
        { text: "Analyze the differences between the 'source' image and the 'generated' UI. List pixel-level discrepancies and provide CSS fixes to achieve 100% fidelity." }
      ];
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts },
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    });
  });
};

export const forgeNarrativeTimeline = async (storyPrompt: string): Promise<ChronosForgeStory> => {
  return telemetry.observe(FeatureId.CHRONOS_FORGE, 'forgeNarrativeTimeline', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Forge: ${storyPrompt}`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    });
  });
};

export const generateAutonomousThought = async (context: string, sensoryData?: string): Promise<Thought> => {
  return telemetry.observe(FeatureId.CONSCIENCE, 'generateAutonomousThought', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const parts: any[] = [{ text: `Neural thought: ${context}` }];
      if (sensoryData) parts.unshift({ inlineData: { mimeType: 'image/png', data: sensoryData } });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts },
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    });
  });
};

export const researchLatestTech = async (topic: string) => {
  return telemetry.observe(FeatureId.CONSCIENCE, 'researchLatestTech', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Web Research: ${topic}`, config: { tools: [{ googleSearch: {} }] } });
      return { text: response.text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
    });
  });
};

export const calculateCognitivePosition = async (thoughtContent: string, previousThoughts: string[]): Promise<{x: number, y: number}> => {
  return telemetry.observe(FeatureId.CONSCIENCE, 'calculateCognitivePosition', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Thought: ${thoughtContent}\nContext: ${previousThoughts.join(' | ')}`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{"x": 50, "y": 50}');
    });
  });
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio, size: ImageSize, referenceData: { base64: string, mimeType: string }[] = []): Promise<string[]> => {
  const cacheKey = `img_gen_${prompt}_${aspectRatio}_${size}`;
  const cached = await nCache.get<string[]>(cacheKey);
  if (cached) return cached;

  return telemetry.observe(FeatureId.IMAGE_GENERATION, 'generateImage', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const parts: any[] = [{ text: prompt }];
      referenceData.forEach(item => parts.push({ inlineData: { mimeType: item.mimeType, data: item.base64 } }));
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts },
        config: { imageConfig: { aspectRatio, imageSize: size } }
      });
      
      const imageUrls: string[] = [];
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) imageUrls.push(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
      await nCache.set(cacheKey, imageUrls);
      return imageUrls;
    });
  });
};

export const searchWithGrounding = async (query: string) => {
  return telemetry.observe(FeatureId.SEARCH_GROUNDING, 'searchWithGrounding', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: query, config: { tools: [{ googleSearch: {} }] } });
      return { text: response.text || '', chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
    });
  });
};

export const searchWithMaps = async (query: string, location?: { lat: number, lng: number }) => {
  return telemetry.observe(FeatureId.SEARCH_GROUNDING, 'searchWithMaps', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const config: any = { tools: [{ googleMaps: {} }, { googleSearch: {} }] };
      if (location) config.toolConfig = { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } };
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: query, config });
      return { text: response.text || '', chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
    });
  });
};

export const generateVideoWithVeo = async (prompt: string, file?: File, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> => {
  return telemetry.observe(FeatureId.VEO_ANIMATION, 'generateVideoWithVeo', async () => {
    const ai = getAiClient();
    const payload: any = { model: 'veo-3.1-fast-generate-preview', prompt, config: { numberOfVideos: 1, resolution: '720p', aspectRatio } };
    if (file) {
      const base64 = await fileToBase64(file);
      payload.image = { imageBytes: base64, mimeType: file.type };
    }
    let operation = await ai.models.generateVideos(payload);
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    return `${downloadLink}&key=${process.env.API_KEY}`;
  });
};

export const editImage = async (base64: string, mimeType: string, prompt: string): Promise<string[]> => {
  return telemetry.observe(FeatureId.IMAGE_EDITING, 'editImage', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ inlineData: { data: base64, mimeType } }, { text: prompt }] }
      });
      const imageUrls: string[] = [];
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) imageUrls.push(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
      return imageUrls;
    });
  });
};

export const upscaleImage = async (base64: string, mimeType: string, scale: '2K' | '4K'): Promise<string[]> => {
  return telemetry.observe(FeatureId.IMAGE_GENERATION, 'upscaleImage', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ inlineData: { data: base64, mimeType } }, { text: `Upscale to ${scale}.` }] },
        config: { imageConfig: { imageSize: scale as ImageSize } }
      });
      const imageUrls: string[] = [];
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) imageUrls.push(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
      return imageUrls;
    });
  });
};

export const reconstructImageAsSvg = async (base64: string, mimeType: string): Promise<ArtistBotResponse> => {
  const cacheKey = `svg_reconstruct_${base64.substring(0, 500)}`;
  const cached = await nCache.get<ArtistBotResponse>(cacheKey);
  if (cached) return cached;

  return telemetry.observe(FeatureId.ART_BOT, 'reconstructImageAsSvg', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ inlineData: { mimeType, data: base64 } }, { text: "Deconstruct to layered SVG." }] },
        config: { responseMimeType: "application/json" }
      });
      const result = JSON.parse(response.text || '{}');
      await nCache.set(cacheKey, result);
      return result;
    });
  });
};

export const generateFrameworkCode = async (data: ArtistBotResponse, framework: SupportedFramework, animation: string): Promise<string> => {
  return telemetry.observe(FeatureId.ART_BOT, 'generateFrameworkCode', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Synthesize ${framework} application. Visual Context: ${JSON.stringify(data)}`,
      });
      return response.text || '';
    });
  });
};

export const startThinkingChat = (instruction: string) => {
  const ai = getAiClient();
  return ai.chats.create({ model: 'gemini-3-pro-preview', config: { systemInstruction: instruction, thinkingConfig: { thinkingBudget: 32768 } } });
};

export const generateSpeech = async (text: string): Promise<string> => {
  return telemetry.observe(FeatureId.AUDIO_STUDIO, 'generateSpeech', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
    });
  });
};

export const transcribeAudio = async (base64: string): Promise<string> => {
  return telemetry.observe(FeatureId.AUDIO_STUDIO, 'transcribeAudio', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ inlineData: { data: base64, mimeType: 'audio/wav' } }, { text: "Transcribe." }] }
      });
      return response.text || '';
    });
  });
};

export const connectLiveVoice = async (callbacks: any) => {
  const ai = getAiClient();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: { responseModalities: [Modality.AUDIO], outputAudioTranscription: {}, inputAudioTranscription: {} }
  });
};

export const evolveProject = async (files: DevProjectFile[], goal: string): Promise<EvolutionResult> => {
  return telemetry.observe(FeatureId.DEV_ENGINE, 'evolveProject', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Evolve project: ${goal}\nFiles: ${JSON.stringify(files)}`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    });
  });
};

export const generateQuantumCircuit = async (objective: string): Promise<QuantumCircuitResult> => {
  return telemetry.observe(FeatureId.QUANTUM_LAB, 'generateQuantumCircuit', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Quantum circuit for: ${objective}`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    });
  });
};

export const analyzeVisualState = async (base64: string, instruction: string): Promise<OcularReview> => {
  return telemetry.observe(FeatureId.VISUAL_INTELLIGENCE, 'analyzeVisualState', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ inlineData: { mimeType: 'image/png', data: base64 } }, { text: instruction }] },
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    });
  });
};

export const synthesizeNewCapability = async (request: string, context?: string): Promise<CapabilitySynthesis> => {
  return telemetry.observe(FeatureId.CONSCIENCE, 'synthesizeNewCapability', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Synthesize: ${request}\nContext: ${context || ''}`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    });
  });
};

export const orchestrateMissionPlan = async (goal: string): Promise<MissionPlan> => {
  return telemetry.observe(FeatureId.CONSCIENCE, 'orchestrateMissionPlan', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Orchestrate: ${goal}`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    });
  });
};

export const extractKineticLogic = async (base64: string, mimeType: string): Promise<KineticMotionData> => {
  return telemetry.observe(FeatureId.KINETIC_BLUEPRINT, 'extractKineticLogic', async () => {
    return withRetry(async () => {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ inlineData: { mimeType, data: base64 } }, { text: "Extract Kinetic." }] },
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    });
  });
};
