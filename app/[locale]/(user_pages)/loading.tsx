import { Spinner } from "../components/ui/Spinner";

/** Fallback for signed-in routes without their own skeleton. */
export default function Loading() {
  return (
    <div className="mt-64 flex h-full w-full items-center justify-center text-accent">
      <Spinner size="lg" label="Loading" />
    </div>
  );
}
