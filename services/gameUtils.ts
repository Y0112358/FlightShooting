import { Entity, Vector2D } from '../types';

export const checkAABB = (a: Entity, b: Entity): boolean => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

export const checkCircleCollision = (a: Vector2D, r1: number, b: Vector2D, r2: number): boolean => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy) < r1 + r2;
};

export const getDistance = (a: Vector2D, b: Vector2D): number => {
  return Math.hypot(a.x - b.x, a.y - b.y);
};

export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

export const generateId = () => Math.random().toString(36).substr(2, 9);