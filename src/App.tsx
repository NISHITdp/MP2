import { Link, Routes, Route } from 'react-router-dom';
import ListPage from './pages/ListPage';
import GalleryPage from './pages/GalleryPage';
import DetailPage from './pages/DetailPage';
import { BrowseProvider } from './context/BrowseContext';
import styles from './App.module.css';

export default function App() {
  return (
    <BrowseProvider>
      <nav className={styles.nav}>
        <Link className={styles.link} to="/">List</Link>
        <Link className={styles.link} to="/gallery">Gallery</Link>
      </nav>

      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/pokemon/:id" element={<DetailPage />} />
      </Routes>
    </BrowseProvider>
  );
}
