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
  const orgName = (settings?.orgName || 'MYSA MEDICAL SERVICES (PVT.) LTD.').toUpperCase();
  const orgCode = (settings?.orgCode || 'MMS').toLowerCase();
  const addr1 = settings?.orgAddress || 'Diagnostic & Medical Checkup Centre for Overseas Employment';
  const addr2 = settings?.orgAddressLine2 || 'VIP Road, Dhaka-1000';
  const phone = settings?.orgPhone || '+880 1700-000000';

  return (
    <div
      className={cn(
        'w-full flex items-center justify-between gap-2 sm:gap-4 py-2 px-1 border-b border-[#212529] bg-white select-none print:py-1 print:border-b print:border-[#212529]',
        compact && 'py-1',
        className
      )}
    >
      {/* 1. LEFT GROUP: CLINICAL EMBLEM & ORGANIZATION NAME */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Emblem or Custom Logo */}
        {settings?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.logoUrl}
            alt={orgName}
            className="h-10 sm:h-12 w-auto object-contain flex-shrink-0 print:h-9"
          />
        ) : (
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <svg viewBox="0 0 100 70" className="w-10 sm:w-13 h-8 sm:h-10 print:w-11 print:h-8">
              {/* ECG heartbeat waveform in clinical burgundy */}
              <path
                d="M2 38 L16 38 L22 22 L29 54 L36 28 L42 38 L48 38"
                fill="none"
                stroke="#881337"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Stylized caring human heads */}
              <circle cx="56" cy="20" r="4.5" fill="#0284c7" />
              <circle cx="69" cy="15" r="5.2" fill="#0369a1" />
              {/* Stylized caring medical heart contour */}
              <path
                d="M48 30 C42 42, 50 54, 62 62 C74 54, 82 42, 76 30 C72 23, 63 25, 62 30 C61 25, 52 23, 48 30 Z"
                fill="none"
                stroke="#0284c7"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[9.5px] sm:text-[10.5px] font-black tracking-wider text-[#000066] uppercase -mt-1 font-sans print:text-[9px]">
              {orgCode}
            </span>
          </div>
        )}

        {/* Organization Name */}
        <div className="min-w-0 flex-1">
          <h2 className="font-black text-[#1c2d42] uppercase tracking-tight text-xs sm:text-base md:text-lg leading-[1.15] font-sans break-words print:text-sm print:leading-tight">
            {orgName}
          </h2>
        </div>
      </div>

      {/* 2. MIDDLE VERTICAL SEPARATOR (Exact match to official banner) */}
      <div className="h-9 sm:h-10 w-[1.5px] bg-[#000066] mx-1 sm:mx-2 self-center flex-shrink-0 print:h-8" />

      {/* 3. RIGHT GROUP: STACKED CLINICAL ADDRESS & CONTACTS */}
      <div className="flex flex-col justify-center text-right sm:text-left text-[#000066] flex-shrink-0 max-w-[48%] sm:max-w-xs md:max-w-sm space-y-0.5 font-sans print:max-w-xs print:space-y-0">
        <span className="text-[9px] sm:text-[11px] md:text-xs font-bold leading-tight truncate block print:text-[9.5px]">
          {addr1}
        </span>
        <span className="text-[8px] sm:text-[10px] md:text-[11px] font-medium leading-tight text-slate-800 truncate block print:text-[8.5px]">
          {addr2}
        </span>
        <span className="text-[8px] sm:text-[10px] md:text-[11px] font-bold leading-tight text-[#000066] truncate block print:text-[8.5px]">
          Mobile No.: {phone}
        </span>
      </div>
    </div>
  );
}
