import { LinkedinPageProvider } from './linkedin.page.provider';
import { timer } from '@gitroom/helpers/utils/timer';
import type { Integration } from '@prisma/client';

// Resolve workspace aliases without changing the shared standalone Jest config.
// The page provider and its inherited uploader/fetch implementation remain real.
jest.mock(
  '@gitroom/nestjs-libraries/integrations/social/linkedin.provider',
  () => jest.requireActual('./linkedin.provider'),
  { virtual: true }
);
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
  '@gitroom/helpers/decorators/plug.decorator',
  () => jest.requireActual('../../../../helpers/src/decorators/plug.decorator'),
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

describe('LinkedIn page inherited media uploads', () => {
  const api = 'https://api.linkedin.com/rest';
  const video = 'urn:li:video:synthetic-page-video';
  const bytes = Buffer.from([1, 2, 3, 4, 5, 6, 255]);
  const instructions = [
    {
      uploadUrl: 'https://uploads.example.test/page-one',
      firstByte: 0,
      lastByte: 1,
    },
    {
      uploadUrl: 'https://uploads.example.test/page-two',
      firstByte: 2,
      lastByte: 5,
    },
    {
      uploadUrl: 'https://uploads.example.test/page-last',
      firstByte: 6,
      lastByte: 6,
    },
  ];
  const json = (body: unknown) => new Response(JSON.stringify(body));
  let provider: LinkedinPageProvider;
  let network: jest.SpyInstance<Promise<Response>, Parameters<typeof fetch>>;

  beforeEach(() => {
    provider = new LinkedinPageProvider();
    jest.mocked(timer).mockClear();
    network = jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(
        new Error('Unexpected request in isolated LinkedIn page upload test')
      );
  });

  afterEach(() => jest.restoreAllMocks());

  function publish(buffer = bytes, path = 'synthetic.mp4') {
    const media = { type: 'video' as const, path, buffer };
    return provider.post(
      'synthetic-page',
      'synthetic-access-token',
      [
        {
          id: 'synthetic-post',
          message: 'Synthetic page test',
          settings: { post_as_images_carousel: false },
          media: [media],
        },
      ],
      {} as Integration
    );
  }

  function bodyAt(index: number) {
    return JSON.parse(network.mock.calls[index][1]!.body as string);
  }

  it('passes the organization owner through the real page post path and uses every instruction', async () => {
    network.mockResolvedValueOnce(
      json({
        value: {
          video,
          uploadInstructions: instructions,
          uploadToken: 'synthetic-page-session',
        },
      })
    );
    for (const etag of ['z-page-first', 'a-page-second', 'm-page-last']) {
      network.mockResolvedValueOnce(
        new Response(null, { headers: { ETag: etag } })
      );
    }
    network.mockResolvedValueOnce(new Response(null));
    network.mockResolvedValueOnce(json({ status: 'PROCESSING' }));
    network.mockResolvedValueOnce(json({ status: 'AVAILABLE' }));
    network.mockResolvedValueOnce(
      new Response(null, {
        status: 201,
        headers: { 'x-restli-id': 'urn:li:share:synthetic-page-post' },
      })
    );
    jest.mocked(timer).mockImplementationOnce(async () => {
      expect(network.mock.calls.some(([url]) => url === `${api}/posts`)).toBe(
        false
      );
    });

    await expect(publish()).resolves.toEqual([
      expect.objectContaining({ status: 'posted' }),
    ]);

    expect(bodyAt(0).initializeUploadRequest.owner).toBe(
      'urn:li:organization:synthetic-page'
    );
    expect(bodyAt(0).initializeUploadRequest.fileSizeBytes).toBe(bytes.length);
    const puts = network.mock.calls.filter(
      ([, options]) => options?.method === 'PUT'
    );
    expect(puts.map(([url]) => url)).toEqual(
      instructions.map((part) => part.uploadUrl)
    );
    expect(puts.map(([, options]) => options!.body)).toEqual([
      Buffer.from([1, 2]),
      Buffer.from([3, 4, 5, 6]),
      Buffer.from([255]),
    ]);
    expect(bodyAt(4)).toEqual({
      finalizeUploadRequest: {
        video,
        uploadToken: 'synthetic-page-session',
        uploadedPartIds: ['z-page-first', 'a-page-second', 'm-page-last'],
      },
    });
    expect(timer).toHaveBeenCalledWith(30000);
    expect(network.mock.calls.slice(4).map(([url]) => url)).toEqual([
      `${api}/videos?action=finalizeUpload`,
      `${api}/videos/${encodeURIComponent(video)}`,
      `${api}/videos/${encodeURIComponent(video)}`,
      `${api}/posts`,
    ]);
    expect(bodyAt(7)).toEqual(
      expect.objectContaining({
        author: 'urn:li:organization:synthetic-page',
        content: { media: { id: video } },
      })
    );
  });

  it('rejects a malformed later part before uploading or creating a page post', async () => {
    network.mockResolvedValueOnce(
      json({
        value: {
          video,
          uploadInstructions: [
            instructions[0],
            { ...instructions[1], firstByte: 3 },
            instructions[2],
          ],
        },
      })
    );
    await expect(publish()).rejects.toThrow(
      'Invalid LinkedIn video upload instructions'
    );
    expect(network).toHaveBeenCalledTimes(1);
  });

  it('does not finalize or post when a page video part fails', async () => {
    network.mockResolvedValueOnce(
      json({ value: { video, uploadInstructions: instructions } })
    );
    network.mockResolvedValueOnce(
      new Response(null, { headers: { ETag: 'synthetic-first' } })
    );
    network.mockResolvedValueOnce(new Response('{}', { status: 400 }));
    await expect(publish()).rejects.toThrow();
    expect(network.mock.calls.map(([url]) => url)).toEqual([
      `${api}/videos?action=initializeUpload`,
      instructions[0].uploadUrl,
      instructions[1].uploadUrl,
    ]);
  });

  it.each([
    ['image', 'images', 'synthetic.jpg'],
    ['document', 'documents', 'synthetic.pdf'],
  ])(
    'preserves one whole-file PUT and organization readiness polling for a >2-MiB %s',
    async (field, endpoint, path) => {
      const buffer = Buffer.alloc(2 * 1024 * 1024 + 11, 123);
      const urn = `urn:li:${field}:synthetic-page-media`;
      const uploadUrl = 'https://uploads.example.test/page-single';
      network.mockResolvedValueOnce(
        json({ value: { uploadUrl, [field]: urn } })
      );
      network.mockResolvedValueOnce(new Response(null));
      network.mockResolvedValueOnce(json({ status: 'AVAILABLE' }));
      network.mockResolvedValueOnce(
        new Response(null, { headers: { 'x-restli-id': 'synthetic-post' } })
      );
      await publish(buffer, path);
      expect(bodyAt(0).initializeUploadRequest.owner).toBe(
        'urn:li:organization:synthetic-page'
      );
      expect(network.mock.calls.map(([url]) => url)).toEqual([
        `${api}/${endpoint}?action=initializeUpload`,
        uploadUrl,
        `${api}/${endpoint}/${encodeURIComponent(urn)}`,
        `${api}/posts`,
      ]);
      expect(network.mock.calls[1][1]!.method).toBe('PUT');
      expect(network.mock.calls[1][1]!.body).toBe(buffer);
      expect(timer).not.toHaveBeenCalled();
    }
  );
});
