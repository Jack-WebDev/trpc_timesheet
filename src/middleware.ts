import { jwtDecode } from "jwt-decode";
import { NextResponse, type NextRequest } from "next/server";

type JwtPayload = {
  id: string;
  email: string;
  role: string;
  isAdmin: boolean;
  isManager: boolean;
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const currentUser = token ? jwtDecode<JwtPayload>(token): null;
  console.log(currentUser);


  const response = NextResponse.next()


  // if (!token) {
  //   return Response.redirect(new URL("/", request.url));
  // }

  if (token) {
    if (
      currentUser?.role !== "Admin" &&
      request.nextUrl.pathname.startsWith("/dashboard/admin")
    ) {
      return Response.redirect(new URL("/blocked", request.url));
    }
    if (
      currentUser?.role !== "Manager" &&
      request.nextUrl.pathname.startsWith("/dashboard/manager")
    ) {
      return Response.redirect(new URL("/blocked", request.url));
    }
    if (
      currentUser?.role !== "Employee" &&
      request.nextUrl.pathname.startsWith("/dashboard/employee")
    ) {
      return Response.redirect(new URL("/blocked", request.url));
    }
  }

  return response
}
