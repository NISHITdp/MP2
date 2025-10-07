import client from './client';
import { Pokemon, PokemonListItem, NamedAPIResource } from '../types/pokemon';
import { getCache, setCache } from '../utils/cache';

const DAY = 24 * 60 * 60 * 1000;

function idFromUrl(url: string): number {
  const m = url.match(/\/pokemon\/(\d+)\//);
  return m ? Number(m[1]) : NaN;
}

function artUrl(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export async function fetchPokemonList(limit = 151, offset = 0): Promise<PokemonListItem[]> {
  const key = `poke:list:${limit}:${offset}`;
  const cached = getCache<PokemonListItem[]>(key);
  if (cached) return cached;

  const res = await client.get<{ results: NamedAPIResource[] }>(`pokemon?limit=${limit}&offset=${offset}`);
  const list = res.data.results.map((r) => {
    const id = idFromUrl(r.url);
    return { ...r, id, image: artUrl(id) };
  });

  setCache(key, list, DAY);
  return list;
}

export async function fetchPokemon(idOrName: string | number): Promise<Pokemon> {
  const key = `poke:detail:${idOrName}`;
  const cached = getCache<Pokemon>(key);
  if (cached) return cached;

  const res = await client.get<Pokemon>(`pokemon/${idOrName}`);
  setCache(key, res.data, DAY);
  return res.data;
}


export async function fetchTypes(): Promise<string[]> {
    const key = `poke:types:all`;
    const cached = getCache<string[]>(key);
    if (cached) return cached;
  
    const res = await client.get<{ results: { name: string; url: string }[] }>('type');
    const names = res.data.results.map(r => r.name).sort();
    setCache(key, names, DAY);
    return names;
  }
  
  export async function fetchTypeIds(typeName: string): Promise<Set<number>> {
    const key = `poke:type:${typeName}`;
    const cached = getCache<number[]>(key);
    if (cached) return new Set(cached);
  
    const res = await client.get<{ pokemon: { pokemon: { name: string; url: string } }[] }>(`type/${typeName}`);
    const ids = res.data.pokemon
      .map(entry => {
        const m = entry.pokemon.url.match(/\/pokemon\/(\d+)\//);
        return m ? Number(m[1]) : NaN;
      })
      .filter(n => !Number.isNaN(n));
  
    setCache(key, ids, DAY);
    return new Set(ids);
  }
  