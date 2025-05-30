export type StatusState = '화상' | '마비' | '독' | '맹독' | '얼음' | '잠듦' |
  '혼란' | '풀죽음' | '앵콜' | '트집' | '도발' | '헤롱헤롱' | '사슬묶기' | '회복봉인' |
  '씨뿌리기' | '길동무' | '소리기술사용불가'
  | '하품' | '교체불가' | '조이기' | '멸망의노래';


export class StatusManager {
  private status: StatusState[];

  constructor(initialStatus: StatusState[] = []) {
    this.status = [...initialStatus];
  }

  addStatus(status: StatusState): void {
    if (!status || this.hasStatus(status)) return;

    const exclusive = ['마비', '독', '맹독', '얼음', '잠듦', '화상'];
    // 중복 있으면 바로 함수 종료 
    if (exclusive.some(s => this.status.includes(s as StatusState)) && exclusive.includes(status)) {
      console.log('중복 상태이상!')
      return
    };
    this.status.push(status);
  }

  removeStatus(status: StatusState): void {
    const newList = this.status.filter(s => s !== status);
    this.status = [...newList];
  }

  clearStatus(): void { // 상태이상 전체 삭제 (리프레쉬 등)
    this.status = [];
  }

  hasStatus(status: StatusState): boolean {
    return this.status.includes(status);
  }

  getStatus(): StatusState[] {
    return this.status;
  }
}