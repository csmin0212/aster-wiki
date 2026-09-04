'use client';

/**
 * 인물 사진용 이미지 처리기.
 *
 * Firestore 문서 하나에 모든 인물 사진을 모아 넣기 때문에(app_state/npc-images),
 * 원본을 그대로 넣으면 문서 크기 제한(1MB)에 금방 걸린다.
 * 그래서 브라우저에서 정사각형으로 잘라 작은 JPEG로 만든 뒤 저장한다.
 *
 * 인물 사전의 사진은 44px로 표시되므로 256px면 고해상도 화면에서도 충분하다.
 */

const MAX_UPLOAD  = 20 * 1024 * 1024;  // 원본 파일 상한
const MAX_ENCODED = 40_000;            // data URI 한 장의 상한 (문자 수)

/** 잘라낼 영역 — 원본 이미지의 픽셀 좌표 기준 정사각형 */
export interface CropRect {
  sx:   number;
  sy:   number;
  side: number;
}

/**
 * 파일을 ImageBitmap으로 읽는다.
 * imageOrientation: 휴대폰으로 찍은 사진이 눕는 것을 방지.
 */
export async function loadImageFile(file: File): Promise<ImageBitmap> {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 넣을 수 있습니다.');
  }
  if (file.size > MAX_UPLOAD) {
    throw new Error('파일이 너무 큽니다. (20MB 이하)');
  }
  return createImageBitmap(file, { imageOrientation: 'from-image' });
}

/** 가운데를 정사각형으로 — 자르기 화면의 초기 위치 */
export function centerCrop(w: number, h: number): CropRect {
  const side = Math.min(w, h);
  return { sx: (w - side) / 2, sy: (h - side) / 2, side };
}

/** 지정한 영역을 잘라 작은 JPEG data URI로 만든다. */
export function cropToDataUrl(
  bitmap: ImageBitmap,
  crop: CropRect,
  size = 256,
  quality = 0.72,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('이미지를 처리할 수 없습니다.');

  ctx.drawImage(bitmap, crop.sx, crop.sy, crop.side, crop.side, 0, 0, size, size);

  // 그래도 크면 화질을 낮춰 다시 뽑는다
  let q   = quality;
  let out = canvas.toDataURL('image/jpeg', q);
  while (out.length > MAX_ENCODED && q > 0.3) {
    q  -= 0.12;
    out = canvas.toDataURL('image/jpeg', q);
  }
  return out;
}
