const attributes: (keyof FrameNode)[] = [
  "clipsContent",
  "cornerRadius",
  "blendMode",
  "effects",
  "effectStyleId",
  // "exportSettings",
  "fills",
  "fillStyleId",
  "gridStyleId",
  "layoutGrids",
  "opacity",
  "strokes",
  "strokeStyleId",
  "constrainProportions",

  // layout mode ?
  "counterAxisAlignItems",
  "counterAxisSizingMode",
  "primaryAxisAlignItems",
  "primaryAxisSizingMode",
  "layoutAlign",
  "layoutGrow",
  "layoutMode",
  "layoutPositioning",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",

  "constraints",

  "itemReverseZIndex",
  "itemSpacing",

  // ... this could be comprehensive
];

export function copyAttributes<NodeType extends SceneNode = SceneNode>(
  sourceNode: NodeType,
  destinationNode: NodeType
) {
  for (const attribute of attributes as (keyof NodeType)[]) {
    if (attribute in sourceNode && attribute in destinationNode) {
      try {
        destinationNode[attribute] = sourceNode[attribute];
      }
      catch {
        console.log(`Repeat As List: cannot set ${attribute as string} from source to destination`); 
      }
    }
  }
}
