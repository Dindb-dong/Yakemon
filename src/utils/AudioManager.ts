class AudioManager {
  private static instance: AudioManager;
  private audio?: HTMLAudioElement;
  private isMuted = false;
  private categorizedTracks: Record<string, string[]> = {
    main: [],
    battle: [],
    last_one: [],
    win: [],
    defeat: [],
  };

  private constructor() {
    fetch("/sound-manifest.json")
      .then(res => res.json())
      .then(data => {
        this.categorizedTracks = data;
        console.log("🔊 오디오 목록 로드됨", data);
      })
      .catch(err => console.error("🎵 오디오 매니페스트 로드 실패:", err));
  }

  static getInstance() {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  play(category: keyof typeof this.categorizedTracks) {
    if (this.isMuted) return;

    const files = this.categorizedTracks[category];
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