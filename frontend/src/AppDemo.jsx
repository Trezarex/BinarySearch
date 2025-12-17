import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import LobbyDemo from '@/pages/LobbyDemo';

function AppDemo() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<LobbyDemo />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default AppDemo;
