import React, { useEffect, useRef, useState } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { Maximize2, Minimize2, Download, FileText, Image as ImageIcon, FileCode, ChevronDown } from 'lucide-react';

interface MindMapViewerProps {
  markdown: string;
}

const transformer = new Transformer();

const MindMapViewer: React.FC<MindMapViewerProps> = ({ markdown }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu && !(event.target as Element).closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  useEffect(() => {
    if (svgRef.current && markdown) {
      // Clean markdown code blocks if Gemini accidentally included them
      const cleanMarkdown = markdown.replace(/^```markdown\n/, '').replace(/^```\n/, '').replace(/```$/, '');

      const { root } = transformer.transform(cleanMarkdown);
      
      if (mmRef.current) {
        mmRef.current.setData(root);
        mmRef.current.fit();
      } else {
        mmRef.current = Markmap.create(svgRef.current, {
          autoFit: true,
          // color: (node) => 'red', // Custom coloring example if needed
          duration: 500,
        }, root);
      }
    }
  }, [markdown]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (mmRef.current) {
        mmRef.current.fit();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    
    if (!isFullscreen) {
      if (wrapperRef.current.requestFullscreen) {
        wrapperRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Wait a tick for layout update then refit
      setTimeout(() => mmRef.current?.fit(), 100); 
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const downloadMarkdown = () => {
    if (!markdown) return;
    // Ensure clean markdown for file
    const cleanMarkdown = markdown.replace(/^```markdown\n/, '').replace(/^```\n/, '').replace(/```$/, '');
    const blob = new Blob([cleanMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mappa_mentale.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const downloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mappa_mentale.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const downloadPNG = () => {
    if (!svgRef.current) return;
    
    // Fit the map before capturing to ensure it's centered and visible
    mmRef.current?.fit();

    // Small delay to ensure fit animation or calculation is done
    setTimeout(() => {
        if (!svgRef.current) return;
        const serializer = new XMLSerializer();
        const svgData = serializer.serializeToString(svgRef.current);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            // Use 2x scale for better quality
            const scale = 2;
            const rect = svgRef.current!.getBoundingClientRect();
            canvas.width = rect.width * scale;
            canvas.height = rect.height * scale;
            
            const ctx = canvas.getContext("2d");
            if (ctx) {
                // Background color (white)
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw image
                ctx.scale(scale, scale);
                ctx.drawImage(img, 0, 0);
                
                const pngUrl = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.download = "mappa_mentale.png";
                link.href = pngUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }, 100);
    setShowExportMenu(false);
  };

  return (
    <div 
      ref={wrapperRef} 
      className={`relative w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col ${isFullscreen ? 'p-4' : ''}`}
    >
      <div className="absolute top-4 right-4 z-10 flex gap-2">
         {/* Export Dropdown */}
         <div className="relative export-menu-container">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur shadow-sm rounded-lg hover:bg-gray-100 text-gray-700 transition-colors border border-gray-100"
              title="Esporta Mappa"
            >
              <Download size={18} />
              <span className="text-sm font-medium hidden sm:inline">Esporta</span>
              <ChevronDown size={14} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 flex flex-col animate-in fade-in zoom-in-95 duration-100 overflow-hidden z-50">
                    <div className="px-4 py-2 border-b border-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Formati disponibili
                    </div>
                    <button onClick={downloadMarkdown} className="px-4 py-3 text-left text-sm hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 text-gray-700 transition-colors">
                        <FileText size={18} /> 
                        <div className="flex flex-col">
                            <span className="font-medium">Markdown</span>
                            <span className="text-xs text-gray-400">Struttura modificabile (.md)</span>
                        </div>
                    </button>
                    <button onClick={downloadPNG} className="px-4 py-3 text-left text-sm hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 text-gray-700 transition-colors">
                        <ImageIcon size={18} />
                         <div className="flex flex-col">
                            <span className="font-medium">Immagine PNG</span>
                            <span className="text-xs text-gray-400">Per presentazioni (.png)</span>
                        </div>
                    </button>
                    <button onClick={downloadSVG} className="px-4 py-3 text-left text-sm hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 text-gray-700 transition-colors">
                        <FileCode size={18} />
                        <div className="flex flex-col">
                            <span className="font-medium">Vettoriale SVG</span>
                            <span className="text-xs text-gray-400">Alta qualità scalabile (.svg)</span>
                        </div>
                    </button>
                </div>
            )}
        </div>

        <button 
          onClick={toggleFullscreen}
          className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg hover:bg-gray-100 text-gray-700 transition-colors border border-gray-100"
          title={isFullscreen ? "Esci da Schermo Intero" : "Schermo Intero"}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>
      
      <div className="flex-1 w-full h-full relative">
        <svg ref={svgRef} className="w-full h-full block" />
      </div>
      
      {!markdown && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400 p-6">
            <p className="text-lg font-medium">La tua mappa apparirà qui</p>
            <p className="text-sm">Inizia a chattare per generare una mappa mentale</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMapViewer;