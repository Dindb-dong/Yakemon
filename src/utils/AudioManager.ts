class AudioManager {
  private static instance: AudioManager;
  private audio?: HTMLAudioElement;
  private isMuted = false;
  private manifestPromise?: Promise<void>;
  private requestedCategory?: keyof typeof this.categorizedTracks;
  private categorizedTracks: Record<string, string[]> = {
    main: [],
    battle: [],
    last_one: [],
    win: [],
    defeat: [],
  };

  private constructor() {
    this.loadManifest();
  }

  private loadManifest() {
    if (!this.manifestPromise) {
      this.manifestPromise = fetch("/sound-manifest.json")
        .then((res) => res.json())
        .then((data) => {
          this.categorizedTracks = data;
          console.log("🔊 오디오 목록 로드됨", data);
        })
        .catch((err) => {
          console.error("🎵 오디오 매니페스트 로드 실패:", err);
        });
    }
    return this.manifestPromise;
  }

  static getInstance() {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  play(category: keyof typeof this.categorizedTracks) {
    if (this.isMuted) return;
    this.requestedCategory = category;

    const playCategory = () => {
      if (this.isMuted || this.requestedCategory !== category) return;
      const files = this.categorizedTracks[category];
      if (!files || files.length === 0) return;
      const randomFile = files[Math.floor(Math.random() * files.length)];
      this.stop();
      this.audio = new Audio(randomFile);
      this.audio.loop = true;
      this.audio.play().catch((err) => {
        console.warn("🎵 오디오 재생 실패:", err);
      });
    };

    if (this.categorizedTracks[category]?.length) {
      playCategory();
      return;
    }

    this.loadManifest().then(() => {
      playCategory();
    });
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
