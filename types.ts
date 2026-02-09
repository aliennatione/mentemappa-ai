export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface MindMapData {
  markdown: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}
