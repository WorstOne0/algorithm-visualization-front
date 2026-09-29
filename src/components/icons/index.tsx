// Next
import Image from "next/image";
// Models
import type { FamilyId } from "@/core/models";

// The design's own 16px glyphs; react-icons has no match for the family marks, so they all live here.

export function LogoMark() {
  return <Image src="/logo/logo.png" alt="" width={64} height={64} unoptimized className="mb-[1.4rem] h-[3.6rem] w-[3.6rem]" />;
}

export function FamilyIcon({ id }: { id: FamilyId }) {
  switch (id) {
    case "sorting":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="2" y="9" width="3" height="5" rx=".5" />
          <rect x="6.5" y="3" width="3" height="11" rx=".5" />
          <rect x="11" y="6" width="3" height="8" rx=".5" />
        </svg>
      );
    case "searching":
      return <SearchIcon size={16} />;
    case "pathfinding":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="2" y="2" width="3.5" height="3.5" />
          <rect x="6.25" y="2" width="3.5" height="3.5" opacity=".4" />
          <rect x="2" y="6.25" width="3.5" height="3.5" opacity=".4" />
          <rect x="6.25" y="6.25" width="3.5" height="3.5" />
          <rect x="10.5" y="6.25" width="3.5" height="3.5" />
          <rect x="10.5" y="10.5" width="3.5" height="3.5" />
          <rect x="6.25" y="10.5" width="3.5" height="3.5" opacity=".4" />
        </svg>
      );
    case "graphs":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 12 8 4l4 8H4z" />
          <circle cx="4" cy="12" r="1.8" fill="var(--side)" />
          <circle cx="12" cy="12" r="1.8" fill="var(--side)" />
          <circle cx="8" cy="4" r="1.8" fill="var(--side)" />
        </svg>
      );
    case "trees":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 4v3M8 7 4 11M8 7l4 4" />
          <circle cx="8" cy="3.5" r="1.8" />
          <circle cx="4" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
        </svg>
      );
    case "gameai":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2v12M10 2v12M2 6h12M2 10h12" />
        </svg>
      );
  }
}

export function SearchIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="7" cy="7" r="4.2" />
      <path d="M10.2 10.2 14 14" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z" />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
    </svg>
  );
}

export function PlayIcon({ size = 10, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill={color}>
      <path d="M2 1l7 4-7 4z" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="#fff">
      <rect x="1.5" y="1" width="2.5" height="8" />
      <rect x="6" y="1" width="2.5" height="8" />
    </svg>
  );
}

export function BackIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9.5 6h-7M5.5 2.5 2 6l3.5 3.5" />
    </svg>
  );
}

export function ResetIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 6a4 4 0 1 0 1.2-2.9M2 2v2.5h2.5" />
    </svg>
  );
}

export function StepBackIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
      <path d="M8 1L2 5l6 4z" />
      <rect x=".8" y="1" width="1.2" height="8" />
    </svg>
  );
}

export function StepForwardIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
      <path d="M2 1l6 4-6 4z" />
      <rect x="8" y="1" width="1.2" height="8" />
    </svg>
  );
}

export function ArrowRightIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2 5h6M5 2l3 3-3 3" />
    </svg>
  );
}

export function ArrowLeftIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M8 5H2M5 2 2 5l3 3" />
    </svg>
  );
}

export function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 4.5h2l2.5-2v7l-2.5-2h-2z" />
      {on ? <path d="M8 4a2.5 2.5 0 0 1 0 4M9.5 2.5a4.5 4.5 0 0 1 0 7" /> : <path d="M8 4.5l3 3M11 4.5l-3 3" />}
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="6" cy="6" r="5" />
      <path d="M6 5.4v3M6 3.4v.2" strokeLinecap="round" />
    </svg>
  );
}
