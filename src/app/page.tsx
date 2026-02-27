import { redirect } from "next/navigation";

export default function Home() {
  // Redirect unauthenticated users to login
  // Middleware handles role-based redirects after login
  redirect("/login");
}
