import { useEffect } from "react";
import { createPortal } from "react-dom";

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  // Use React Portal to render modal at body level (above all other content)
  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 99999,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Backdrop - highest z-index */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        style={{ zIndex: 99998 }}
      />

      {/* Modal Content - even higher z-index */}
      <div
        className={`relative bg-[#1e293b] border border-[#475569] rounded-xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden flex flex-col`}
        style={{ zIndex: 99999 }}
      >
        {/* Header - Fixed at top */}
        {title && (
          <div className="flex-shrink-0 bg-[#1e293b] border-b border-[#475569] px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#f1f5f9]">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#334155] rounded-lg text-[#cbd5e1] hover:text-[#f1f5f9] transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
