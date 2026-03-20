import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-neutral-950 p-6 relative overflow-hidden">
      <div className="absolute top-0 w-full min-h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 -z-10" />
      
      <div className="max-w-3xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-3xl mb-4 shadow-sm">
          <Camera className="w-10 h-10" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          PhotoForge <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI</span>
        </h1>
        
        <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-medium leading-relaxed">
          Automate your document photos instantly. Remove backgrounds, generate A4 layouts, and download print-ready PDFs in seconds.
        </p>
        
        <div className="pt-8">
          <Link href="/upload">
            <Button size="lg" className="h-14 px-10 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Start Generating
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
