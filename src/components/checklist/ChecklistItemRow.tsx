"use client";

import { useState } from "react";
import Link from "next/link";
import { ChecklistItem } from "@/types/checklist";

interface ChecklistItemRowProps {
  item: ChecklistItem;
  note: string;
  onToggle: (id: string) => void;
  onNoteChange: (id: string, note: string) => void;
}

export default function ChecklistItemRow({
  item,
  note,
  onToggle,
  onNoteChange,
}: ChecklistItemRowProps) {
  const [showNote, setShowNote] = useState(!!note);
  const [localNote, setLocalNote] = useState(note);

  function handleNoteBlur() {
    const trimmed = localNote.trim();
    onNoteChange(item.id, trimmed);
    if (!trimmed) setShowNote(false);
  }

  return (
    <li className="rounded-lg border border-border bg-surface">
      <div className="flex items-start gap-3 p-4">
        <input
          type="checkbox"
          id={item.id}
          checked={item.completed}
          onChange={() => onToggle(item.id)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary-600 cursor-pointer"
          aria-label={item.title}
        />
        <label htmlFor={item.id} className="flex-1 cursor-pointer">
          <span
            className={`block text-sm font-medium ${
              item.completed ? "text-muted line-through" : "text-foreground"
            }`}
          >
            {item.title}
            {!item.required && (
              <span className="ml-2 text-xs font-normal text-muted">
                (opcional)
              </span>
            )}
          </span>
          {item.description && (
            <span className="mt-0.5 block text-xs text-muted">
              {item.description}
            </span>
          )}
        </label>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setShowNote((v) => !v)}
            className="text-xs text-muted hover:text-primary-500 dark:text-body dark:hover:text-primary-400"
            aria-label={showNote ? "Ocultar nota" : "Adicionar nota"}
            title={note ? note : "Adicionar nota"}
          >
            {note ? "📝" : "+ nota"}
          </button>
          {item.relatedGuideSlug && (
            <Link
              href={`/guias/${item.relatedGuideSlug}`}
              className="shrink-0 text-xs text-primary-500 hover:text-primary-700 hover:underline dark:text-primary-400 dark:hover:text-primary-300"
            >
              Ver guia
            </Link>
          )}
        </div>
      </div>
      {showNote && (
        <div className="border-t border-border/50 px-4 pb-3 dark:border-border">
          <textarea
            value={localNote}
            onChange={(e) => setLocalNote(e.target.value)}
            onBlur={handleNoteBlur}
            placeholder="Sua nota pessoal sobre este documento..."
            rows={2}
            className="mt-2 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs text-body placeholder-muted focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300 dark:bg-slate-800 dark:placeholder-muted dark:focus:border-primary-600"
            aria-label={`Nota para ${item.title}`}
          />
          <p className="mt-1 text-xs text-muted">
            Nota salva localmente. Não aparece no link compartilhado.
          </p>
        </div>
      )}
    </li>
  );
}
