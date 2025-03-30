import React, { useState } from 'react';
import PokemonSelect from './components/PokemonSelect';
import Battle from './components/Battle';
import './index.css';
import { mockPokemons } from './data/mockPokemon';

function App() {
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);

  if (!player1 || !player2) {
    return (
      <PokemonSelect
        pokemons={mockPokemons}
        onSelect={(p1, p2) => {
          setPlayer1({ ...p1, currentHp: p1.hp });
          setPlayer2({ ...p2, currentHp: p2.hp });
        }}
      />
    );
  }

  return <Battle player1={player1} player2={player2} />;
}

export default App;