export type StatusState = '화상' | '마비' | '독' | '맹독' | '얼음' | '잠듦' |
  '혼란' | '풀죽음' | '앵콜' | '트집' | '도발' | '헤롱헤롱' | '사슬묶기' | '회복봉인' | '씨뿌리기' | null;


export class StatusManager {
  private status: StatusState[];

  constructor(initialStatus: StatusState[] = []) {
    this.status = [...initialStatus];
  }

  addStatus(status: StatusState): void {
    if (!status || this.hasStatus(status)) return;

    const exclusive = ['마비', '독', '맹독', '얼음', '잠듦'];
    // 중복 있으면 바로 함수 종료 
    if (exclusive.some(s => this.status.includes(s as StatusState)) && exclusive.includes(status)) return;
    this.status.push(status);
  }

  removeStatus(status: StatusState): void {
    this.status = this.status.filter(s => s !== status);
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