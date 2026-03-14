import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, Link as LinkIcon, CheckCircle2, Copy, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<{uguu?: string, pixhost?: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedUguu, setCopiedUguu] = useState(false);
  const [copiedPixhost, setCopiedPixhost] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadedUrls(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorText = 'Upload failed';
        try {
          const errorData = await response.json();
          errorText = errorData.error || errorText;
        } catch (e) {
          errorText = await response.text();
        }
        throw new Error(errorText);
      }

      const data = await response.json();
      setUploadedUrls(data.urls);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  const copyToClipboard = (url: string | undefined, type: 'uguu' | 'pixhost') => {
    if (url) {
      navigator.clipboard.writeText(url);
      if (type === 'uguu') {
        setCopiedUguu(true);
        setTimeout(() => setCopiedUguu(false), 2000);
      } else {
        setCopiedPixhost(true);
        setTimeout(() => setCopiedPixhost(false), 2000);
      }
    }
  };

  const resetUpload = () => {
    setUploadedUrls(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-indigo-500/30">
      
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl mb-6"
          >
            <ImageIcon className="w-8 h-8 text-indigo-400" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-3"
          >
            Kayz
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg"
          >
            Convert your images to shareable URLs instantly.
          </motion.p>
        </div>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-2 shadow-2xl"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-10 relative overflow-hidden">
            
            <AnimatePresence mode="wait">
              {!uploadedUrls ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ease-out
                      flex flex-col items-center justify-center min-h-[300px]
                      ${isDragging 
                        ? 'border-indigo-500 bg-indigo-500/5' 
                        : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50'
                      }
                      ${isUploading ? 'pointer-events-none opacity-50' : ''}
                    `}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
                        <p className="text-zinc-300 font-medium">Uploading your image...</p>
                      </div>
                    ) : (
                      <>
                        <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${isDragging ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
                          <UploadCloud className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                          Click or drag image here
                        </h3>
                        <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                          Supports JPG, PNG, GIF, WebP up to 10MB
                        </p>
                      </>
                    )}
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                    >
                      {error}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-zinc-100 mb-2">Upload Complete!</h3>
                  <p className="text-zinc-400 mb-8 text-center">Your image is now available at the URLs below.</p>
                  
                  <div className="w-full space-y-4">
                    {uploadedUrls.pixhost && (
                      <div className="w-full relative group">
                        <div className="absolute -top-2.5 left-3 px-1 bg-zinc-900 text-xs font-medium text-indigo-400 z-10">
                          Pixhost
                        </div>
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <LinkIcon className="h-5 w-5 text-zinc-500" />
                        </div>
                        <input
                          type="text"
                          readOnly
                          value={uploadedUrls.pixhost}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-24 text-zinc-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                        <button
                          onClick={() => copyToClipboard(uploadedUrls.pixhost, 'pixhost')}
                          className="absolute inset-y-2 right-2 flex items-center gap-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          {copiedPixhost ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {uploadedUrls.uguu && (
                      <div className="w-full relative group">
                        <div className="absolute -top-2.5 left-3 px-1 bg-zinc-900 text-xs font-medium text-violet-400 z-10">
                          Uguu
                        </div>
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <LinkIcon className="h-5 w-5 text-zinc-500" />
                        </div>
                        <input
                          type="text"
                          readOnly
                          value={uploadedUrls.uguu}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-24 text-zinc-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                        />
                        <button
                          onClick={() => copyToClipboard(uploadedUrls.uguu, 'uguu')}
                          className="absolute inset-y-2 right-2 flex items-center gap-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          {copiedUguu ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 w-full aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 relative">
                    <img 
                      src={uploadedUrls.pixhost || uploadedUrls.uguu} 
                      alt="Uploaded preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <button
                    onClick={resetUpload}
                    className="mt-8 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors underline underline-offset-4"
                  >
                    Upload another image
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Footer */}
        <div className="mt-12 text-center text-zinc-600 text-sm">
          <p>Kayz &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
