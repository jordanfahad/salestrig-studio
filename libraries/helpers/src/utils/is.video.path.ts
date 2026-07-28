import { hasExtension } from './has.extension';

// The media picker accepts video/mp4 and video/quicktime, so a post can carry a
// .mov as well as a .mp4. Every consumer - previews, the media library, the
// cover picker, and the providers that send photos and videos to different
// endpoints - has to answer this question identically, and one list is what
// stops them drifting apart. Anything added here must also be accepted by the
// upload allow-lists in libraries/nestjs-libraries/src/upload.
export const isVideoPath = (path?: string | null): boolean =>
  ['mp4', 'mov'].some((extension) => hasExtension(path, extension));
