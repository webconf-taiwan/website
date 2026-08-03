/* particle-palettes.js — 8 組品牌色盤 + 地色，抽自 demo/components.jsx
 *
 * 每組 palette 有 7 個粒子色（對應物種數上限 7），bgFade 必須與頁面地色
 * 一致，否則 CPU 引擎的殘影洗刷會在頁面上畫出一塊色差矩形。
 *
 * 用法：
 *   const palette = window.PLPalettes.pick();          // 隨機抽一組
 *   const palette = window.PLPalettes.PALETTES.amber;  // 指定
 *   makeEngine(canvas, { palette: palette.particles, bgFade: palette.bgFade, ... });
 */
(function () {
  'use strict';

  const GROUND_FADES = {
    ink:         'rgba(10,10,12,0.18)',
    'ink-blue':  'rgba(11,18,48,0.18)',
    parchment:   'rgba(239,230,210,0.18)',
  };

  const PALETTES = {
    blue: {
      name: 'Cyan / Cobalt',
      bg: 'ink',
      particles: ['#7CC8F2', '#3E8FE0', '#1B3FA8', '#97DFF5', '#1453D6', '#E8E8E8', '#0F1530'],
      accent1: '#7CC8F2', accent2: '#3E8FE0', accent3: '#1B3FA8',
      bgFade: 'rgba(10,10,12,0.18)',
    },
    amber: {
      name: 'Cyan / Amber',
      bg: 'ink',
      particles: ['#7CC8F2', '#E8B547', '#C66A1F', '#F4DCA0', '#FFC97E', '#5A8FBF', '#0F1530'],
      accent1: '#E8B547', accent2: '#C66A1F', accent3: '#7CC8F2',
      bgFade: 'rgba(10,10,12,0.18)',
    },
    parchment: {
      name: 'Parchment / Ink',
      bg: 'parchment',
      particles: ['#7C2A1A', '#1F3A2D', '#3B5070', '#A6712F', '#4A7F7C', '#C09B5C', '#1A1410'],
      accent1: '#7C2A1A', accent2: '#3B5070', accent3: '#1F3A2D',
      bgFade: 'rgba(239,230,210,0.18)',
    },
    mixed: {
      name: 'Specimen Mix',
      bg: 'ink-blue',
      particles: ['#7CC8F2', '#E8B547', '#7C2A1A', '#A6BFB0', '#ECE6D6', '#5A6F87', '#C89A6B'],
      accent1: '#E8B547', accent2: '#7CC8F2', accent3: '#7C2A1A',
      bgFade: 'rgba(11,18,48,0.18)',
    },
    bioluminescence: {
      name: 'Bioluminescence',
      bg: 'ink',
      particles: ['#2BFFE0', '#38B0FF', '#E6FCFF', '#B8FF8E', '#FF9EFA', '#FFCD5C', '#0E1A2A'],
      accent1: '#2BFFE0', accent2: '#FF9EFA', accent3: '#B8FF8E',
      bgFade: 'rgba(8,12,22,0.18)',
    },
    coral: {
      name: 'Coral Reef',
      bg: 'ink-blue',
      particles: ['#FF6B7C', '#F0B27A', '#66D5B5', '#4FA8C5', '#FFE8D6', '#B85C4C', '#1A2B3D'],
      accent1: '#FF6B7C', accent2: '#66D5B5', accent3: '#F0B27A',
      bgFade: 'rgba(15,30,48,0.18)',
    },
    fluoro: {
      name: 'Fluoro Stain',
      bg: 'ink',
      particles: ['#4F7AFA', '#3AE85E', '#FF3A5E', '#3AE8DE', '#F0E03A', '#B83AE8', '#FFFFFF'],
      accent1: '#3AE85E', accent2: '#FF3A5E', accent3: '#4F7AFA',
      bgFade: 'rgba(6,8,12,0.18)',
    },
    slime: {
      name: 'Slime / Lichen',
      bg: 'parchment',
      particles: ['#C9A227', '#6B5B2E', '#8B7A4F', '#4F6B3D', '#C26A22', '#E6D8AE', '#2A2418'],
      accent1: '#C9A227', accent2: '#4F6B3D', accent3: '#C26A22',
      bgFade: 'rgba(239,230,210,0.18)',
    },
  };

  const NAMES = Object.keys(PALETTES);

  function pick() {
    return PALETTES[NAMES[(Math.random() * NAMES.length) | 0]];
  }

  window.PLPalettes = { PALETTES, GROUND_FADES, names: NAMES.slice(), pick };
})();
