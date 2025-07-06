import { apiGet, apiPost } from './apiService';

export interface JitsiRoomConfig {
  roomName: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  startWithAudioMuted?: boolean;
  startWithVideoMuted?: boolean;
  enableWelcomePage?: boolean;
  enableClosePage?: boolean;
}

export interface JitsiRoom {
  id: string;
  roomName: string;
  createdAt: Date;
  participants: number;
  isActive: boolean;
}

export interface JitsiMeetingInfo {
  roomName: string;
  jwt?: string;
  domain: string;
  config: any;
}

class JitsiServiceClass {
  private jitsiDomain: string = 'meet.jit.si'; // Domínio padrão, pode ser configurado

  async createRoom(config: JitsiRoomConfig): Promise<JitsiRoom> {
    try {
      const response = await apiPost<JitsiRoom>('/jitsi/rooms', config);
      return response;
    } catch (error) {
      console.error('Erro ao criar sala Jitsi:', error);
      throw error;
    }
  }

  async getRoomInfo(roomName: string): Promise<JitsiMeetingInfo> {
    try {
      const response = await apiGet<JitsiMeetingInfo>(`/jitsi/rooms/${encodeURIComponent(roomName)}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar informações da sala:', error);
      throw error;
    }
  }

  async generateJWT(roomName: string, userInfo: { name: string; email?: string; isModerator?: boolean }): Promise<string> {
    try {
      const response = await apiPost<{ jwt: string }>('/jitsi/jwt', {
        roomName,
        ...userInfo
      });
      return response.jwt;
    } catch (error) {
      console.error('Erro ao gerar JWT:', error);
      throw error;
    }
  }

  async getActiveRooms(): Promise<JitsiRoom[]> {
    try {
      const response = await apiGet<JitsiRoom[]>('/jitsi/rooms/active');
      return response || [];
    } catch (error) {
      console.error('Erro ao buscar salas ativas:', error);
      return [];
    }
  }

  async endRoom(roomName: string): Promise<void> {
    try {
      await apiPost(`/jitsi/rooms/${encodeURIComponent(roomName)}/end`, {});
    } catch (error) {
      console.error('Erro ao encerrar sala:', error);
      throw error;
    }
  }

  getJitsiConfig(roomName: string, displayName: string, options?: Partial<JitsiRoomConfig>): any {
    return {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: undefined, // Será definido quando o componente montar
      configOverwrite: {
        startWithAudioMuted: options?.startWithAudioMuted ?? true,
        startWithVideoMuted: options?.startWithVideoMuted ?? true,
        disableModeratorIndicator: false,
        enableEmailInStats: false,
        enableWelcomePage: options?.enableWelcomePage ?? false,
        enableClosePage: options?.enableClosePage ?? false,
        prejoinPageEnabled: true,
        disableDeepLinking: true,
        transcribingEnabled: false,
        liveStreamingEnabled: false,
        fileRecordingsEnabled: true,
        localRecording: {
          enabled: true,
          format: 'webm'
        },
        toolbarButtons: [
          'microphone',
          'camera',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'chat',
          'recording',
          'livestreaming',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          'participants-pane',
          'feedback',
          'stats',
          'shortcuts',
          'tileview',
          'download',
          'help',
          'mute-everyone',
          'mute-video-everyone'
        ]
      },
      interfaceConfigOverwrite: {
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
        MOBILE_APP_PROMO: false,
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#474747',
        DISABLE_TRANSCRIPTION_SUBTITLES: false,
        DISABLE_RINGING: false,
        DISPLAY_WELCOME_FOOTER: false,
        DISPLAY_WELCOME_PAGE_ADDITIONAL_CARD: false,
        DISPLAY_WELCOME_PAGE_CONTENT: false,
        DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
        GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
        HIDE_INVITE_MORE_HEADER: false,
        LANG_DETECTION: true,
        LIVE_STREAMING_HELP_LINK: '',
        LOCAL_THUMBNAIL_RATIO: 16 / 9,
        POLICY_LOGO: '',
        PROVIDER_NAME: 'Portal Educacional',
        RECENT_LIST_ENABLED: false,
        REMOTE_THUMBNAIL_RATIO: 16 / 9,
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar', 'sounds'],
        SHOW_BRAND_WATERMARK: false,
        SHOW_CHROME_EXTENSION_BANNER: false,
        SHOW_DEEP_LINKING_IMAGE: false,
        SHOW_POWERED_BY: false,
        SHOW_PROMOTIONAL_CLOSE_PAGE: false,
        SUPPORT_URL: '',
        TOOLBAR_ALWAYS_VISIBLE: false,
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'chat',
          'recording',
          'livestreaming',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          'participants-pane',
          'feedback',
          'stats',
          'shortcuts',
          'tileview',
          'download',
          'help',
          'mute-everyone',
          'mute-video-everyone'
        ],
        TOOLBAR_TIMEOUT: 4000,
        VIDEO_QUALITY_LABEL_DISABLED: false
      },
      userInfo: {
        displayName: displayName,
        email: options?.email
      }
    };
  }

  setJitsiDomain(domain: string): void {
    this.jitsiDomain = domain;
  }

  getJitsiDomain(): string {
    return this.jitsiDomain;
  }
}

export const jitsiService = new JitsiServiceClass(); 