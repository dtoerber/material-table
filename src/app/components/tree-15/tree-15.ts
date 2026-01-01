import { FlatTreeControl } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatTree,
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule,
} from '@angular/material/tree';
import { FileNode, files } from '../../data/example-data';
import { TreeFlatDragService } from '../../services/tree-flat-drag.service';

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}
@Component({
  selector: 'app-tree-15',
  imports: [CommonModule, MatTreeModule, MatIconModule, MatButtonModule],
  templateUrl: './tree-15.html',
  styleUrl: './tree-15.scss',
})
export class Tree15Component implements AfterViewInit {
  @ViewChild('tree', { static: false }) tree!: MatTree<ExampleFlatNode>;
  private _transformer = (node: FileNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(public dragService: TreeFlatDragService) {
    this.dataSource.data = files;
  }

  ngAfterViewInit(): void {
    this.treeControl.expandAll();
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  /**
   * Handle node click event
   */
  onNodeClick(event: MouseEvent, flatNode: ExampleFlatNode): void {
    // Don't interfere with toggle button clicks
    if ((event.target as HTMLElement).closest('button[matTreeNodeToggle]')) {
      return;
    }
    const node = this.dragService.findNode(flatNode.name, this.dataSource.data);
    if (node) {
      this.dragService.setSelected(node);
    }
  }

  /**
   * Handle drag start event
   */
  onDragStart(event: DragEvent, flatNode: ExampleFlatNode): void {
    event.stopPropagation();
    const node = this.dragService.findNode(flatNode.name, this.dataSource.data);
    if (!node) return;

    const parent = this.getParentNode(node);
    const index = this.getNodeIndex(node, parent);
    this.dragService.startDrag(node, parent, index, this.dataSource.data);
    this.dragService.setupDragTransfer(event, node);
  }

  /**
   * Handle drag over event
   */
  onDragOver(event: DragEvent, flatNode: ExampleFlatNode, element: HTMLElement): void {
    event.preventDefault();
    event.stopPropagation();

    const node = this.dragService.findNode(flatNode.name, this.dataSource.data);
    if (!node) return;

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
    if ((event.target as HTMLElement).classList.contains('container')) {
      event.preventDefault();
      event.stopPropagation();

      // Save the current expanded state
      const expandedNodes = this.dragService.saveFlatTreeExpandedState(
        this.treeControl,
        this.dataSource.data,
      );

      // Perform the drop operation
      this.dataSource.data = this.dragService.dropAtRoot(this.dataSource.data);

      // Restore expanded state after the tree re-renders
      requestAnimationFrame(() => {
        this.dragService.restoreFlatTreeExpandedState(this.treeControl, expandedNodes);
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

    // Save the current expanded state
    const expandedNodes = this.dragService.saveFlatTreeExpandedState(
      this.treeControl,
      this.dataSource.data,
    );

    // Perform the drop operation
    this.dataSource.data = this.dragService.drop(this.dataSource.data);

    // Restore expanded state after the tree re-renders
    requestAnimationFrame(() => {
      this.dragService.restoreFlatTreeExpandedState(this.treeControl, expandedNodes);
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
    return this.dragService.getParentNode(node, this.dataSource.data);
  }

  /**
   * Get the index of a node within its parent's children array
   */
  getNodeIndex(node: FileNode, parent: FileNode | null): number {
    return this.dragService.getNodeIndex(node, parent, this.dataSource.data);
  }

  /**
   * Get CSS classes for drag state
   */
  getDragClasses(flatNode: ExampleFlatNode): { [key: string]: boolean } {
    const node = this.dragService.findNode(flatNode.name, this.dataSource.data);
    if (!node) return {};
    return this.dragService.getDragClasses(node);
  }
}
