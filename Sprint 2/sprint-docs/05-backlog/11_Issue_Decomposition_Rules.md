# 11. Issue Decomposition Rules

## Inputs For Sprint 2 Issue Generation

The issue backlog for Sprint 2 must be generated from these documents first:

- `03_Change_Register.md`
- `04_Current_State_Baseline.md`
- `05_Impact_and_Dependency_Map.md`
- `06_Target_Behavior_Spec.md`
- `08_Decisions_Open_Questions_and_Deferments.md`
- `09_Validation_and_Regression_Plan.md`
- `10_Sprint_Slice_and_Sequence.md`

## Issue Types Allowed

- `Implementation`
- `Validation`
- `Fix`

Sprint 2 does not need a separate decision issue in the initial backlog because the planning assumptions are already sufficient to proceed.

## Required Issue Fields

Each issue must contain:

- `Issue ID`
- `Type`
- `Status`
- `Sprint Slice`
- `Change IDs`
- `Priority`
- `Depends On`
- `Goal`
- `Scope`
- `Out of Scope`
- `Affected Areas`
- `Acceptance`
- `Required Checks`
- `Handoff`

## Naming Rules

- Sprint 2 issue IDs must use the prefix `S2-`.
- Title should start with a verb and describe the user-visible outcome.
- Example:
  - `S2-03 Compact workspace context and maximize canvas`

## Granularity Rules

### Rule G1. One issue should produce one demonstrable outcome

Good:

- "separate browser and workspace screens"

Bad:

- "refactor the whole app shell, all panel styles, and all graph interactions"

### Rule G2. Separate layout work from graph-interaction work

Reason:

- layout issues and pointer-interaction issues carry different regression risks and should be validated separately.

### Rule G3. Split when schema changes unlock later behavior

Example:

- frame geometry should be stabilized before collision rules depend on it.

### Rule G4. Do not create micro-issues for incidental CSS cleanup

Reason:

- desktop polish should be grouped into a purposeful finish pass unless it blocks another issue directly.

## Dependency Rules

- A later issue may not redefine the contract of an earlier completed issue without an explicit blocker.
- Validation issue must depend on all implementation issues it validates.
- Fix issue must depend on the validation issue that produces the blocker list.

## Definition Of Ready

An issue is ready when:

- its linked `Change IDs` are already accepted;
- required assumptions are listed in `08_Decisions_Open_Questions_and_Deferments.md`;
- the issue has explicit scope and non-scope;
- the required checks are named clearly enough to run after implementation.

## Definition Of Done

An issue is done when:

1. Its target behavior is demonstrably implemented.
2. Its required checks pass.
3. No critical or high regression remains in the impacted baseline behaviors.
4. The next dependent issue can start without reopening hidden product decisions.

## Traceability Rule

No Sprint 2 issue may exist without at least one linked `Change ID`.

Conversely:

- every `Accepted` change item must be covered by one or more Sprint 2 issues;
- if one change item spans multiple issues, the split must be visible in `13_Traceability_Matrix.md`.
