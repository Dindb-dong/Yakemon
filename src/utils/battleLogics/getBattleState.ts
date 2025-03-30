import { MoveInfo, getMoveInfo } from "../../models/Move";
import { PokemonInfo } from "../../models/Pokemon";
import { WeatherEffect, getWeatherEffect } from "../weatherEffects";

type ItemInfo = {
  id: number;
  name: string;
};

type BattleInput = {
  myPokemon: PokemonInfo;
  opponentPokemon: PokemonInfo;
  moveInfo: MoveInfo;
  itemInfo: ItemInfo | null;
  weatherEffect: WeatherEffect | null;
};

async function getBattleState({
  myEntityID,
  opponentEntityID,
  myMoveName,
  myItemNum,
  weather,
}: {
  myEntityID: string;
  opponentEntityID: string;
  myMoveName: string;
  myItemNum?: number;
  weather?: string;
}): Promise<BattleInput> {
  const myPokemon = await getMyPokemonInfo(myEntityID);
  const opponentPokemon = await getOpponentPokemonInfo(opponentEntityID);
  const moveInfo = await getMoveInfo(myMoveName);
  const itemInfo = myItemNum ? await getItemInfo(myItemNum) : null;
  const weatherEffect = weather
    ? await getWeatherEffect(weather, moveInfo.type, opponentPokemon.types)
    : null;

  return {
    myPokemon,
    opponentPokemon,
    moveInfo,
    itemInfo,
    weatherEffect,
  };
}

async function getMyPokemonInfo(entityID: string): Promise<PokemonInfo> {
  // 포켓몬 정보 가져오는 로직
  return {} as PokemonInfo;
}

async function getOpponentPokemonInfo(entityID: string): Promise<PokemonInfo> {
  // 상대 포켓몬 정보 가져오는 로직
  return {} as PokemonInfo;
}

async function getItemInfo(itemNum: number): Promise<ItemInfo> {
  // 아이템 정보 가져오는 로직
  return {} as ItemInfo;
}