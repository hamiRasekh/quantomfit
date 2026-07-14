import type { Attribute } from '@/features/attributes/types';
import { attributeValuesApi } from '@/features/attribute-values/api/attributeValuesApi';

const NUMERIC_PATTERN = /^[-+]?\d+(\.\d+)?$/;

export type MaterialAttributeSlot = {
  attributeId: string;
  value: string;
};

export function createEmptyAttributeSlots(count = 3): MaterialAttributeSlot[] {
  return Array.from({ length: count }, () => ({ attributeId: '', value: '' }));
}

export function validateAttributeSlots(
  slots: MaterialAttributeSlot[],
  attributesById: Map<string, Attribute>
): string | null {
  const used = new Set<string>();

  for (let index = 0; index < slots.length; index += 1) {
    const slot = slots[index];
    const isFirst = index === 0;
    const hasAttribute = Boolean(slot.attributeId);
    const hasValue = Boolean(slot.value.trim());

    if (isFirst && (!hasAttribute || !hasValue)) {
      return 'ویژگی ۱ و مقدار آن الزامی است';
    }

    if (!isFirst && hasAttribute !== hasValue) {
      return `برای ویژگی ${index + 1}، انتخاب ویژگی و مقدار باید با هم تکمیل شوند`;
    }

    if (!hasAttribute) continue;

    if (used.has(slot.attributeId)) {
      return 'هر ویژگی فقط یک‌بار قابل انتخاب است';
    }
    used.add(slot.attributeId);

    const attribute = attributesById.get(slot.attributeId);
    if (!attribute) {
      return 'ویژگی انتخاب‌شده معتبر نیست';
    }

    if (attribute.type === 'number' && !NUMERIC_PATTERN.test(slot.value.trim())) {
      return `مقدار «${attribute.name}» باید عددی باشد`;
    }
  }

  return null;
}

export async function resolveAttributeSlotsToValueIds(
  slots: MaterialAttributeSlot[],
  attributesById: Map<string, Attribute>
): Promise<string[]> {
  const ids: string[] = [];

  for (const slot of slots) {
    if (!slot.attributeId || !slot.value.trim()) continue;

    const attribute = attributesById.get(slot.attributeId);
    if (!attribute) continue;

    const trimmed = slot.value.trim();

    if (attribute.type === 'number') {
      const existing = (attribute.values || []).find((v) => v.isActive && v.value === trimmed);
      if (existing) {
        ids.push(existing.id);
        continue;
      }
      const created = await attributeValuesApi.createForAttribute(attribute.id, {
        value: trimmed,
        isActive: true,
      });
      ids.push(created.id);
      continue;
    }

    const matched = (attribute.values || []).find((v) => v.isActive && v.id === trimmed);
    if (matched) {
      ids.push(matched.id);
      continue;
    }

    const byLabel = (attribute.values || []).find((v) => v.isActive && v.value === trimmed);
    if (byLabel) {
      ids.push(byLabel.id);
      continue;
    }

    const created = await attributeValuesApi.createForAttribute(attribute.id, {
      value: trimmed,
      isActive: true,
    });
    ids.push(created.id);
  }

  return Array.from(new Set(ids));
}

export function slotsFromRawMaterialAttributes(
  attributes: Attribute[],
  rawValues: Array<{
    attributeValueId: string;
    attributeValue?: {
      attributeId?: string;
      value?: string;
      attribute?: { id?: string; type?: 'select' | 'number' };
    };
  }>
): MaterialAttributeSlot[] {
  const slots: MaterialAttributeSlot[] = [];
  const attrOrder = attributes.map((a) => a.id);

  const entries = rawValues
    .map((row) => {
      const attrId = row.attributeValue?.attribute?.id || row.attributeValue?.attributeId;
      const value =
        row.attributeValue?.attribute?.type === 'number'
          ? row.attributeValue?.value || ''
          : row.attributeValueId;
      return attrId ? { attrId, value: value || '' } : null;
    })
    .filter((item): item is { attrId: string; value: string } => Boolean(item));

  entries.sort((a, b) => attrOrder.indexOf(a.attrId) - attrOrder.indexOf(b.attrId));

  const valueByAttribute = new Map(entries.map((entry) => [entry.attrId, entry.value]));
  attributes.forEach((attribute) => {
    slots.push({
      attributeId: attribute.id,
      value: valueByAttribute.get(attribute.id) ?? '',
    });
  });

  return slots;
}
