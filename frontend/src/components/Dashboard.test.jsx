import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Dashboard from './Dashboard';
import * as api from '../api';

vi.mock('../api', () => ({
    getVehicles: vi.fn(),
    searchVehicles: vi.fn(),
    addVehicle: vi.fn(),
    purchaseVehicle: vi.fn(),
    restockVehicle: vi.fn(),
    updateVehicle: vi.fn(),
    deleteVehicle: vi.fn(),
    getUserRole: vi.fn(),
}));

describe('Dashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders loading state initially', () => {
        api.getVehicles.mockResolvedValueOnce([]);
        api.getUserRole.mockReturnValue('USER');
        
        render(<Dashboard onLogout={() => {}} />);
        expect(screen.getByText('Loading...')).toBeDefined();
    });

    it('renders vehicle list correctly', async () => {
        const mockVehicles = [
            { id: 1, make: 'Toyota', model: 'Camry', category: 'Sedan', year: 2024, price: 25000, quantity: 5 },
            { id: 2, make: 'Honda', model: 'Civic', category: 'Sedan', year: 2023, price: 22000, quantity: 0 }
        ];
        api.getVehicles.mockResolvedValueOnce(mockVehicles);
        api.getUserRole.mockReturnValue('USER');

        render(<Dashboard onLogout={() => {}} />);

        // Wait for vehicles to load
        const toyotaHeading = await screen.findByText('2024 Toyota');
        expect(toyotaHeading).toBeDefined();
        expect(screen.getByText('2023 Honda')).toBeDefined();
        
        // Ensure "Add New Model" is NOT visible for regular USER
        expect(screen.queryByText('Add New Model')).toBeNull();
    });

    it('disables purchase button when quantity is 0', async () => {
        const mockVehicles = [
            { id: 1, make: 'Honda', model: 'Civic', category: 'Sedan', year: 2023, price: 22000, quantity: 0 }
        ];
        api.getVehicles.mockResolvedValueOnce(mockVehicles);
        api.getUserRole.mockReturnValue('USER');

        render(<Dashboard onLogout={() => {}} />);

        await screen.findByText('2023 Honda'); // wait for load
        
        const buyButtons = screen.getAllByRole('button', { name: /Buy/i });
        expect(buyButtons[0].hasAttribute('disabled')).toBe(true);
    });

    it('shows admin actions for ADMIN role', async () => {
        api.getVehicles.mockResolvedValueOnce([]);
        api.getUserRole.mockReturnValue('ADMIN');

        render(<Dashboard onLogout={() => {}} />);

        await screen.findByText('No vehicles found.'); // wait for load

        expect(screen.getByText('Add New Model')).toBeDefined();
    });
});
