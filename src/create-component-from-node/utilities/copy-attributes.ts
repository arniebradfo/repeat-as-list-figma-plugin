const attributes: (keyof FrameNode)[] = [
  "clipsContent",
  "cornerRadius",
  "blendMode",
  "effects",
  // "exportSettings",
  "fills",
  "layoutGrids",
  "opacity",
  "strokes",

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

// Style ids can't be assigned directly with `documentAccess: "dynamic-page"`,
// they must be set with their async setter. Applied after `attributes` so the
// style wins over the raw value (e.g. `fillStyleId` after `fills`).
const styleIdSetters = [
  ["effectStyleId", "setEffectStyleIdAsync"],
  ["fillStyleId", "setFillStyleIdAsync"],
  ["gridStyleId", "setGridStyleIdAsync"],
  ["strokeStyleId", "setStrokeStyleIdAsync"],
] as const;

export async function copyAttributes<NodeType extends SceneNode = SceneNode>(
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

  // replaces the deprecated `constrainProportions`
  if ("targetAspectRatio" in sourceNode && sourceNode.targetAspectRatio != null && "lockAspectRatio" in destinationNode) {
    try {
      destinationNode.lockAspectRatio();
    } catch {
      console.log("Repeat As List: cannot lock aspect ratio on destination");
    }
  }

  for (const [styleIdKey, setterKey] of styleIdSetters) {
    if (!(styleIdKey in sourceNode) || !(setterKey in destinationNode)) continue;
    const styleId = (sourceNode as any)[styleIdKey];
    // `figma.mixed` (a symbol) or "" means there is no single style to copy
    if (typeof styleId !== "string" || styleId === "") continue;
    try {
      await (destinationNode as any)[setterKey](styleId);
    } catch {
      console.log(`Repeat As List: cannot set ${styleIdKey} from source to destination`);
    }
  }
}
