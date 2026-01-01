import { Injectable } from '@angular/core';
import { MatTree } from '@angular/material/tree';
import { FileNode } from '../data/example-data';

export interface DragState {
  draggedNode: FileNode | null;
  draggedNodeParent: FileNode | null;
  draggedNodeIndex: number;
  dropTarget: FileNode | null;
  dropPosition: 'before' | 'after' | 'inside' | 'root' | null;
}

@Injectable({
  providedIn: 'root',
})
export class TreeDragService {
  private dragState: DragState = {
    draggedNode: null,
    draggedNodeParent: null,
    draggedNodeIndex: -1,
    dropTarget: null,
    dropPosition: null,
  };

  private expandedNodeNames = new Set<string>();
  private selectedNodeName: string | null = null;

  /**
   * Start dragging a node
   */
  startDrag(node: FileNode, parent: FileNode | null, index: number, dataSource: FileNode[]): void {
    this.dragState = {
      draggedNode: node,
      draggedNodeParent: parent,
      draggedNodeIndex: index,
      dropTarget: null,
      dropPosition: null,
    };
  }

  /**
   * Set the drop target and position
   */
  setDropTarget(
    target: FileNode | null,
    position: 'before' | 'after' | 'inside' | 'root' | null,
  ): void {
    this.dragState.dropTarget = target;
    this.dragState.dropPosition = position;
  }

  /**
   * Get the current drag state
   */
  getDragState(): DragState {
    return { ...this.dragState };
  }

  /**
   * Check if a node is being dragged
   */
  isDragging(node: FileNode): boolean {
    return this.dragState.draggedNode === node;
  }

  /**
   * Check if a drop is valid (prevent dropping a parent into its own child)
   */
  canDrop(
    targetNode: FileNode | null,
    position: 'before' | 'after' | 'inside' | 'root' | null,
  ): boolean {
    if (!this.dragState.draggedNode) {
      return false;
    }

    // Root position is always valid if we have a dragged node
    if (position === 'root') {
      return true;
    }

    if (!targetNode) {
      return false;
    }

    // Can't drop onto itself in any position
    if (this.dragState.draggedNode === targetNode) {
      return false;
    }

    // Can't drop a parent into its own descendant
    if (position === 'inside' && this.isDescendant(this.dragState.draggedNode, targetNode)) {
      return false;
    }

    // Check if target is a descendant of dragged node
    if (this.isDescendant(this.dragState.draggedNode, targetNode)) {
      return false;
    }

    return true;
  }

  /**
   * Check if a node is a descendant of another node
   */
  private isDescendant(parent: FileNode, possibleDescendant: FileNode): boolean {
    if (!parent.children) {
      return false;
    }

    for (const child of parent.children) {
      if (child === possibleDescendant) {
        return true;
      }
      if (this.isDescendant(child, possibleDescendant)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Execute the drop operation
   */
  drop(dataSource: FileNode[], tree?: MatTree<FileNode>): FileNode[] {
    const { draggedNode, draggedNodeParent, draggedNodeIndex, dropTarget, dropPosition } =
      this.dragState;

    if (!draggedNode || !dropTarget || !dropPosition || !this.canDrop(dropTarget, dropPosition)) {
      this.endDrag();
      return dataSource;
    }

    // Save expanded state before drop
    if (tree) {
      this.saveExpandedState(tree, dataSource);
    }

    // Mark the dragged node as selected
    this.selectedNodeName = draggedNode.name;

    // Create a deep copy of the data source
    const newDataSource = JSON.parse(JSON.stringify(dataSource)) as FileNode[];

    // Find the nodes in the new data source
    const { node: newDraggedNode, parent: newDraggedParent } = this.findNodeAndParent(
      newDataSource,
      draggedNode.name,
      draggedNodeParent?.name,
    );
    const { node: newDropTarget, parent: newDropTargetParent } = this.findNodeAndParent(
      newDataSource,
      dropTarget.name,
    );

    if (!newDraggedNode || !newDropTarget) {
      this.endDrag();
      return dataSource;
    }

    // Remove the dragged node from its current location
    if (newDraggedParent && newDraggedParent.children) {
      const index = newDraggedParent.children.findIndex((n) => n.name === newDraggedNode.name);
      if (index !== -1) {
        newDraggedParent.children.splice(index, 1);
      }
    } else {
      const index = newDataSource.findIndex((n) => n.name === newDraggedNode.name);
      if (index !== -1) {
        newDataSource.splice(index, 1);
      }
    }

    // Insert the dragged node at the new location
    if (dropPosition === 'inside') {
      // Drop inside the target node
      if (!newDropTarget.children) {
        newDropTarget.children = [];
      }
      newDropTarget.children.push(newDraggedNode);
    } else if (dropPosition === 'before' || dropPosition === 'after') {
      // Drop before or after the target node
      const targetParent = newDropTargetParent;
      const targetArray = targetParent ? targetParent.children! : newDataSource;
      const targetIndex = targetArray.findIndex((n) => n.name === newDropTarget.name);

      if (targetIndex !== -1) {
        const insertIndex = dropPosition === 'before' ? targetIndex : targetIndex + 1;
        targetArray.splice(insertIndex, 0, newDraggedNode);
      }
    }

    this.endDrag();
    return newDataSource;
  }

  /**
   * Find a node and its parent in the tree
   */
  private findNodeAndParent(
    nodes: FileNode[],
    nodeName: string,
    parentName?: string,
  ): { node: FileNode | null; parent: FileNode | null } {
    for (const node of nodes) {
      if (node.name === nodeName) {
        return { node, parent: null };
      }

      if (node.children) {
        const result = this.findNodeInChildren(node, nodeName, parentName);
        if (result.node) {
          return result;
        }
      }
    }

    return { node: null, parent: null };
  }

  /**
   * Recursively find a node in children
   */
  private findNodeInChildren(
    parent: FileNode,
    nodeName: string,
    parentName?: string,
  ): { node: FileNode | null; parent: FileNode | null } {
    if (!parent.children) {
      return { node: null, parent: null };
    }

    for (const child of parent.children) {
      if (child.name === nodeName) {
        return { node: child, parent };
      }

      if (child.children) {
        const result = this.findNodeInChildren(child, nodeName, parentName);
        if (result.node) {
          return result;
        }
      }
    }

    return { node: null, parent: null };
  }

  /**
   * End the drag operation
   */
  endDrag(): void {
    this.dragState = {
      draggedNode: null,
      draggedNodeParent: null,
      draggedNodeIndex: -1,
      dropTarget: null,
      dropPosition: null,
    };
  }

  /**
   * Calculate drop position based on mouse position relative to element
   */
  calculateDropPosition(
    event: DragEvent,
    targetElement: HTMLElement,
    targetNode: FileNode,
  ): 'before' | 'after' | 'inside' {
    const rect = targetElement.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;
    const height = rect.height;

    // If the target is a folder (has children or is of type folder), use a generous 'inside' zone
    // This makes it easier to drop into folders, especially closed ones
    if (targetNode.type === 'folder' || targetNode.children) {
      // Use top/bottom 20% for before/after, middle 60% for inside
      if (mouseY > height * 0.2 && mouseY < height * 0.8) {
        return 'inside';
      }
    }

    // Otherwise, drop before or after based on mouse position
    return mouseY < height / 2 ? 'before' : 'after';
  }

  /**
   * Save the expanded state of all nodes
   */
  saveExpandedState(tree: MatTree<FileNode>, dataSource: FileNode[]): void {
    this.expandedNodeNames.clear();

    const collectExpandedNodes = (nodes: FileNode[]) => {
      for (const node of nodes) {
        if (tree.isExpanded(node)) {
          this.expandedNodeNames.add(node.name);
        }
        if (node.children) {
          collectExpandedNodes(node.children);
        }
      }
    };

    collectExpandedNodes(dataSource);
  }

  /**
   * Restore the expanded state of nodes
   */
  restoreExpandedState(tree: MatTree<FileNode>, dataSource: FileNode[]): void {
    const expandNodes = (nodes: FileNode[]) => {
      for (const node of nodes) {
        // Restore previously expanded nodes
        if (this.expandedNodeNames.has(node.name)) {
          tree.expand(node);
        }
        if (node.children) {
          expandNodes(node.children);
        }
      }
    };

    expandNodes(dataSource);
  }

  /**
   * Get the parent node for a given node
   */
  getParentNode(node: FileNode, nodes: FileNode[]): FileNode | null {
    for (const item of nodes) {
      if (item.children && item.children.includes(node)) {
        return item;
      }
      if (item.children) {
        const parent = this.getParentNode(node, item.children);
        if (parent) {
          return parent;
        }
      }
    }
    return null;
  }

  /**
   * Get the index of a node within its parent's children array
   */
  getNodeIndex(node: FileNode, parent: FileNode | null, dataSource: FileNode[]): number {
    if (parent && parent.children) {
      return parent.children.indexOf(node);
    }
    return dataSource.indexOf(node);
  }

  /**
   * Check if a node is selected
   */
  isSelected(node: FileNode): boolean {
    return this.selectedNodeName === node.name;
  }

  /**
   * Set the selected node
   */
  setSelected(node: FileNode | null): void {
    this.selectedNodeName = node ? node.name : null;
  }

  /**
   * Drop at root level
   */
  dropAtRoot(dataSource: FileNode[], tree?: MatTree<FileNode>): FileNode[] {
    const { draggedNode, draggedNodeParent } = this.dragState;

    if (!draggedNode) {
      this.endDrag();
      return dataSource;
    }

    // Save expanded state before drop
    if (tree) {
      this.saveExpandedState(tree, dataSource);
    }

    // Mark the dragged node as selected
    this.selectedNodeName = draggedNode.name;

    // Create a deep copy of the data source
    const newDataSource = JSON.parse(JSON.stringify(dataSource)) as FileNode[];

    // Find the dragged node in the new data source
    const { node: newDraggedNode, parent: newDraggedParent } = this.findNodeAndParent(
      newDataSource,
      draggedNode.name,
      draggedNodeParent?.name,
    );

    if (!newDraggedNode) {
      this.endDrag();
      return dataSource;
    }

    // Remove the dragged node from its current location
    if (newDraggedParent && newDraggedParent.children) {
      const index = newDraggedParent.children.findIndex((n) => n.name === newDraggedNode.name);
      if (index !== -1) {
        newDraggedParent.children.splice(index, 1);
      }
    } else {
      const index = newDataSource.findIndex((n) => n.name === newDraggedNode.name);
      if (index !== -1) {
        newDataSource.splice(index, 1);
      }
    }

    // Add to root level
    newDataSource.push(newDraggedNode);

    this.endDrag();
    return newDataSource;
  }

  /**
   * Get CSS classes for drag state
   */
  getDragClasses(node: FileNode): { [key: string]: boolean } {
    return {
      dragging: this.isDragging(node),
      selected: this.isSelected(node),
      'drop-target': this.dragState.dropTarget === node,
      'drop-before': this.dragState.dropTarget === node && this.dragState.dropPosition === 'before',
      'drop-after': this.dragState.dropTarget === node && this.dragState.dropPosition === 'after',
      'drop-inside': this.dragState.dropTarget === node && this.dragState.dropPosition === 'inside',
    };
  }
}
