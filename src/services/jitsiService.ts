declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

import { ClassroomConfig } from '@/types/classroom';

export class JitsiService {
  private static instance: JitsiService;
  private api: any = null;
  private domain = 'meet.jit.si'; // Default Jitsi Meet server
  private isInitialized = false;
  private onParticipantJoinedCallbacks: ((participantId: string) => void)[] = [];
  private onParticipantLeftCallbacks: ((participantId: string) => void)[] = [];
  private onRecordingStatusChangedCallbacks: ((status: string) => void)[] = [];

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): JitsiService {
    if (!JitsiService.instance) {
      JitsiService.instance = new JitsiService();
    }
    return JitsiService.instance;
  }

  public async initialize(domain?: string): Promise<void> {
    if (this.isInitialized) return;

    if (domain) {
      this.domain = domain;
    }

    // Load Jitsi Meet External API script
    await this.loadJitsiScript();
    this.isInitialized = true;
  }

  private async loadJitsiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window.JitsiMeetExternalAPI !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://${this.domain}/external_api.js`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(new Error('Failed to load Jitsi Meet External API'));
      document.body.appendChild(script);
    });
  }

  public createMeeting(containerId: string, config: ClassroomConfig): void {
    if (!this.isInitialized) {
      throw new Error('JitsiService must be initialized before creating a meeting');
    }

    const options = {
      roomName: config.roomName,
      width: config.width || '100%',
      height: config.height || '100%',
      parentNode: document.getElementById(containerId),
      userInfo: config.userInfo,
      configOverwrite: {
        prejoinPageEnabled: false,
        ...config.configOverwrite,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
          'tileview', 'select-background', 'download', 'help', 'mute-everyone',
          'security'
        ],
        ...config.interfaceConfigOverwrite,
      },
    };

    this.api = new window.JitsiMeetExternalAPI(this.domain, options);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.api.addEventListeners({
      participantJoined: (participant: any) => {
        this.onParticipantJoinedCallbacks.forEach(callback => 
          callback(participant.id)
        );
      },
      participantLeft: (participant: any) => {
        this.onParticipantLeftCallbacks.forEach(callback => 
          callback(participant.id)
        );
      },
      recordingStatusChanged: (status: any) => {
        this.onRecordingStatusChangedCallbacks.forEach(callback =>
          callback(status.status)
        );
      },
    });
  }

  // Event listeners
  public onParticipantJoined(callback: (participantId: string) => void): void {
    this.onParticipantJoinedCallbacks.push(callback);
  }

  public onParticipantLeft(callback: (participantId: string) => void): void {
    this.onParticipantLeftCallbacks.push(callback);
  }

  public onRecordingStatusChanged(callback: (status: string) => void): void {
    this.onRecordingStatusChangedCallbacks.push(callback);
  }

  // Meeting controls
  public startRecording(): void {
    this.api.executeCommand('startRecording', {
      mode: 'file', // recording mode, either `file` or `stream`
    });
  }

  public stopRecording(): void {
    this.api.executeCommand('stopRecording');
  }

  public toggleAudio(): void {
    this.api.executeCommand('toggleAudio');
  }

  public toggleVideo(): void {
    this.api.executeCommand('toggleVideo');
  }

  public toggleScreenSharing(): void {
    this.api.executeCommand('toggleShareScreen');
  }

  public toggleChat(): void {
    this.api.executeCommand('toggleChat');
  }

  public getParticipants(): any[] {
    return this.api.getParticipantsInfo();
  }

  public getRecordingStatus(): string {
    return this.api.getRecordingStatus().status;
  }

  public dispose(): void {
    if (this.api) {
      this.api.dispose();
      this.api = null;
    }
  }
}

export const jitsiService = JitsiService.getInstance();
