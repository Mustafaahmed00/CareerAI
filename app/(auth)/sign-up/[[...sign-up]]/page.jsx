import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="grid-background opacity-50 animate-slow-pulse" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 mix-blend-overlay" />
      </div>
      
      <div className="relative w-full max-w-[440px] mx-auto p-4 z-10">
        <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-xl shadow-2xl 
                        transform transition-all duration-300 hover:scale-[1.02] 
                        hover:shadow-3xl focus-within:scale-[1.02]">
          <SignUp
            appearance={{
              baseTheme: "grey",
              variables: {
                colorPrimary: "rgb(31 41 55)", // Customize primary color
                colorBackground: "rgb(17 24 39)", // Dark background
                colorText: "rgb(229 231 235)", // Light text
                colorInputBackground: "rgb(31 41 55)", // Input background
                colorInputText: "rgb(229 231 235)", // Input text
              },
              elements: {
                rootBox: "w-full mx-auto",
                card: "bg-transparent shadow-none",
                headerTitle: "text-gray-100 tracking-tight font-medium",
                headerSubtitle: "text-gray-400 text-sm",
                footer: "text-gray-400", // Customize footer text color
                socialButtonsBlockButton: `
                  bg-gray-800 hover:bg-gray-700 border-gray-700 
                  transition-all duration-200 ease-in-out 
                  hover:scale-[1.02] active:scale-95
                `,
                formButtonPrimary: `
                  bg-white text-gray-900 hover:bg-gray-200 
                  transition-all duration-200 ease-in-out 
                  hover:scale-[1.02] active:scale-95
                `,
                footerActionLink: "text-blue-400 hover:text-blue-300",
                formFieldInput: `
                  bg-gray-800 border-gray-700 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-all duration-200
                `,
              }
            }}
          />
        </div>
      </div>
    </main>
  );
}