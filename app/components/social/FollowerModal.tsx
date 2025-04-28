"use client";

import { useState } from "react";
import Modal from "../general/Modal";
import SocialFilter from "./SocialFilter";
import Search from "../general/Search";
import SocialList from "./SocialList";
import { User } from "@supabase/supabase-js";

export default function FollowerModal({
  user,
  following,
}: {
  user: User;
  following: string[];
}) {
  const [showFollowerModal, setShowFollowerModal] = useState(false);
  return (
    <div>
      <button
        className="bg-gray-900 border border-gray-200 rounded-lg absolute top-20 right-20 p-4"
        onClick={() => setShowFollowerModal(true)}
      >
        Followers
      </button>
      {showFollowerModal && (
        <Modal closeModal={() => setShowFollowerModal((prev) => !prev)}>
          {" "}
          <div className="mt-16 flex flex-col items-center gap-10  rounded-lg  py-10">
            <SocialFilter />
            <Search placeholder="NatureLogger Suchen" />
            <SocialList user={user} following={following} />
          </div>
        </Modal>
      )}
    </div>
  );
}
