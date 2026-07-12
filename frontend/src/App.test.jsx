import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import App from './App';
import * as api from './api';

// Mock SplashScreen so tests skip straight to Auth
vi.mock('./components/SplashScreen', () => ({
    default: ({ onComplete }) => { onComplete(); return null; },
}));

// Mock the API module
vi.mock('./api', () => ({
    login: vi.fn(),
    register: vi.fn(),
    getVehicles: vi.fn(() => Promise.resolve([])),
    searchVehicles: vi.fn(),
    getUserRole: vi.fn(() => 'USER'),
    getPurchases: vi.fn(() => Promise.resolve([])),
}));

describe('App Login Form', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the login form by default', () => {
        render(<App />);
        expect(screen.getByText('Incubyte Dealership')).toBeDefined();
        expect(screen.getByPlaceholderText('you@example.com')).toBeDefined();
        expect(screen.getByPlaceholderText('••••••••')).toBeDefined();
    });

    it('requires email and password for login', () => {
        render(<App />);
        const emailInput = screen.getByPlaceholderText('you@example.com');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        
        expect(emailInput.hasAttribute('required')).toBe(true);
        expect(passwordInput.hasAttribute('required')).toBe(true);
    });

    it('displays error on failed login', async () => {
        api.login.mockRejectedValueOnce(new Error('Invalid credentials'));
        render(<App />);
        
        fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } });
        const signInButtons = screen.getAllByRole('button', { name: /sign in/i });
        fireEvent.click(signInButtons[signInButtons.length - 1]); // click the submit button (last match)

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeDefined();
        });
    });
});
