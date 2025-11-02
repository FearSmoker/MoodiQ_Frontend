import { Loader2 } from 'lucide-react';

export const Loader = () => {
  return (
    <div className="flex justify-center items-center w-full py-4">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
    </div>
  );
};