"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
type Props = {
  id: number;
  user_id: string;
  username: string;
  animal_id: string;
  first_spotted_at: string;
  image: boolean;
  image_updated_at: string;
  common_name: string;
};
export default function FollowFeedItem({ post }: { post: Props }) {
  const [imageModal, setImageModal] = useState(false);
  const regex = /[äöüß ]/g;

  return (
    <div className=" bg-gradient-to-br  from-gray-900 to-70%  to-gray-950 border  border-slate-200 rounded-lg  justify-center shadow-lg shadow-black max-w-80">
      {post.image ? (
        <div className="flex flex-col">
          <h2 className="border-b border-gray-200  p-2 text-xl w-full">
            {" "}
            <Link
              className="hover:underline text-green-600  "
              href={`/profilepage/${post.username}`}
            >
              {post.username}
            </Link>{" "}
          </h2>
          <div className="px-2 pt-2">
            <p className="text-sm">hat ein neues Foto hinzugefügt: </p>
            <Link
              className="hover:underline text-green-600 text-xl "
              href={`/animalpage/${post.common_name}`}
            >
              {post.common_name}
            </Link>{" "}
          </div>
          <Image
            src={`https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${
              post.user_id
            }/Collection/${post.common_name.replace(regex, "_") + ".jpg"}`}
            alt={post.common_name}
            height="300"
            width="500"
            className="mx-auto mt-2 hover:opacity-80 cursor-pointer h-auto w-auto max-h-[500px] rounded-b-lg"
            onClick={() => setImageModal(true)}
          />
          {imageModal && (
            <div className="fixed top-0 left-0 w-screen h-screen bg-black/70 z-50">
              <div
                className=" top-0 left-0 w-full xl:w-5/6 mx-auto h-5/6 z-50  bg-opacity-30 flex items-center justify-center relative"
                onClick={() => setImageModal((prev) => !prev)}
              >
                <div className="relative flex items-center justify-center w-screen h-screen">
                  <Image
                    src={`https://umvtbsrjbvivfkcmvtxk.supabase.co/storage/v1/object/public/profiles/${
                      post.user_id
                    }/CollectionModals/${
                      post.common_name.replace(regex, "_") + ".jpg"
                    }`}
                    alt=""
                    width={800}
                    height={800}
                    className="max-w-full max-h-full object-contain"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="border-b border-gray-200  p-2 text-xl w-full">
            {" "}
            <Link
              className="hover:underline text-green-600  "
              href={`/profilepage/${post.username}`}
            >
              {post.username}
            </Link>{" "}
          </h2>
          <div className="p-2">
            <p className="text-sm">hat eine neue Art hinzugefügt: </p>
            <Link
              className="hover:underline text-green-600 text-xl "
              href={`/animalpage/${post.common_name}`}
            >
              {post.common_name}
            </Link>{" "}
          </div>
        </div>
      )}
    </div>
  );
}
