export type FavoriteChangeMessage = {
  recipeId: string;
  favorited: boolean;
};

const CHANNEL_NAME = "kk-favorite";

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") {
    return null;
  }
  return new BroadcastChannel(CHANNEL_NAME);
}

export function publishFavoriteChange(message: FavoriteChangeMessage): void {
  const channel = getChannel();
  if (!channel) return;
  channel.postMessage(message);
  channel.close();
}

/**
 * Subscribe to cross-tab favorite changes. Returns an unsubscribe function.
 */
export function subscribeFavoriteChange(
  onChange: (message: FavoriteChangeMessage) => void,
): () => void {
  const channel = getChannel();
  if (!channel) {
    return () => undefined;
  }

  const handler = (event: MessageEvent<FavoriteChangeMessage>) => {
    const data = event.data;
    if (
      !data ||
      typeof data.recipeId !== "string" ||
      typeof data.favorited !== "boolean"
    ) {
      return;
    }
    onChange(data);
  };

  channel.addEventListener("message", handler);
  return () => {
    channel.removeEventListener("message", handler);
    channel.close();
  };
}
