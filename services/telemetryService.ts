
import { FeatureId, TelemetryMetric, ProfileNode, PerformanceSnapshot } from '../types';

export interface SystemError {
  timestamp: number;
  module: string;
  message: string;
  stack?: string;
  recovered: boolean;
}

class TelemetryService {
  private metrics: TelemetryMetric[] = [];
  private errors: SystemError[] = [];
  private snapshots: PerformanceSnapshot[] = [];
  private listeners: Set<(metrics: TelemetryMetric[]) => void> = new Set();
  private snapshotListeners: Set<(snapshots: PerformanceSnapshot[]) => void> = new Set();
  private errorListeners: Set<(errors: SystemError[]) => void> = new Set();
  private bottleneckListeners: Set<(bottleneck: string) => void> = new Set();
  private startTime = Date.now();
  private lastFrameTime = performance.now();
  private frameCount = 0;
  private currentFps = 60;

  constructor() {
    this.initFpsTracker();
    this.initSnapshotCycle();
  }

  private initFpsTracker() {
    const track = () => {
      this.frameCount++;
      const now = performance.now();
      if (now >= this.lastFrameTime + 1000) {
        this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
        this.frameCount = 0;
        this.lastFrameTime = now;
      }
      requestAnimationFrame(track);
    };
    if (typeof window !== 'undefined') requestAnimationFrame(track);
  }

  private initSnapshotCycle() {
    setInterval(() => {
      const snapshot: PerformanceSnapshot = {
        timestamp: Date.now(),
        cpu: this.estimateCpuUsage(),
        memory: (performance as any).memory?.usedJSHeapSize / (1024 * 1024) || 120,
        fps: this.currentFps,
        activeProcesses: this.metrics.filter(m => m.timestamp > Date.now() - 5000).length,
        latency: this.calculateAverageLatency()
      };
      this.snapshots.push(snapshot);
      if (this.snapshots.length > 100) this.snapshots.shift();
      this.notifySnapshots();
    }, 2000);
  }

  private estimateCpuUsage(): number {
    // Simulated CPU logic based on active metrics and complexity
    const recentMetrics = this.metrics.filter(m => m.timestamp > Date.now() - 2000);
    const activityFactor = recentMetrics.length * 5;
    const baseLoad = 5;
    return Math.min(100, baseLoad + activityFactor + Math.random() * 5);
  }

  private calculateAverageLatency(): number {
    const recent = this.metrics.filter(m => m.timestamp > Date.now() - 5000 && m.status === 'success');
    if (recent.length === 0) return 0;
    return recent.reduce((acc, m) => acc + m.duration, 0) / recent.length;
  }

  logMetric(metric: Omit<TelemetryMetric, 'timestamp'>) {
    const fullMetric = { ...metric, timestamp: Date.now() };
    this.metrics.push(fullMetric);
    
    if (fullMetric.duration > 5000) {
      this.notifyBottleneck(`High Latency detected in ${fullMetric.featureId}: ${fullMetric.duration.toFixed(0)}ms`);
    }

    if (this.metrics.length > 500) this.metrics.shift();
    this.notify();
  }

  logError(module: string, error: any, recovered: boolean = true) {
    const systemError: SystemError = {
      timestamp: Date.now(),
      module,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      recovered
    };
    this.errors.push(systemError);
    if (this.errors.length > 50) this.errors.shift();
    this.notifyErrors();
    
    this.logMetric({ featureId: 'system', duration: 0, status: 'error' });
  }

  async observe<T>(featureId: FeatureId | 'system', taskName: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      this.logMetric({ featureId, duration: performance.now() - start, status: 'success' });
      return result;
    } catch (error) {
      this.logMetric({ featureId, duration: performance.now() - start, status: 'error' });
      this.logError(featureId, error);
      throw error;
    }
  }

  getSnapshots() { return [...this.snapshots]; }
  getMetrics() { return [...this.metrics]; }
  getErrors() { return [...this.errors]; }

  subscribeSnapshots(fn: (snapshots: PerformanceSnapshot[]) => void) {
    this.snapshotListeners.add(fn);
    return () => this.snapshotListeners.delete(fn);
  }

  subscribe(fn: (metrics: TelemetryMetric[]) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  subscribeErrors(fn: (errors: SystemError[]) => void) {
    this.errorListeners.add(fn);
    return () => this.errorListeners.delete(fn);
  }

  onBottleneck(fn: (msg: string) => void) {
    this.bottleneckListeners.add(fn);
    return () => this.bottleneckListeners.delete(fn);
  }

  private notify() { this.listeners.forEach(fn => fn([...this.metrics])); }
  private notifySnapshots() { this.snapshotListeners.forEach(fn => fn([...this.snapshots])); }
  private notifyErrors() { this.errorListeners.forEach(fn => fn([...this.errors])); }
  private notifyBottleneck(msg: string) { this.bottleneckListeners.forEach(fn => fn(msg)); }
}

export const telemetry = new TelemetryService();
