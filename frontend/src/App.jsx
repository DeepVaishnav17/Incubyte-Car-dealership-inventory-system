import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import SplashScreen from './components/SplashScreen';
import ToastContainer from './components/Toast';
import NotFound from './components/NotFound';
import Footer from './components/Footer';
import './index.css';

function App() {
    const [splashDone, setSplashDone] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [page, setPage] = useState('home'); // 'home' | '404'

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) setIsAuthenticated(true);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    // Show splash every time
    if (!splashDone) {
        return (
            <>
                <ToastContainer />
                <SplashScreen onComplete={() => setSplashDone(true)} />
            </>
        );
    }

    if (page === '404') {
        return (
            <>
                <ToastContainer />
                <NotFound onGoHome={() => setPage('home')} />
            </>
        );
    }

    return (
        <>
            <ToastContainer />
            <div style={{
                minHeight: '100vh',
                display: 'flex', flexDirection: 'column',
                animation: 'fadeIn 0.5s ease',
            }}>
                <div style={{ flex: 1 }}>
                    {isAuthenticated ? (
                        <Dashboard onLogout={handleLogout} />
                    ) : (
                        <Auth onLogin={() => setIsAuthenticated(true)} />
                    )}
                </div>
                {isAuthenticated && <Footer />}
            </div>
        </>
    );
}

export default App;
