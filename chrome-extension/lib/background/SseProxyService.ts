export class SseProxyService {
  private eventSource: EventSource | null = null;
  private registeredStreamControllers: Map<string, ReadableStreamDefaultController> = new Map();
  private events: MessageEvent<string>[] = [];

  private initEventSource = (url: string) => {
    this.eventSource = new EventSource(url);
    this.eventSource.onmessage = (e: MessageEvent<string>) => {
      console.log('EventSource message:', e.data);
      this.events.push(e);
      this.registeredStreamControllers.forEach(controller => {
        console.log(controller);
        controller.enqueue(this.prepareResponse(e));
      });
    };
    this.eventSource.onerror = (e: Event) => {
      console.error('EventSource failed:', e);
      this.registeredStreamControllers.forEach(controller => {
        controller.error(e);
        this.events = [];
      });
    };
  };

  private prepareResponse = ({ data, type, lastEventId }: MessageEvent<string>) => {
    const sseChunkData = (data: string, event?: string, retry?: number, id?: string): string =>
      Object.entries({ event, id, data, retry })
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n') + '\n\n';

    const responseText = sseChunkData(data, type, undefined, lastEventId);
    const responseData = new TextEncoder().encode(responseText);
    return responseData;
  };

  register(event: FetchEvent) {
    const { headers, url } = event.request;
    const isSSERequest = headers.get('Accept') === 'text/event-stream' && url.includes('/events');

    if (!isSSERequest) return;

    if (!this.eventSource) {
      this.initEventSource(url);
    }

    const stream = new ReadableStream({
      start: controller => {
        this.events.forEach((i: MessageEvent<string>) => {
          controller.enqueue(this.prepareResponse(i));
        });
        this.registeredStreamControllers.set(event.clientId, controller);
      },
      cancel: () => {
        this.registeredStreamControllers.delete(event.clientId);
        if (this.registeredStreamControllers.size === 0) {
          this.eventSource?.close();
          this.eventSource = null;
          this.events = [];
        }
      },
    });

    const response = new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Transfer-Encoding': 'chunked',
        Connection: 'keep-alive',
      },
    });
    event.respondWith(response);
  }
}
