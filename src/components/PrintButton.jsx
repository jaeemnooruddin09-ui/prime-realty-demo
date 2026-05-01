'use client';

export default function PrintButton({ label = 'Print this listing' }) {
  return (
    <button onClick={() => typeof window !== 'undefined' && window.print()} className="btn-primary">
      {label}
    </button>
  );
}
