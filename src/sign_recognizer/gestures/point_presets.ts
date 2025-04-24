// import { Gestures } from "$utils/gestures/Gestures";
import { ActiveGestures } from "./active_gestures";

export const LEFT_HAND_POINTS: ActiveGestures = new ActiveGestures({
  l_wrist: true,
  l_thumb_cmc: true,
  l_thumb_mcp: true,
  l_thumb_ip: true,
  l_thumb_tip: true,
  l_index_mcp: true,
  l_index_pip: true,
  l_index_dip: true,
  l_index_tip: true,
  l_middle_mcp: true,
  l_middle_pip: true,
  l_middle_dip: true,
  l_middle_tip: true,
  l_ring_mcp: true,
  l_ring_pip: true,
  l_ring_dip: true,
  l_ring_tip: true,
  l_pinky_mcp: true,
  l_pinky_pip: true,
  l_pinky_dip: true,
  l_pinky_tip: true

})

export const LEFT_HAND_POSITION: ActiveGestures = new ActiveGestures({
  l_hand_position: true
})

export const LEFT_HAND_VELOCITY: ActiveGestures = new ActiveGestures({
  l_hand_velocity: true
})

export const LEFT_HAND_FULL: ActiveGestures = ActiveGestures.buildWithPreset([LEFT_HAND_POINTS, LEFT_HAND_POSITION, LEFT_HAND_VELOCITY])

export const RIGHT_HAND_POINTS: ActiveGestures = new ActiveGestures({
  r_wrist: true,
  r_thumb_cmc: true,
  r_thumb_mcp: true,
  r_thumb_ip: true,
  r_thumb_tip: true,
  r_index_mcp: true,
  r_index_pip: true,
  r_index_dip: true,
  r_index_tip: true,
  r_middle_mcp: true,
  r_middle_pip: true,
  r_middle_dip: true,
  r_middle_tip: true,
  r_ring_mcp: true,
  r_ring_pip: true,
  r_ring_dip: true,
  r_ring_tip: true,
  r_pinky_mcp: true,
  r_pinky_pip: true,
  r_pinky_dip: true,
  r_pinky_tip: true
})

export const RIGHT_HAND_POSITION: ActiveGestures = new ActiveGestures({
  r_hand_position: true
})

export const RIGHT_HAND_VELOCITY: ActiveGestures = new ActiveGestures({
  r_hand_velocity: true
})

export const RIGHT_HAND_FULL: ActiveGestures = ActiveGestures.buildWithPreset([RIGHT_HAND_POINTS, RIGHT_HAND_POSITION, RIGHT_HAND_VELOCITY])

export const HANDS_POINTS: ActiveGestures = ActiveGestures.buildWithPreset([LEFT_HAND_POINTS, RIGHT_HAND_POINTS])

export const HANDS_POSITION: ActiveGestures = ActiveGestures.buildWithPreset([LEFT_HAND_POSITION, RIGHT_HAND_POSITION])

export const HANDS_VELOCITY: ActiveGestures = ActiveGestures.buildWithPreset([LEFT_HAND_VELOCITY, RIGHT_HAND_VELOCITY])

export const HANDS_FULL: ActiveGestures = ActiveGestures.buildWithPreset([LEFT_HAND_FULL, RIGHT_HAND_FULL])

export const ALL_GESTURES: ActiveGestures = new ActiveGestures()
ALL_GESTURES.activateAllGestures()
