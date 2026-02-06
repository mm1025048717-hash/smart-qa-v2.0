/**
 * 引导埋点（PRD 5）：引导开始/完成/跳过、角色、步数等
 * 飞书埋点未给出时做最小可行上报，可后续对接真实埋点 SDK
 */

export type TourEvent = 'tour_start' | 'tour_complete' | 'tour_skip';

export interface TourTrackPayload {
  event: TourEvent;
  roleId?: string;
  stepsTotal: number;
  stepReached?: number;
  completedAll?: boolean;
}

function emit(payload: TourTrackPayload) {
  if (typeof window === 'undefined') return;
  // 可替换为飞书/神策等 SDK
  try {
    window.dispatchEvent(new CustomEvent('yiwen_tour_track', { detail: payload }));
    if (import.meta.env?.DEV) {
      console.log('[yiwen_tour]', payload);
    }
  } catch {
    // ignore
  }
}

export function trackTourStart(roleId: string | undefined, stepsTotal: number) {
  emit({ event: 'tour_start', roleId, stepsTotal });
}

export function trackTourComplete(roleId: string | undefined, stepsTotal: number) {
  emit({ event: 'tour_complete', roleId, stepsTotal, completedAll: true });
}

export function trackTourSkip(roleId: string | undefined, stepsTotal: number, stepReached: number) {
  emit({ event: 'tour_skip', roleId, stepsTotal, stepReached });
}
