export default function ForbiddenPage() {
    return (
        <div className="h-screen flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-semibold">🚫 No Access</h1>
            <p className="text-muted-foreground mt-2">
                You don't have permission to view this page.
            </p>

            <div className="mt-4 flex gap-3">
                <a href="/" className="px-4 py-2 border rounded-md">
                    Go Home
                </a>

                <a href="/login" className="px-4 py-2 bg-primary text-white rounded-md">
                    Switch Account
                </a>
            </div>
        </div>
    );
}