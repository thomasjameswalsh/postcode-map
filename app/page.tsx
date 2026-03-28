'use client';

import { useState } from "react";
import dynamic from "next/dynamic";

const PostcodeMap = dynamic(
  () => import('@/components/PostcodeMap'),
  { ssr: false }
);

export default function HomePage() {
  const [input, setInput] = useState("");
  const [postcodes, setPostcodes] = useState<string[]>([]);
  const [features, setFeatures] = useState<any[]>([]);

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

    const data = await response.json();

    setPostcodes((prev) => [...prev, data.district_norm]);
    setFeatures((prev) => [...prev, data.feature]);
    setInput("");
  }

  return (
    <div className = "p-6">
    <h1 className = "text-2xl font-bold">Postcode Map</h1>
    <div className = "mt-6">
      <PostcodeMap features={features}></PostcodeMap>
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

      {postcodes.map((postcode, index) => (
        <div
          key = {postcode}
          className = "flex items-center gap-2 rounded-md border px-3 py-1 w-fit">
        
          <span>{postcode}</span>

          <button
            type="button"
            onClick={() => {
              const updatedPostcodes = postcodes.filter((p) => p !== postcode);
              const updatedFeatures = features.filter((f) => f.properties.name !== postcode);
              setPostcodes(updatedPostcodes);
              setFeatures(updatedFeatures);
            }}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-xs hover:bg-red-500 hover:text-white transition"
          >✕</button>
        </div>
      ))}
      
    </div>
    </div>
  );
}