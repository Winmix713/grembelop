
import { FigmaNode } from '../types/figma-generator';

export class ComponentDetector {
  detectComponentType(node: FigmaNode): string {
    const name = node.name.toLowerCase();
    
    // Intelligent component type detection
    if (name.includes('button') || name.includes('btn')) return 'button';
    if (name.includes('card')) return 'card';
    if (name.includes('text') || name.includes('title') || name.includes('heading')) return 'text';
    if (name.includes('image') || name.includes('img') || name.includes('picture')) return 'image';
    if (name.includes('icon')) return 'icon';
    if (name.includes('container') || name.includes('wrapper') || name.includes('layout')) return 'layout';
    
    // Analyze node structure for type detection
    if (node.type === 'TEXT') return 'text';
    if (node.type === 'RECTANGLE' && node.fills?.some(fill => fill.type === 'IMAGE')) return 'image';
    if (node.children && node.children.length > 2) return 'layout';
    
    return 'default';
  }
}
