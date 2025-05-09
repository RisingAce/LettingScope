import * as React from "react";

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ children, className }) => (
  <div className={`artdeco-accordion ${className || ""}`}>{children}</div>
);

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, defaultOpen = false, className }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={`artdeco-accordion-item ${className || ""}`}>
      <button
        type="button"
        className="artdeco-accordion-trigger w-full flex justify-between items-center py-2 px-4 font-artdeco text-lg border-b border-gold-300 bg-cream-50 hover:bg-gold-50 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      <div
        className={`artdeco-accordion-content transition-all duration-300 ease-in-out overflow-hidden ${open ? "max-h-96 p-4" : "max-h-0 p-0"}`}
        aria-hidden={!open}
      >
        {open && children}
      </div>
    </div>
  );
};

export const AccordionTrigger = AccordionItem; // For compatibility with import style
export const AccordionContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`artdeco-accordion-content-inner ${className || ""}`}>{children}</div>
);
