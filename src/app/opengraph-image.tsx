import { ImageResponse } from 'next/og';

// Open Graph Image generator (для превью в соцсетях)
export const runtime = 'edge';

export const alt = 'ArbitroBot - DEX Арбитражный Робот';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A0A0F 0%, #1C1C24 100%)',
          position: 'relative',
        }}
      >
        {/* Animated grid background */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0.1,
            backgroundImage:
              'linear-gradient(0deg, rgba(0,217,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #00D9FF 0%, #9D4EDD 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '60px',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            A
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                fontSize: '80px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #00D9FF 0%, #9D4EDD 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                lineHeight: 1,
              }}
            >
              ArbitroBot
            </div>
            <div
              style={{
                fontSize: '32px',
                color: '#B4B4BB',
                marginTop: '10px',
              }}
            >
              DEX Арбитраж
            </div>
          </div>
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '36px',
            color: '#F8F8FA',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
          }}
        >
          Мониторинг арбитражных транзакций в реальном времени
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: '60px',
            marginTop: '60px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #00D9FF 0%, #00FFA3 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              24/7
            </div>
            <div style={{ fontSize: '24px', color: '#8A8A92' }}>
              Мониторинг
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #9D4EDD 0%, #FF4D6A 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              BSC
            </div>
            <div style={{ fontSize: '24px', color: '#8A8A92' }}>
              BNB Chain
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #00FFA3 0%, #FFB800 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              DEX
            </div>
            <div style={{ fontSize: '24px', color: '#8A8A92' }}>
              Арбитраж
            </div>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '28px',
            color: '#00D9FF',
          }}
        >
          arbitrage-bot.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

