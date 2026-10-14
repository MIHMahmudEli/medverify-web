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
  const orgCode = (settings?.orgCode || 'MMS').toLowerCase();
  const addr1 = settings?.orgAddress || 'Diagnostic & Medical Checkup Centre for Overseas Employment';
  const addr2 = settings?.orgAddressLine2?.trim() || '';
  const phone = settings?.orgPhone || '+880 1700-000000';
  const email = settings?.orgEmail || '';

  // Smart splitting for optimal 2-line or 1-line presentation
  let part1 = orgName;
  let part2 = '';
  if (orgName.includes(' SERVICES (PVT.) LTD.')) {
    part1 = orgName.replace(' SERVICES (PVT.) LTD.', '');
    part2 = 'SERVICES (PVT.) LTD.';
  } else if (orgName.includes(' (PVT.) LTD.')) {
    part1 = orgName.replace(' (PVT.) LTD.', '');
    part2 = '(PVT.) LTD.';
  } else if (orgName.includes(' (PVT) LTD')) {
    part1 = orgName.replace(' (PVT) LTD', '');
    part2 = '(PVT) LTD';
  }

  return (
    <div
      className={cn(
        'w-full flex items-center justify-between gap-2 sm:gap-3 py-1.5 px-1 border-b border-[#000066] bg-white select-none print:py-1 print:border-b print:border-[#000066]',
        compact && 'py-1',
        className
      )}
    >
      {/* 1. LEFT GROUP: CLINICAL EMBLEM & ORGANIZATION NAME */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Custom Uploaded Clinic Logo or Crisp Vector Emblem */}
        {settings?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <div className="flex-shrink-0 flex items-center justify-center">
            <img
              src={settings.logoUrl}
              alt={orgName}
              className="h-10 sm:h-12 w-auto max-w-[120px] object-contain flex-shrink-0 print:h-9"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <svg viewBox="0 0 100 68" className="w-11 sm:w-13 h-8 sm:h-10 print:w-11 print:h-8">
              {/* ECG heartbeat waveform in clinical burgundy */}
              <path
                d="M2 36 L15 36 L21 20 L28 52 L35 26 L41 36 L47 36"
                fill="none"
                stroke="#881337"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Stylized caring human heads */}
              <circle cx="56" cy="18" r="4.6" fill="#0284c7" />
              <circle cx="70" cy="13" r="5.2" fill="#0369a1" />
              {/* Stylized caring medical heart contour */}
              <path
                d="M48 28 C42 40, 50 52, 62 60 C74 52, 82 40, 76 28 C72 21, 63 23, 62 28 C61 23, 52 21, 48 28 Z"
                fill="none"
                stroke="#0284c7"
                strokeWidth="3.8"
                strokeLinecap="round"
              />
              {/* Swoosh accent under heart */}
              <path
                d="M44 54 C58 50, 74 54, 88 64"
                fill="none"
                stroke="#1e293b"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider text-[#000066] uppercase -mt-1 font-sans print:text-[9.5px]">
              {orgCode}
            </span>
          </div>
        )}

        {/* Organization Name */}
        <div className="min-w-0 flex-1">
          {part2 ? (
            <div className="flex flex-col">
              <span className="font-black text-[#1c2d42] uppercase tracking-tight text-xs sm:text-base md:text-lg leading-[1.1] font-sans truncate">
                {part1}
              </span>
              <span className="font-extrabold text-[#1c2d42] uppercase tracking-tight text-[11px] sm:text-sm md:text-base leading-[1.1] font-sans truncate">
                {part2}
              </span>
            </div>
          ) : (
            <h2 className="font-black text-[#1c2d42] uppercase tracking-tight text-xs sm:text-base md:text-lg leading-[1.15] font-sans break-words print:text-sm print:leading-tight">
              {orgName}
            </h2>
          )}
        </div>
      </div>

      {/* 2. MIDDLE VERTICAL SEPARATOR (Exact match to official banner) */}
      <div className="h-9 sm:h-10 w-[1.5px] bg-[#000066] mx-1 sm:mx-2 self-center flex-shrink-0 print:h-8" />

      {/* 3. RIGHT GROUP: STACKED CLINICAL ADDRESS & CONTACTS */}
      <div className="flex flex-col justify-center text-right sm:text-left text-[#000066] flex-shrink-0 max-w-[48%] sm:max-w-xs md:max-w-sm space-y-0.5 font-sans print:max-w-xs print:space-y-0">
        <span className="text-[9px] sm:text-[10.5px] md:text-xs font-bold leading-tight truncate block print:text-[9.5px]">
          {addr1}
        </span>
        {addr2 ? (
          <span className="text-[8px] sm:text-[9.5px] md:text-[10.5px] font-medium leading-tight text-slate-800 truncate block print:text-[8.5px]">
            {addr2}
          </span>
        ) : null}
        <span className="text-[8px] sm:text-[9.5px] md:text-[10.5px] font-bold leading-tight text-[#000066] truncate block print:text-[8.5px]">
          Mobile No.: {phone}
        </span>
        {email && !addr2 ? (
          <span className="text-[7.5px] sm:text-[9px] font-medium leading-tight text-slate-600 truncate block print:text-[8px]">
            Email: {email}
          </span>
        ) : null}
      </div>
    </div>
  );
}
