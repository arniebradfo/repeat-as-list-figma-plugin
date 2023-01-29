import {
  formatErrorMessage,
  formatSuccessMessage,
  insertBeforeNode,
} from "@create-figma-plugin/utilities";

import { createComponent } from "./create-component-from-node/utilities/create-component";

figma.on("run", (event: RunEvent) => {
  console.log(figma.currentPage.selection[0]);

  const nodes = figma.currentPage.selection;

  if (nodes.length === 0) {
    figma.closePlugin(formatErrorMessage("Select one or more layers"));
    return;
  }

  const node = nodes[0];
  const component = node.type === "COMPONENT" ? node : createComponent(node);
  // if (isWithinInstanceNode(node) === false) {
  const instance = component.createInstance();
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

  if (node.type !== "COMPONENT") {
    node.remove();
  }
  // }

  figma.currentPage.selection = [instance];

  // wish we could know the os type to provide the correct quick key suggestion
  // const isMacOS = window.navigator.userAgentData.platform == 'macOS';

  figma.closePlugin(
    formatSuccessMessage(
      "Created a repeat list. Mash ⌘D Duplicate to fill the list (ctrl+D Windows)"
    )
  );
});
