export type PetStateType =
  | 'idle'
  | 'walk-left'
  | 'walk-right'
  | 'fall'
  | 'land'
  | 'react'
  | 'grabbed'   // 被拖拽中
  | 'sleep'     // 睡觉
  | 'eat'       // 吃东西
  | 'happy';    // 开心摇尾巴

export interface StateTransition {
  from: PetStateType;
  to: PetStateType;
  condition: () => boolean;
}

export class PetStateMachine {
  private currentState: PetStateType = 'idle';
  private stateStartTime: number = Date.now();
  private listeners: Map<string, ((state: PetStateType) => void)[]> = new Map();

  get state(): PetStateType {
    return this.currentState;
  }

  get stateAge(): number {
    return Date.now() - this.stateStartTime;
  }

  transition(to: PetStateType): void {
    if (this.currentState === to) return;
    const from = this.currentState;
    this.currentState = to;
    this.stateStartTime = Date.now();
    this.emit('transition', { from, to });
    this.emit(to, { from });
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }
}
