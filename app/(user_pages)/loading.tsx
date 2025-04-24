import { CircleLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="text-green-600 text-5xl mt-20 w-full h-full flex items-center justify-center">
      Seite wird geladen <CircleLoader color="#16A34A" />
    </div>
  );
}
