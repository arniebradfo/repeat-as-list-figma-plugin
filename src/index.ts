import {
  formatErrorMessage,
  formatSuccessMessage,
  insertBeforeNode,
  isWithinInstanceNode,
} from "@create-figma-plugin/utilities";

import { createComponent } from "./create-component-from-node/utilities/create-component";
import { frameNodes } from "./frame-nodes";

figma.on("run", (event: RunEvent) => {
  // console.log(figma.currentPage.selection[0]);

  const nodes = figma.currentPage.selection;

  if (nodes.length === 0) {
    figma.closePlugin(
      formatErrorMessage("Select one or more layers to repeat")
    );
    return;
  }

  for (let index = 0; index < nodes.length; index++) {
    const testNode = nodes[index];

    const hasSiblingComponent =
      nodes.length > 1 &&
      (testNode.type === "COMPONENT" || testNode.type === "COMPONENT_SET");

    const childComponents =
      "children" in testNode
        ? testNode.findAllWithCriteria({
            types: ["COMPONENT", "COMPONENT_SET"],
          })
        : [];

    const selectionContainsOriginalComponents =
      childComponents.length > 0 || hasSiblingComponent;

    if (selectionContainsOriginalComponents) {
      figma.closePlugin(
        formatErrorMessage(
          "Cannot repeat an Original Component (unless it is the only layer selected)"
        )
      );
      return;
    }

    if (isWithinInstanceNode(testNode)) {
      figma.closePlugin(
        formatErrorMessage("Cannot repeat layers inside of Component Instances")
      );
      return;
    }
  }

  const node = nodes.length === 1 ? nodes[0] : frameNodes([...nodes]);

  if (node == null) {
    figma.closePlugin(
      formatErrorMessage(
        "Issue framing multiple layers. Please frame these layers manually."
      )
    );
    return;
  }

  const nodeIsComponentOrInstance = node.type === "COMPONENT" || node.type === "INSTANCE"

  // OR maybe instead of using an instance, we break the instance and make a new component?
  const component = nodeIsComponentOrInstance ? node : createComponent(node);
  const instance = component.type === "INSTANCE" ? component.mainComponent!.createInstance() : component.createInstance();
  const listFrame = figma.createFrame();
  
  insertBeforeNode(instance, node);
  insertBeforeNode(listFrame, node);

  listFrame.fills = [];
  listFrame.name = component.name + " RepeatList";
  listFrame.x = node.x;
  listFrame.y = node.y;
  listFrame.layoutMode = "VERTICAL";
  listFrame.itemSpacing = 8;
  listFrame.primaryAxisSizingMode = "AUTO";
  listFrame.counterAxisSizingMode = "AUTO";

  listFrame.insertChild(0, instance);
  listFrame.insertChild(0, component);

  if (!nodeIsComponentOrInstance) {
    node.remove();
  }

  figma.currentPage.selection = [instance];

  // wish we could know the os type to provide the correct quick key suggestion
  // const isMacOS = window.navigator.userAgentData.platform == 'macOS';

  figma.closePlugin(
    formatSuccessMessage(
      "Created a repeat list. Mash ⌘D Duplicate to fill the list (ctrl+D Windows)"
    )
  );
});
