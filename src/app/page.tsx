import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect to the login page which is now the default.
  redirect('/login')
}
