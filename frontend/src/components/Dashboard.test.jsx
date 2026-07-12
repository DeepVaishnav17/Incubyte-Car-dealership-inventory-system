import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
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
    getPurchases: vi.fn(() => Promise.resolve([])),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: new Proxy({}, {
        get: (_, tag) => {
            const { forwardRef, createElement } = require('react');
            return forwardRef(({ children, whileHover, whileTap, initial, animate, exit, transition, onHoverStart, onHoverEnd, ...rest }, ref) =>
                createElement(tag || 'div', { ...rest, ref }, children)
            );
        }
    }),
    AnimatePresence: ({ children }) => children,
    useAnimation: () => ({ start: vi.fn() }),
}));

describe('Dashboard Component', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { cleanup(); });

    it('renders page header for USER', () => {
        api.getVehicles.mockResolvedValueOnce([]);
        api.getUserRole.mockReturnValue('USER');
        render(<Dashboard onLogout={() => {}} />);
        expect(screen.getByText('Discover Performance')).toBeDefined();
    });

    it('renders vehicle list correctly for USER', async () => {
        const mockVehicles = [
            { id: 1, make: 'Toyota', model: 'Camry', category: 'Sedan', year: 2024, price: 25000, quantity: 5 },
            { id: 2, make: 'Honda', model: 'Civic', category: 'Sedan', year: 2023, price: 22000, quantity: 0 },
        ];
        api.getVehicles.mockResolvedValueOnce(mockVehicles);
        api.getUserRole.mockReturnValue('USER');
        render(<Dashboard onLogout={() => {}} />);

        // Switch to inventory tab
        fireEvent.click(screen.getByRole('button', { name: /Acquire Vehicles/i }));

        const toyota = await screen.findByText('Toyota Camry');
        expect(toyota).toBeDefined();
        expect(screen.getByText('Honda Civic')).toBeDefined();

        // No admin "Add Vehicle" button for regular USER
        expect(screen.queryByText('Add Vehicle')).toBeNull();
    });

    it('disables purchase button when quantity is 0', async () => {
        const mockVehicles = [
            { id: 1, make: 'Honda', model: 'Civic', category: 'Sedan', year: 2023, price: 22000, quantity: 0 },
        ];
        api.getVehicles.mockResolvedValueOnce(mockVehicles);
        api.getUserRole.mockReturnValue('USER');
        render(<Dashboard onLogout={() => {}} />);

        // Switch to inventory tab
        fireEvent.click(screen.getByRole('button', { name: /Acquire Vehicles/i }));

        await screen.findByText('Honda Civic');
        const unavailableButtons = screen.getAllByRole('button', { name: /Unavailable/i });
        expect(unavailableButtons[0].hasAttribute('disabled')).toBe(true);
    });

    it('shows Add Vehicle button for ADMIN role', async () => {
        api.getVehicles.mockResolvedValueOnce([]);
        api.getUserRole.mockReturnValue('ADMIN');
        render(<Dashboard onLogout={() => {}} />);

        await screen.findByText('Dealership showroom is empty');
        expect(screen.getByText('Add Vehicle')).toBeDefined();
    });
});
