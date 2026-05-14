import React from "react";

const SKELETON_CELLS = 48;

const AlbumGridSkeleton = () => (
  <div className="grid grid-cols-4 gap-2 p-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
    {Array.from({ length: SKELETON_CELLS }).map((_, index) => (
      <div
        key={index}
        className="aspect-square animate-pulse rounded-2xl bg-slate-800/70"
      />
    ))}
  </div>
);

export default AlbumGridSkeleton;
