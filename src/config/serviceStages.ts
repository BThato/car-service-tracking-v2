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
      { key: 'queued', label: 'Queued', icon: '📋' },
      { key: 'vehicle_inspection', label: 'Vehicle Inspection', icon: '🔍' },
      { key: 'draining_old_oil', label: 'Draining Old Oil', icon: '🛢️' },
      { key: 'filter_replacement', label: 'Filter Replacement', icon: '🔧' },
      { key: 'new_oil_fill', label: 'New Oil Fill', icon: '⛽' },
      { key: 'quality_check', label: 'Quality Check', icon: '✅' },
      { key: 'completed', label: 'Completed', icon: '🏁' },
    ],
  },
  brake_service: {
    label: 'Brake Service',
    stages: [
      { key: 'queued', label: 'Queued', icon: '📋' },
      { key: 'wheel_removal', label: 'Wheel Removal', icon: '🛞' },
      { key: 'brake_inspection', label: 'Brake Inspection', icon: '🔍' },
      { key: 'pad_rotor_replacement', label: 'Pad/Rotor Replacement', icon: '🔧' },
      { key: 'brake_fluid_check', label: 'Brake Fluid Check', icon: '💧' },
      { key: 'reassembly', label: 'Reassembly', icon: '🔩' },
      { key: 'brake_test', label: 'Brake Test', icon: '✅' },
      { key: 'completed', label: 'Completed', icon: '🏁' },
    ],
  },
  tire_rotation: {
    label: 'Tire Rotation',
    stages: [
      { key: 'queued', label: 'Queued', icon: '📋' },
      { key: 'vehicle_lift', label: 'Vehicle Lift', icon: '⬆️' },
      { key: 'tire_inspection', label: 'Tire Inspection', icon: '🔍' },
      { key: 'rotation', label: 'Rotation & Balancing', icon: '🛞' },
      { key: 'pressure_check', label: 'Pressure Check', icon: '💨' },
      { key: 'completed', label: 'Completed', icon: '🏁' },
    ],
  },
  engine_repair: {
    label: 'Engine Repair',
    stages: [
      { key: 'queued', label: 'Queued', icon: '📋' },
      { key: 'diagnostics', label: 'Diagnostics', icon: '🖥️' },
      { key: 'disassembly', label: 'Disassembly', icon: '🔧' },
      { key: 'parts_ordering', label: 'Parts Ordering', icon: '📦' },
      { key: 'repair', label: 'Repair', icon: '⚙️' },
      { key: 'reassembly', label: 'Reassembly', icon: '🔩' },
      { key: 'testing', label: 'Engine Testing', icon: '🏎️' },
      { key: 'quality_check', label: 'Quality Check', icon: '✅' },
      { key: 'completed', label: 'Completed', icon: '🏁' },
    ],
  },
  transmission: {
    label: 'Transmission Service',
    stages: [
      { key: 'queued', label: 'Queued', icon: '📋' },
      { key: 'diagnostics', label: 'Diagnostics', icon: '🖥️' },
      { key: 'fluid_drain', label: 'Fluid Drain', icon: '🛢️' },
      { key: 'disassembly', label: 'Disassembly', icon: '🔧' },
      { key: 'repair_replacement', label: 'Repair/Replacement', icon: '⚙️' },
      { key: 'reassembly', label: 'Reassembly', icon: '🔩' },
      { key: 'fluid_refill', label: 'Fluid Refill', icon: '⛽' },
      { key: 'road_test', label: 'Road Test', icon: '🚗' },
      { key: 'completed', label: 'Completed', icon: '🏁' },
    ],
  },
  electrical: {
    label: 'Electrical System',
    stages: [
      { key: 'queued', label: 'Queued', icon: '📋' },
      { key: 'diagnostics', label: 'Diagnostics & Scanning', icon: '🖥️' },
      { key: 'wiring_inspection', label: 'Wiring Inspection', icon: '🔌' },
      { key: 'component_repair', label: 'Component Repair', icon: '⚡' },
      { key: 'testing', label: 'System Testing', icon: '🔋' },
      { key: 'completed', label: 'Completed', icon: '🏁' },
    ],
  },
  body_work: {
    label: 'Body Work',
    stages: [
      { key: 'queued', label: 'Queued', icon: '📋' },
      { key: 'washing_degreasing', label: 'Washing & Degreasing', icon: '🧼' },
      { key: 'disassembly_masking', label: 'Disassembly & Masking', icon: '🔧' },
      { key: 'sanding_stripping', label: 'Sanding & Stripping', icon: '🪚' },
      { key: 'body_repair_filling', label: 'Body Repair & Filling', icon: '🛠️' },
      { key: 'priming_sealing', label: 'Priming & Sealing', icon: '🖌️' },
      { key: 'painting', label: 'Painting', icon: '🎨' },
      { key: 'clear_coat_polish', label: 'Clear Coat & Polish', icon: '✨' },
      { key: 'reassembly', label: 'Reassembly', icon: '🔩' },
      { key: 'quality_check', label: 'Quality Check', icon: '✅' },
      { key: 'completed', label: 'Completed', icon: '🏁' },
    ],
  },
  full_service: {
    label: 'Full Service',
    stages: [
      { key: 'queued', label: 'Queued', icon: '📋' },
      { key: 'vehicle_inspection', label: 'Vehicle Inspection', icon: '🔍' },
      { key: 'oil_filter_change', label: 'Oil & Filter Change', icon: '🛢️' },
      { key: 'fluid_topup', label: 'Fluid Top-Up', icon: '💧' },
      { key: 'brake_check', label: 'Brake Check', icon: '🛞' },
      { key: 'tire_check', label: 'Tire Check & Pressure', icon: '💨' },
      { key: 'electrical_check', label: 'Electrical & Battery', icon: '🔋' },
      { key: 'road_test', label: 'Road Test', icon: '🚗' },
      { key: 'quality_check', label: 'Quality Check', icon: '✅' },
      { key: 'completed', label: 'Completed', icon: '🏁' },
    ],
  },
  inspection: {
    label: 'Inspection',
    stages: [
      { key: 'queued', label: 'Queued', icon: '📋' },
      { key: 'exterior_inspection', label: 'Exterior Inspection', icon: '🔍' },
      { key: 'interior_inspection', label: 'Interior Inspection', icon: '🪑' },
      { key: 'mechanical_inspection', label: 'Mechanical Inspection', icon: '⚙️' },
      { key: 'report_generation', label: 'Report Generation', icon: '📄' },
      { key: 'completed', label: 'Completed', icon: '🏁' },
    ],
  },
  other: {
    label: 'Other Service',
    stages: [
      { key: 'queued', label: 'Queued', icon: '📋' },
      { key: 'assessment', label: 'Assessment', icon: '🔍' },
      { key: 'in_progress', label: 'In Progress', icon: '⚙️' },
      { key: 'quality_check', label: 'Quality Check', icon: '✅' },
      { key: 'completed', label: 'Completed', icon: '🏁' },
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
