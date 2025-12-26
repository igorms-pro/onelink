export function FeatureTableHeader() {
  return (
    <thead>
      <tr className="border-b border-gray-200 dark:border-gray-700">
        <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">
          Feature
        </th>
        <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">
          Free
        </th>
        <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white bg-purple-50 dark:bg-purple-900/20">
          Pro
        </th>
      </tr>
    </thead>
  );
}
