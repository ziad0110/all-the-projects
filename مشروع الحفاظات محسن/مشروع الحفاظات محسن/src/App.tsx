import { Toaster } from '@/components/ui/sonner';
import AppRoutes from './AppRoutes';
import './App.css';

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <AppRoutes />
    </>
  );
}

export default App;
