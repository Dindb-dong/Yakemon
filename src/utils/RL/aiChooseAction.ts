import { useBattleStore } from "../../Context/useBattleStore";
import { MoveInfo } from "../../models/Move";
import { applyOffensiveAbilityEffectBeforeDamage } from "../battleLogics/applyBeforeDamage";
import { getBestSwitchIndex } from "../battleLogics/getBestSwitchIndex";
import { calculateRankEffect } from "../battleLogics/rankEffect";
import { calculateTypeEffectiveness } from "../typeRalation";

export const aiChooseAction = (side: 'my' | 'enemy') => { // side에 enemy 넣으면 오른쪽 유저 기준 
  const { myTeam, enemyTeam, activeMy, activeEnemy, addLog, publicEnv } = useBattleStore.getState();
  const mineTeam = side === 'my' ? myTeam : enemyTeam;
  const activeIndex = side === 'my' ? activeMy : activeEnemy;
  const opponentTeam = side === 'my' ? enemyTeam : myTeam;
  const myPokemon = mineTeam[side === 'my' ? activeMy : activeEnemy];
  const enemyPokemon = opponentTeam[side === 'my' ? activeEnemy : activeMy];
  // 이 아래에서부터는 rightPokemon -> myPokemon, leftPokemon -> enemyPokemon으로 변경 
  const userSpeed = enemyPokemon.base.speed * calculateRankEffect(enemyPokemon.rank.speed) * (enemyPokemon.status.includes('마비') ? 0.5 : 1);
  const aiSpeed = myPokemon.base.speed * calculateRankEffect(myPokemon.rank.speed) * (myPokemon.status.includes('마비') ? 0.5 : 1);
  const isEnemyFaster = (publicEnv.room === '트릭룸') ? aiSpeed < userSpeed : aiSpeed > userSpeed;
  const roll = Math.random();
  const aiHpRation = myPokemon.currentHp / myPokemon.base.hp; // ai 포켓몬의 체력 비율 
  const userHpRation = enemyPokemon.currentHp / enemyPokemon.base.hp; // 유저 포켓몬의 체력 비율 
  const usableMoves = myPokemon.base.moves.filter((m) => myPokemon.pp[m.name] > 0);

  const typeEffectiveness = (attackerTypes: string[], defenderTypes: string[]) => {
    return attackerTypes.reduce((maxEff, atk) => {
      return Math.max(maxEff, calculateTypeEffectiveness(atk, defenderTypes));
    }, 1);
  }; // 배열 돌면서 가장 높은 상성 찾기. 

  const getBestMove = (): MoveInfo => {
    let best: MoveInfo | null = null;
    let bestScore = -1;
    let rate = 1;

    usableMoves.forEach((move) => {

      const stab = myPokemon.base.types.includes(move.type) ? 1.5 : 1;
      rate = applyOffensiveAbilityEffectBeforeDamage(move, side);
      // 필드 뻥튀기도 적용
      const effectiveness = calculateTypeEffectiveness(move.type, enemyPokemon.base.types);
      let basePower: number;
      move.effects?.forEach((m) => {
        if (m.doubleHit) {
          basePower = 2 * move.power;
        } else if (m.multiHit) {
          basePower = 3 * move.power;
        }
      })
      basePower = move.power ?? 0;
      const score = basePower * stab * rate * effectiveness;

      if (score > bestScore) {
        bestScore = score;
        best = move;
      }
    });

    return best!;
  };

  const getSpeedUpMove = (): MoveInfo | null => {
    const prankster = myPokemon.base.ability?.name === "심술꾸러기";
    return usableMoves.find((m) =>
      m.effects?.some((effect) =>
        effect.chance > 0.5 && (
          effect.statChange?.some((s) => s.target === "self" && s.stat === "speed" && s.change > 0)
        ) || effect.statChange?.some((s) =>
          s.target === "opponent" &&
          s.stat === "speed" && s.change < 0) ||
        (prankster && effect.statChange?.some((s) => s.target === "self" && s.stat === "speed" && s.change < 0))
      )
    ) || null;
  };

  const getAttackUpMove = (): MoveInfo | null => {
    const prankster = myPokemon.base.ability?.name === "심술꾸러기";
    return usableMoves.find((m) =>
      m.effects?.some((effect) =>
        effect.chance > 0.5 &&
        effect.statChange?.some((s) =>
          s.target === "self" &&
          (s.stat === "attack" || s.stat === "spAttack" || s.stat === 'critical') &&
          s.change > 0
        ) ||
        (prankster && effect.statChange?.some((s) =>
          s.target === "self" &&
          (s.stat === "attack" || s.stat === "spAttack") &&
          s.change < 0
        ))
      )
    ) || null;
  };

  const getUtrunMove = (): MoveInfo | null => {
    return usableMoves.find((m) =>
      m.uTurn && m.pp > 0
    ) || null;
  };

  const getPriorityMove = (): MoveInfo | null => {
    return usableMoves.find((m) =>
      m.priority && m.pp > 0
    ) || null;
  };

  const getHealMove = (): MoveInfo | null => {
    return usableMoves.find((m) =>
      m.effects?.some((effect) =>
        effect.heal
      )
    ) || null;
  };

  const getRankUpMove = (): MoveInfo | null => {
    const rankUpMoves = usableMoves.filter((m) =>
      m.effects?.forEach((effect) => effect.chance > 0.5 && effect.statChange?.some((s) => s.target === "self" && s.change > 0))
    );
    if (rankUpMoves.length === 0) return null;
    return rankUpMoves[0];
  };

  const aiTouser = typeEffectiveness(myPokemon.base.types, enemyPokemon.base.types);
  const userToai = typeEffectiveness(enemyPokemon.base.types, myPokemon.base.types);
  const bestMove = getBestMove();
  const rankUpMove = getRankUpMove();
  const uturnMove = getUtrunMove();
  const speedUpMove = getSpeedUpMove();
  const attackUpMove = getAttackUpMove();
  const priorityMove = getPriorityMove();
  const healMove = getHealMove();
  const supportMove = usableMoves.find((m) => m.category === "변화" && m !== rankUpMove);

  const hasSwitchOption = mineTeam.some((p, i) => i !== activeEnemy && p.currentHp > 0);
  const isAi_lowHp = aiHpRation < 0.35;
  const isAi_highHp = aiHpRation > 0.8;
  const isUser_lowHp = userHpRation < 0.35;
  const isUser_veryLowHp = userHpRation < 0.2;
  const isUser_highHp = aiHpRation > 0.8;
  const isAttackReinforced = mineTeam[activeIndex].rank.attack > 1 || mineTeam[activeIndex].rank.spAttack > 1;
  const switchIndex = getBestSwitchIndex(side);

  // === 1. 내 포켓몬이 쓰러졌으면 무조건 교체 ===
  if (myPokemon.currentHp <= 0) {
    return { type: "switch" as const, index: switchIndex };
  }

  // === 2. 플레이어가 더 빠를 경우 ===
  if (!isEnemyFaster) {
    if (userToai > 1 && !(aiTouser > 1)) { // ai가 확실히 불리
      if (isUser_veryLowHp && priorityMove) {
        addLog(`🦅 ${side}는 상대 포켓몬의 빈틈을 포착하여 선공기 사용!`);
        return bestMove;
      }
      if (roll < 0.2 && speedUpMove) {
        addLog(`🦅 ${side}는 상대의 맞교체 또는 랭크업을 예측하고 스피드 상승을 시도!`);
        return speedUpMove;
      }
      if (roll < 0.4 && (hasSwitchOption)) {
        if (switchIndex !== -1) {
          addLog(`🐢 ${side}는 느리고 불리하므로 교체 선택`);
          return { type: "switch" as const, index: switchIndex };
        }
      }
      addLog(`🥊 ${side}는 최고 위력기를 선택`);
      return bestMove;
    } else if (aiTouser > 1 && !(userToai > 1)) {
      // ai가 느리지만 상성 확실히 유리 
      if (roll < 0.4 && isAi_lowHp && hasSwitchOption) {
        if (switchIndex !== -1) {
          addLog(`🐢 ${side}는 느리고 상성은 유리하지만 체력이 낮아 교체를 시도한다!`);
          return { type: "switch" as const, index: switchIndex };
        }
      }

      if (speedUpMove && isAi_highHp) {
        addLog(`🐢 ${side}는 느리지만 상성이 유리하고 체력이 높아 스피드 상승을 시도한다!`);
        return speedUpMove;
      }

      if (roll < 0.1 && isAi_highHp && hasSwitchOption && uturnMove) {
        addLog(`🐢 ${side}는 상성은 유리하지만 상대의 교체를 예상하고 유턴을 사용한다!`);
        return uturnMove;
      }

      if (roll < 0.4) {
        addLog(`🥊 ${side}는 상성 우위를 살려 가장 강한 기술로 공격한다!`);
        return bestMove;
      }

      if (roll < 0.6 && supportMove) {
        addLog(`🤸‍♀️ ${side}는 변화를 시도한다!`);
        return supportMove;
      }

      if (roll < 0.7 && hasSwitchOption) {
        if (switchIndex !== -1) {
          addLog(`🛼 ${side}는 상대의 교체를 예상하고 맞교체한다!`);
          return { type: "switch" as const, index: switchIndex };
        }
      }

      addLog(`🥊 ${side}는 예측샷으로 최고 위력기를 사용한다!`);
      return bestMove;
    } else { // 느리고 상성 같은 경우 
      if (isAi_highHp && speedUpMove) {
        addLog(`🦅 ${side}는 스피드 상승을 시도한다!`);
        return speedUpMove;
      }
      if (isAi_highHp && userHpRation < 0.5) {
        addLog(`🥊 ${side}는 상대의 체력이 적고 상성이 같아서 가장 강한 기술로 공격한다!`);
        return bestMove;
      }
      if (roll < 0.2 && hasSwitchOption) {
        if (switchIndex !== -1) {
          addLog(`🐢 ${side}는 상성이 같지만 느려서 상대에게 유리한 포켓몬으로 교체한다!`);
          return { type: "switch" as const, index: switchIndex };
        }
      }
      addLog(`🥊 ${side}는 상성이 같아서 가장 강한 기술로 공격한다!`);
      return bestMove;
    }
  }

  // === 3. AI가 더 빠를 경우 ===
  if (aiTouser > 1 && !(userToai > 1)) { // ai가 상성상 확실히 유리 
    if (roll < 0.5 && isAi_highHp && attackUpMove) {
      addLog(`🦅 ${side}는 빠르므로 공격 상승 기술 사용!`);
      return attackUpMove;
    }
    if (!isAi_highHp && isAttackReinforced) {
      addLog(`🥊 ${side}는 강화된 공격력으로 공격!`);
      return bestMove;
    }
    if (isUser_lowHp) { // 막타치기 로직 
      addLog(`🦅 ${side}는 상대 포켓몬의 빈틈을 포착!`);
      return bestMove;
    }
    if (isAi_lowHp && healMove) { // 상대 때릴 유리한 기술 있으면 그냥 때리기 
      addLog(`➕ ${side}는 빠르지만 체력이 낮으므로 회복 기술 사용!`);
      return healMove;
    }
    if (roll < 0.1 && hasSwitchOption) {
      if (switchIndex !== -1) {
        addLog(`🛼 ${side}는 상대 교체 예상하고 맞교체`);
        return { type: "switch" as const, index: switchIndex };
      }
    }
    if (roll < 0.2 && supportMove) {
      addLog(`🤸‍♀️ ${side}는 변화 기술 사용`);
      return supportMove;
    }
    addLog(`🥊 ${side}는 가장 강한 기술로 공격`);
    return bestMove;

  } else if (!(aiTouser > 1) && userToai > 1) { // ai가 빠르고 상성은 확실히 불리 
    if (isUser_lowHp) {
      addLog(`🦅 ${side}는 상대 포켓몬의 빈틈을 포착!`);
      return bestMove;
    }
    if (uturnMove && hasSwitchOption) {
      addLog(`🛼 ${side}는 빠르지만 불리하므로 유턴으로 교체!`);
      return uturnMove;
    }
    if (isAi_lowHp) {
      addLog(`🥊 ${side}는 일단은 강하게 공격!`)
      return bestMove;
    }
    if (roll < 0.15 && supportMove) {
      addLog(`🤸‍♀️ ${side}는 변화 기술을 사용`);
      return supportMove;
    }
    if (roll < 0.55 && (hasSwitchOption || isAi_lowHp)) {
      if (switchIndex !== -1) {
        addLog(`🛼 ${side}는 빠르지만 상성상 유리한 포켓몬이 있으므로 교체`);
        return { type: "switch" as const, index: switchIndex };
      }
    }
    addLog(`🥊 ${side}는 가장 강한 공격 시도`);
    return bestMove;
  } else if (aiTouser > 1 && userToai > 1) { // 서로가 약점을 찌르는 경우 
    if (roll < 0.1 && isAi_highHp && attackUpMove) {
      addLog(`🏋️‍♂️ ${side}는 빠르므로 공격 상승 기술 사용!`);
      return attackUpMove;
    }
    if (isUser_lowHp) { // 막타치기 로직 
      addLog(`🦅 ${side}는 상대 포켓몬의 빈틈을 포착!`);
      return bestMove;
    }
    if (isAi_lowHp && healMove) { // 상대 때릴 유리한 기술 있으면 그냥 때리기 
      addLog(`➕ ${side}는 빠르지만 체력이 낮으므로 회복 기술 사용!`);
      return healMove;
    }
    if (roll < 0.1 && hasSwitchOption) {
      if (switchIndex !== -1) {
        addLog(`🛼 ${side}는 상대 교체 예상하고 맞교체`);
        return { type: "switch" as const, index: switchIndex };
      }
    }
    if (roll < 0.2 && supportMove) {
      addLog(`🤸‍♀️ ${side}는 변화 기술 사용`);
      return supportMove;
    }
    addLog(`🥊 ${side}는 가장 강한 기술로 공격`);
    return bestMove;
  }
  else { // 특별한 상성 없을 때 
    if (isUser_lowHp) {
      addLog(`🦅 ${side}는 상대 포켓몬의 빈틈을 포착!`);
      return bestMove;
    }
    if (isAi_highHp && attackUpMove) {
      addLog(`🏋️‍♂️ ${side}는 공격 상승 기술 사용`);
      return attackUpMove;
    }
    if (roll < 0.3 && hasSwitchOption) {
      if (switchIndex !== -1) {
        addLog(`🦅 ${side}는 빠르지만 상대의 약점을 찌르기 위해 상대에게 유리한 포켓몬으로 교체`);
        return { type: "switch" as const, index: switchIndex };
      }
    }
    addLog(`🥊 ${side}는 더 빠르기에 가장 강한 공격 시도`);
    return bestMove;
  }
};