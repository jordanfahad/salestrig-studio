import { LinkedinProvider } from './linkedin.provider';
import { timer } from '@gitroom/helpers/utils/timer';
import type { Integration } from '@prisma/client';

// This standalone Jest config has no workspace alias mapper. Resolve the real
// provider dependencies locally, while isolating file I/O and native converters.
jest.mock(
  '@gitroom/nestjs-libraries/integrations/social.abstract',
  () => jest.requireActual('../social.abstract'),
  { virtual: true }
);
jest.mock(
  '@gitroom/nestjs-libraries/services/make.is',
  () => ({ makeId: () => 'synthetic-id' }),
  { virtual: true }
);
jest.mock(
  '@gitroom/helpers/utils/read.or.fetch',
  () => ({ readOrFetch: jest.fn() }),
  { virtual: true }
);
jest.mock(
  '@gitroom/helpers/utils/has.extension',
  () => jest.requireActual('../../../../helpers/src/utils/has.extension'),
  { virtual: true }
);
jest.mock(
  '@gitroom/helpers/utils/is.video.path',
  () => jest.requireActual('../../../../helpers/src/utils/is.video.path'),
  { virtual: true }
);
jest.mock(
  '@gitroom/helpers/utils/timer',
  () => ({ timer: jest.fn().mockResolvedValue(undefined) }),
  { virtual: true }
);
jest.mock(
  '@gitroom/helpers/decorators/post.plug',
  () => jest.requireActual('../../../../helpers/src/decorators/post.plug'),
  { virtual: true }
);
jest.mock(
  '@gitroom/nestjs-libraries/chat/rules.description.decorator',
  () => jest.requireActual('../../chat/rules.description.decorator'),
  { virtual: true }
);
jest.mock('sharp', () => jest.fn());
jest.mock('image-to-pdf', () => jest.fn());
// Decorator metadata retains this otherwise type-only import under ts-jest.
jest.mock('@prisma/client', () => ({}));

describe('LinkedIn personal media uploads', () => {
  const video = 'urn:li:video:synthetic-video';
  const api = 'https://api.linkedin.com/rest';
  const bytes = Buffer.from([11, 22, 33, 44, 55, 66, 77, 88, 99, 255]);
  const part = (firstByte: number, lastByte: number, name = 'one') => ({
    uploadUrl: `https://uploads.example.test/${name}`,
    firstByte,
    lastByte,
  });
  const json = (body: unknown) => new Response(JSON.stringify(body));
  const uploaded = (etag = 'synthetic-etag') =>
    new Response(null, { headers: { ETag: etag } });
  let provider: LinkedinProvider;
  let network: jest.SpyInstance<Promise<Response>, Parameters<typeof fetch>>;

  beforeEach(() => {
    provider = new LinkedinProvider();
    jest.mocked(timer).mockClear();
    network = jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(
        new Error('Unexpected request in isolated LinkedIn upload test')
      );
  });

  afterEach(() => jest.restoreAllMocks());

  function publish(buffer = bytes, path = 'synthetic.mp4') {
    const media = { type: 'video' as const, path, buffer };
    return provider.post(
      'synthetic-person',
      'synthetic-access-token',
      [
        {
          id: 'synthetic-post',
          message: 'Synthetic upload test',
          settings: { post_as_images_carousel: false },
          media: [media],
        },
      ],
      {} as Integration
    );
  }

  function initialize(
    uploadInstructions: unknown,
    token: object = { uploadToken: 'synthetic-session' }
  ) {
    network.mockResolvedValueOnce(
      json({
        value: { video, uploadInstructions, ...token },
      })
    );
  }

  function finishVideo() {
    network
      .mockResolvedValueOnce(new Response(null)) // finalize
      .mockResolvedValueOnce(json({ status: 'AVAILABLE' }))
      .mockResolvedValueOnce(
        new Response(null, {
          status: 201,
          headers: { 'x-restli-id': 'urn:li:share:synthetic-post' },
        })
      );
  }

  function requestBody(url: string) {
    const call = network.mock.calls.find(([target]) => target === url);
    expect(call).toBeDefined();
    return JSON.parse(call![1]!.body as string);
  }

  function puts() {
    return network.mock.calls.filter(
      ([, options]) => options?.method === 'PUT'
    );
  }

  function expectNoFinalizeOrPost() {
    expect(
      network.mock.calls.some(
        ([url]) =>
          url === `${api}/videos?action=finalizeUpload` ||
          url === `${api}/posts`
      )
    ).toBe(false);
  }

  it('uploads one instructed range and preserves the personal owner and session token', async () => {
    initialize([part(0, bytes.length - 1)]);
    network.mockResolvedValueOnce(uploaded());
    finishVideo();

    await expect(publish()).resolves.toEqual([
      expect.objectContaining({ status: 'posted' }),
    ]);

    expect(requestBody(`${api}/videos?action=initializeUpload`)).toEqual({
      initializeUploadRequest: {
        owner: 'urn:li:person:synthetic-person',
        fileSizeBytes: bytes.length,
        uploadCaptions: false,
        uploadThumbnail: false,
      },
    });
    expect(puts()).toEqual([
      [
        part(0, 9).uploadUrl,
        {
          method: 'PUT',
          headers: {
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': '202601',
            Authorization: 'Bearer synthetic-access-token',
            'Content-Type': 'application/octet-stream',
          },
          body: bytes,
        },
      ],
    ]);
    expect(requestBody(`${api}/videos?action=finalizeUpload`)).toEqual({
      finalizeUploadRequest: {
        video,
        uploadToken: 'synthetic-session',
        uploadedPartIds: ['synthetic-etag'],
      },
    });
    expect(requestBody(`${api}/posts`)).toEqual(
      expect.objectContaining({
        author: 'urn:li:person:synthetic-person',
        content: { media: { id: video } },
      })
    );
    expect(network.mock.calls.map(([url]) => url)).toEqual([
      `${api}/videos?action=initializeUpload`,
      part(0, 9).uploadUrl,
      `${api}/videos?action=finalizeUpload`,
      `${api}/videos/${encodeURIComponent(video)}`,
      `${api}/posts`,
    ]);
  });

  it('uses different URLs and non-2-MiB ranges, including the exact final byte and ETag order', async () => {
    const buffer = Buffer.alloc(3 * 1024 * 1024 + 17);
    for (let i = 0; i < buffer.length; i++) buffer[i] = i % 251;
    buffer[buffer.length - 1] = 255;
    const instructions = [
      part(0, 1024 * 1024 + 2, 'first'),
      part(1024 * 1024 + 3, buffer.length - 2, 'second'),
      part(buffer.length - 1, buffer.length - 1, 'last'),
    ];
    initialize(instructions);
    for (const etag of ['z-first', 'a-second', 'm-last']) {
      network.mockResolvedValueOnce(uploaded(etag));
    }
    finishVideo();

    await publish(buffer);

    const uploads = puts();
    expect(uploads).toHaveLength(3);
    uploads.forEach(([url, options], index) => {
      const { uploadUrl, firstByte, lastByte } = instructions[index];
      expect(url).toBe(uploadUrl);
      expect(Buffer.isBuffer(options!.body)).toBe(true);
      expect(
        (options!.body as Buffer).equals(
          buffer.subarray(firstByte, lastByte + 1)
        )
      ).toBe(true);
    });
    expect(uploads[2][1]!.body).toEqual(Buffer.from([255]));
    expect(
      Buffer.concat(
        uploads.map(([, options]) => options!.body as Buffer)
      ).equals(buffer)
    ).toBe(true);
    expect(
      requestBody(`${api}/videos?action=finalizeUpload`).finalizeUploadRequest
        .uploadedPartIds
    ).toEqual(['z-first', 'a-second', 'm-last']);
  });

  it.each([
    ['missing', {}],
    ['empty', { uploadToken: '' }],
    ['null', { uploadToken: null }],
  ])(
    'finalizes with an empty token when the returned token is %s',
    async (_name, token) => {
      initialize([part(0, 9)], token);
      network.mockResolvedValueOnce(uploaded());
      finishVideo();
      await publish();
      expect(
        requestBody(`${api}/videos?action=finalizeUpload`).finalizeUploadRequest
          .uploadToken
      ).toBe('');
    }
  );

  it.each([
    ['missing instructions', undefined],
    ['null instructions', null],
    ['non-array instructions', {}],
    ['empty instructions', []],
    ['null part', [null]],
    [
      'missing URL on a later part',
      [part(0, 3), { firstByte: 4, lastByte: 9 }],
    ],
    ['empty URL', [{ ...part(0, 9), uploadUrl: '' }]],
    ['malformed URL', [{ ...part(0, 9), uploadUrl: 'not a URL' }]],
    ['non-HTTP URL', [{ ...part(0, 9), uploadUrl: 'file:///synthetic' }]],
    ['missing firstByte', [{ uploadUrl: part(0, 9).uploadUrl, lastByte: 9 }]],
    ['missing lastByte', [{ uploadUrl: part(0, 9).uploadUrl, firstByte: 0 }]],
    ['fractional firstByte', [part(0, 3), part(4.5, 9)]],
    ['fractional lastByte', [part(0, 8.5)]],
    ['string offset', [{ ...part(0, 9), firstByte: '0' }]],
    ['start after zero', [part(1, 9)]],
    ['gap', [part(0, 3), part(5, 9)]],
    ['overlap', [part(0, 4), part(4, 9)]],
    ['out-of-order parts', [part(4, 9), part(0, 3)]],
    ['negative start', [part(-1, 9)]],
    ['reversed range', [part(0, 3), part(4, 2)]],
    ['past final byte', [part(0, 3), part(4, 10)]],
    ['incomplete file', [part(0, 8)]],
  ])(
    'rejects %s before any PUT, finalize or post',
    async (_name, instructions) => {
      initialize(instructions);
      await expect(publish()).rejects.toThrow(
        'Invalid LinkedIn video upload instructions'
      );
      expect(network).toHaveBeenCalledTimes(1);
      expect(puts()).toHaveLength(0);
      expectNoFinalizeOrPost();
    }
  );

  it.each([null, '', '   '])(
    'stops on a missing or empty ETag (%s) before the next part',
    async (etag) => {
      initialize([part(0, 3), part(4, 8, 'second'), part(9, 9, 'last')]);
      network.mockResolvedValueOnce(uploaded());
      network.mockResolvedValueOnce(
        etag === null ? new Response(null) : uploaded(etag)
      );
      await expect(publish()).rejects.toThrow(
        'LinkedIn video upload part returned no ETag'
      );
      expect(puts()).toHaveLength(2);
      expectNoFinalizeOrPost();
    }
  );

  it('propagates an HTTP part failure without uploading the next part or finalizing', async () => {
    initialize([part(0, 3), part(4, 8, 'second'), part(9, 9, 'last')]);
    network.mockResolvedValueOnce(uploaded());
    network.mockResolvedValueOnce(new Response('{}', { status: 400 }));
    await expect(publish()).rejects.toThrow();
    expect(puts()).toHaveLength(2);
    expectNoFinalizeOrPost();
  });

  it('propagates a rejected part request without finalizing', async () => {
    initialize([part(0, 3), part(4, 9, 'second')]);
    network.mockResolvedValueOnce(uploaded());
    network.mockRejectedValueOnce(new Error('Synthetic transport failure'));
    await expect(publish()).rejects.toThrow('Synthetic transport failure');
    expect(puts()).toHaveLength(2);
    expectNoFinalizeOrPost();
  });

  it('waits for AVAILABLE after finalizing before creating the post', async () => {
    initialize([part(0, 9)]);
    network.mockResolvedValueOnce(uploaded());
    network.mockResolvedValueOnce(new Response(null));
    network.mockResolvedValueOnce(json({ status: 'PROCESSING' }));
    network.mockResolvedValueOnce(json({ status: 'AVAILABLE' }));
    network.mockResolvedValueOnce(
      new Response(null, { headers: { 'x-restli-id': 'synthetic-post' } })
    );
    jest.mocked(timer).mockImplementationOnce(async () => {
      expect(network.mock.calls.some(([url]) => url === `${api}/posts`)).toBe(
        false
      );
    });
    await publish();
    expect(timer).toHaveBeenCalledWith(30000);
    expect(network.mock.calls.slice(-3).map(([url]) => url)).toEqual([
      `${api}/videos/${encodeURIComponent(video)}`,
      `${api}/videos/${encodeURIComponent(video)}`,
      `${api}/posts`,
    ]);
  });

  it('does not create a post when processing fails', async () => {
    initialize([part(0, 9)]);
    network.mockResolvedValueOnce(uploaded());
    network.mockResolvedValueOnce(new Response(null));
    network.mockResolvedValueOnce(json({ status: 'PROCESSING_FAILED' }));
    await expect(publish()).rejects.toThrow('LinkedIn video processing failed');
    expect(network).toHaveBeenCalledTimes(4);
    expect(network.mock.calls.some(([url]) => url === `${api}/posts`)).toBe(
      false
    );
  });

  it.each([
    ['image', 'images', 'synthetic.jpg'],
    ['document', 'documents', 'synthetic.pdf'],
  ])(
    'keeps a >2-MiB %s as one whole-file PUT without video finalization',
    async (field, endpoint, path) => {
      const buffer = Buffer.alloc(2 * 1024 * 1024 + 37, 123);
      const urn = `urn:li:${field}:synthetic-media`;
      const uploadUrl = 'https://uploads.example.test/single';
      network.mockResolvedValueOnce(
        json({ value: { uploadUrl, [field]: urn } })
      );
      network.mockResolvedValueOnce(new Response(null)); // ETag not required here
      network.mockResolvedValueOnce(
        new Response(null, { headers: { 'x-restli-id': 'synthetic-post' } })
      );
      await publish(buffer, path);
      expect(network.mock.calls[0][0]).toBe(
        `${api}/${endpoint}?action=initializeUpload`
      );
      expect(puts()).toHaveLength(1);
      expect(puts()[0][0]).toBe(uploadUrl);
      expect(puts()[0][1]!.body).toBe(buffer);
      const headers = puts()[0][1]!.headers as Record<string, string>;
      expect(headers['Content-Type']).toBe(
        field === 'document' ? 'application/pdf' : undefined
      );
      expect(timer).toHaveBeenCalledWith(10000);
      expect(network).toHaveBeenCalledTimes(3);
      expect(requestBody(`${api}/posts`).content.media.id).toBe(urn);
    }
  );
});
