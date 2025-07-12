import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import OauthCallback from './pages/OauthCallback'

createRoot(document.getElementById("root")!).render(<App />);
