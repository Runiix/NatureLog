import { Public, PublicOff } from "@mui/icons-material";
import { useState } from "react";

type AnimalList = {
  id: string;
  title: string;
  description: string;
  is_public: boolean;
};
type AniamlListCardProps = {
  list: AnimalList;
  onClick: () => void;
};

export default function AnimalListCard({ onClick, list }: AniamlListCardProps) {
  const [currentAnimalList, setCurrentAnimalList] = useState<string | null>();
  return (
    <div
      onClick={onClick}
      className="flex flex-col w-full shadow-black shadow-lg bg-gradient-to-br  from-gray-950 to-70% transition-all duration-200 to-gray-900 hover:border-green-600 border border-gray-200 rounded-lg cursor-pointer p-4"
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
        {" "}
        <h2 className="text-xl">{list.title}</h2>
        {list.is_public ? (
          <Public className="text-green-600" />
        ) : (
          <PublicOff className="text-red-600" />
        )}
      </div>
      <p>{list.description}</p>
    </div>
  );
}
