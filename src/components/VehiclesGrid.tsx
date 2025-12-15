"use client";

import Image from "next/image";
import Link from "next/link";

interface VehiclesGridProps {
  title: string;
  images: string[];
  category: string;
}

export default function VehiclesGrid({ title, images, category }: VehiclesGridProps) {
  // Format the category for display (e.g., "Tier 1")
  const formattedCategory = category.replace(/(\d+)/, " $1").toUpperCase();

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1a0a08] via-[#140f0b] to-[#140f0b] relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#fa5d3d]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#fa5d3d]/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 rounded-full bg-[#fa5d3d]/10 border border-[#fa5d3d]/30">
            <span className="text-[#fa5d3d] text-sm font-semibold uppercase tracking-widest">
              {formattedCategory} Collection
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight font-orbitron text-white">
            {title}
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#fa5d3d] to-transparent mx-auto rounded-full" />
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((imgName, index) => {
            // Clean up name for display (remove ext, etc)
            const displayName = imgName
              .replace(/\.[^/.]+$/, "")
              .replace(/([A-Z])/g, " $1")
              .trim()
              .toUpperCase();

            return (
              <div
                key={imgName}
                className="group relative bg-[#1a0a08]/80 rounded-xl overflow-hidden border border-[#fa5d3d]/20 hover:border-[#fa5d3d]/60 transition-all duration-300 hover:shadow-[0_0_40px_rgba(250,93,61,0.2)]"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
                  <Image
                    src={`/cars/${category}/${imgName}`}
                    alt={displayName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  
                  {/* Tier Badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#fa5d3d]/90 backdrop-blur-sm">
                    <span className="text-white text-xs font-bold uppercase tracking-wider">
                      {formattedCategory}
                    </span>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="p-4 relative">
                  <h3 className="text-white font-orbitron font-bold text-sm mb-1 line-clamp-1 group-hover:text-[#fa5d3d] transition-colors duration-300">
                    {displayName}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[hsl(220_15%_72%)] text-xs font-mono">
                      VEHICLE #{String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#fa5d3d]/50" />
                  </div>
                </div>

                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#fa5d3d] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            );
          })}
        </div>

        {/* Back Navigation */}
        <div className="text-center mt-16">
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#fa5d3d]/10 border border-[#fa5d3d]/30 text-[#fa5d3d] hover:bg-[#fa5d3d]/20 hover:border-[#fa5d3d]/60 transition-all duration-300 font-semibold"
          >
            <span>←</span>
            <span>Back to Collections</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
