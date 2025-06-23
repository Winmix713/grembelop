
import { FigmaApiResponse, FigmaNode } from '../types/figma';

export class NodeFinder {
  constructor(private figmaData: FigmaApiResponse) {}

  findNodeById(id: string): FigmaNode | null {
    return this.searchNode(this.figmaData.document, id);
  }

  private searchNode(node: FigmaNode, targetId: string): FigmaNode | null {
    if (node.id === targetId) {
      return node;
    }

    if (node.children) {
      for (const child of node.children) {
        const found = this.searchNode(child, targetId);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  countNodes(node: FigmaNode): number {
    let count = 1;
    if (node.children) {
      for (const child of node.children) {
        count += this.countNodes(child);
      }
    }
    return count;
  }

  getAllNodes(node: FigmaNode): FigmaNode[] {
    const nodes = [node];
    if (node.children) {
      for (const child of node.children) {
        nodes.push(...this.getAllNodes(child));
      }
    }
    return nodes;
  }
}
