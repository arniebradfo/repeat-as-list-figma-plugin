export function frameNodes(nodes: SceneNode[]) {
//   const { selection } = figma.currentPage;
  if (nodes.length === 0) return undefined;

  // new frame insertion point should be at the first selected node
  const parent = nodes[0].parent || figma.currentPage;

  const groupInsertionIndex = getIndexInParent(nodes[nodes.length - 1]);
  const groupNode = figma.group(nodes, parent, groupInsertionIndex);

  const frameNode = figma.createFrame();
  const frameInsertionIndex = getIndexInParent(groupNode);

  // copy groupNode dimensions
  frameNode.x = groupNode.x;
  frameNode.y = groupNode.y;
  frameNode.resize(groupNode.width, groupNode.height);
  frameNode.fills = [];
  frameNode.clipsContent = false;
  const frameIndex = getCurrentFrameIndex();
  frameNode.name = `Component ${frameIndex}`;

  // offset each child by the groupNode x y, or it gets double offset
  const offsetX = groupNode.x;
  const offsetY = groupNode.y;

  [...groupNode.children].reverse().forEach((child) => {
    frameNode.insertChild(0, child);
    child.x = child.x - offsetX;
    child.y = child.y - offsetY;
  });

  // groupNode.remove() // groupNode removes itself when it has no children
  // console.log({ parentLength: parent.children.length, frameInsertionIndex });

  parent.insertChild(frameInsertionIndex, frameNode);

  // frameNode.children.forEach((childNode) => autoConstraints(childNode));

  // figma.currentPage.selection = [frameNode];
  return frameNode;
}

function getIndexInParent(node: SceneNode) {
  if (node.parent === null) return 0;
  return node.parent.children.findIndex((child) => node.id === child.id);
}

const frameIndexKey = "frameIndex";
function getCurrentFrameIndex() {
  let frameIndex: number = Number.parseInt(
    figma.currentPage.getPluginData(frameIndexKey)
  );
  if (isNaN(frameIndex) || !frameIndex) frameIndex = 0;
  frameIndex++;
  figma.currentPage.setPluginData(frameIndexKey, frameIndex.toString());
  return frameIndex;
}
