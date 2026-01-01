import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTree, MatTreeModule } from '@angular/material/tree';
import { FileNode, files } from '../../data/example-data';
import { TreeDragService } from '../../services/tree-drag.service';

@Component({
  selector: 'app-tree-two',
  templateUrl: './tree-two.component.html',
  styleUrl: './tree-two.component.scss',
  imports: [CommonModule, MatTreeModule, MatButtonModule, MatIconModule],
})
export class TreeTwoComponent implements AfterViewInit {
  @ViewChild('tree', { static: false }) tree!: MatTree<FileNode>;

  /** The data source for the tree */
  // dataSource = EXAMPLE_DATA;
  dataSource = files;

  /** Get the children for the node. */
  childrenAccessor = (node: FileNode) => node.children ?? [];

  /** Get whether the node has children or not. */
  hasChild = (_: number, node: FileNode) => !!node.children && node.children.length > 0;

  constructor(public dragService: TreeDragService) {}

  /**
   * Lifecycle hook that runs after the view is initialized
   * Expands all nodes in the tree
   */
  ngAfterViewInit(): void {
    // this.tree.expandAll();
  }

  /**
   * Handle node click event
   */
  onNodeClick(event: MouseEvent, node: FileNode): void {
    // Don't interfere with toggle button clicks
    if ((event.target as HTMLElement).closest('button[matTreeNodeToggle]')) {
      return;
    }
    this.dragService.setSelected(node);
  }

  /**
   * Handle drag start event
   */
  onDragStart(event: DragEvent, node: FileNode, parent: FileNode | null, index: number): void {
    event.stopPropagation();
    this.dragService.startDrag(node, parent, index, this.dataSource);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', node.name);

      // Create a custom drag image (small icon)
      const dragIcon = document.createElement('div');
      dragIcon.style.cssText = `
        position: absolute;
        top: -1000px;
        left: -1000px;
        width: 40px;
        height: 40px;
        background-color: #3f51b5;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      `;
      // Use different icons for parent nodes (with children) vs leaf nodes (no children)
      dragIcon.textContent = node.children && node.children.length > 0 ? '📁' : '📄';
      document.body.appendChild(dragIcon);

      event.dataTransfer.setDragImage(dragIcon, 20, 20);

      // Clean up the drag icon after a short delay
      setTimeout(() => {
        document.body.removeChild(dragIcon);
      }, 0);
    }
  }

  /**
   * Handle drag over event
   */
  onDragOver(event: DragEvent, node: FileNode, element: HTMLElement): void {
    event.preventDefault();
    event.stopPropagation();

    const position = this.dragService.calculateDropPosition(event, element, node);

    if (this.dragService.canDrop(node, position)) {
      this.dragService.setDropTarget(node, position);
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
    } else {
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'none';
      }
    }
  }

  /**
   * Handle drag over event for root drop zone
   */
  onRootDragOver(event: DragEvent): void {
    // Only handle if not over a specific node
    if ((event.target as HTMLElement).classList.contains('container')) {
      event.preventDefault();
      event.stopPropagation();

      if (this.dragService.getDragState().draggedNode) {
        this.dragService.setDropTarget(null, 'root');
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = 'move';
        }
      }
    }
  }

  /**
   * Handle drop event for root drop zone
   */
  onRootDrop(event: DragEvent): void {
    // Only handle if dropping on container itself, not on a node
    if ((event.target as HTMLElement).classList.contains('container')) {
      event.preventDefault();
      event.stopPropagation();

      // Perform the drop operation at root level
      this.dataSource = this.dragService.dropAtRoot(this.dataSource, this.tree);

      // Restore expanded state after the next animation frame to allow the tree to render
      requestAnimationFrame(() => {
        this.dragService.restoreExpandedState(this.tree, this.dataSource);
      });
    }
  }

  /**
   * Handle drag leave event
   */
  onDragLeave(event: DragEvent): void {
    event.stopPropagation();
  }

  /**
   * Handle drop event
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Perform the drop operation (service handles expansion state)
    this.dataSource = this.dragService.drop(this.dataSource, this.tree);

    // Restore expanded state after the next animation frame to allow the tree to render
    requestAnimationFrame(() => {
      this.dragService.restoreExpandedState(this.tree, this.dataSource);
    });
  }

  /**
   * Handle drag end event
   */
  onDragEnd(event: DragEvent): void {
    event.stopPropagation();
    this.dragService.endDrag();
  }

  /**
   * Get the parent node for a given node
   */
  getParentNode(node: FileNode): FileNode | null {
    return this.dragService.getParentNode(node, this.dataSource);
  }

  /**
   * Get the index of a node within its parent's children array
   */
  getNodeIndex(node: FileNode, parent: FileNode | null): number {
    return this.dragService.getNodeIndex(node, parent, this.dataSource);
  }

  /**
   * Get CSS classes for drag state
   */
  getDragClasses(node: FileNode): { [key: string]: boolean } {
    return this.dragService.getDragClasses(node);
  }
}
