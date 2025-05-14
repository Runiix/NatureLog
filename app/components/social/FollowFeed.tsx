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
    <div className="flex flex-col gap-4 mt-4 mx-auto">
      <h2 className="text-xl">Follower Feed</h2>
      {feed &&
        feed.map((post: Props, index: number) => (
          <FollowFeedItem post={post} key={index} />
        ))}
      {loadingMoreFeed && (
        <div className="mb-4" ref={ref}>
          <CircleLoader color="#16A34A" />{" "}
        </div>
      )}
    </div>
  );
}
