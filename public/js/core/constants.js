/* Shared constants
   Motion and viewport flags used across modules. */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_MOBILE = window.matchMedia('(max-width: 760px)').matches;
