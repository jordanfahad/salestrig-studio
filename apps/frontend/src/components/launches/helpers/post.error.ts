// The orchestrator persists a serialised Temporal failure in `post.error`, so
// the one sentence a human can act on sits a few `cause`/`failure` levels down.
// Staff get that sentence; they never get the blob.
const MAX_LENGTH = 160;
const MAX_DEPTH = 10;

// The deeper a `message` sits, the closer it is to what the provider actually
// said - the outer levels only repeat Temporal's own wrapping.
const deepestMessage = (
  node: any,
  depth = 0
): { message: string; depth: number } => {
  let best = { message: '', depth: -1 };

  if (!node || typeof node !== 'object' || depth > MAX_DEPTH) {
    return best;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === 'message' && typeof value === 'string' && value.trim()) {
      if (depth > best.depth) {
        best = { message: value.trim(), depth };
      }
      continue;
    }

    const nested = deepestMessage(value, depth + 1);
    if (nested.depth > best.depth) {
      best = nested;
    }
  }

  return best;
};

const truncate = (message: string) =>
  message.length > MAX_LENGTH
    ? `${message.slice(0, MAX_LENGTH).trimEnd()}…`
    : message;

export const readablePostError = (error?: string | null) => {
  const raw = (error || '').trim();
  if (!raw) {
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // `changeState` is also called with plain strings ('Already posted'), which
    // are already readable.
    return truncate(raw);
  }

  if (typeof parsed === 'string') {
    return truncate(parsed.trim()) || undefined;
  }

  // A blob we cannot read is worse than no tooltip at all, so let the caller
  // fall back to its own generic wording.
  const { message } = deepestMessage(parsed);
  return message ? truncate(message) : undefined;
};
