"use client";
import React, { useEffect, useState } from "react";
import FollowFeedItem from "./FollowFeedItem";
import { useInView } from "react-intersection-observer";
import { CircleLoader } from "react-spinners";
import getFeed from "@/app/actions/getFeed";

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
export default function FollowFeed({ following }: { following: number[] }) {
  const [offset, setOffset] = useState(0);
  const [loadingMoreFeed, setLoadingMoreFeed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState<Props[]>([]);

  const { ref, inView } = useInView();

  useEffect(() => {
    const loadFeed = async (offset: number) => {
      try {
        let pageSize = 0;
        if (window.innerWidth > 1500) {
          pageSize = 12;
        } else {
          pageSize = 8;
        }
        const data = await getFeed(following, offset, pageSize);
        setLoading(false);

        if (data.length < pageSize) {
          setLoadingMoreFeed(false);
        } else {
          setLoadingMoreFeed(true);
        }
        setFeed(data);
        setOffset(1);
      } catch (error) {
        console.error("Error loading Animals:", error);
      }
    };
    loadFeed(0);
  }, [following]);

  useEffect(() => {
    const loadMoreFeed = async () => {
      try {
        let pageSize = 0;
        if (window.innerWidth > 1500) {
          pageSize = 12;
        } else {
          pageSize = 8;
        }
        const data = await getFeed(following, offset, pageSize);
        if (data.length < pageSize) {
          setLoadingMoreFeed(false);
        }
        setFeed((prevFeed: Props[]) => [...prevFeed, ...data]);
        setOffset((prev) => prev + 1);
      } catch (error) {
        console.error("Error loading more animals:", error);
      }
    };
    if (inView) {
      loadMoreFeed();
    }
  }, [inView]);
  return (
    <div className="flex flex-col w-[21rem] sm:w-96 sm:min-w-96 gap-4 rounded-lg shadow-black shadow-lg max-h-[500px] min-h-[500px] sm:min-h-[792px] sm:max-h-[792px]  bg-gradient-to-br  from-gray-900 to-70% transition-all duration-200 to-gray-950 border hover:border-green-600 border-slate-200 group">
      <h2 className="text-2xl px-4 pb-1 pt-4">Follower Feed</h2>
      <div className=" px-4 space-y-4 overflow-auto border-t rounded-t-lg border-gray-200 pt-2 group-hover:border-green-600">
        {feed && feed.length > 0 ? (
          feed.map((post: Props, index: number) => (
            <FollowFeedItem post={post} key={index} />
          ))
        ) : (
          <p>Noch keine Posts</p>
        )}

        {loadingMoreFeed && (
          <div className="mb-4" ref={ref}>
            <CircleLoader color="#16A34A" />{" "}
          </div>
        )}
      </div>
    </div>
  );
}
