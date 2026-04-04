"use client";

import { AddAPhoto } from "@mui/icons-material";
import Image from "next/image";
import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";

export default function AnimalRecognizer() {
  const [image, setImage] = useState("");
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {}, [image]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // Show preview
      const results = await classifyImage(file);
      setPredictions(results);
    }
  };
  async function classifyImage(file: File) {
    const API_URL =
      "https://api-inference.huggingface.co/models/microsoft/resnet-152";
    const API_KEY = process.env.API_KEY; // Replace with your actual API key
    if (file) {
      const options = {
        maxSizeKB: 100, // Target size
        maxWidthOrHeight: 1920, // Resize if needed
        useWebWorker: true,
      };
      try {
        if (file.size > 5 * 1024 * 1024) {
          // If file is >5MB, compress
          const compressedFile = await imageCompression(file, options);
          // Convert image to Base64
          const toBase64 = (file: File): Promise<string> =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = (error) => reject(error);
            });
          try {
            const base64Image = await toBase64(compressedFile);
            const response = await fetch(API_URL, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ inputs: base64Image.split(",")[1] }), // Remove metadata part of Base64 string
            });
            const result = await response.json();
            return result;
          } catch (error) {
            console.error("Error classifying image:", error);
          }
        }
      } catch (error) {
        console.error("Compression failed:", error);
      }
    }
  }

  return (
    <div className="flex items-center gap-6 justify-center bg-gray-900 rounded-lg">
      <label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />{" "}
        {image ? (
          <Image
            src={image}
            alt="Uploaded preview"
            className="w-40 cursor-pointer hover:opacity-90"
            width={200}
            height={200}
            unoptimized
          />
        ) : (
          <AddAPhoto className="cursor-pointer hover:text-green-600 text-6xl" />
        )}
      </label>

      {predictions.length > 0 && (
        <div className="mt-4 ">
          <h2 className="text-lg font-bold">Predictions:</h2>
          <ul className="">
            {predictions.map(
              (pred: { label: string; score: number }, index: number) => (
                <li key={index}>
                  {pred.label} - {Math.round(pred.score * 100)}%
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
