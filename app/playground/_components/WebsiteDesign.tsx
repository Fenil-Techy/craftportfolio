'use client'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'

import ElementSettingSection from './ElementSettingSection';
import ImageSettingSection from './ImageSetting';
import { OnSaveContext } from '@/context/OnSaveContext';
import { toast } from 'sonner';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type Props = {
    generatedCode: string,
    screenSize: string,
    isPro: boolean
}

const HTML_CODE = `
<!DOCTYPE html>
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


         
      </head>
      <body id="root"></body>
      </html>
    `

function WebsiteDesign({ generatedCode, screenSize, isPro }: Props) {
   
    
    const [selectedElementLabel, setSelectedElementLabel] = useState<string>("No component selected")
    const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const selectedElementRef = useRef<HTMLElement | null>(null);
    const clearSelectionRef = useRef<() => void>(() => { });

    const context = useContext(OnSaveContext);
    if (!context) throw new Error('OnSaveContext not provided');
    const { onSave, setOnSave } = context;

    const{projectId}=useParams()
    const params=useSearchParams()
    const frameId=params.get('frameId')

    const clearSelectedElement = useCallback(() => {
        clearSelectionRef.current();
    }, []);


    // Initialize iframe shell once

    useEffect(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        doc.open();
        doc.write(HTML_CODE);
        doc.close();

        let hoverEl: HTMLElement | null = null;



        const resolveSelectableTarget = (target: EventTarget | null): HTMLElement | null => {
            if (!target) return null;
            let element: HTMLElement | null = null;
            const nodeTarget = target as Node;
        
            // Use nodeType checks instead of instanceof (iframe-safe across realms)
            if (nodeTarget.nodeType === 1) {
                element = nodeTarget as HTMLElement;
            } else if (nodeTarget.nodeType === 3) {
                element = nodeTarget.parentElement;
            }
        
            if (!element) return null;
        
            const root = doc.getElementById("root");
            if (!root || !root.contains(element)) return null;
        
            // 1. Check if the user directly clicked a specific interactive/content element
            const innerTarget = element.closest(
                "button, a, img, h1, h2, h3, h4, h5, h6, p, span, li, input, textarea, label, [data-component]"
            );
            if (innerTarget && root.contains(innerTarget)) {
                return innerTarget as HTMLElement;
            }
        
            // 2. Fallback to larger layout wrappers if they didn't hit micro-content directly
            const semanticParent = element.closest(
                "section, article, nav, header, footer, aside, main, form, card"
            );
        
            const candidate = (semanticParent as HTMLElement | null) ?? element;
            if (candidate === doc.body || candidate === doc.documentElement || candidate.id === "root") {
                const firstChild = doc.getElementById("root")?.firstElementChild;
                return firstChild && firstChild.nodeType === 1 ? (firstChild as HTMLElement) : null;
            }
        
            return candidate;
        };

        const handleMouseOver = (e: MouseEvent) => {
            if (selectedElementRef.current) return;
            const target = resolveSelectableTarget(e.target);
            if (!target) return;
            if (hoverEl && hoverEl !== target) {
                hoverEl.style.outline = "";
            }
            hoverEl = target;
            hoverEl.style.outline = "2px dotted blue";
        };

        const handleMouseOut = () => {
            if (selectedElementRef.current) return;
            if (hoverEl) {
                hoverEl.style.outline = "";
                hoverEl = null;
            }
        };

        const getElementLabel = (element: HTMLElement) => {
            const tag = element.tagName.toLowerCase();
            const id = element.id ? `#${element.id}` : "";
            const className =
                typeof element.className === "string" && element.className.trim().length > 0
                    ? `.${element.className.trim().split(/\s+/).join(".")}`
                    : "";
            return `<${tag}${id}${className}>`;
        };

        const clearSelection = () => {
            const selectedEl = selectedElementRef.current;
            if (!selectedEl) return;
            selectedEl.style.outline = "";
            selectedEl.removeAttribute("contenteditable");
            selectedEl.removeEventListener("blur", handleBlur);
            selectedElementRef.current = null;
            setSelectedElement(null);
            setSelectedElementLabel("No component selected");
        };

        const handleClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const target = resolveSelectableTarget(e.target);
            if (!target) return;

            const currentSelectedEl = selectedElementRef.current;
            if (currentSelectedEl && currentSelectedEl !== target) {
                currentSelectedEl.style.outline = "";
                currentSelectedEl.removeAttribute("contenteditable");
                currentSelectedEl.removeEventListener("blur", handleBlur);
            }

            selectedElementRef.current = target;
            target.style.outline = "2px solid red";
            target.setAttribute("contenteditable", "true");
            target.addEventListener("blur", handleBlur);
            target.focus();
            setSelectedElementLabel(getElementLabel(target));
            setSelectedElement(target)

        };

        const handleBlur = () => {
            const selectedEl = selectedElementRef.current;
            if (selectedEl) {
                console.log("Final edited element:", selectedEl.outerHTML);
            }
        };


        const handleKeyDown = (e: KeyboardEvent) => {
            const selectedEl = selectedElementRef.current;
            if (e.key === "Escape" && selectedEl) {
                clearSelection();
            }
        };

        clearSelectionRef.current = clearSelection;

        doc.addEventListener("mouseover", handleMouseOver, true);
        doc.addEventListener("mouseout", handleMouseOut, true);
        doc.addEventListener("click", handleClick, true);
        doc?.addEventListener("keydown", handleKeyDown);

        // Cleanup on unmount
        return () => {
            clearSelection();
            doc.removeEventListener("mouseover", handleMouseOver, true);
            doc.removeEventListener("mouseout", handleMouseOut, true);
            doc.removeEventListener("click", handleClick, true);
            doc?.removeEventListener("keydown", handleKeyDown);
        };
    }, []);



    // Update body only when code changes
    useEffect(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        const root = doc.getElementById("root");
        if (root) {
            clearSelectedElement();
            let codeToRender = generatedCode
                    ?.replaceAll("```html", "")
                    .replaceAll("```", "")
                    .replace("html", "") ?? "";

            if (!isPro && codeToRender && !codeToRender.includes("CraftPortfolio")) {
              codeToRender += `
  <!-- CraftPortfolio Watermark -->
  <div class="w-full text-center py-8 text-xs text-zinc-500/60 border-t border-zinc-100/10 mt-12 bg-transparent pointer-events-auto">
    <a href="https://craftportfolio.online" target="_blank" class="inline-flex items-center gap-1.5 hover:text-zinc-200 transition-colors">
      <span>Made with</span>
      <span class="font-semibold text-blue-400">Craft</span><span class="font-semibold text-purple-400">Portfolio</span>
    </a>
  </div>`;
            }
            root.innerHTML = codeToRender;
        }
    }, [generatedCode, clearSelectedElement, isPro]);

    useEffect(()=>{
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, react-hooks/immutability
        onSave && HandleOnSave()
    },[onSave])

    const HandleOnSave = async () => {
        if (iframeRef.current) {
            try {
                const iframeDoc = iframeRef.current.contentDocument
                || iframeRef.current.contentWindow?.document
    
                if (iframeDoc) {
                    // 1. Grab the inner contents of #root from the live iframe safely
                    const rootEl = iframeDoc.getElementById("root");
                    if (!rootEl) return;
    
                    // 2. Clone ONLY the generated inner content to clean it for the DB
                    const cloneRoot = rootEl.cloneNode(true) as HTMLElement;
                    
                    // 3. Strip editor runtime visual helpers from the cloned bundle
                    const allCleanTargets = cloneRoot.querySelectorAll<HTMLElement>("*");
                    allCleanTargets.forEach(el => {
                        el.style.outline = '';
                        el.style.cursor = '';
                        // Clean up contenteditable attributes so saved sites aren't editable live
                        el.removeAttribute("contenteditable"); 
                    });
    
                    // Get the cleaned inner HTML content
                    const cleanedHtml = cloneRoot.innerHTML;
                    console.log("Saving clean code:", cleanedHtml);
    
                    // 4. Dispatch the clean code back to your API
                    const result = await axios.put("/api/frames", {
                        designCode: cleanedHtml,
                        frameId: frameId,
                        projectId: projectId
                    });
                    
                    console.log(result.data);
                    toast.success("Saved Successfully");
                }
    
            } catch (error) {
                console.log("Error saving layout state:", error);
                toast.error("Failed to save changes");
            }
        }
    }

    const settingsPanel =
        selectedElement?.tagName === "IMG" ? (
            <ImageSettingSection selectedElement={selectedElement as HTMLImageElement} />
        ) : selectedElement ? (
            <ElementSettingSection selectedElement={selectedElement} clearSelection={clearSelectedElement} />
        ) : null;

    return (
        <div className="relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden lg:flex-row">

            {selectedElement && (
                <button
                    type="button"
                    aria-label="Close settings"
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={clearSelectedElement}
                />
            )}

            {/* Preview + toolbar */}
            <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
                <div className="flex min-h-0 flex-1 items-stretch justify-center bg-muted/20 p-3 sm:px-4 sm:py-4">
                    <iframe
                        ref={iframeRef}
                        title="Generated website preview"
                        className={`h-full w-full min-h-[160px] rounded-xl ${
                          screenSize === "desktop"
                            ? "max-w-full"
                            : "mx-auto max-w-full sm:max-w-[360px] md:max-w-[440px]"
                        }`}
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>

                {/* <div className="shrink-0 space-y-2 border-t border-border bg-background px-3 py-2 sm:px-4 sm:py-3">
                    <p className="truncate text-xs text-muted-foreground sm:text-sm">
                        Selected: {selectedElementLabel}
                    </p>
                    <WebpageTool
                        screenSize={screenSize}
                        setScreenSize={(v: string) => setScreenSize(v)}
                        code={generatedCode}
                    />
                </div> */}
            </div>

            {/* Element settings — bottom sheet on mobile, sidebar on desktop */}
            {settingsPanel && (
                <aside className="fixed inset-x-0 bottom-0 z-40 flex max-h-[min(88dvh,720px)] w-full flex-col overflow-hidden rounded-t-2xl border-t border-border bg-background shadow-2xl lg:static lg:z-auto lg:h-full lg:max-h-none lg:w-80 lg:max-w-sm lg:shrink-0 lg:rounded-none lg:border-l lg:shadow-none">
                    <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 lg:hidden">
                        <span className="text-sm font-semibold">
                            {selectedElement?.tagName === "IMG" ? "Image Settings" : "Element Settings"}
                        </span>
                        <Button variant="ghost" size="icon-sm" onClick={clearSelectedElement} aria-label="Close settings">
                            <X />
                        </Button>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                        {settingsPanel}
                    </div>
                </aside>
            )}
        </div>
    );
}


export default WebsiteDesign