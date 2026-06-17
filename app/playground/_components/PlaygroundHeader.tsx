/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import { OnSaveContext } from '@/context/OnSaveContext'
import Image from 'next/image'
import Link from 'next/link'
import { useContext, useEffect, useMemo, useState } from 'react'
import { Download, MonitorIcon, Smartphone, SquareArrowOutUpRightIcon, Code2Icon, Save } from 'lucide-react'
import { ViewCodeBlock } from './ViewCodeBlock'

const HTML_CODE = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="AI Website Builder - Modern TailwindCSS + Flowbite Template">
          <title>AI Website Builder</title>

          <!-- Tailwind CSS -->
          <script src="https://cdn.tailwindcss.com"></script>

          <!-- Flowbite CSS & JS -->
          <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>

          <!-- Font Awesome / Lucide -->
          <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

          <!-- Chart.js -->
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

          <!-- AOS -->
          <link href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" rel="stylesheet">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>

          <!-- GSAP -->
          <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

          <!-- Lottie -->
          <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.11.2/lottie.min.js"></script>

          <!-- Swiper -->
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
          <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>

          <!-- Tippy.js -->
          <link rel="stylesheet" href="https://unpkg.com/tippy.js@6/dist/tippy.css" />
          <script src="https://unpkg.com/@popperjs/core@2"></script>
          <script src="https://unpkg.com/tippy.js@6"></script>
      </head>
      
{code}

      </html>`
function PlaygroundHeader({ screenSize, setScreenSize, code }: any) {
  console.log("Header render");
  const { onSave, setOnSave } = useContext(OnSaveContext)
  // 1. Added safety state for loading status to fix compilation crash
  const [isSaving, setIsSaving] = useState(false)

  // Turn off loading animation briefly when onSave triggers complete
  useEffect(() => {
    if (onSave) {
      const timer = setTimeout(() => setIsSaving(false), 800)
      return () => clearTimeout(timer)
    }
  }, [onSave])
  const finalCode = useMemo(() => {
    return (HTML_CODE.replace("{code}", code) || "")
      .replaceAll("```html", "")
      .replace("```", "")
      .replace("html", "");
  }, [code]);
  const ViewInNewTab = () => {
    if (!finalCode) return


    const blob = new Blob([finalCode || ""], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
  }
  const downloadButton = () => {
    const blob = new Blob([finalCode || ""], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

  }
  const handleSaveTrigger = () => {
    setIsSaving(true)
    setOnSave(Date.now())
  }
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background/90 backdrop-blur-md px-2 sm:px-4 md:p-8">

      {/* Logo */}
      <Link href="/workspace">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="logo"
            width={40}
            height={40}
            className="h-8 w-8"
          />

          <h2 className="hidden md:block text-lg font-bold">
            
            <span className="text-blue-400 lg:text-xl">Craft</span>
            <span className="text-purple-400 lg:text-xl">Portfolio</span>
          </h2>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-3 overflow-x-auto">

        {/* Desktop / Mobile */}
        <div className="hidden lg:flex items-center rounded-md border p-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setScreenSize("desktop")} className={screenSize === "desktop" ? "border border-primary" : undefined} aria-label="Desktop preview">
            <MonitorIcon />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setScreenSize("mobile")} className={screenSize === "mobile" ? "border border-primary" : undefined} aria-label="Mobile preview">
            <Smartphone />
          </Button>
        </div>

        <Button
          size="icon"
          variant="outline"
          className="sm:hidden"
          onClick={ViewInNewTab}
        >
          <SquareArrowOutUpRightIcon className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="hidden sm:flex"
          onClick={ViewInNewTab}
        >
          <SquareArrowOutUpRightIcon className="h-4 w-4" />
          View
        </Button>
        <ViewCodeBlock code={finalCode}>
          <div>
            <Button size="icon" variant="outline" className="sm:hidden border-slate-800 text-slate-300">
              <Code2Icon className="h-4 w-4" />
            </Button>

            <Button size="sm" variant="outline" className="hidden sm:flex gap-1.5 border-slate-800 text-slate-200 hover:bg-slate-900">
              <Code2Icon className="h-3.5 w-3.5 text-blue-400" />
              Code
            </Button>
          </div>
        </ViewCodeBlock>

        {/* Download Actions */}
        <Button
          size="icon"
          variant="outline"
          className="sm:hidden border-slate-800 text-slate-300"
          onClick={downloadButton}
        >
          <Download className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="hidden sm:flex gap-1.5 border-slate-800 text-slate-200 hover:bg-slate-900"
          onClick={downloadButton}
        >
          <Download className="h-3.5 w-3.5 text-purple-400" />
          Download
        </Button>

        <Button
          size="icon"
          className="sm:hidden"
          disabled={isSaving}
          onClick={handleSaveTrigger}
        >
          <Save className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          className="hidden sm:flex"
          disabled={isSaving}
          onClick={handleSaveTrigger}
        >
          <Save className={`h-3.5 w-3.5 ${isSaving ? "animate-spin" : ""}`} />
          {isSaving ? "Saving..." : "Save"}
          
         
        </Button>

      </div>
    </header>
  )
}

export default PlaygroundHeader