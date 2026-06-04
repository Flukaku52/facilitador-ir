'use client';

import Link from 'next/link';
import { ChecklistItem } from '@/types/checklist';

interface ChecklistItemRowProps {
  item: ChecklistItem;
  onToggle: (id: string) => void;
}

export default function ChecklistItemRow({ item, onToggle }: ChecklistItemRowProps) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <input
        type="checkbox"
        id={item.id}
        checked={item.completed}
        onChange={() => onToggle(item.id)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded accent-indigo-600 cursor-pointer"
        aria-label={item.title}
      />
      <label htmlFor={item.id} className="flex-1 cursor-pointer">
        <span
          className={`block text-sm font-medium ${
            item.completed ? 'text-gray-400 line-through' : 'text-gray-800'
          }`}
        >
          {item.title}
          {!item.required && (
            <span className="ml-2 text-xs font-normal text-gray-400">(opcional)</span>
          )}
        </span>
        {item.description && (
          <span className="mt-0.5 block text-xs text-gray-500">{item.description}</span>
        )}
      </label>
      {item.relatedGuideSlug && (
        <Link
          href={`/guias/${item.relatedGuideSlug}`}
          className="shrink-0 text-xs text-indigo-500 hover:text-indigo-700 hover:underline"
        >
          Ver guia
        </Link>
      )}
    </li>
  );
}
