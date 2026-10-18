import React, {useEffect, useState} from 'react';

// Live PyPI download numbers, read from the public ClickHouse dataset that also
// powers clickpy.clickhouse.com. No key and no build step: the browser queries it
// directly. Only pip and uv are counted, so mirrors and crawlers stay out.
const ENDPOINT = 'https://sql-clickhouse.clickhouse.com/?user=demo';

const query = (project, days) => `
SELECT c.name AS country, sum(d.count) AS downloads
FROM pypi.pypi_downloads_per_day_by_version_by_installer_by_type_by_country AS d
LEFT JOIN pypi.countries AS c ON c.code = toString(d.country_code)
WHERE d.project = '${project}' AND d.date >= today() - ${days}
  AND d.installer IN ('pip', 'uv')
GROUP BY country WITH TOTALS ORDER BY downloads DESC LIMIT 10 FORMAT JSON`;

export default function DownloadStats({project = 'intelli', days = 180}) {
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(ENDPOINT, {method: 'POST', body: query(project, days)})
      .then((response) => response.json())
      .then((json) => {
        // WITH TOTALS sums every country, not only the 10 rows shown
        setTotal(Number(json.totals?.downloads || 0));
        setRows(json.data || []);
      })
      .catch(() => setFailed(true));
  }, [project, days]);

  if (failed) {
    return <p>Download stats are unavailable right now.</p>;
  }
  if (!rows) {
    return <p>Loading download stats...</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Country</th>
          <th align="right">Downloads</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.country}>
            <td>{row.country || 'Unknown'}</td>
            <td align="right">{Number(row.downloads).toLocaleString()}</td>
          </tr>
        ))}
        <tr>
          <td>
            <strong>All countries, last {Math.round(days / 30)} months</strong>
          </td>
          <td align="right">
            <strong>{total.toLocaleString()}</strong>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
