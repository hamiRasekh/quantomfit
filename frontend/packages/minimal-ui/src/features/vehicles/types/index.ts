export type VehicleType = 'MIXER_TRUCK' | 'PUMP_TRUCK' | 'MATERIAL_TRUCK' | 'SERVICE';
export type VehicleStatus =
  | 'READY'
  | 'IN_MISSION'
  | 'LOADING'
  | 'IN_TRANSIT'
  | 'UNLOADING'
  | 'RETURNING'
  | 'IN_SERVICE'
  | 'BROKEN'
  | 'INACTIVE';
export type VehicleTripStatus =
  | 'SCHEDULED'
  | 'LOADING'
  | 'DEPARTED'
  | 'IN_TRANSIT'
  | 'ARRIVED'
  | 'UNLOADING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DELAYED';
export type VehicleGpsStatus = 'ACTIVE' | 'INACTIVE' | 'NOT_INSTALLED';

export type PersonnelRef = {
  id: string;
  firstName: string;
  lastName: string;
  mobile?: string;
};

export type Vehicle = {
  id: string;
  vehicleCode: string;
  plateNumber: string;
  type: VehicleType;
  brand?: string;
  model?: string;
  manufactureYear?: number;
  color?: string;
  mixerCapacityM3: string | number;
  defaultPlantId?: string;
  currentDriverId?: string;
  currentDriver?: PersonnelRef;
  status: VehicleStatus;
  currentOdometerKm: number;
  currentEngineHours: number;
  fuelType?: string;
  gpsStatus: VehicleGpsStatus;
  lastKnownLatitude?: string;
  lastKnownLongitude?: string;
  lastLocationUpdatedAt?: string;
  insuranceExpiryDate?: string;
  inspectionExpiryDate?: string;
  nextServiceDate?: string;
  lastServiceDate?: string;
  isActive: boolean;
  technicalNotes?: string;
  createdAt?: string;
};

export type VehicleTrip = {
  id: string;
  missionNumber: string;
  vehicleId: string;
  vehicle?: Vehicle;
  driverId?: string;
  driver?: PersonnelRef;
  orderId?: string;
  customerId?: string;
  customer?: { id: string; name?: string; title?: string };
  projectTitle?: string;
  plantId?: string;
  destinationTitle: string;
  destinationAddress?: string;
  concreteGrade?: string;
  volumeM3: string | number;
  plannedLoadingTime: string;
  plannedReturnTime?: string;
  status: VehicleTripStatus;
  delayMinutes: number;
  notes?: string;
};

export type VehicleServiceRecord = {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  serviceType: string;
  serviceDate: string;
  odometerKm?: number;
  cost: number;
  workshopName?: string;
  nextServiceDate?: string;
  notes?: string;
};

export type VehicleFuelRecord = {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  date: string;
  liters: string | number;
  totalCost: number;
  odometerKm?: number;
  stationName?: string;
};

export type VehicleAlert = {
  id: string;
  vehicleId?: string;
  vehicle?: Vehicle;
  type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
};

export type FleetDashboard = {
  totalVehicles: number;
  activeVehicles: number;
  inService: number;
  broken: number;
  inMission: number;
  ready: number;
  serviceDueSoon: number;
  insuranceExpirySoon: number;
  inspectionExpirySoon: number;
  todayMissions: number;
  todayDelays: number;
  avgDailyOdometerKm: number;
  statusChart: Array<{ status: VehicleStatus; count: number }>;
  weeklyMissions: Array<{ day: string; count: number }>;
  followUpVehicles: Array<{
    id: string;
    vehicleCode: string;
    plateNumber: string;
    status: VehicleStatus;
    nextServiceDate?: string;
  }>;
  alerts: VehicleAlert[];
};

export type CreateVehicleDto = Partial<Vehicle> & {
  vehicleCode: string;
  plateNumber: string;
  mixerCapacityM3: number;
};

export type VehicleListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: VehicleStatus;
  type?: VehicleType;
  plantId?: string;
  driverId?: string;
};

export type VehicleDetailPayload = {
  vehicle: Vehicle;
  trips: VehicleTrip[];
  services: VehicleServiceRecord[];
  fuelRecords: VehicleFuelRecord[];
  alerts: VehicleAlert[];
};
