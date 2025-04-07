// utils/AudioManager.ts
const audioFiles = (import.meta as any).glob('/public/sound/*.mp3', { eager: true });

const categorizedTracks: Record<string, string[]> = {
  main: [],
  battle: [],
  last_one: [],
  win: [],
  defeat: []
};

Object.keys(audioFiles).forEach((key) => {
  const filePath = key.replace('/public', '');
  const name = filePath.split('/').pop() || '';
  if (name.startsWith('main')) categorizedTracks.main.push(filePath);
  else if (name.startsWith('battle')) categorizedTracks.battle.push(filePath);
  else if (name.startsWith('last_one')) categorizedTracks.last_one.push(filePath);
  else if (name.startsWith('win')) categorizedTracks.win.push(filePath);
  else if (name.startsWith('defeat')) categorizedTracks.defeat.push(filePath);
});

class AudioManager {
  private static instance: AudioManager;
  private audio?: HTMLAudioElement;
  private isMuted = false;

  private constructor() { }

  static getInstance() {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  play(category: keyof typeof categorizedTracks) {
    if (this.isMuted) return;

    const files = categorizedTracks[category];
    if (!files || files.length === 0) return;

    const randomFile = files[Math.floor(Math.random() * files.length)];
    this.stop();
    this.audio = new Audio(randomFile);
    this.audio.loop = true;
    this.audio.play();
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = undefined;
    }
  }

  mute(value: boolean) {
    this.isMuted = value;
    if (value) this.stop();
  }
}

export default AudioManager;