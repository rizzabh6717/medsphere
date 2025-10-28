export type BodySystem = 'full' | 'skin' | 'muscular' | 'skeletal' | 'organs' | 'vascular' | 'nervous' | 'lymphatic';

export interface BodyPart {
  id: string;
  name: string;
  aliases: string[];
  position: { x: number; y: number }; // percentage-based positioning (for 2D fallback)
  position3d: { x: number; y: number; z: number }; // 3D coordinates
  system: BodySystem[];
  description: string;
}

export const bodyParts: BodyPart[] = [
  {
    id: 'brain',
    name: 'Brain',
    aliases: ['head', 'cerebrum', 'cerebral'],
    position: { x: 50, y: 8 },
    position3d: { x: 0, y: 1.6, z: 0 },
    system: ['nervous', 'organs', 'full'],
    description: 'Central organ of the nervous system'
  },
  {
    id: 'eyes',
    name: 'Eyes',
    aliases: ['eye', 'vision', 'ocular'],
    position: { x: 50, y: 10 },
    position3d: { x: 0, y: 1.5, z: 0.1 },
    system: ['nervous', 'organs', 'full'],
    description: 'Organs of vision'
  },
  {
    id: 'heart',
    name: 'Heart',
    aliases: ['cardiac', 'cardiovascular'],
    position: { x: 50, y: 28 },
    position3d: { x: -0.05, y: 0.9, z: 0.05 },
    system: ['vascular', 'organs', 'full', 'muscular'],
    description: 'Muscular organ that pumps blood'
  },
  {
    id: 'lungs',
    name: 'Lungs',
    aliases: ['lung', 'respiratory', 'pulmonary'],
    position: { x: 50, y: 26 },
    position3d: { x: 0, y: 1.0, z: 0 },
    system: ['organs', 'full'],
    description: 'Organs of respiration'
  },
  {
    id: 'liver',
    name: 'Liver',
    aliases: ['hepatic'],
    position: { x: 55, y: 35 },
    position3d: { x: 0.12, y: 0.5, z: 0.05 },
    system: ['organs', 'full'],
    description: 'Largest internal organ, filters blood'
  },
  {
    id: 'stomach',
    name: 'Stomach',
    aliases: ['gastric', 'abdomen'],
    position: { x: 48, y: 38 },
    position3d: { x: -0.05, y: 0.4, z: 0.08 },
    system: ['organs', 'full'],
    description: 'Digestive organ'
  },
  {
    id: 'intestines',
    name: 'Intestines',
    aliases: ['intestine', 'bowel', 'gut'],
    position: { x: 50, y: 45 },
    position3d: { x: 0, y: 0.2, z: 0.1 },
    system: ['organs', 'full'],
    description: 'Digestive tract organs'
  },
  {
    id: 'kidneys',
    name: 'Kidneys',
    aliases: ['kidney', 'renal'],
    position: { x: 50, y: 42 },
    position3d: { x: 0.08, y: 0.35, z: -0.05 },
    system: ['organs', 'full'],
    description: 'Organs that filter blood and produce urine'
  },
  {
    id: 'shoulders',
    name: 'Shoulders',
    aliases: ['shoulder', 'deltoid'],
    position: { x: 50, y: 22 },
    position3d: { x: 0.25, y: 1.2, z: 0 },
    system: ['muscular', 'skeletal', 'full'],
    description: 'Joint connecting arm to torso'
  },
  {
    id: 'biceps',
    name: 'Biceps',
    aliases: ['bicep', 'arm muscle'],
    position: { x: 62, y: 32 },
    position3d: { x: 0.35, y: 0.8, z: 0.05 },
    system: ['muscular', 'full'],
    description: 'Upper arm muscle'
  },
  {
    id: 'chest',
    name: 'Chest',
    aliases: ['pectorals', 'pecs', 'thorax'],
    position: { x: 50, y: 28 },
    position3d: { x: 0, y: 1.0, z: 0.12 },
    system: ['muscular', 'skeletal', 'full'],
    description: 'Upper front part of torso'
  },
  {
    id: 'abs',
    name: 'Abdominals',
    aliases: ['abs', 'stomach muscles', 'core'],
    position: { x: 50, y: 40 },
    position3d: { x: 0, y: 0.5, z: 0.13 },
    system: ['muscular', 'full'],
    description: 'Abdominal muscles'
  },
  {
    id: 'quadriceps',
    name: 'Quadriceps',
    aliases: ['quads', 'thigh', 'leg muscle'],
    position: { x: 50, y: 60 },
    position3d: { x: 0.1, y: -0.3, z: 0.08 },
    system: ['muscular', 'full'],
    description: 'Front thigh muscles'
  },
  {
    id: 'knees',
    name: 'Knees',
    aliases: ['knee', 'patella'],
    position: { x: 50, y: 68 },
    position3d: { x: 0.08, y: -0.7, z: 0.08 },
    system: ['skeletal', 'full'],
    description: 'Joint between thigh and lower leg'
  },
  {
    id: 'shins',
    name: 'Shins',
    aliases: ['shin', 'tibia', 'lower leg'],
    position: { x: 50, y: 78 },
    position3d: { x: 0.08, y: -1.1, z: 0.05 },
    system: ['skeletal', 'muscular', 'full'],
    description: 'Front of lower leg'
  },
  {
    id: 'ankles',
    name: 'Ankles',
    aliases: ['ankle', 'foot'],
    position: { x: 50, y: 90 },
    position3d: { x: 0.08, y: -1.5, z: 0 },
    system: ['skeletal', 'full'],
    description: 'Joint connecting foot to leg'
  },
  {
    id: 'neck',
    name: 'Neck',
    aliases: ['cervical', 'throat'],
    position: { x: 50, y: 16 },
    position3d: { x: 0, y: 1.35, z: 0 },
    system: ['muscular', 'skeletal', 'full'],
    description: 'Connects head to torso'
  },
  {
    id: 'spine',
    name: 'Spine',
    aliases: ['vertebrae', 'spinal cord', 'backbone'],
    position: { x: 50, y: 35 },
    position3d: { x: 0, y: 0.5, z: -0.08 },
    system: ['skeletal', 'nervous', 'full'],
    description: 'Vertebral column'
  },
  {
    id: 'pelvis',
    name: 'Pelvis',
    aliases: ['hip', 'pelvic'],
    position: { x: 50, y: 50 },
    position3d: { x: 0, y: 0, z: 0 },
    system: ['skeletal', 'full'],
    description: 'Hip bone structure'
  },
  {
    id: 'hands',
    name: 'Hands',
    aliases: ['hand', 'palm', 'fingers'],
    position: { x: 70, y: 50 },
    position3d: { x: 0.45, y: 0.0, z: 0.05 },
    system: ['skeletal', 'muscular', 'full'],
    description: 'End part of the arm'
  },
  {
    id: 'feet',
    name: 'Feet',
    aliases: ['foot', 'toes'],
    position: { x: 50, y: 95 },
    position3d: { x: 0.08, y: -1.7, z: 0 },
    system: ['skeletal', 'muscular', 'full'],
    description: 'End part of the leg'
  }
];
