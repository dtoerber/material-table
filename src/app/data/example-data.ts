/** File node data with possible child nodes. */
export interface FileNode {
  name: string;
  type: string;
  children?: FileNode[];
}

/** Example file/folder data. */
export const files: FileNode[] = [
  {
    name: 'components',
    type: 'folder',
    children: [
      {
        name: 'src',
        type: 'folder',
        children: [
          {
            name: 'cdk',
            type: 'folder',
            children: [
              { name: 'angular.json', type: 'file' },
              { name: 'BUILD.bazel', type: 'file' },
            ],
          },
          { name: 'material', type: 'folder' },
        ],
      },
    ],
  },
  {
    name: 'angular',
    type: 'folder',
    children: [
      {
        name: 'packages',
        type: 'folder',
        children: [
          { name: '.travis.yml', type: 'file' },
          { name: 'firebase.json', type: 'file' },
        ],
      },
      { name: 'package.json', type: 'file' },
    ],
  },
  {
    name: 'angularjs',
    type: 'folder',
    children: [
      { name: 'gulpfile.js', type: 'file' },
      { name: 'README.md', type: 'file' },
    ],
  },
];
