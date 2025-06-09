import { aggregateTopScores, aggregateTopPlayers, aggregateTopGames } from "../data-access/statistics.js";

export async function getTopScoresService() {
  return await aggregateTopScores();
}

export async function getTopPlayersService() {
  return await aggregateTopPlayers();
}

export async function getTopGamesService() {
  return await aggregateTopGames();
}
