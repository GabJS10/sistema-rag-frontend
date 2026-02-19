import * as React from "react";

import { cn } from "@/lib/utils";
import TextareaAutosize, {
  TextareaAutosizeProps,
} from "react-textarea-autosize";

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaAutosizeProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextareaAutosize
        data-slot="textarea"
        className={cn(
          "flex field-sizing-content min-h-[60px] w-full rounded-xl border-none bg-transparent px-4 py-3 text-sm shadow-none transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none",
          className
        )}
        maxRows={10}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
