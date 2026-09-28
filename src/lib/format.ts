import { formatDistanceToNow } from "date-fns";
import type { Activity } from "./types";

export function timeAgo(d?: string | null) {
  if (!d) return "—";
  try {
    return formatDistanceToNow(new Date(d), { addSuffix: true });
  } catch {
    return "—";
  }
}

const ENTITY: Record<string, string> = {
  content: "content",
  image: "an image",
  document: "a document",
  knowledge: "a knowledge source",
  prompt: "a prompt",
  workflow_template: "a workflow",
  settings: "settings",
  user: "a user",
  model: "a model",
  assistant: "text",
};

export function describeActivity(a: Activity) {
  const d = a.details || {};
  const name = d.title || d.name;
  switch (a.action) {
    case "moved":
      return `moved “${name ?? "content"}” from ${d.from} to ${d.to}`;
    case "generated":
      return a.entity === "image" ? "generated an image" : `generated “${name ?? "content"}”`;
    case "commented":
      return "commented on a content item";
    case "ran":
      return `ran the “${name ?? "workflow"}” workflow`;
    case "uploaded":
      return `uploaded ${name ?? "a document"}`;
    case "added":
      return `added “${name ?? "a source"}” to the knowledge base`;
    case "created":
      return `created ${name ? `“${name}”` : ENTITY[a.entity] ?? a.entity}`;
    case "edited":
      return `edited “${name ?? "content"}”`;
    case "flagged":
      return "flagged content for review";
    case "invited_user":
      return `invited ${d.email ?? "a user"}`;
    case "updated_user":
      return "updated a user's access";
    case "updated_model":
      return `updated model ${a.entity_id}`;
    default:
      if (a.action.startsWith("assistant_")) return `used the writing assistant (${a.action.replace("assistant_", "")})`;
      return `${a.action.replace(/_/g, " ")} ${ENTITY[a.entity] ?? a.entity}`;
  }
}
