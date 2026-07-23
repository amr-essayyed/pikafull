import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Route Protection Logic
  const path = request.nextUrl.pathname
  const isDashboardRoute = path.startsWith('/dashboard')
  const isEmployeeRoute = path.startsWith('/employee')
  const isCustomerRoute = path.startsWith('/customer')
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/admin')

  // Use metadata role if available, otherwise fallback to database
  let userRole = user?.user_metadata?.role
  if (user && !userRole) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    userRole = data?.role
  }

  if (isAuthRoute && user) {
    if (userRole === "customer") {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url))
    }
    if (userRole === "employee") {
      return NextResponse.redirect(new URL('/employee/my-schedule', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isDashboardRoute && user && userRole !== "owner" && userRole !== "staff") {
    // Non-admins trying to access admin dashboard should be redirected
    if (userRole === "employee") {
      return NextResponse.redirect(new URL('/employee/my-schedule', request.url))
    }
    return NextResponse.redirect(new URL('/customer/dashboard', request.url))
  }

  if (isEmployeeRoute && user && userRole !== "employee" && userRole !== "owner" && userRole !== "staff") {
    return NextResponse.redirect(new URL('/customer/dashboard', request.url))
  }

  if (isCustomerRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect_to', path)
    return NextResponse.redirect(redirectUrl)
  }

  if ((isDashboardRoute || isEmployeeRoute) && !user) {
    const redirectUrl = new URL(isDashboardRoute ? '/admin' : '/login', request.url)
    redirectUrl.searchParams.set('redirect_to', path)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
