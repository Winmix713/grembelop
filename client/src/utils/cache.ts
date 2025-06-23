
import { GeneratedComponent, CacheEntry } from '../types/figma-generator';

export class ComponentCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 1000 * 60 * 30; // 30 minutes
  private readonly MAX_SIZE = 1000;

  constructor(private ttl: number = 1000 * 60 * 30) {
    this.TTL = ttl;
    
    // Clean expired entries every 5 minutes
    setInterval(() => this.cleanExpired(), 1000 * 60 * 5);
  }

  generateKey(nodeId: string, options: any): string {
    const optionsHash = this.hashObject(options);
    return `${nodeId}_${optionsHash}`;
  }

  get(key: string): GeneratedComponent | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.component;
  }

  set(key: string, component: GeneratedComponent): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_SIZE) {
      this.evictOldest();
    }

    const entry: CacheEntry = {
      key,
      component,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.TTL
    };

    this.cache.set(key, entry);
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry ? Date.now() <= entry.expiresAt : false;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    const expired = entries.filter(entry => now > entry.expiresAt).length;
    
    return {
      total: this.cache.size,
      expired,
      active: this.cache.size - expired,
      oldestEntry: Math.min(...entries.map(e => e.timestamp)),
      newestEntry: Math.max(...entries.map(e => e.timestamp))
    };
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}
