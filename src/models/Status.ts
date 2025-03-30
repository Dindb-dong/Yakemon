export type StatusState = '화상' | '마비' | '독' | '맹독' | '얼음' | '잠듦' |
  '혼란' | '풀죽음' | '앵콜' | '트집' | '도발' | '헤롱헤롱' | null;


export class StatusManager {
  private status: StatusState[];

  addStatus(status: StatusState) {
    this.status.push(status);
  }

  removeStatus(status: StatusState) {
    this.status = this.status.filter((s) => s !== status);
  }

  hasStatus(status: StatusState) {
    return this.status.some((s) => s === status);
  }

  constructor() {
    this.status = [];
  }

  getStatus() {
    return this.status;
  }
}