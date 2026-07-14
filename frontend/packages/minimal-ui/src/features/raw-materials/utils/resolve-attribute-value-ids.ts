import { attributeValuesApi } from '@/features/attribute-values/api/attributeValuesApi';
import type { Attribute } from '@/features/attributes/types';

const NUMERIC_PATTERN = /^[-+]?\d+(\.\d+)?$/;

export async function resolveRawMaterialAttributeValueIds(
  attributes: Attribute[],
  selectedByAttr: Record<string, string[]>,
  numericByAttr: Record<string, string>
): Promise<string[]> {
  const ids: string[] = [];

  for (const attr of attributes) {
    if (attr.type === 'number') {
      const raw = (numericByAttr[attr.id] ?? '').trim();
      if (!raw) continue;

      if (!NUMERIC_PATTERN.test(raw)) {
        throw new Error(`مقدار «${attr.name}» باید عددی باشد`);
      }

      const existing = (attr.values || []).find((v) => v.isActive && v.value === raw);
      if (existing) {
        ids.push(existing.id);
        continue;
      }

      const created = await attributeValuesApi.createForAttribute(attr.id, {
        value: raw,
        isActive: true,
      });
      ids.push(created.id);
      continue;
    }

    ids.push(...(selectedByAttr[attr.id] || []).filter(Boolean));
  }

  return Array.from(new Set(ids));
}
