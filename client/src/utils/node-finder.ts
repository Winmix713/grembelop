
import { FigmaNode, FigmaApiResponse } from '../types/figma-generator';

export class NodeFinder {
  constructor(private figmaData: FigmaApiResponse) {}

  findNodeById(id: string): FigmaNode | null {
    const search = (node: FigmaNode): FigmaNode | null => {
      if (node.id === id) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = search(child);
          if (found) return found;
        }
      }
      return null;
    };
    return search(this.figmaData.document);
  }

  countNodes(node: FigmaNode): number {
    let count = 1;
    if (node.children) {
      count += node.children.reduce((sum, child) => sum + this.countNodes(child), 0);
    }
    return count;
  }
}
