import { env, AutoTokenizer, SiglipTextModel } from "@huggingface/transformers";

env.allowLocalModels = false;
env.allowRemoteModels = true;

const MODEL_ID = "Xenova/siglip-base-patch16-224";

type ClipItem = { id: number; description: string };

class SiglipTextService {
  static tokenizer: Awaited<ReturnType<typeof AutoTokenizer.from_pretrained>> | null = null;
  static textModel: Awaited<ReturnType<typeof SiglipTextModel.from_pretrained>> | null = null;

  static async init(progress_callback?: (data: unknown) => void) {
    if (!this.tokenizer) {
      const options = { device: "wasm", dtype: "q8" } as const;

      this.tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, { progress_callback });
      this.textModel = await SiglipTextModel.from_pretrained(MODEL_ID, {
        ...options,
        progress_callback,
      });
    }
  }
}

self.addEventListener("message", async (event: MessageEvent<{ type: string; data: ClipItem[] }>) => {
  const { type, data } = event.data;

  try {
    if (type === "init") {
      await SiglipTextService.init((msg) => {
        self.postMessage({ type: "progress", data: msg });
      });

      const items = data;
      const embeddings: Record<number, number[]> = {};

      const descriptions = items.map((item) => item.description);
      const text_inputs = await SiglipTextService.tokenizer!(descriptions, {
        padding: "max_length",
        truncation: true,
      });

      const { pooler_output: textOutput } = await SiglipTextService.textModel!(text_inputs);

      const embeddingSize = 768;

      for (let i = 0; i < items.length; i++) {
        const start = i * embeddingSize;
        const end = start + embeddingSize;
        const textVector = textOutput.data.slice(start, end);
        const itemId = items[i].id;
        embeddings[itemId] = Array.from(textVector);
      }

      self.postMessage({ type: "text_embeddings_ready", data: embeddings });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    self.postMessage({ type: "error", data: message });
  }
});

export {};
