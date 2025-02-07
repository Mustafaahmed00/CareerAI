import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
 return (
   <main className="min-h-screen flex items-center justify-center relative">
     <div className="absolute inset-0 z-0 overflow-hidden">
       <div className="grid-background" />
     </div>
     
     <div className="relative w-full max-w-[440px] mx-auto p-4 z-10">
       <SignUp
         appearance={{
           baseTheme: dark,
           variables: {
             colorBackground: '#121826', // Dark background
             colorText: '#e2e8f0', // Light text
             colorPrimary: '#1e293b', // Dark primary
             colorInputBackground: '#1e293b', // Input background
           },
           elements: {
             card: 'bg-[#121826] border-gray-800 rounded-xl',
             headerTitle: 'text-gray-100',
             headerSubtitle: 'text-gray-400',
             socialButtonsBlockButton: 'bg-gray-800 hover:bg-gray-700 border-gray-700',
             formButtonPrimary: 'bg-white text-gray-900 hover:bg-gray-200',
             formFieldInput: 'bg-gray-800 border-gray-700',
             footerActionLink: 'text-blue-400 hover:text-blue-300',
             footer: 'text-gray-400'
           }
         }}
       />
     </div>
   </main>
 );
}