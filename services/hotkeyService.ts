
import { HotkeyMapping } from '../types';

class HotkeyService {
  private mappings: HotkeyMapping[] = [
    { id: 'toggle-launcher', action: 'Toggle Launcher', key: 'Space', alt: true },
    { id: 'minimize-all', action: 'Minimize All', key: 'd', meta: true },
    { id: 'toggle-debugger', action: 'Toggle Debugger', key: '`', ctrl: true },
    { id: 'save-nexus', action: 'Save to Nexus', key: 's', ctrl: true },
    { id: 'command-palette', action: 'Command Palette', key: 'k', meta: true },
    { id: 'toggle-help', action: 'Keyboard Cheat Sheet', key: '/', ctrl: true },
  ];

  private listeners: Set<(id: string) => void> = new Set();

  constructor() {
    this.loadFromStorage();
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private loadFromStorage() {
    const saved = localStorage.getItem('kernel_hotkeys');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure new system keys exist
        this.mappings = this.mappings.map(def => {
          const custom = parsed.find((p: any) => p.id === def.id);
          return custom ? { ...def, ...custom } : def;
        });
      } catch (e) {
        console.error("Hotkey parse error", e);
      }
    }
  }

  saveMappings() {
    localStorage.setItem('kernel_hotkeys', JSON.stringify(this.mappings));
  }

  getMappings() {
    return [...this.mappings];
  }

  updateMapping(id: string, newMapping: Partial<HotkeyMapping>) {
    this.mappings = this.mappings.map(m => m.id === id ? { ...m, ...newMapping } : m);
    this.saveMappings();
  }

  subscribe(fn: (id: string) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private handleKeyDown(e: KeyboardEvent) {
    const match = this.mappings.find(m => {
      const keyMatch = e.key.toLowerCase() === m.key.toLowerCase() || e.code === m.key;
      const ctrlMatch = !!m.ctrl === (e.ctrlKey);
      const metaMatch = !!m.meta === (e.metaKey);
      const altMatch = !!m.alt === e.altKey;
      const shiftMatch = !!m.shift === e.shiftKey;
      
      // Allow Meta (Cmd) or Ctrl interchangeably for common shortcuts if requested, 
      // but here we follow the explicit definition
      return keyMatch && (ctrlMatch || metaMatch) && altMatch && shiftMatch;
    });

    if (match) {
      // Prevent browser defaults only for studio-mapped keys
      if (['s', 'k', 'd', '/', '`'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      this.listeners.forEach(fn => fn(match.id));
    }
  }
}

export const hotkeys = new HotkeyService();
