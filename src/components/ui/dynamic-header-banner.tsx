import React from 'react';
import { cn } from '@/lib/utils';

export interface DynamicHeaderBannerSettings {
  orgName?: string;
  orgCode?: string;
  orgAddress?: string;
  orgAddressLine2?: string;
  orgPhone?: string;
  orgEmail?: string;
  reportHeaderTitle?: string;
  logoUrl?: string;
}

export interface DynamicHeaderBannerProps {
  settings?: DynamicHeaderBannerSettings;
  className?: string;
  compact?: boolean;
}

export function DynamicHeaderBanner({
  settings,
  className,
  compact = false,
}: DynamicHeaderBannerProps) {
  const orgName = (settings?.orgName || 'MYSA Medical Center').toUpperCase();
  const orgCode = (settings?.orgCode || 'MMS').toUpperCase();
  const addr1 = settings?.orgAddress || 'Diagnostic & Medical Checkup Centre for Overseas Employment';
  const addr2 = settings?.orgAddressLine2?.trim() || '';
  const phone = settings?.orgPhone || '+880 1700-000000';
  const email = settings?.orgEmail || '';

  return (
    <div
      className={cn(
        'w-full flex items-center justify-between gap-2 sm:gap-4 py-2 px-1 border-b-2 border-[#0f2942] bg-white select-none print:py-1 print:border-b-2 print:border-[#0f2942]',
        compact && 'py-1',
        className
      )}
    >
      {/* 1. LEFT GROUP: CLINICAL EMBLEM & ORGANIZATION NAME */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Custom Uploaded Logo or Crisp Vector Clinical Crest */}
        {settings?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <div className="flex-shrink-0 flex items-center justify-center">
            <img
              src={settings.logoUrl}
              alt={orgName}
              className="h-10 sm:h-12 md:h-13 w-auto max-w-[120px] object-contain flex-shrink-0 print:h-9"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <div className="w-10 sm:w-11 h-9 sm:h-10 rounded-lg bg-gradient-to-b from-sky-50 to-slate-100 border border-slate-300 flex items-center justify-center shadow-2xs print:border print:border-slate-400 print:bg-white">
              <svg viewBox="0 0 40 40" className="w-6 sm:w-7 h-6 sm:h-7">
                {/* Medical Cross */}
                <rect x="17" y="6" width="6" height="28" rx="1.5" fill="#0284c7" />
                <rect x="6" y="17" width="28" height="6" rx="1.5" fill="#0284c7" />
                {/* Vital ECG rhythm line */}
                <path
                  d="M4 20 L12 20 L15 13 L19 27 L23 15 L26 20 L36 20"
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-[9px] sm:text-[9.5px] font-black tracking-wider text-[#0f2942] uppercase -mt-0.5 font-mono print:text-[8.5px]">
              {orgCode}
            </span>
          </div>
        )}

        {/* Organization Name */}
        <div className="min-w-0 flex-1">
          <h2 className="font-black text-[#0f2942] uppercase tracking-tight text-xs sm:text-base md:text-lg leading-[1.15] font-sans break-words print:text-sm print:leading-tight">
            {orgName}
          </h2>
        </div>
      </div>

      {/* 2. MIDDLE VERTICAL SEPARATOR */}
      <div className="h-9 sm:h-10 w-[1.5px] bg-[#0f2942] mx-1 sm:mx-2 self-center flex-shrink-0 opacity-80 print:h-8" />

      {/* 3. RIGHT GROUP: STACKED CLINICAL ADDRESS & CONTACTS */}
      <div className="flex flex-col justify-center text-right sm:text-left text-[#0f2942] flex-shrink-0 max-w-[48%] sm:max-w-xs md:max-w-sm space-y-0.5 font-sans print:max-w-xs print:space-y-0">
        <span className="text-[9px] sm:text-[11px] md:text-xs font-bold leading-tight truncate block print:text-[9.5px]">
          {addr1}
        </span>
        {addr2 ? (
          <span className="text-[8px] sm:text-[10px] md:text-[11px] font-medium leading-tight text-slate-700 truncate block print:text-[8.5px]">
            {addr2}
          </span>
        ) : null}
        <span className="text-[8px] sm:text-[10px] md:text-[11px] font-bold leading-tight text-[#0f2942] truncate block print:text-[8.5px]">
          Mobile No.: {phone}
        </span>
        {email && !addr2 ? (
          <span className="text-[7.5px] sm:text-[9.5px] font-medium leading-tight text-slate-600 truncate block print:text-[8px]">
            Email: {email}
          </span>
        ) : null}
      </div>
    </div>
  );
}
