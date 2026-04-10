'use client';

import { useState } from "react";
import dynamic from "next/dynamic";

import { PostcodeRow } from "@/lib/types/postcodes";
import { GeojsonFeature } from "@/lib/types/geojson";

const PostcodeMap = dynamic(
  () => import('@/components/PostcodeMap'),
  { ssr: false }
);

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
  const [neighboursData, setNeighboursData] = useState<PostcodeRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErrorMessage("");

    // The normalised and regex could be their own functions 
    // Maybe even one that checks validity and returns an error message somehow 
    const normalised = input
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    if ( ! normalised ) {
      setErrorMessage("Please enter a valid postcode.");
      return;
    }

    setInput(normalised);

    const districtPattern = /^[A-Z]{1,2}([0-9]{1,2}|[0-9][A-Z])$/;
    if ( ! districtPattern.test(normalised) ) {
      setErrorMessage("Invalid postcode district format.");
      return;
    }

    const setOfDistricts = new Set<string>([
      ...postcodesData.map((row) => row.district_norm)
    ]);
    if ( setOfDistricts.has(normalised) ) {
      setErrorMessage("District already added to list.");
      return;
    }

    // Here we check if it exists in neighborus set or not 
    // If it does, move it 
    const checkForInputDistrictData = neighboursData.find((data) => {
      data.district_norm === normalised
    });
    if ( checkForInputDistrictData ) {
      const updatedNeighboursData = neighboursData.filter(
        (p: PostcodeRow) => p.district_norm !== normalised
      );
      
      setNeighboursData(updatedNeighboursData);
      setPostcodesData((prev) => [...prev, checkForInputDistrictData]);
      setInput("");
      setErrorMessage("");
      return;
    }

    // This could be it's own function
    const postcodeResponse = await fetch(
      `/api/postcode?district=${encodeURIComponent(normalised)}`
    );

    if ( ! postcodeResponse.ok ) {
      if ( postcodeResponse.status === 404) {
        setErrorMessage("Map data for this postcode district cannot be found.");
      } else {
        setErrorMessage(`Something went wrong, please try again. Code ${postcodeResponse.status}`);
      }
      return;
    }

    const postcodeResponseData: PostcodeRow = await postcodeResponse.json();

    // This could be it's own function 
    const neighboursResponse = await fetch(
      `api/neighbours?district=${encodeURIComponent(normalised)}`
    );
    if ( neighboursResponse.ok ) {
      const neighboursResponseData: PostcodeRow[] = await neighboursResponse.json();

      const existingDistricts = new Set<string>([
        ...postcodesData.map((row) => row.district_norm),
        ...neighboursData.map((row) => row.district_norm),
      ]);

      const filteredNeighbours = neighboursResponseData.filter((row) => {
        return (! existingDistricts.has(row.district_norm));
      });

      setNeighboursData((prev) => [...prev, ...filteredNeighbours]);
    } else {
        setErrorMessage(`Neighbours for this postcode cannot be found. Code ${neighboursResponse.status}`);
    }

    setPostcodesData((prev) => [...prev, postcodeResponseData]);
    setInput("");
    setErrorMessage("");
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
                maxLength={12}
              />
              <Button type = "submit">Add</Button>
              </Field>
            </form>

            {errorMessage && <p className = "text-sm text-red-600 mt-1">{errorMessage}</p>}

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
          <PostcodeMap
            postcodesData = {postcodesData}
            neighboursData = {neighboursData}
          ></PostcodeMap>
        </div>
      </div>
    </div>
  );
}