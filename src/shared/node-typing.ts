export type NodeTypeId = "actor" | "capability" | "event" | "data";

export type NodeTypeColorToken = "amber" | "teal" | "rose" | "blue";

export interface ModelNodeTyping {
  typeId: NodeTypeId;
  colorToken: NodeTypeColorToken;
}

export interface NodeTypeDefinition {
  id: NodeTypeId;
  label: string;
  description: string;
  colorToken: NodeTypeColorToken;
  hexColor: string;
}

export const NODE_TYPE_DEFINITIONS: NodeTypeDefinition[] = [
  {
    id: "actor",
    label: "Actor",
    description: "External participant, role, or team.",
    colorToken: "amber",
    hexColor: "#F5C26B"
  },
  {
    id: "capability",
    label: "Capability",
    description: "Stable business or system ability.",
    colorToken: "teal",
    hexColor: "#5BC0BE"
  },
  {
    id: "event",
    label: "Event",
    description: "Something that happens and changes context.",
    colorToken: "rose",
    hexColor: "#F28482"
  },
  {
    id: "data",
    label: "Data",
    description: "Information object, record, or artifact.",
    colorToken: "blue",
    hexColor: "#8ECAE6"
  }
];

export function getNodeTypeDefinition(typeId: string): NodeTypeDefinition | undefined {
  return NODE_TYPE_DEFINITIONS.find((definition) => definition.id === typeId);
}
