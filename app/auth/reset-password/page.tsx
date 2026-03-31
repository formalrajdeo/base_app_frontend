import ResetPasswordFormComponent from "./_components/ResetPasswordForm"
import { Suspense } from "react"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordFormComponent />
    </Suspense>
  )
}
