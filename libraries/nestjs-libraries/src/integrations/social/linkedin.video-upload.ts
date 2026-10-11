type LinkedinVideoUploadPart = {
  uploadUrl: string;
  firstByte: number;
  lastByte: number;
};

/** Validate all inclusive ranges before any part is sent to LinkedIn. */
export function planLinkedinVideoUpload(
  instructions: unknown,
  fileLength: number
): LinkedinVideoUploadPart[] {
  if (!Array.isArray(instructions) || instructions.length === 0) {
    throw new Error('Invalid LinkedIn video upload instructions: no parts');
  }

  let nextByte = 0;
  const parts = instructions.map((instruction, index) => {
    const invalid = (reason: string) =>
      new Error(
        `Invalid LinkedIn video upload instructions: part ${
          index + 1
        } ${reason}`
      );

    let url: URL;
    try {
      if (typeof instruction?.uploadUrl !== 'string') {
        throw invalid('has no upload URL');
      }
      url = new URL(instruction.uploadUrl);
    } catch {
      throw invalid('has an invalid upload URL');
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw invalid('requires an HTTP upload URL');
    }

    const { uploadUrl, firstByte, lastByte } = instruction;
    if (
      !Number.isSafeInteger(firstByte) ||
      !Number.isSafeInteger(lastByte) ||
      firstByte !== nextByte ||
      lastByte < firstByte ||
      lastByte >= fileLength
    ) {
      throw invalid(
        'has an invalid, out-of-order or non-contiguous byte range'
      );
    }
    nextByte = lastByte + 1;
    return { uploadUrl, firstByte, lastByte };
  });

  if (nextByte !== fileLength) {
    throw new Error(
      'Invalid LinkedIn video upload instructions: ranges do not cover the entire file'
    );
  }
  return parts;
}
