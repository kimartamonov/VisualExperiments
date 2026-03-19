export interface NavigationTarget {
  modelPath: string;
  modelName: string;
}

export interface NavigationState {
  stack: NavigationTarget[];
  current: NavigationTarget | null;
}

export type NavigationOpenMode = "push" | "reset" | "refresh";

export interface NavigationResult {
  state: NavigationState;
  target: NavigationTarget | null;
}

export function createNavigationState(): NavigationState {
  return {
    stack: [],
    current: null
  };
}

export function toNavigationTarget(modelPath: string, modelName: string): NavigationTarget {
  return {
    modelPath,
    modelName
  };
}

export function openNavigationTarget(
  state: NavigationState,
  target: NavigationTarget,
  mode: NavigationOpenMode
): NavigationState {
  if (mode === "reset") {
    return {
      stack: [],
      current: target
    };
  }

  if (!state.current) {
    return {
      stack: [],
      current: target
    };
  }

  if (state.current.modelPath === target.modelPath) {
    return {
      ...state,
      current: target
    };
  }

  if (mode === "refresh") {
    return {
      ...state,
      current: target
    };
  }

  return {
    stack: [...state.stack, state.current],
    current: target
  };
}

export function canNavigateBack(state: NavigationState): boolean {
  return state.stack.length > 0;
}

export function getNavigationBreadcrumbs(state: NavigationState): NavigationTarget[] {
  return state.current ? [...state.stack, state.current] : [];
}

export function navigateBack(state: NavigationState): NavigationResult {
  if (state.stack.length === 0) {
    return {
      state,
      target: null
    };
  }

  const target = state.stack[state.stack.length - 1] ?? null;

  return {
    state: {
      stack: state.stack.slice(0, -1),
      current: target
    },
    target
  };
}

export function navigateToBreadcrumb(state: NavigationState, modelPath: string): NavigationResult {
  const breadcrumbs = getNavigationBreadcrumbs(state);
  const targetIndex = breadcrumbs.findIndex((target) => target.modelPath === modelPath);

  if (targetIndex === -1) {
    return {
      state,
      target: null
    };
  }

  const target = breadcrumbs[targetIndex] ?? null;

  return {
    state: {
      stack: breadcrumbs.slice(0, targetIndex),
      current: target
    },
    target
  };
}

export function dropNavigationTarget(state: NavigationState, modelPath: string): NavigationState {
  const nextStack = state.stack.filter((target) => target.modelPath !== modelPath);

  if (state.current?.modelPath === modelPath) {
    const fallbackTarget = nextStack[nextStack.length - 1] ?? null;

    return {
      stack: fallbackTarget ? nextStack.slice(0, -1) : [],
      current: fallbackTarget
    };
  }

  return {
    ...state,
    stack: nextStack
  };
}
