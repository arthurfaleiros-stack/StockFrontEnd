import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

function App() {
  const [count, setCount] = useState(0)
// Rotas de Controle
import ProtectedRoute from './components/routing/ProtectedRoute';
import GuestRoute from './components/routing/GuestRoute';
import AppLayout from './components/layout/AppLayout';

// Páginas de Autenticação
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordWizard from './pages/auth/ForgotPasswordWizard';

// Páginas Principais
import DashboardPage from './pages/dashboard/DashboardPage';
import ProdutosPage from './pages/produtos/ProdutosPage';
import MovimentacoesPage from './pages/movimentacoes/MovimentacoesPage';
import CategoriasPage from './pages/categorias/CategoriasPage';
import FornecedoresPage from './pages/fornecedores/FornecedoresPage';
import HistoricoPage from './pages/historico/HistoricoPage';
import UsuariosPage from './pages/usuarios/UsuariosPage';
import NotFoundPage from './pages/NotFoundPage';

export function App() {
  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ============================================================ */}
          {/* ROTAS PÚBLICAS / GUEST (Apenas usuários NÃO autenticados)   */}
          {/* ============================================================ */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/cadastro"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route
            path="/esqueci-senha"
            element={
              <GuestRoute>
                <ForgotPasswordWizard />
              </GuestRoute>
            }
          />

      <div className="ticks"></div>
          {/* ============================================================ */}
          {/* ROTAS PROTEGIDAS (Exigem JWT Válido e Perfil Adequado)       */}
          {/* ============================================================ */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Raiz redireciona para o Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>
            {/* Acessível a ADMIN, GERENTE e OPERADOR */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/produtos" element={<ProdutosPage />} />
            <Route path="/movimentacoes" element={<MovimentacoesPage />} />

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
            {/* Acessível a ADMIN e GERENTE */}
            <Route
              path="/categorias"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'GERENTE']}>
                  <CategoriasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fornecedores"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'GERENTE']}>
                  <FornecedoresPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/historico"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'GERENTE']}>
                  <HistoricoPage />
                </ProtectedRoute>
              }
            />

            {/* Restrito a ADMIN */}
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Rota 404 para caminhos desconhecidos */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
export default App;
