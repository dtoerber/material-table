import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { EXAMPLE_DATA, FileNode, files } from './example-data';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  imports: [MatTreeModule, MatButtonModule, MatIconModule],
})
export class TreeComponent {
  /** The data source for the tree */
  // dataSource = EXAMPLE_DATA;
  dataSource = files;

  /** Get the children for the node. */
  childrenAccessor = (node: FileNode) => node.children ?? [];

  /** Get whether the node has children or not. */
  hasChild = (_: number, node: FileNode) => !!node.children && node.children.length > 0;
}
