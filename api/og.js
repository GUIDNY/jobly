import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler() {
  return new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #070910 0%, #1a0f1f 100%)',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '120px',
                      height: '120px',
                      borderRadius: '32px',
                      background: 'linear-gradient(135deg, #F4938C, #5BC4C8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 20px 60px rgba(244,147,140,0.4)',
                    },
                    children: {
                      type: 'span',
                      props: {
                        style: { fontSize: '64px', color: 'white', fontWeight: '900' },
                        children: 'V',
                      },
                    },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: '56px', fontWeight: '900', color: 'white', letterSpacing: '-2px' },
                          children: 'Vizzit',
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: '24px', color: 'rgba(255,255,255,0.5)', fontWeight: '400' },
                          children: 'הכרטיס הדיגיטלי של העסק שלך',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    { width: 1200, height: 630 }
  );
}
