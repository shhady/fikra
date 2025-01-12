export default function manifest() {
  return {
    name: 'وكالة الذكاء الاصطناعي',
    short_name: 'FikraNova',
    description: 'حلول ذكية لتطوير أعمالك باستخدام تقنيات الذكاء الاصطناعي',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#3B82F6',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    orientation: 'portrait',
    dir: 'rtl',
    lang: 'ar',
    prefer_related_applications: false,
    categories: [
      'business',
      'productivity',
      'technology'
    ],
    screenshots: [
      {
        src: '/screenshots/home.png',
        sizes: '1920x1080',
        type: 'image/png',
        label: 'الصفحة الرئيسية لوكالة الذكاء الاصطناعي'
      },
      {
        src: '/screenshots/services.png',
        sizes: '1920x1080',
        type: 'image/png',
        label: 'خدماتنا المتميزة'
      }
    ],
    shortcuts: [
      {
        name: 'تواصل معنا',
        url: '/contact',
        description: 'تواصل مع فريقنا'
      },
      {
        name: 'خدماتنا',
        url: '/#services',
        description: 'استكشف خدماتنا'
      }
    ],
    related_applications: [],
    iarc_rating_id: '',
    scope: '/',
    display_override: ['window-controls-overlay'],
    handle_links: 'preferred',
    launch_handler: {
      client_mode: ['navigate-existing', 'auto']
    },
    edge_side_panel: {
      preferred_width: 480
    }
  }
}
  