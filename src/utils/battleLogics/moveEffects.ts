import { MoveInfo } from "../../models/Move";

export function applyMoveEffect(move: MoveInfo, target: any): void {
  move.effects.forEach((effect) => {
    switch (effect.status) {
      case "화상":
        if (Math.random() < effect.chance) {
          console.log(`${target.name}은(는) 화상 상태가 되었다!`);
          target.status = "화상";
        }
        break;
      case "마비":
        if (Math.random() < effect.chance) {
          console.log(`${target.name}은(는) 마비 상태가 되었다!`);
          target.status = "마비";
        }
        break;
      case "풀죽음":
        if (Math.random() < effect.chance) {
          console.log(`${target.name}은(는) 풀죽음 상태가 되었다!`);
          target.status = "풀죽음";
        }
        break;
      default:
        break;
    }
    switch (effect.statChange?.target) {
      case "opponent":
        console.log(`${target.name}의 ${effect.statChange.stat}이(가) ${effect.statChange.change}만큼 변했다!`);
        break;
      case "self":
        console.log(`${target.name}의 ${effect.statChange.stat}이(가) ${effect.statChange.change}만큼 변했다!`);
        break;
      default:
        break;
    }
  });
}