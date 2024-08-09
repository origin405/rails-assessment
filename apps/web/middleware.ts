import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Custom middleware logic if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = { matcher: ["/board"] };