import { useParams } from "react-router-dom";
import DropPage from "./DropPage";

export default function Drop() {
  const { token } = useParams<{ token: string }>();

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invalid Drop Link
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The drop link is missing or invalid.
          </p>
        </div>
      </div>
    );
  }

  return <DropPage token={token} />;
}
