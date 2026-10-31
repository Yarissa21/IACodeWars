import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { Layout } from './componentes/Layout'
import { ErrorApi } from './lib/http'
import { PaginaDetalle } from './paginas/PaginaDetalle'
import { PaginaListado } from './paginas/PaginaListado'
import { PaginaNoEncontrada } from './paginas/PaginaNoEncontrada'
import { PaginaNuevoExpediente } from './paginas/PaginaNuevoExpediente'

const clienteQuery = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: false,
      retry: (intentos, error) =>
        intentos < 1 && !(error instanceof ErrorApi && error.estado !== null && error.estado < 500),
    },
    mutations: { retry: false },
  },
})

const enrutador = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/expedientes" replace /> },
      { path: 'expedientes', element: <PaginaListado /> },
      { path: 'expedientes/nuevo', element: <PaginaNuevoExpediente /> },
      { path: 'expedientes/:codigo', element: <PaginaDetalle /> },
      { path: '*', element: <PaginaNoEncontrada /> },
    ],
  },
])

function App() {
  return (
    <QueryClientProvider client={clienteQuery}>
      <RouterProvider router={enrutador} />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </QueryClientProvider>
  )
}

export default App
