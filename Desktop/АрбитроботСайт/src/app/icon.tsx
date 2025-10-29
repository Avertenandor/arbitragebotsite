import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Icon generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          borderRadius: '6px',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Circular arrows */}
          <path
            d="M16 6 A 10 10 0 0 1 24.66 11 L 23 12.5 L 26 16 L 28 10 L 26 11.5 A 10 10 0 0 0 16 4 Z"
            fill="white"
            opacity="0.95"
          />
          <path
            d="M26 16 A 10 10 0 0 1 16 26 L 16 23 L 12 26 L 16 29 L 16 26.5 A 10 10 0 0 0 28 16 Z"
            fill="white"
            opacity="0.95"
          />
          <path
            d="M6 16 A 10 10 0 0 1 16 6 L 16 9 L 20 6 L 16 3 L 16 5.5 A 10 10 0 0 0 4 16 Z"
            fill="white"
            opacity="0.95"
          />
          {/* Center dot */}
          <circle cx="16" cy="16" r="3" fill="#10B981" opacity="0.9" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
