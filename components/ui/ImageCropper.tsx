import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import Button from './Button';

interface ImageCropperProps {
  imageSrc: string;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onConfirm, onCancel }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Crop state in percentages (0-100)
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState<'move' | 'se'>('move'); // Simplified to move and resize-se for robustness
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startCrop, setStartCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const getClientPos = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, action: 'move' | 'se') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragAction(action);
    setStartPos(getClientPos(e));
    setStartCrop({ ...crop });
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return;
      e.preventDefault();

      const currentPos = getClientPos(e);
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate delta in percentages relative to the container size
      const deltaX = ((currentPos.x - startPos.x) / rect.width) * 100;
      const deltaY = ((currentPos.y - startPos.y) / rect.height) * 100;

      let newCrop = { ...startCrop };

      if (dragAction === 'move') {
        newCrop.x = Math.min(Math.max(startCrop.x + deltaX, 0), 100 - startCrop.width);
        newCrop.y = Math.min(Math.max(startCrop.y + deltaY, 0), 100 - startCrop.height);
      } else if (dragAction === 'se') {
        newCrop.width = Math.min(Math.max(startCrop.width + deltaX, 10), 100 - startCrop.x);
        newCrop.height = Math.min(Math.max(startCrop.height + deltaY, 10), 100 - startCrop.y);
      }

      setCrop(newCrop);
    };

    const handleUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, dragAction, startPos, startCrop]);

  const executeCrop = () => {
    if (!imageRef.current) return;
    
    const canvas = document.createElement('canvas');
    const img = imageRef.current;
    
    // Get natural dimensions
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    
    // Map percentages to pixels
    const pxX = (crop.x / 100) * naturalW;
    const pxY = (crop.y / 100) * naturalH;
    const pxW = (crop.width / 100) * naturalW;
    const pxH = (crop.height / 100) * naturalH;

    canvas.width = pxW;
    canvas.height = pxH;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(img, pxX, pxY, pxW, pxH, 0, 0, pxW, pxH);
    
    canvas.toBlob((blob) => {
      if (blob) onConfirm(blob);
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Crop Image</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative bg-black flex items-center justify-center p-4">
          <div ref={containerRef} className="relative inline-block select-none">
            {/* The Image */}
            <img 
              ref={imageRef}
              src={imageSrc} 
              alt="Crop target" 
              className="max-h-[70vh] max-w-full object-contain pointer-events-none select-none"
              draggable={false}
            />
            
            {/* Dark Overlay for non-selected areas */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>

            {/* The Crop Box (Visible Area) */}
            {/* We recreate the visible image part inside the crop box to simulate a "hole" in the overlay */}
            <div 
                className="absolute overflow-hidden border-2 border-white shadow-xl"
                style={{
                    left: `${crop.x}%`,
                    top: `${crop.y}%`,
                    width: `${crop.width}%`,
                    height: `${crop.height}%`
                }}
            >
                {/* 
                   Displaying the same image inside the crop box, positioned absolutely negatively 
                   to match the parent image's position. This is a common CSS trick for crop UIs 
                   to avoid complex clip-paths or canvas overlays.
                   
                   Calculation:
                   If crop.x is 10%, we need to shift the inner image left by 10% of container width.
                   Since we don't know pixel width easily in CSS without calc(), a simpler approach for the visual
                   is often just a clear border box or using box-shadow to darken outside.
                   
                   Let's switch to the box-shadow trick which is cleaner than double images.
                */}
            </div>
            
            {/* 
               Alternative Overlay Implementation using Box Shadow for the "Hole" effect.
               This element sits ON TOP of everything and provides the dark surrounding.
            */}
             <div 
                className="absolute border-2 border-white box-content cursor-move"
                style={{
                    left: `${crop.x}%`,
                    top: `${crop.y}%`,
                    width: `${crop.width}%`,
                    height: `${crop.height}%`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
                onTouchStart={(e) => handleMouseDown(e, 'move')}
            >
                {/* Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                    <div className="border-r border-white/70 col-span-1 h-full"></div>
                    <div className="border-r border-white/70 col-span-1 h-full"></div>
                    <div className="border-b border-white/70 row-span-1 col-span-3 absolute top-1/3 w-full"></div>
                    <div className="border-b border-white/70 row-span-1 col-span-3 absolute top-2/3 w-full"></div>
                </div>

                {/* Resize Handle (Bottom Right) */}
                <div 
                    className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-yellow-500 border-2 border-white cursor-se-resize rounded-full shadow-lg z-10"
                    onMouseDown={(e) => handleMouseDown(e, 'se')}
                    onTouchStart={(e) => handleMouseDown(e, 'se')}
                />
            </div>

          </div>
        </div>

        <div className="p-4 border-t border-slate-700 flex justify-between items-center bg-slate-800 rounded-b-xl">
           <div className="text-xs text-slate-400">
               Drag inside to move. Drag yellow handle to resize.
           </div>
           <div className="flex gap-3">
             <Button variant="secondary" onClick={onCancel}>
                Cancel
             </Button>
             <Button onClick={executeCrop} className="bg-yellow-600 hover:bg-yellow-500 text-white">
                <Check className="w-4 h-4 mr-2" />
                Apply Crop
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;