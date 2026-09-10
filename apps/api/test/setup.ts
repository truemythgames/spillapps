const store = new Map<string, Response>();

export function resetEdgeCache(): void {
  store.clear();
}

(globalThis as { caches?: unknown }).caches = {
  default: {
    async match(req: Request) {
      return store.get(new Request(req).url);
    },
    async put(req: Request, res: Response) {
      store.set(new Request(req).url, res);
    },
    async delete(req: Request) {
      return store.delete(new Request(req).url);
    },
  },
};
