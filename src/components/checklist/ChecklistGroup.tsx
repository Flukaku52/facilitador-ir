'use client';

import { ChecklistItem, ChecklistCategory, CATEGORY_LABELS } from '@/types/checklist';
import ChecklistItemRow from './ChecklistItemRow';

interface ChecklistGroupProps {
  category: ChecklistCategory;
  items: ChecklistItem[];
  notes: Record<string, string>;
  onToggle: (id: string) => void;
  onNoteChange: (id: string, note: string) => void;
}

export default function ChecklistGroup({ category, items, notes, onToggle, onNoteChange }: ChecklistGroupProps) {
  if (items.length === 0) return null;
  const done = items.filter((i) => i.completed).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {CATEGORY_LABELS[category]}
        </h3>
        <span className="text-sm text-gray-400 dark:text-gray-600">
          {done}/{items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            note={notes[item.id] ?? ''}
            onToggle={onToggle}
            onNoteChange={onNoteChange}
          />
        ))}
      </ul>
    </div>
  );
}
