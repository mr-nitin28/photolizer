import UploadBox from "@/components/UploadBox";
import { Camera } from "lucide-react";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mb-2 shadow-sm">
            <Camera className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Upload Your Photo
          </h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto font-medium">
            Our AI will automatically remove the background and prepare your image for passport size printing.
          </p>
        </div>
        
        <UploadBox />
      </div>
    </main>
  );
}
