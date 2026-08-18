import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isBarbeiroRoute = createRouteMatcher(['/barbeiro(.*)'])
const isClienteRoute = createRouteMatcher(['/cliente(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    await auth.protect({ unauthenticatedUrl: new URL('/entrar/dono', req.url).toString() })
  }
  if (isBarbeiroRoute(req)) {
    await auth.protect({ unauthenticatedUrl: new URL('/entrar/barbeiro', req.url).toString() })
  }
  if (isClienteRoute(req)) {
    await auth.protect({ unauthenticatedUrl: new URL('/entrar/cliente', req.url).toString() })
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
