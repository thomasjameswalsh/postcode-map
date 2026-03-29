'use client';

import { useState } from "react";
import dynamic from "next/dynamic";

import { PostcodeRow } from "@/lib/types/postcodes";
import { GeojsonFeature } from "@/lib/types/geojson";

const PostcodeMap = dynamic(
  () => import('@/components/PostcodeMap'),
  { ssr: false }
);

export default function HomePage() {
  const [input, setInput] = useState("");
  const [postcodesData, setPostcodesData] = useState<PostcodeRow[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = input.trim();
    if (!trimmed) return;

    const response = await fetch(
      `/api/postcode?district=${encodeURIComponent(trimmed)}`
    );

    if ( ! response.ok ) {
      console.log("Postcode district not recognised.");
      return;
    }

    const responseData: PostcodeRow = await response.json();
    setPostcodesData((prev) => [...prev, responseData]);
    setInput("");
  }

  return (
    <div className = "p-6">
    <h1 className = "text-2xl font-bold">Postcode Map</h1>
    <div className = "mt-6">
      <PostcodeMap postcodesData = {postcodesData}></PostcodeMap>
    </div>

    <p className = "mt-2">Select postcodes:</p>

    <form onSubmit = {handleSubmit} className = "mt-4">
      <input 
        value = {input}
        onChange = {(e) => setInput(e.target.value)}
        placeholder = "e.g. CM21"
        className = "mt-4 w-full border p-2"
      />

      <button 
        type = "submit"
        className = "mt-2 border px-4 py-2"
      >Add</button>
    </form>

    <div className = "mt-6">
      <h2 className = "font-semibold">Entered Postcode</h2>

      {postcodesData.map((postcodeData, _index) => (
        <div
          key = {postcodeData.district_norm}
          className = "flex items-center gap-2 rounded-md border px-3 py-1 w-fit">
        
          <span>{postcodeData.district_norm}</span>

          <button
            type="button"
            onClick={() => {
              const updatedPostcodesData = postcodesData.filter(
                (p: PostcodeRow) => p.district_norm !== postcodeData.district_norm
              );
              setPostcodesData(updatedPostcodesData);
            }}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-xs hover:bg-red-500 hover:text-white transition"
          >✕</button>
        </div>
      ))}
      
    </div>
    </div>
  );
}