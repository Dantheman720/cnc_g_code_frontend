// src/types.ts

// @ts-ignore
import type { UUID } from 'uuid';

export interface Tool {
    id: UUID;
    name: string;
    type: 'flat end mill' | 'face mill' | 'chamfer mill' | 'dovetail mill';
    diameter: number;
    description: string;
    tool_number: number;
    tool_unit: 'inches' | 'millimeters';
    tool_assembly_gauge_length: number;
    tool_body_length: number;
    tool_feed_cutting: number;
    tool_feed_entry: number;
    tool_feed_exit: number;
    tool_feed_per_revolution: number;
    tool_feed_per_tooth: number;
    tool_feed_plunge: number;
    tool_feed_ramp: number;
    tool_feed_transition: number;
    tool_flute_length: number;
    tool_number_of_flutes: number;
    tool_overall_length: number;
    tool_product_id: string | null;
    tool_product_link: string | null;
    tool_ramp_spindle_speed: number;
    tool_shaft_diameter: number;
    tool_shoulder_diameter: number;
    tool_shoulder_length: number;
    tool_spindle_speed: number;
    tool_surface_speed: number;
    tool_vendor: string | null;
    coordinates?: BitCoordinate[]; // Added coordinates relation
}

export interface BitCoordinate {
    bit_id: UUID;
    name: string;
    z: number;
}