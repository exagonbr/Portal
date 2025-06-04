import { DialogHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface DialogProps extends DialogHTMLAttributes<HTMLDialogElement> {
  open: boolean;
  onClose: () => void;
}

const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  ({ className, children, open, onClose, ...props }, ref) => {
    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/50">
        <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Dialog.displayName = 'Dialog';

export { Dialog }; 