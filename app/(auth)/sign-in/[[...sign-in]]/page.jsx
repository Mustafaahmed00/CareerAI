import { SignIn } from "@clerk/nextjs";


export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800">
      <div className="absolute inset-0 z-0">
        <div className="grid-background" />
      </div>

      <div className="relative w-full max-w-[440px] mx-auto p-4 z-10">
        <SignIn
          appearance={{
            baseTheme: "dark",
            elements: {
              rootBox: "w-full mx-auto",
              card: "bg-gray-900/90 backdrop-blur-sm border border-gray-800",
              headerTitle: "text-gray-100",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-gray-800 hover:bg-gray-700 border-gray-700",
              formButtonPrimary: "bg-gray-800 hover:bg-gray-700",
              footerActionLink: "text-blue-400 hover:text-blue-300",
              formFieldInput: "bg-gray-800 border-gray-700",
            }
          }}
        />
  </div>
 </main>
 );
}