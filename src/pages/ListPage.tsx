import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPokemonList } from '../api/pokemon';
import { PokemonListItem } from '../types/pokemon';
import { useBrowse } from '../context/BrowseContext';
import styles from './ListPage.module.css';

type SortKey = 'id' | 'name';
type SortDir = 'asc' | 'desc';

export default function ListPage() {
  const [data, setData] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const { setIds } = useBrowse();

  useEffect(() => {
    let mounted = true;
    setError(null);
    fetchPokemonList(151)
      .then((list) => { if (!mounted) return; setData(list); setLoading(false); })
      .catch((e) => { if (!mounted) return; setError('Failed to load Pokémon. Try again.'); setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q ? data.filter((p) => p.name.toLowerCase().includes(q)) : data.slice();
    list.sort((a, b) => {
      let cmp = sortKey === 'id' ? (a.id - b.id) : a.name.localeCompare(b.name);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [data, query, sortKey, sortDir]);

  useEffect(() => { setIds(filteredSorted.map((p) => p.id)); }, [filteredSorted, setIds]);

  return (
    <main className={styles.main}>
      <h1>List</h1>

      <div className={styles.controls}>
        <input
          className={styles.input}
          type="text"
          placeholder="Search Pokémon…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search"
        />
        <label>
          Sort by:{' '}
          <select className={styles.select} value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="id">ID</option><option value="name">Name</option>
          </select>
        </label>
        <label>
          Order:{' '}
          <select className={styles.select} value={sortDir} onChange={(e) => setSortDir(e.target.value as SortDir)}>
            <option value="asc">Ascending</option><option value="desc">Descending</option>
          </select>
        </label>
        <span className={styles.count}>Showing {filteredSorted.length} of {data.length}</span>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        filteredSorted.length === 0 ? (
          <p>No results.</p>
        ) : (
          <ul className={styles.list}>
            {filteredSorted.map((p) => (
              <li className={styles.item} key={p.id}>
                <img className={styles.thumb} src={p.image} alt={p.name} width={48} height={48} />
                <Link className={styles.link} to={`/pokemon/${p.id}`}>{p.id}. {capitalize(p.name)}</Link>
              </li>
            ))}
          </ul>
        )
      )}
    </main>
  );
}
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
