import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPokemon, fetchPokemonList } from '../api/pokemon';
import { Pokemon } from '../types/pokemon';
import { useBrowse } from '../context/BrowseContext';
import styles from './DetailPage.module.css';

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ids, setIds } = useBrowse();

  const [data, setData] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setError(null); setLoading(true);
    fetchPokemon(id)
      .then((p) => { setData(p); setLoading(false); })
      .catch(() => { setError('Failed to load details.'); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (ids.length === 0) {
      fetchPokemonList(151).then((list) => setIds(list.map((p) => p.id)));
    }
  }, [ids.length, setIds]);

  const index = useMemo(() => (!data || ids.length === 0 ? -1 : ids.indexOf(data.id)), [data, ids]);
  const prevId = useMemo(() => (index < 0 ? null : ids[(index - 1 + ids.length) % ids.length]), [index, ids]);
  const nextId = useMemo(() => (index < 0 ? null : ids[(index + 1) % ids.length]), [index, ids]);

  return (
    <main className={styles.main}>
      <h1>Detail</h1>

      {loading && <p>Loading…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && !data && <p>Not found.</p>}

      {data && (
        <article className={styles.article}>
          <header className={styles.header}>
            <img
              className={styles.thumb}
              src={data.sprites.other?.['official-artwork']?.front_default ?? data.sprites.front_default ?? ''}
              alt={data.name}
              width={120}
              height={120}
            />
            <div>
              <h2 style={{ margin: 0 }}>#{data.id} {capitalize(data.name)}</h2>
              <p style={{ margin: 0 }}>
                Types: {data.types.map((t) => capitalize(t.type.name)).join(', ')}
              </p>
              <p style={{ margin: 0 }}>
                Height: {data.height} | Weight: {data.weight}
              </p>
            </div>
          </header>

          <section>
            <h3>Stats</h3>
            <ul className={styles.stats}>
              {data.stats.map((s) => (
                <li key={s.stat.name}>{capitalize(s.stat.name)}: {s.base_stat}</li>
              ))}
            </ul>
          </section>

          <footer className={styles.buttons}>
            <button disabled={!prevId} onClick={() => prevId && navigate(`/pokemon/${prevId}`)}>← Previous</button>
            <button disabled={!nextId} onClick={() => nextId && navigate(`/pokemon/${nextId}`)}>Next →</button>
          </footer>
        </article>
      )}
    </main>
  );
}
