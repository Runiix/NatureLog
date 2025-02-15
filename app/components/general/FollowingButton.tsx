// "use client";

// import { ReactEventHandler, useEffect, useState } from "react";
// import { addOrRemoveAnimals } from "../../actions/addOrRemoveAnimal";
// import { usePathname } from "next/navigation";
// import { Add, Favorite } from "@mui/icons-material";

// export default function FollowingButton({
//   user,
//   id,
//   spottedList,
//   styles,
// }: {
//   user?: any;
//   id?: number;
//   spottedList?: number[];
//   styles?: string;
// }) {
//   const [isFollowed, setIsFollowed] = useState("false");
//   const pathname = usePathname();
//   useEffect(() => {
//     const checkIfFollowed = () => {
//       if (spottedList !== undefined) {
//         const isSpotted = spottedList.some((item) => item === id);
//         if (isSpotted) setIsFollowed("true");
//       }
//     };
//     checkIfFollowed();
//   }, [id, spottedList]);
//   function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
//     e.stopPropagation();
//   }

//   return (
//     <div className={styles}>
//       {user && (
//         <form
//           id="spottedForm"
//           onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
//             e.preventDefault();
//             const response = await addOrRemoveAnimals(
//               new FormData(e.currentTarget)
//             );
//             if (response.success) {
//               setIsFollowing(String(response.isFollowing));
//             } else {
//               console.error(response.error);
//             }
//           }}
//         >
//           <input type="hidden" name="animalId" value={id} />
//           <input type="hidden" name="isSpotted" value={isFollowed} />
//           <input type="hidden" name="pathname" value={pathname} />

//           <button type="submit" className="" onClick={handleClick}>
//             {isFollowed === "true" ? (
//               <p>gefolgt</p>
//             ) : (
//               <p className="bg-green-600 rounded-lg cursor-pointer">folgen</p>
//             )}
//           </button>
//         </form>
//       )}
//     </div>
//   );
// }
