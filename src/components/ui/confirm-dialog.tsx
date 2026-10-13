'use client';

import React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading = false,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const Icon = variant === 'danger' ? AlertTriangle : variant === 'warning' ? AlertCircle : Info;

  const iconColor =
    variant === 'danger'
      ? 'bg-rose-100 text-rose-600'
      : variant === 'warning'
        ? 'bg-amber-100 text-amber-600'
        : 'bg-blue-100 text-blue-600';

  const confirmBtnVariant = variant === 'danger' ? 'destructive' : 'default';

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs animate-fadeInFast" />
        <AlertDialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-float animate-scaleIn">
          <div className="flex items-start gap-3.5">
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0', iconColor)}>
              <Icon className="h-5 w-5" />
            </div>

            <div className="space-y-1 flex-1">
              <AlertDialogPrimitive.Title className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {title}
              </AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className="text-xs text-slate-600 leading-relaxed">
                {description}
              </AlertDialogPrimitive.Description>
            </div>
          </div>

          {children && <div className="py-1">{children}</div>}

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-slate-100">
            <AlertDialogPrimitive.Cancel asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                className="w-full sm:w-auto h-8 text-xs rounded-lg"
              >
                {cancelLabel}
              </Button>
            </AlertDialogPrimitive.Cancel>

            <Button
              variant={confirmBtnVariant}
              size="sm"
              disabled={loading}
              onClick={async (e) => {
                e.preventDefault();
                await onConfirm();
              }}
              className="w-full sm:w-auto h-8 text-xs rounded-lg shadow-2xs font-semibold"
            >
              {loading ? 'Processing...' : confirmLabel}
            </Button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
