'use client';

import { useState } from "react";
import dynamic from "next/dynamic";

import { PostcodeRow } from "@/lib/types/postcodes";
import { GeojsonFeature } from "@/lib/types/geojson";

const PostcodeMap = dynamic(
  () => import('@/components/PostcodeMap'),
  { ssr: false }
);

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

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

      <div className = "space-y-1">
        <h1 className = "text-2xl font-bold">Thomas' Postcode Districts Map</h1>
        <p className = "text-sm text-muted-foreground">
          Select postcode districts
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card className = "h-fit">
          <CardHeader>
            <CardTitle>List Postcode Districts</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit = {handleSubmit} className = "space-y-3">
              <Field orientation="horizontal">
              <Input 
                value = {input}
                onChange = {(e) => setInput(e.target.value)}
                placeholder = "e.g. CM21"
              />
              <Button type = "submit">Add</Button>
              </Field>
            </form>

            <Separator />

            <div className = "flex flex-wrap gap-2">
              {postcodesData.map((postcodeData, _index) => (
                <div
                  key = {postcodeData.district_norm}
                  className="flex items-center justify-between gap-2 min-w-[100px] rounded-md border px-3 py-1">
                  
                  <div className = "min-w-[40px]">
                  <span>{postcodeData.district_norm}</span>
                  </div>

                  <Separator orientation="vertical" />

                  <Button
                    type="button"
                    variant = "ghost"
                    size = "icon"
                    onClick={() => {
                      const updatedPostcodesData = postcodesData.filter(
                        (p: PostcodeRow) => p.district_norm !== postcodeData.district_norm
                      );
                      setPostcodesData(updatedPostcodesData);
                    }}
                    className="h-5 w-5 hover:bg-red-500 hover:text-white transition"
                  >✕</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
       <div className = "h-[75vh] min-h-[700px] w-full">
          <PostcodeMap postcodesData = {postcodesData}></PostcodeMap>
        </div>`
      </div>
    </div>
  );
}