import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 中国相关的国家/地区代码
const CHINESE_REGIONS = ['CN', 'HK', 'MO', 'TW']

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // 检查是否已经有语言偏好 cookie
  const langCookie = request.cookies.get('preferred-lang')
  if (langCookie) {
    return response
  }

  // 从 Vercel/Cloudflare 等 CDN 获取地理位置信息
  const country = request.geo?.country ||
    request.headers.get('cf-ipcountry') ||  // Cloudflare
    request.headers.get('x-vercel-ip-country') ||  // Vercel
    ''

  // 检查 Accept-Language 请求头作为备选
  const acceptLanguage = request.headers.get('accept-language') || ''
  const prefersChinese = acceptLanguage.toLowerCase().includes('zh')

  // 判断是否应该使用中文
  const shouldUseChinese = CHINESE_REGIONS.includes(country.toUpperCase()) || prefersChinese

  // 设置默认语言 cookie
  const detectedLang = shouldUseChinese ? 'zh' : 'en'
  response.cookies.set('preferred-lang', detectedLang, {
    maxAge: 60 * 60 * 24 * 365, // 1 年
    path: '/',
    sameSite: 'lax',
  })

  // 同时设置检测到的国家信息（可选，用于调试）
  if (country) {
    response.cookies.set('detected-country', country, {
      maxAge: 60 * 60 * 24, // 1 天
      path: '/',
      sameSite: 'lax',
    })
  }

  return response
}

// 只对页面请求应用 middleware，排除静态资源和 API
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
