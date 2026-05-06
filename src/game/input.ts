export interface KeyState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  attack: boolean;
  special: boolean;
  defend: boolean;
}

export interface InputState {
  p1: KeyState;
  p2: KeyState;
  enter: boolean;
}

const defaultKeyState = (): KeyState => ({
  left: false,
  right: false,
  up: false,
  down: false,
  attack: false,
  special: false,
  defend: false,
});

export class InputManager {
  state: InputState = {
    p1: defaultKeyState(),
    p2: defaultKeyState(),
    enter: false,
  };

  private prevP1Attack = false;
  private prevP2Attack = false;
  private prevP1Special = false;
  private prevP2Special = false;
  private prevEnter = false;

  private keyMap: Record<string, { player: 'p1' | 'p2'; action: keyof KeyState } | 'enter'> = {
    KeyA: { player: 'p1', action: 'left' },
    KeyD: { player: 'p1', action: 'right' },
    KeyW: { player: 'p1', action: 'up' },
    KeyS: { player: 'p1', action: 'down' },
    KeyF: { player: 'p1', action: 'attack' },
    KeyR: { player: 'p1', action: 'special' },
    KeyG: { player: 'p1', action: 'defend' },
    ArrowLeft: { player: 'p2', action: 'left' },
    ArrowRight: { player: 'p2', action: 'right' },
    ArrowUp: { player: 'p2', action: 'up' },
    ArrowDown: { player: 'p2', action: 'down' },
    KeyJ: { player: 'p2', action: 'attack' },
    KeyU: { player: 'p2', action: 'special' },
    KeyK: { player: 'p2', action: 'defend' },
    Enter: 'enter',
    Space: 'enter',
  };

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    e.preventDefault();
    const mapping = this.keyMap[e.code];
    if (!mapping) return;
    if (mapping === 'enter') {
      this.state.enter = true;
    } else {
      this.state[mapping.player][mapping.action] = true;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const mapping = this.keyMap[e.code];
    if (!mapping) return;
    if (mapping === 'enter') {
      this.state.enter = false;
    } else {
      this.state[mapping.player][mapping.action] = false;
    }
  };

  wasP1AttackPressed(): boolean {
    const pressed = this.state.p1.attack && !this.prevP1Attack;
    return pressed;
  }

  wasP2AttackPressed(): boolean {
    const pressed = this.state.p2.attack && !this.prevP2Attack;
    return pressed;
  }

  wasP1SpecialPressed(): boolean {
    const pressed = this.state.p1.special && !this.prevP1Special;
    return pressed;
  }

  wasP2SpecialPressed(): boolean {
    const pressed = this.state.p2.special && !this.prevP2Special;
    return pressed;
  }

  wasEnterPressed(): boolean {
    const pressed = this.state.enter && !this.prevEnter;
    return pressed;
  }

  savePrevState() {
    this.prevP1Attack = this.state.p1.attack;
    this.prevP2Attack = this.state.p2.attack;
    this.prevP1Special = this.state.p1.special;
    this.prevP2Special = this.state.p2.special;
    this.prevEnter = this.state.enter;
  }
}
