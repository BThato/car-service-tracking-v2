export interface StageInfo {
  key: string;
  label: string;
  icon: string;
}

export interface ServiceStageConfig {
  label: string;
  stages: StageInfo[];
}

export const SERVICE_STAGES: Record<string, ServiceStageConfig> = {
  oil_change: {
    label: 'Oil Change',
    stages: [
      { key: 'queued', label: 'Queued', icon: '\u{1F4CB}' },
      { key: 'vehicle_inspection', label: 'Vehicle Inspection', icon: '\u{1F50D}' },
      { key: 'draining_old_oil', label: 'Draining Old Oil', icon: '\u{1F6E2}\uFE0F' },
      { key: 'filter_replacement', label: 'Filter Replacement', icon: '\u{1F527}' },
      { key: 'new_oil_fill', label: 'New Oil Fill', icon: '\u26FD' },
      { key: 'quality_check', label: 'Quality Check', icon: '\u2705' },
      { key: 'completed', label: 'Completed', icon: '\u{1F3C1}' },
    ],
  },
  brake_service: {
    label: 'Brake Service',
    stages: [
      { key: 'queued', label: 'Queued', icon: '\u{1F4CB}' },
      { key: 'wheel_removal', label: 'Wheel Removal', icon: '\u{1F6DE}' },
      { key: 'brake_inspection', label: 'Brake Inspection', icon: '\u{1F50D}' },
      { key: 'pad_rotor_replacement', label: 'Pad/Rotor Replacement', icon: '\u{1F527}' },
      { key: 'brake_fluid_check', label: 'Brake Fluid Check', icon: '\u{1F4A7}' },
      { key: 'reassembly', label: 'Reassembly', icon: '\u{1F529}' },
      { key: 'brake_test', label: 'Brake Test', icon: '\u2705' },
      { key: 'completed', label: 'Completed', icon: '\u{1F3C1}' },
    ],
  },
  tire_rotation: {
    label: 'Tire Rotation',
    stages: [
      { key: 'queued', label: 'Queued', icon: '\u{1F4CB}' },
      { key: 'vehicle_lift', label: 'Vehicle Lift', icon: '\u2B06\uFE0F' },
      { key: 'tire_inspection', label: 'Tire Inspection', icon: '\u{1F50D}' },
      { key: 'rotation', label: 'Rotation & Balancing', icon: '\u{1F6DE}' },
      { key: 'pressure_check', label: 'Pressure Check', icon: '\u{1F4A8}' },
      { key: 'completed', label: 'Completed', icon: '\u{1F3C1}' },
    ],
  },
  engine_repair: {
    label: 'Engine Repair',
    stages: [
      { key: 'queued', label: 'Queued', icon: '\u{1F4CB}' },
      { key: 'diagnostics', label: 'Diagnostics', icon: '\u{1F5A5}\uFE0F' },
      { key: 'disassembly', label: 'Disassembly', icon: '\u{1F527}' },
      { key: 'parts_ordering', label: 'Parts Ordering', icon: '\u{1F4E6}' },
      { key: 'repair', label: 'Repair', icon: '\u2699\uFE0F' },
      { key: 'reassembly', label: 'Reassembly', icon: '\u{1F529}' },
      { key: 'testing', label: 'Engine Testing', icon: '\u{1F3CE}\uFE0F' },
      { key: 'quality_check', label: 'Quality Check', icon: '\u2705' },
      { key: 'completed', label: 'Completed', icon: '\u{1F3C1}' },
    ],
  },
  transmission: {
    label: 'Transmission Service',
    stages: [
      { key: 'queued', label: 'Queued', icon: '\u{1F4CB}' },
      { key: 'diagnostics', label: 'Diagnostics', icon: '\u{1F5A5}\uFE0F' },
      { key: 'fluid_drain', label: 'Fluid Drain', icon: '\u{1F6E2}\uFE0F' },
      { key: 'disassembly', label: 'Disassembly', icon: '\u{1F527}' },
      { key: 'repair_replacement', label: 'Repair/Replacement', icon: '\u2699\uFE0F' },
      { key: 'reassembly', label: 'Reassembly', icon: '\u{1F529}' },
      { key: 'fluid_refill', label: 'Fluid Refill', icon: '\u26FD' },
      { key: 'road_test', label: 'Road Test', icon: '\u{1F697}' },
      { key: 'completed', label: 'Completed', icon: '\u{1F3C1}' },
    ],
  },
  electrical: {
    label: 'Electrical System',
    stages: [
      { key: 'queued', label: 'Queued', icon: '\u{1F4CB}' },
      { key: 'diagnostics', label: 'Diagnostics & Scanning', icon: '\u{1F5A5}\uFE0F' },
      { key: 'wiring_inspection', label: 'Wiring Inspection', icon: '\u{1F50C}' },
      { key: 'component_repair', label: 'Component Repair', icon: '\u26A1' },
      { key: 'testing', label: 'System Testing', icon: '\u{1F50B}' },
      { key: 'completed', label: 'Completed', icon: '\u{1F3C1}' },
    ],
  },
  body_work: {
    label: 'Body Work',
    stages: [
      { key: 'queued', label: 'Queued', icon: '\u{1F4CB}' },
      { key: 'washing_degreasing', label: 'Washing & Degreasing', icon: '\u{1F9FC}' },
      { key: 'disassembly_masking', label: 'Disassembly & Masking', icon: '\u{1F527}' },
      { key: 'sanding_stripping', label: 'Sanding & Stripping', icon: '\u{1FA9A}' },
      { key: 'body_repair_filling', label: 'Body Repair & Filling', icon: '\u{1F6E0}\uFE0F' },
      { key: 'priming_sealing', label: 'Priming & Sealing', icon: '\u{1F58C}\uFE0F' },
      { key: 'painting', label: 'Painting', icon: '\u{1F3A8}' },
      { key: 'clear_coat_polish', label: 'Clear Coat & Polish', icon: '\u2728' },
      { key: 'reassembly', label: 'Reassembly', icon: '\u{1F529}' },
      { key: 'quality_check', label: 'Quality Check', icon: '\u2705' },
      { key: 'completed', label: 'Completed', icon: '\u{1F3C1}' },
    ],
  },
  full_service: {
    label: 'Full Service',
    stages: [
      { key: 'queued', label: 'Queued', icon: '\u{1F4CB}' },
      { key: 'vehicle_inspection', label: 'Vehicle Inspection', icon: '\u{1F50D}' },
      { key: 'oil_filter_change', label: 'Oil & Filter Change', icon: '\u{1F6E2}\uFE0F' },
      { key: 'fluid_topup', label: 'Fluid Top-Up', icon: '\u{1F4A7}' },
      { key: 'brake_check', label: 'Brake Check', icon: '\u{1F6DE}' },
      { key: 'tire_check', label: 'Tire Check & Pressure', icon: '\u{1F4A8}' },
      { key: 'electrical_check', label: 'Electrical & Battery', icon: '\u{1F50B}' },
      { key: 'road_test', label: 'Road Test', icon: '\u{1F697}' },
      { key: 'quality_check', label: 'Quality Check', icon: '\u2705' },
      { key: 'completed', label: 'Completed', icon: '\u{1F3C1}' },
    ],
  },
  inspection: {
    label: 'Inspection',
    stages: [
      { key: 'queued', label: 'Queued', icon: '\u{1F4CB}' },
      { key: 'exterior_inspection', label: 'Exterior Inspection', icon: '\u{1F50D}' },
      { key: 'interior_inspection', label: 'Interior Inspection', icon: '\u{1FA91}' },
      { key: 'mechanical_inspection', label: 'Mechanical Inspection', icon: '\u2699\uFE0F' },
      { key: 'report_generation', label: 'Report Generation', icon: '\u{1F4C4}' },
      { key: 'completed', label: 'Completed', icon: '\u{1F3C1}' },
    ],
  },
  other: {
    label: 'Other Service',
    stages: [
      { key: 'queued', label: 'Queued', icon: '\u{1F4CB}' },
      { key: 'assessment', label: 'Assessment', icon: '\u{1F50D}' },
      { key: 'in_progress', label: 'In Progress', icon: '\u2699\uFE0F' },
      { key: 'quality_check', label: 'Quality Check', icon: '\u2705' },
      { key: 'completed', label: 'Completed', icon: '\u{1F3C1}' },
    ],
  },
};

export function getStagesForServiceType(serviceType: string): StageInfo[] {
  return (SERVICE_STAGES[serviceType] || SERVICE_STAGES.other).stages;
}

export function getNextStage(serviceType: string, currentStage: string): string | null {
  const stages = getStagesForServiceType(serviceType);
  const currentIndex = stages.findIndex(s => s.key === currentStage);
  if (currentIndex === -1 || currentIndex >= stages.length - 1) return null;
  return stages[currentIndex + 1].key;
}
