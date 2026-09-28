export type Person = { id?: string; full_name: string | null; email?: string; avatar_url?: string | null };

export type ContentItem = {
  id: string;
  title: string;
  type: string;
  body: string;
  status: string;
  priority: "low" | "medium" | "high";
  channel: string | null;
  tags: string[];
  word_count: number;
  due_date: string | null;
  scheduled_at: string | null;
  flagged: boolean;
  flag_reason: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  assignee_id: string | null;
  author?: Person | null;
  assignee?: Person | null;
  comments?: { count: number }[];
};

export type Activity = {
  id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
  actor?: Person | null;
};

export type Overview = {
  days: number;
  totals: {
    generations: number;
    generationsChange: number;
    tokens: number;
    tokensChange: number;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    words: number;
    wordsChange: number;
    contentCreated: number;
    contentChange: number;
    hoursSaved: number;
    published: number;
    inReview: number;
    images: number;
    documents: number;
    prompts: number;
    knowledgeSources: number;
  };
  daily: { date: string; generations: number; tokens: number; content: number }[];
  byFeature: { name: string; value: number }[];
  byModel: { name: string; value: number }[];
  byType: { name: string; value: number }[];
  byStatus: { name: string; value: number }[];
  topUsers: (Person & { id: string; role: string; generations: number; tokens: number; cost: number })[];
  activity: Activity[];
};

export type Prompt = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  template: string;
  variables: string[];
  is_shared: boolean;
  is_favorite: boolean;
  uses: number;
  user_id: string | null;
  author?: Person | null;
  updated_at: string;
};

export type WorkflowTemplate = {
  id: string;
  name: string;
  description: string | null;
  steps: { name: string; instruction: string }[];
  is_shared: boolean;
  runs: number;
  author?: Person | null;
  created_at: string;
};
