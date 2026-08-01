export type EmberHomeRuntimeScene = 'living-room' | 'chat' | 'study' | 'cinema';

export type EmberHomePromptContext = {
  scene: EmberHomeRuntimeScene;
  rooms: Array<{
    id: 'study' | 'cinema';
    title: string;
    aliases: string[];
    purpose: string;
    availability: 'preview';
  }>;
};

let activeScene: EmberHomeRuntimeScene | null = null;

const EMBER_HOME_ROOM_TERMS = ['书房', '阅读室', '共读室', '观影厅', '影院', '电影院', '放映厅'];

export function setEmberHomeRuntimeScene(scene: EmberHomeRuntimeScene | null) {
  activeScene = scene;
}

export function readEmberHomePromptContext(): EmberHomePromptContext | null {
  if (!activeScene) return null;
  return {
    scene: activeScene,
    rooms: [
      {
        id: 'study',
        title: '书房',
        aliases: ['阅读室', '共读室'],
        purpose: '琳琳和 Ember 一起阅读、批注并延续共读对话的房间',
        availability: 'preview'
      },
      {
        id: 'cinema',
        title: '观影厅',
        aliases: ['影院', '电影院', '放映厅'],
        purpose: '琳琳和 Ember 一起观影、保存观看进度并延续观影对话的房间',
        availability: 'preview'
      }
    ]
  };
}

export function isEmberHomeRoomTopic(content: string) {
  return EMBER_HOME_ROOM_TERMS.some((term) => content.includes(term));
}
