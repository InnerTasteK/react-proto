import setSelectableParents from './setSelectableParents.util';
import setSelectableRoutes from './setSelectableRoutes.utils';
import getColor from './colors.util';

const initialComponentState = {
  id: null,
  stateful: false,
  router: false,
  routes: [],
  title: '',
  parentId: '',
  color: getColor(),
  draggable: true,
  childrenIds: [],
  selectableParents: [],
  selectableRoutes: [],
  expanded: true,
  props: [],
  nextPropId: 0,
  position: {
    x: 110,
    y: 120,
    width: 50,
    height: 50,
  },
  route: false,
  visible: true,
};

export const addComponent = (state, { title }) => {
  const strippedTitle = title
    .replace(/[a-z]+/gi,
      word => word[0].toUpperCase() + word.slice(1))
    .replace(/[-_\s0-9\W]+/gi, '');
  const newComponent = {
    ...initialComponentState,
    title: strippedTitle,
    id: state.nextId.toString(),
    color: getColor(),
  };

  const components = [
    ...state.components,
    newComponent,
  ];

  const totalComponents = state.totalComponents + 1;
  const nextId = state.nextId + 1;

  return {
    ...state,
    totalComponents,
    nextId,
    components,
    focusComponent: newComponent,
  };
};

export const updateComponent = ((state, {
  id, newParentId = null, color = null, stateful = null, props = null, router = null,
}) => {
  let component;
  const components = state.components.map((comp) => {
    if (comp.id === id) {
      component = { ...comp };
      if (newParentId === 'null') {
        component.parentId = '';
      } else if (newParentId) {
        component.parentId = newParentId;
      }
      if (props) {
        component.props = props;
        component.nextPropId += 1;
      }
      component.color = color || component.color;
      component.stateful = stateful === null ? component.stateful : stateful;
      component.router = router === null ? component.router : router;
      return component;
    }
    return comp;
  });

  return {
    ...state,
    components,
    focusComponent: component,
  };
});

// Delete component with the index for now, but will be adjusted to use id
export const deleteComponent = (state, { index, id }) => {
  const { focusComponent } = state;
  const components = [
    ...state.components.slice(0, index),
    ...state.components.slice(index + 1),
  ];

  const totalComponents = state.totalComponents - 1;

  return {
    ...state,
    totalComponents,
    components,
    focusComponent: focusComponent.id === id ? {} : focusComponent,
  };
};

export const addChild = ((state, { id, childId }) => {
  const components = state.components.map((component) => {
    if (component.id === id) {
      const { childrenIds } = component;
      return { ...component, childrenIds: [...childrenIds, childId] };
    }
    return component;
  });

  return {
    ...state,
    components,
  };
});

export const deleteChild = ((state, { parent, childId }) => {
  const components = state.components.map((component) => {
    if (component.id === parent.id) {
      // Find child with matching id and remove from children
      const childrenIds = component.childrenIds.filter(id => id !== childId);
      return { ...component, childrenIds };
    }
    return component;
  });

  return {
    ...state,
    components,
  };
});

/**
 * Moves component to the end of the components effectively giving it the highest z-index
 * @param {object} state - The current state of the application
 * @param {string} componentId - The id of the component that is to be moved
 */

export const moveToTop = (state, componentId) => {
  const components = state.components.concat();
  const index = components.findIndex(component => component.id === componentId);
  const removedComponent = components.splice(index, 1);
  components.push(removedComponent[0]);

  return {
    ...state,
    components,
  };
};

/**
 * Updates the current image path with the newly provided path
 * @param {object} state - The current state of the application
 * @param {string} imagePath - The new path for the updated image
 */

export const changeImagePath = (state, imagePath) => ({
  ...state,
  imagePath,
});

export const reassignParent = ((state, { index, parent = {} }) => {
  // Get all childrenIds of the component to be deleted
  const { childrenIds } = state.components[index];
  const components = state.components.map((comp) => {
    // Give each child their previous parent's parent
    if (childrenIds.includes(comp.id)) {
      return { ...comp, parentId: parent.id || '' };
    }
    // Give the parent all children of it's to be deleted child
    if (parent.id === comp.id) {
      const prevChildrenIds = comp.childrenIds;
      return { ...comp, childrenIds: [...new Set(prevChildrenIds.concat(childrenIds))] };
    }
    return comp;
  });

  return {
    ...state,
    components,
  };
});

export const setSelectableP = (state => ({
  ...state,
  components: setSelectableParents(state.components),
}));

export const setSelectableR = ((state, id) => ({
  ...state,
  components: setSelectableRoutes(state.components, id),
}));

export const addRoute = (state, {
  path,
  routerCompId,
  routeCompId,
}) => ({
  ...state,
  components: state.components.map((comp) => {
    if (comp.id === routerCompId) {
      const newRoute = { path, routeCompId };
      comp.selectableRoutes.forEach((route) => {
        if (route.id === routeCompId) {
          newRoute.routeCompTitle = route.title;
          newRoute.color = route.color;
        }
      });
      comp.routes = [...comp.routes, newRoute];
      return { ...comp };
    }
    if (comp.id === routeCompId) return { ...comp, route: true };
    return comp;
  }),
});

export const deleteRoute = (state, { routerCompId, routeCompId }) => ({
  ...state,
  components: state.components.map((comp) => {
    if (comp.id === routerCompId) {
      const routes = [...comp.routes];
      let indexOfRouteToDelete;
      routes.forEach((route, i) => {
        if (route.routeCompId === routeCompId) indexOfRouteToDelete = i;
      });
      routes.splice(indexOfRouteToDelete, 1);
      comp.routes = routes;
      return { ...comp };
    }
    if (comp.id === routeCompId) return { ...comp, route: false, visible: true };
    return comp;
  }),
});

export const exportFilesSuccess = ((state, { status, dir }) => ({
  ...state,
  successOpen: status,
  appDir: dir,
  loading: false,
}));

export const exportFilesError = ((state, { status, err }) => ({
  ...state,
  errorOpen: status,
  appDir: err,
  loading: false,
}));

export const handleClose = ((state, status) => ({
  ...state,
  errorOpen: status,
  successOpen: status,
}));

export const updatePosition = (state, { id, x, y }) => {
  const components = state.components.map((component) => {
    if (component.id === id) {
      return {
        ...component,
        position: {
          x,
          y,
          width: component.position.width,
          height: component.position.height,
        },
      };
    }
    return component;
  });
  return {
    ...state,
    components,
  };
};

/**
 * Applies the new x and y coordinates, as well as, the new width
 * and height the of components to the component with the provided id.
 * The transformation is calculated on component drags, as well as, whe the
 * component is resized
 * @param {object} state - The current state of the application
 * @param {object} transform - Object containing new transformation
 * @param {string} id - id of the component we want to apply the transformation to
 * @param {number} x - updated x coordinate
 * @param {number} y - updated y coordinate
 * @param {number} width - updated width
 * @param {number} height - updated height
 */

export const handleTransform = (state, {
  id, x, y, width, height,
}) => {
  const components = state.components.map((component) => {
    if (component.id === id) {
      return {
        ...component,
        position: {
          x,
          y,
          width,
          height,
        },
      };
    }
    return component;
  });
  return {
    ...state,
    components,
  };
};

/**
 * Toggles the drag of the group, as well as all components. If the group is draggable the
 * rectangles need to be undraggable so the user can drag the group from anywhere
 * @param {object} state - The current state of the application
 * @param {boolean} status - The boolean value to apply to all draggable components
 */

export const toggleDragging = (state, status) => {
  const components = state.components.map(component => ({
    ...component,
    draggable: status,
  }));
  return {
    ...state,
    components,
  };
};

/**
 * Moves component to the front of the components effectively giving it the lowest z-index
 * @param {object} state - The current state of the application
 * @param {string} componentId - The id of the component that is to be moved
 */

export const moveToBottom = (state, componentId) => {
  const components = state.components.concat();
  const index = components.findIndex(component => component.id === componentId);
  const removedComponent = components.splice(index, 1);
  components.unshift(removedComponent[0]);

  return {
    ...state,
    components,
  };
};

/**
 * Selects a component and sets it as the focusComponent. The focus component is used to
 * sync up expanding the panel, adding the transformer, and showing the components
 * corresponding props.
 * @param {object} state - The current state of the application
 * @param {object} component - The component we want to assign as the currently focused component
 */

export const openExpansionPanel = (state, { component }) => ({
  ...state,
  focusComponent: component,
});

export const addProp = (state, {
  key,
  value = null,
  required,
  type,
}) => {
  const { props, nextPropId, id } = state.focusComponent;
  const newProp = {
    id: nextPropId.toString(),
    key,
    value: value || key,
    required,
    type,
  };
  const newProps = [...props, newProp];
  return updateComponent(state, { id, props: newProps });
};

export const deleteProp = (state, { index }) => {
  const { props, id } = state.focusComponent;
  const newProps = [...props.slice(0, index), ...props.slice(index + 1)];
  return updateComponent(state, { id, props: newProps });
};

export const setVisible = (state, compId) => ({
  ...state,
  components: state.components.map((comp) => {
    if (comp.parentId === compId) setVisible(state, comp.id);
    if (comp.id === compId) {
      comp.visible = !comp.visible;
      return { ...comp };
    }
    return comp;
  }),
});
