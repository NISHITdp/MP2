export interface NamedAPIResource {
    name: string;
    url: string;
  }
  
  export interface PokemonListItem extends NamedAPIResource {
    id: number;    // derived from URL
    image: string; // official artwork URL
  }
  
  export interface PokemonType {
    slot: number;
    type: NamedAPIResource;
  }
  
  export interface PokemonStat {
    base_stat: number;
    stat: NamedAPIResource;
  }
  
  export interface PokemonSprites {
    other?: {
      ['official-artwork']?: { front_default: string | null };
    };
    front_default?: string | null;
  }
  
  export interface Pokemon {
    id: number;
    name: string;
    types: PokemonType[];
    stats: PokemonStat[];
    height: number;
    weight: number;
    sprites: PokemonSprites;
  }
  