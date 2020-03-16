import { EventMessage } from './event';

let listElm = document.getElementById('list');
let mergeBtn = document.getElementById('merge') as HTMLButtonElement;
let cancelBtn = document.getElementById('cancel');

let totalComponents = 0;

if (mergeBtn) {
  mergeBtn.onclick = () => {
    parent.postMessage(
      { pluginMessage: { type: EventMessage.Merge } },
      '*',
    );
  };
}

if (cancelBtn) {
  cancelBtn.onclick = () => {
    parent.postMessage(
      { pluginMessage: { type: EventMessage.Cancel } },
      '*',
    );
  };
}

function handleUpdateList(
  components: { id: string; name: string; count: number }[],
) {
  totalComponents = components.length;
  components.forEach(component => {
    const itemElem = document.createElement('li');
    const nameElem = document.createElement('div');
    const countElem = document.createElement('div');

    itemElem.classList.add('item');
    itemElem.id = component.id;
    itemElem.appendChild(nameElem);
    itemElem.appendChild(countElem);
    itemElem.addEventListener('click', event => {
      let target = event.target as HTMLElement;
      if (target.matches('.item')) {
        listElm?.childNodes.forEach((child: HTMLLIElement) => {
          child.classList.remove('selected');
        });
        if (totalComponents > 1) {
          mergeBtn.disabled = false;
        }
        itemElem.classList.add('selected');
        parent.postMessage(
          {
            pluginMessage: {
              type: EventMessage.Select,
              id: target.id,
            },
          },
          '*',
        );
      }
    });

    nameElem.className = 'name pointer-none';
    nameElem.textContent = component.name;
    countElem.className = 'count pointer-none';
    if (Number.isInteger(component.count)) {
      countElem.textContent = `${component.count} instances`;
    }
    if (listElm) {
      listElm.appendChild(itemElem);
    }
  });
}

window.onmessage = event => {
  let msg = event.data && event.data.pluginMessage;
  if (msg.type === EventMessage.UpdateList) {
    handleUpdateList(msg.components);
  }
};
