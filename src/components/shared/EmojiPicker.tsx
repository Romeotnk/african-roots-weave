import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const EMOJI_CATEGORIES: { labelKey: string; emojis: string[] }[] = [
  {
    labelKey: "emojiPicker.categorySmileys",
    emojis: ["😀", "😁", "😂", "🤣", "😊", "😍", "😘", "😜", "🤔", "😎", "🥳", "😴", "😭", "😡", "😱", "🥰"],
  },
  {
    labelKey: "emojiPicker.categoryGestures",
    emojis: ["👍", "👎", "👏", "🙏", "🤝", "💪", "✌️", "🤞", "👋", "🙌", "🤷", "🫶"],
  },
  {
    labelKey: "emojiPicker.categoryHearts",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💔", "💯", "✨"],
  },
  {
    labelKey: "emojiPicker.categoryObjects",
    emojis: ["🌿", "🌱", "🍃", "🔥", "⭐", "🎉", "📦", "💰", "✅", "❌", "⏰", "📌"],
  },
];

export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export function EmojiPicker({
  trigger,
  onSelect,
  emojis,
}: {
  trigger: React.ReactNode;
  onSelect: (emoji: string) => void;
  /** When provided, renders a flat grid of just these emojis (e.g. quick reactions) instead of the full categorized picker. */
  emojis?: string[];
}) {
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        {emojis ? (
          <div className="flex flex-wrap gap-1">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onSelect(emoji)}
                className="grid h-9 w-9 place-items-center rounded-full text-[20px] transition hover:bg-[var(--brand-surface-alt)]"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {EMOJI_CATEGORIES.map((category) => (
              <div key={category.labelKey}>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                  {t(category.labelKey)}
                </p>
                <div className="flex flex-wrap gap-1">
                  {category.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => onSelect(emoji)}
                      className="grid h-9 w-9 place-items-center rounded-full text-[20px] transition hover:bg-[var(--brand-surface-alt)]"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
