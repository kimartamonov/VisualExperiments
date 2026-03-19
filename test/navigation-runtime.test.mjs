import assert from "node:assert/strict";

import {
  canNavigateBack,
  createNavigationState,
  dropNavigationTarget,
  getNavigationBreadcrumbs,
  navigateBack,
  navigateToBreadcrumb,
  openNavigationTarget,
  toNavigationTarget
} from "../dist/server/navigation.js";

function makeTarget(path, name) {
  return toNavigationTarget(path, name);
}

function testPushBackAndBreadcrumbs() {
  let state = createNavigationState();
  state = openNavigationTarget(state, makeTarget("models/main.yaml", "Main Map"), "reset");
  state = openNavigationTarget(state, makeTarget("models/detail.yaml", "Detail Map"), "push");
  state = openNavigationTarget(state, makeTarget("models/upper.yaml", "Upper Map"), "push");

  const breadcrumbs = getNavigationBreadcrumbs(state);

  assert.deepEqual(
    breadcrumbs.map((target) => target.modelPath),
    ["models/main.yaml", "models/detail.yaml", "models/upper.yaml"]
  );
  assert.equal(canNavigateBack(state), true);

  const backResult = navigateBack(state);

  assert.equal(backResult.target?.modelPath, "models/detail.yaml");
  assert.deepEqual(
    getNavigationBreadcrumbs(backResult.state).map((target) => target.modelPath),
    ["models/main.yaml", "models/detail.yaml"]
  );

  const breadcrumbResult = navigateToBreadcrumb(state, "models/main.yaml");

  assert.equal(breadcrumbResult.target?.modelPath, "models/main.yaml");
  assert.deepEqual(
    getNavigationBreadcrumbs(breadcrumbResult.state).map((target) => target.modelPath),
    ["models/main.yaml"]
  );
}

function testRefreshDoesNotDuplicateCurrentModel() {
  let state = createNavigationState();
  state = openNavigationTarget(state, makeTarget("models/main.yaml", "Main Map"), "reset");
  state = openNavigationTarget(state, makeTarget("models/detail.yaml", "Detail Map"), "push");
  state = openNavigationTarget(state, makeTarget("models/detail.yaml", "Detail Map Renamed"), "refresh");

  const breadcrumbs = getNavigationBreadcrumbs(state);

  assert.equal(breadcrumbs.length, 2);
  assert.equal(breadcrumbs[1]?.modelName, "Detail Map Renamed");
  assert.equal(canNavigateBack(state), true);
}

function testDropBrokenTargetKeepsRecoveryPath() {
  let state = createNavigationState();
  state = openNavigationTarget(state, makeTarget("models/main.yaml", "Main Map"), "reset");
  state = openNavigationTarget(state, makeTarget("models/detail.yaml", "Detail Map"), "push");
  state = openNavigationTarget(state, makeTarget("models/upper.yaml", "Upper Map"), "push");

  const dropped = dropNavigationTarget(state, "models/detail.yaml");

  assert.deepEqual(
    getNavigationBreadcrumbs(dropped).map((target) => target.modelPath),
    ["models/main.yaml", "models/upper.yaml"]
  );
  assert.equal(dropped.current?.modelPath, "models/upper.yaml");
}

const cases = [
  ["push/back/breadcrumb navigation keeps a reusable runtime path", testPushBackAndBreadcrumbs],
  ["refreshing the current model updates metadata without duplicating breadcrumbs", testRefreshDoesNotDuplicateCurrentModel],
  ["dropping a broken target keeps a valid recovery path in memory", testDropBrokenTargetKeepsRecoveryPath]
];

for (const [name, run] of cases) {
  try {
    run();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}
