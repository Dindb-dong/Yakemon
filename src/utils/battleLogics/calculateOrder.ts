import { useBattleStore } from "../../Context/useBattleStore";
import { MoveInfo } from "../../models/Move";
import { calculateRankEffect } from "./rankEffect";

export async function calculateOrder(playerMove: MoveInfo | void, aiMove: MoveInfo | void): Promise<string> {
  // 선공권 누구한테 있는지 계산하는 함수. 
  // 우선도 있는 기술의 경우, 무조건 먼저 공격. 
  // 내 기술의 우선도, 상대 기술의 우선도, 내 스피드, 상대 스피드를 따져야 함. 
  // 우선도가 없을 경우, 스피드 높은 쪽이 먼저 행동함. 단, 트릭룸이 있으면 거꾸로임. 
  // 왼쪽에 있는 플레이어 기준이므로, myPokemon 고정.
  let whoIsFirst: string;
  const { publicEnv, myTeam, activeMy, enemyTeam, activeEnemy, addLog } = useBattleStore.getState();
  const myPokemon = myTeam[activeMy];
  const opponentPokemon = enemyTeam[activeEnemy];
  let mySpeed = myPokemon.base.speed;
  mySpeed *= calculateRankEffect(myPokemon.rank.speed);
  if (myPokemon.status.includes('마비')) {
    mySpeed *= 0.5;
  }
  let opponentSpeed = opponentPokemon.base.speed;
  opponentSpeed *= calculateRankEffect(opponentPokemon.rank.speed);
  if (opponentPokemon.status.includes('마비')) {
    opponentSpeed *= 0.5;
  }
  if (publicEnv.room === '트릭룸') {
    mySpeed *= -1;
    opponentSpeed *= -1;
  }

  let speedDiff = mySpeed - opponentSpeed;
  if (speedDiff === 0) {
    speedDiff = (Math.random() - 0.5) // 스피드 같은 경우, 랜덤하게 정해짐. 
  }

  whoIsFirst = speedDiff >= 0 ? 'my' : 'enemy';

  // 이 아래는 우선도 있는 기술이 사용됐을 경우에만. 
  if (playerMove && playerMove.priority && aiMove && aiMove.priority) { // 둘 다 우선도 가진 기술 사용했을 경우 
    const myPriority = playerMove.priority
    const aiPriority = aiMove.priority
    const priorityDiff = myPriority - aiPriority;
    if (priorityDiff > 0) { // 내 우선도가 높을 때 
      whoIsFirst = 'my';
    } else if (priorityDiff === 0) { // 우선도가 같아서 스피드싸움 할 때 
      whoIsFirst = speedDiff >= 0 ? 'my' : 'enemy';
    } else if (priorityDiff < 0) { // 상대 우선도가 높을 때 
      whoIsFirst = 'enemy';
    }
  } else if (aiMove && aiMove.priority) { // 상대만 우선도 가진 기술 사용 
    if (aiMove.priority < 0) {
      whoIsFirst = 'my';
    }
    whoIsFirst = 'enemy';
  } else if (playerMove && playerMove.priority) { // 나만 우선도 가진 기술 사용
    if (playerMove.priority < 0) {
      whoIsFirst = 'enemy';
    }
    whoIsFirst = 'my';
  }
  addLog(`${whoIsFirst}의 선공!`)
  console.log(`${whoIsFirst}의 선공!`);
  return whoIsFirst;
}