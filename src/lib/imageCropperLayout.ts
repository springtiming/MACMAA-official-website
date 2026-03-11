type CropperLayoutOptions = {
  reservedHeight?: number;
  minStageHeight?: number;
  minStageWidth?: number;
};

type CropperViewportBounds = {
  stageMaxHeight: number;
  stageMaxWidth: number;
};

const DEFAULT_VIEWPORT_HEIGHT = 900;
const DEFAULT_RESERVED_HEIGHT = 260;
const DEFAULT_MIN_STAGE_HEIGHT = 220;
const DEFAULT_MIN_STAGE_WIDTH = 280;
const DEFAULT_ASPECT = 16 / 9;

const toFinitePositive = (value: number, fallback: number) =>
  Number.isFinite(value) && value > 0 ? value : fallback;

export function getCropperViewportBounds(
  viewportHeight: number,
  aspect: number,
  options: CropperLayoutOptions = {}
): CropperViewportBounds {
  const safeViewportHeight = toFinitePositive(
    viewportHeight,
    DEFAULT_VIEWPORT_HEIGHT
  );
  const safeAspect = toFinitePositive(aspect, DEFAULT_ASPECT);
  const reservedHeight = toFinitePositive(
    options.reservedHeight ?? DEFAULT_RESERVED_HEIGHT,
    DEFAULT_RESERVED_HEIGHT
  );
  const minStageHeight = toFinitePositive(
    options.minStageHeight ?? DEFAULT_MIN_STAGE_HEIGHT,
    DEFAULT_MIN_STAGE_HEIGHT
  );
  const minStageWidth = toFinitePositive(
    options.minStageWidth ?? DEFAULT_MIN_STAGE_WIDTH,
    DEFAULT_MIN_STAGE_WIDTH
  );

  const stageMaxHeight = Math.max(
    minStageHeight,
    Math.floor(safeViewportHeight - reservedHeight)
  );
  const stageMaxWidth = Math.max(
    minStageWidth,
    Math.floor(stageMaxHeight * safeAspect)
  );

  return { stageMaxHeight, stageMaxWidth };
}
