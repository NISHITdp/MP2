import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPokemonList, fetchTypes, fetchTypeIds } from '../api/pokemon';
import { PokemonListItem } from '../types/pokemon';
import { useBrowse } from '../context/BrowseContext';
import styles from './GalleryPage.module.css';

export default function GalleryPage() {
  const [all, setAll] = useState<PokemonListItem[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtered, setFiltered] = useState<PokemonListItem[]>([]);

  const { setIds } = useBrowse();

  useEffect(() => {
    let mounted = true;
    setError(null);
    Promise.all([fetchPokemonList(151), fetchTypes()])
      .then(([list, tnames]) => {
        if (!mounted) return;
        setAll(list); setFiltered(list); setTypes(tnames); setLoading(false);
      })
      .catch(() => { if (!mounted) return; setError('Failed to load gallery.'); setLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (selected.size === 0) { setFiltered(all); return; }
    (async () => {
      const selectedArr = Array.from(selected);
      const sets = await Promise.all(selectedArr.map((t) => fetchTypeIds(t)));
      const intersection = sets.reduce<Set<number>>((acc, s, idx) => {
        if (idx === 0) return new Set(s);
        const next = new Set<number>();
        acc.forEach((id) => { if (s.has(id)) next.add(id); });
        return next;
      }, new Set<number>());
      setFiltered(all.filter((p) => intersection.has(p.id)));
    })();
  }, [selected, all, loading]);

  useEffect(() => { setIds(filtered.map((p) => p.id)); }, [filtered, setIds]);

  const toggle = (t: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const selectedLabel = useMemo(
    () => (selected.size ? `Filters: ${Array.from(selected).join(', ')}` : 'No filters'),
    [selected]
  );

  return (
    <main className={styles.main}>
      <h1>Gallery</h1>

      <div className={styles.filters}>
        <p style={{ margin: '0 0 8px' }}>
          Pick one or more types (results are the intersection). <em>{selectedLabel}</em>
        </p>
        <div className={styles.filterRow}>
          {types.map((t) => (
            <label key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={selected.has(t)} onChange={() => toggle(t)} />
              {t}
            </label>
          ))}
        </div>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        filtered.length === 0 ? (
          <p>No results.</p>
        ) : (
          <ul className={styles.grid}>
            {filtered.map((p) => (
              <li key={p.id}>
                <Link to={`/pokemon/${p.id}`} className={styles.card}>
                  <img className={styles.img} src={p.image} alt={p.name} width={120} height={120} />
                  <div className={styles.name}>
                    <strong>#{p.id}</strong>
                    <div>{p.name}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )
      )}
    </main>
  );
}
