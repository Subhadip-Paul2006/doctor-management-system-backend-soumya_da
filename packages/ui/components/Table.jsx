import { cx } from "./_cx";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";

export function Table({ columns, data, loading = false, empty = null, className = "" }) {
  return (
    <div className={cx("overflow-x-auto rounded-lg border border-navy-200 bg-white", className)}>
      <table className="min-w-full divide-y divide-navy-200 text-sm">
        <thead className="bg-navy-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-navy-500"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-200 text-navy-800">
          {loading
            ? Array.from({ length: 3 }, (_, r) => (
                <tr key={r}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            : data && data.length > 0
              ? data.map((row, i) => (
                  <tr key={row.id ?? i} className="hover:bg-navy-50">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              : null}
        </tbody>
      </table>
      {!loading && (!data || data.length === 0) ? (
        (empty ?? <EmptyState title="No records found" />)
      ) : null}
    </div>
  );
}
