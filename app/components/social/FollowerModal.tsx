"use client";

import { useEffect, useState } from "react";
import Modal from "../general/Modal";
import SocialFilter from "./SocialFilter";
import Search from "../general/Search";
import SocialList from "./SocialList";
import { User } from "@supabase/supabase-js";
import { Diversity3 } from "@mui/icons-material";

export default function FollowerModal({
  user,
  following,
}: {
  user: User;
  following: string[];
}) {
  const [showFollowerModal, setShowFollowerModal] = useState(false);
  useEffect(() => {
    if (showFollowerModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showFollowerModal]);
  return (
    <div className="mb-4">
      <button
        className="bg-green-600 hover:bg-green-700 hover:text-gray-900 trasition-all duration-200 border border-gray-200 rounded-lg p-4 flex items-center gap-1"
        onClick={() => setShowFollowerModal(true)}
      >
        <Diversity3 />
        Freunde
      </button>
      {showFollowerModal && (
        <Modal
          styles={"h-[600px] overflow-y-auto"}
          closeModal={() => setShowFollowerModal((prev) => !prev)}
        >
          {" "}
          <div className=" flex flex-col items-center gap-4 md:gap-10  rounded-lg  pb-10">
            <SocialFilter />
            <Search placeholder="NatureLogger Suchen" />
            <SocialList user={user} following={following} />
          </div>
        </Modal>
      )}
    </div>
  );
}
