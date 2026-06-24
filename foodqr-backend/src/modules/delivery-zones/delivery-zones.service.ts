import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryZone, ZoneVertex } from './entities/delivery-zone.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

@Injectable()
export class DeliveryZonesService {
  constructor(
    @InjectRepository(DeliveryZone) private zoneRepo: Repository<DeliveryZone>,
    connections: TenantConnectionService,
  ) {
    this.zoneRepo = tenantAwareRepo(connections, DeliveryZone, zoneRepo);
  }

  findAll(branchId?: string) {
    const where: any = {};
    if (branchId) where.branchId = branchId;
    return this.zoneRepo.find({ where, relations: ['branch'], order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const zone = await this.zoneRepo.findOne({ where: { id }, relations: ['branch'] });
    if (!zone) throw new NotFoundException('Delivery zone not found');
    return zone;
  }

  create(data: Partial<DeliveryZone>) {
    return this.zoneRepo.save(this.zoneRepo.create(data));
  }

  async update(id: string, data: Partial<DeliveryZone>) {
    await this.findOne(id);
    await this.zoneRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.zoneRepo.delete(id);
    return { message: 'Delivery zone deleted' };
  }

  /**
   * Ray-casting algorithm: determine if a point (lat, lng) is inside a polygon.
   */
  isPointInPolygon(point: ZoneVertex, polygon: ZoneVertex[]): boolean {
    if (polygon.length < 3) return false;
    let inside = false;
    const { lat: px, lng: py } = point;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng;
      const xj = polygon[j].lat, yj = polygon[j].lng;
      if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }

  /**
   * Returns the matching active zone for a given lat/lng within a branch's zones.
   */
  async findZoneForPoint(lat: number, lng: number, branchId?: string): Promise<DeliveryZone | null> {
    const zones = await this.findAll(branchId);
    const active = zones.filter((z) => z.isActive && z.polygon?.length >= 3);
    for (const zone of active) {
      if (this.isPointInPolygon({ lat, lng }, zone.polygon)) return zone;
    }
    return null;
  }

  /**
   * Haversine distance between two lat/lng points in km.
   */
  haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /**
   * Calculate delivery charge for a given destination point.
   * Returns null if the address is outside all active zones.
   */
  async calculateCharge(
    destLat: number, destLng: number,
    branchLat: number, branchLng: number,
    branchId?: string,
  ): Promise<{ zone: DeliveryZone; charge: number; distanceKm: number } | null> {
    const zone = await this.findZoneForPoint(destLat, destLng, branchId);
    if (!zone) return null;
    const distanceKm = this.haversineKm(branchLat, branchLng, destLat, destLng);
    const charge = Number(zone.baseCharge) + distanceKm * Number(zone.perKmCharge);
    return { zone, charge: Math.round(charge * 100) / 100, distanceKm };
  }
}
