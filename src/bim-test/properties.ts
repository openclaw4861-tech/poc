import type * as FRAGS from "@thatopen/fragments";
import type { PropertyRow, SelectedElementInfo } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isItemAttribute(value: unknown): value is FRAGS.ItemAttribute {
  return isRecord(value) && "value" in value && !Array.isArray(value.value);
}

function isItemDataArray(value: unknown): value is FRAGS.ItemData[] {
  return Array.isArray(value);
}

function attributeUnknown(data: FRAGS.ItemData, key: string): unknown {
  const raw = data[key];
  if (!raw || isItemDataArray(raw) || !isItemAttribute(raw)) {
    return undefined;
  }
  return raw.value as unknown;
}

export function attributeAsString(data: FRAGS.ItemData, key: string): string {
  const value = attributeUnknown(data, key);
  if (value === undefined || value === null) {
    return "";
  }
  return String(value);
}

export function attributeAsNumber(data: FRAGS.ItemData, key: string): number | null {
  const value = attributeUnknown(data, key);
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function relatedItems(data: FRAGS.ItemData, key: string): FRAGS.ItemData[] {
  const raw = data[key];
  return isItemDataArray(raw) ? raw : [];
}

function propertyValue(item: FRAGS.ItemData): string {
  const nominal = attributeUnknown(item, "NominalValue");
  if (nominal !== undefined && nominal !== null) {
    return String(nominal);
  }
  const value = attributeUnknown(item, "Value");
  if (value !== undefined && value !== null) {
    return String(value);
  }
  return "";
}

function isHighlightedProperty(psetName: string, name: string): boolean {
  if (name.toLowerCase() === "manufacturer") {
    return true;
  }
  return (
    psetName === "Pset_BuildingElementProxyCommon" &&
    name.toLowerCase() === "reference"
  );
}

export function extractPropertyRows(data: FRAGS.ItemData): PropertyRow[] {
  const rows: PropertyRow[] = [];
  const psets = relatedItems(data, "IsDefinedBy");
  for (const pset of psets) {
    const psetName = attributeAsString(pset, "Name") || "Unnamed pset";
    const props = [
      ...relatedItems(pset, "HasProperties"),
      ...relatedItems(pset, "HasPropertyTemplates"),
    ];
    if (props.length === 0) {
      for (const [key, value] of Object.entries(pset)) {
        if (key === "Name" || key === "GlobalId" || isItemDataArray(value)) {
          continue;
        }
        if (isItemAttribute(value)) {
          const name = key;
          const display = value.value === undefined || value.value === null
            ? ""
            : String(value.value as unknown);
          rows.push({
            psetName,
            name,
            value: display,
            highlight: isHighlightedProperty(psetName, name),
          });
        }
      }
      continue;
    }
    for (const prop of props) {
      const name = attributeAsString(prop, "Name") || "Unnamed";
      rows.push({
        psetName,
        name,
        value: propertyValue(prop),
        highlight: isHighlightedProperty(psetName, name),
      });
    }
  }
  return rows;
}

export function findPropertyValue(
  rows: PropertyRow[],
  name: string,
  psetName?: string,
): string {
  const needle = name.toLowerCase();
  const match = rows.find((row) => {
    if (row.name.toLowerCase() !== needle) {
      return false;
    }
    if (psetName && row.psetName !== psetName) {
      return false;
    }
    return true;
  });
  return match?.value ?? "";
}

export function parseSelectedElement(
  modelId: string,
  localId: number,
  data: FRAGS.ItemData,
): SelectedElementInfo {
  const expressFromAttr =
    attributeAsNumber(data, "expressID") ??
    attributeAsNumber(data, "ExpressID") ??
    attributeAsNumber(data, "_localId");
  const entityType =
    attributeAsString(data, "_category") ||
    attributeAsString(data, "category") ||
    attributeAsString(data, "Category") ||
    "Unknown";
  return {
    modelId,
    localId,
    expressId: expressFromAttr ?? localId,
    entityType,
    globalId:
      attributeAsString(data, "GlobalId") ||
      attributeAsString(data, "_guid") ||
      "",
    name: attributeAsString(data, "Name"),
    properties: extractPropertyRows(data),
  };
}

export const ITEM_DATA_CONFIG: Partial<FRAGS.ItemsDataConfig> = {
  attributesDefault: true,
  relations: {
    IsDefinedBy: { attributes: true, relations: true },
    DefinesOccurrence: { attributes: false, relations: false },
  },
};
