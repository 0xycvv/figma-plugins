import { EventMessage } from './event';

// ----- Type Assertion ----- //
function isComponentNode(node: SceneNode): node is ComponentNode {
  return node.type === 'COMPONENT';
}

function isInstanceNode(node: SceneNode): node is InstanceNode {
  return node.type === 'INSTANCE';
}

// ----- Variables ----- //
let targetComponent: ComponentNode | undefined;

// only support selections on plugin started
const selectedComponents = figma.currentPage.selection.filter(
  isComponentNode,
);

function getAllInstancesBy(cb: (node: InstanceNode) => boolean) {
  return figma.root.findAll(isInstanceNode).filter(cb);
}
if (selectedComponents.length) {
  figma.showUI(__html__, {
    width: 360,
    height: 474,
  });
} else {
  figma.notify(
    'Oh no! Select at least two components and try again.',
  );
}

figma.ui.postMessage({
  type: EventMessage.UpdateList,
  components: selectedComponents.map((c) => ({
    id: c.id,
    name: c.name,
    count: getAllInstancesBy((node) => node.masterComponent === c)
      .length,
  })),
});

figma.ui.onmessage = (msg) => {
  if (msg.type === EventMessage.Cancel) {
    figma.closePlugin();
  }
  if (msg.type === EventMessage.Merge) {
    if (!selectedComponents || !targetComponent) {
      return;
    }
    figma.root
      .findAll(isInstanceNode)
      .forEach((instance: InstanceNode) => {
        if (targetComponent) {
          try {
            if (
              instance.masterComponent !== targetComponent &&
              selectedComponents.includes(instance.masterComponent)
            ) {
              instance.masterComponent = targetComponent;
            }
          } catch (error) {
            console.log(error);
          }
        }
      });
    selectedComponents
      .filter((c) => c.id !== targetComponent?.id)
      .forEach((notSelectedComponent) => {
        try {
          notSelectedComponent.remove();
        } catch (error) {
          console.log(error);
        }
      });
    if (targetComponent) {
      figma.notify(
        `Successfully merged! We kept ${targetComponent.name} and removed the others.`,
      );
    }
    figma.closePlugin();
  }

  if (msg.type === EventMessage.Select) {
    targetComponent = selectedComponents.find((c) => c.id === msg.id);
    if (targetComponent) {
      figma.currentPage.selection = [targetComponent];
      figma.viewport.scrollAndZoomIntoView([targetComponent]);
    }
  }
};
