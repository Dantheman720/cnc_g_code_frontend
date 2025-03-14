import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

export interface RouterBit {
    id: string;
    name: string;
    type: string;
    diameter: number;
    description: string;
}

export const routerBits = writable<RouterBit[]>([]);

export function addRouterBit(bit: Omit<RouterBit, 'id'>): void {
    const newBit: RouterBit = {
        id: uuidv4(),
        ...bit
    };
    routerBits.update(bits => [...bits, newBit]);
}

export function removeRouterBit(id: string): void {
    routerBits.update(bits => bits.filter(bit => bit.id !== id));
}