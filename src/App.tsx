import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header/Header';
import { SynthesisRoute } from './routes/SynthesisRoute';
import { VoicesRoute } from './routes/VoicesRoute';
import { NotFoundRoute } from './routes/NotFoundRoute';
import { ToastHost } from './components/Toast/ToastHost';
import styles from './App.module.css';

export function App() {
  return (
    <HashRouter>
      <div className={styles.app}>
        <Header />
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<SynthesisRoute />} />
            <Route path="/voices" element={<VoicesRoute />} />
            <Route path="/index.html" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundRoute />} />
          </Routes>
        </main>
        <ToastHost />
      </div>
    </HashRouter>
  );
}
